"use client";

import { useEffect, useState } from "react";

import { findSuggestions } from "@/lib/library/api";
import type { ApiKind } from "@/lib/library/kinds";
import type { Suggestions } from "@/lib/library/types";

/** How long the user must stop typing before a lookup is sent (srs US-LIB-08 AC-01: 500 ms). */
export const SUGGEST_DELAY_MS = 500;

/**
 * Suggestions for the term typed now. A lookup starts after the user stops typing for 500 ms; an older answer never replaces a newer one,
 * and a lookup for a term that has since changed is dropped.
 */
export function useSuggestions(kind: ApiKind, term: string): Suggestions | null {
  const trimmed = term.trim();
  const key = `${kind}|${trimmed}`;
  const [answer, setAnswer] = useState<{ key: string; data: Suggestions | null }>({ key: "", data: null });

  useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      const data = await findSuggestions(kind, trimmed, controller.signal);
      if (!controller.signal.aborted) setAnswer({ key, data });
    }, SUGGEST_DELAY_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // `key` already carries `kind` and `trimmed`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return answer.key === key ? answer.data : null;
}
