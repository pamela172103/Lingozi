import { ensureXsrfToken, post, problemCode } from "@/lib/auth/api";

import { fromApiErrors, type FieldErrors } from "./form";
import type { ItemDetail } from "./types";

export type CreateItemResult =
  | { kind: "saved"; item: ItemDetail }
  | { kind: "invalid"; errors: FieldErrors }
  | { kind: "limit" }
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
 * US-LIB-01: saves one item. The same `clientRequestId` is sent on every retry, so a lost response or a second click never
 * creates a duplicate (BR-LIB-008). The antiforgery token is refreshed once on ERR-AUTH-400-05: a token fetched before
 * signing in is not valid for the signed-in user.
 */
export async function createItem(
  body: { clientRequestId: string } & Record<string, unknown>,
): Promise<CreateItemResult> {
  try {
    for (const forceRefresh of [false, true]) {
      const token = await ensureXsrfToken(forceRefresh);
      if (!token) return { kind: "session-error" };

      const response = await post("/api/library/items", body, token);
      if (response.status === 201 || response.status === 200) {
        return { kind: "saved", item: (await response.json()) as ItemDetail };
      }
      if (response.status === 401) return { kind: "unauthorized" };
      if (response.status === 422) return { kind: "limit" };
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
