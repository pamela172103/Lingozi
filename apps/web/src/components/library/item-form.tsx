"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type ReactNode,
} from "react";

import { createItem, findSimilarItems, updateItem } from "@/lib/library/api";
import { clearDraft, parseDraft, readDraftRaw, saveDraft } from "@/lib/library/draft";
import {
  FIELD_ORDER,
  emptyValues,
  toRequest,
  toUpdateRequest,
  validate,
  valuesFromItem,
  type FieldErrors,
  type FormValues,
} from "@/lib/library/form";
import { API_KIND, LIMITS, PARTS_OF_SPEECH, libraryPath, type LibraryKind } from "@/lib/library/kinds";
import type { ItemDetail, ItemSummary } from "@/lib/library/types";
import { SimilarDialog } from "./similar-dialog";

type Banner = "limit" | "network" | "session" | "conflict" | null;

const control =
  "w-full rounded-control border bg-surface px-3 text-base text-primary placeholder:text-muted disabled:bg-subtle";
const inputClass = `${control} h-11`;
const areaClass = `${control} py-2`;
const buttonBase = "flex h-11 items-center justify-center rounded-control px-4 text-sm font-medium transition-colors";

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  /** Shows "n/max" once the text is within 10% of the limit (W-LIB-10). */
  count?: { length: number; max: number };
  children: (props: { id: string; invalid: boolean; describedBy: string | undefined }) => ReactNode;
}

function Field({ id, label, required, error, count, children }: FieldProps) {
  const errorId = `${id}-error`;
  const nearLimit = count && count.length >= count.max * 0.9;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-primary">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="mt-2">{children({ id, invalid: Boolean(error), describedBy: error ? errorId : undefined })}</div>
      <div className="mt-1 flex justify-between gap-4 text-xs">
        {error ? (
          <p id={errorId} className="text-danger">
            <span aria-hidden="true">(!) </span>
            {error}
          </p>
        ) : (
          <span />
        )}
        {nearLimit && (
          <span className={count.length > count.max ? "text-danger" : "text-muted"}>
            {count.length}/{count.max}
          </span>
        )}
      </div>
    </div>
  );
}

/** A panel of text the user typed, shown next to the form and read-only (W-LIB-15, W-LIB-23). */
function KeptPanel({
  title,
  values,
  kind,
  onClose,
}: {
  title: string;
  values: FormValues;
  kind: LibraryKind;
  onClose?: () => void;
}) {
  const t = useTranslations("Library.form");
  const grammar = kind === "grammar";
  const examples = values.examples.filter((e) => e.text.trim());
  return (
    <aside aria-label={title} className="rounded-card border border-dashed border-border-strong bg-surface p-5 text-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-primary">{title}</h2>
        {onClose && (
          <button type="button" onClick={onClose} className="text-sm font-medium text-accent-text underline">
            {t("close")}
          </button>
        )}
      </div>
      <dl className="mt-4 space-y-3">
        <div>
          <dt className="text-xs font-semibold text-muted">{t(grammar ? "grammarTerm" : "term")}</dt>
          <dd className="break-words text-primary">{values.term || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-muted">{t(grammar ? "grammarMeaning" : "meaning")}</dt>
          <dd className="break-words whitespace-pre-wrap text-primary">{values.meaning || "—"}</dd>
        </div>
        {grammar ? (
          <div>
            <dt className="text-xs font-semibold text-muted">{t("formula")}</dt>
            <dd className="font-mono break-words text-primary">{values.formula || "—"}</dd>
          </div>
        ) : (
          <>
            <div>
              <dt className="text-xs font-semibold text-muted">{t("ipa")}</dt>
              <dd className="text-primary">{values.ipa || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-muted">{t("partOfSpeech")}</dt>
              <dd className="text-primary">{values.partOfSpeech || "—"}</dd>
            </div>
          </>
        )}
        {examples.length > 0 && (
          <div>
            <dt className="text-xs font-semibold text-muted">{t("examples")}</dt>
            <dd>
              <ul className="list-disc space-y-1 pl-5 text-primary">
                {examples.map((e) => (
                  <li key={e.key} className="break-words">
                    {e.text}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        {values.note && (
          <div>
            <dt className="text-xs font-semibold text-muted">{t("note")}</dt>
            <dd className="break-words whitespace-pre-wrap text-primary">{values.note}</dd>
          </div>
        )}
      </dl>
    </aside>
  );
}

/**
 * US-LIB-01 (create) and US-LIB-05 (edit) form of one library (wireframes W-LIB-08, 09, 21, 22; errors W-LIB-10…12, 19, 23).
 * One column, fields in the order the owner listed them. Create saves with POST and a fixed `clientRequestId`;
 * edit saves with PUT and the version the form was loaded with (BR-LIB-007).
 */
export function ItemForm({ kind, item }: { kind: LibraryKind; item?: ItemDetail }) {
  const t = useTranslations("Library.form");
  const router = useRouter();
  const [start] = useState<FormValues>(() => (item ? valuesFromItem(item) : emptyValues()));
  const [values, setValues] = useState<FormValues>(start);
  // What was loaded or last saved: anything different is an unsaved change (US-LIB-05 AC-03).
  const [baseline, setBaseline] = useState(() => JSON.stringify(start));
  const [version, setVersion] = useState<string | null>(item?.version ?? null);
  const [conflictLatest, setConflictLatest] = useState<ItemDetail | null>(null);
  const [kept, setKept] = useState<FormValues | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<Banner>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const editing = Boolean(item);
  const dirty = JSON.stringify(values) !== baseline;
  const requestId = useRef(crypto.randomUUID());
  const exampleCounter = useRef(0);
  const focusAfter = useRef<string | null>(null);
  const prefix = useId();
  const fieldId = (name: string) => `${prefix}-${name.replace(/[^\w-]/gu, "-")}`;

  const grammar = kind === "grammar";
  const labelOf = (name: string) => {
    switch (name) {
      case "term":
        return t(grammar ? "grammarTerm" : "term");
      case "meaning":
        return t(grammar ? "grammarMeaning" : "meaning");
      default:
        return t(name as "ipa" | "formula" | "partOfSpeech" | "note" | "examples");
    }
  };
  const messageOf = (name: string): string | undefined => {
    const error = errors[name];
    if (!error) return undefined;
    if (error === "required" && (name === "term" || name === "meaning" || name === "formula")) {
      return t(`error.${name === "term" && grammar ? "grammarTerm" : name}`);
    }
    if (error === "tooLong") {
      const field = name.endsWith(".text")
        ? "exampleText"
        : name.endsWith(".translation")
          ? "exampleTranslation"
          : name;
      return t("error.tooLong", { max: LIMITS[field as keyof typeof LIMITS] });
    }
    return t(`error.${error}`);
  };

  useEffect(() => {
    if (!focusAfter.current) return;
    document.getElementById(focusAfter.current)?.focus();
    focusAfter.current = null;
  });

  function set<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function addExample() {
    const key = `example-${exampleCounter.current++}`;
    focusAfter.current = fieldId(`${key}-text`);
    set("examples", [...values.examples, { key, text: "", translation: "" }]);
  }

  function removeExample(index: number) {
    const remaining = values.examples.filter((_, i) => i !== index);
    // Focus moves to the neighbouring example, or to the add button when none is left (NFR-A11Y-001).
    const neighbour = remaining[Math.min(index, remaining.length - 1)];
    focusAfter.current = neighbour ? fieldId(`${neighbour.key}-text`) : fieldId("add-example");
    set("examples", remaining);
  }

  function updateExample(index: number, field: "text" | "translation", value: string) {
    set(
      "examples",
      values.examples.map((e, i) => (i === index ? { ...e, [field]: value } : e)),
    );
  }

  /** Keys of the errors in form order, so "first invalid field" and the summary follow what the user sees. */
  function orderedErrorNames(found: FieldErrors): string[] {
    const names = Object.keys(found);
    const rank = (name: string) => {
      const base = name.startsWith("examples") ? "examples" : name;
      const index = FIELD_ORDER[kind].indexOf(base);
      return index === -1 ? 99 : index;
    };
    return names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
  }

  /** The element an error belongs to, for focus and for the summary links. */
  function targetOf(name: string): string {
    if (name === "examples") return fieldId("add-example");
    const match = /^examples\[(\d+)\]\.(text|translation)$/u.exec(name);
    if (!match) return fieldId(name);
    // Errors count only the rows that are not empty (empty rows are not sent), so map the index back to the row.
    const used = values.examples.filter((e) => e.text.trim() || e.translation.trim());
    const example = used[Number(match[1])];
    return fieldId(example ? `${example.key}-${match[2]}` : "add-example");
  }

  /** US-LIB-02: the similar-items dialog, shown before saving when the user's own library already has this term. */
  const [similar, setSimilar] = useState<{ items: ItemSummary[]; totalCount: number } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const found = validate(kind, values);
    setBanner(null);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      setShowSummary(true);
      focusAfter.current = targetOf(orderedErrorNames(found)[0]!);
      return;
    }

    setErrors({});
    setShowSummary(false);
    if (editing) {
      // US-LIB-05 does not repeat the similar-items check: the item already exists.
      await save();
      return;
    }
    setSubmitting(true);
    const lookup = await findSimilarItems(API_KIND[kind], values.term.trim());
    if (lookup.kind === "found" && lookup.totalCount > 0) {
      // Stop here: the user decides in the dialog. The typed values stay in the form.
      setSubmitting(false);
      setSimilar({ items: lookup.items, totalCount: lookup.totalCount });
      return;
    }
    await save();
  }

  /** Saves the form. The same clientRequestId is reused on retries (BR-LIB-008), also after the dialog's "Vẫn tạo mục mới". */
  async function save() {
    setSubmitting(true);
    const result =
      item && version !== null
        ? await updateItem(item.id, toUpdateRequest(kind, values, version))
        : await createItem(toRequest(kind, values, requestId.current));
    setSubmitting(false);

    switch (result.kind) {
      case "saved":
        router.push(`${libraryPath(kind, result.item.id)}?saved=${item ? "edit" : "1"}`);
        return;
      case "conflict":
        // ERR-LIB-409-01: keep what was typed next to the form and offer the latest version; nothing was written.
        setKept(values);
        setConflictLatest(result.current);
        setBanner("conflict");
        return;
      case "not-found":
        // Gone or someone else's: the detail page shows "Không tìm thấy mục này".
        router.push(libraryPath(kind, item?.id ?? ""));
        return;
      case "invalid":
        setErrors(result.errors);
        setShowSummary(true);
        if (Object.keys(result.errors).length > 0) focusAfter.current = targetOf(orderedErrorNames(result.errors)[0]!);
        return;
      case "unauthorized":
        router.push("/auth/login");
        return;
      case "limit":
        setBanner("limit");
        return;
      case "session-error":
        setBanner("session");
        return;
      default:
        setBanner("network");
    }
  }

  const summaryNames = showSummary ? orderedErrorNames(errors) : [];
  const closeSimilar = useCallback(() => setSimilar(null), []);
  const summaryFields = [...new Set(summaryNames.map((n) => labelOf(n.startsWith("examples") ? "examples" : n)))];
  const tooManyExamples = values.examples.length >= LIMITS.examples;

  function text(name: "term" | "ipa", placeholder: string, mono = false) {
    return (
      <Field
        id={fieldId(name)}
        label={labelOf(name)}
        required={name === "term"}
        error={messageOf(name)}
        count={{ length: values[name].length, max: LIMITS[name] }}
        key={name}
      >
        {({ id, invalid, describedBy }) => (
          <input
            id={id}
            name={name}
            type="text"
            value={values[name]}
            disabled={submitting}
            required={name === "term"}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => set(name, e.target.value)}
            className={`${inputClass} ${mono ? "font-mono" : ""} ${invalid ? "border-danger" : "border-border-strong"}`}
          />
        )}
      </Field>
    );
  }

  function area(
    name: "meaning" | "formula" | "note",
    placeholder: string,
    rows: number,
    required: boolean,
    mono = false,
  ) {
    return (
      <Field
        id={fieldId(name)}
        label={labelOf(name)}
        required={required}
        error={messageOf(name)}
        count={{ length: values[name].length, max: LIMITS[name] }}
        key={name}
      >
        {({ id, invalid, describedBy }) => (
          <textarea
            id={id}
            name={name}
            rows={rows}
            value={values[name]}
            disabled={submitting}
            required={required}
            aria-invalid={invalid}
            aria-describedby={describedBy}
            placeholder={placeholder}
            onChange={(e) => set(name, e.target.value)}
            className={`${areaClass} ${mono ? "font-mono" : ""} ${invalid ? "border-danger" : "border-border-strong"}`}
          />
        )}
      </Field>
    );
  }

  const partOfSpeech = (
    <Field
      id={fieldId("partOfSpeech")}
      label={labelOf("partOfSpeech")}
      error={messageOf("partOfSpeech")}
      key="partOfSpeech"
    >
      {({ id, invalid, describedBy }) => (
        <select
          id={id}
          name="partOfSpeech"
          value={values.partOfSpeech}
          disabled={submitting}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          onChange={(e) => set("partOfSpeech", e.target.value)}
          className={`${inputClass} ${invalid ? "border-danger" : "border-border-strong"}`}
        >
          <option value="">{t("partOfSpeechPlaceholder")}</option>
          {PARTS_OF_SPEECH.map((part) => (
            <option key={part} value={part}>
              {part}
            </option>
          ))}
        </select>
      )}
    </Field>
  );

  const examples = (
    <fieldset key="examples" className="min-w-0">
      <legend className="sr-only">{t("examples")}</legend>
      <div className="flex items-center gap-4">
        <h2 className="flex-1 text-base font-semibold text-primary">{t("examples")}</h2>
        <span className="text-xs text-muted">
          {t("counter", { count: values.examples.length, max: LIMITS.examples })}
        </span>
        <button
          type="button"
          id={fieldId("add-example")}
          disabled={submitting || tooManyExamples}
          onClick={addExample}
          className={`${buttonBase} border border-border-strong bg-surface text-primary enabled:hover:bg-subtle disabled:cursor-not-allowed disabled:text-muted`}
        >
          {t("addExample")}
        </button>
      </div>
      {tooManyExamples && <p className="mt-2 text-sm text-danger">{t("examplesMax")}</p>}
      {errors.examples && <p className="mt-2 text-sm text-danger">{messageOf("examples")}</p>}
      {values.examples.length === 0 ? (
        <p className="mt-2 text-sm text-muted">{t("examplesEmpty")}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {values.examples.map((example, index) => {
            const used = values.examples.slice(0, index).filter((e) => e.text.trim() || e.translation.trim()).length;
            const textError = messageOf(`examples[${used}].text`);
            const translationError = messageOf(`examples[${used}].translation`);
            return (
              <li key={example.key} className="flex items-start gap-3 rounded-card bg-subtle p-3">
                <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                  <Field id={fieldId(`${example.key}-text`)} label={t("exampleText")} error={textError}>
                    {({ id, invalid, describedBy }) => (
                      <input
                        id={id}
                        type="text"
                        value={example.text}
                        disabled={submitting}
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        autoComplete="off"
                        onChange={(e) => updateExample(index, "text", e.target.value)}
                        className={`${inputClass} ${invalid ? "border-danger" : "border-border-strong"}`}
                      />
                    )}
                  </Field>
                  <Field
                    id={fieldId(`${example.key}-translation`)}
                    label={t("exampleTranslation")}
                    error={translationError}
                  >
                    {({ id, invalid, describedBy }) => (
                      <input
                        id={id}
                        type="text"
                        value={example.translation}
                        disabled={submitting}
                        aria-invalid={invalid}
                        aria-describedby={describedBy}
                        autoComplete="off"
                        onChange={(e) => updateExample(index, "translation", e.target.value)}
                        className={`${inputClass} ${invalid ? "border-danger" : "border-border-strong"}`}
                      />
                    )}
                  </Field>
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  aria-label={t("removeExample", { index: index + 1 })}
                  onClick={() => removeExample(index)}
                  className="mt-7 flex size-9 shrink-0 items-center justify-center rounded-control text-secondary hover:bg-surface disabled:cursor-not-allowed"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </fieldset>
  );

  const fields: Record<string, ReactNode> = {
    term: text("term", t(grammar ? "grammarTermPlaceholder" : "termPlaceholder")),
    ipa: text("ipa", t("ipaPlaceholder")),
    meaning: area(
      "meaning",
      t(grammar ? "grammarMeaningPlaceholder" : "meaningPlaceholder"),
      grammar ? 3 : 3,
      !grammar,
    ),
    formula: area("formula", t("formulaPlaceholder"), 2, true, true),
    partOfSpeech,
    examples,
    note: area("note", t("notePlaceholder"), 3, false),
  };

  const bannerMessage =
    banner === "limit"
      ? t("limit")
      : banner === "network"
        ? t("network")
        : banner === "session"
          ? t("session")
          : banner === "conflict"
            ? t("conflict")
            : null;

  // The text typed in the create form, handed over by the similar-items dialog (US-LIB-02 AC-02).
  const itemId = item?.id;
  // The draft is read from sessionStorage on the client only; the server render has no draft (no hydration mismatch).
  const draftRaw = useSyncExternalStore(
    () => () => undefined,
    () => (itemId ? readDraftRaw(kind, itemId) : null),
    () => null,
  );
  const [dismissedDraft, setDismissedDraft] = useState<string | null>(null);
  const draft = draftRaw !== dismissedDraft ? parseDraft(draftRaw) : null;

  // US-LIB-05 AC-03: closing or reloading the tab asks first when there are unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function loadLatest() {
    if (!conflictLatest) return;
    const latest = valuesFromItem(conflictLatest);
    setValues(latest);
    setBaseline(JSON.stringify(latest));
    setVersion(conflictLatest.version);
    setConflictLatest(null);
    setBanner(null);
  }

  function closeDraft() {
    if (itemId) clearDraft(kind, itemId);
    setDismissedDraft(draftRaw);
  }

  return (
    <>
      {similar && (
        <SimilarDialog
          kind={kind}
          items={similar.items}
          totalCount={similar.totalCount}
          onCancel={closeSimilar}
          onOpen={(id) => saveDraft(kind, id, values)}
          onKeepNew={() => {
            setSimilar(null);
            void save();
          }}
        />
      )}
      <div className={kept || draft ? "lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-6" : undefined}>
        <form noValidate onSubmit={onSubmit} className="rounded-card bg-surface p-6 shadow-card sm:p-8">
          {summaryNames.length > 0 && (
            <div role="alert" className="mb-6 rounded-control border border-danger bg-subtle p-3 text-sm text-danger">
              <p>
                <span aria-hidden="true">(!) </span>
                {t("summary", { fields: summaryFields.join(", ") })}
              </p>
              <ul className="mt-1 list-inside list-disc">
                {summaryNames.slice(0, 5).map((name) => (
                  <li key={name}>
                    <a href={`#${targetOf(name)}`} className="underline">
                      {labelOf(name.startsWith("examples") ? "examples" : name)}
                    </a>
                    : {messageOf(name)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {bannerMessage && (
            <div
              role="alert"
              className="mb-6 flex items-center gap-3 rounded-control border border-danger bg-subtle p-3 text-sm text-danger"
            >
              <p className="flex-1">
                <span aria-hidden="true">(!) </span>
                {bannerMessage}
              </p>
              {banner === "conflict" && conflictLatest && (
                <button
                  type="button"
                  onClick={loadLatest}
                  className={`${buttonBase} border border-border-strong bg-surface text-primary hover:bg-subtle`}
                >
                  {t("reload")}
                </button>
              )}
              {banner === "network" && (
                <button
                  type="submit"
                  className={`${buttonBase} border border-border-strong bg-surface text-primary hover:bg-subtle`}
                >
                  {t("retry")}
                </button>
              )}
            </div>
          )}
          <div className="space-y-5">{FIELD_ORDER[kind].map((name) => fields[name])}</div>
          <div className="mt-8 flex justify-end gap-3 border-t border-border pt-5">
            <Link
              href={editing && item ? libraryPath(kind, item.id) : libraryPath(kind)}
              onClick={(event) => {
                if (dirty && !window.confirm(t("leaveConfirm"))) event.preventDefault();
              }}
              className={`${buttonBase} border border-border-strong bg-surface text-primary hover:bg-subtle`}
            >
              {t("cancel")}
            </Link>
            <button
              type="submit"
              aria-disabled={submitting}
              className={`${buttonBase} bg-accent text-on-accent hover:brightness-95 ${submitting ? "cursor-not-allowed" : ""}`}
            >
              {submitting && <Spinner />}
              {submitting ? t("saving") : editing ? t("saveChanges") : t("save")}
            </button>
          </div>
        </form>
        {(kept || draft) && (
          <div className="mt-6 space-y-4 lg:mt-0">
            {kept && <KeptPanel title={t("keptTitle")} values={kept} kind={kind} onClose={() => setKept(null)} />}
            {draft && <KeptPanel title={t("draftTitle")} values={draft} kind={kind} onClose={closeDraft} />}
          </div>
        )}
      </div>
    </>
  );
}
