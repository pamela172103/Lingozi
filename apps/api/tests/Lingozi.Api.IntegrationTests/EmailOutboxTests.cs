using Lingozi.Accounts.Email;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Lingozi.Api.IntegrationTests;

/// <summary>ADR 0005: retry with back-off, at most 5 attempts, payload cleared when the message is final. Uses a fake sender (tests only).</summary>
[Collection(SqlServerApiFactory.CollectionName)]
public sealed class EmailOutboxTests(SqlServerApiFactory factory)
{
    [Fact]
    public async Task FailedSendsAreRetriedWithBackoffThenMarkedFailedAndPayloadCleared()
    {
        var clock = new MutableTimeProvider(new DateTimeOffset(2026, 11, 10, 8, 0, 0, TimeSpan.Zero));
        var sender = new FailingEmailSender();
        using var custom = factory.WithWebHostBuilder(b => b.ConfigureServices(s =>
        {
            s.AddSingleton<TimeProvider>(clock);
            s.AddScoped<IEmailSender>(_ => sender);
        }));
        // The outbox is shared by the whole test collection. Earlier tests leave pending mail that would fill the
        // dispatcher's batch first, so clear it here; this test only checks its own message.
        await custom.WithDbAsync(async db =>
            await db.EmailOutbox.Where(m => m.Status == EmailOutboxStatus.Pending).ExecuteDeleteAsync(TestContext.Current.CancellationToken));
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(custom);
        using var accepted = await client.RequestCodeAsync(email);
        Assert.Equal(System.Net.HttpStatusCode.Accepted, accepted.StatusCode);

        for (var attempt = 1; attempt <= EmailOutboxDispatcher.MaxAttempts; attempt++)
        {
            await using var scope = custom.Services.CreateAsyncScope();
            var sent = await scope.ServiceProvider.GetRequiredService<EmailOutboxDispatcher>().DispatchDueAsync(TestContext.Current.CancellationToken);
            Assert.Equal(0, sent);

            var message = await scope.ServiceProvider.GetRequiredService<Lingozi.Accounts.Persistence.AccountsDbContext>()
                .EmailOutbox.AsNoTracking().SingleAsync(m => m.ToAddress == email, TestContext.Current.CancellationToken);
            Assert.Equal(attempt, message.Attempts);
            Assert.Equal(nameof(InvalidOperationException), message.LastError);
            if (attempt < EmailOutboxDispatcher.MaxAttempts)
            {
                Assert.Equal(EmailOutboxStatus.Pending, message.Status);
                Assert.True(message.NextAttemptAt > clock.GetUtcNow().UtcDateTime);
                clock.Advance(TimeSpan.FromHours(3)); // beyond the longest back-off
            }
            else
            {
                Assert.Equal(EmailOutboxStatus.Failed, message.Status);
                Assert.Contains("\"data\":null", message.PayloadJson, StringComparison.Ordinal);
            }
        }

        // The outbox is shared by every test in the collection, so the fake also saw other tests' messages.
        Assert.True(sender.Calls >= EmailOutboxDispatcher.MaxAttempts);
    }
}
