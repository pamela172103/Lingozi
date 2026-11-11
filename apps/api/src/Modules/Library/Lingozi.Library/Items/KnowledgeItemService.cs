using Lingozi.Library.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Library.Items;

/// <summary>FR-LIB-ITEM-001 (create), and the minimum reads the web app needs to show what was saved (list: FR-LIB-ITEM-003, detail: FR-LIB-ITEM-004).</summary>
public sealed class KnowledgeItemService(LibraryDbContext db, TimeProvider clock)
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 50;

    /// <summary>US-LIB-02 AC-05: the dialog lists at most this many similar items.</summary>
    public const int MaxSimilarItems = 5;

    /// <summary>Creates a word or grammar item with its examples in one transaction (BR-LIB-001, 005, 008).</summary>
    public async Task<CreateItemResult> CreateAsync(Guid userId, KnowledgeItemInput? input, CancellationToken cancellationToken)
    {
        var (valid, errors) = ItemValidator.Validate(input);
        if (valid is null)
        {
            return new CreateItemResult(CreateItemOutcome.Invalid, Errors: errors);
        }

        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async ct =>
        {
            db.ChangeTracker.Clear();
            await using var transaction = await db.Database.BeginTransactionAsync(ct);
            await UserLock.AcquireAsync(db, userId, ct);

            var existing = await db.Items.AsNoTracking().Include(i => i.Examples)
                .FirstOrDefaultAsync(i => i.UserId == userId && i.ClientRequestId == valid.ClientRequestId, ct);
            if (existing is not null)
            {
                await transaction.CommitAsync(ct);
                return new CreateItemResult(CreateItemOutcome.Existing, ItemDetail.From(existing));
            }

            if (await db.Items.CountAsync(i => i.UserId == userId, ct) >= ItemRules.MaxItemsPerUser)
            {
                await transaction.CommitAsync(ct);
                return new CreateItemResult(CreateItemOutcome.LimitReached);
            }

            var now = clock.GetUtcNow().UtcDateTime;
            var item = new KnowledgeItem
            {
                Id = Guid.CreateVersion7(),
                UserId = userId,
                Kind = valid.Kind,
                Term = valid.Term,
                NormalizedTerm = ItemRules.Normalize(valid.Term),
                Meaning = valid.Meaning,
                Formula = valid.Formula,
                PartOfSpeech = valid.PartOfSpeech,
                Ipa = valid.Ipa,
                // No dictionary lookup exists yet (US-LIB-08), so a stored IPA was always typed by the user.
                IpaSource = valid.Ipa is null ? null : IpaSource.User,
                Note = valid.Note,
                ClientRequestId = valid.ClientRequestId,
                CreatedAt = now,
                UpdatedAt = now,
            };
            item.SearchText = ItemRules.ToSearchText(
                [item.Term, item.Formula, item.Meaning, item.PartOfSpeech, item.Note, .. valid.Examples.SelectMany(e => new[] { e.Text, e.Translation })]);
            for (var i = 0; i < valid.Examples.Count; i++)
            {
                item.Examples.Add(new ItemExample
                {
                    Id = Guid.CreateVersion7(),
                    UserId = userId,
                    Text = valid.Examples[i].Text!,
                    Translation = valid.Examples[i].Translation,
                    SortOrder = (short)i,
                });
            }

            db.Items.Add(item);
            await db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            return new CreateItemResult(CreateItemOutcome.Created, ItemDetail.From(item));
        }, cancellationToken);
    }

    /// <summary>One page of the user's items of one kind, newest first (BR-LIB-011). <paramref name="page"/> ≥ 1 and <paramref name="pageSize"/> 1–50 are checked by the caller via <see cref="TryNormalizePaging"/>.</summary>
    public async Task<ItemPage> ListAsync(Guid userId, ItemKind kind, int page, int pageSize, CancellationToken cancellationToken)
    {
        var query = db.Items.AsNoTracking().Where(i => i.UserId == userId && i.Kind == kind);
        var total = await query.CountAsync(cancellationToken);
        var rows = await query
            .OrderByDescending(i => i.CreatedAt).ThenByDescending(i => i.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(i => new { i.Id, i.Kind, i.Term, i.Meaning, i.Formula, i.PartOfSpeech, i.Ipa, i.CreatedAt })
            .ToListAsync(cancellationToken);
        return new ItemPage(
            [.. rows.Select(r => new ItemSummary(r.Id, ItemRules.KindName(r.Kind), r.Term, r.Meaning, r.Formula, r.PartOfSpeech, r.Ipa, DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc)))],
            page,
            pageSize,
            total);
    }

    /// <summary>
    /// FR-LIB-ITEM-002 (US-LIB-02): the user's own items of one kind whose normalized term equals the given term (BR-LIB-003).
    /// Advisory only: nothing is blocked or merged here. Other users' items are never considered (BR-LIB-014).
    /// </summary>
    public async Task<SimilarItemsResponse> FindSimilarAsync(Guid userId, ItemKind kind, string? term, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return new SimilarItemsResponse([], 0);
        }

        var normalized = ItemRules.Normalize(term);
        var hash = ItemRules.HashNormalized(normalized);
        var query = db.Items.AsNoTracking()
            .Where(i => i.UserId == userId && i.Kind == kind && i.NormalizedTermHash == hash && i.NormalizedTerm == normalized);
        var total = await query.CountAsync(cancellationToken);
        var rows = await query
            .OrderByDescending(i => i.CreatedAt).ThenByDescending(i => i.Id)
            .Take(MaxSimilarItems)
            .Select(i => new { i.Id, i.Kind, i.Term, i.Meaning, i.Formula, i.PartOfSpeech, i.Ipa, i.CreatedAt })
            .ToListAsync(cancellationToken);
        return new SimilarItemsResponse(
            [.. rows.Select(r => new ItemSummary(r.Id, ItemRules.KindName(r.Kind), r.Term, r.Meaning, r.Formula, r.PartOfSpeech, r.Ipa, DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc)))],
            total);
    }

    /// <summary>BR-LIB-011: <c>page</c> ≥ 1 (default 1), <c>pageSize</c> 1–50 (default 20; larger is capped at 50).</summary>
    public static bool TryNormalizePaging(int? page, int? pageSize, out int normalizedPage, out int normalizedPageSize)
    {
        normalizedPage = page ?? 1;
        normalizedPageSize = Math.Min(pageSize ?? DefaultPageSize, MaxPageSize);
        return normalizedPage >= 1 && normalizedPageSize >= 1;
    }

    /// <summary>The item, or null when it does not exist or belongs to someone else (BR-LIB-006).</summary>
    public async Task<ItemDetail?> GetAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var item = await db.Items.AsNoTracking().Include(i => i.Examples)
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId, cancellationToken);
        return item is null ? null : ItemDetail.From(item);
    }
}
