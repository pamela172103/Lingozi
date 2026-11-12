namespace Lingozi.Library.Suggestions;

/// <summary>What an outside source knows about one English word.</summary>
/// <param name="BritishIpa">Pronunciation explicitly marked as British by the configured source, or null.</param>
/// <param name="Definitions">Short definitions from the configured source, at most five.</param>
public sealed record WordReference(string? BritishIpa, IReadOnlyList<string> Definitions)
{
    public IReadOnlyList<ReferenceExample> Examples { get; init; } = [];
}

public sealed record ReferenceExample(string Text, string? Translation);

/// <summary>
/// The outside word source (ADR 0007). Only the word is sent. Implementations throw on transport or format errors;
/// the caller decides that this is "source not available", not a business error (BR-LIB-015).
/// </summary>
public interface IWordReferenceProvider
{
    /// <summary>Short name for logs, e.g. <c>dictionaryapi</c>.</summary>
    string Name { get; }

    /// <summary>False when no outside source is configured: no request is made.</summary>
    bool Enabled { get; }

    /// <returns>The reference, or null when the source does not know the word.</returns>
    Task<WordReference?> LookupAsync(string word, CancellationToken cancellationToken);
}

/// <summary>Used when <c>Pronunciation:Provider</c> is <c>none</c>.</summary>
public sealed class NoWordReferenceProvider : IWordReferenceProvider
{
    public string Name => "none";

    public bool Enabled => false;

    public Task<WordReference?> LookupAsync(string word, CancellationToken cancellationToken) => Task.FromResult<WordReference?>(null);
}
