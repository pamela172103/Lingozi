import { ensureXsrfToken, problemCode } from "@/lib/auth/api";

import { fromApiErrors, type FieldErrors } from "./form";
import type { ApiKind } from "./kinds";
import type { ItemDetail, ItemSummary, Suggestions } from "./types";

export type WriteItemResult =
  | { kind: "saved"; item: ItemDetail }
  | { kind: "invalid"; errors: FieldErrors }
  | { kind: "limit" }
  | { kind: "conflict"; current: ItemDetail }
  | { kind: "not-found" }
  | { kind: "unauthorized" }
  | { kind: "session-error" }
  | { kind: "network-error" };

async function fieldErrors(response: Response): Promise<FieldErrors> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "errors" in body &&
      typeof body.errors === "object" &&
      body.errors
    ) {
      return fromApiErrors(body.errors as Record<string, string>);
    }
  } catch {
    // Not a problem document.
  }
  return {};
}

/**
 * Sends a create (POST) or an edit (PUT). The antiforgery token is refreshed once on ERR-AUTH-400-05: a token fetched before
 * signing in is not valid for the signed-in user.
 */
async function writeItem(method: "POST" | "PUT", path: string, body: unknown): Promise<WriteItemResult> {
  try {
    for (const forceRefresh of [false, true]) {
      const token = await ensureXsrfToken(forceRefresh);
      if (!token) return { kind: "session-error" };

      const response = await fetch(path, {
        method,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
        body: JSON.stringify(body),
      });
      if (response.status === 201 || response.status === 200) {
        return { kind: "saved", item: (await response.json()) as ItemDetail };
      }
      if (response.status === 401) return { kind: "unauthorized" };
      if (response.status === 404) return { kind: "not-found" };
      if (response.status === 422) return { kind: "limit" };
      if (response.status === 409) {
        const data = (await response.json()) as { current?: ItemDetail };
        return data.current ? { kind: "conflict", current: data.current } : { kind: "network-error" };
      }
      const code = await problemCode(response.clone());
      if (response.status === 400 && code === "ERR-AUTH-400-05") {
        if (forceRefresh) return { kind: "session-error" };
        continue;
      }
      if (response.status === 400) return { kind: "invalid", errors: await fieldErrors(response) };
      return { kind: "network-error" };
    }
    return { kind: "session-error" };
  } catch {
    return { kind: "network-error" };
  }
}

/** US-LIB-01: saves one item. The same `clientRequestId` is sent on every retry, so a lost response or a second click never creates a duplicate (BR-LIB-008). */
export function createItem(body: { clientRequestId: string } & Record<string, unknown>): Promise<WriteItemResult> {
  return writeItem("POST", "/api/library/items", body);
}

/** US-LIB-05: saves an edit. `version` must be the one the form was loaded with; otherwise the answer is a conflict (BR-LIB-007). */
export function updateItem(id: string, body: Record<string, unknown>): Promise<WriteItemResult> {
  return writeItem("PUT", `/api/library/items/${encodeURIComponent(id)}`, body);
}

export type SimilarLookupResult = { kind: "found"; items: ItemSummary[]; totalCount: number } | { kind: "unavailable" };

/**
 * US-LIB-02: asks for items of the same library with the same normalized term. Only a hint: when the lookup fails the form
 * still saves (srs US-LIB-02, "không chặn việc lưu").
 */
export async function findSimilarItems(kind: ApiKind, term: string): Promise<SimilarLookupResult> {
  try {
    const params = new URLSearchParams({ kind, term });
    const response = await fetch(`/api/library/items/similar?${params.toString()}`, {
      credentials: "same-origin",
      cache: "no-store",
    });
    if (!response.ok) return { kind: "unavailable" };
    const data = (await response.json()) as { items?: ItemSummary[]; totalCount?: number };
    return { kind: "found", items: data.items ?? [], totalCount: data.totalCount ?? 0 };
  } catch {
    return { kind: "unavailable" };
  }
}

export type DeleteItemResult =
  | { kind: "deleted" }
  | { kind: "not-found" }
  | { kind: "unauthorized" }
  | { kind: "session-error" }
  | { kind: "network-error" };

/** US-LIB-06: deletes one item and its examples (FR-LIB-ITEM-006). Antiforgery token refreshed once, as for the other writes. */
export async function deleteItem(id: string): Promise<DeleteItemResult> {
  try {
    for (const forceRefresh of [false, true]) {
      const token = await ensureXsrfToken(forceRefresh);
      if (!token) return { kind: "session-error" };

      const response = await fetch(`/api/library/items/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "X-XSRF-TOKEN": token },
      });
      if (response.status === 204) return { kind: "deleted" };
      if (response.status === 404) return { kind: "not-found" };
      if (response.status === 401) return { kind: "unauthorized" };
      const code = await problemCode(response.clone());
      if (response.status === 400 && code === "ERR-AUTH-400-05") {
        if (forceRefresh) return { kind: "session-error" };
        continue;
      }
      return { kind: "network-error" };
    }
    return { kind: "session-error" };
  } catch {
    return { kind: "network-error" };
  }
}

/** US-LIB-08 and US-LIB-09: suggestions for the term being typed. Returns null when the request itself fails (no note is shown then). */
export async function findSuggestions(kind: ApiKind, term: string, signal: AbortSignal): Promise<Suggestions | null> {
  try {
    const params = new URLSearchParams({ kind, term });
    const response = await fetch(`/api/library/suggestions?${params.toString()}`, {
      credentials: "same-origin",
      cache: "no-store",
      signal,
    });
    if (!response.ok) return null;
    return (await response.json()) as Suggestions;
  } catch {
    return null;
  }
}
