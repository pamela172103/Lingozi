import { requestEmailCode, verifyEmailCode } from "./api";

type FetchCall = { url: string; init?: RequestInit };

function problem(status: number, code: string, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify({ code }), {
    status,
    headers: { "Content-Type": "application/problem+json", ...headers },
  });
}

function mockFetch(responses: Response[]) {
  const calls: FetchCall[] = [];
  const queue = [...responses];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url === "/api/auth/antiforgery") {
        document.cookie = "XSRF-TOKEN=token-" + calls.length + "; path=/";
        return new Response(null, { status: 204 });
      }
      const next = queue.shift();
      if (!next) throw new Error("unexpected request");
      return next;
    }),
  );
  return calls;
}

describe("requestEmailCode", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });
  afterEach(() => vi.unstubAllGlobals());

  it("gets an antiforgery token, posts the email and returns resendAfterSeconds", async () => {
    const calls = mockFetch([
      new Response(JSON.stringify({ status: "check-email", resendAfterSeconds: 60 }), { status: 202 }),
    ]);

    const result = await requestEmailCode("an@example.com");

    expect(result).toEqual({ kind: "sent", resendAfterSeconds: 60 });
    expect(calls.map((c) => c.url)).toEqual(["/api/auth/antiforgery", "/api/auth/email-code/request"]);
    expect(calls[1]?.init?.headers).toMatchObject({ "X-XSRF-TOKEN": "token-1" });
    expect(calls[1]?.init?.body).toBe(JSON.stringify({ email: "an@example.com" }));
  });

  it("maps ERR-AUTH-400-01 to invalid-email", async () => {
    mockFetch([problem(400, "ERR-AUTH-400-01")]);
    expect(await requestEmailCode("an@")).toEqual({ kind: "invalid-email" });
  });

  it("maps 429 to rate-limited using Retry-After", async () => {
    mockFetch([problem(429, "ERR-AUTH-429-01", { "Retry-After": "30" })]);
    expect(await requestEmailCode("an@example.com")).toEqual({ kind: "rate-limited", retryAfterSeconds: 30 });
  });

  it("falls back to 60 seconds when Retry-After is missing", async () => {
    mockFetch([problem(429, "ERR-AUTH-429-01")]);
    expect(await requestEmailCode("an@example.com")).toEqual({ kind: "rate-limited", retryAfterSeconds: 60 });
  });

  it("refreshes the antiforgery token once on ERR-AUTH-400-05, then succeeds", async () => {
    const calls = mockFetch([
      problem(400, "ERR-AUTH-400-05"),
      new Response(JSON.stringify({ resendAfterSeconds: 60 }), { status: 202 }),
    ]);

    expect(await requestEmailCode("an@example.com")).toEqual({ kind: "sent", resendAfterSeconds: 60 });
    expect(calls.filter((c) => c.url === "/api/auth/antiforgery")).toHaveLength(2);
  });

  it("gives up with session-error when the token is rejected twice", async () => {
    mockFetch([problem(400, "ERR-AUTH-400-05"), problem(400, "ERR-AUTH-400-05")]);
    expect(await requestEmailCode("an@example.com")).toEqual({ kind: "session-error" });
  });

  it("reports network-error when fetch throws or the server fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    expect(await requestEmailCode("an@example.com")).toEqual({ kind: "network-error" });

    mockFetch([new Response("oops", { status: 500 })]);
    expect(await requestEmailCode("an@example.com")).toEqual({ kind: "network-error" });
  });
});

describe("verifyEmailCode", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });
  afterEach(() => vi.unstubAllGlobals());

  it("posts the email and code with the token and returns the redirect", async () => {
    const calls = mockFetch([new Response(JSON.stringify({ redirectTo: "/library" }), { status: 200 })]);

    expect(await verifyEmailCode("an@example.com", "123456")).toEqual({ kind: "signed-in", redirectTo: "/library" });
    expect(calls[1]?.url).toBe("/api/auth/email-code/verify");
    expect(calls[1]?.init?.body).toBe(JSON.stringify({ email: "an@example.com", code: "123456" }));
  });

  it("maps 401-01 to wrong-code with the remaining attempts", async () => {
    mockFetch([
      new Response(JSON.stringify({ code: "ERR-AUTH-401-01", remainingAttempts: 3 }), {
        status: 401,
        headers: { "Content-Type": "application/problem+json" },
      }),
    ]);
    expect(await verifyEmailCode("an@example.com", "000000")).toEqual({ kind: "wrong-code", remainingAttempts: 3 });
  });

  it("maps 403-02 to locked and 400-03 to unavailable", async () => {
    mockFetch([problem(403, "ERR-AUTH-403-02")]);
    expect(await verifyEmailCode("an@example.com", "000000")).toEqual({ kind: "locked" });

    mockFetch([problem(400, "ERR-AUTH-400-03")]);
    expect(await verifyEmailCode("an@example.com", "000000")).toEqual({ kind: "unavailable" });
  });

  it("maps 429 to rate-limited using Retry-After", async () => {
    mockFetch([problem(429, "ERR-AUTH-429-01", { "Retry-After": "12" })]);
    expect(await verifyEmailCode("an@example.com", "000000")).toEqual({ kind: "rate-limited", retryAfterSeconds: 12 });
  });

  it("refreshes the token once on ERR-AUTH-400-05", async () => {
    mockFetch([
      problem(400, "ERR-AUTH-400-05"),
      new Response(JSON.stringify({ redirectTo: "/library" }), { status: 200 }),
    ]);
    expect(await verifyEmailCode("an@example.com", "123456")).toEqual({ kind: "signed-in", redirectTo: "/library" });
  });

  it("reports network-error when fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    expect(await verifyEmailCode("an@example.com", "123456")).toEqual({ kind: "network-error" });
  });
});
