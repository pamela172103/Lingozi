"use client";

import { useEffect, useState } from "react";

/**
 * A short confirmation after an action: "Đã lưu", "Đã lưu thay đổi", "Đã xóa" (W-LIB-16, W-LIB-21, W-LIB-24, W-LIB-25).
 * Announced politely and hidden after 5 s. The `saved` and `notice` flags are removed from the URL, so a refresh does not repeat it.
 */
export function SavedToast({ text }: { text: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("saved");
    url.searchParams.delete("notice");
    window.history.replaceState(window.history.state, "", url);
    const timer = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" className="fixed right-4 bottom-4 z-[500] sm:right-8">
      {visible && (
        <p className="rounded-card bg-primary px-4 py-3 text-sm font-medium text-surface shadow-overlay">
          <span aria-hidden="true">✓ </span>
          {text}
        </p>
      )}
    </div>
  );
}
