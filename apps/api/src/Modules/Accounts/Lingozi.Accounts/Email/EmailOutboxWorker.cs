using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Lingozi.Accounts.Email;

/// <summary>Background worker that polls the outbox. Without <c>Email:SmtpHost</c> it does nothing and messages stay Pending.</summary>
public sealed partial class EmailOutboxWorker(
    IServiceScopeFactory scopes, IOptions<EmailOptions> options, ILogger<EmailOutboxWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!options.Value.IsConfigured)
        {
            LogNotConfigured(logger);
            return;
        }

        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(options.Value.PollIntervalSeconds));
        do
        {
            try
            {
                await using var scope = scopes.CreateAsyncScope();
                await scope.ServiceProvider.GetRequiredService<EmailOutboxDispatcher>().DispatchDueAsync(stoppingToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                LogTickFailed(logger, ex);
            }
        }
        while (await WaitAsync(timer, stoppingToken));
    }

    private static async Task<bool> WaitAsync(PeriodicTimer timer, CancellationToken cancellationToken)
    {
        try
        {
            return await timer.WaitForNextTickAsync(cancellationToken);
        }
        catch (OperationCanceledException)
        {
            return false;
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Email:SmtpHost is not configured. Outbox messages stay Pending (integration ready, not operational).")]
    private static partial void LogNotConfigured(ILogger logger);

    [LoggerMessage(Level = LogLevel.Error, Message = "Email outbox worker tick failed")]
    private static partial void LogTickFailed(ILogger logger, Exception exception);
}
