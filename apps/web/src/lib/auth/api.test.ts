import { requestEmailCode } from "./api";

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
