"use client";

import { useExamStore } from "@/features/exam/stores/exam-store";
import { useEffect, useState } from "react";

import s from "./exam-shell.module.css";

type TimeExpiredModalProps = {
  onAutoSubmit: () => void;
  /**
   * Set once the paper is saved on this device because there is no
   * connection (by time running out, or by the student's own submit).
   */
  saved: { reason: "timeup" | "manual"; error: string | null } | null;
  isOnline: boolean;
  onLeave: () => void;
};

/**
 * Time's up: a short freeze, "collecting your answers", then the submit.
 * Offline, it doesn't spin: it says the answers are saved and waits for a
 * connection; the exam screen then sends the paper and opens the results.
 */
export function TimeExpiredModal({ onAutoSubmit, saved, isOnline, onLeave }: TimeExpiredModalProps) {
  const open = useExamStore((st) => st.timeExpiredModalOpen);
  const [phase, setPhase] = useState<"freeze" | "gathering" | "submitting">("freeze");
  const isSaved = saved !== null;

  useEffect(() => {
    if (!open) {
      setPhase("freeze");
      return;
    }
    // Already saved offline (submitted by hand earlier): nothing to run.
    if (isSaved) return;

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
  }, [open, isSaved, onAutoSubmit]);

  if (!open && !saved) return null;

  if (saved) {
    const title = saved.reason === "timeup" ? <>Time&rsquo;s up</> : "Paper saved";
    return (
      <div className={s.scrim} style={{ zIndex: 70 }}>
        <div className={s.timeup} role="alert" aria-live="assertive">
          <p className={s.timeupBig}>{title}</p>
          {saved.error ? (
            <>
              <p className={s.timeupLine}>We couldn&rsquo;t send your paper.</p>
              <p className={s.timeupNote}>{saved.error}</p>
              <button type="button" className={`${s.btn} ${s.btnPrimary} ${s.timeupBtn}`} onClick={onLeave}>
                Go to dashboard
              </button>
            </>
          ) : isOnline ? (
            <>
              <p className={s.timeupLine}>Your answers are saved. Sending your paper…</p>
              <span className={s.timeupBar} aria-hidden="true">
                <i />
              </span>
            </>
          ) : (
            <>
              <p className={s.timeupLine}>Your answers are saved on this device.</p>
              <p className={s.timeupNote}>
                You&rsquo;re offline. We&rsquo;ll send your paper as soon as you&rsquo;re back online, then show your
                results.
              </p>
              <span className={s.timeupWait}>
                <i aria-hidden="true" />
                Waiting for a connection
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

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
