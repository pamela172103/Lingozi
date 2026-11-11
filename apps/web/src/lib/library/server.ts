import { cookies } from "next/headers";

import { getApiOrigin } from "@/lib/api-origin";

export type ApiResult<T> =
  { status: "ok"; data: T } | { status: "unauthorized" } | { status: "not-found" } | { status: "error" };

/** Calls the API from the Next.js server with the visitor's cookies, so the API sees the same session as the browser (ADR 0001). */
export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  try {
    const cookieHeader = (await cookies()).toString();
    const response = await fetch(`${getApiOrigin()}${path}`, {
      headers: cookieHeader ? { Cookie: cookieHeader } : {},
      cache: "no-store",
    });
    if (response.status === 401) return { status: "unauthorized" };
    if (response.status === 404) return { status: "not-found" };
    if (!response.ok) return { status: "error" };
    return { status: "ok", data: (await response.json()) as T };
  } catch {
    return { status: "error" };
  }
}
