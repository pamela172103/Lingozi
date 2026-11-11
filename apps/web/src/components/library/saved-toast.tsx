"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

/**
 * "Đã lưu" after a create, or "Đã lưu thay đổi" after an edit (W-LIB-16, W-LIB-21). Announced politely, hides after 5 s,
 * and the `saved` flag is removed from the URL so a refresh does not show it again.
 */
export function SavedToast({ kind, edited = false }: { kind: "vocabulary" | "grammar"; edited?: boolean }) {
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
          {edited ? t("savedEditToast") : t("savedToast")}
        </p>
      )}
    </div>
  );
}
