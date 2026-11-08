using Lingozi.Accounts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Api.Endpoints;

/// <summary>Walking-skeleton endpoint: proves the request path web → API → SQL Server.</summary>
internal static partial class SystemEndpoints
{
    public static IEndpointRouteBuilder MapSystemEndpoints(this IEndpointRouteBuilder routes)
    {
        routes.MapGet("/api/system/status", GetStatusAsync)
            .WithName("GetSystemStatus")
            .WithSummary("Trạng thái API và kết nối database")
            .Produces<SystemStatusResponse>();
        return routes;
    }

    internal static async Task<SystemStatusResponse> GetStatusAsync(
        AccountsDbContext db, TimeProvider clock, ILogger<SystemStatusResponse> logger, CancellationToken cancellationToken)
    {
        var checkedAt = clock.GetUtcNow();
        try
        {
            var pending = (await db.Database.GetPendingMigrationsAsync(cancellationToken)).Count();
            await db.Database.ExecuteSqlRawAsync("SELECT 1", cancellationToken);
            return new SystemStatusResponse("ok", "ok", pending, checkedAt);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            LogDatabaseUnavailable(logger, ex);
            return new SystemStatusResponse("ok", "unavailable", null, checkedAt);
        }
    }

    [LoggerMessage(Level = LogLevel.Warning, Message = "Database check failed for /api/system/status")]
    private static partial void LogDatabaseUnavailable(ILogger logger, Exception exception);
}

/// <param name="Api">Always "ok" when the API answers.</param>
/// <param name="Database">"ok" or "unavailable".</param>
/// <param name="PendingMigrations">Number of migrations not yet applied; null when the database is unavailable.</param>
/// <param name="CheckedAt">UTC time of the check.</param>
public sealed record SystemStatusResponse(string Api, string Database, int? PendingMigrations, DateTimeOffset CheckedAt);
