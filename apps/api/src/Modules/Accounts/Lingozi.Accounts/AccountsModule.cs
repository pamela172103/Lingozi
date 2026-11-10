using Lingozi.Accounts.Authentication;
using Lingozi.Accounts.Email;
using Lingozi.Accounts.Persistence;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Lingozi.Accounts;

public static class AccountsModule
{
    /// <summary>Registers the Accounts module persistence and the persistent Data Protection key ring (ADR 0006).</summary>
    public static IServiceCollection AddAccountsModule(
        this IServiceCollection services, string connectionString, IConfiguration configuration)
    {
        ArgumentNullException.ThrowIfNull(configuration);
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

        services.AddOptions<AuthOptions>().Bind(configuration.GetSection(AuthOptions.SectionName))
            .ValidateDataAnnotations().Validate(o => TryKey(o), "Auth:LoginCodeHmacKey must be base64 of at least 32 bytes.").ValidateOnStart();
        services.AddOptions<EmailOptions>().Bind(configuration.GetSection(EmailOptions.SectionName)).ValidateDataAnnotations().ValidateOnStart();

        services.AddSingleton<LoginCodeHasher>();
        services.AddSingleton<EmailOutboxPayload>();
        services.AddScoped<LoginCodeRequestService>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        services.AddScoped<EmailOutboxDispatcher>();
        services.AddHostedService<EmailOutboxWorker>();

        return services;
    }

    private static bool TryKey(AuthOptions options)
    {
        try
        {
            _ = options.GetKeyBytes();
            return true;
        }
        catch (InvalidOperationException)
        {
            return false;
        }
    }
}
