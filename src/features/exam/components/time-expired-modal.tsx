"use client";

import { useExamStore } from "@/features/exam/stores/exam-store";
import { useEffect, useState } from "react";

import s from "./exam-shell.module.css";

type TimeExpiredModalProps = {
  onAutoSubmit: () => void;
};

export function TimeExpiredModal({ onAutoSubmit }: TimeExpiredModalProps) {
  const open = useExamStore((st) => st.timeExpiredModalOpen);
  const [phase, setPhase] = useState<"freeze" | "gathering" | "submitting">("freeze");

  useEffect(() => {
    if (!open) {
      setPhase("freeze");
      return;
    }

    // Phase 1: Freeze — show "Time Expired" for 1.5s
    const t1 = setTimeout(() => setPhase("gathering"), 1500);
    // Phase 2: "Gathering answers" for 2s
    const t2 = setTimeout(() => {
      setPhase("submitting");
      onAutoSubmit();
    }, 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open, onAutoSubmit]);

  if (!open) return null;

  const line =
    phase === "freeze"
      ? "The clock has run out."
      : phase === "gathering"
        ? "Collecting your answers…"
        : "Submitting your paper…";

  return (
    <div className={s.scrim} style={{ zIndex: 70 }}>
      <div className={s.timeup} role="alert" aria-live="assertive">
        <p className={s.timeupBig}>Time&rsquo;s up</p>
        <p key={phase} className={s.timeupLine}>
          {line}
        </p>
        {phase !== "freeze" ? (
          <span className={s.timeupBar} aria-hidden="true">
            <i />
          </span>
        ) : null}
      </div>
    </div>
  );
}
