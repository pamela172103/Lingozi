import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";

import { listHref, pageCount } from "@/lib/library/paging";
import { libraryKindFromApi, libraryPath, type LibraryKind } from "@/lib/library/kinds";
import type { ItemPage, ItemSummary } from "@/lib/library/types";

function Card({ item, date }: { item: ItemSummary; date: string }) {
  const grammar = libraryKindFromApi(item.kind) === "grammar";
  return (
    <li className="min-w-0">
      <Link
        href={libraryPath(libraryKindFromApi(item.kind), item.id)}
        className="flex h-full flex-col gap-2 rounded-card bg-surface p-5 shadow-card hover:shadow-overlay"
      >
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0 text-base font-semibold break-words text-primary">{item.term}</span>
          {item.partOfSpeech && (
            <span className="shrink-0 rounded-full bg-accent-subtle px-2 py-0.5 text-xs font-semibold text-accent-text">
              {item.partOfSpeech}
            </span>
          )}
        </span>
        {grammar && item.formula && (
          <code className="font-mono text-[13px] break-words text-secondary">{item.formula}</code>
        )}
        {!grammar && item.ipa && <span className="text-[13px] text-muted">{item.ipa}</span>}
        {item.meaning && <span className="line-clamp-2 text-sm text-secondary">{item.meaning}</span>}
        <span className="mt-auto text-xs text-muted">{date}</span>
      </Link>
    </li>
  );
}

/** One page of cards (W-LIB-01, W-LIB-03) with previous and next links that keep the page size (US-LIB-03 AC-01). */
export async function ItemList({ kind, data }: { kind: LibraryKind; data: ItemPage }) {
  const t = await getTranslations("Library.list");
  const format = await getFormatter();
  const pages = pageCount(data.totalCount, data.pageSize);
  const base = libraryPath(kind);
  const date = (value: string) =>
    t("created", {
      date: format.dateTime(new Date(value), {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      }),
    });
  return (
    <>
      <ul className="grid gap-4 md:grid-cols-2">
        {data.items.map((item) => (
          <Card key={item.id} item={item} date={date(item.createdAt)} />
        ))}
      </ul>
      {pages > 1 && (
        <nav aria-label={t("pagination")} className="mt-6 flex items-center justify-center gap-4 text-sm">
          {data.page > 1 ? (
            <Link
              href={listHref(base, data.page - 1, data.pageSize)}
              className="rounded-control border border-border-strong px-4 py-2 font-medium"
            >
              {t("previous")}
            </Link>
          ) : (
            <span className="rounded-control bg-subtle px-4 py-2 font-medium text-muted">{t("previous")}</span>
          )}
          <span className="text-secondary">{t("pageOf", { page: data.page, pages })}</span>
          {data.page < pages ? (
            <Link
              href={listHref(base, data.page + 1, data.pageSize)}
              className="rounded-control border border-border-strong px-4 py-2 font-medium"
            >
              {t("next")}
            </Link>
          ) : (
            <span className="rounded-control bg-subtle px-4 py-2 font-medium text-muted">{t("next")}</span>
          )}
        </nav>
      )}
    </>
  );
}
