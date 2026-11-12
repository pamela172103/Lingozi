using System.Net;
using Lingozi.Library.Suggestions;

namespace Lingozi.Api.IntegrationTests;

public sealed class ScandictProviderTests
{
    // Minimal excerpts of the public abandon page observed on 2026-11-12; not a JSON API fixture.
    private const string Page = """
        <div id="dictionary">
          <div class="dict-top"><h1>Abandon <span class="meaning">từ bỏ; bỏ rơi</span></h1>
            <p title="Anh - Anh"><span>uk:</span><span class="sound"></span><span>/əˈbændən/</span></p>
            <p title="Anh - Mỹ"><span>/əˈbændən US/</span></p></div>
          <div class="gramma"><ul><li>Forsake; leave behind <span>( từ bỏ; bỏ lại phía sau )</span>
            <ul class="list-dict"><li>We <strong>abandoned</strong> the old car - <span> Chúng tôi bỏ lại chiếc xe cũ </span></li></ul>
          </li><li>Duplicate <span>( từ bỏ; bỏ rơi )</span></li></ul></div>
          <div class="examples"><ul><li>To <strong>abandon</strong> a hope <span>( Từ bỏ hy vọng )</span></li>
            <li>To abandon a hope <span>( bản dịch lặp )</span></li></ul></div>
        </div>
        """;
    private static readonly string[] Definitions = ["từ bỏ; bỏ rơi", "từ bỏ; bỏ lại phía sau"];

    [Fact]
    public void ParsesBritishIpaVietnameseMeaningsAndPairedExamples()
    {
        var reference = ScandictProvider.Parse(Page);
        Assert.NotNull(reference);
        Assert.Equal("/əˈbændən/", reference.BritishIpa);
        Assert.Equal(Definitions, reference.Definitions);
        Assert.Equal(2, reference.Examples.Count);
        Assert.Equal(new ReferenceExample("We abandoned the old car", "Chúng tôi bỏ lại chiếc xe cũ"), reference.Examples[0]);
        Assert.Equal(new ReferenceExample("To abandon a hope", "Từ bỏ hy vọng"), reference.Examples[1]);
    }

    [Fact]
    public void DoesNotUseAmericanPronunciationOrUnrelatedTranslations()
    {
        var reference = ScandictProvider.Parse("""
            <div id="dictionary"><div class="dict-top"><span class="meaning">nước</span>
            <p title="Anh - Mỹ"><span>/US/</span></p></div></div>
            <span class="meaning">unrelated</span>
            """);
        Assert.NotNull(reference);
        Assert.Null(reference.BritishIpa);
        Assert.Single(reference.Definitions);
        Assert.Empty(reference.Examples);
    }

    [Fact]
    public void InvalidIpaIsNotAutofilled()
    {
        var reference = ScandictProvider.Parse("""
            <div id="dictionary"><div class="dict-top"><span class="meaning">nghĩa</span>
            <p title="Anh - Anh"><span>/invalid $/</span></p></div></div>
            """);
        Assert.NotNull(reference);
        Assert.Null(reference.BritishIpa);
    }

    [Fact]
    public void UnknownWordsAreEmptyButChangedMarkupIsAnError()
    {
        Assert.Null(ScandictProvider.Parse("<p class='note-null'>ScanDict không tìm thấy</p>"));
        Assert.Throws<InvalidDataException>(() => ScandictProvider.Parse("<html>Site unavailable</html>"));
    }

    [Fact]
    public void BoundsResultsAndKeepsEntitiesAsPlainText()
    {
        var examples = string.Concat(Enumerable.Range(0, 12).Select(i => $"<li>Example {i} &amp; test <span>( Dịch {i} )</span></li>"));
        var reference = ScandictProvider.Parse($"<div id='dictionary'><div class='examples'><ul>{examples}</ul></div></div>");
        Assert.NotNull(reference);
        Assert.Equal(5, reference.Examples.Count);
        Assert.Equal("Example 0 & test", reference.Examples[0].Text);
    }

    [Fact]
    public async Task FollowsOnlySameOriginLookupRedirectAndEncodesTheTerm()
    {
        var calls = new List<Uri>();
        using var handler = new StubHandler(request =>
        {
            calls.Add(request.RequestUri!);
            return calls.Count == 1 ? Redirect("/dictionary/abandon-o2Qj3") : Html(Page);
        });
        using var client = new HttpClient(handler);
        var reference = await new ScandictProvider(client).LookupAsync("abandon & keep?", CancellationToken.None);
        Assert.NotNull(reference);
        Assert.Equal("?q=abandon%20%26%20keep%3F", calls[0].Query);
        Assert.Equal("/dictionary/abandon-o2Qj3", calls[1].AbsolutePath);
    }

    [Theory]
    [InlineData("https://other.example/dictionary/word")]
    [InlineData("http://scandict.com/dictionary/word")]
    [InlineData("https://scandict.com:444/dictionary/word")]
    [InlineData("https://scandict.com/unrelated")]
    public async Task RejectsUnexpectedRedirects(string location)
    {
        using var handler = new StubHandler(_ => Redirect(location));
        using var client = new HttpClient(handler);
        await Assert.ThrowsAsync<HttpRequestException>(() => new ScandictProvider(client).LookupAsync("word", CancellationToken.None));
    }

    [Fact]
    public async Task HandlesMissingWordAndRejectsServerErrorsAndOversizedBodies()
    {
        using var missingHandler = new StubHandler(_ => new HttpResponseMessage(HttpStatusCode.NotFound));
        using var missingClient = new HttpClient(missingHandler);
        Assert.Null(await new ScandictProvider(missingClient).LookupAsync("word", CancellationToken.None));
        using var errorHandler = new StubHandler(_ => new HttpResponseMessage(HttpStatusCode.InternalServerError));
        using var errorClient = new HttpClient(errorHandler);
        await Assert.ThrowsAsync<HttpRequestException>(() => new ScandictProvider(errorClient).LookupAsync("word", CancellationToken.None));
        using var largeHandler = new StubHandler(_ => Html(new string('x', 1_048_577)));
        using var largeClient = new HttpClient(largeHandler);
        await Assert.ThrowsAsync<HttpRequestException>(() => new ScandictProvider(largeClient).LookupAsync("word", CancellationToken.None));
    }

    private static HttpResponseMessage Html(string body) => new(HttpStatusCode.OK) { Content = new StringContent(body) };
    private static HttpResponseMessage Redirect(string location)
    {
        var response = new HttpResponseMessage(HttpStatusCode.Redirect);
        response.Headers.Location = new Uri(location, UriKind.RelativeOrAbsolute);
        return response;
    }
    private sealed class StubHandler(Func<HttpRequestMessage, HttpResponseMessage> respond) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken) => Task.FromResult(respond(request));
    }
}
