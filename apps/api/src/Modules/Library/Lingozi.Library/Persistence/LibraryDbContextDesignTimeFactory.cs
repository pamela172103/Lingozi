using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Lingozi.Library.Persistence;

/// <summary>Used only by <c>dotnet ef</c> to build the model for migrations; it never opens a connection.</summary>
internal sealed class LibraryDbContextDesignTimeFactory : IDesignTimeDbContextFactory<LibraryDbContext>
{
    public LibraryDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<LibraryDbContext>()
            .UseSqlServer("Server=design-time;Database=Lingozi;TrustServerCertificate=true", sql =>
                sql.MigrationsHistoryTable("__EFMigrationsHistory", LibraryDbContext.Schema))
            .Options;
        return new LibraryDbContext(options);
    }
}
