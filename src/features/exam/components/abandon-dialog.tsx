"use client";

import { useExamStore } from "@/features/exam/stores/exam-store";
import { useEffect } from "react";
import { cn } from "@/lib/utils/cn";

import s from "./exam-shell.module.css";

type AbandonDialogProps = {
  onConfirm: () => void;
  isAbandoning: boolean;
};

export function AbandonDialog({ onConfirm, isAbandoning }: AbandonDialogProps) {
  const open = useExamStore((st) => st.abandonDialogOpen);
  const setOpen = useExamStore((st) => st.setAbandonDialogOpen);

  useEffect(() => {
    if (!open || isAbandoning) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, isAbandoning, setOpen]);

  if (!open) return null;

  return (
    <div className={s.scrim} onClick={() => !isAbandoning && setOpen(false)}>
      <div
        className={cn(s.dialog, s.dialogNarrow)}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-exam-title"
        aria-describedby="leave-exam-text"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="leave-exam-title">Leave this exam?</h2>
        <p id="leave-exam-text" className={s.lede}>
          Your answers will be lost and you won&rsquo;t earn points for this exam. You can&rsquo;t undo this.
        </p>
        <div className={s.dialogActions}>
          <button
            type="button"
            className={cn(s.btn, s.btnGhost)}
            onClick={() => setOpen(false)}
            disabled={isAbandoning}
            autoFocus
          >
            Keep going
          </button>
          <button
            type="button"
            className={cn(s.btn, s.btnDanger)}
            onClick={onConfirm}
            disabled={isAbandoning}
            aria-busy={isAbandoning}
          >
            {isAbandoning ? "Leaving…" : "Leave exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
