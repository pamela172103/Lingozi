namespace Lingozi.Library.Items;

/// <summary>A request that passed validation, with every string trimmed and empty optional strings turned into null (BR-LIB-001).</summary>
internal sealed record ValidItem(
    Guid? ClientRequestId,
    ItemKind Kind,
    string Term,
    string? Meaning,
    string? Formula,
    string? PartOfSpeech,
    string? Ipa,
    string? Note,
    IReadOnlyList<ExampleInput> Examples);

/// <summary>Server-side validation for create (BR-LIB-001, 002, 004, 012, 013, 016). Error values are reason codes the web app turns into messages.</summary>
internal static class ItemValidator
{
    public const string Required = "required";
    public const string TooLong = "too-long";
    public const string Invalid = "invalid";
    public const string NotAllowed = "not-allowed";
    public const string TooMany = "too-many";
    public const string InvalidCharacters = "invalid-characters";

    /// <param name="requireClientRequestId">True when creating (BR-LIB-008); false when editing.</param>
    public static (ValidItem? Item, Dictionary<string, string> Errors) Validate(KnowledgeItemInput? input, bool requireClientRequestId = true)
    {
        var errors = new Dictionary<string, string>();
        if (input is null)
        {
            errors["kind"] = Required;
            return (null, errors);
        }

        if (requireClientRequestId && (input.ClientRequestId is null || input.ClientRequestId == Guid.Empty))
        {
            errors["clientRequestId"] = Required;
        }

        ItemKind kind = default;
        var kindOk = ItemRules.TryParseKind(input.Kind, out kind);
        if (!kindOk)
        {
            errors["kind"] = string.IsNullOrEmpty(input.Kind) ? Required : Invalid;
        }

        var term = ItemRules.Clean(input.Term);
        var meaning = ItemRules.Clean(input.Meaning);
        var formula = ItemRules.Clean(input.Formula);
        var partOfSpeech = ItemRules.Clean(input.PartOfSpeech);
        var ipa = ItemRules.Clean(input.Ipa);
        var note = ItemRules.Clean(input.Note);

        Text(errors, "term", term, ItemRules.TermMax, required: true);
        Text(errors, "note", note, ItemRules.NoteMax, required: false);

        if (kindOk && kind == ItemKind.Word)
        {
            Text(errors, "meaning", meaning, ItemRules.MeaningMax, required: true);
            if (formula is not null)
            {
                errors["formula"] = NotAllowed;
            }

            if (partOfSpeech is not null && !ItemRules.PartsOfSpeech.Contains(partOfSpeech))
            {
                errors["partOfSpeech"] = Invalid;
            }

            if (ipa is not null)
            {
                if (ipa.Length > ItemRules.IpaMax)
                {
                    errors["ipa"] = TooLong;
                }
                else if (!ItemRules.IsIpa(ipa))
                {
                    errors["ipa"] = InvalidCharacters;
                }
            }
        }
        else if (kindOk)
        {
            Text(errors, "formula", formula, ItemRules.FormulaMax, required: true);
            Text(errors, "meaning", meaning, ItemRules.MeaningMax, required: false);
            if (partOfSpeech is not null)
            {
                errors["partOfSpeech"] = NotAllowed;
            }

            if (ipa is not null)
            {
                errors["ipa"] = NotAllowed;
            }
        }

        var examples = new List<ExampleInput>();
        var source = input.Examples ?? [];
        if (source.Count > ItemRules.MaxExamples)
        {
            errors["examples"] = TooMany;
        }

        for (var i = 0; i < source.Count && i < ItemRules.MaxExamples; i++)
        {
            var text = ItemRules.Clean(source[i]?.Text);
            var translation = ItemRules.Clean(source[i]?.Translation);
            Text(errors, $"examples[{i}].text", text, ItemRules.ExampleTextMax, required: true);
            Text(errors, $"examples[{i}].translation", translation, ItemRules.ExampleTranslationMax, required: false);
            examples.Add(new ExampleInput(text, translation));
        }

        if (errors.Count > 0 || term is null)
        {
            return (null, errors);
        }

        return (new ValidItem(input.ClientRequestId, kind, term, meaning, formula, partOfSpeech, ipa, note, examples), errors);
    }

    private static void Text(Dictionary<string, string> errors, string field, string? value, int max, bool required)
    {
        if (value is null)
        {
            if (required)
            {
                errors[field] = Required;
            }
        }
        else if (value.Length > max)
        {
            errors[field] = TooLong;
        }
    }
}
