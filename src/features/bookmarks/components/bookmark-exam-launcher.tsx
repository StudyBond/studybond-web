"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Crown, Lock, BookOpen, Zap, Loader2 } from "lucide-react";
import {
  evaluateBookmarkExamGate,
  BOOKMARK_EXAM_MIN_QUESTIONS,
  type BookmarkExamGateResult,
} from "@/lib/utils/bookmark-exam-gate";
import { startBookmarkExam } from "@/lib/api/exams";
import { PremiumUpsellSheet } from "./premium-upsell-sheet";

type BookmarkExamLauncherProps = {
  bookmarkCount: number;
  isPremium: boolean;
  availableSubjects: string[];
};

export function BookmarkExamLauncher({
  bookmarkCount,
  isPremium,
  availableSubjects,
}: BookmarkExamLauncherProps) {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [isLaunching, setIsLaunching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [upsellOpen, setUpsellOpen] = useState(false);

  const gate: BookmarkExamGateResult = useMemo(
    () => evaluateBookmarkExamGate(bookmarkCount, isPremium),
    [bookmarkCount, isPremium],
  );

  const handleLaunch = useCallback(async () => {
    if (gate.status !== "UNLOCKED") return;
    setIsLaunching(true);
    setError(null);

    try {
      const session = await startBookmarkExam(
        selectedSubject ? { subject: selectedSubject } : undefined,
      );
      router.push(`/exams/${session.examId}`);
    } catch (err: any) {
      setError(err?.message ?? "Failed to start bookmark exam.");
      setIsLaunching(false);
    }
  }, [gate.status, selectedSubject, router]);

  const progressPercent = Math.min(
    100,
    (bookmarkCount / BOOKMARK_EXAM_MIN_QUESTIONS) * 100,
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.015]"
      >
        {/* Ambient glow for unlocked state */}
        {gate.status === "UNLOCKED" && (
          <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-72 rounded-full bg-[var(--sb-accent)]/[0.06] blur-3xl" />
        )}

        <div className="relative p-5 space-y-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  gate.status === "UNLOCKED"
                    ? "bg-[var(--sb-accent)]/[0.12] text-[var(--sb-accent)]"
                    : "bg-white/[0.04] text-white/20",
                )}
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/80 tracking-tight">
                  Bookmark Exam
                </h3>
                <p className="text-[11px] text-white/25 leading-snug">
                  Test yourself on your saved questions
                </p>
              </div>
            </div>

            {/* Status badge */}
            {gate.status === "LOCKED_PREMIUM" && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--sb-accent)]/[0.08] text-[var(--sb-accent)]">
                <Crown className="h-2.5 w-2.5" />
                Premium
              </span>
            )}
            {gate.status === "LOCKED_INSUFFICIENT" && (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/[0.04] text-white/30">
                <Lock className="h-2.5 w-2.5" />
                {bookmarkCount}/{BOOKMARK_EXAM_MIN_QUESTIONS}
              </span>
            )}
          </div>

          {/* Progress bar for insufficient state */}
          {gate.status === "LOCKED_INSUFFICIENT" && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--sb-accent)]/60 to-[var(--sb-accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                />
              </div>
              <p className="text-[11px] text-white/25">
                Bookmark <span className="text-[var(--sb-accent)] font-semibold">{BOOKMARK_EXAM_MIN_QUESTIONS - bookmarkCount} more</span> question{BOOKMARK_EXAM_MIN_QUESTIONS - bookmarkCount !== 1 ? "s" : ""} to unlock
              </p>
            </div>
          )}

          {/* Subject filter chips for unlocked state */}
          {gate.status === "UNLOCKED" && availableSubjects.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSubject(undefined)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all",
                  !selectedSubject
                    ? "bg-[var(--sb-accent)]/[0.15] text-[var(--sb-accent)] shadow-[0_0_12px_var(--sb-accent-glow)]"
                    : "bg-white/[0.03] text-white/25 hover:bg-white/[0.06] hover:text-white/40",
                )}
              >
                ALL ({bookmarkCount})
              </button>
              {availableSubjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSubject(s === selectedSubject ? undefined : s)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all",
                    selectedSubject === s
                      ? "bg-[var(--sb-accent)]/[0.15] text-[var(--sb-accent)] shadow-[0_0_12px_var(--sb-accent-glow)]"
                      : "bg-white/[0.03] text-white/25 hover:bg-white/[0.06] hover:text-white/40",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] text-red-400/80 bg-red-400/[0.04] rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* CTA */}
          {gate.status === "LOCKED_PREMIUM" && (
            <button
              onClick={() => setUpsellOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-[var(--sb-accent)] bg-[var(--sb-accent)]/[0.08] hover:bg-[var(--sb-accent)]/[0.14] border border-[var(--sb-accent)]/[0.12] transition-all duration-200"
            >
              <Crown className="h-4 w-4" />
              Unlock with Premium
            </button>
          )}

          {gate.status === "LOCKED_INSUFFICIENT" && (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white/15 bg-white/[0.02] border border-white/[0.04] cursor-not-allowed"
            >
              <Lock className="h-4 w-4" />
              Need {BOOKMARK_EXAM_MIN_QUESTIONS} Bookmarks
            </button>
          )}

          {gate.status === "UNLOCKED" && (
            <motion.button
              onClick={handleLaunch}
              disabled={isLaunching}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-200",
                isLaunching
                  ? "bg-[var(--sb-accent)]/[0.15] text-[var(--sb-accent)]/50 cursor-wait"
                  : "bg-gradient-to-r from-[var(--sb-accent)] to-[#d07830] text-[#0c0c0e] hover:shadow-[0_0_24px_var(--sb-accent-glow)]",
              )}
            >
              {isLaunching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Start Bookmark Exam ({selectedSubject ? "filtered" : `${bookmarkCount} Qs`})
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Premium upsell sheet */}
      <PremiumUpsellSheet
        open={upsellOpen}
        bookmarkCount={bookmarkCount}
        onUpgrade={() => router.push("/dashboard/settings")}
        onDismiss={() => setUpsellOpen(false)}
      />
    </>
  );
}
