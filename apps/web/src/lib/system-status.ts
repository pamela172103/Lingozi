import { getApiOrigin } from "./api-origin";

export type SystemStatus = {
  api: "ok";
  database: "ok" | "unavailable";
  pendingMigrations: number | null;
  checkedAt: string;
};

export type SystemStatusResult = { kind: "ok"; status: SystemStatus } | { kind: "api-unreachable" };

const TIMEOUT_MS = 5000;

/** Server-side call to GET /api/system/status (walking skeleton: web → API → SQL Server). */
export async function fetchSystemStatus(fetchImpl: typeof fetch = fetch): Promise<SystemStatusResult> {
  try {
    const response = await fetchImpl(`${getApiOrigin()}/api/system/status`, {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      console.error(`System status request failed with HTTP ${response.status}`);
      return { kind: "api-unreachable" };
    }
    return { kind: "ok", status: (await response.json()) as SystemStatus };
  } catch (error) {
    console.error("System status request failed", error instanceof Error ? error.message : error);
    return { kind: "api-unreachable" };
  }
}
