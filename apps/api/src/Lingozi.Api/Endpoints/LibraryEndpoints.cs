using System.Security.Claims;
using Lingozi.Library.Items;

namespace Lingozi.Api.Endpoints;

/// <summary>Endpoints of FEAT-02. US-LIB-01 adds create; list and detail are the minimum reads the web app needs to show what was saved.</summary>
internal static class LibraryEndpoints
{
    public static IEndpointRouteBuilder MapLibraryEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/library").RequireAuthorization();

        group.MapPost("/items", CreateAsync)
            .AddEndpointFilter<ValidateAntiforgeryFilter>()
            .WithName("CreateKnowledgeItem")
            .WithSummary("Lưu một từ vựng hoặc một cấu trúc ngữ pháp (FR-LIB-ITEM-001)")
            .Produces<ItemDetail>(StatusCodes.Status201Created)
            .Produces<ItemDetail>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);

        group.MapGet("/items", ListAsync)
            .WithName("ListKnowledgeItems")
            .WithSummary("Liệt kê mục của một thư viện, mới nhất trước (FR-LIB-ITEM-003)")
            .Produces<ItemPage>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapPut("/items/{id}", UpdateAsync)
            .AddEndpointFilter<ValidateAntiforgeryFilter>()
            .WithName("UpdateKnowledgeItem")
            .WithSummary("Sửa mục và ví dụ; version phải là bản hiện tại (FR-LIB-ITEM-005)")
            .Produces<ItemDetail>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        group.MapDelete("/items/{id}", DeleteAsync)
            .AddEndpointFilter<ValidateAntiforgeryFilter>()
            .WithName("DeleteKnowledgeItem")
            .WithSummary("Xóa cứng mục và ví dụ của chính người dùng (FR-LIB-ITEM-006)")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapGet("/items/similar", SimilarAsync)
            .WithName("FindSimilarKnowledgeItems")
            .WithSummary("Mục cùng loại có cùng nội dung chuẩn hóa của chính người dùng; chỉ gợi ý (FR-LIB-ITEM-002)")
            .Produces<SimilarItemsResponse>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        group.MapGet("/items/{id}", GetAsync)
            .WithName("GetKnowledgeItem")
            .WithSummary("Chi tiết một mục của chính người dùng (FR-LIB-ITEM-004)")
            .Produces<ItemDetail>()
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status401Unauthorized);
        return routes;
    }

    /// <summary>The signed-in user's id from the session cookie. The body is never trusted for it (BR-LIB-006).</summary>
    private static Guid CurrentUserId(HttpContext context) =>
        Guid.Parse(context.User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    internal static async Task<IResult> CreateAsync(
        KnowledgeItemInput? body, KnowledgeItemService service, HttpContext context, CancellationToken cancellationToken)
    {
        var result = await service.CreateAsync(CurrentUserId(context), body, cancellationToken);
        return result.Outcome switch
        {
            CreateItemOutcome.Created => TypedResults.Created($"/api/library/items/{result.Item!.Id}", result.Item),
            CreateItemOutcome.Existing => TypedResults.Ok(result.Item),
            CreateItemOutcome.LimitReached => LibraryProblems.LimitReached(),
            _ => LibraryProblems.Invalid(result.Errors!),
        };
    }

    internal static async Task<IResult> ListAsync(
        string? kind, int? page, int? pageSize, KnowledgeItemService service, HttpContext context, CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string>();
        if (!ItemRules.TryParseKind(kind, out var parsedKind))
        {
            errors["kind"] = string.IsNullOrEmpty(kind) ? "required" : "invalid";
        }

        if (!KnowledgeItemService.TryNormalizePaging(page, pageSize, out var normalizedPage, out var normalizedPageSize))
        {
            errors[(page ?? 1) < 1 ? "page" : "pageSize"] = "invalid";
        }

        if (errors.Count > 0)
        {
            return LibraryProblems.Invalid(errors);
        }

        return TypedResults.Ok(await service.ListAsync(CurrentUserId(context), parsedKind, normalizedPage, normalizedPageSize, cancellationToken));
    }

    internal static async Task<IResult> UpdateAsync(
        string id, KnowledgeItemInput? body, KnowledgeItemService service, HttpContext context, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var itemId))
        {
            return LibraryProblems.NotFound();
        }

        var result = await service.UpdateAsync(CurrentUserId(context), itemId, body, cancellationToken);
        return result.Outcome switch
        {
            UpdateItemOutcome.Updated => TypedResults.Ok(result.Item),
            UpdateItemOutcome.Conflict => LibraryProblems.Conflict(result.Item!),
            UpdateItemOutcome.NotFound => LibraryProblems.NotFound(),
            _ => LibraryProblems.Invalid(result.Errors!),
        };
    }

    internal static async Task<IResult> DeleteAsync(string id, KnowledgeItemService service, HttpContext context, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(id, out var itemId))
        {
            return LibraryProblems.NotFound();
        }

        var deleted = await service.DeleteAsync(CurrentUserId(context), itemId, cancellationToken);
        return deleted ? TypedResults.NoContent() : LibraryProblems.NotFound();
    }

    internal static async Task<IResult> SimilarAsync(
        string? kind, string? term, KnowledgeItemService service, HttpContext context, CancellationToken cancellationToken)
    {
        var errors = new Dictionary<string, string>();
        if (!ItemRules.TryParseKind(kind, out var parsedKind))
        {
            errors["kind"] = string.IsNullOrEmpty(kind) ? "required" : "invalid";
        }

        if (term is not null && term.Length > ItemRules.TermMax)
        {
            errors["term"] = "too-long";
        }

        if (errors.Count > 0)
        {
            return LibraryProblems.Invalid(errors);
        }

        return TypedResults.Ok(await service.FindSimilarAsync(CurrentUserId(context), parsedKind, term, cancellationToken));
    }

    internal static async Task<IResult> GetAsync(string id, KnowledgeItemService service, HttpContext context, CancellationToken cancellationToken)
    {
        // A malformed id is treated like a missing item, with the same body (US-LIB-04 AC-02).
        if (!Guid.TryParse(id, out var itemId))
        {
            return LibraryProblems.NotFound();
        }

        var item = await service.GetAsync(CurrentUserId(context), itemId, cancellationToken);
        return item is null ? LibraryProblems.NotFound() : TypedResults.Ok(item);
    }
}

/// <summary>Problem Details (RFC 9457) responses with an <c>ERR-LIB-*</c> code, as in the SRS error matrix (ADR 0002).</summary>
internal static class LibraryProblems
{
    private static IResult Create(int status, string title, string code, IDictionary<string, object?>? extra = null)
    {
        var extensions = extra is null ? new Dictionary<string, object?>() : new Dictionary<string, object?>(extra);
        extensions["code"] = code;
        return Results.Problem(type: "about:blank", title: title, statusCode: status, extensions: extensions);
    }

    /// <summary>ERR-LIB-400-02 when the only problem is the IPA characters; ERR-LIB-400-01 otherwise. <c>errors</c> maps each field to a reason code.</summary>
    public static IResult Invalid(IReadOnlyDictionary<string, string> errors)
    {
        var onlyIpaCharacters = errors.Count == 1 && errors.TryGetValue("ipa", out var reason) && reason is "invalid-characters" or "too-long";
        return Create(
            StatusCodes.Status400BadRequest,
            "Bad Request",
            onlyIpaCharacters ? "ERR-LIB-400-02" : "ERR-LIB-400-01",
            new Dictionary<string, object?> { ["errors"] = errors });
    }

    /// <summary>ERR-LIB-409-01 with the current state, so the form can show the latest version (BR-LIB-007).</summary>
    public static IResult Conflict(ItemDetail current) =>
        Create(StatusCodes.Status409Conflict, "Conflict", "ERR-LIB-409-01", new Dictionary<string, object?> { ["current"] = current });

    public static IResult NotFound() => Create(StatusCodes.Status404NotFound, "Not Found", "ERR-LIB-404-01");

    public static IResult LimitReached() => Create(StatusCodes.Status422UnprocessableEntity, "Unprocessable Entity", "ERR-LIB-422-01");
}
