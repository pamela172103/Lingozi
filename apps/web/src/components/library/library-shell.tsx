import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { LIBRARY_KINDS, libraryPath, type LibraryKind } from "@/lib/library/kinds";

/**
 * App shell of the library (wireframes W-LIB-01…17, design-system §4): sidebar with the two libraries as separate menu entries
 * (BR-LIB-017), content area to its right. "Học" and "Cài đặt" entries are not drawn until those features exist, so no menu item is a dead link.
 */
export async function LibraryShell({ active, children }: { active: LibraryKind; children: ReactNode }) {
  const t = await getTranslations("Library.nav");
  return (
    <div className="min-h-dvh bg-canvas text-primary md:flex">
      <aside className="border-b border-border bg-surface px-4 py-4 md:sticky md:top-0 md:h-dvh md:w-60 md:shrink-0 md:border-r md:border-b-0 md:px-3 md:py-6">
        <p className="px-3 text-xl font-semibold text-accent-text">Lingozi</p>
        <nav aria-label={t("label")} className="mt-3 md:mt-8">
          <p className="hidden px-3 text-xs font-semibold tracking-wide text-muted uppercase md:block">{t("group")}</p>
          <ul className="mt-1 flex gap-1 md:flex-col">
            {LIBRARY_KINDS.map((kind) => {
              const current = kind === active;
              return (
                <li key={kind}>
                  <Link
                    href={libraryPath(kind)}
                    aria-current={current ? "page" : undefined}
                    className={`flex h-10 items-center rounded-control border-l-4 px-3 text-sm font-medium ${
                      current
                        ? "border-accent bg-accent-subtle text-accent-text"
                        : "border-transparent text-secondary hover:bg-subtle"
                    }`}
                  >
                    {t(kind)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-[720px] lg:mx-0">{children}</div>
      </main>
    </div>
  );
}
