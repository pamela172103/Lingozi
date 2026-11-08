import { afterEach, beforeEach, vi } from "vitest";

import { fetchSystemStatus } from "./system-status";

describe("fetchSystemStatus", () => {
  beforeEach(() => {
    vi.stubEnv("API_ORIGIN", "http://api.test:5080");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("calls the API status endpoint without caching and returns its body", async () => {
    const body = { api: "ok", database: "ok", pendingMigrations: 0, checkedAt: "2026-11-08T00:00:00Z" };
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(body), { status: 200 }));

    const result = await fetchSystemStatus(fetchImpl as unknown as typeof fetch);

    expect(result).toEqual({ kind: "ok", status: body });
    expect(fetchImpl).toHaveBeenCalledWith(
      "http://api.test:5080/api/system/status",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("reports api-unreachable on HTTP errors", async () => {
    const fetchImpl = vi.fn(async () => new Response("", { status: 502 }));
    expect(await fetchSystemStatus(fetchImpl as unknown as typeof fetch)).toEqual({ kind: "api-unreachable" });
  });

  it("reports api-unreachable when the request throws", async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError("fetch failed");
    });
    expect(await fetchSystemStatus(fetchImpl as unknown as typeof fetch)).toEqual({ kind: "api-unreachable" });
  });
});
