using System.Net;
using Lingozi.Library.Suggestions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Api.IntegrationTests;

/// <summary>US-LIB-08 and US-LIB-09: GET /api/library/suggestions and the ipaSource rule (BR-LIB-013, BR-LIB-014, BR-LIB-015).</summary>
[Collection(SqlServerApiFactory.CollectionName)]
public sealed class SuggestionTests(SqlServerApiFactory factory)
{
    private WebApplicationFactory<Program> With(FakeWordReferenceProvider fake) =>
        factory.WithWebHostBuilder(b => b.ConfigureServices(s => s.AddScoped<IWordReferenceProvider>(_ => fake)));

    private static readonly string[] OwnMeanings = ["ngừng cố gắng", "từ bỏ"];
    private static readonly string[] StrangerMeanings = ["bỏ cuộc"];
    private static readonly string[] WaterWord = ["water"];

    private static string Query(string kind, string term) => $"/api/library/suggestions?kind={kind}&term={Uri.EscapeDataString(term)}";

    private static readonly WordReference Water = new("/ˈwɔːtə/", ["a clear liquid", "to add water to"]);

    // US-LIB-09 AC-01 (TC-LIB-045): the user's own meanings of the same term, same kind.
    [Fact]
    public async Task OwnMeaningsOfTheSameKindAreSuggestedFirstAndOtherUsersAreNot()
    {
        var fake = new FakeWordReferenceProvider { Enabled = false };
        var owner = await SignedInClient.CreateAsync(With(fake));
        var stranger = await SignedInClient.CreateAsync(With(fake));
        using (await owner.PostItemAsync(LibraryTestExtensions.Word("give up", "từ bỏ"))) { }
        using (await owner.PostItemAsync(LibraryTestExtensions.Word("GIVE   up", "ngừng cố gắng"))) { }
        var grammar = LibraryTestExtensions.Grammar("give up", "x + y");
        grammar["meaning"] = "không phải từ";
        using (await owner.PostItemAsync(grammar)) { }
        using (await stranger.PostItemAsync(LibraryTestExtensions.Word("give up", "bỏ cuộc"))) { }

        using var mine = await owner.SendAsync(HttpMethod.Get, Query("word", "give up"), null);

        var meanings = (await mine.JsonAsync()).GetProperty("meanings");
        Assert.Equal(2, meanings.GetArrayLength());
        Assert.All(meanings.EnumerateArray(), m => Assert.Equal("own", m.GetProperty("source").GetString()));
        Assert.Equal(OwnMeanings, meanings.EnumerateArray().Select(m => m.GetProperty("text").GetString()).ToArray());

        using var theirs = await stranger.SendAsync(HttpMethod.Get, Query("word", "give up"), null);
        var strangerMeanings = (await theirs.JsonAsync()).GetProperty("meanings");
        Assert.Equal(StrangerMeanings, strangerMeanings.EnumerateArray().Select(m => m.GetProperty("text").GetString()));
    }

    // US-LIB-08 AC-01 (TC-LIB-038): a British pronunciation is suggested for a word; BR-LIB-013.
    [Fact]
    public async Task BritishPronunciationIsSuggestedForWordsAndSentToTheSourceInNormalizedForm()
    {
        var fake = new FakeWordReferenceProvider { Behaviour = (_, _) => Task.FromResult<WordReference?>(Water) };
        var client = await SignedInClient.CreateAsync(With(fake));

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", "  WATER "), null);

        var body = await response.JsonAsync();
        Assert.Equal("/ˈwɔːtə/", body.GetProperty("ipa").GetProperty("value").GetString());
        Assert.Equal("dictionary", body.GetProperty("ipa").GetProperty("source").GetString());
        Assert.True(body.GetProperty("sourceEnabled").GetBoolean());
        Assert.True(body.GetProperty("sourceAvailable").GetBoolean());
        Assert.Equal(WaterWord, fake.Words);
        Assert.Contains(body.GetProperty("meanings").EnumerateArray(), m => m.GetProperty("source").GetString() == "dictionary");
    }

    // BR-LIB-013: the pronunciation is a word thing only.
    [Fact]
    public async Task GrammarNeverGetsAnIpaSuggestion()
    {
        var fake = new FakeWordReferenceProvider { Behaviour = (_, _) => Task.FromResult<WordReference?>(Water) };
        var client = await SignedInClient.CreateAsync(With(fake));

        using var response = await client.SendAsync(HttpMethod.Get, Query("grammar", "water"), null);

        Assert.Equal(JsonValueKindNull, (await response.JsonAsync()).GetProperty("ipa").ValueKind);
    }

    // US-LIB-08 AC-03 (TC-LIB-040): the source does not know the word; not an error.
    [Fact]
    public async Task UnknownWordGivesNoSuggestionAndTheSourceIsStillAvailable()
    {
        var fake = new FakeWordReferenceProvider { Behaviour = (_, _) => Task.FromResult<WordReference?>(null) };
        var client = await SignedInClient.CreateAsync(With(fake));

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", "learn"), null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.JsonAsync();
        Assert.Equal(JsonValueKindNull, body.GetProperty("ipa").ValueKind);
        Assert.True(body.GetProperty("sourceAvailable").GetBoolean());
    }

    // US-LIB-08 AC-06 (TC-LIB-042), BR-LIB-015: a failing source is not a business error; own suggestions still come back.
    [Fact]
    public async Task FailingSourceReturnsOkWithOwnSuggestionsOnly()
    {
        var fake = new FakeWordReferenceProvider { Behaviour = (_, _) => throw new HttpRequestException("down") };
        var client = await SignedInClient.CreateAsync(With(fake));
        using (await client.PostItemAsync(LibraryTestExtensions.Word("resilient", "bền bỉ"))) { }

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", "resilient"), null);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.JsonAsync();
        Assert.False(body.GetProperty("sourceAvailable").GetBoolean());
        Assert.Equal(JsonValueKindNull, body.GetProperty("ipa").ValueKind);
        Assert.Equal("bền bỉ", body.GetProperty("meanings")[0].GetProperty("text").GetString());
    }

    // US-LIB-08 AC-06 (TC-LIB-042): a source slower than 3 seconds is cut off.
    [Fact]
    public async Task SlowSourceIsCutOffAfterThreeSeconds()
    {
        var fake = new FakeWordReferenceProvider
        {
            Behaviour = async (_, ct) =>
            {
                await Task.Delay(TimeSpan.FromSeconds(30), ct);
                return Water;
            },
        };
        var client = await SignedInClient.CreateAsync(With(fake));
        var started = DateTime.UtcNow;

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", "slow"), null);

        Assert.True(DateTime.UtcNow - started < TimeSpan.FromSeconds(10));
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False((await response.JsonAsync()).GetProperty("sourceAvailable").GetBoolean());
    }

    // Configuration off (default): no request leaves the server, and the response says so.
    [Fact]
    public async Task DisabledSourceMakesNoRequest()
    {
        var fake = new FakeWordReferenceProvider { Enabled = false, Behaviour = (_, _) => Task.FromResult<WordReference?>(Water) };
        var client = await SignedInClient.CreateAsync(With(fake));

        using var response = await client.SendAsync(HttpMethod.Get, Query("word", "water"), null);

        var body = await response.JsonAsync();
        Assert.Empty(fake.Words);
        Assert.False(body.GetProperty("sourceEnabled").GetBoolean());
        Assert.False(body.GetProperty("sourceAvailable").GetBoolean());
    }

    [Fact]
    public async Task EmptyTermAsksNothingAndKindIsRequired()
    {
        var fake = new FakeWordReferenceProvider();
        var client = await SignedInClient.CreateAsync(With(fake));

        using var empty = await client.SendAsync(HttpMethod.Get, Query("word", "  "), null);
        using var noKind = await client.SendAsync(HttpMethod.Get, "/api/library/suggestions?term=water", null);

        Assert.Equal(0, (await empty.JsonAsync()).GetProperty("meanings").GetArrayLength());
        Assert.Empty(fake.Words);
        Assert.Equal(HttpStatusCode.BadRequest, noKind.StatusCode);
    }

    // BR-LIB-013: the ipaSource label follows what the form sent.
    [Fact]
    public async Task IpaSourceIsStoredAsDictionaryOrUser()
    {
        var client = await SignedInClient.CreateAsync(With(new FakeWordReferenceProvider { Enabled = false }));
        var fromSource = LibraryTestExtensions.Word("water", "nước");
        fromSource["ipa"] = "/ˈwɔːtə/";
        fromSource["ipaSource"] = "dictionary";
        var typed = LibraryTestExtensions.Word("tea", "trà");
        typed["ipa"] = "/tiː/";
        typed["ipaSource"] = "user";

        using var a = await client.PostItemAsync(fromSource);
        using var b = await client.PostItemAsync(typed);

        Assert.Equal("dictionary", (await a.JsonAsync()).GetProperty("ipaSource").GetString());
        Assert.Equal("user", (await b.JsonAsync()).GetProperty("ipaSource").GetString());
    }

    [Fact]
    public async Task UnknownIpaSourceIsRejectedAndIpaWithoutAValueHasNoSource()
    {
        var client = await SignedInClient.CreateAsync(With(new FakeWordReferenceProvider { Enabled = false }));
        var bad = LibraryTestExtensions.Word();
        bad["ipa"] = "/x/";
        bad["ipaSource"] = "google";

        using var rejected = await client.PostItemAsync(bad);
        using var plain = await client.PostItemAsync(LibraryTestExtensions.Word("plain", "đơn giản"));

        Assert.Equal(HttpStatusCode.BadRequest, rejected.StatusCode);
        Assert.Equal("invalid", (await rejected.JsonAsync()).GetProperty("errors").GetProperty("ipaSource").GetString());
        Assert.Equal(JsonValueKindNull, (await plain.JsonAsync()).GetProperty("ipaSource").ValueKind);
    }

    // BR-LIB-013 (TC-LIB-039): an edited suggestion is saved as the user's; the form tells the server which one it is.
    [Fact]
    public async Task EditingASuggestedPronunciationStoresTheSourceTheFormSent()
    {
        var client = await SignedInClient.CreateAsync(With(new FakeWordReferenceProvider { Enabled = false }));
        var created = LibraryTestExtensions.Word("water", "nước");
        created["ipa"] = "/ˈwɔːtə/";
        created["ipaSource"] = "dictionary";
        using var first = await client.PostItemAsync(created);
        var detail = await first.JsonAsync();
        var id = detail.GetProperty("id").GetGuid();

        var edited = new Dictionary<string, object?>
        {
            ["kind"] = "word",
            ["term"] = "water",
            ["meaning"] = "nước",
            ["version"] = detail.GetProperty("version").GetString(),
            ["ipa"] = "/ˈwɔːtə x/",
            ["ipaSource"] = "user",
            ["examples"] = Array.Empty<object>(),
        };
        using var response = await client.SendAsync(HttpMethod.Put, $"/api/library/items/{id}", edited);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("user", (await response.JsonAsync()).GetProperty("ipaSource").GetString());
    }

    private const System.Text.Json.JsonValueKind JsonValueKindNull = System.Text.Json.JsonValueKind.Null;
}
