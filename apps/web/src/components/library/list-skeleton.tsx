import { getTranslations } from "next-intl/server";

import type { LibraryKind } from "@/lib/library/kinds";

import { LibraryShell } from "./library-shell";

/** Loading state of a library list (W-LIB-07): six placeholder cards, announced as busy. */
export async function ListSkeleton({ kind }: { kind: LibraryKind }) {
  const t = await getTranslations("Library.list");
  return (
    <LibraryShell active={kind}>
      <div aria-busy="true" aria-live="polite">
        <p className="sr-only">{t("loading")}</p>
        <div className="h-9 w-48 animate-pulse rounded-control bg-subtle motion-reduce:animate-none" />
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <li key={i} className="h-[120px] animate-pulse rounded-card bg-subtle motion-reduce:animate-none" />
          ))}
        </ul>
      </div>
    </LibraryShell>
  );
}
