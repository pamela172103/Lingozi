using System.Data;
using System.Security.Cryptography;
using System.Text;
using Lingozi.Accounts.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Accounts.Authentication;

/// <summary>Per-email application lock inside the current transaction, so concurrent requests for one email cannot race (BR-AUTH-009).</summary>
internal static class EmailLock
{
    public static async Task AcquireAsync(AccountsDbContext db, string normalizedEmail, CancellationToken cancellationToken)
    {
        var resource = "login-code:" + Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(normalizedEmail)));
        var result = new SqlParameter("@result", SqlDbType.Int) { Direction = ParameterDirection.Output };
        await db.Database.ExecuteSqlRawAsync(
            "EXEC @result = sp_getapplock @Resource = @resource, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 5000",
            [result, new SqlParameter("@resource", resource)],
            cancellationToken);
        if ((int)result.Value! < 0)
        {
            throw new InvalidOperationException("Could not obtain the per-email lock.");
        }
    }
}
