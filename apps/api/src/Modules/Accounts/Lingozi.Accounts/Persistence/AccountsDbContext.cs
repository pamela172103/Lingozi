using Lingozi.Accounts.Authentication;
using Lingozi.Accounts.Email;
using Microsoft.AspNetCore.DataProtection.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Accounts.Persistence;

/// <summary>
/// Persistence for the Accounts module (schema <c>accounts</c>, ADR 0001 / ERD §3.1).
/// Holds the Data Protection key ring and the email-code sign-in tables of FEAT-01; Identity tables arrive with US-AUTH-02.
/// </summary>
public sealed class AccountsDbContext(DbContextOptions<AccountsDbContext> options)
    : DbContext(options), IDataProtectionKeyContext
{
    public const string Schema = "accounts";

    public DbSet<DataProtectionKey> DataProtectionKeys => Set<DataProtectionKey>();

    public DbSet<EmailLoginCode> EmailLoginCodes => Set<EmailLoginCode>();

    public DbSet<EmailOutboxMessage> EmailOutbox => Set<EmailOutboxMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);
        modelBuilder.Entity<DataProtectionKey>().ToTable("DataProtectionKeys");

        modelBuilder.Entity<EmailLoginCode>(entity =>
        {
            entity.ToTable("EmailLoginCodes", table =>
                table.HasCheckConstraint("CK_EmailLoginCodes_Attempts", "[Attempts] <= 5"));
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).HasMaxLength(256).IsRequired();
            entity.Property(e => e.CodeHmac).HasColumnType("varbinary(32)").IsRequired();
            entity.Property(e => e.ExpiresAt).HasColumnType("datetime2(3)");
            entity.Property(e => e.ConsumedAt).HasColumnType("datetime2(3)");
            entity.Property(e => e.InvalidatedAt).HasColumnType("datetime2(3)");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime2(3)");
            entity.HasIndex(e => new { e.Email, e.CreatedAt }).IsDescending(false, true);
        });

        modelBuilder.Entity<EmailOutboxMessage>(entity =>
        {
            entity.ToTable("EmailOutbox", table =>
            {
                table.HasCheckConstraint("CK_EmailOutbox_Type", "[Type] = 3");
                table.HasCheckConstraint("CK_EmailOutbox_Status", "[Status] IN (0, 1, 2)");
                table.HasCheckConstraint("CK_EmailOutbox_Attempts", "[Attempts] <= 5");
                table.HasCheckConstraint("CK_EmailOutbox_PayloadJson", "ISJSON([PayloadJson]) = 1");
            });
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Type).HasConversion<byte>();
            entity.Property(e => e.Status).HasConversion<byte>();
            entity.Property(e => e.ToAddress).HasMaxLength(256).IsRequired();
            entity.Property(e => e.PayloadJson).HasMaxLength(4000).IsRequired();
            entity.Property(e => e.LastError).HasMaxLength(500);
            entity.Property(e => e.NextAttemptAt).HasColumnType("datetime2(3)");
            entity.Property(e => e.SentAt).HasColumnType("datetime2(3)");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime2(3)");
            entity.HasIndex(e => new { e.Status, e.NextAttemptAt });
        });
    }
}
