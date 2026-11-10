namespace Lingozi.Accounts.Email;

/// <summary>An outgoing email. Subject and bodies are built from a typed payload and never logged.</summary>
public sealed record EmailMessage(string To, string Subject, string TextBody, string HtmlBody);

/// <summary>Abstraction over the email provider (ADR 0005). Implementations must honour the cancellation token (send timeout).</summary>
public interface IEmailSender
{
    Task SendAsync(EmailMessage message, CancellationToken cancellationToken);
}
