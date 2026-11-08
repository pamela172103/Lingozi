using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Lingozi.Accounts.Persistence;

/// <summary>
/// Used only by <c>dotnet ef</c> to build the model for migrations; it never opens a connection.
/// Commands that touch a real database (<c>database update</c>) must pass <c>--connection</c>.
/// </summary>
internal sealed class AccountsDbContextDesignTimeFactory : IDesignTimeDbContextFactory<AccountsDbContext>
{
    public AccountsDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<AccountsDbContext>()
            .UseSqlServer("Server=design-time;Database=Lingozi;TrustServerCertificate=true", sql =>
                sql.MigrationsHistoryTable("__EFMigrationsHistory", AccountsDbContext.Schema))
            .Options;
        return new AccountsDbContext(options);
    }
}
