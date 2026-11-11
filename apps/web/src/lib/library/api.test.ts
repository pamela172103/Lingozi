import { createItem } from "./api";

type Call = { url: string; init?: RequestInit };

function mockFetch(responses: Response[]) {
  const calls: Call[] = [];
  const queue = [...responses];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      if (url === "/api/auth/antiforgery") {
        document.cookie = `XSRF-TOKEN=token-${calls.length}; path=/`;
        return new Response(null, { status: 204 });
      }
      const next = queue.shift();
      if (!next) throw new Error("unexpected request");
      return next;
    }),
  );
  return calls;
}

const problem = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/problem+json" } });

const detail = { id: "abc", kind: "word", term: "give up", meaning: "từ bỏ", examples: [] };
const body = { clientRequestId: "req-1", kind: "word", term: "give up", meaning: "từ bỏ" };

describe("createItem", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  });
  afterEach(() => vi.unstubAllGlobals());

  it("posts with the antiforgery token and returns the saved item for 201 and for 200 (retry)", async () => {
    for (const status of [201, 200]) {
      const calls = mockFetch([new Response(JSON.stringify(detail), { status })]);

      const result = await createItem(body);

      expect(result).toMatchObject({ kind: "saved", item: { id: "abc" } });
      expect(calls.at(-1)?.url).toBe("/api/library/items");
      expect(calls.at(-1)?.init?.headers).toMatchObject({ "X-XSRF-TOKEN": expect.stringMatching(/^token-/u) });
      expect(calls.at(-1)?.init?.body).toBe(JSON.stringify(body));
      document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
  });

  it("maps ERR-LIB-400-01 field errors", async () => {
    mockFetch([
      problem(400, { code: "ERR-LIB-400-01", errors: { meaning: "required", "examples[0].text": "too-long" } }),
    ]);

    expect(await createItem(body)).toEqual({
      kind: "invalid",
      errors: { meaning: "required", "examples[0].text": "tooLong" },
    });
  });

  it("maps ERR-LIB-400-02 to the IPA error", async () => {
    mockFetch([problem(400, { code: "ERR-LIB-400-02", errors: { ipa: "invalid-characters" } })]);

    expect(await createItem(body)).toEqual({ kind: "invalid", errors: { ipa: "invalidIpa" } });
  });

  it("maps 422 to limit and 401 to unauthorized", async () => {
    mockFetch([problem(422, { code: "ERR-LIB-422-01" })]);
    expect(await createItem(body)).toEqual({ kind: "limit" });
    mockFetch([problem(401, {})]);
    document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    expect(await createItem(body)).toEqual({ kind: "unauthorized" });
  });

  it("retries once with a fresh antiforgery token on ERR-AUTH-400-05 (token from before sign-in), then saves", async () => {
    document.cookie = "XSRF-TOKEN=stale; path=/";
    const calls = mockFetch([
      problem(400, { code: "ERR-AUTH-400-05" }),
      new Response(JSON.stringify(detail), { status: 201 }),
    ]);

    const result = await createItem(body);

    expect(result.kind).toBe("saved");
    expect(calls.map((c) => c.url)).toEqual(["/api/library/items", "/api/auth/antiforgery", "/api/library/items"]);
    expect(calls[0]?.init?.headers).toMatchObject({ "X-XSRF-TOKEN": "stale" });
    expect(calls[2]?.init?.headers).toMatchObject({ "X-XSRF-TOKEN": "token-2" });
    expect(JSON.parse(String(calls[2]?.init?.body)).clientRequestId).toBe("req-1");
  });

  it("gives session-error when the second token is also refused", async () => {
    mockFetch([problem(400, { code: "ERR-AUTH-400-05" }), problem(400, { code: "ERR-AUTH-400-05" })]);

    expect(await createItem(body)).toEqual({ kind: "session-error" });
  });

  it("reports a lost connection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    expect(await createItem(body)).toEqual({ kind: "network-error" });
  });
});
