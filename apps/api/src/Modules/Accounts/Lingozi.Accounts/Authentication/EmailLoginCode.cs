namespace Lingozi.Accounts.Authentication;

/// <summary>A 6-digit sign-in code sent by email (ERD §3.1 <c>accounts.EmailLoginCodes</c>). Only the HMAC of the code is stored.</summary>
public sealed class EmailLoginCode
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public byte[] CodeHmac { get; set; } = [];
    public DateTime ExpiresAt { get; set; }
    public byte Attempts { get; set; }
    public DateTime? ConsumedAt { get; set; }
    public DateTime? InvalidatedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
