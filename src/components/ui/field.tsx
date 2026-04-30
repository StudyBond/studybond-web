"use client";

import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState } from "react";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(
  function Field({ label, error, className, id, type, ...props }, ref) {
    const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordField = type === "password";
    const resolvedType = isPasswordField
      ? showPassword
        ? "text"
        : "password"
      : type;

    return (
      <div className="space-y-1.5">
        <label
          htmlFor={fieldId}
          className="block text-xs font-medium text-white/50 tracking-wide"
        >
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={fieldId}
            type={resolvedType}
            className={cn(
              "w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white/90 outline-none transition-all duration-200",
              "placeholder:text-white/20",
              "hover:border-white/[0.1]",
              "focus:border-[#e09040]/50 focus:ring-2 focus:ring-[#e09040]/15 focus:bg-white/[0.05]",
              isPasswordField && "pr-11",
              error &&
                "border-red-400/40 focus:border-red-400/50 focus:ring-red-400/15",
              className,
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            {...props}
          />
          {isPasswordField ? (
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition-colors hover:text-white/60"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </div>
        {error ? (
          <p
            id={`${fieldId}-error`}
            className="text-xs text-red-400 animate-[sb-slide-down_0.2s_ease-out]"
          >
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
