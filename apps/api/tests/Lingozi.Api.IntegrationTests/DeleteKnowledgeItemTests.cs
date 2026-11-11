using System.Net;
using Microsoft.EntityFrameworkCore;

namespace Lingozi.Api.IntegrationTests;

/// <summary>US-LIB-06: DELETE /api/library/items/{id} against real SQL Server (AC-01, AC-03; TC-LIB-023, 025).</summary>
[Collection(SqlServerApiFactory.CollectionName)]
public sealed class DeleteKnowledgeItemTests(SqlServerApiFactory factory)
{
    private static string Url(Guid id) => $"/api/library/items/{id}";

    private static async Task<Guid> CreateWithExamplesAsync(SignedInClient client, string term = "give up")
    {
        var body = LibraryTestExtensions.Word(term, "từ bỏ");
        body["examples"] = new object[] { new { text = "Don't give up.", translation = "Đừng bỏ cuộc." }, new { text = "Never give up.", translation = (string?)null } };
        using var created = await client.PostItemAsync(body);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        return (await created.JsonAsync()).GetProperty("id").GetGuid();
    }

    // AC-01 (TC-LIB-023): the item and its examples are gone; nothing else changes.
    [Fact]
    public async Task DeleteRemovesTheItemAndItsExamplesOnly()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var id = await CreateWithExamplesAsync(client);
        var keep = await CreateWithExamplesAsync(client, term: "keep me");

        using var response = await client.SendAsync(HttpMethod.Delete, Url(id), null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        using var detail = await client.SendAsync(HttpMethod.Get, Url(id), null);
        Assert.Equal(HttpStatusCode.NotFound, detail.StatusCode);
        await factory.WithLibraryAsync(async db =>
        {
            var ct = TestContext.Current.CancellationToken;
            Assert.False(await db.Items.AnyAsync(i => i.Id == id, ct));
            Assert.Equal(0, await db.Examples.CountAsync(e => e.ItemId == id, ct));
            Assert.Equal(2, await db.Examples.CountAsync(e => e.ItemId == keep, ct));
            Assert.True(await db.Items.AnyAsync(i => i.Id == keep, ct));
        });
    }

    // AC-03 (TC-LIB-025): deleting an item that is already gone is "not found", not a server error.
    [Fact]
    public async Task DeletingTwiceReturnsNotFoundTheSecondTime()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var id = await CreateWithExamplesAsync(client);
        using (await client.SendAsync(HttpMethod.Delete, Url(id), null)) { }

        using var second = await client.SendAsync(HttpMethod.Delete, Url(id), null);

        Assert.Equal(HttpStatusCode.NotFound, second.StatusCode);
        Assert.Equal("ERR-LIB-404-01", await second.ProblemCodeAsync());
    }

    // BR-LIB-006 (TC-LIB-022): someone else's item is not deleted and looks like a missing one.
    [Fact]
    public async Task DeletingAnotherUsersItemIsNotFoundAndKeepsIt()
    {
        using var owner = await SignedInClient.CreateAsync(factory);
        using var stranger = await SignedInClient.CreateAsync(factory);
        var id = await CreateWithExamplesAsync(owner);

        using var response = await stranger.SendAsync(HttpMethod.Delete, Url(id), null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        await factory.WithLibraryAsync(async db =>
            Assert.True(await db.Items.AnyAsync(i => i.Id == id, TestContext.Current.CancellationToken)));
    }

    [Theory]
    [InlineData("00000000-0000-0000-0000-000000000000")]
    [InlineData("not-a-guid")]
    public async Task UnknownOrMalformedIdIsNotFound(string id)
    {
        using var client = await SignedInClient.CreateAsync(factory);

        using var response = await client.SendAsync(HttpMethod.Delete, $"/api/library/items/{id}", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteRequiresASession()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var id = await CreateWithExamplesAsync(client);
        using var anonymous = await SignedInClient.AnonymousAsync(factory);

        using var response = await anonymous.SendAsync(HttpMethod.Delete, Url(id), null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteWithoutAntiforgeryTokenIsRejected()
    {
        using var client = await SignedInClient.CreateAsync(factory);
        var id = await CreateWithExamplesAsync(client);

        using var response = await client.SendAsync(HttpMethod.Delete, Url(id), null, withToken: false);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("ERR-AUTH-400-05", await response.ProblemCodeAsync());
    }
}
