using Microsoft.AspNetCore.Authentication.Cookies;

namespace Lingozi.Api.Authentication;

/// <summary>The sign-in session cookie (ADR 0004): HttpOnly, Secure, SameSite=Lax, 14 days, sliding.</summary>
public static class SessionCookies
{
    public const string Name = "__Host-lingozi.session";
    public static readonly TimeSpan Lifetime = TimeSpan.FromDays(14);

    public static IServiceCollection AddSessionCookies(this IServiceCollection services) =>
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.Name = Name;
                options.Cookie.HttpOnly = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.Path = "/";
                options.ExpireTimeSpan = Lifetime;
                options.SlidingExpiration = true;
            })
            .Services;
}
