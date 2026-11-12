using System.ComponentModel.DataAnnotations;

namespace Lingozi.Library.Suggestions;

/// <summary>
/// External word source. Production defaults to <c>none</c>; Development selects <c>scandict</c>.
/// <c>dictionaryapi</c> remains available for existing deployments.
/// </summary>
public sealed class PronunciationOptions
{
    public const string SectionName = "Pronunciation";

    /// <summary>Lookup timeout (BR-LIB-015).</summary>
    public static readonly TimeSpan Timeout = TimeSpan.FromSeconds(3);

    [Required]
    [RegularExpression("^(none|dictionaryapi|scandict)$")]
    public string Provider { get; set; } = "none";

    [Required]
    public string DictionaryApiBaseUrl { get; set; } = "https://api.dictionaryapi.dev";
}
