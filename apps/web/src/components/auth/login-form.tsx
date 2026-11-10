"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { requestEmailCode } from "@/lib/auth/api";
import { isValidEmail, normalizeEmail } from "@/lib/auth/email";

type Provider = "google" | "facebook";
type FormError = { kind: "invalid-email" } | { kind: "session-error" } | { kind: "network-error" } | null;

const buttonBase =
  "flex h-12 w-full items-center justify-center rounded-control px-4 text-sm font-medium transition-colors";
const outlineButton = `${buttonBase} border border-border-strong bg-surface text-primary hover:bg-subtle`;
const primaryButton = `${buttonBase} bg-accent text-on-accent hover:brightness-95`;

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

/**
 * US-AUTH-01: sign-in methods and the "request email code" step (Figma W-AUTH-01…04).
 * `providers` lists the external sign-in buttons that are configured; they stay hidden until US-AUTH-04 and US-AUTH-05.
 */
export function LoginForm({ providers = [] }: { providers?: Provider[] }) {
  const t = useTranslations("Auth");
  const router = useRouter();
  const [emailStep, setEmailStep] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<FormError>(null);
  const [submitting, setSubmitting] = useState(false);
  const [waitSeconds, setWaitSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => {
    if (emailStep) inputRef.current?.focus();
  }, [emailStep]);

  // ERR-AUTH-429-01: count down to zero, then allow sending again.
  useEffect(() => {
    if (waitSeconds <= 0) return;
    const timer = setTimeout(() => setWaitSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [waitSeconds]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || waitSeconds > 0) return;

    if (!isValidEmail(email)) {
      setError({ kind: "invalid-email" });
      inputRef.current?.focus();
      return;
    }

    setError(null);
    setSubmitting(true);
    const normalized = normalizeEmail(email);
    const result = await requestEmailCode(normalized);
    setSubmitting(false);

    switch (result.kind) {
      case "sent":
        router.push(`/auth/code?email=${encodeURIComponent(normalized)}&sent=${Math.floor(Date.now() / 1000)}`);
        return;
      case "rate-limited":
        setWaitSeconds(result.retryAfterSeconds);
        return;
      case "invalid-email":
        setError({ kind: "invalid-email" });
        inputRef.current?.focus();
        return;
      default:
        setError({ kind: result.kind });
    }
  }

  const limited = waitSeconds > 0;
  const hasInputError = error?.kind === "invalid-email" || limited;
  const message = limited
    ? t("error.429-01", { seconds: waitSeconds })
    : error?.kind === "invalid-email"
      ? t("error.400-01")
      : error?.kind === "session-error"
        ? t("error.400-05")
        : error?.kind === "network-error"
          ? t("error.network")
          : null;

  return (
    <>
      <h1 className="text-[30px] leading-tight font-bold text-primary">{t("login.title")}</h1>
      <p className="mt-4 text-base text-secondary">{t("login.subtitle")}</p>

      <div className="mt-4 flex flex-col gap-4">
        {providers.includes("google") && (
          <a href="/api/auth/external/google/start" className={outlineButton}>
            {t("login.google")}
          </a>
        )}
        {providers.includes("facebook") && (
          <a href="/api/auth/external/facebook/start" className={outlineButton}>
            {t("login.facebook")}
          </a>
        )}
      </div>

      {providers.length > 0 && <p className="mt-4 text-xs text-muted">{t("login.or")}</p>}

      {emailStep ? (
        <form noValidate onSubmit={onSubmit} className={providers.length > 0 ? "mt-4" : "mt-6"}>
          <label htmlFor="email" className="block text-sm font-semibold text-primary">
            {t("login.emailLabel")} <span aria-hidden="true">*</span>
          </label>
          <input
            ref={inputRef}
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            disabled={submitting}
            aria-invalid={hasInputError}
            aria-describedby={message ? errorId : undefined}
            onChange={(event) => setEmail(event.target.value)}
            className={`mt-3 h-12 w-full rounded-control border bg-surface px-4 text-base text-primary outline-offset-2 ${
              hasInputError ? "border-danger" : "border-border"
            }`}
          />
          {message && (
            <p id={errorId} role="alert" className="mt-4 text-sm text-danger">
              <span aria-hidden="true">(!) </span>
              {message}
            </p>
          )}
          <button
            type="submit"
            aria-disabled={submitting || limited}
            className={`${primaryButton} mt-4 ${submitting || limited ? "cursor-not-allowed" : ""}`}
          >
            {submitting && <Spinner />}
            {submitting
              ? t("login.sending")
              : limited
                ? t("login.sendCodeWait", { seconds: waitSeconds })
                : t("login.sendCode")}
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEmailStep(true)}
          className={`${primaryButton} ${providers.length > 0 ? "mt-4" : "mt-6"}`}
        >
          {t("login.email")}
        </button>
      )}
    </>
  );
}
