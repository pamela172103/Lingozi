using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;

namespace Lingozi.Accounts.Authentication;

/// <summary>HMAC-SHA256 of a login code bound to the email it was sent to (BR-AUTH-001). Raw codes are never stored or logged.</summary>
public sealed class LoginCodeHasher
{
    private readonly byte[] _key;

    public LoginCodeHasher(IOptions<AuthOptions> options)
    {
        ArgumentNullException.ThrowIfNull(options);
        _key = options.Value.GetKeyBytes();
    }

    /// <summary>Generates a 6-digit code with a cryptographically secure generator (000000–999999).</summary>
    public static string GenerateCode() => RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6", System.Globalization.CultureInfo.InvariantCulture);

    public byte[] Hash(string normalizedEmail, string code)
    {
        ArgumentNullException.ThrowIfNull(normalizedEmail);
        ArgumentNullException.ThrowIfNull(code);
        return HMACSHA256.HashData(_key, Encoding.UTF8.GetBytes(normalizedEmail + "\n" + code));
    }

    public bool Verify(string normalizedEmail, string code, byte[] expected) =>
        CryptographicOperations.FixedTimeEquals(Hash(normalizedEmail, code), expected);
}
