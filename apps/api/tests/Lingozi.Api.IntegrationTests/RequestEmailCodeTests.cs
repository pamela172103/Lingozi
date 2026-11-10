using System.Net;
using System.Net.Http.Json;
using Lingozi.Accounts.Authentication;
using Lingozi.Accounts.Email;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Lingozi.Api.IntegrationTests;

/// <summary>US-AUTH-01: POST /api/auth/email-code/request against real SQL Server (AC-01 to AC-05, ERR-AUTH-400-01/400-05/429-01).</summary>
[Collection(SqlServerApiFactory.CollectionName)]
public sealed class RequestEmailCodeTests(SqlServerApiFactory factory)
{
    private static readonly DateTimeOffset Start = new(2026, 11, 10, 8, 0, 0, TimeSpan.Zero);

    // TC-AUTH-001 (AC-01)
    [Fact]
    public async Task ValidEmailStoresHashedCodeAndQueuesMail()
    {
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(factory);

        using var response = await client.RequestCodeAsync("  " + email.ToUpperInvariant() + " ");

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        Assert.Equal("check-email", body.GetProperty("status").GetString());
        Assert.Equal(60, body.GetProperty("resendAfterSeconds").GetInt32());

        await factory.WithDbAsync(async db =>
        {
            var code = await db.EmailLoginCodes.SingleAsync(c => c.Email == email, TestContext.Current.CancellationToken);
            var outbox = await db.EmailOutbox.SingleAsync(m => m.ToAddress == email, TestContext.Current.CancellationToken);

            Assert.Equal(32, code.CodeHmac.Length);
            Assert.Equal(TimeSpan.FromMinutes(10), code.ExpiresAt - code.CreatedAt);
            Assert.Equal(0, code.Attempts);
            Assert.Null(code.ConsumedAt);
            Assert.Null(code.InvalidatedAt);
            Assert.Equal(EmailOutboxType.LoginCode, outbox.Type);
            Assert.Equal(EmailOutboxStatus.Pending, outbox.Status);

            // BR-AUTH-001: the stored hash matches the code in the (encrypted) mail, and the raw code is not readable in the table.
            await using var scope = factory.Services.CreateAsyncScope();
            var payload = scope.ServiceProvider.GetRequiredService<EmailOutboxPayload>().Open<LoginCodePayload>(outbox.PayloadJson);
            Assert.NotNull(payload);
            Assert.Matches("^[0-9]{6}$", payload.Code);
            Assert.Equal(10, payload.ValidMinutes);
            Assert.DoesNotContain(payload.Code, outbox.PayloadJson, StringComparison.Ordinal);
            Assert.True(scope.ServiceProvider.GetRequiredService<LoginCodeHasher>().Verify(email, payload.Code, code.CodeHmac));
        });
    }

    // TC-AUTH-002 (AC-02)
    [Theory]
    [InlineData("an@")]
    [InlineData("")]
    [InlineData(null)]
    [InlineData("not an email")]
    public async Task InvalidEmailIsRejectedWithoutWritingAnything(string? email)
    {
        using var client = new AuthClient(factory);
        var codesBefore = 0;
        var outboxBefore = 0;
        await factory.WithDbAsync(async db =>
        {
            codesBefore = await db.EmailLoginCodes.CountAsync(TestContext.Current.CancellationToken);
            outboxBefore = await db.EmailOutbox.CountAsync(TestContext.Current.CancellationToken);
        });

        using var response = await client.RequestCodeAsync(email);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("ERR-AUTH-400-01", await response.ProblemCodeAsync());
        await factory.WithDbAsync(async db =>
        {
            Assert.Equal(codesBefore, await db.EmailLoginCodes.CountAsync(TestContext.Current.CancellationToken));
            Assert.Equal(outboxBefore, await db.EmailOutbox.CountAsync(TestContext.Current.CancellationToken));
        });
    }

    // TC-AUTH-003 (AC-03)
    [Fact]
    public async Task SecondRequestWithinSixtySecondsIsRateLimited()
    {
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(factory);

        using var first = await client.RequestCodeAsync(email);
        using var second = await client.RequestCodeAsync(email);

        Assert.Equal(HttpStatusCode.Accepted, first.StatusCode);
        Assert.Equal(HttpStatusCode.TooManyRequests, second.StatusCode);
        Assert.Equal("ERR-AUTH-429-01", await second.ProblemCodeAsync());
        var retryAfter = int.Parse(second.Headers.GetValues("Retry-After").Single(), System.Globalization.CultureInfo.InvariantCulture);
        Assert.InRange(retryAfter, 1, 60);
        await factory.WithDbAsync(async db =>
        {
            Assert.Equal(1, await db.EmailOutbox.CountAsync(m => m.ToAddress == email, TestContext.Current.CancellationToken));
            Assert.Equal(1, await db.EmailLoginCodes.CountAsync(c => c.Email == email, TestContext.Current.CancellationToken));
        });
    }

    // TC-AUTH-004 (AC-04). Accounts do not exist until US-AUTH-02, so this checks that the response never varies with the email.
    [Fact]
    public async Task ResponseIsIdenticalForDifferentEmails()
    {
        using var client = new AuthClient(factory);

        using var one = await client.RequestCodeAsync(TestExtensions.NewEmail());
        using var two = await client.RequestCodeAsync(TestExtensions.NewEmail());

        Assert.Equal(one.StatusCode, two.StatusCode);
        Assert.Equal(await one.Content.ReadAsStringAsync(TestContext.Current.CancellationToken), await two.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    // TC-AUTH-005 (AC-05) and the replacement rule: a new code invalidates the previous one.
    [Fact]
    public async Task SixthRequestInAnHourIsRateLimitedAndNewCodeInvalidatesTheOldOne()
    {
        var clock = new MutableTimeProvider(Start);
        using var timed = factory.WithWebHostBuilder(b => b.ConfigureServices(s => s.AddSingleton<TimeProvider>(clock)));
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(timed);

        for (var i = 0; i < 5; i++)
        {
            using var ok = await client.RequestCodeAsync(email);
            Assert.Equal(HttpStatusCode.Accepted, ok.StatusCode);
            clock.Advance(TimeSpan.FromSeconds(61));
        }

        using var sixth = await client.RequestCodeAsync(email);
        Assert.Equal(HttpStatusCode.TooManyRequests, sixth.StatusCode);
        Assert.Equal("ERR-AUTH-429-01", await sixth.ProblemCodeAsync());
        var retryAfter = int.Parse(sixth.Headers.GetValues("Retry-After").Single(), System.Globalization.CultureInfo.InvariantCulture);
        Assert.InRange(retryAfter, 1, 3600);

        await timed.WithDbAsync(async db =>
        {
            var codes = await db.EmailLoginCodes.Where(c => c.Email == email).OrderBy(c => c.CreatedAt).ToListAsync(TestContext.Current.CancellationToken);
            Assert.Equal(5, codes.Count);
            Assert.All(codes[..4], c => Assert.NotNull(c.InvalidatedAt));
            Assert.Null(codes[4].InvalidatedAt);
            Assert.Equal(5, await db.EmailOutbox.CountAsync(m => m.ToAddress == email, TestContext.Current.CancellationToken));
        });

        clock.Advance(TimeSpan.FromSeconds(retryAfter));
        using var afterWait = await client.RequestCodeAsync(email);
        Assert.Equal(HttpStatusCode.Accepted, afterWait.StatusCode);
    }

    // BR-AUTH-013: per-IP limit (configured to 3 here).
    [Fact]
    public async Task RequestsAboveThePerIpLimitAreRateLimited()
    {
        using var limited = factory.WithWebHostBuilder(b => b.UseSetting("Auth:RequestCodePerIpPer10Minutes", "3"));
        using var client = new AuthClient(limited);

        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 4; i++)
        {
            using var response = await client.RequestCodeAsync(TestExtensions.NewEmail());
            statuses.Add(response.StatusCode);
            if (response.StatusCode == HttpStatusCode.TooManyRequests)
            {
                Assert.Equal("ERR-AUTH-429-01", await response.ProblemCodeAsync());
                Assert.True(response.Headers.Contains("Retry-After"));
            }
        }

        Assert.Equal([HttpStatusCode.Accepted, HttpStatusCode.Accepted, HttpStatusCode.Accepted, HttpStatusCode.TooManyRequests], statuses);
    }

    // ERR-AUTH-400-05
    [Fact]
    public async Task RequestWithoutAntiforgeryTokenIsRejected()
    {
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(factory);

        using var response = await client.RequestCodeAsync(email, withToken: false);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("ERR-AUTH-400-05", await response.ProblemCodeAsync());
        await factory.WithDbAsync(async db =>
            Assert.False(await db.EmailLoginCodes.AnyAsync(c => c.Email == email, TestContext.Current.CancellationToken)));
    }

    [Fact]
    public async Task AntiforgeryEndpointSetsReadableCookie()
    {
        using var http = factory.CreateClient();

        using var response = await http.GetAsync(new Uri("/api/auth/antiforgery", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var cookies = response.Headers.GetValues("Set-Cookie").ToList();
        Assert.Contains(cookies, c => c.StartsWith("XSRF-TOKEN=", StringComparison.Ordinal) && !c.Contains("httponly", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(cookies, c => c.StartsWith("lingozi.antiforgery=", StringComparison.Ordinal) && c.Contains("httponly", StringComparison.OrdinalIgnoreCase));
        Assert.Contains("no-store", response.Headers.CacheControl?.ToString(), StringComparison.Ordinal);
    }

    // BR-AUTH-009 under concurrency: parallel requests for one email must produce a single code.
    [Fact]
    public async Task ParallelRequestsForOneEmailCreateOnlyOneCode()
    {
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(factory);
        await client.GetTokenAsync();

        var responses = await Task.WhenAll(Enumerable.Range(0, 6).Select(_ => client.RequestCodeAsync(email)));

        Assert.Equal(1, responses.Count(r => r.StatusCode == HttpStatusCode.Accepted));
        Assert.Equal(5, responses.Count(r => r.StatusCode == HttpStatusCode.TooManyRequests));
        await factory.WithDbAsync(async db =>
            Assert.Equal(1, await db.EmailLoginCodes.CountAsync(c => c.Email == email, TestContext.Current.CancellationToken)));
        foreach (var r in responses)
        {
            r.Dispose();
        }
    }
}
