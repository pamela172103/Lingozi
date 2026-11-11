using System.Net;

namespace Lingozi.Api.IntegrationTests;

/// <summary>US-LIB-02: GET /api/library/items/similar and the advisory create (TC-LIB-008, 011, 012, 053).</summary>
[Collection(SqlServerApiFactory.CollectionName)]
public sealed class SimilarKnowledgeItemTests(SqlServerApiFactory factory)
{
    private static string Query(string kind, string term) => $"/api/library/items/similar?kind={kind}&term={Uri.EscapeDataString(term)}";

    // AC-01 (TC-LIB-008): the normalized term matches ("  give   UP " ~ "Give up").
    [Fact]
    public async Task NormalizedTermOfTheSameKindIsFound()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        using (await client.PostItemAsync(LibraryTestExtensions.Word("Give up", "từ bỏ"))) { }

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", "  give   UP "), null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.JsonAsync();
        Assert.Equal(1, body.GetProperty("totalCount").GetInt32());
        var item = body.GetProperty("items")[0];
        Assert.Equal("Give up", item.GetProperty("term").GetString());
        Assert.Equal("từ bỏ", item.GetProperty("meaning").GetString());
        Assert.False(string.IsNullOrEmpty(item.GetProperty("createdAt").GetString()));
    }

    // AC-06 (TC-LIB-053): a grammar item with the same text is not a similar word.
    [Fact]
    public async Task ItemsOfTheOtherLibraryAreNotSimilar()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        using (await client.PostItemAsync(LibraryTestExtensions.Grammar("give up", "x + y"))) { }

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", "give up"), null);

        Assert.Equal(0, (await response.JsonAsync()).GetProperty("totalCount").GetInt32());
    }

    // AC-04 (TC-LIB-011): another user's item is never suggested.
    [Fact]
    public async Task OtherUsersItemsAreNeverSuggested()
    {
        using var owner = await SignedInClient.CreateAsync(factory);
        using var stranger = await SignedInClient.CreateAsync(factory);
        using (await owner.PostItemAsync(LibraryTestExtensions.Word("unique phrase xyz", "bỏ cuộc"))) { }

        using var response = await stranger.SendAsync(HttpMethod.Get, Query("word", "unique phrase xyz"), null);

        var body = await response.JsonAsync();
        Assert.Equal(0, body.GetProperty("totalCount").GetInt32());
        Assert.Equal(0, body.GetProperty("items").GetArrayLength());
    }

    // AC-05 (TC-LIB-012): 7 matches → 5 newest in the response, total 7.
    [Fact]
    public async Task SevenMatchesReturnFiveNewestAndTheTotal()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var ids = new List<string>();
        for (var i = 0; i < 7; i++)
        {
            using var created = await client.PostItemAsync(LibraryTestExtensions.Word("give up", $"nghĩa {i}"));
            ids.Add((await created.JsonAsync()).GetProperty("id").GetString()!);
        }

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", "give up"), null);

        var body = await response.JsonAsync();
        Assert.Equal(7, body.GetProperty("totalCount").GetInt32());
        var items = body.GetProperty("items");
        Assert.Equal(5, items.GetArrayLength());
        Assert.Equal(ids[6], items[0].GetProperty("id").GetString());
        Assert.Equal(ids[2], items[4].GetProperty("id").GetString());
    }

    [Fact]
    public async Task EmptyTermReturnsAnEmptyList()
    {
        using var client = await SignedInClient.CreateAsync(factory);

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", "   "), null);

        var body = await response.JsonAsync();
        Assert.Equal(0, body.GetProperty("totalCount").GetInt32());
        Assert.Equal(0, body.GetProperty("items").GetArrayLength());
    }

    [Fact]
    public async Task TermLongerThanOneThousandCharactersIsRejected()
    {
        using var client = await SignedInClient.CreateAsync(factory);

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", new string('a', 1001)), null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("ERR-LIB-400-01", await response.ProblemCodeAsync());
        Assert.Equal("too-long", (await response.JsonAsync()).GetProperty("errors").GetProperty("term").GetString());
    }

    [Fact]
    public async Task KindIsRequired()
    {
        using var client = await SignedInClient.CreateAsync(factory);

        using var response = await client.SendAsync(HttpMethod.Get, "/api/library/items/similar?term=give", null);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("required", (await response.JsonAsync()).GetProperty("errors").GetProperty("kind").GetString());
    }

    // AC-03 (TC-LIB-010): the hint never blocks a save; the same term can be saved again as a new item.
    [Fact]
    public async Task SavingADuplicateStillCreatesANewItem()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        using (await client.PostItemAsync(LibraryTestExtensions.Word("give up", "từ bỏ"))) { }

        using var second = await client.PostItemAsync(LibraryTestExtensions.Word("give up", "bỏ cuộc"));

        Assert.Equal(HttpStatusCode.Created, second.StatusCode);
        using var similar = await client.SendAsync(HttpMethod.Get, Query("word", "give up"), null);
        Assert.Equal(2, (await similar.JsonAsync()).GetProperty("totalCount").GetInt32());
    }

    [Fact]
    public async Task SimilarLookupRequiresASession()
    {
        using var anonymous = await SignedInClient.AnonymousAsync(factory);

        using var response = await anonymous.SendAsync(HttpMethod.Get, Query("word", "give up"), null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
