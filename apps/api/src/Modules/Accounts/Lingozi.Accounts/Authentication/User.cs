namespace Lingozi.Accounts.Authentication;

/// <summary>A person with an account (ERD §3.1 <c>accounts.Users</c>, subset used by US-AUTH-02). Email is confirmed by construction (BR-AUTH-003).</summary>
public sealed class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string NormalizedEmail { get; set; } = string.Empty;
    public bool EmailConfirmed { get; set; }

    /// <summary>Always null in this version: sign-in uses email codes only (ADR 0004, amended 2026-11-09).</summary>
    public string? PasswordHash { get; set; }

    /// <summary>Changes when the account's sessions must end (used by sign-out in a later story).</summary>
    public string SecurityStamp { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
