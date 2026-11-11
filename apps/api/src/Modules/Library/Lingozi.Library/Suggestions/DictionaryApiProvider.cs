using System.Text.Json;

namespace Lingozi.Library.Suggestions;

/// <summary>
/// dictionaryapi.dev (ADR 0007, option B). Format as observed on 2026-11-11: an array of entries; <c>phonetics[]</c> with
/// <c>text</c> and <c>audio</c>; the en-GB pronunciation is the one whose audio file name ends with <c>-uk.mp3</c>.
/// </summary>
public sealed class DictionaryApiProvider(HttpClient client) : IWordReferenceProvider
{
    public const int MaxDefinitions = 5;

    public string Name => "dictionaryapi";

    public bool Enabled => true;

    public async Task<WordReference?> LookupAsync(string word, CancellationToken cancellationToken)
    {
        using var response = await client.GetAsync($"api/v2/entries/en/{Uri.EscapeDataString(word)}", cancellationToken);
        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        return Parse(body);
    }

    /// <summary>Reads the JSON body. Throws <see cref="JsonException"/> when the shape is not the one above.</summary>
    public static WordReference? Parse(string json)
    {
        using var document = JsonDocument.Parse(json);
        if (document.RootElement.ValueKind != JsonValueKind.Array)
        {
            throw new JsonException("Expected an array of entries.");
        }

        string? british = null;
        var definitions = new List<string>();
        foreach (var entry in document.RootElement.EnumerateArray())
        {
            if (entry.TryGetProperty("phonetics", out var phonetics) && phonetics.ValueKind == JsonValueKind.Array)
            {
                foreach (var phonetic in phonetics.EnumerateArray())
                {
                    var audio = phonetic.TryGetProperty("audio", out var a) ? a.GetString() ?? string.Empty : string.Empty;
                    var text = phonetic.TryGetProperty("text", out var t) ? t.GetString() : null;
                    if (british is null && !string.IsNullOrWhiteSpace(text) && audio.EndsWith("-uk.mp3", StringComparison.OrdinalIgnoreCase))
                    {
                        british = text.Trim();
                    }
                }
            }

            if (entry.TryGetProperty("meanings", out var meanings) && meanings.ValueKind == JsonValueKind.Array)
            {
                foreach (var meaning in meanings.EnumerateArray())
                {
                    if (!meaning.TryGetProperty("definitions", out var defs) || defs.ValueKind != JsonValueKind.Array)
                    {
                        continue;
                    }

                    foreach (var def in defs.EnumerateArray())
                    {
                        var definition = def.TryGetProperty("definition", out var d) ? d.GetString() : null;
                        if (!string.IsNullOrWhiteSpace(definition) && !definitions.Contains(definition.Trim()) && definitions.Count < MaxDefinitions)
                        {
                            definitions.Add(definition.Trim());
                        }
                    }
                }
            }
        }

        return british is null && definitions.Count == 0 ? null : new WordReference(british, definitions);
    }
}
