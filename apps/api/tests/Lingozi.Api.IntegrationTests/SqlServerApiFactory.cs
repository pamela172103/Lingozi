using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.MsSql;

namespace Lingozi.Api.IntegrationTests;

/// <summary>Runs the real API against a real SQL Server 2025 container (no InMemory provider, AGENTS.md §7).</summary>
public class SqlServerApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly MsSqlContainer _sqlServer = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2025-latest")
        .WithEnvironment("MSSQL_PID", "Express")
        .Build();

    public string ConnectionString => _sqlServer.GetConnectionString();

    public virtual async ValueTask InitializeAsync() => await _sqlServer.StartAsync();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Lingozi", ConnectionString);
        builder.UseSetting("Database:ApplyMigrationsOnStartup", "true");
        // Throwaway key for tests only (32 bytes, base64). Real environments set Auth__LoginCodeHmacKey.
        builder.UseSetting("Auth:LoginCodeHmacKey", Convert.ToBase64String(new byte[32].Select((_, i) => (byte)(i + 1)).ToArray()));
        builder.UseSetting("Auth:RequestCodePerIpPer10Minutes", "1000");
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await _sqlServer.DisposeAsync();
        GC.SuppressFinalize(this);
    }

    /// <summary>The factory shared by every integration test class: one SQL Server container for the whole run.</summary>
    public const string CollectionName = "api";
}
