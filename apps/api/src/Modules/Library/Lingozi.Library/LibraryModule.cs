using Lingozi.Library.Items;
using Lingozi.Library.Persistence;
using Lingozi.Library.Suggestions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Lingozi.Library;

public static class LibraryModule
{
    /// <summary>Registers the Library module (schema <c>library</c>) and the word source chosen by <c>Pronunciation:Provider</c>.</summary>
    public static IServiceCollection AddLibraryModule(this IServiceCollection services, string connectionString, IConfiguration configuration)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(connectionString);
        ArgumentNullException.ThrowIfNull(configuration);

        services.AddDbContext<LibraryDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
            {
                sql.MigrationsHistoryTable("__EFMigrationsHistory", LibraryDbContext.Schema);
                sql.EnableRetryOnFailure(maxRetryCount: 3);
            }));

        services.AddOptions<PronunciationOptions>()
            .Bind(configuration.GetSection(PronunciationOptions.SectionName))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddHttpClient<DictionaryApiProvider>((sp, client) =>
        {
            client.BaseAddress = new Uri(sp.GetRequiredService<IOptions<PronunciationOptions>>().Value.DictionaryApiBaseUrl);
            client.Timeout = PronunciationOptions.Timeout;
        });
        services.AddHttpClient<ScandictProvider>(client => client.Timeout = PronunciationOptions.Timeout)
            .ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler { AllowAutoRedirect = false });
        services.AddScoped<IWordReferenceProvider>(sp =>
            sp.GetRequiredService<IOptions<PronunciationOptions>>().Value.Provider switch
            {
                "dictionaryapi" => sp.GetRequiredService<DictionaryApiProvider>(),
                "scandict" => sp.GetRequiredService<ScandictProvider>(),
                _ => new NoWordReferenceProvider(),
            });

        services.AddScoped<KnowledgeItemService>();
        services.AddScoped<SuggestionService>();
        return services;
    }
}
