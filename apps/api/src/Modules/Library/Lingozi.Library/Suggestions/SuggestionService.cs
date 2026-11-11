using Lingozi.Library.Items;
using Lingozi.Library.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Lingozi.Library.Suggestions;

public sealed record SuggestedIpa(string Value, string Source);

public sealed record SuggestedMeaning(string Text, string Source);

/// <summary>What the form shows while the user types (srs US-LIB-08 and US-LIB-09). Nothing here is written to the database.</summary>
public sealed record SuggestionsResponse(
    SuggestedIpa? Ipa,
    bool SourceEnabled,
    bool SourceAvailable,
    IReadOnlyList<SuggestedMeaning> Meanings);

/// <summary>
/// BR-LIB-014 and BR-LIB-015: suggestions come from the user's own items of the same kind, and from the outside source when it is enabled.
/// The outside lookup has a 3-second limit; a failure or timeout only sets <c>SourceAvailable</c> to false.
/// </summary>
public sealed partial class SuggestionService(LibraryDbContext db, IWordReferenceProvider provider, ILogger<SuggestionService> logger)
{
    public const int MaxMeanings = 5;

    public async Task<SuggestionsResponse> GetAsync(Guid userId, ItemKind kind, string? term, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return new SuggestionsResponse(null, provider.Enabled, false, []);
        }

        var normalized = ItemRules.Normalize(term);
        var hash = ItemRules.HashNormalized(normalized);
        var own = (await db.Items.AsNoTracking()
            .Where(i => i.UserId == userId && i.Kind == kind && i.NormalizedTermHash == hash && i.NormalizedTerm == normalized && i.Meaning != null)
            .OrderByDescending(i => i.CreatedAt).ThenByDescending(i => i.Id)
            .Select(i => i.Meaning!)
            .Take(50)
            .ToListAsync(cancellationToken))
            .Distinct()
            .Take(MaxMeanings)
            .ToList();

        var meanings = own.Select(text => new SuggestedMeaning(text, "own")).ToList();
        SuggestedIpa? ipa = null;
        var available = false;

        if (provider.Enabled)
        {
            try
            {
                using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
                timeout.CancelAfter(PronunciationOptions.Timeout);
                // Only the word goes out, lower case and trimmed; nothing about the user (ADR 0007).
                var reference = await provider.LookupAsync(normalized, timeout.Token);
                available = true;
                if (reference is not null)
                {
                    if (kind == ItemKind.Word && reference.BritishIpa is not null)
                    {
                        ipa = new SuggestedIpa(reference.BritishIpa, "dictionary");
                    }

                    foreach (var definition in reference.Definitions)
                    {
                        if (meanings.Count >= MaxMeanings) break;
                        if (!meanings.Any(m => string.Equals(m.Text, definition, StringComparison.OrdinalIgnoreCase)))
                        {
                            meanings.Add(new SuggestedMeaning(definition, "dictionary"));
                        }
                    }
                }
            }
            catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                LogTimeout(provider.Name);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                // The word itself is not logged (ADR 0007: no user lookups in logs).
                LogFailed(provider.Name, exception.GetType().Name);
            }
        }

        return new SuggestionsResponse(ipa, provider.Enabled, available, meanings);
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Word source {Source} timed out")]
    private partial void LogTimeout(string source);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Word source {Source} failed: {Error}")]
    private partial void LogFailed(string source, string error);
}
