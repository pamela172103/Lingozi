"use client";

import { useId, useState, type InputHTMLAttributes, type KeyboardEvent, type TextareaHTMLAttributes } from "react";

export interface SuggestionOption {
  value: string;
  detail?: string;
}

type Props = {
  options: SuggestionOption[];
  onPick: (index: number) => void;
  listLabel: string;
  multiline?: boolean;
  rows?: number;
} & Pick<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "name" | "value" | "disabled" | "required" | "placeholder" | "className" | "aria-invalid" | "aria-describedby"
> & {
    onChange: (value: string) => void;
  };

/** Editable combobox: suggestions never replace typed text until explicitly selected. */
export function SuggestionInput({ options, onPick, listLabel, multiline, rows, onChange, ...props }: Props) {
  const listId = useId();
  const [focused, setFocused] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [active, setActive] = useState(-1);
  const open = focused && !dismissed && !props.disabled && options.length > 0;
  const activeIndex = active < options.length ? active : -1;

  function pick(index: number) {
    onPick(index);
    setDismissed(true);
    setActive(-1);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      if (open) {
        event.preventDefault();
        event.stopPropagation();
      }
      setDismissed(true);
      setActive(-1);
    } else if ((event.key === "ArrowDown" || event.key === "ArrowUp") && options.length) {
      event.preventDefault();
      setDismissed(false);
      setActive(
        event.key === "ArrowDown"
          ? (open ? activeIndex + 1 : 0) % options.length
          : (open && activeIndex >= 0 ? activeIndex - 1 + options.length : options.length - 1) % options.length,
      );
    } else if (event.key === "Enter" && open && activeIndex >= 0) {
      event.preventDefault();
      pick(activeIndex);
    }
  }

  const shared = {
    ...props,
    role: "combobox" as const,
    autoComplete: "off",
    "aria-autocomplete": "list" as const,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-controls": open ? listId : undefined,
    "aria-activedescendant": open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined,
    onFocus: () => {
      setFocused(true);
      setDismissed(false);
      setActive(-1);
    },
    onBlur: () => {
      setFocused(false);
      setActive(-1);
    },
    onKeyDown,
  };

  return (
    <div className="relative min-w-0">
      {multiline ? (
        <textarea
          {...(shared as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          rows={rows}
          onChange={(event) => {
            onChange(event.target.value);
            setDismissed(false);
            setActive(-1);
          }}
        />
      ) : (
        <input
          {...shared}
          type="text"
          onChange={(event) => {
            onChange(event.target.value);
            setDismissed(false);
            setActive(-1);
          }}
        />
      )}
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-live="polite"
          aria-label={listLabel}
          className="absolute top-full right-0 left-0 z-20 mt-1 max-h-60 overflow-y-auto rounded-control border border-border-strong bg-surface p-1 shadow-card"
        >
          {options.map((option, index) => (
            <li
              key={`${index}-${option.value}`}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              onMouseDown={(event) => event.preventDefault()}
              onMouseMove={() => setActive(index)}
              onClick={() => pick(index)}
              className={`cursor-pointer rounded-control px-3 py-2 text-sm break-words whitespace-pre-wrap text-primary ${activeIndex === index ? "bg-accent-subtle" : "hover:bg-subtle"}`}
            >
              <span className="block">{option.value}</span>
              {option.detail && <span className="mt-1 block text-xs text-muted">{option.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
