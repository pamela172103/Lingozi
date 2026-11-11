using Lingozi.Library.Items;
using Lingozi.Library.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Lingozi.Library;

public static class LibraryModule
{
    /// <summary>Registers the Library module (schema <c>library</c>).</summary>
    public static IServiceCollection AddLibraryModule(this IServiceCollection services, string connectionString)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);

        services.AddDbContext<LibraryDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
            {
                sql.MigrationsHistoryTable("__EFMigrationsHistory", LibraryDbContext.Schema);
                sql.EnableRetryOnFailure(maxRetryCount: 3);
            }));
        services.AddScoped<KnowledgeItemService>();
        return services;
    }
}
