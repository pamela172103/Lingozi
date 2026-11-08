using System.Net;
using System.Net.Http.Json;
using Lingozi.Api.Endpoints;
using Microsoft.Data.SqlClient;

namespace Lingozi.Api.IntegrationTests;

public sealed class SystemStatusTests(SqlServerApiFactory factory) : IClassFixture<SqlServerApiFactory>
{
    [Fact]
    public async Task StatusReportsDatabaseOkAndNoPendingMigrations()
    {
        using var client = factory.CreateClient();

        var status = await client.GetFromJsonAsync<SystemStatusResponse>("/api/system/status", TestContext.Current.CancellationToken);

        Assert.NotNull(status);
        Assert.Equal("ok", status.Api);
        Assert.Equal("ok", status.Database);
        Assert.Equal(0, status.PendingMigrations);
    }

    [Fact]
    public async Task ReadyHealthCheckPassesAgainstSqlServer()
    {
        using var client = factory.CreateClient();

        var response = await client.GetAsync(new Uri("/health/ready", UriKind.Relative), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task MigrationCreatesDataProtectionKeyTableInAccountsSchema()
    {
        using var client = factory.CreateClient();
        // Any request forces app start-up, which applies migrations.
        (await client.GetAsync(new Uri("/health/live", UriKind.Relative), TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

        await using var connection = new SqlConnection(factory.ConnectionString);
        await connection.OpenAsync(TestContext.Current.CancellationToken);
        await using var command = new SqlCommand(
            "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'accounts' AND TABLE_NAME IN ('DataProtectionKeys', '__EFMigrationsHistory')",
            connection);

        var count = (int)(await command.ExecuteScalarAsync(TestContext.Current.CancellationToken))!;

        Assert.Equal(2, count);
    }
}
