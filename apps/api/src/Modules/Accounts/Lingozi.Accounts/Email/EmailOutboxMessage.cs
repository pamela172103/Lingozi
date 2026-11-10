namespace Lingozi.Accounts.Email;

public enum EmailOutboxType : byte
{
    LoginCode = 3,
}

public enum EmailOutboxStatus : byte
{
    Pending = 0,
    Sent = 1,
    Failed = 2,
}

/// <summary>A message waiting to be sent (ADR 0005, ERD §3.1 <c>accounts.EmailOutbox</c>), written in the same transaction as the business change.</summary>
public sealed class EmailOutboxMessage
{
    public Guid Id { get; set; }
    public EmailOutboxType Type { get; set; }
    public string ToAddress { get; set; } = string.Empty;

    /// <summary>JSON envelope <c>{"v":1,"data":"&lt;protected&gt;"}</c>. The content is encrypted with Data Protection and cleared once the message is sent.</summary>
    public string PayloadJson { get; set; } = string.Empty;

    public EmailOutboxStatus Status { get; set; }
    public byte Attempts { get; set; }
    public DateTime NextAttemptAt { get; set; }
    public DateTime? SentAt { get; set; }
    public string? LastError { get; set; }
    public DateTime CreatedAt { get; set; }
}
