"use client";

import { useNow } from "@/features/exam/hooks/use-exam-tick";
import { useExamStore } from "@/features/exam/stores/exam-store";
import { useEffect, useState } from "react";

import s from "./exam-shell.module.css";

/**
 * A paper saved on this device because there was no connection (by time
 * running out, or by the student's own submit). `deadline` is when the
 * server stops accepting it; `error` is set once the server refused it.
 */
export type SavedPaper = { reason: "timeup" | "manual"; error: string | null; deadline: number };

type TimeExpiredModalProps = {
  onAutoSubmit: () => void;
  saved: SavedPaper | null;
  isOnline: boolean;
  onLeave: () => void;
};

/** "Get back online by 11:45" with a minute countdown, while offline. */
function OfflineWait({ deadline }: { deadline: number }) {
  const now = useNow();
  const left = deadline - now;
  const by = new Date(deadline).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  if (left <= 0) {
    return (
      <>
        <p className={s.timeupLine}>Your answers are saved on this device.</p>
        <p className={s.timeupNote}>
          The time to send them ran out at {by}, so this paper can&rsquo;t be marked now.
        </p>
      </>
    );
  }

  const mins = Math.ceil(left / 60_000);
  const leftText =
    mins <= 1 ? "under a minute" : mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} hr ${mins % 60} min`;
  return (
    <>
      <p className={s.timeupLine}>Your answers are saved on this device.</p>
      <p className={s.timeupNote}>
        You&rsquo;re offline. Get back online by <b className={s.timeupBy}>{by}</b> to send them, or this paper
        can&rsquo;t be marked. We&rsquo;ll send it and show your results as soon as you&rsquo;re connected.
      </p>
      <span className={s.timeupWait}>
        <i aria-hidden="true" />
        Waiting for a connection · {leftText} left
      </span>
    </>
  );
}

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
            <OfflineWait deadline={saved.deadline} />
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
