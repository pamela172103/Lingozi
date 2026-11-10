using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Lingozi.Accounts.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Lingozi.Api.IntegrationTests;

/// <summary>A clock tests can move forward (rate limits and back-off depend on time).</summary>
internal sealed class MutableTimeProvider(DateTimeOffset start) : TimeProvider
{
    private DateTimeOffset _now = start;
    public override DateTimeOffset GetUtcNow() => _now;
    public void Advance(TimeSpan by) => _now += by;
}

/// <summary>An email sender that always fails, to exercise retry and back-off.</summary>
internal sealed class FailingEmailSender : Lingozi.Accounts.Email.IEmailSender
{
    public int Calls { get; private set; }

    public Task SendAsync(Lingozi.Accounts.Email.EmailMessage message, CancellationToken cancellationToken)
    {
        Calls++;
        throw new InvalidOperationException("provider down");
    }
}

/// <summary>Calls the API like the web app does: fetch the antiforgery token, then send it in X-XSRF-TOKEN.</summary>
internal sealed class AuthClient : IDisposable
{
    private readonly HttpClient _client;
    private string? _token;

    public AuthClient(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = true });
    }

    public async Task<string> GetTokenAsync()
    {
        if (_token is not null)
        {
            return _token;
        }

        var response = await _client.GetAsync(new Uri("/api/auth/antiforgery", UriKind.Relative), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var cookie = response.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("XSRF-TOKEN=", StringComparison.Ordinal));
        _token = Uri.UnescapeDataString(cookie["XSRF-TOKEN=".Length..].Split(';')[0]);
        return _token;
    }

    public async Task<HttpResponseMessage> RequestCodeAsync(string? email, bool withToken = true)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/email-code/request")
        {
            Content = JsonContent.Create(new { email }),
        };
        if (withToken)
        {
            request.Headers.Add("X-XSRF-TOKEN", await GetTokenAsync());
        }

        return await _client.SendAsync(request, TestContext.Current.CancellationToken);
    }

    public void Dispose() => _client.Dispose();
}

internal static class TestExtensions
{
    public static async Task<string?> ProblemCodeAsync(this HttpResponseMessage response)
    {
        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        return doc.RootElement.GetProperty("code").GetString();
    }

    public static string NewEmail() => $"user-{Guid.NewGuid():N}@example.com";

    public static async Task WithDbAsync(this WebApplicationFactory<Program> factory, Func<AccountsDbContext, Task> action)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        await action(scope.ServiceProvider.GetRequiredService<AccountsDbContext>());
    }
}
