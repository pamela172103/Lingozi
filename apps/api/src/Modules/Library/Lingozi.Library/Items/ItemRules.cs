using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace Lingozi.Library.Items;

/// <summary>Field rules of FEAT-02 (BR-LIB-001, 003, 004, 012, 013, 016) in one place, shared by create now and edit later (US-LIB-05).</summary>
public static partial class ItemRules
{
    public const int TermMax = 1000;
    public const int FormulaMax = 1000;
    public const int MeaningMax = 2000;
    public const int NoteMax = 4000;
    public const int ExampleTextMax = 1000;
    public const int ExampleTranslationMax = 1000;
    public const int IpaMax = 200;
    public const int MaxExamples = 20;

    /// <summary>BR-LIB-005: items per user, both libraries together.</summary>
    public const int MaxItemsPerUser = 10_000;

    /// <summary>BR-LIB-016.</summary>
    public static readonly IReadOnlyList<string> PartsOfSpeech =
        ["Danh từ", "Động từ", "Tính từ", "Trạng từ", "Giới từ", "Liên từ", "Thán từ", "Cụm từ", "Khác"];

    public static string KindName(ItemKind kind) => kind == ItemKind.Word ? "word" : "grammar";

    public static bool TryParseKind(string? value, out ItemKind kind)
    {
        switch (value)
        {
            case "word":
                kind = ItemKind.Word;
                return true;
            case "grammar":
                kind = ItemKind.Grammar;
                return true;
            default:
                kind = default;
                return false;
        }
    }

    /// <summary>Trims; an empty result is stored as null (BR-LIB-001).</summary>
    public static string? Clean(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }

    /// <summary>BR-LIB-003: lower case (culture-invariant), trimmed, every run of white space becomes one space.</summary>
    public static string Normalize(string term) =>
        WhiteSpace().Replace(term.Trim().ToLowerInvariant(), " ");

    /// <summary>Same bytes as the computed column <c>NormalizedTermHash</c>: SHA-256 of the UTF-16LE text, like SQL Server's <c>HASHBYTES('SHA2_256', nvarchar)</c>.</summary>
    public static byte[] HashNormalized(string normalized) => SHA256.HashData(Encoding.Unicode.GetBytes(normalized));

    /// <summary>
    /// BR-LIB-013: only IPA characters. Letters are allowed in the IPA blocks (U+0250–U+02FF, combining marks), a few
    /// Latin and Greek letters IPA borrows, and ASCII letters; plus <c>/ [ ] ( ) . ‿</c> and the space. Never <c>&lt; &gt; &amp;</c> or control characters.
    /// </summary>
    public static bool IsIpa(string value)
    {
        foreach (var c in value)
        {
            var ok = c is (>= 'a' and <= 'z') or (>= 'A' and <= 'Z')
                or '/' or '[' or ']' or '(' or ')' or '.' or '‿' or ' '
                or (>= 'ɐ' and <= 'ͯ')
                or 'æ' or 'ð' or 'ŋ' or 'œ' or 'θ' or 'β' or 'χ';
            if (!ok)
            {
                return false;
            }
        }

        return true;
    }

    /// <summary>Lower case, no Vietnamese diacritics, đ → d: the text the Round 2 search will index (ERD §3.2 <c>SearchText</c>).</summary>
    public static string ToSearchText(params string?[] parts)
    {
        var joined = string.Join(' ', parts.Where(p => !string.IsNullOrWhiteSpace(p))).ToLowerInvariant().Replace('đ', 'd');
        var decomposed = joined.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder(decomposed.Length);
        foreach (var c in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(c);
            }
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhiteSpace();
}
