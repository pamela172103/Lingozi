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
        if (valid is not null && valid.ClientRequestId is null)
        {
            errors["clientRequestId"] = "required";
            valid = null;
        }
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
                IpaSource = valid.IpaSourceValue,
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

    /// <summary>
    /// FR-LIB-ITEM-005 (US-LIB-05): replaces the item's fields and examples if <paramref name="input"/>.Version is still current
    /// (BR-LIB-007). The kind cannot change (BR-LIB-002). The update and the example replacement run in one transaction under the user lock.
    /// </summary>
    public async Task<UpdateItemResult> UpdateAsync(Guid userId, Guid id, KnowledgeItemInput? input, CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string>();
        byte[]? version = null;
        if (string.IsNullOrWhiteSpace(input?.Version))
        {
            errors["version"] = "required";
        }
        else
        {
            try
            {
                version = Convert.FromBase64String(input.Version);
            }
            catch (FormatException)
            {
                errors["version"] = "invalid";
            }
        }

        var (valid, validationErrors) = ItemValidator.Validate(input, requireClientRequestId: false);
        foreach (var error in validationErrors)
        {
            errors[error.Key] = error.Value;
        }

        if (errors.Count > 0 || valid is null || version is null)
        {
            return new UpdateItemResult(UpdateItemOutcome.Invalid, Errors: errors);
        }

        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async ct =>
        {
            db.ChangeTracker.Clear();
            await using var transaction = await db.Database.BeginTransactionAsync(ct);
            await UserLock.AcquireAsync(db, userId, ct);

            var existing = await db.Items.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId, ct);
            if (existing is null)
            {
                await transaction.CommitAsync(ct);
                return new UpdateItemResult(UpdateItemOutcome.NotFound);
            }

            if (valid.Kind != existing.Kind)
            {
                await transaction.CommitAsync(ct);
                return new UpdateItemResult(UpdateItemOutcome.Invalid, Errors: new Dictionary<string, string> { ["kind"] = "not-allowed" });
            }

            var now = clock.GetUtcNow().UtcDateTime;
            var normalized = ItemRules.Normalize(valid.Term);
            var searchText = ItemRules.ToSearchText(
                [valid.Term, valid.Formula, valid.Meaning, valid.PartOfSpeech, valid.Note, .. valid.Examples.SelectMany(e => new[] { e.Text, e.Translation })]);

            // The compare-and-set: the row only changes if the version the client read is still the current one.
            var updated = await db.Items
                .Where(i => i.Id == id && i.UserId == userId && i.RowVersion == version)
                .ExecuteUpdateAsync(s => s
                    .SetProperty(i => i.Term, valid.Term)
                    .SetProperty(i => i.NormalizedTerm, normalized)
                    .SetProperty(i => i.Meaning, valid.Meaning)
                    .SetProperty(i => i.Formula, valid.Formula)
                    .SetProperty(i => i.PartOfSpeech, valid.PartOfSpeech)
                    .SetProperty(i => i.Ipa, valid.Ipa)
                    // No dictionary lookup exists yet (US-LIB-08), so a stored IPA was always typed by the user.
                    .SetProperty(i => i.IpaSource, valid.IpaSourceValue)
                    .SetProperty(i => i.Note, valid.Note)
                    .SetProperty(i => i.SearchText, searchText)
                    .SetProperty(i => i.UpdatedAt, now), ct);

            if (updated == 0)
            {
                // Someone saved in between: report the current state and write nothing (ERR-LIB-409-01).
                var current = await GetAsync(userId, id, ct);
                await transaction.CommitAsync(ct);
                return current is null
                    ? new UpdateItemResult(UpdateItemOutcome.NotFound)
                    : new UpdateItemResult(UpdateItemOutcome.Conflict, current);
            }

            await db.Examples.Where(e => e.ItemId == id && e.UserId == userId).ExecuteDeleteAsync(ct);
            for (var i = 0; i < valid.Examples.Count; i++)
            {
                db.Examples.Add(new ItemExample
                {
                    Id = Guid.CreateVersion7(),
                    ItemId = id,
                    UserId = userId,
                    Text = valid.Examples[i].Text!,
                    Translation = valid.Examples[i].Translation,
                    SortOrder = (short)i,
                });
            }

            await db.SaveChangesAsync(ct);
            var saved = await GetAsync(userId, id, ct);
            await transaction.CommitAsync(ct);
            return new UpdateItemResult(UpdateItemOutcome.Updated, saved);
        }, cancellationToken);
    }

    /// <summary>
    /// FR-LIB-ITEM-006 (US-LIB-06): hard-deletes the item and its examples in one transaction (BR-LIB-009). Returns false when the item
    /// does not exist or belongs to someone else (BR-LIB-006); the answer is the same in both cases.
    /// </summary>
    public async Task<bool> DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken)
    {
        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async ct =>
        {
            db.ChangeTracker.Clear();
            await using var transaction = await db.Database.BeginTransactionAsync(ct);
            await UserLock.AcquireAsync(db, userId, ct);
            // The examples go too: the composite foreign key cascades, and the explicit delete keeps the rule visible here.
            await db.Examples.Where(e => e.ItemId == id && e.UserId == userId).ExecuteDeleteAsync(ct);
            var deleted = await db.Items.Where(i => i.Id == id && i.UserId == userId).ExecuteDeleteAsync(ct);
            await transaction.CommitAsync(ct);
            return deleted > 0;
        }, cancellationToken);
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
