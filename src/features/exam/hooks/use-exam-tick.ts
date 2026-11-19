"use client";

import { useEffect, useState } from "react";
import { useExamStore } from "@/features/exam/stores/exam-store";

/**
 * Runs the exam countdown: one store tick a second while the timer runs.
 * The old ExamTimer chip did this itself; the new rail only shows the time,
 * so the exam shell calls this once instead.
 */
export function useExamTick() {
  const timerRunning = useExamStore((s) => s.timerRunning);
  const hasTimeLeft = useExamStore((s) => s.remainingSeconds > 0);
  const tick = useExamStore((s) => s.tick);

  useEffect(() => {
    if (!timerRunning || !hasTimeLeft) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerRunning, hasTimeLeft, tick]);
}

/**
 * The current time, refreshed once a second. For live "minutes spent" and
 * pace, which count the question that is open right now.
 */
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}
