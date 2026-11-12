import type { ApiKind } from "./kinds";

export interface ExampleView {
  text: string;
  translation: string | null;
}

/** KnowledgeItemDetail (srs/README §4.3). */
export interface ItemDetail {
  id: string;
  kind: ApiKind;
  term: string;
  meaning: string | null;
  formula: string | null;
  partOfSpeech: string | null;
  ipa: string | null;
  ipaSource: "dictionary" | "user" | null;
  note: string | null;
  examples: ExampleView[];
  createdAt: string;
  updatedAt: string;
  version: string;
}

/** KnowledgeItemSummary: one card of a list. */
export interface ItemSummary {
  id: string;
  kind: ApiKind;
  term: string;
  meaning: string | null;
  formula: string | null;
  partOfSpeech: string | null;
  ipa: string | null;
  createdAt: string;
}

export interface ItemPage {
  items: ItemSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
}

/** GET /api/library/suggestions (US-LIB-08, US-LIB-09). Nothing here is saved until the user keeps it in the form. */
export interface Suggestions {
  provider?: string | null;
  ipa: { value: string; source: "dictionary" } | null;
  /** False when no outside word source is configured (ADR 0007): the form then shows no note about it. */
  sourceEnabled: boolean;
  /** False when the configured source failed or timed out (BR-LIB-015). */
  sourceAvailable: boolean;
  meanings: { text: string; source: "own" | "dictionary" }[];
  /** Optional for compatibility with servers deployed before example suggestions. */
  examples?: ExampleView[];
}
