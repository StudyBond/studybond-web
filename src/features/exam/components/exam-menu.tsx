"use client";

import { useEffect, useRef } from "react";
import { ALargeSmall, ArrowRight, Calculator, LogOut } from "lucide-react";

import { TextSizePicker } from "@/features/exam/components/text-size-picker";
import { cn } from "@/lib/utils/cn";

import s from "./exam-shell.module.css";

type ExamMenuProps = {
  autoAdvance: boolean;
  onCalculator: () => void;
  onToggleAutoAdvance: () => void;
  onLeave: () => void;
  onClose: () => void;
};

/**
 * The exam's ... menu. Only what is needed mid-paper: Calculator,
 * Auto-advance (this sitting only; the default lives in Settings), Text size,
 * Leave. Preferences such as paper colour belong in Settings, not here.
 * Text size is the exception: a student who can't read the question needs it
 * now, not after the exam. It saves to the account, same as in Settings.
 */
export function ExamMenu({ autoAdvance, onCalculator, onToggleAutoAdvance, onLeave, onClose }: ExamMenuProps) {
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    first.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <>
      <div className={s.menuScrim} onClick={onClose} />
      <div className={s.menu} role="menu" aria-label="Exam tools">
        <button ref={first} type="button" role="menuitem" className={s.menuItem} onClick={onCalculator}>
          <Calculator aria-hidden="true" />
          <span>Calculator</span>
        </button>
        <button
          type="button"
          role="menuitemcheckbox"
          aria-checked={autoAdvance}
          className={s.menuItem}
          onClick={onToggleAutoAdvance}
        >
          <ArrowRight aria-hidden="true" />
          <span>
            Auto-advance
            <small>Move on after you choose · default in Settings</small>
          </span>
          <i className={cn(s.switch, autoAdvance && s.switchOn)} aria-hidden="true" />
        </button>
        <div className={s.menuRow}>
          <ALargeSmall aria-hidden="true" />
          <span>Text size</span>
          <TextSizePicker />
        </div>
        <hr />
        <div className={s.menuKeys}>
          <kbd className={s.kbd}>A</kbd>–<kbd className={s.kbd}>E</kbd> choose · <kbd className={s.kbd}>N</kbd> next ·{" "}
          <kbd className={s.kbd}>P</kbd> back · <kbd className={s.kbd}>F</kbd> mark · <kbd className={s.kbd}>S</kbd> submit
        </div>
        <hr />
        <button type="button" role="menuitem" className={cn(s.menuItem, s.danger)} onClick={onLeave}>
          <LogOut aria-hidden="true" />
          <span>Leave exam</span>
        </button>
      </div>
    </>
  );
}
