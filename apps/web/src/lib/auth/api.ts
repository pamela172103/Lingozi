/** Browser calls to the auth API. Same origin only: Next.js proxies /api/* to ASP.NET Core (ADR 0001). */

export type RequestCodeResult =
  | { kind: "sent"; resendAfterSeconds: number }
  | { kind: "invalid-email" }
  | { kind: "rate-limited"; retryAfterSeconds: number }
  | { kind: "session-error" }
  | { kind: "network-error" };

const XSRF_COOKIE = "XSRF-TOKEN";
export const DEFAULT_RETRY_AFTER_SECONDS = 60;

function readXsrfToken(): string | null {
  const entry = document.cookie.split("; ").find((c) => c.startsWith(`${XSRF_COOKIE}=`));
  return entry ? decodeURIComponent(entry.slice(XSRF_COOKIE.length + 1)) : null;
}

export async function ensureXsrfToken(forceRefresh: boolean): Promise<string | null> {
  const existing = forceRefresh ? null : readXsrfToken();
  if (existing) return existing;
  await fetch("/api/auth/antiforgery", { credentials: "same-origin", cache: "no-store" });
  return readXsrfToken();
}

export async function problemCode(response: Response): Promise<string | null> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null && "code" in body && typeof body.code === "string") return body.code;
  } catch {
    // Not a problem document.
  }
  return null;
}

export async function post(path: string, body: unknown, token: string): Promise<Response> {
  return fetch(path, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": token },
    body: JSON.stringify(body),
  });
}

/** US-AUTH-01: asks the API to email a 6-digit code. Retries once with a fresh antiforgery token (ERR-AUTH-400-05). */
export async function requestEmailCode(email: string): Promise<RequestCodeResult> {
  try {
    for (const forceRefresh of [false, true]) {
      const token = await ensureXsrfToken(forceRefresh);
      if (!token) return { kind: "session-error" };

      const response = await post("/api/auth/email-code/request", { email }, token);
      if (response.status === 202) {
        const data = (await response.json()) as { resendAfterSeconds?: number };
        return { kind: "sent", resendAfterSeconds: data.resendAfterSeconds ?? DEFAULT_RETRY_AFTER_SECONDS };
      }
      if (response.status === 429) {
        const seconds = Number.parseInt(response.headers.get("Retry-After") ?? "", 10);
        return {
          kind: "rate-limited",
          retryAfterSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_SECONDS,
        };
      }
      const code = await problemCode(response);
      if (response.status === 400 && code === "ERR-AUTH-400-01") return { kind: "invalid-email" };
      if (response.status === 400 && code === "ERR-AUTH-400-05" && !forceRefresh) continue;
      if (response.status === 400 && code === "ERR-AUTH-400-05") return { kind: "session-error" };
      return { kind: "network-error" };
    }
    return { kind: "session-error" };
  } catch {
    return { kind: "network-error" };
  }
}

export type VerifyCodeResult =
  | { kind: "signed-in"; redirectTo: string }
  | { kind: "wrong-code"; remainingAttempts: number }
  | { kind: "locked" }
  | { kind: "unavailable" }
  | { kind: "rate-limited"; retryAfterSeconds: number }
  | { kind: "invalid-email" }
  | { kind: "session-error" }
  | { kind: "network-error" };

async function problemBody(response: Response): Promise<{ code: string | null; remainingAttempts: number | null }> {
  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null) {
      const code = "code" in body && typeof body.code === "string" ? body.code : null;
      const remaining =
        "remainingAttempts" in body && typeof body.remainingAttempts === "number" ? body.remainingAttempts : null;
      return { code, remainingAttempts: remaining };
    }
  } catch {
    // Not a problem document.
  }
  return { code: null, remainingAttempts: null };
}

/** US-AUTH-02: checks the 6-digit code. Retries once with a fresh antiforgery token (ERR-AUTH-400-05). */
export async function verifyEmailCode(email: string, code: string): Promise<VerifyCodeResult> {
  try {
    for (const forceRefresh of [false, true]) {
      const token = await ensureXsrfToken(forceRefresh);
      if (!token) return { kind: "session-error" };

      const response = await post("/api/auth/email-code/verify", { email, code }, token);
      if (response.status === 200) {
        const data = (await response.json()) as { redirectTo?: string };
        return { kind: "signed-in", redirectTo: data.redirectTo ?? "/library" };
      }
      if (response.status === 429) {
        const seconds = Number.parseInt(response.headers.get("Retry-After") ?? "", 10);
        return {
          kind: "rate-limited",
          retryAfterSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : DEFAULT_RETRY_AFTER_SECONDS,
        };
      }
      const { code: errorCode, remainingAttempts } = await problemBody(response);
      if (response.status === 401 && errorCode === "ERR-AUTH-401-01") {
        return { kind: "wrong-code", remainingAttempts: remainingAttempts ?? 0 };
      }
      if (response.status === 403 && errorCode === "ERR-AUTH-403-02") return { kind: "locked" };
      if (response.status === 400 && errorCode === "ERR-AUTH-400-03") return { kind: "unavailable" };
      if (response.status === 400 && errorCode === "ERR-AUTH-400-01") return { kind: "invalid-email" };
      if (response.status === 400 && errorCode === "ERR-AUTH-400-05" && !forceRefresh) continue;
      if (response.status === 400 && errorCode === "ERR-AUTH-400-05") return { kind: "session-error" };
      return { kind: "network-error" };
    }
    return { kind: "session-error" };
  } catch {
    return { kind: "network-error" };
  }
}
