"use client";

import { useTranslations } from "next-intl";

import type { Suggestions } from "@/lib/library/types";

/**
 * Chips of meaning suggestions under the meaning field (W-LIB-32 to W-LIB-35). Clicking a chip fills the field; the user can still edit it.
 * The region is `aria-live="polite"` so a new suggestion is announced (NFR-A11Y-001).
 */
export function MeaningSuggestions({
  meanings,
  value,
  onPick,
}: {
  meanings: Suggestions["meanings"];
  value: string;
  onPick: (text: string) => void;
}) {
  const t = useTranslations("Library.suggest");
  return (
    <div aria-live="polite" className="mt-2">
      {meanings.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted">{t("label")}</span>
          {meanings.map((meaning) => {
            const active = value === meaning.text;
            return (
              <button
                key={`${meaning.source}-${meaning.text}`}
                type="button"
                aria-pressed={active}
                onClick={() => onPick(meaning.text)}
                className={`flex max-w-full flex-col items-start rounded-control border px-3 py-1 text-left text-sm ${
                  active
                    ? "border-accent bg-accent-subtle text-accent-text"
                    : "border-border-strong bg-surface text-primary hover:bg-subtle"
                }`}
              >
                <span className="line-clamp-2 break-words">{meaning.text}</span>
                <span className="text-xs text-muted">{t(meaning.source === "own" ? "own" : "dictionary")}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
