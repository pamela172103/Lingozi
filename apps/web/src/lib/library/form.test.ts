import { emptyValues, fromApiErrors, toRequest, validate, type FormValues } from "./form";

function values(patch: Partial<FormValues>): FormValues {
  return { ...emptyValues(), ...patch };
}

describe("validate", () => {
  it("requires Từ and Nghĩa for vocabulary, treating spaces as empty (AC-02)", () => {
    expect(validate("vocabulary", values({ term: "  ", meaning: " " }))).toEqual({
      term: "required",
      meaning: "required",
    });
    expect(validate("vocabulary", values({ term: "give up", meaning: "từ bỏ" }))).toEqual({});
  });

  it("requires Tên cấu trúc and Công thức for grammar and leaves Ý nghĩa optional (AC-03, AC-05)", () => {
    expect(validate("grammar", values({ meaning: "   " }))).toEqual({ term: "required", formula: "required" });
    expect(validate("grammar", values({ term: "Present perfect", formula: "have/has + V3", meaning: "   " }))).toEqual(
      {},
    );
  });

  it("does not ask a word for a formula or grammar for a meaning", () => {
    expect(validate("vocabulary", values({ term: "a", meaning: "b" }))).not.toHaveProperty("formula");
    expect(validate("grammar", values({ term: "a", formula: "b" }))).not.toHaveProperty("meaning");
  });

  it("accepts the exact length limits and rejects one more (AC-06)", () => {
    const ok = values({ term: "a".repeat(1000), meaning: "b".repeat(2000), note: "c".repeat(4000) });
    expect(validate("vocabulary", ok)).toEqual({});
    const tooLong = values({ term: "a".repeat(1001), meaning: "b".repeat(2001), note: "c".repeat(4001) });
    expect(validate("vocabulary", tooLong)).toEqual({ term: "tooLong", meaning: "tooLong", note: "tooLong" });
    expect(validate("grammar", values({ term: "a", formula: "f".repeat(1001), meaning: "m".repeat(2001) }))).toEqual({
      formula: "tooLong",
      meaning: "tooLong",
    });
  });

  it("checks the IPA characters (ERR-LIB-400-02)", () => {
    const base = { term: "give", meaning: "cho" };
    expect(validate("vocabulary", values({ ...base, ipa: "/ˈwɔːtə/" }))).toEqual({});
    expect(validate("vocabulary", values({ ...base, ipa: "/ɔːlˈðəʊ/" }))).toEqual({});
    expect(validate("vocabulary", values({ ...base, ipa: "<b>give</b>" }))).toEqual({ ipa: "invalidIpa" });
  });

  it("ignores empty example rows and flags an example with only a translation (AC-07)", () => {
    const rows = [
      { key: "a", text: "", translation: "" },
      { key: "b", text: "", translation: "dịch" },
    ];
    expect(validate("vocabulary", values({ term: "a", meaning: "b", examples: rows }))).toEqual({
      "examples[0].text": "required",
    });
  });

  it("allows 20 examples and refuses 21 (BR-LIB-004)", () => {
    const rows = (n: number) =>
      Array.from({ length: n }, (_, i) => ({ key: `k${i}`, text: `Example ${i}`, translation: "" }));
    expect(validate("vocabulary", values({ term: "a", meaning: "b", examples: rows(20) }))).toEqual({});
    expect(validate("vocabulary", values({ term: "a", meaning: "b", examples: rows(21) }))).toEqual({
      examples: "tooMany",
    });
  });
});

describe("toRequest", () => {
  it("builds the vocabulary body in the API shape and drops empty example rows", () => {
    const body = toRequest(
      "vocabulary",
      values({
        term: "give up",
        meaning: "từ bỏ",
        ipa: "/ɡɪv ʌp/",
        partOfSpeech: "Động từ",
        examples: [
          { key: "a", text: "Don't give up.", translation: "Đừng bỏ cuộc." },
          { key: "b", text: "", translation: "" },
        ],
      }),
      "req-1",
    );

    expect(body).toEqual({
      clientRequestId: "req-1",
      kind: "word",
      term: "give up",
      meaning: "từ bỏ",
      ipa: "/ɡɪv ʌp/",
      partOfSpeech: "Động từ",
      note: "",
      examples: [{ text: "Don't give up.", translation: "Đừng bỏ cuộc." }],
    });
  });

  it("sends a formula and no IPA or part of speech for grammar", () => {
    const body = toRequest(
      "grammar",
      values({ term: "Present perfect", formula: "have/has + V3", ipa: "x", partOfSpeech: "Khác" }),
      "req-2",
    );

    expect(body).toMatchObject({ kind: "grammar", formula: "have/has + V3" });
    expect(body).not.toHaveProperty("ipa");
    expect(body).not.toHaveProperty("partOfSpeech");
  });
});

describe("fromApiErrors", () => {
  it("maps the API reason codes", () => {
    expect(
      fromApiErrors({
        term: "required",
        meaning: "too-long",
        ipa: "invalid-characters",
        examples: "too-many",
        kind: "invalid",
      }),
    ).toEqual({
      term: "required",
      meaning: "tooLong",
      ipa: "invalidIpa",
      examples: "tooMany",
      kind: "invalid",
    });
  });
});
