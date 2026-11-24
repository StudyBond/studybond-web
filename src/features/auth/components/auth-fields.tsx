"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from "react";

/* Inputs, messages and buttons for the auth pages (styles in auth.css).
   The inputs forward their ref so react-hook-form's register() works. */

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: ReactNode;
  /* Sits on the label's right, e.g. "Forgot password?" */
  labelExtra?: ReactNode;
};

function useFieldIds(id: string | undefined) {
  const auto = useId();
  const fieldId = id ?? `f${auto.replace(/:/g, "")}`;
  return { fieldId, hintId: `${fieldId}-hint`, errorId: `${fieldId}-error` };
}

function describedBy(hint: ReactNode, error: string | undefined, hintId: string, errorId: string) {
  const ids = [hint ? hintId : null, error ? errorId : null].filter(Boolean);
  return ids.length ? ids.join(" ") : undefined;
}

export const AuthField = forwardRef<HTMLInputElement, InputProps>(function AuthField(
  { label, error, hint, labelExtra, id, className, ...props },
  ref,
) {
  const { fieldId, hintId, errorId } = useFieldIds(id);
  return (
    <div className="au-field">
      <div className="au-label">
        <label htmlFor={fieldId}>{label}</label>
        {labelExtra}
      </div>
      <input
        ref={ref}
        id={fieldId}
        className={className ? `au-input ${className}` : "au-input"}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(hint, error, hintId, errorId)}
        {...props}
      />
      {hint ? (
        <p className="au-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="au-err" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, Omit<InputProps, "type">>(function PasswordField(
  { label, error, hint, labelExtra, id, ...props },
  ref,
) {
  const { fieldId, hintId, errorId } = useFieldIds(id);
  const [shown, setShown] = useState(false);
  return (
    <div className="au-field">
      <div className="au-label">
        <label htmlFor={fieldId}>{label}</label>
        {labelExtra}
      </div>
      <div className="au-pw">
        <input
          ref={ref}
          id={fieldId}
          type={shown ? "text" : "password"}
          className="au-input"
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(hint, error, hintId, errorId)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShown((value) => !value)}
          aria-label={shown ? "Hide password" : "Show password"}
          aria-pressed={shown}
        >
          {shown ? "Hide" : "Show"}
        </button>
      </div>
      {hint ? (
        <p className="au-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="au-err" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
});

export function AuthAlert({ children }: { children: ReactNode }) {
  return (
    <div className="au-alert" role="alert">
      <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7.5v5.5M12 16.5h.01" />
      </svg>
      <span>{children}</span>
    </div>
  );
}

export function AuthOk({ children }: { children: ReactNode }) {
  return (
    <div className="au-ok" role="status">
      <CheckIcon />
      <span>{children}</span>
    </div>
  );
}

export function AuthSubmit({
  busy,
  children,
  arrow = true,
  className,
  disabled,
}: {
  busy?: boolean;
  children: ReactNode;
  arrow?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      className={className ? `au-btn ${className}` : "au-btn"}
      disabled={busy || disabled}
      aria-busy={busy || undefined}
    >
      {children}
      {busy ? <span className="au-spin" aria-hidden="true" /> : arrow ? <ArrowIcon /> : null}
    </button>
  );
}

export function ArrowIcon() {
  return (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
      <path d="M11 18.5h2" />
    </svg>
  );
}

export function SignOutIcon() {
  return (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
