/** The two libraries of FEAT-02 (BR-LIB-017). `LibraryKind` is the route segment; `apiKind` is the `kind` the API stores (BR-LIB-002). */
export type LibraryKind = "vocabulary" | "grammar";
export type ApiKind = "word" | "grammar";

export const LIBRARY_KINDS: readonly LibraryKind[] = ["vocabulary", "grammar"];

export const API_KIND: Record<LibraryKind, ApiKind> = { vocabulary: "word", grammar: "grammar" };

export function libraryKindFromApi(kind: ApiKind): LibraryKind {
  return kind === "word" ? "vocabulary" : "grammar";
}

export function libraryPath(kind: LibraryKind, ...rest: string[]): string {
  return ["/library", kind, ...rest].join("/");
}

/** BR-LIB-016: the only values the API accepts for "Loại từ". */
export const PARTS_OF_SPEECH = [
  "Danh từ",
  "Động từ",
  "Tính từ",
  "Trạng từ",
  "Giới từ",
  "Liên từ",
  "Thán từ",
  "Cụm từ",
  "Khác",
] as const;

/** BR-LIB-001 / BR-LIB-004 / BR-LIB-013. Same numbers as the API (`ItemRules`). */
export const LIMITS = {
  term: 1000,
  formula: 1000,
  meaning: 2000,
  note: 4000,
  ipa: 200,
  exampleText: 1000,
  exampleTranslation: 1000,
  examples: 20,
} as const;
