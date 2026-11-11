using System.Net;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Api.IntegrationTests;

/// <summary>US-LIB-05: PUT /api/library/items/{id} against real SQL Server (AC-01, AC-02, AC-04; TC-LIB-019, 020, 022).</summary>
[Collection(SqlServerApiFactory.CollectionName)]
public sealed class UpdateKnowledgeItemTests(SqlServerApiFactory factory)
{
    private static string Url(Guid id) => $"/api/library/items/{id}";

    private static async Task<(Guid Id, string Version)> CreateWordAsync(SignedInClient client, string term = "give up", string meaning = "từ bỏ")
    {
        using var created = await client.PostItemAsync(LibraryTestExtensions.Word(term, meaning));
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var body = await created.JsonAsync();
        return (body.GetProperty("id").GetGuid(), body.GetProperty("version").GetString()!);
    }

    private static Dictionary<string, object?> Edit(string version, string term = "give up", string meaning = "bỏ cuộc", string[]? examples = null) =>
        new()
        {
            ["kind"] = "word",
            ["term"] = term,
            ["meaning"] = meaning,
            ["version"] = version,
            ["examples"] = (examples ?? []).Select(e => new { text = e, translation = (string?)null }).ToArray(),
        };

    // AC-01 (TC-LIB-019): meaning changed, examples replaced, version and UpdatedAt change, search text follows.
    [Fact]
    public async Task EditSavesFieldsReplacesExamplesAndReturnsANewVersion()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var (id, version) = await CreateWordAsync(client);
        var body = Edit(version, meaning: "bỏ cuộc", examples: ["Never give up.", "Don't give up."]);

        using var response = await client.SendAsync(HttpMethod.Put, Url(id), body);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var detail = await response.JsonAsync();
        Assert.Equal("bỏ cuộc", detail.GetProperty("meaning").GetString());
        Assert.Equal(2, detail.GetProperty("examples").GetArrayLength());
        Assert.Equal("Never give up.", detail.GetProperty("examples")[0].GetProperty("text").GetString());
        Assert.NotEqual(version, detail.GetProperty("version").GetString());
        await factory.WithLibraryAsync(async db =>
        {
            var row = await db.Items.AsNoTracking().SingleAsync(i => i.Id == id, TestContext.Current.CancellationToken);
            Assert.Equal("bỏ cuộc", row.Meaning);
            Assert.Contains("bo cuoc", row.SearchText, StringComparison.Ordinal);
            Assert.True(row.UpdatedAt >= row.CreatedAt);
            Assert.Equal(2, await db.Examples.CountAsync(e => e.ItemId == id, TestContext.Current.CancellationToken));
        });
    }

    // AC-01 + US-LIB-02 (TC-LIB-022): a changed term is what the similar-item lookup finds afterwards.
    [Fact]
    public async Task ChangedTermIsUsedForSimilarItemsAfterwards()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var (id, version) = await CreateWordAsync(client, term: "old phrase");

        using var response = await client.SendAsync(HttpMethod.Put, Url(id), Edit(version, term: "Break   a LEG"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        using var found = await client.SendAsync(HttpMethod.Get, "/api/library/items/similar?kind=word&term=break%20a%20leg", null);
        Assert.Equal(1, (await found.JsonAsync()).GetProperty("totalCount").GetInt32());
        using var gone = await client.SendAsync(HttpMethod.Get, "/api/library/items/similar?kind=word&term=old%20phrase", null);
        Assert.Equal(0, (await gone.JsonAsync()).GetProperty("totalCount").GetInt32());
    }

    // AC-02 (TC-LIB-020): the second tab sends the version it read before the first tab saved.
    [Fact]
    public async Task StaleVersionIsRefusedWithTheCurrentStateAndNothingIsWritten()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var (id, staleVersion) = await CreateWordAsync(client);
        using (var first = await client.SendAsync(HttpMethod.Put, Url(id), Edit(staleVersion, meaning: "tab 1")))
        {
            Assert.Equal(HttpStatusCode.OK, first.StatusCode);
        }

        using var second = await client.SendAsync(HttpMethod.Put, Url(id), Edit(staleVersion, meaning: "tab 2"));

        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
        Assert.Equal("ERR-LIB-409-01", await second.ProblemCodeAsync());
        var current = (await second.JsonAsync()).GetProperty("current");
        Assert.Equal("tab 1", current.GetProperty("meaning").GetString());
        await factory.WithLibraryAsync(async db =>
            Assert.Equal("tab 1", (await db.Items.AsNoTracking().SingleAsync(i => i.Id == id, TestContext.Current.CancellationToken)).Meaning));
    }

    // AC-04 (TC-LIB-022): someone else's item is "not found", the same as a missing one, and unchanged.
    [Fact]
    public async Task EditingAnotherUsersItemIsNotFoundAndChangesNothing()
    {
        using var owner = await SignedInClient.CreateAsync(factory);
        using var stranger = await SignedInClient.CreateAsync(factory);
        var (id, version) = await CreateWordAsync(owner);

        using var response = await stranger.SendAsync(HttpMethod.Put, Url(id), Edit(version, meaning: "hacked"));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("ERR-LIB-404-01", await response.ProblemCodeAsync());
        await factory.WithLibraryAsync(async db =>
            Assert.Equal("từ bỏ", (await db.Items.AsNoTracking().SingleAsync(i => i.Id == id, TestContext.Current.CancellationToken)).Meaning));
    }

    [Theory]
    [InlineData("00000000-0000-0000-0000-000000000000")]
    [InlineData("not-a-guid")]
    public async Task UnknownOrMalformedIdIsNotFound(string id)
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var (_, version) = await CreateWordAsync(client);

        using var response = await client.SendAsync(HttpMethod.Put, $"/api/library/items/{id}", Edit(version));

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // BR-LIB-002: the kind of an item cannot change when editing.
    [Fact]
    public async Task KindCannotChangeWhenEditing()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var (id, version) = await CreateWordAsync(client);
        var body = Edit(version);
        body["kind"] = "grammar";
        body["formula"] = "x + y";

        using var response = await client.SendAsync(HttpMethod.Put, Url(id), body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("not-allowed", (await response.JsonAsync()).GetProperty("errors").GetProperty("kind").GetString());
    }

    // BR-LIB-007: the version is required and must be a real version.
    [Fact]
    public async Task MissingOrMalformedVersionIsRejected()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var (id, _) = await CreateWordAsync(client);
        var missing = Edit("x");
        missing.Remove("version");

        using var noVersion = await client.SendAsync(HttpMethod.Put, Url(id), missing);
        using var badVersion = await client.SendAsync(HttpMethod.Put, Url(id), Edit("***"));

        Assert.Equal("required", (await noVersion.JsonAsync()).GetProperty("errors").GetProperty("version").GetString());
        Assert.Equal("invalid", (await badVersion.JsonAsync()).GetProperty("errors").GetProperty("version").GetString());
    }

    [Fact]
    public async Task EditUsesTheSameFieldRulesAsCreate()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var (id, version) = await CreateWordAsync(client);
        var body = Edit(version, term: "  ", meaning: new string('x', 2001));

        using var response = await client.SendAsync(HttpMethod.Put, Url(id), body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("ERR-LIB-400-01", await response.ProblemCodeAsync());
        var errors = (await response.JsonAsync()).GetProperty("errors");
        Assert.Equal("required", errors.GetProperty("term").GetString());
        Assert.Equal("too-long", errors.GetProperty("meaning").GetString());
    }

    [Fact]
    public async Task EditRequiresASession()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var (id, version) = await CreateWordAsync(client);
        using var anonymous = await SignedInClient.AnonymousAsync(factory);

        using var response = await anonymous.SendAsync(HttpMethod.Put, Url(id), Edit(version));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
