using System.Net;
using Lingozi.Accounts.Authentication;
using Lingozi.Accounts.Email;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Lingozi.Api.IntegrationTests;

/// <summary>US-AUTH-02: POST /api/auth/email-code/verify against real SQL Server (AC-01 to AC-07, ERR-AUTH-400-03/401-01/403-02).</summary>
[Collection(SqlServerApiFactory.CollectionName)]
public sealed class VerifyEmailCodeTests(SqlServerApiFactory factory)
{
    private static readonly DateTimeOffset Start = new(2026, 11, 10, 8, 0, 0, TimeSpan.Zero);

    private static WebApplicationFactory<Program> Timed(SqlServerApiFactory factory, MutableTimeProvider clock) =>
        factory.WithWebHostBuilder(b => b.ConfigureServices(s => s.AddSingleton<TimeProvider>(clock)));

    // AC-01 (TC-AUTH-006): new email, correct code: account created with a confirmed email, session cookie issued.
    [Fact]
    public async Task CorrectCodeForNewEmailCreatesConfirmedAccountAndSessionCookie()
    {
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(factory);
        using (await client.RequestCodeAsync(email)) { }
        var code = await factory.LatestCodeAsync(email);

        using var response = await client.VerifyCodeAsync(email, code);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains("\"redirectTo\":\"/library\"", body, StringComparison.Ordinal);
        var cookie = response.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("__Host-lingozi.session=", StringComparison.Ordinal));
        Assert.Contains("httponly", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("secure", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=lax", cookie, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("path=/", cookie, StringComparison.OrdinalIgnoreCase);

        await factory.WithDbAsync(async db =>
        {
            var user = await db.Users.SingleAsync(u => u.NormalizedEmail == email, TestContext.Current.CancellationToken);
            Assert.True(user.EmailConfirmed);
            Assert.Null(user.PasswordHash);
            var codeRow = await db.EmailLoginCodes.SingleAsync(c => c.Email == email, TestContext.Current.CancellationToken);
            Assert.NotNull(codeRow.ConsumedAt);
        });
    }

    // AC-02 (TC-AUTH-007): email already has an account: signed in to it, no second account.
    [Fact]
    public async Task CorrectCodeForExistingEmailSignsInWithoutCreatingAnotherAccount()
    {
        var clock = new MutableTimeProvider(Start);
        using var timed = Timed(factory, clock);
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(timed);
        using (await client.RequestCodeAsync(email)) { }
        using (await client.VerifyCodeAsync(email, await timed.LatestCodeAsync(email))) { }
        clock.Advance(TimeSpan.FromSeconds(61));
        using (await client.RequestCodeAsync(email)) { }

        using var response = await client.VerifyCodeAsync(email, await timed.LatestCodeAsync(email));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        await timed.WithDbAsync(async db =>
            Assert.Equal(1, await db.Users.CountAsync(u => u.NormalizedEmail == email, TestContext.Current.CancellationToken)));
    }

    // AC-03 (TC-AUTH-008): wrong code: 401-01 with the remaining attempts; the code stays usable.
    [Fact]
    public async Task WrongCodeReportsRemainingAttemptsAndKeepsTheCodeUsable()
    {
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(factory);
        using (await client.RequestCodeAsync(email)) { }
        var code = await factory.LatestCodeAsync(email);

        using var wrong = await client.VerifyCodeAsync(email, TestExtensions.OtherCodeThan(code));

        Assert.Equal(HttpStatusCode.Unauthorized, wrong.StatusCode);
        Assert.Equal("ERR-AUTH-401-01", await wrong.ProblemCodeAsync());
        using var doc = System.Text.Json.JsonDocument.Parse(await wrong.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        Assert.Equal(4, doc.RootElement.GetProperty("remainingAttempts").GetInt32());

        using var right = await client.VerifyCodeAsync(email, code);
        Assert.Equal(HttpStatusCode.OK, right.StatusCode);
    }

    // AC-04 (TC-AUTH-009): the fifth wrong attempt locks the code, even the right code is refused afterwards.
    [Fact]
    public async Task FifthWrongAttemptLocksTheCodeEvenForTheRightCode()
    {
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(factory);
        using (await client.RequestCodeAsync(email)) { }
        var code = await factory.LatestCodeAsync(email);
        var wrong = TestExtensions.OtherCodeThan(code);

        for (var i = 1; i <= 4; i++)
        {
            using var attempt = await client.VerifyCodeAsync(email, wrong);
            Assert.Equal("ERR-AUTH-401-01", await attempt.ProblemCodeAsync());
        }
        using var fifth = await client.VerifyCodeAsync(email, wrong);
        Assert.Equal(HttpStatusCode.Forbidden, fifth.StatusCode);
        Assert.Equal("ERR-AUTH-403-02", await fifth.ProblemCodeAsync());

        using var afterLock = await client.VerifyCodeAsync(email, code);
        Assert.Equal(HttpStatusCode.BadRequest, afterLock.StatusCode);
        Assert.Equal("ERR-AUTH-400-03", await afterLock.ProblemCodeAsync());
        Assert.False(afterLock.Headers.Contains("Set-Cookie"));
    }

    // AC-05 (TC-AUTH-010): a code older than 10 minutes is refused.
    [Fact]
    public async Task ExpiredCodeIsRefused()
    {
        var clock = new MutableTimeProvider(Start);
        using var timed = Timed(factory, clock);
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(timed);
        using (await client.RequestCodeAsync(email)) { }
        var code = await timed.LatestCodeAsync(email);
        clock.Advance(TimeSpan.FromMinutes(10) + TimeSpan.FromSeconds(1));

        using var response = await client.VerifyCodeAsync(email, code);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("ERR-AUTH-400-03", await response.ProblemCodeAsync());
    }

    // AC-06 (TC-AUTH-011): a code cannot be used twice.
    [Fact]
    public async Task UsedCodeCannotBeUsedAgain()
    {
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(factory);
        using (await client.RequestCodeAsync(email)) { }
        var code = await factory.LatestCodeAsync(email);
        using (var first = await client.VerifyCodeAsync(email, code))
        {
            Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        }

        using var second = await client.VerifyCodeAsync(email, code);

        Assert.Equal(HttpStatusCode.BadRequest, second.StatusCode);
        Assert.Equal("ERR-AUTH-400-03", await second.ProblemCodeAsync());
    }

    // AC-07 (TC-AUTH-012): a newer code replaces the older one.
    [Fact]
    public async Task NewerCodeMakesTheOlderCodeUnusable()
    {
        var clock = new MutableTimeProvider(Start);
        using var timed = Timed(factory, clock);
        var email = TestExtensions.NewEmail();
        using var client = new AuthClient(timed);
        using (await client.RequestCodeAsync(email)) { }
        var older = await timed.LatestCodeAsync(email);
        clock.Advance(TimeSpan.FromSeconds(61));
        using (await client.RequestCodeAsync(email)) { }
        var newer = await timed.LatestCodeAsync(email);

        using var oldResponse = await client.VerifyCodeAsync(email, older);
        Assert.Equal(HttpStatusCode.BadRequest, oldResponse.StatusCode);
        Assert.Equal("ERR-AUTH-400-03", await oldResponse.ProblemCodeAsync());

        using var newResponse = await client.VerifyCodeAsync(email, newer);
        Assert.Equal(HttpStatusCode.OK, newResponse.StatusCode);
    }

    [Fact]
    public async Task InvalidEmailIsRejectedBeforeAnyCodeIsChecked()
    {
        using var client = new AuthClient(factory);

        using var response = await client.VerifyCodeAsync("an@", "123456");

        Assert.Equal("ERR-AUTH-400-01", await response.ProblemCodeAsync());
    }

    [Fact]
    public async Task VerifyWithoutAntiforgeryTokenIsRejected()
    {
        using var http = factory.CreateClient();
        using var response = await http.PostAsync(
            new Uri("/api/auth/email-code/verify", UriKind.Relative),
            System.Net.Http.Json.JsonContent.Create(new { email = "an@example.com", code = "123456" }),
            TestContext.Current.CancellationToken);

        Assert.Equal("ERR-AUTH-400-05", await response.ProblemCodeAsync());
    }
}
