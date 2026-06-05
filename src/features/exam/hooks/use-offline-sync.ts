"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { offlineStore } from "@/features/exam/stores/offline-store";
import { submitExam } from "@/lib/api/exams";

/**
 * Maximum number of drain attempts before giving up on a single submission.
 * Prevents infinite loops on permanently-rejected submissions (e.g. 4xx errors).
 */
const MAX_SINGLE_SUBMIT_RETRIES = 3;

/**
 * Exponential backoff base delay in ms.
 * Actual delay = BASE * 2^attempt (capped at MAX_BACKOFF_MS).
 */
const BACKOFF_BASE_MS = 2_000;
const MAX_BACKOFF_MS = 60_000;

/** How often to re-attempt draining if there are still items queued (ms). */
const PERIODIC_DRAIN_INTERVAL_MS = 30_000;

/**
 * Hook that automatically drains queued offline exam submissions
 * when the browser regains network connectivity.
 *
 * This is the critical missing piece — previously, submissions queued to IDB
 * by useSubmitExamMutation were never retried on reconnect.
 *
 * Design decisions:
 * - Uses window 'online' event + periodic interval (belt & suspenders)
 * - Each submission is processed independently (one failure doesn't block others)
 * - 4xx errors (exam expired/abandoned/already submitted) clear the queue entry
 * - 5xx/network errors leave the entry for the next retry cycle
 * - Shows user-friendly toast progress during drain
 * - Invalidates React Query caches after successful sync
 */
export function useOfflineSync() {
  const queryClient = useQueryClient();
  const isDrainingRef = useRef(false);
  const periodicTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const drainQueue = useCallback(async () => {
    // Prevent concurrent drain runs
    if (isDrainingRef.current) return;

    // Don't attempt if we're definitely offline
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    let queuedIds: number[];
    try {
      queuedIds = await offlineStore.getAllQueuedSubmitIds();
    } catch {
      return; // IDB unavailable — nothing to drain
    }

    if (queuedIds.length === 0) return;

    isDrainingRef.current = true;

    let successCount = 0;
    let failCount = 0;

    // Show a non-intrusive sync indicator
    const toastId = toast.loading(
      `Syncing ${queuedIds.length} offline exam${queuedIds.length > 1 ? "s" : ""}...`,
      { duration: Infinity },
    );

    for (const examId of queuedIds) {
      const answers = await offlineStore.getQueuedSubmit(examId);
      if (!answers || answers.length === 0) {
        // Corrupted or empty entry — clear it
        await offlineStore.clearQueuedSubmit(examId);
        continue;
      }

      let submitted = false;

      for (let attempt = 0; attempt < MAX_SINGLE_SUBMIT_RETRIES; attempt++) {
        try {
          await submitExam(examId, { answers });
          submitted = true;
          break;
        } catch (err: unknown) {
          const status =
            typeof err === "object" &&
            err !== null &&
            "status" in err &&
            typeof (err as { status?: unknown }).status === "number"
              ? (err as { status: number }).status
              : 0;

          // 4xx errors (except 429 rate limit) mean the server definitively
          // rejected this submission — no point retrying
          if (status >= 400 && status < 500 && status !== 429) {
            // Clear the queue entry — it's permanently unsubmittable
            await offlineStore.clearQueuedSubmit(examId);
            await offlineStore.clearExamSession(examId);
            await offlineStore.clearAnswerProgress(examId);
            failCount++;

            const message =
              typeof err === "object" &&
              err !== null &&
              "message" in err &&
              typeof (err as { message?: unknown }).message === "string"
                ? (err as { message: string }).message
                : "Exam could not be submitted.";

            toast.error(`Exam #${examId}: ${message}`, {
              duration: 6000,
            });
            break;
          }

          // 5xx or network error — wait and retry
          if (attempt < MAX_SINGLE_SUBMIT_RETRIES - 1) {
            const delay = Math.min(
              BACKOFF_BASE_MS * Math.pow(2, attempt),
              MAX_BACKOFF_MS,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      if (submitted) {
        // Clean up all local state for this exam
        await offlineStore.clearQueuedSubmit(examId);
        await offlineStore.clearExamSession(examId);
        await offlineStore.clearAnswerProgress(examId);
        successCount++;
      }
    }

    isDrainingRef.current = false;

    // Dismiss the loading toast
    toast.dismiss(toastId);

    // Show summary
    if (successCount > 0) {
      toast.success(
        `${successCount} offline exam${successCount > 1 ? "s" : ""} synced successfully!`,
        { duration: 5000, icon: "✅" },
      );

      // Invalidate relevant queries so the UI reflects the new data
      queryClient.invalidateQueries({ queryKey: ["exam-history"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      queryClient.invalidateQueries({ queryKey: ["streak"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    }

    if (failCount > 0 && successCount === 0) {
      toast.error(
        `${failCount} offline exam${failCount > 1 ? "s" : ""} could not be synced. The exam${failCount > 1 ? "s" : ""} may have expired.`,
        { duration: 6000 },
      );
    }
  }, [queryClient]);

  useEffect(() => {
    // 1. Drain on mount (user may return to the app with pending submissions)
    drainQueue();

    // 2. Drain when the browser comes back online
    function handleOnline() {
      // Small delay to let the network stabilize
      setTimeout(drainQueue, 1500);
    }

    window.addEventListener("online", handleOnline);

    // 3. Periodic retry as a safety net (in case 'online' event is missed)
    periodicTimerRef.current = setInterval(() => {
      if (navigator.onLine) {
        drainQueue();
      }
    }, PERIODIC_DRAIN_INTERVAL_MS);

    return () => {
      window.removeEventListener("online", handleOnline);
      if (periodicTimerRef.current) {
        clearInterval(periodicTimerRef.current);
      }
    };
  }, [drainQueue]);

  return { drainQueue };
}
