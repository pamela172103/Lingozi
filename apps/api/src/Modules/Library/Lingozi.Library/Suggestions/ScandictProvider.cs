using System.Net;
using System.Text.RegularExpressions;
using AngleSharp.Dom;
using AngleSharp.Html.Parser;

namespace Lingozi.Library.Suggestions;

/// <summary>Reads Scandict's public Vietnamese lookup page; no browser, scripts or subresources are executed.</summary>
public sealed partial class ScandictProvider(HttpClient client) : IWordReferenceProvider
{
    public string Name => "scandict";
    public bool Enabled => true;
    private const int MaxBodyBytes = 1_048_576;

    public async Task<WordReference?> LookupAsync(string word, CancellationToken cancellationToken)
    {
        var uri = new Uri($"https://scandict.com/search-redirect?q={Uri.EscapeDataString(word)}");
        for (var redirects = 0; redirects <= 3; redirects++)
        {
            using var response = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if ((int)response.StatusCode is >= 300 and < 400)
            {
                var location = response.Headers.Location ?? throw new HttpRequestException("Missing lookup redirect.");
                var next = new Uri(uri, location);
                if (next.Scheme != Uri.UriSchemeHttps || next.Host != "scandict.com" || next.Port != 443
                    || next.UserInfo.Length != 0 || !(next.AbsolutePath.StartsWith("/dictionary/", StringComparison.Ordinal)
                    || next.AbsolutePath == "/search"))
                    throw new HttpRequestException("Unexpected lookup redirect.");
                uri = next;
                continue;
            }
            if (response.StatusCode == HttpStatusCode.NotFound) return null;
            response.EnsureSuccessStatusCode();
            if (response.Content.Headers.ContentLength > MaxBodyBytes)
                throw new HttpRequestException("Lookup response too large.");
            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var buffer = new MemoryStream();
            var chunk = new byte[8192];
            int count;
            while ((count = await stream.ReadAsync(chunk, cancellationToken)) > 0)
            {
                if (buffer.Length + count > MaxBodyBytes) throw new HttpRequestException("Lookup response too large.");
                buffer.Write(chunk, 0, count);
            }
            buffer.Position = 0;
            using var reader = new StreamReader(buffer);
            return Parse(await reader.ReadToEndAsync(cancellationToken));
        }
        throw new HttpRequestException("Too many lookup redirects.");
    }

    public static WordReference? Parse(string html)
    {
        using var document = new HtmlParser().ParseDocument(html);
        var dictionary = document.QuerySelector("#dictionary");
        if (dictionary is null)
        {
            if (document.QuerySelector(".note-null") is not null) return null;
            throw new InvalidDataException("Scandict lookup markup changed.");
        }
        var british = dictionary.QuerySelectorAll(".dict-top p[title='Anh - Anh'] span")
            .Select(element => Clean(element.TextContent))
            .FirstOrDefault(text => text.StartsWith('/') && text.EndsWith('/')
                && text.Length <= Items.ItemRules.IpaMax && Items.ItemRules.IsIpa(text));
        var definitions = new List<string>();
        // Short Vietnamese gloss first, followed by the Vietnamese definitions for each sense.
        AddDefinition(Clean(dictionary.QuerySelector(".dict-top .meaning")?.TextContent));
        foreach (var span in dictionary.QuerySelectorAll(".gramma > ul > li > span"))
            AddDefinition(Translation(span.TextContent));

        var examples = new List<ReferenceExample>();
        foreach (var item in dictionary.QuerySelectorAll(".examples > ul > li, .gramma .list-dict > li"))
        {
            var translation = item.QuerySelector(":scope > span");
            var translated = translation is null ? null : Translation(translation.TextContent);
            translation?.Remove();
            var text = Clean(item.TextContent).TrimEnd(' ', '-');
            if (text.Length is 0 or > Items.ItemRules.ExampleTextMax
                || translated?.Length > Items.ItemRules.ExampleTranslationMax
                || examples.Any(example => string.Equals(example.Text, text, StringComparison.OrdinalIgnoreCase))) continue;
            examples.Add(new ReferenceExample(text, string.IsNullOrEmpty(translated) ? null : translated));
            if (examples.Count == SuggestionService.MaxExamples) break;
        }
        return new WordReference(british, definitions) { Examples = examples };

        void AddDefinition(string definition)
        {
            if (definitions.Count < SuggestionService.MaxMeanings && definition.Length is > 0 and <= Items.ItemRules.MeaningMax
                && !definitions.Contains(definition, StringComparer.OrdinalIgnoreCase)) definitions.Add(definition);
        }
    }

    private static string Translation(string text)
    {
        var clean = Clean(text);
        return clean.StartsWith('(') && clean.EndsWith(')') ? clean[1..^1].Trim() : clean;
    }

    private static string Clean(string? text) => Whitespace().Replace(text ?? string.Empty, " ").Trim();

    [GeneratedRegex(@"\s+")]
    private static partial Regex Whitespace();
}
