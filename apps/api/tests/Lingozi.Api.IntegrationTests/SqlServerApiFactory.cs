using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.MsSql;

namespace Lingozi.Api.IntegrationTests;

/// <summary>Runs the real API against a real SQL Server 2025 container (no InMemory provider, AGENTS.md §7).</summary>
public sealed class SqlServerApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly MsSqlContainer _sqlServer = new MsSqlBuilder("mcr.microsoft.com/mssql/server:2025-latest")
        .WithEnvironment("MSSQL_PID", "Express")
        .Build();

    public string ConnectionString => _sqlServer.GetConnectionString();

    public async ValueTask InitializeAsync() => await _sqlServer.StartAsync();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Lingozi", ConnectionString);
        builder.UseSetting("Database:ApplyMigrationsOnStartup", "true");
    }

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();
        await _sqlServer.DisposeAsync();
        GC.SuppressFinalize(this);
    }
}
