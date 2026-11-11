import Link from "next/link";
import { redirect } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";

import { API_KIND, libraryKindFromApi, libraryPath, type LibraryKind } from "@/lib/library/kinds";
import { listHref, pageCount } from "@/lib/library/paging";
import { apiGet } from "@/lib/library/server";
import type { ItemDetail, ItemPage } from "@/lib/library/types";

import { ItemForm } from "./item-form";
import { ItemList } from "./item-list";
import { LibraryShell } from "./library-shell";
import { SavedToast } from "./saved-toast";

const primaryLink =
  "inline-flex h-11 items-center justify-center rounded-control bg-accent px-4 text-sm font-medium text-on-accent hover:brightness-95";

/**
 * Library list (W-LIB-01…04). Shows the page of items; an empty library, a page past the end, and a failed load each have their own state.
 * A signed-out visitor is sent to sign-in (US-AUTH-09 will make this a shared guard).
 */
export async function ListPage({ kind, page, pageSize }: { kind: LibraryKind; page: number; pageSize: number }) {
  const t = await getTranslations(`Library.${kind}`);
  const list = await getTranslations("Library.list");
  const base = libraryPath(kind);
  const result = await apiGet<ItemPage>(`/api/library/items?kind=${API_KIND[kind]}&page=${page}&pageSize=${pageSize}`);
  if (result.status === "unauthorized") redirect("/auth/login");

  const total = result.status === "ok" ? result.data.totalCount : 0;
  const pages = pageCount(total, pageSize);
  const empty = result.status === "ok" && total === 0 && page === 1;
  const outOfRange = result.status === "ok" && page > pages;

  return (
    <LibraryShell active={kind}>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex-1 text-[30px] leading-tight font-bold text-primary">
          {t("title")}
          {result.status === "ok" && (
            <span className="ml-3 rounded-full bg-subtle px-2.5 py-0.5 align-middle text-xs font-semibold text-secondary">
              {t("count", { count: total })}
            </span>
          )}
        </h1>
        <Link href={libraryPath(kind, "new")} className={primaryLink}>
          {t("add")}
        </Link>
      </div>
      <div className="mt-6">
        {result.status === "ok" && !empty && !outOfRange && <ItemList kind={kind} data={result.data} />}
        {empty && (
          <div className="rounded-card bg-surface p-10 text-center shadow-card">
            <h2 className="text-lg font-semibold text-primary">{t("emptyTitle")}</h2>
            <p className="mt-2 text-sm text-secondary">{t("emptyHint")}</p>
            <Link href={libraryPath(kind, "new")} className={`${primaryLink} mt-6`}>
              {t("emptyAction")}
            </Link>
          </div>
        )}
        {outOfRange && (
          // AC-04: a page past the end shows an empty list and a link back to page 1.
          <div className="rounded-card bg-surface p-10 text-center shadow-card">
            <p className="text-sm text-secondary">{list("outOfRange")}</p>
            <Link href={listHref(base, 1, pageSize)} className={`${primaryLink} mt-6`}>
              {list("firstPage")}
            </Link>
          </div>
        )}
        {result.status !== "ok" && (
          <div
            role="alert"
            className="flex items-center gap-3 rounded-control border border-danger bg-subtle p-3 text-sm text-danger"
          >
            <p className="flex-1">
              <span aria-hidden="true">(!) </span>
              {list("loadError")}
            </p>
            <Link
              href={listHref(base, page, pageSize)}
              className="inline-flex h-11 items-center rounded-control border border-border-strong bg-surface px-4 font-medium text-primary"
            >
              {list("retry")}
            </Link>
          </div>
        )}
      </div>
    </LibraryShell>
  );
}

/** Form to add an item (W-LIB-08, W-LIB-09). */
export async function NewItemPage({ kind }: { kind: LibraryKind }) {
  const t = await getTranslations(`Library.${kind}`);
  const nav = await getTranslations("Library.nav");
  return (
    <LibraryShell active={kind}>
      <Link href={libraryPath(kind)} className="text-sm text-accent-text hover:underline">
        <span aria-hidden="true">‹ </span>
        {nav(kind)}
      </Link>
      <h1 className="mt-1 mb-6 text-[30px] leading-tight font-bold text-primary">{t("newTitle")}</h1>
      <ItemForm kind={kind} />
    </LibraryShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-secondary">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** Detail of one item, with the "Đã lưu" toast right after saving (W-LIB-16, W-LIB-17, W-LIB-18). Edit and delete arrive with US-LIB-05 and US-LIB-06. */
export async function DetailPage({
  kind,
  id,
  saved,
}: {
  kind: LibraryKind;
  id: string;
  saved: "create" | "edit" | null;
}) {
  const t = await getTranslations("Library.detail");
  const nav = await getTranslations("Library.nav");
  const format = await getFormatter();
  const result = await apiGet<ItemDetail>(`/api/library/items/${encodeURIComponent(id)}`);
  if (result.status === "unauthorized") redirect("/auth/login");

  const item = result.status === "ok" && libraryKindFromApi(result.data.kind) === kind ? result.data : null;
  const back = (
    <Link href={libraryPath(kind)} className="text-sm text-accent-text hover:underline">
      <span aria-hidden="true">‹ </span>
      {nav(kind)}
    </Link>
  );

  if (!item) {
    // Missing, someone else's, or opened under the other library: the same screen (ERR-LIB-404-01, BR-LIB-017).
    const failed = result.status === "error";
    return (
      <LibraryShell active={kind}>
        {back}
        <div role={failed ? "alert" : undefined} className="mt-4 rounded-card bg-surface p-10 text-center shadow-card">
          <h1 className="text-lg font-semibold text-primary">{failed ? t("loadError") : t("notFoundTitle")}</h1>
          <Link href={failed ? libraryPath(kind, id) : libraryPath(kind)} className={`${primaryLink} mt-6`}>
            {failed ? t("retry") : t("notFoundBack")}
          </Link>
        </div>
      </LibraryShell>
    );
  }

  const stamp = (value: string) =>
    format.dateTime(new Date(value), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  const grammar = kind === "grammar";
  const meta = [item.partOfSpeech, item.ipa].filter(Boolean);

  return (
    <LibraryShell active={kind}>
      {saved && <SavedToast kind={kind} edited={saved === "edit"} />}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {back}
          <h1 className="mt-1 text-[30px] leading-tight font-bold break-words text-primary">{item.term}</h1>
        </div>
        <Link
          href={libraryPath(kind, item.id, "edit")}
          className="mt-6 inline-flex h-11 shrink-0 items-center rounded-control border border-border-strong bg-surface px-4 text-sm font-medium text-primary hover:bg-subtle"
        >
          {t("edit")}
        </Link>
      </div>
      {!grammar && meta.length > 0 && <p className="mt-1 text-sm text-secondary">{meta.join(" · ")}</p>}
      <div className="mt-6 space-y-6 rounded-card bg-surface p-6 shadow-card sm:p-8">
        {grammar && item.formula && (
          <Section title={t("formula")}>
            <code className="block rounded-control bg-subtle px-3 py-2 font-mono text-base break-words text-primary">
              {item.formula}
            </code>
          </Section>
        )}
        {item.meaning && (
          <Section title={t(grammar ? "grammarMeaning" : "meaning")}>
            <p className="text-base whitespace-pre-wrap text-primary">{item.meaning}</p>
          </Section>
        )}
        {item.examples.length > 0 && (
          <Section title={t("examples")}>
            <ol className="list-decimal space-y-2 pl-5">
              {item.examples.map((example, index) => (
                <li key={index} className="text-base text-primary">
                  {example.text}
                  {example.translation && <span className="block text-sm text-secondary">{example.translation}</span>}
                </li>
              ))}
            </ol>
          </Section>
        )}
        {item.note && (
          <Section title={t("note")}>
            <p className="text-base whitespace-pre-wrap text-primary">{item.note}</p>
          </Section>
        )}
        <p className="border-t border-border pt-4 text-xs text-muted">
          {t("timestamps", { created: stamp(item.createdAt), updated: stamp(item.updatedAt) })}
        </p>
      </div>
    </LibraryShell>
  );
}

/**
 * Edit screen of one item (W-LIB-21, W-LIB-22). Loads the item with its version; a missing item or one from the other library
 * shows the same "not found" screen as the detail page (ERR-LIB-404-01, BR-LIB-017).
 */
export async function EditItemPage({ kind, id }: { kind: LibraryKind; id: string }) {
  const t = await getTranslations(`Library.${kind}`);
  const detail = await getTranslations("Library.detail");
  const nav = await getTranslations("Library.nav");
  const result = await apiGet<ItemDetail>(`/api/library/items/${encodeURIComponent(id)}`);
  if (result.status === "unauthorized") redirect("/auth/login");

  const item = result.status === "ok" && libraryKindFromApi(result.data.kind) === kind ? result.data : null;
  const back = (
    <Link href={libraryPath(kind)} className="text-sm text-accent-text hover:underline">
      <span aria-hidden="true">‹ </span>
      {nav(kind)}
    </Link>
  );

  if (!item) {
    return (
      <LibraryShell active={kind}>
        {back}
        <div className="mt-4 rounded-card bg-surface p-10 text-center shadow-card">
          <h1 className="text-lg font-semibold text-primary">{detail("notFoundTitle")}</h1>
          <Link href={libraryPath(kind)} className={`${primaryLink} mt-6`}>
            {detail("notFoundBack")}
          </Link>
        </div>
      </LibraryShell>
    );
  }

  return (
    <LibraryShell active={kind}>
      <Link href={libraryPath(kind, item.id)} className="text-sm text-accent-text hover:underline">
        <span aria-hidden="true">‹ </span>
        {item.term}
      </Link>
      <h1 className="mt-1 mb-6 text-[30px] leading-tight font-bold text-primary">{t("editTitle")}</h1>
      <ItemForm kind={kind} item={item} />
    </LibraryShell>
  );
}
