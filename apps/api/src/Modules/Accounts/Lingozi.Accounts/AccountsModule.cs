using Lingozi.Accounts.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Lingozi.Accounts;

public static class AccountsModule
{
    /// <summary>Registers the Accounts module persistence and the persistent Data Protection key ring (ADR 0006).</summary>
    public static IServiceCollection AddAccountsModule(this IServiceCollection services, string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        services.AddDbContext<AccountsDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
            {
                sql.MigrationsHistoryTable("__EFMigrationsHistory", AccountsDbContext.Schema);
                sql.EnableRetryOnFailure(maxRetryCount: 3);
            }));

        services.AddDataProtection()
            .SetApplicationName("Lingozi")
            .PersistKeysToDbContext<AccountsDbContext>();

        return services;
    }
}
