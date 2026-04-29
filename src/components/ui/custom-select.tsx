"use client";

import { cn } from "@/lib/utils/cn";
import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

export interface CustomSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  value: string;
  onValueChange: (val: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomSelect({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  className,
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/90 outline-none transition-all",
          !disabled && "hover:bg-white/[0.04]",
          isOpen && "border-[#e09040]/50 ring-2 ring-[#e09040]/15",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 opacity-50 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 mt-2 w-full min-w-[max-content] overflow-hidden rounded-xl border border-white/10 bg-[#121212] py-1 shadow-2xl">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "relative flex cursor-pointer select-none items-center px-4 py-2.5 text-sm text-white/80 transition-colors",
                  option.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-white/10",
                  value === option.value && "bg-[#e09040]/10 font-medium text-[#e09040]"
                )}
                onClick={() => {
                  if (option.disabled) return;
                  onValueChange(option.value);
                  setIsOpen(false);
                }}
              >
                <div className="flex-1 truncate pr-6">{option.label}</div>
                {value === option.value && (
                  <Check className="absolute right-4 h-4 w-4 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
