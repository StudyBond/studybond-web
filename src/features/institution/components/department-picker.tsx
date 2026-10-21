"use client";

import type { Department } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

export const DEPARTMENTS: Array<{ value: Department; label: string }> = [
  { value: "SCIENCE", label: "Science" },
  { value: "ART", label: "Art" },
  { value: "COMMERCIAL", label: "Commercial" },
];

export function departmentLabel(value: Department | null | undefined) {
  return DEPARTMENTS.find((department) => department.value === value)?.label ?? null;
}

/**
 * Science, Art or Commercial as three buttons side by side, so all three are
 * in view and the choice is a single tap.
 */
export function DepartmentPicker({
  value,
  onChange,
  labelledBy,
  error,
}: {
  value: Department | undefined;
  onChange: (value: Department) => void;
  labelledBy?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div
        role="radiogroup"
        aria-labelledby={labelledBy}
        aria-invalid={Boolean(error)}
        className="grid grid-cols-3 gap-2"
      >
        {DEPARTMENTS.map((department) => {
          const selected = department.value === value;
          return (
            <button
              key={department.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(department.value)}
              className={cn(
                "h-11 rounded-xl border text-sm font-medium outline-none transition-all duration-200",
                "focus-visible:ring-2 focus-visible:ring-[#e09040]/30",
                selected
                  ? "border-[#e09040]/50 bg-[#e09040]/10 text-[#f5c890] ring-2 ring-[#e09040]/15"
                  : "border-white/[0.06] bg-white/[0.04] text-white/70 hover:border-white/[0.1] hover:bg-white/[0.06]",
                error && !value && "border-red-400/40",
              )}
            >
              {department.label}
            </button>
          );
        })}
      </div>
      {error ? (
        <p className="text-xs text-red-400 animate-[sb-slide-down_0.2s_ease-out]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
