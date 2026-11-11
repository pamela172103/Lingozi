using Lingozi.Library.Items;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Library.Persistence;

/// <summary>
/// Persistence for the Library module (schema <c>library</c>, ADR 0001 / ERD §3.2). The foreign key from
/// <c>KnowledgeItems.UserId</c> to <c>accounts.Users</c> is created by SQL in the migration, because <c>Users</c> belongs to another DbContext (ERD §1).
/// </summary>
public sealed class LibraryDbContext(DbContextOptions<LibraryDbContext> options) : DbContext(options)
{
    public const string Schema = "library";

    public DbSet<KnowledgeItem> Items => Set<KnowledgeItem>();

    public DbSet<ItemExample> Examples => Set<ItemExample>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);
        modelBuilder.HasDefaultSchema(Schema);

        modelBuilder.Entity<KnowledgeItem>(entity =>
        {
            entity.ToTable("KnowledgeItems", table =>
            {
                table.HasCheckConstraint("CK_KnowledgeItems_Kind", "[Kind] IN (1, 5)");
                table.HasCheckConstraint("CK_KnowledgeItems_IpaSource", "[IpaSource] IS NULL OR [IpaSource] IN (1, 2)");
                table.HasCheckConstraint("CK_KnowledgeItems_IpaSource_Ipa", "([Ipa] IS NULL AND [IpaSource] IS NULL) OR ([Ipa] IS NOT NULL AND [IpaSource] IS NOT NULL)");
                // BR-LIB-001/012: a word needs its meaning and has no formula; grammar needs its formula, and has no part of speech or IPA.
                table.HasCheckConstraint(
                    "CK_KnowledgeItems_FieldsByKind",
                    "([Kind] = 1 AND [Meaning] IS NOT NULL AND [Formula] IS NULL) OR ([Kind] = 5 AND [Formula] IS NOT NULL AND [PartOfSpeech] IS NULL AND [Ipa] IS NULL)");
            });
            entity.HasKey(e => e.Id);
            entity.HasAlternateKey(e => new { e.Id, e.UserId });
            entity.Property(e => e.Kind).HasConversion<byte>();
            entity.Property(e => e.Term).HasMaxLength(ItemRules.TermMax).IsRequired();
            entity.Property(e => e.NormalizedTerm).HasMaxLength(ItemRules.TermMax).IsRequired();
            entity.Property(e => e.NormalizedTermHash)
                .HasColumnType("varbinary(32)")
                .HasComputedColumnSql("CONVERT(varbinary(32), HASHBYTES('SHA2_256', [NormalizedTerm]))", stored: true);
            entity.Property(e => e.Meaning).HasMaxLength(ItemRules.MeaningMax);
            entity.Property(e => e.Formula).HasMaxLength(ItemRules.FormulaMax);
            entity.Property(e => e.PartOfSpeech).HasMaxLength(30);
            entity.Property(e => e.Ipa).HasMaxLength(ItemRules.IpaMax);
            entity.Property(e => e.IpaSource).HasConversion<byte?>();
            entity.Property(e => e.Note).HasMaxLength(ItemRules.NoteMax);
            entity.Property(e => e.SearchText).HasColumnType("nvarchar(max)").IsRequired();
            entity.Property(e => e.CreatedAt).HasColumnType("datetime2(3)");
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime2(3)");
            entity.Property(e => e.RowVersion).IsRowVersion();
            entity.HasIndex(e => new { e.UserId, e.CreatedAt }).IsDescending(false, true);
            entity.HasIndex(e => new { e.UserId, e.Kind, e.CreatedAt }).IsDescending(false, false, true);
            entity.HasIndex(e => new { e.UserId, e.Kind, e.NormalizedTermHash });
            entity.HasIndex(e => new { e.UserId, e.ClientRequestId }).IsUnique().HasFilter("[ClientRequestId] IS NOT NULL");
        });

        modelBuilder.Entity<ItemExample>(entity =>
        {
            entity.ToTable("ItemExamples");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Text).HasMaxLength(ItemRules.ExampleTextMax).IsRequired();
            entity.Property(e => e.Translation).HasMaxLength(ItemRules.ExampleTranslationMax);
            entity.HasOne<KnowledgeItem>()
                .WithMany(i => i.Examples)
                .HasForeignKey(e => new { e.ItemId, e.UserId })
                .HasPrincipalKey(i => new { i.Id, i.UserId })
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.ItemId, e.SortOrder }).IsUnique();
        });
    }
}
