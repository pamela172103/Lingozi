using Lingozi.Library.Suggestions;

namespace Lingozi.Api.IntegrationTests;

/// <summary>Reads the dictionaryapi.dev format (ADR 0007). The sample is a trimmed copy of the response seen on 2026-11-11 for "water".</summary>
public sealed class DictionaryApiParserTests
{
    private const string Water = """
        [{"word":"water","phonetic":"/ˈwoːtə/","phonetics":[
          {"text":"/ˈwoːtə/","audio":""},
          {"text":"/ˈwɔːtə/","audio":"https://api.dictionaryapi.dev/media/pronunciations/en/water-uk.mp3"},
          {"text":"/ˈwɔtəɹ/","audio":"https://api.dictionaryapi.dev/media/pronunciations/en/water-us.mp3"}],
          "meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"A transparent liquid."},{"definition":"A transparent liquid."}]},
                      {"partOfSpeech":"verb","definitions":[{"definition":"To add water to."}]}]}]
        """;

    private static readonly string[] GainKnowledge = ["To gain knowledge."];

    private const string AmericanOnly = """[{"phonetics":[{"text":"/lɜrn/","audio":"x-us.mp3"}],"meanings":[{"definitions":[{"definition":"To gain knowledge."}]}]}]""";

    private static readonly string[] ExpectedDefinitions = ["A transparent liquid.", "To add water to."];

    [Fact]
    public void TakesTheBritishPronunciationAndDistinctDefinitions()
    {
        var reference = DictionaryApiProvider.Parse(Water);

        Assert.NotNull(reference);
        Assert.Equal("/ˈwɔːtə/", reference.BritishIpa);
        Assert.Equal(ExpectedDefinitions, reference.Definitions);
    }

    [Fact]
    public void AnAmericanOnlyWordHasNoBritishPronunciation()
    {
        var reference = DictionaryApiProvider.Parse(AmericanOnly);

        Assert.NotNull(reference);
        Assert.Null(reference.BritishIpa);
        Assert.Equal(GainKnowledge, reference.Definitions);
    }

    [Fact]
    public void AnEmptyAnswerIsNotAReference()
    {
        Assert.Null(DictionaryApiProvider.Parse("[]"));
    }

    [Fact]
    public void AnObjectInsteadOfAnArrayIsRejected()
    {
        Assert.Throws<System.Text.Json.JsonException>(() => DictionaryApiProvider.Parse("""{"title":"No Definitions Found"}"""));
    }
}
