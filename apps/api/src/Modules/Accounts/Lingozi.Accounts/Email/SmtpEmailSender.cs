using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Lingozi.Accounts.Email;

/// <summary>Sends through SMTP with MailKit. Local development points it at Mailpit (compose.yaml); production needs MAIL-01.</summary>
public sealed class SmtpEmailSender(IOptions<EmailOptions> options) : IEmailSender
{
    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(message);
        var settings = options.Value;
        if (!settings.IsConfigured || settings.SmtpHost is null)
        {
            throw new InvalidOperationException("Email:SmtpHost is not configured.");
        }

        var mime = new MimeMessage();
        mime.From.Add(new MailboxAddress(settings.FromName, settings.FromAddress));
        mime.To.Add(MailboxAddress.Parse(message.To));
        mime.Subject = message.Subject;
        mime.Body = new BodyBuilder { TextBody = message.TextBody, HtmlBody = message.HtmlBody }.ToMessageBody();

        using var client = new SmtpClient();
        var security = settings.SmtpUseTls ? SecureSocketOptions.StartTlsWhenAvailable : SecureSocketOptions.None;
        await client.ConnectAsync(settings.SmtpHost, settings.SmtpPort, security, cancellationToken);
        if (!string.IsNullOrEmpty(settings.SmtpUsername))
        {
            await client.AuthenticateAsync(settings.SmtpUsername, settings.SmtpPassword ?? string.Empty, cancellationToken);
        }

        await client.SendAsync(mime, cancellationToken);
        await client.DisconnectAsync(quit: true, cancellationToken);
    }
}
