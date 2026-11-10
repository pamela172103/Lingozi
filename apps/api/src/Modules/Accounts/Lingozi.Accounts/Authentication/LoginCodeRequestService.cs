using System.Security.Cryptography;
using System.Text;
using Lingozi.Accounts.Email;
using Lingozi.Accounts.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace Lingozi.Accounts.Authentication;

public enum LoginCodeRequestOutcome
{
    /// <summary>A code was stored and the email queued.</summary>
    Accepted,

    /// <summary>ERR-AUTH-400-01.</summary>
    InvalidEmail,

    /// <summary>ERR-AUTH-429-01 (BR-AUTH-009).</summary>
    RateLimited,
}

public sealed record LoginCodeRequestResult(LoginCodeRequestOutcome Outcome, int RetryAfterSeconds = 0)
{
    public const int ResendAfterSeconds = 60;
}

/// <summary>
/// FR-AUTH-CODE-001: stores the HMAC of a new 6-digit code and queues the email in one transaction.
/// Gives the same result whether or not the email has an account (BR-AUTH-007).
/// </summary>
public sealed class LoginCodeRequestService(
    AccountsDbContext db, LoginCodeHasher hasher, EmailOutboxPayload payloads, TimeProvider clock)
{
    public const int CodeValidityMinutes = 10;
    public const int MaxCodesPerHour = 5;
    private static readonly TimeSpan MinimumGap = TimeSpan.FromSeconds(LoginCodeRequestResult.ResendAfterSeconds);

    public async Task<LoginCodeRequestResult> RequestAsync(string? email, CancellationToken cancellationToken)
    {
        if (!EmailAddressNormalizer.TryNormalize(email, out var normalized))
        {
            return new LoginCodeRequestResult(LoginCodeRequestOutcome.InvalidEmail);
        }

        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async ct =>
        {
            db.ChangeTracker.Clear();
            await using var transaction = await db.Database.BeginTransactionAsync(ct);
            await LockEmailAsync(normalized, ct);

            var now = clock.GetUtcNow().UtcDateTime;
            var recent = await db.EmailLoginCodes
                .Where(c => c.Email == normalized && c.CreatedAt > now.AddHours(-1))
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => c.CreatedAt)
                .ToListAsync(ct);

            var wait = RetryAfterSeconds(recent, now);
            if (wait > 0)
            {
                return new LoginCodeRequestResult(LoginCodeRequestOutcome.RateLimited, wait);
            }

            await db.EmailLoginCodes
                .Where(c => c.Email == normalized && c.ConsumedAt == null && c.InvalidatedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.InvalidatedAt, now), ct);

            var code = LoginCodeHasher.GenerateCode();
            db.EmailLoginCodes.Add(new EmailLoginCode
            {
                Email = normalized,
                CodeHmac = hasher.Hash(normalized, code),
                ExpiresAt = now.AddMinutes(CodeValidityMinutes),
                CreatedAt = now,
            });
            db.EmailOutbox.Add(new EmailOutboxMessage
            {
                Type = EmailOutboxType.LoginCode,
                ToAddress = normalized,
                PayloadJson = payloads.Seal(new LoginCodePayload(code, CodeValidityMinutes)),
                Status = EmailOutboxStatus.Pending,
                NextAttemptAt = now,
                CreatedAt = now,
            });
            await db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            return new LoginCodeRequestResult(LoginCodeRequestOutcome.Accepted);
        }, cancellationToken);
    }

    /// <summary>BR-AUTH-009: at most 1 code per 60 seconds and 5 per hour for one email. Zero means a code may be sent.</summary>
    internal static int RetryAfterSeconds(IReadOnlyList<DateTime> createdNewestFirst, DateTime now)
    {
        if (createdNewestFirst.Count == 0)
        {
            return 0;
        }

        var sinceLast = now - createdNewestFirst[0];
        if (sinceLast < MinimumGap)
        {
            return (int)Math.Ceiling((MinimumGap - sinceLast).TotalSeconds);
        }

        if (createdNewestFirst.Count >= MaxCodesPerHour)
        {
            var frees = createdNewestFirst[^1].AddHours(1) - now;
            return Math.Max(1, (int)Math.Ceiling(frees.TotalSeconds));
        }

        return 0;
    }

    /// <summary>Serializes concurrent requests for one email so the limits cannot be bypassed in a race.</summary>
    private async Task LockEmailAsync(string normalizedEmail, CancellationToken cancellationToken)
    {
        var resource = "login-code:" + Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(normalizedEmail)));
        var result = new SqlParameter("@result", SqlDbType.Int) { Direction = ParameterDirection.Output };
        await db.Database.ExecuteSqlRawAsync(
            "EXEC @result = sp_getapplock @Resource = @resource, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 5000",
            [result, new SqlParameter("@resource", resource)],
            cancellationToken);
        if ((int)result.Value < 0)
        {
            throw new InvalidOperationException("Could not obtain the per-email lock.");
        }
    }
}
