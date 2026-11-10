using System.Threading.RateLimiting;
using Lingozi.Accounts.Authentication;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;

namespace Lingozi.Api.Endpoints;

/// <summary>Sign-in endpoints of FEAT-01. This story (US-AUTH-01) adds antiforgery and "request email code".</summary>
internal static partial class AuthEndpoints
{
    public const string RequestCodePolicy = "auth-request-code";
    private const string XsrfCookie = "XSRF-TOKEN";

    public static IServiceCollection AddAuthRateLimiting(this IServiceCollection services) =>
        services.AddRateLimiter(options =>
        {
            options.OnRejected = async (context, cancellationToken) =>
            {
                var seconds = context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retry)
                    ? Math.Max(1, (int)Math.Ceiling(retry.TotalSeconds))
                    : 60;
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILoggerFactory>().CreateLogger("Lingozi.Api.RateLimiting");
                LogRateLimited(logger, RequestCodePolicy);
                await AuthProblems.TooManyRequests(seconds, context.HttpContext.Response).ExecuteAsync(context.HttpContext);
            };

            // BR-AUTH-013: sign-in code requests per IP address (configurable, default 10 per 10 minutes).
            options.AddPolicy(RequestCodePolicy, context =>
            {
                var limit = context.RequestServices.GetRequiredService<IOptions<AuthOptions>>().Value.RequestCodePerIpPer10Minutes;
                return RateLimitPartition.GetSlidingWindowLimiter(
                    context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                    _ => new SlidingWindowRateLimiterOptions
                    {
                        PermitLimit = limit,
                        Window = TimeSpan.FromMinutes(10),
                        SegmentsPerWindow = 10,
                        QueueLimit = 0,
                    });
            });
        });

    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth");

        group.MapGet("/antiforgery", GetAntiforgery)
            .WithName("GetAntiforgeryToken")
            .WithSummary("Cấp token antiforgery: đặt cookie XSRF-TOKEN để gửi lại ở header X-XSRF-TOKEN")
            .Produces(StatusCodes.Status204NoContent);

        group.MapPost("/email-code/request", RequestEmailCodeAsync)
            .AddEndpointFilter<ValidateAntiforgeryFilter>()
            .RequireRateLimiting(RequestCodePolicy)
            .WithName("RequestEmailCode")
            .WithSummary("Gửi mã đăng nhập 6 số tới email (FR-AUTH-CODE-001)")
            .Produces<RequestEmailCodeResponse>(StatusCodes.Status202Accepted)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
        return routes;
    }

    internal static NoContent GetAntiforgery(HttpContext context, IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(context);
        context.Response.Cookies.Append(XsrfCookie, tokens.RequestToken!, new CookieOptions
        {
            HttpOnly = false, // the web app reads it and echoes it in X-XSRF-TOKEN
            SameSite = SameSiteMode.Strict,
            Secure = context.Request.IsHttps,
            Path = "/",
        });
        context.Response.Headers.CacheControl = "no-store";
        return TypedResults.NoContent();
    }

    internal static async Task<IResult> RequestEmailCodeAsync(
        RequestEmailCodeRequest? body,
        LoginCodeRequestService service,
        HttpContext context,
        ILogger<RequestEmailCodeRequest> logger,
        CancellationToken cancellationToken)
    {
        var result = await service.RequestAsync(body?.Email, cancellationToken);
        switch (result.Outcome)
        {
            case LoginCodeRequestOutcome.InvalidEmail:
                LogInvalidEmail(logger);
                return AuthProblems.InvalidEmail();
            case LoginCodeRequestOutcome.RateLimited:
                LogRateLimited(logger, "email-code");
                return AuthProblems.TooManyRequests(result.RetryAfterSeconds, context.Response);
            default:
                // Same body whether or not the email already has an account (BR-AUTH-007).
                return TypedResults.Json(
                    new RequestEmailCodeResponse("check-email", LoginCodeRequestResult.ResendAfterSeconds),
                    statusCode: StatusCodes.Status202Accepted);
        }
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Validation failed: email")]
    private static partial void LogInvalidEmail(ILogger logger);

    [LoggerMessage(Level = LogLevel.Information, Message = "Rate limited: policy {Policy}")]
    private static partial void LogRateLimited(ILogger logger, string policy);
}

/// <param name="Email">Address that should receive the code.</param>
public sealed record RequestEmailCodeRequest(string? Email);

/// <param name="Status">Always <c>check-email</c>.</param>
/// <param name="ResendAfterSeconds">Seconds before the next code may be requested.</param>
public sealed record RequestEmailCodeResponse(string Status, int ResendAfterSeconds);
