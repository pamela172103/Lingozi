using Lingozi.Accounts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Accounts.Authentication;

public enum LoginCodeVerifyOutcome
{
    /// <summary>The code is correct: the account exists or was created, and the session may start.</summary>
    Succeeded,

    /// <summary>ERR-AUTH-400-01.</summary>
    InvalidEmail,

    /// <summary>Wrong code, fewer than 5 attempts so far: ERR-AUTH-401-01.</summary>
    Mismatch,

    /// <summary>The fifth wrong attempt invalidated the code: ERR-AUTH-403-02.</summary>
    Locked,

    /// <summary>No usable code: expired, used, or replaced by a newer code: ERR-AUTH-400-03.</summary>
    Unavailable,
}

public sealed record LoginCodeVerifyResult(LoginCodeVerifyOutcome Outcome, string? Email = null, Guid? UserId = null, int RemainingAttempts = 0);

/// <summary>
/// FR-AUTH-CODE-002: checks the newest usable code of an email, counts wrong attempts (BR-AUTH-002), and on success
/// marks the code consumed and finds or creates the account (BR-AUTH-003). All steps run in one transaction under the per-email lock.
/// </summary>
public sealed class LoginCodeVerifier(AccountsDbContext db, LoginCodeHasher hasher, TimeProvider clock)
{
    public const int MaxAttempts = 5;

    public async Task<LoginCodeVerifyResult> VerifyAsync(string? email, string? code, CancellationToken cancellationToken)
    {
        if (!EmailAddressNormalizer.TryNormalize(email, out var normalized))
        {
            return new LoginCodeVerifyResult(LoginCodeVerifyOutcome.InvalidEmail);
        }

        var strategy = db.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async ct =>
        {
            db.ChangeTracker.Clear();
            await using var transaction = await db.Database.BeginTransactionAsync(ct);
            await EmailLock.AcquireAsync(db, normalized, ct);

            var now = clock.GetUtcNow().UtcDateTime;
            // Codes of this email from the last hour (rate limits allow at most 5 per hour, BR-AUTH-009).
            var recent = await db.EmailLoginCodes
                .Where(c => c.Email == normalized && c.CreatedAt > now.AddHours(-1))
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync(ct);
            var active = recent.FirstOrDefault(c => c.ConsumedAt == null && c.InvalidatedAt == null && c.ExpiresAt > now);

            if (active is null)
            {
                await transaction.CommitAsync(ct);
                return new LoginCodeVerifyResult(LoginCodeVerifyOutcome.Unavailable);
            }

            // A code that was replaced, used, or expired is reported as unavailable (AC-06, AC-07), not as a wrong attempt on the current code.
            if (code is not null && !hasher.Verify(normalized, code, active.CodeHmac)
                && recent.Any(c => c != active && hasher.Verify(normalized, code, c.CodeHmac)))
            {
                await transaction.CommitAsync(ct);
                return new LoginCodeVerifyResult(LoginCodeVerifyOutcome.Unavailable);
            }

            if (code is not null && hasher.Verify(normalized, code, active.CodeHmac))
            {
                active.ConsumedAt = now;
                var user = await db.Users.FirstOrDefaultAsync(u => u.NormalizedEmail == normalized, ct);
                if (user is null)
                {
                    user = new User
                    {
                        Email = normalized,
                        NormalizedEmail = normalized,
                        EmailConfirmed = true,
                        SecurityStamp = Guid.NewGuid().ToString("N"),
                        CreatedAt = now,
                    };
                    db.Users.Add(user);
                }

                await db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
                return new LoginCodeVerifyResult(LoginCodeVerifyOutcome.Succeeded, normalized, user.Id);
            }

            active.Attempts++;
            if (active.Attempts >= MaxAttempts)
            {
                active.InvalidatedAt = now;
                await db.SaveChangesAsync(ct);
                await transaction.CommitAsync(ct);
                return new LoginCodeVerifyResult(LoginCodeVerifyOutcome.Locked);
            }

            await db.SaveChangesAsync(ct);
            await transaction.CommitAsync(ct);
            return new LoginCodeVerifyResult(LoginCodeVerifyOutcome.Mismatch, RemainingAttempts: MaxAttempts - active.Attempts);
        }, cancellationToken);
    }
}
