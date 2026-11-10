using System.ComponentModel.DataAnnotations;

namespace Lingozi.Accounts.Email;

/// <summary>Settings under <c>Email</c> (ADR 0005). Without a host, messages stay Pending: integration ready, not operational.</summary>
public sealed class EmailOptions
{
    public const string SectionName = "Email";

    public string? SmtpHost { get; set; }

    [Range(1, 65535)]
    public int SmtpPort { get; set; } = 587;

    /// <summary>True for STARTTLS or implicit TLS; false only for local Mailpit (development and test).</summary>
    public bool SmtpUseTls { get; set; } = true;

    public string? SmtpUsername { get; set; }
    public string? SmtpPassword { get; set; }

    [Required]
    public string FromAddress { get; set; } = "no-reply@lingozi.local";

    public string FromName { get; set; } = "Lingozi";

    /// <summary>Timeout per send attempt (ADR 0005: 10 seconds).</summary>
    [Range(1, 120)]
    public int SendTimeoutSeconds { get; set; } = 10;

    [Range(1, 3600)]
    public int PollIntervalSeconds { get; set; } = 5;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(SmtpHost);
}
