using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Accounts.Persistence;

/// <summary>
/// Persistence for the Accounts module (schema <c>accounts</c>, ADR 0001 / ERD §3.1).
/// Round 0 only holds the Data Protection key ring; Identity tables arrive with FEAT-01.
/// </summary>
public sealed class AccountsDbContext(DbContextOptions<AccountsDbContext> options)
    : DbContext(options), IDataProtectionKeyContext
{
    public const string Schema = "accounts";

    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.Entity<DataProtectionKey>().ToTable("DataProtectionKeys");
    }
}
