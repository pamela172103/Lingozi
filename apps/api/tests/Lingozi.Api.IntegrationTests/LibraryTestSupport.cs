using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Lingozi.Library.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Lingozi.Api.IntegrationTests;

/// <summary>
/// A signed-in browser for the library endpoints: signs in through the real email-code flow, then sends the session,
/// antiforgery and XSRF cookies by hand (the session cookie is <c>Secure</c>, so the test server's plain-HTTP cookie jar would drop it).
/// </summary>
internal sealed class SignedInClient : IDisposable
{
    private readonly HttpClient _client;
    private readonly Dictionary<string, string> _cookies = [];

    private SignedInClient(HttpClient client) => _client = client;

    public Guid UserId { get; private set; }

    public static async Task<SignedInClient> CreateAsync(WebApplicationFactory<Program> factory, string? email = null)
    {
        email ??= TestExtensions.NewEmail();
        var me = new SignedInClient(factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false, AllowAutoRedirect = false }));
        using (var antiforgery = await me.SendAsync(HttpMethod.Get, "/api/auth/antiforgery", null, withToken: false)) { }
        using (var request = await me.SendAsync(HttpMethod.Post, "/api/auth/email-code/request", new { email })) { }
        var code = await factory.LatestCodeAsync(email);
        using var verify = await me.SendAsync(HttpMethod.Post, "/api/auth/email-code/verify", new { email, code });
        Assert.Equal(HttpStatusCode.OK, verify.StatusCode);
        // Antiforgery tokens are bound to the signed-in user, so the browser fetches a fresh one after signing in.
        using (var refreshed = await me.SendAsync(HttpMethod.Get, "/api/auth/antiforgery", null, withToken: false)) { }
        await factory.WithDbAsync(async db =>
        {
            var user = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions
                .SingleAsync(db.Users, u => u.NormalizedEmail == email, TestContext.Current.CancellationToken);
            me.UserId = user.Id;
        });
        return me;
    }

    /// <summary>A browser that never signed in (it only holds the antiforgery cookies).</summary>
    public static async Task<SignedInClient> AnonymousAsync(WebApplicationFactory<Program> factory)
    {
        var me = new SignedInClient(factory.CreateClient(new WebApplicationFactoryClientOptions { HandleCookies = false, AllowAutoRedirect = false }));
        using var antiforgery = await me.SendAsync(HttpMethod.Get, "/api/auth/antiforgery", null, withToken: false);
        return me;
    }

    public async Task<HttpResponseMessage> SendAsync(HttpMethod method, string url, object? body, bool withToken = true)
    {
        using var request = new HttpRequestMessage(method, url);
        if (body is not null)
        {
            request.Content = JsonContent.Create(body);
        }

        if (_cookies.Count > 0)
        {
            request.Headers.Add("Cookie", string.Join("; ", _cookies.Select(c => $"{c.Key}={c.Value}")));
        }

        if (withToken && _cookies.TryGetValue("XSRF-TOKEN", out var token))
        {
            request.Headers.Add("X-XSRF-TOKEN", Uri.UnescapeDataString(token));
        }

        var response = await _client.SendAsync(request, TestContext.Current.CancellationToken);
        if (response.Headers.TryGetValues("Set-Cookie", out var setCookies))
        {
            foreach (var header in setCookies)
            {
                var pair = header.Split(';')[0];
                var eq = pair.IndexOf('=', StringComparison.Ordinal);
                _cookies[pair[..eq]] = pair[(eq + 1)..];
            }
        }

        return response;
    }

    public Task<HttpResponseMessage> PostItemAsync(object body) => SendAsync(HttpMethod.Post, "/api/library/items", body);

    public void Dispose() => _client.Dispose();
}

internal static class LibraryTestExtensions
{
    public static async Task WithLibraryAsync(this WebApplicationFactory<Program> factory, Func<LibraryDbContext, Task> action)
    {
        await using var scope = factory.Services.CreateAsyncScope();
        await action(scope.ServiceProvider.GetRequiredService<LibraryDbContext>());
    }

    public static async Task<JsonElement> JsonAsync(this HttpResponseMessage response)
    {
        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
        return doc.RootElement.Clone();
    }

    /// <summary>A valid vocabulary request body; override fields with the optional arguments.</summary>
    public static Dictionary<string, object?> Word(string term = "give up", string meaning = "từ bỏ", Guid? clientRequestId = null) => new()
    {
        ["clientRequestId"] = clientRequestId ?? Guid.NewGuid(),
        ["kind"] = "word",
        ["term"] = term,
        ["meaning"] = meaning,
    };

    /// <summary>A valid grammar request body.</summary>
    public static Dictionary<string, object?> Grammar(string term = "Present perfect", string formula = "have/has + V3", Guid? clientRequestId = null) => new()
    {
        ["clientRequestId"] = clientRequestId ?? Guid.NewGuid(),
        ["kind"] = "grammar",
        ["term"] = term,
        ["formula"] = formula,
    };
}
