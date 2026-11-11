import type { FormValues } from "./form";
import type { LibraryKind } from "./kinds";

/**
 * The text typed in the create form, handed to the edit screen of the old item (US-LIB-02 AC-02, W-LIB-15).
 * It lives in sessionStorage: one browser tab, cleared when the tab closes, never sent anywhere. It is not saved state (AGENTS §6).
 */
const key = (kind: LibraryKind, id: string) => `lingozi.library-draft.${kind}.${id}`;

export function saveDraft(kind: LibraryKind, id: string, values: FormValues): void {
  try {
    window.sessionStorage.setItem(key(kind, id), JSON.stringify(values));
  } catch {
    // Storage can be blocked (private mode). The edit screen then simply has no panel.
  }
}

/** The stored text as a string (stable between reads, so it can be used with useSyncExternalStore). */
export function readDraftRaw(kind: LibraryKind, id: string): string | null {
  try {
    return window.sessionStorage.getItem(key(kind, id));
  } catch {
    return null;
  }
}

export function parseDraft(raw: string | null): FormValues | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FormValues;
  } catch {
    return null;
  }
}

export function readDraft(kind: LibraryKind, id: string): FormValues | null {
  return parseDraft(readDraftRaw(kind, id));
}

export function clearDraft(kind: LibraryKind, id: string): void {
  try {
    window.sessionStorage.removeItem(key(kind, id));
  } catch {
    // Nothing to clear.
  }
}
