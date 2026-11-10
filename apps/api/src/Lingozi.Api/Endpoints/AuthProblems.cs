using Microsoft.AspNetCore.Antiforgery;

namespace Lingozi.Api.Endpoints;

/// <summary>Problem Details (RFC 9457) responses with an <c>ERR-AUTH-*</c> code, as in the SRS error matrix (ADR 0002).</summary>
internal static class AuthProblems
{
    public static IResult Create(int status, string title, string code) =>
        Results.Problem(
            type: "about:blank",
            title: title,
            statusCode: status,
            extensions: new Dictionary<string, object?> { ["code"] = code });

    public static IResult InvalidEmail() => Create(StatusCodes.Status400BadRequest, "Bad Request", "ERR-AUTH-400-01");

    public static IResult BadAntiforgery() => Create(StatusCodes.Status400BadRequest, "Bad Request", "ERR-AUTH-400-05");

    public static IResult TooManyRequests(int retryAfterSeconds, HttpResponse response)
    {
        response.Headers.RetryAfter = retryAfterSeconds.ToString(System.Globalization.CultureInfo.InvariantCulture);
        return Create(StatusCodes.Status429TooManyRequests, "Too Many Requests", "ERR-AUTH-429-01");
    }
}

/// <summary>Rejects state-changing requests without a valid <c>X-XSRF-TOKEN</c> header (ERR-AUTH-400-05).</summary>
internal sealed partial class ValidateAntiforgeryFilter(IAntiforgery antiforgery, ILogger<ValidateAntiforgeryFilter> logger) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        ArgumentNullException.ThrowIfNull(context);
        ArgumentNullException.ThrowIfNull(next);
        try
        {
            await antiforgery.ValidateRequestAsync(context.HttpContext);
        }
        catch (AntiforgeryValidationException)
        {
            LogRejected(logger);
            return AuthProblems.BadAntiforgery();
        }

        return await next(context);
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Antiforgery validation failed")]
    private static partial void LogRejected(ILogger logger);
}
