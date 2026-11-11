using System.ComponentModel.DataAnnotations;

namespace Lingozi.Library.Suggestions;

/// <summary>
/// Configuration of the external word source (ADR 0007). <c>Provider</c> is <c>none</c> by default: no outside request is made
/// until the owner accepts the ADR. <c>dictionaryapi</c> turns on dictionaryapi.dev for development and testing only.
/// </summary>
public sealed class PronunciationOptions
{
    public const string SectionName = "Pronunciation";

    /// <summary>Lookup timeout (BR-LIB-015).</summary>
    public static readonly TimeSpan Timeout = TimeSpan.FromSeconds(3);

    [Required]
    [RegularExpression("^(none|dictionaryapi)$")]
    public string Provider { get; set; } = "none";

    [Required]
    public string DictionaryApiBaseUrl { get; set; } = "https://api.dictionaryapi.dev";
}
