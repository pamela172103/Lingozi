namespace Lingozi.Library.Items;

/// <summary>Kind of a saved item. Round 1 opens only these two (BR-LIB-002); the stored values match ERD §3.2 (<c>CHECK Kind IN (1, 5)</c>).</summary>
public enum ItemKind : byte
{
    Word = 1,
    Grammar = 5,
}

/// <summary>Where a pronunciation (IPA) value came from (BR-LIB-013).</summary>
public enum IpaSource : byte
{
    Dictionary = 1,
    User = 2,
}

/// <summary>A vocabulary item or a grammar structure owned by one user (ERD §3.2 <c>library.KnowledgeItems</c>).</summary>
public sealed class KnowledgeItem
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public ItemKind Kind { get; set; }

    /// <summary>"Từ" for a word, "Tên cấu trúc" for grammar.</summary>
    public string Term { get; set; } = string.Empty;

    public string NormalizedTerm { get; set; } = string.Empty;

    /// <summary>SHA-256 of <see cref="NormalizedTerm"/>, computed by SQL Server. An index on the 1000-character text itself would exceed the 1700-byte index key limit, so the similar-item lookup (US-LIB-02) uses this column and then compares the text.</summary>
    public byte[] NormalizedTermHash { get; private set; } = [];

    /// <summary>"Nghĩa" (required) for a word, "Ý nghĩa" (optional) for grammar.</summary>
    public string? Meaning { get; set; }

    /// <summary>"Công thức": required for grammar, always null for a word.</summary>
    public string? Formula { get; set; }

    public string? PartOfSpeech { get; set; }
    public string? Ipa { get; set; }
    public IpaSource? IpaSource { get; set; }
    public string? Note { get; set; }

    /// <summary>Text for the Round 2 search; computed on every save (ERD §3.2).</summary>
    public string SearchText { get; set; } = string.Empty;

    public Guid? ClientRequestId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public byte[] RowVersion { get; set; } = [];
    public List<ItemExample> Examples { get; set; } = [];
}

/// <summary>An example sentence of an item (ERD §3.2 <c>library.ItemExamples</c>).</summary>
public sealed class ItemExample
{
    public Guid Id { get; set; }
    public Guid ItemId { get; set; }
    public Guid UserId { get; set; }
    public string Text { get; set; } = string.Empty;
    public string? Translation { get; set; }
    public short SortOrder { get; set; }
}
