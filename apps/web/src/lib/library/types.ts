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
