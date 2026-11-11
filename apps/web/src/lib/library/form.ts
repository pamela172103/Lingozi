import type { ItemDetail } from "./types";
import { API_KIND, LIMITS, type LibraryKind } from "./kinds";

export interface ExampleValues {
  /** Stable key for React; never sent to the API. */
  key: string;
  text: string;
  translation: string;
}

export interface FormValues {
  term: string;
  ipa: string;
  meaning: string;
  formula: string;
  partOfSpeech: string;
  note: string;
  examples: ExampleValues[];
}

export function emptyValues(): FormValues {
  return { term: "", ipa: "", meaning: "", formula: "", partOfSpeech: "", note: "", examples: [] };
}

/** Why a field is wrong; the form turns it into a Vietnamese message (messages/vi.json, Library.form.error). */
export type FieldError = "required" | "tooLong" | "invalidIpa" | "tooMany" | "invalid";

/** Field names as the API reports them (`errors` in ERR-LIB-400-01), e.g. `term`, `examples[0].text`. */
export type FieldErrors = Record<string, FieldError>;

/** The order of the fields on each form (US-LIB-01 quy ước 2026-11-11). */
export const FIELD_ORDER: Record<LibraryKind, readonly string[]> = {
  vocabulary: ["term", "ipa", "meaning", "partOfSpeech", "examples", "note"],
  grammar: ["term", "formula", "meaning", "examples", "note"],
};

const REQUIRED: Record<LibraryKind, readonly string[]> = {
  vocabulary: ["term", "meaning"],
  grammar: ["term", "formula"],
};

// Letters allowed by the API (ItemRules.IsIpa): ASCII letters, the IPA blocks, a few borrowed letters, and / [ ] ( ) . ‿ and space.
const IPA = /^[A-Za-zɐ-ͯæðŋœθβχ/[\]().‿ ]*$/u;

/** Client-side checks that mirror the API (BR-LIB-001, 004, 012, 013). The API still validates everything again. */
export function validate(kind: LibraryKind, values: FormValues): FieldErrors {
  const errors: FieldErrors = {};
  const text = (field: "term" | "meaning" | "formula" | "note", max: number) => {
    const value = values[field].trim();
    if (value.length > max) errors[field] = "tooLong";
    else if (!value && REQUIRED[kind].includes(field)) errors[field] = "required";
  };

  text("term", LIMITS.term);
  text("meaning", LIMITS.meaning);
  text("note", LIMITS.note);
  if (kind === "grammar") text("formula", LIMITS.formula);

  if (kind === "vocabulary") {
    const ipa = values.ipa.trim();
    if (ipa.length > LIMITS.ipa) errors.ipa = "tooLong";
    else if (ipa && !IPA.test(ipa)) errors.ipa = "invalidIpa";
  }

  const used = values.examples.filter((e) => e.text.trim() || e.translation.trim());
  if (used.length > LIMITS.examples) errors.examples = "tooMany";
  used.forEach((example, index) => {
    if (!example.text.trim()) errors[`examples[${index}].text`] = "required";
    else if (example.text.trim().length > LIMITS.exampleText) errors[`examples[${index}].text`] = "tooLong";
    if (example.translation.trim().length > LIMITS.exampleTranslation)
      errors[`examples[${index}].translation`] = "tooLong";
  });
  return errors;
}

/** Fields of an item body (create and edit). Empty example rows are dropped; the API trims and turns empty optionals into null. */
export function toBody(kind: LibraryKind, values: FormValues) {
  const base = {
    kind: API_KIND[kind],
    term: values.term,
    meaning: values.meaning,
    note: values.note,
    examples: values.examples
      .filter((e) => e.text.trim() || e.translation.trim())
      .map((e) => ({ text: e.text, translation: e.translation })),
  };
  return kind === "vocabulary"
    ? { ...base, ipa: values.ipa, partOfSpeech: values.partOfSpeech }
    : { ...base, formula: values.formula };
}

/** Body of `POST /api/library/items`: the fields plus the request id that makes retries idempotent (BR-LIB-008). */
export function toRequest(kind: LibraryKind, values: FormValues, clientRequestId: string) {
  return { clientRequestId, ...toBody(kind, values) };
}

/** Body of `PUT /api/library/items/{id}`: the fields plus the version the form was loaded with (BR-LIB-007). */
export function toUpdateRequest(kind: LibraryKind, values: FormValues, version: string) {
  return { ...toBody(kind, values), version };
}

/** The form values of a saved item, so an edit starts from what is stored. */
export function valuesFromItem(item: ItemDetail): FormValues {
  return {
    term: item.term,
    ipa: item.ipa ?? "",
    meaning: item.meaning ?? "",
    formula: item.formula ?? "",
    partOfSpeech: item.partOfSpeech ?? "",
    note: item.note ?? "",
    examples: item.examples.map((example, index) => ({
      key: `saved-${index}`,
      text: example.text,
      translation: example.translation ?? "",
    })),
  };
}

/** Maps the API's reason codes (ItemValidator) to the form's. */
export function fromApiErrors(errors: Record<string, string>): FieldErrors {
  const map: Record<string, FieldError> = {
    required: "required",
    "too-long": "tooLong",
    "invalid-characters": "invalidIpa",
    "too-many": "tooMany",
  };
  return Object.fromEntries(Object.entries(errors).map(([field, reason]) => [field, map[reason] ?? "invalid"]));
}
