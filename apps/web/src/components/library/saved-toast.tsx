"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

/** "Đã lưu" right after saving (W-LIB-16). Announced politely, hides after 5 s, and the `?saved=1` flag is removed so a refresh does not show it again. */
export function SavedToast({ kind }: { kind: "vocabulary" | "grammar" }) {
  const t = useTranslations(`Library.${kind}`);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    window.history.replaceState(window.history.state, "", url);
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" className="fixed right-4 bottom-4 z-[500] sm:right-8">
      {visible && (
        <p className="rounded-card bg-primary px-4 py-3 text-sm font-medium text-surface shadow-overlay">
          <span aria-hidden="true">✓ </span>
          {t("savedToast")}
        </p>
      )}
    </div>
  );
}
