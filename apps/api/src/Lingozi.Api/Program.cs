using Lingozi.Accounts;
using Lingozi.Accounts.Persistence;
using Lingozi.Api.Authentication;
using Lingozi.Api.Endpoints;
using Lingozi.Library;
using Lingozi.Library.Persistence;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Lingozi");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException(
        "Missing connection string 'ConnectionStrings:Lingozi'. Set the ConnectionStrings__Lingozi environment variable (see .env.example).");
}

builder.Services.AddProblemDetails();
builder.Services.AddOpenApi();
builder.Services.AddAccountsModule(connectionString, builder.Configuration);
builder.Services.AddLibraryModule(connectionString, builder.Configuration);
builder.Services.AddAuthRateLimiting();
builder.Services.AddSessionCookies();
builder.Services.AddAuthorization();
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-XSRF-TOKEN";
    options.Cookie.Name = "lingozi.antiforgery";
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.HttpOnly = true;
    options.Cookie.SecurePolicy = builder.Environment.IsDevelopment() || builder.Environment.EnvironmentName == "Testing"
        ? CookieSecurePolicy.SameAsRequest
        : CookieSecurePolicy.Always;
});
// Next.js proxies /api/* to this API (ADR 0001), so the client IP arrives in X-Forwarded-For. Only loopback is trusted
// by default; add the reverse proxy addresses in Proxy:TrustedProxies when it runs on another host or container.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    foreach (var address in builder.Configuration.GetSection("Proxy:TrustedProxies").Get<string[]>() ?? [])
    {
        options.KnownProxies.Add(System.Net.IPAddress.Parse(address));
    }
});
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AccountsDbContext>("database", tags: ["ready"])
    .AddDbContextCheck<LibraryDbContext>("library-database", tags: ["ready"]);
builder.Services.AddSingleton(TimeProvider.System);

var app = builder.Build();

if (app.Configuration.GetValue<bool>("Database:ApplyMigrationsOnStartup"))
{
    await using var scope = app.Services.CreateAsyncScope();
    // Accounts first: the Library migration adds a foreign key to accounts.Users.
    await scope.ServiceProvider.GetRequiredService<AccountsDbContext>().Database.MigrateAsync();
    await scope.ServiceProvider.GetRequiredService<LibraryDbContext>().Database.MigrateAsync();
}

app.UseForwardedHeaders();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    app.UseHsts();
}

app.MapHealthChecks("/health/live", new HealthCheckOptions { Predicate = _ => false });
app.MapHealthChecks("/health/ready", new HealthCheckOptions { Predicate = check => check.Tags.Contains("ready") });
app.MapSystemEndpoints();
app.MapAuthEndpoints();
app.MapLibraryEndpoints();

await app.RunAsync();

/// <summary>Entry point marker for WebApplicationFactory in integration tests.</summary>
public partial class Program;
