using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Containers;
using Lingozi.Accounts.Email;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Lingozi.Api.IntegrationTests;

/// <summary>The API plus a real Mailpit SMTP server (ADR 0005: local/test only), so delivery runs through the real worker and MailKit.</summary>
public sealed class MailpitApiFactory : SqlServerApiFactory
{
    private readonly IContainer _mailpit = new ContainerBuilder("axllent/mailpit:v1.33.1")
        .WithPortBinding(1025, true)
        .WithPortBinding(8025, true)
        .WithWaitStrategy(Wait.ForUnixContainer().UntilHttpRequestIsSucceeded(r => r.ForPort(8025).ForPath("/readyz")))
        .Build();

    public Uri MailpitApi => new($"http://{_mailpit.Hostname}:{_mailpit.GetMappedPublicPort(8025)}");

    public override async ValueTask InitializeAsync()
    {
        await _mailpit.StartAsync();
        await base.InitializeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.UseSetting("Email:SmtpHost", _mailpit.Hostname);
        builder.UseSetting("Email:SmtpPort", _mailpit.GetMappedPublicPort(1025).ToString(System.Globalization.CultureInfo.InvariantCulture));
        builder.UseSetting("Email:SmtpUseTls", "false");
        builder.UseSetting("Email:PollIntervalSeconds", "1");
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await _mailpit.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}

public sealed class MailpitDeliveryTests(MailpitApiFactory factory) : IClassFixture<MailpitApiFactory>
{
    // AC-01 end to end on the backend: the worker sends the mail and the code in it matches the stored hash.
    [Fact]
    public async Task WorkerDeliversTheCodeEmailThroughSmtp()
    {
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(factory);
        using var response = await client.RequestCodeAsync(email);
        Assert.Equal(System.Net.HttpStatusCode.Accepted, response.StatusCode);

        using var mailpit = new HttpClient { BaseAddress = factory.MailpitApi };
        string? text = null;
        for (var i = 0; i < 30 && text is null; i++)
        {
            await Task.Delay(500, TestContext.Current.CancellationToken);
            var list = await mailpit.GetFromJsonAsync<JsonElement>("/api/v1/messages", TestContext.Current.CancellationToken);
            foreach (var m in list.GetProperty("messages").EnumerateArray())
            {
                if (m.GetProperty("To").EnumerateArray().Any(t => string.Equals(t.GetProperty("Address").GetString(), email, StringComparison.Ordinal)))
                {
                    var full = await mailpit.GetFromJsonAsync<JsonElement>("/api/v1/message/" + m.GetProperty("ID").GetString(), TestContext.Current.CancellationToken);
                    Assert.Equal("Mã đăng nhập Lingozi", full.GetProperty("Subject").GetString());
                    text = full.GetProperty("Text").GetString();
                }
            }
        }

        Assert.NotNull(text);
        var code = Regex.Match(text, "[0-9]{6}").Value;
        Assert.Equal(6, code.Length);
        await factory.WithDbAsync(async db =>
        {
            var stored = await db.EmailLoginCodes.SingleAsync(c => c.Email == email, TestContext.Current.CancellationToken);
            await using var scope = factory.Services.CreateAsyncScope();
            var hasher = scope.ServiceProvider.GetRequiredService<Lingozi.Accounts.Authentication.LoginCodeHasher>();
            Assert.True(hasher.Verify(email, code, stored.CodeHmac));

            var outbox = await db.EmailOutbox.AsNoTracking().SingleAsync(m => m.ToAddress == email, TestContext.Current.CancellationToken);
            Assert.Equal(EmailOutboxStatus.Sent, outbox.Status);
            Assert.NotNull(outbox.SentAt);
            Assert.Contains("\"data\":null", outbox.PayloadJson, StringComparison.Ordinal);
        });
    }
}
