using Lingozi.Accounts.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lingozi.Accounts.Email;

/// <summary>
/// Sends due outbox messages (ADR 0005): timeout per attempt, at most 5 attempts with increasing back-off.
/// Messages sent more than 30 days ago are deleted (ERD §3.1).
/// </summary>
public sealed partial class EmailOutboxDispatcher(
    AccountsDbContext db,
    IEmailSender sender,
    EmailOutboxPayload payloads,
    IOptions<EmailOptions> options,
    TimeProvider clock,
    ILogger<EmailOutboxDispatcher> logger)
{
    public const int MaxAttempts = 5;
    private const int BatchSize = 20;
    private static readonly TimeSpan[] Backoff =
        [TimeSpan.FromSeconds(30), TimeSpan.FromMinutes(2), TimeSpan.FromMinutes(10), TimeSpan.FromMinutes(30), TimeSpan.FromHours(2)];

    /// <summary>Processes the messages that are due. Returns the number sent successfully.</summary>
    public async Task<int> DispatchDueAsync(CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        var due = await db.EmailOutbox
            .Where(m => m.Status == EmailOutboxStatus.Pending && m.NextAttemptAt <= now)
            .OrderBy(m => m.NextAttemptAt)
            .Take(BatchSize)
            .ToListAsync(cancellationToken);

        var sent = 0;
        foreach (var message in due)
        {
            if (await TrySendAsync(message, cancellationToken))
            {
                sent++;
            }
        }

        await db.EmailOutbox
            .Where(m => m.Status != EmailOutboxStatus.Pending && m.CreatedAt < now.AddDays(-30))
            .ExecuteDeleteAsync(cancellationToken);
        return sent;
    }

    private async Task<bool> TrySendAsync(EmailOutboxMessage message, CancellationToken cancellationToken)
    {
        var now = clock.GetUtcNow().UtcDateTime;
        try
        {
            var email = Build(message);
            using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeout.CancelAfter(TimeSpan.FromSeconds(options.Value.SendTimeoutSeconds));
            await sender.SendAsync(email, timeout.Token);

            message.Status = EmailOutboxStatus.Sent;
            message.SentAt = now;
            message.LastError = null;
            message.PayloadJson = payloads.SealedEmpty;
            await db.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (Exception ex) when (ex is not OperationCanceledException || !cancellationToken.IsCancellationRequested)
        {
            message.Attempts++;
            message.LastError = ex.GetType().Name; // type only: messages can echo addresses or content
            if (message.Attempts >= MaxAttempts)
            {
                message.Status = EmailOutboxStatus.Failed;
                message.PayloadJson = payloads.SealedEmpty;
            }
            else
            {
                message.NextAttemptAt = now + Backoff[message.Attempts - 1];
            }

            LogSendFailed(logger, message.Id, message.Type, message.Attempts, message.LastError);
            await db.SaveChangesAsync(cancellationToken);
            return false;
        }
    }

    private EmailMessage Build(EmailOutboxMessage message)
    {
        switch (message.Type)
        {
            case EmailOutboxType.LoginCode:
                var payload = payloads.Open<LoginCodePayload>(message.PayloadJson)
                    ?? throw new InvalidOperationException("Outbox payload is empty.");
                return LoginCodeEmail.Build(message.ToAddress, payload);
            default:
                throw new InvalidOperationException("Unknown outbox message type.");
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Email send failed: outbox {MessageId}, type {Type}, attempt {Attempt}, error {Error}")]
    private static partial void LogSendFailed(ILogger logger, Guid messageId, EmailOutboxType type, int attempt, string? error);
}
