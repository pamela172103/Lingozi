using Lingozi.Library.Suggestions;

namespace Lingozi.Api.IntegrationTests;

/// <summary>A word source for tests only (AGENTS §6): it never makes a request, and every call is recorded.</summary>
internal sealed class FakeWordReferenceProvider : IWordReferenceProvider
{
    public string Name => "fake";

    public bool Enabled { get; set; } = true;

    public Func<string, CancellationToken, Task<WordReference?>> Behaviour { get; set; } = (_, _) => Task.FromResult<WordReference?>(null);

    public List<string> Words { get; } = [];

    public Task<WordReference?> LookupAsync(string word, CancellationToken cancellationToken)
    {
        Words.Add(word);
        return Behaviour(word, cancellationToken);
    }
}
