using System.Net;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Api.IntegrationTests;

/// <summary>US-LIB-01: POST /api/library/items against real SQL Server (AC-02 to AC-11; TC-LIB-001 to 006, 034 to 037, 051).</summary>
[Collection(SqlServerApiFactory.CollectionName)]
public sealed class CreateKnowledgeItemTests(SqlServerApiFactory factory)
{
    private static string Long(int length) => new('a', length);

    // AC-02 (TC-LIB-001): a word with only Từ and Nghĩa.
    [Fact]
    public async Task WordWithTermAndMeaningIsCreatedAndOwnedByTheSignedInUser()
    {
        using var client = await SignedInClient.CreateAsync(factory);

        using var response = await client.PostItemAsync(LibraryTestExtensions.Word("  Give   UP ", " từ bỏ "));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.JsonAsync();
        var id = body.GetProperty("id").GetGuid();
        Assert.Equal($"/api/library/items/{id}", response.Headers.Location!.OriginalString);
        Assert.Equal("word", body.GetProperty("kind").GetString());
        Assert.Equal("Give   UP", body.GetProperty("term").GetString());
        Assert.Equal("từ bỏ", body.GetProperty("meaning").GetString());
        Assert.Equal(JsonValueKindOf.Null, body.GetProperty("partOfSpeech").ValueKind);
        Assert.False(string.IsNullOrEmpty(body.GetProperty("version").GetString()));

        await factory.WithLibraryAsync(async db =>
        {
            var row = await db.Items.SingleAsync(i => i.Id == id, TestContext.Current.CancellationToken);
            Assert.Equal(client.UserId, row.UserId);
            Assert.Equal("give up", row.NormalizedTerm);
            Assert.Null(row.Formula);
            Assert.Contains("tu bo", row.SearchText, StringComparison.Ordinal);
        });
    }

    // AC-02/AC-11/AC-07 (TC-LIB-002): every optional field is kept, examples in order.
    [Fact]
    public async Task WordKeepsPartOfSpeechIpaNoteAndExamplesInOrder()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = LibraryTestExtensions.Word();
        body["partOfSpeech"] = "Động từ";
        body["ipa"] = "/ɡɪv ʌp/";
        body["note"] = "Không dùng với tân ngữ là người";
        body["examples"] = new object[] { new { text = "Don't give up.", translation = "Đừng bỏ cuộc." }, new { text = "Never give up.", translation = (string?)null } };

        using var response = await client.PostItemAsync(body);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var detail = await response.JsonAsync();
        Assert.Equal("Động từ", detail.GetProperty("partOfSpeech").GetString());
        Assert.Equal("/ɡɪv ʌp/", detail.GetProperty("ipa").GetString());
        Assert.Equal("user", detail.GetProperty("ipaSource").GetString());
        Assert.Equal("Không dùng với tân ngữ là người", detail.GetProperty("note").GetString());
        var examples = detail.GetProperty("examples");
        Assert.Equal(2, examples.GetArrayLength());
        Assert.Equal("Don't give up.", examples[0].GetProperty("text").GetString());
        Assert.Equal("Đừng bỏ cuộc.", examples[0].GetProperty("translation").GetString());
        Assert.Equal("Never give up.", examples[1].GetProperty("text").GetString());
    }

    // AC-03 (TC-LIB-003): grammar needs Tên cấu trúc and Công thức; Ý nghĩa is optional.
    [Fact]
    public async Task GrammarWithTermAndFormulaIsCreated()
    {
        using var client = await SignedInClient.CreateAsync(factory);

        using var response = await client.PostItemAsync(LibraryTestExtensions.Grammar());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.JsonAsync();
        Assert.Equal("grammar", body.GetProperty("kind").GetString());
        Assert.Equal("have/has + V3", body.GetProperty("formula").GetString());
        Assert.Equal(JsonValueKindOf.Null, body.GetProperty("meaning").ValueKind);
    }

    // AC-05 (TC-LIB-003): whitespace-only Ý nghĩa is stored as null.
    [Fact]
    public async Task GrammarMeaningOfOnlySpacesIsStoredAsNull()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = LibraryTestExtensions.Grammar();
        body["meaning"] = "   ";

        using var response = await client.PostItemAsync(body);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal(JsonValueKindOf.Null, (await response.JsonAsync()).GetProperty("meaning").ValueKind);
    }

    // AC-02, AC-03 (TC-LIB-003, TC-LIB-034, TC-LIB-035): required fields per kind, error on the right field.
    [Theory]
    [InlineData("word", null, "meaning", "required")]
    [InlineData("word", "   ", "meaning", "required")]
    [InlineData("grammar", null, "formula", "required")]
    public async Task MissingRequiredFieldIsRejectedOnThatField(string kind, string? value, string field, string reason)
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = kind == "word" ? LibraryTestExtensions.Word() : LibraryTestExtensions.Grammar();
        body[field] = value;

        using var response = await client.PostItemAsync(body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("ERR-LIB-400-01", await response.ProblemCodeAsync());
        Assert.Equal(reason, (await response.JsonAsync()).GetProperty("errors").GetProperty(field).GetString());
    }

    [Theory]
    [InlineData("word")]
    [InlineData("grammar")]
    public async Task MissingTermIsRejected(string kind)
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = kind == "word" ? LibraryTestExtensions.Word() : LibraryTestExtensions.Grammar();
        body["term"] = "  ";

        using var response = await client.PostItemAsync(body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("required", (await response.JsonAsync()).GetProperty("errors").GetProperty("term").GetString());
    }

    // AC-04, AC-10 (TC-LIB-036, TC-LIB-037): only word and grammar exist in Round 1; kind is required.
    [Theory]
    [InlineData("idiom", "invalid")]
    [InlineData("99", "invalid")]
    [InlineData(null, "required")]
    public async Task KindOutsideTheTwoLibrariesOrMissingIsRejected(string? kind, string reason)
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = LibraryTestExtensions.Word();
        body["kind"] = kind;

        using var response = await client.PostItemAsync(body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("ERR-LIB-400-01", await response.ProblemCodeAsync());
        Assert.Equal(reason, (await response.JsonAsync()).GetProperty("errors").GetProperty("kind").GetString());
        await factory.WithLibraryAsync(async db =>
            Assert.Equal(0, await db.Items.CountAsync(i => i.UserId == client.UserId, TestContext.Current.CancellationToken)));
    }

    // BR-LIB-012 / BR-LIB-016: fields that do not belong to the kind are refused.
    [Fact]
    public async Task GrammarCannotCarryPartOfSpeechOrIpaAndWordCannotCarryFormula()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var grammar = LibraryTestExtensions.Grammar();
        grammar["partOfSpeech"] = "Danh từ";
        grammar["ipa"] = "/x/";
        var word = LibraryTestExtensions.Word();
        word["formula"] = "have + V3";

        using var grammarResponse = await client.PostItemAsync(grammar);
        using var wordResponse = await client.PostItemAsync(word);

        var grammarErrors = (await grammarResponse.JsonAsync()).GetProperty("errors");
        Assert.Equal("not-allowed", grammarErrors.GetProperty("partOfSpeech").GetString());
        Assert.Equal("not-allowed", grammarErrors.GetProperty("ipa").GetString());
        Assert.Equal("not-allowed", (await wordResponse.JsonAsync()).GetProperty("errors").GetProperty("formula").GetString());
    }

    // AC-11 (TC-LIB-051): Loại từ is optional and limited to the list.
    [Theory]
    [InlineData(null, HttpStatusCode.Created)]
    [InlineData("Động từ", HttpStatusCode.Created)]
    [InlineData("Idiom", HttpStatusCode.BadRequest)]
    public async Task PartOfSpeechMustBeInTheListWhenGiven(string? partOfSpeech, HttpStatusCode expected)
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = LibraryTestExtensions.Word();
        body["partOfSpeech"] = partOfSpeech;

        using var response = await client.PostItemAsync(body);

        Assert.Equal(expected, response.StatusCode);
        if (expected == HttpStatusCode.BadRequest)
        {
            Assert.Equal("ERR-LIB-400-01", await response.ProblemCodeAsync());
            Assert.Equal("invalid", (await response.JsonAsync()).GetProperty("errors").GetProperty("partOfSpeech").GetString());
        }
    }

    // BR-LIB-013 / ERR-LIB-400-02: IPA accepts IPA characters only.
    [Theory]
    [InlineData("<b>give</b>", false)]
    [InlineData("/ɡɪv & ʌp/", false)]
    [InlineData("/ˈwɔːtə/", true)]
    [InlineData("/ɔːlˈðəʊ/", true)]
    public async Task IpaWithNonIpaCharactersIsRejectedWithErr40002(string ipa, bool accepted)
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = LibraryTestExtensions.Word();
        body["ipa"] = ipa;

        using var response = await client.PostItemAsync(body);

        Assert.Equal(accepted ? HttpStatusCode.Created : HttpStatusCode.BadRequest, response.StatusCode);
        if (!accepted)
        {
            Assert.Equal("ERR-LIB-400-02", await response.ProblemCodeAsync());
        }
    }

    // AC-06 (TC-LIB-004): exact limits save, one more does not.
    [Theory]
    [InlineData("word", "term", 1000, true)]
    [InlineData("word", "term", 1001, false)]
    [InlineData("word", "meaning", 2000, true)]
    [InlineData("word", "meaning", 2001, false)]
    [InlineData("word", "note", 4000, true)]
    [InlineData("word", "note", 4001, false)]
    [InlineData("grammar", "formula", 1000, true)]
    [InlineData("grammar", "formula", 1001, false)]
    [InlineData("grammar", "meaning", 2000, true)]
    [InlineData("grammar", "meaning", 2001, false)]
    public async Task FieldLengthLimitsAreEnforced(string kind, string field, int length, bool accepted)
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = kind == "word" ? LibraryTestExtensions.Word() : LibraryTestExtensions.Grammar();
        body[field] = Long(length);

        using var response = await client.PostItemAsync(body);

        Assert.Equal(accepted ? HttpStatusCode.Created : HttpStatusCode.BadRequest, response.StatusCode);
        if (!accepted)
        {
            Assert.Equal("too-long", (await response.JsonAsync()).GetProperty("errors").GetProperty(field).GetString());
        }
    }

    // AC-07 (TC-LIB-002, TC-LIB-004): 0 and 20 examples save, 21 does not.
    [Theory]
    [InlineData(0, true)]
    [InlineData(20, true)]
    [InlineData(21, false)]
    public async Task AtMostTwentyExamples(int count, bool accepted)
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = LibraryTestExtensions.Word();
        body["examples"] = Enumerable.Range(1, count).Select(i => new { text = $"Example {i}", translation = (string?)null }).ToArray();

        using var response = await client.PostItemAsync(body);

        Assert.Equal(accepted ? HttpStatusCode.Created : HttpStatusCode.BadRequest, response.StatusCode);
        if (accepted)
        {
            Assert.Equal(count, (await response.JsonAsync()).GetProperty("examples").GetArrayLength());
        }
        else
        {
            Assert.Equal("too-many", (await response.JsonAsync()).GetProperty("errors").GetProperty("examples").GetString());
        }
    }

    [Fact]
    public async Task ExampleWithoutTextIsRejected()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = LibraryTestExtensions.Word();
        body["examples"] = new[] { new { text = "  ", translation = "dịch" } };

        using var response = await client.PostItemAsync(body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("required", (await response.JsonAsync()).GetProperty("errors").GetProperty("examples[0].text").GetString());
    }

    // AC-08 (TC-LIB-005): the same clientRequestId, even in parallel, makes one item.
    [Fact]
    public async Task SameClientRequestIdCreatesOneItemEvenWhenSentInParallel()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var requestId = Guid.NewGuid();
        var body = LibraryTestExtensions.Word(clientRequestId: requestId);

        var responses = await Task.WhenAll(Enumerable.Range(0, 5).Select(_ => client.PostItemAsync(body)));
        var again = await client.PostItemAsync(body);

        var ids = new HashSet<Guid>();
        foreach (var response in responses.Append(again))
        {
            Assert.True(response.StatusCode is HttpStatusCode.Created or HttpStatusCode.OK);
            ids.Add((await response.JsonAsync()).GetProperty("id").GetGuid());
        }

        Assert.Single(ids);
        Assert.Equal(HttpStatusCode.OK, again.StatusCode);
        Assert.Equal(1, responses.Count(r => r.StatusCode == HttpStatusCode.Created));
        await factory.WithLibraryAsync(async db =>
            Assert.Equal(1, await db.Items.CountAsync(i => i.UserId == client.UserId, TestContext.Current.CancellationToken)));
    }

    [Fact]
    public async Task MissingClientRequestIdIsRejected()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var body = LibraryTestExtensions.Word();
        body.Remove("clientRequestId");

        using var response = await client.PostItemAsync(body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("required", (await response.JsonAsync()).GetProperty("errors").GetProperty("clientRequestId").GetString());
    }

    // AC-09 (TC-LIB-006): at 10.000 items (both libraries together) nothing more is saved; a retried request still returns its item.
    [Fact]
    public async Task UserAtTenThousandItemsCannotSaveMoreInEitherLibrary()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var firstRequest = Guid.NewGuid();
        using (var first = await client.PostItemAsync(LibraryTestExtensions.Word(clientRequestId: firstRequest)))
        {
            Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        }

        await factory.WithLibraryAsync(db => db.Database.ExecuteSqlRawAsync(
            """
            INSERT INTO library.KnowledgeItems (Id, UserId, Kind, Term, NormalizedTerm, Meaning, SearchText, CreatedAt, UpdatedAt)
            SELECT TOP (9999) NEWID(), {0}, 1, N'seed', N'seed', N'seed', N'seed', SYSUTCDATETIME(), SYSUTCDATETIME()
            FROM sys.all_objects a CROSS JOIN sys.all_objects b
            """,
            [client.UserId],
            TestContext.Current.CancellationToken));

        using var word = await client.PostItemAsync(LibraryTestExtensions.Word("another"));
        using var grammar = await client.PostItemAsync(LibraryTestExtensions.Grammar("another", "x + y"));
        using var retry = await client.PostItemAsync(LibraryTestExtensions.Word(clientRequestId: firstRequest));

        Assert.Equal(HttpStatusCode.UnprocessableEntity, word.StatusCode);
        Assert.Equal("ERR-LIB-422-01", await word.ProblemCodeAsync());
        Assert.Equal(HttpStatusCode.UnprocessableEntity, grammar.StatusCode);
        Assert.Equal(HttpStatusCode.OK, retry.StatusCode);
        await factory.WithLibraryAsync(async db =>
            Assert.Equal(10_000, await db.Items.CountAsync(i => i.UserId == client.UserId, TestContext.Current.CancellationToken)));
    }

    // US-AUTH-09 / US-LIB-07 AC-03 (TC-LIB-027): never trust a userId from the client.
    [Fact]
    public async Task UserIdInTheBodyIsIgnored()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        using var other = await SignedInClient.CreateAsync(factory);
        var body = LibraryTestExtensions.Word();
        body["userId"] = other.UserId;

        using var response = await client.PostItemAsync(body);

        var id = (await response.JsonAsync()).GetProperty("id").GetGuid();
        await factory.WithLibraryAsync(async db =>
            Assert.Equal(client.UserId, (await db.Items.SingleAsync(i => i.Id == id, TestContext.Current.CancellationToken)).UserId));
    }

    [Fact]
    public async Task RequestWithoutSessionIsUnauthorizedAndCreatesNothing()
    {
        using var client = await SignedInClient.AnonymousAsync(factory);

        using var response = await client.PostItemAsync(LibraryTestExtensions.Word());

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task RequestWithoutAntiforgeryTokenIsRejected()
    {
        using var client = await SignedInClient.CreateAsync(factory);

        using var response = await client.SendAsync(HttpMethod.Post, "/api/library/items", LibraryTestExtensions.Word(), withToken: false);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("ERR-AUTH-400-05", await response.ProblemCodeAsync());
    }
}

/// <summary>Short alias so assertions read naturally.</summary>
internal static class JsonValueKindOf
{
    public const System.Text.Json.JsonValueKind Null = System.Text.Json.JsonValueKind.Null;
}
