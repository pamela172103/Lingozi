"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";

import { verifyEmailCode, type VerifyCodeResult } from "@/lib/auth/api";

const CODE_LENGTH = 6;

export function formatRemaining(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Fills the six cells from `digits`, starting at `start`. Pure so the paste/autofill rules can be tested. */
export function fillCells(cells: string[], start: number, digits: string): { cells: string[]; focus: number } {
  const next = [...cells];
  let index = start;
  for (const digit of digits.slice(0, CODE_LENGTH - start)) {
    next[index] = digit;
    index += 1;
  }
  return { cells: next, focus: Math.min(index, CODE_LENGTH - 1) };
}

const buttonBase = "flex h-12 w-full items-center justify-center rounded-control px-4 text-sm font-medium";
const primaryButton = `${buttonBase} bg-accent text-on-accent enabled:hover:brightness-95 disabled:opacity-60`;

type Failure =
  | { kind: "wrong-code"; remaining: number }
  | { kind: "locked" }
  | { kind: "unavailable" }
  | { kind: "rate-limited"; seconds: number }
  | { kind: "invalid-email" }
  | { kind: "session-error" }
  | { kind: "network-error" }
  | null;

/**
 * "Nhập mã" screen (Figma W-AUTH-05…08): six cells, 10-minute countdown, and the outcome of the check.
 * A correct code signs the user in and opens the library. A locked or unavailable code offers "Gửi mã mới",
 * which returns to sign-in to request a new code. "Không nhận được mã?" stays disabled until US-AUTH-07.
 */
export function CodeEntry({ email, initialRemainingSeconds }: { email: string; initialRemainingSeconds: number }) {
  const t = useTranslations("Auth.code");
  const router = useRouter();
  const [cells, setCells] = useState<string[]>(() => Array.from({ length: CODE_LENGTH }, () => ""));
  const [remaining, setRemaining] = useState(initialRemainingSeconds);
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure>(null);
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const errorId = useId();
  const code = cells.join("");
  const complete = code.length === CODE_LENGTH;
  const locked = failure?.kind === "locked";
  const needsNewCode = failure?.kind === "locked" || failure?.kind === "unavailable";

  useEffect(() => {
    const deadline = Date.now() + initialRemainingSeconds * 1000;
    const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [initialRemainingSeconds]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  // After a wrong code the cells are cleared; focus the first cell once they are enabled again.
  useEffect(() => {
    if (!submitting && failure?.kind === "wrong-code") refs.current[0]?.focus();
  }, [submitting, failure]);

  // ERR-AUTH-429-01: count down, then clear the message so another try is allowed.
  useEffect(() => {
    if (failure?.kind !== "rate-limited") return;
    const timer = setTimeout(() => {
      setFailure((f) => {
        if (f?.kind !== "rate-limited") return f;
        return f.seconds <= 1 ? null : { ...f, seconds: f.seconds - 1 };
      });
    }, 1000);
    return () => clearTimeout(timer);
  }, [failure]);

  function resetToFirstCell() {
    setCells(Array.from({ length: CODE_LENGTH }, () => ""));
  }

  async function submit(value: string) {
    if (submitting || value.length !== CODE_LENGTH || locked) return;
    setSubmitting(true);
    setFailure(null);
    const result: VerifyCodeResult = await verifyEmailCode(email, value);
    setSubmitting(false);

    switch (result.kind) {
      case "signed-in":
        router.push(result.redirectTo);
        return;
      case "wrong-code":
        setFailure({ kind: "wrong-code", remaining: result.remainingAttempts });
        resetToFirstCell();
        return;
      case "rate-limited":
        setFailure({ kind: "rate-limited", seconds: result.retryAfterSeconds });
        return;
      case "locked":
        setFailure({ kind: "locked" });
        return;
      case "unavailable":
        setFailure({ kind: "unavailable" });
        return;
      default:
        setFailure({ kind: result.kind });
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit(code);
  }

  function apply(start: number, digits: string) {
    const result = fillCells(cells, start, digits);
    setCells(result.cells);
    refs.current[result.focus]?.focus();
    const filled = result.cells.join("");
    if (filled.length === CODE_LENGTH) void submit(filled);
  }

  function onChange(index: number, raw: string) {
    if (locked) return;
    const digits = raw.replace(/\D/gu, "");
    if (digits.length === 0) {
      setCells((c) => c.map((v, i) => (i === index ? "" : v)));
      return;
    }
    // Autofill ("one-time-code") delivers all digits into one cell; a typed digit over an old one delivers two.
    apply(index, cells[index] ? digits.slice(-1) : digits);
  }

  function onPaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    if (locked) return;
    const digits = event.clipboardData.getData("text").replace(/\D/gu, "");
    if (digits.length > 0) apply(digits.length >= CODE_LENGTH ? 0 : index, digits);
  }

  function onKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !cells[index] && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  const message =
    failure?.kind === "wrong-code"
      ? t("wrongCode", { remaining: failure.remaining })
      : failure?.kind === "locked"
        ? t("locked")
        : failure?.kind === "unavailable"
          ? t("unavailable")
          : failure?.kind === "rate-limited"
            ? t("rateLimited", { seconds: failure.seconds })
            : failure?.kind === "invalid-email"
              ? t("invalidEmail")
              : failure?.kind === "session-error"
                ? t("session")
                : failure?.kind === "network-error"
                  ? t("network")
                  : null;

  return (
    <>
      <h1 className="text-[30px] leading-tight font-bold text-primary">{t("title")}</h1>
      {locked ? (
        <p className="mt-4 text-base text-secondary">{t("locked")}</p>
      ) : (
        <p className="mt-4 text-base text-secondary">
          {t("intro", { email })}
          <span className="block">{t("validity", { remaining: formatRemaining(remaining) })}</span>
        </p>
      )}

      <form noValidate onSubmit={onSubmit}>
        <div
          role="group"
          aria-label={t("groupLabel")}
          aria-describedby={message ? errorId : undefined}
          className="mt-4 flex gap-2"
        >
          {cells.map((value, index) => (
            <input
              key={index}
              ref={(element) => {
                refs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              aria-label={t("digitLabel", { index: index + 1 })}
              value={value}
              disabled={submitting || locked}
              onChange={(event) => onChange(index, event.target.value)}
              onPaste={(event) => onPaste(index, event)}
              onKeyDown={(event) => onKeyDown(index, event)}
              onFocus={(event) => event.target.select()}
              className={`h-14 w-12 rounded-control border bg-surface text-center text-xl font-semibold text-primary disabled:opacity-60 ${
                failure?.kind === "wrong-code" || failure?.kind === "rate-limited"
                  ? "border-danger"
                  : "border-border-strong"
              }`}
            />
          ))}
        </div>

        {message && (
          <p id={errorId} role="alert" className="mt-4 text-sm text-danger">
            <span aria-hidden="true">(!) </span>
            {message}
          </p>
        )}

        {needsNewCode ? (
          <button type="button" onClick={() => router.push("/auth/login")} className={`${primaryButton} mt-4`}>
            {t("newCode")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={!complete || submitting || locked || failure?.kind === "rate-limited"}
            className={`${primaryButton} mt-4`}
          >
            {submitting ? t("verifying") : t("confirm")}
          </button>
        )}
      </form>

      <p className="mt-4 flex gap-3 text-xs text-muted">
        <button type="button" disabled className="cursor-not-allowed">
          {t("notReceived")}
        </button>
        <button
          type="button"
          onClick={() => router.push("/auth/login")}
          className="hover:underline hover:underline-offset-2"
        >
          {t("changeEmail")}
        </button>
      </p>
    </>
  );
}
