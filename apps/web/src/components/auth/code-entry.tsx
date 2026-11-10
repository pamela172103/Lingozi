"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";

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

const buttonBase =
  "flex h-12 w-full items-center justify-center rounded-control px-4 text-sm font-medium bg-accent text-on-accent";

/**
 * "Nhập mã" screen (Figma W-AUTH-05): six cells and the 10-minute countdown of US-AUTH-01.
 * Submitting the code is US-AUTH-02, so "Xác nhận" and "Không nhận được mã?" (US-AUTH-07) stay disabled for now.
 */
export function CodeEntry({ email, initialRemainingSeconds }: { email: string; initialRemainingSeconds: number }) {
  const t = useTranslations("Auth.code");
  const [cells, setCells] = useState<string[]>(() => Array.from({ length: CODE_LENGTH }, () => ""));
  const [remaining, setRemaining] = useState(initialRemainingSeconds);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const deadline = Date.now() + initialRemainingSeconds * 1000;
    const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, [initialRemainingSeconds]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function apply(start: number, digits: string) {
    const result = fillCells(cells, start, digits);
    setCells(result.cells);
    refs.current[result.focus]?.focus();
  }

  function onChange(index: number, raw: string) {
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

  return (
    <>
      <h1 className="text-[30px] leading-tight font-bold text-primary">{t("title")}</h1>
      <p className="mt-4 text-base text-secondary">
        {t("intro", { email })}
        <span className="block">{t("validity", { remaining: formatRemaining(remaining) })}</span>
      </p>

      <div role="group" aria-label={t("groupLabel")} className="mt-4 flex gap-2">
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
            onChange={(event) => onChange(index, event.target.value)}
            onPaste={(event) => onPaste(index, event)}
            onKeyDown={(event) => onKeyDown(index, event)}
            onFocus={(event) => event.target.select()}
            className="h-14 w-12 rounded-control border border-border-strong bg-surface text-center text-xl font-semibold text-primary"
          />
        ))}
      </div>

      <button type="button" disabled className={`${buttonBase} mt-4 opacity-60`}>
        {t("confirm")}
      </button>

      <p className="mt-4 flex gap-3 text-xs text-muted">
        <button type="button" disabled className="cursor-not-allowed">
          {t("notReceived")}
        </button>
        <Link href="/auth/login" className="hover:underline hover:underline-offset-2">
          {t("changeEmail")}
        </Link>
      </p>
    </>
  );
}
