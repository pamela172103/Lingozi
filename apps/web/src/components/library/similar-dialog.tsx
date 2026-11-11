"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef } from "react";

import { libraryPath, type LibraryKind } from "@/lib/library/kinds";
import type { ItemSummary } from "@/lib/library/types";

/**
 * US-LIB-02 dialog (wireframes W-LIB-13, W-LIB-14): lists up to 5 similar items and offers two choices.
 * Focus starts on "Mở mục cũ để bổ sung"; Esc or "Hủy" closes it and keeps what was typed (the form stays mounted behind it).
 */
export function SimilarDialog({
  kind,
  items,
  totalCount,
  onKeepNew,
  onOpen,
  onCancel,
}: {
  kind: LibraryKind;
  items: ItemSummary[];
  totalCount: number;
  onKeepNew: () => void;
  /** Called before navigating to an old item, so the typed text can be handed over (US-LIB-02 AC-02). */
  onOpen: (id: string) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("Library.similar");
  const nav = useTranslations("Library.nav");
  const titleId = useId();
  const primary = useRef<HTMLAnchorElement>(null);
  const first = items[0];

  useEffect(() => {
    primary.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const button =
    "inline-flex h-11 items-center justify-center rounded-control px-4 text-sm font-medium transition-colors";

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-primary/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-[520px] rounded-card bg-surface p-6 shadow-overlay"
      >
        <h2 id={titleId} className="text-lg font-semibold text-primary">
          {t("title")}
        </h2>
        <p className="mt-2 text-sm text-secondary">{t("intro", { library: nav(kind) })}</p>
        <ul className="mt-4 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-card bg-subtle p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-primary">{item.term}</p>
                <p className="truncate text-sm text-secondary">
                  {item.meaning ?? item.formula ?? ""}
                  <span className="text-muted">
                    {" "}
                    ·{" "}
                    {t("created", {
                      date: new Date(item.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }),
                    })}
                  </span>
                </p>
              </div>
              <Link
                href={libraryPath(kind, item.id)}
                onClick={() => onOpen(item.id)}
                className="shrink-0 text-sm font-medium text-accent-text underline"
              >
                {t("open")}
              </Link>
            </li>
          ))}
        </ul>
        {totalCount > items.length && (
          <p className="mt-2 text-sm text-muted">{t("more", { count: totalCount - items.length })}</p>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className={`${button} border border-border-strong bg-surface text-primary hover:bg-subtle`}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onKeepNew}
            className={`${button} border border-border-strong bg-surface text-primary hover:bg-subtle`}
          >
            {t("keepNew")}
          </button>
          {first && (
            <Link
              ref={primary}
              href={libraryPath(kind, first.id, "edit")}
              onClick={() => onOpen(first.id)}
              className={`${button} bg-accent text-on-accent hover:brightness-95`}
            >
              {t("openExisting")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
