/** Paging of the library lists (BR-LIB-011): page ≥ 1 (default 1), pageSize 1–50 (default 20; larger is capped at 50). */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;

export function parsePage(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : 1;
}

export function parsePageSize(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? `${DEFAULT_PAGE_SIZE}`, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return DEFAULT_PAGE_SIZE;
  return Math.min(parsed, MAX_PAGE_SIZE);
}

/** Number of pages; an empty library still has one (empty) page. */
export function pageCount(totalCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

/** Link to a page of a library list. The default page size is left out of the URL. */
export function listHref(libraryPathOf: string, page: number, pageSize: number): string {
  const params = new URLSearchParams();
  if (page !== 1) params.set("page", String(page));
  if (pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(pageSize));
  const query = params.toString();
  return query ? `${libraryPathOf}?${query}` : libraryPathOf;
}

/** The one-time notice after an action on an item: `?notice=deleted` or `?notice=gone` (US-LIB-06). Anything else is ignored. */
export function parseNotice(value: string | undefined): "deleted" | "gone" | null {
  return value === "deleted" || value === "gone" ? value : null;
}
