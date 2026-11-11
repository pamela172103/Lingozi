using System.Net;

namespace Lingozi.Api.IntegrationTests;

/// <summary>Reads that back US-LIB-01 (what was saved is shown): list by kind (FR-LIB-ITEM-003) and detail (FR-LIB-ITEM-004), both private to the owner (BR-LIB-006).</summary>
[Collection(SqlServerApiFactory.CollectionName)]
public sealed class ReadKnowledgeItemTests(SqlServerApiFactory factory)
{
    [Fact]
    public async Task ListReturnsOnlyTheRequestedKindOfTheSignedInUserNewestFirst()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        using var other = await SignedInClient.CreateAsync(factory);
        using (await client.PostItemAsync(LibraryTestExtensions.Word("first", "một"))) { }
        using (await client.PostItemAsync(LibraryTestExtensions.Word("second", "hai"))) { }
        using (await client.PostItemAsync(LibraryTestExtensions.Grammar("Passive voice", "be + V3"))) { }
        using (await other.PostItemAsync(LibraryTestExtensions.Word("not mine", "của người khác"))) { }

        using var words = await client.SendAsync(HttpMethod.Get, "/api/library/items?kind=word", null);
        using var grammar = await client.SendAsync(HttpMethod.Get, "/api/library/items?kind=grammar", null);

        var wordPage = await words.JsonAsync();
        Assert.Equal(2, wordPage.GetProperty("totalCount").GetInt32());
        Assert.Equal("second", wordPage.GetProperty("items")[0].GetProperty("term").GetString());
        Assert.Equal("first", wordPage.GetProperty("items")[1].GetProperty("term").GetString());
        var grammarPage = await grammar.JsonAsync();
        Assert.Equal(1, grammarPage.GetProperty("totalCount").GetInt32());
        Assert.Equal("be + V3", grammarPage.GetProperty("items")[0].GetProperty("formula").GetString());
    }

    [Theory]
    [InlineData("")]
    [InlineData("?kind=idiom")]
    [InlineData("?kind=word&page=0")]
    [InlineData("?kind=word&pageSize=0")]
    public async Task ListWithoutValidKindOrPagingIsRejected(string query)
    {
        using var client = await SignedInClient.CreateAsync(factory);

        using var response = await client.SendAsync(HttpMethod.Get, "/api/library/items" + query, null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("ERR-LIB-400-01", await response.ProblemCodeAsync());
    }

    [Fact]
    public async Task PageSizeAboveFiftyIsCappedAtFifty()
    {
        using var client = await SignedInClient.CreateAsync(factory);

        using var response = await client.SendAsync(HttpMethod.Get, "/api/library/items?kind=word&pageSize=1000", null);

        Assert.Equal(50, (await response.JsonAsync()).GetProperty("pageSize").GetInt32());
    }

    [Fact]
    public async Task DetailOfOthersOrUnknownOrMalformedIdsLooksIdentical()
    {
        using var owner = await SignedInClient.CreateAsync(factory);
        using var stranger = await SignedInClient.CreateAsync(factory);
        using var created = await owner.PostItemAsync(LibraryTestExtensions.Word());
        var id = (await created.JsonAsync()).GetProperty("id").GetGuid();

        using var mine = await owner.SendAsync(HttpMethod.Get, $"/api/library/items/{id}", null);
        using var theirs = await stranger.SendAsync(HttpMethod.Get, $"/api/library/items/{id}", null);
        using var unknown = await stranger.SendAsync(HttpMethod.Get, $"/api/library/items/{Guid.NewGuid()}", null);
        using var malformed = await stranger.SendAsync(HttpMethod.Get, "/api/library/items/not-a-guid", null);

        Assert.Equal(HttpStatusCode.OK, mine.StatusCode);
        foreach (var response in new[] { theirs, unknown, malformed })
        {
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            Assert.Equal("ERR-LIB-404-01", await response.ProblemCodeAsync());
        }
    }

    [Fact]
    public async Task LibraryReadsRequireASession()
    {
        using var anonymous = await SignedInClient.AnonymousAsync(factory);

        using var list = await anonymous.SendAsync(HttpMethod.Get, "/api/library/items?kind=word", null);
        using var detail = await anonymous.SendAsync(HttpMethod.Get, $"/api/library/items/{Guid.NewGuid()}", null);

        Assert.Equal(HttpStatusCode.Unauthorized, list.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, detail.StatusCode);
    }
}
