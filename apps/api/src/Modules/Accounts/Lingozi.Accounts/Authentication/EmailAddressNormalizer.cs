using System.Net.Mail;

namespace Lingozi.Accounts.Authentication;

/// <summary>Validates and normalizes sign-in email addresses (FR-AUTH-CODE-001, ERR-AUTH-400-01).</summary>
public static class EmailAddressNormalizer
{
    public const int MaxLength = 256;
    private const int MaxLocalPartLength = 64;

    /// <summary>
    /// Trims, lower-cases and validates the address. Returns false when it is empty, longer than
    /// 256 characters, contains whitespace or control characters, or is not a plain <c>local@domain.tld</c> address.
    /// </summary>
    public static bool TryNormalize(string? input, out string normalized)
    {
        normalized = string.Empty;
        var value = input?.Trim();
        if (string.IsNullOrEmpty(value) || value.Length > MaxLength)
        {
            return false;
        }

        if (value.Any(c => char.IsWhiteSpace(c) || char.IsControl(c)))
        {
            return false;
        }

        var at = value.IndexOf('@', StringComparison.Ordinal);
        if (at <= 0 || at != value.LastIndexOf('@') || at > MaxLocalPartLength)
        {
            return false;
        }

        var domain = value[(at + 1)..];
        if (!IsValidDomain(domain))
        {
            return false;
        }

        // Rejects display names, comments and quoted forms; the parsed address must be exactly the input.
        if (!MailAddress.TryCreate(value, out var parsed) || !string.Equals(parsed.Address, value, StringComparison.Ordinal))
        {
            return false;
        }

        normalized = value.ToLowerInvariant();
        return true;
    }

    private static bool IsValidDomain(string domain)
    {
        if (domain.Length < 3 || !domain.Contains('.', StringComparison.Ordinal))
        {
            return false;
        }

        foreach (var label in domain.Split('.'))
        {
            if (label.Length == 0 || label[0] == '-' || label[^1] == '-')
            {
                return false;
            }
        }

        return true;
    }
}
