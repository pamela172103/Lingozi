"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

import { deleteItem } from "@/lib/library/api";
import { libraryPath, type LibraryKind } from "@/lib/library/kinds";

const button =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-medium transition-colors";

/**
 * US-LIB-06 (W-LIB-24, W-LIB-25): "Xóa" opens a confirmation. "Hủy" has the focus and Esc closes the dialog, which gives the focus back
 * to "Xóa". Confirming deletes the item and goes to its library with the "Đã xóa" notice. If the item is already gone (deleted elsewhere),
 * the library shows "Mục này không còn tồn tại." instead of a system error (AC-03).
 */
export function DeleteItemButton({ kind, id, term }: { kind: LibraryKind; id: string; term: string }) {
  const t = useTranslations("Library.delete");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (open) cancel.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setFailed(false);
    trigger.current?.focus();
  }

  async function confirm() {
    setBusy(true);
    setFailed(false);
    const result = await deleteItem(id);
    if (result.kind === "deleted") {
      router.push(`${libraryPath(kind)}?notice=deleted`);
      return;
    }
    if (result.kind === "not-found") {
      router.push(`${libraryPath(kind)}?notice=gone`);
      return;
    }
    if (result.kind === "unauthorized") {
      router.push("/auth/login");
      return;
    }
    setBusy(false);
    setFailed(true);
  }

  // Keeps the Tab key inside the dialog (NFR-A11Y-001): it moves between "Hủy" and "Xóa" only.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !busy) {
      event.preventDefault();
      close();
    }
    if (event.key === "Tab") {
      event.preventDefault();
      const target = document.activeElement === cancel.current ? confirmButton.current : cancel.current;
      target?.focus();
    }
  }

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        className={`${button} border border-danger bg-surface text-danger hover:bg-subtle`}
      >
        <span aria-hidden="true">⚠</span>
        {t("open")}
      </button>
      {open && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-primary/40 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onKeyDown={onKeyDown}
            className="w-full max-w-[440px] rounded-card bg-surface p-6 shadow-overlay"
          >
            <h2 id={titleId} className="text-lg font-semibold text-primary">
              {t("title", { term })}
            </h2>
            <p className="mt-2 text-sm text-secondary">{t("body")}</p>
            {failed && (
              <p role="alert" className="mt-3 text-sm text-danger">
                <span aria-hidden="true">(!) </span>
                {t("failed")}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                ref={cancel}
                type="button"
                onClick={close}
                disabled={busy}
                className={`${button} border border-border-strong bg-surface text-primary hover:bg-subtle`}
              >
                {t("cancel")}
              </button>
              <button
                ref={confirmButton}
                type="button"
                onClick={confirm}
                disabled={busy}
                aria-disabled={busy}
                className={`${button} border border-danger bg-surface text-danger hover:bg-subtle disabled:cursor-not-allowed`}
              >
                <span aria-hidden="true">⚠</span>
                {busy ? t("deleting") : t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
