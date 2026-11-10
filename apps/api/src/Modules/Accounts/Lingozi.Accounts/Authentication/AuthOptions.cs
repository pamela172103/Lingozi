using System.ComponentModel.DataAnnotations;

namespace Lingozi.Accounts.Authentication;

/// <summary>Settings under <c>Auth</c>. The HMAC key comes from the environment, never from source control (AGENTS.md §8).</summary>
public sealed class AuthOptions
{
    public const string SectionName = "Auth";
    public const int MinimumKeyBytes = 32;

    /// <summary>Base64 key (at least 32 bytes) for the HMAC-SHA256 of login codes (BR-AUTH-001).</summary>
    [Required]
    public string LoginCodeHmacKey { get; set; } = string.Empty;

    /// <summary>Sign-in code requests allowed per IP address per 10 minutes (BR-AUTH-013).</summary>
    [Range(1, 100_000)]
    public int RequestCodePerIpPer10Minutes { get; set; } = 10;

    internal byte[] GetKeyBytes()
    {
        try
        {
            var bytes = Convert.FromBase64String(LoginCodeHmacKey);
            if (bytes.Length >= MinimumKeyBytes)
            {
                return bytes;
            }
        }
        catch (FormatException)
        {
            // Falls through to the shared error below.
        }

        throw new InvalidOperationException(
            $"Auth:LoginCodeHmacKey must be a base64 string of at least {MinimumKeyBytes} bytes (e.g. `openssl rand -base64 32`).");
    }
}
