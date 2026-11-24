"use client";

import { useId } from "react";

/* Six boxes for a 6-digit code. Underneath is ONE real input laid over the
   boxes, so typing, pasting the whole code and the phone's "code from
   email" suggestion all work; the boxes only show its digits. */

export function CodeBoxes({
  label,
  value,
  onChange,
  onBlur,
  error,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  autoFocus?: boolean;
}) {
  const id = `code${useId().replace(/:/g, "")}`;
  const digits = value.replace(/\D/g, "").slice(0, 6);
  const keepCaretAtEnd = (input: HTMLInputElement) => {
    const end = input.value.length;
    if (input.selectionStart !== end || input.selectionEnd !== end) input.setSelectionRange(end, end);
  };

  return (
    <div className="au-field">
      <div className="au-label">
        <label htmlFor={id}>{label}</label>
      </div>
      <div className={error ? "au-code bad" : "au-code"}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={i === digits.length ? "au-code-cell next" : "au-code-cell"} aria-hidden="true">
            {digits[i] ?? ""}
          </div>
        ))}
        <input
          id={id}
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          autoFocus={autoFocus}
          value={digits}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 6))}
          onBlur={onBlur}
          onFocus={(event) => keepCaretAtEnd(event.currentTarget)}
          onSelect={(event) => keepCaretAtEnd(event.currentTarget)}
        />
      </div>
      {error ? (
        <p className="au-err" id={`${id}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
