using System.Data;
using System.Security.Cryptography;
using System.Text;
using Lingozi.Library.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Library.Items;

/// <summary>Per-user application lock inside the current transaction, so two creates of one user cannot both pass the limit check or the idempotency check (BR-LIB-005, BR-LIB-008).</summary>
internal static class UserLock
{
    public static async Task AcquireAsync(LibraryDbContext db, Guid userId, CancellationToken cancellationToken)
    {
        var resource = "library-items:" + Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(userId.ToString("N"))));
        var result = new SqlParameter("@result", SqlDbType.Int) { Direction = ParameterDirection.Output };
        await db.Database.ExecuteSqlRawAsync(
            "EXEC @result = sp_getapplock @Resource = @resource, @LockMode = 'Exclusive', @LockOwner = 'Transaction', @LockTimeout = 5000",
            [result, new SqlParameter("@resource", resource)],
            cancellationToken);
        if ((int)result.Value! < 0)
        {
            throw new InvalidOperationException("Could not obtain the per-user library lock.");
        }
    }
}
