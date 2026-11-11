namespace Lingozi.Library.Items;

/// <summary>One example sentence as returned to the client.</summary>
public sealed record ExampleView(string Text, string? Translation);

/// <summary>KnowledgeItemDetail (README §4.3).</summary>
public sealed record ItemDetail(
    Guid Id,
    string Kind,
    string Term,
    string? Meaning,
    string? Formula,
    string? PartOfSpeech,
    string? Ipa,
    string? IpaSource,
    string? Note,
    IReadOnlyList<ExampleView> Examples,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string Version)
{
    public static ItemDetail From(KnowledgeItem item)
    {
        ArgumentNullException.ThrowIfNull(item);
        return new ItemDetail(
            item.Id,
            ItemRules.KindName(item.Kind),
            item.Term,
            item.Meaning,
            item.Formula,
            item.PartOfSpeech,
            item.Ipa,
            item.IpaSource is null ? null : item.IpaSource == Items.IpaSource.Dictionary ? "dictionary" : "user",
            item.Note,
            [.. item.Examples.OrderBy(e => e.SortOrder).Select(e => new ExampleView(e.Text, e.Translation))],
            DateTime.SpecifyKind(item.CreatedAt, DateTimeKind.Utc),
            DateTime.SpecifyKind(item.UpdatedAt, DateTimeKind.Utc),
            Convert.ToBase64String(item.RowVersion));
    }
}

/// <summary>KnowledgeItemSummary: one card of a library list.</summary>
public sealed record ItemSummary(
    Guid Id,
    string Kind,
    string Term,
    string? Meaning,
    string? Formula,
    string? PartOfSpeech,
    string? Ipa,
    DateTime CreatedAt);

/// <summary>A page of items of one kind (BR-LIB-011).</summary>
public sealed record ItemPage(IReadOnlyList<ItemSummary> Items, int Page, int PageSize, int TotalCount);

public enum CreateItemOutcome
{
    /// <summary>201: the item was created.</summary>
    Created,

    /// <summary>200: the same <c>clientRequestId</c> was already used; the earlier item is returned (BR-LIB-008).</summary>
    Existing,

    /// <summary>400: ERR-LIB-400-01 or ERR-LIB-400-02.</summary>
    Invalid,

    /// <summary>422: ERR-LIB-422-01.</summary>
    LimitReached,
}

/// <param name="Outcome">What happened.</param>
/// <param name="Item">The item for <see cref="CreateItemOutcome.Created"/> and <see cref="CreateItemOutcome.Existing"/>.</param>
/// <param name="Errors">Field name → reason code for <see cref="CreateItemOutcome.Invalid"/>.</param>
public sealed record CreateItemResult(CreateItemOutcome Outcome, ItemDetail? Item = null, IReadOnlyDictionary<string, string>? Errors = null);
