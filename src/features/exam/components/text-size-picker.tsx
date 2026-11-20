"use client";

import { useEffect, useRef, useState } from "react";
import { ALargeSmall } from "lucide-react";

import { TEXT_SIZES } from "@/features/exam/lib/text-size";
import { useExamPrefs } from "@/features/exam/stores/exam-prefs-store";
import { cn } from "@/lib/utils/cn";

import s from "./text-size.module.css";

const GLYPH = [s.a1, s.a2, s.a3];

/** Three A's, small to big. Saves to the account like the other exam settings. */
export function TextSizePicker({ className }: { className?: string }) {
  const size = useExamPrefs((p) => p.textSize);
  const setSize = useExamPrefs((p) => p.setTextSize);

  return (
    <div role="radiogroup" aria-label="Text size" className={cn(s.seg, className)}>
      {TEXT_SIZES.map((t, i) => (
        <button
          key={t.value}
          type="button"
          role="radio"
          aria-checked={size === t.value}
          aria-label={t.label}
          title={t.label}
          onClick={() => setSize(t.value)}
        >
          <span className={GLYPH[i]} aria-hidden="true">
            A
          </span>
        </button>
      ))}
    </div>
  );
}

/**
 * An "Aa" button that opens the picker, for the review's top bars.
 * `buttonClassName` lets each bar give it its own icon-button look.
 */
export function TextSizeButton({ buttonClassName }: { buttonClassName?: string }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: PointerEvent) {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        // Close only this, not the question drawer under it.
        e.stopPropagation();
        setOpen(false);
      }
    }
    window.addEventListener("pointerdown", onDown, true);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("pointerdown", onDown, true);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [open]);

  return (
    <div className={s.anchor} ref={wrap}>
      <button
        type="button"
        className={buttonClassName}
        aria-label="Text size"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <ALargeSmall aria-hidden="true" />
      </button>
      {open ? (
        <div className={s.pop}>
          <b>Text size</b>
          <TextSizePicker />
        </div>
      ) : null}
    </div>
  );
}
