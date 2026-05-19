"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Crown, Lock, BookOpen, Zap, Loader2, Sparkles, Trophy, Calendar } from "lucide-react";
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
      <div className="relative">
        <AnimatePresence mode="wait">
          {/* STATE 1: LOCKED FOR FREE USERS */}
          {gate.status === "LOCKED_PREMIUM" && (
            <motion.div
              key="locked-premium"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-[var(--sb-gold)]/15 bg-gradient-to-br from-white/[0.02] to-white/[0.005] p-5 md:p-6"
            >
              <div className="pointer-events-none absolute -top-32 right-0 h-64 w-64 rounded-full bg-[var(--sb-gold)]/[0.04] blur-3xl" />
              
              <div className="space-y-5">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sb-gold)]/10 text-[var(--sb-gold)] border border-[var(--sb-gold)]/20 shadow-[0_0_15px_var(--sb-gold-glow)] shrink-0">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/95 tracking-wide">
                        Bookmark Exam (Premium)
                      </h3>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mt-0.5">
                        Premium Feature
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--sb-gold)]/10 text-[var(--sb-gold)] border border-[var(--sb-gold)]/20">
                    Locked
                  </span>
                </div>

                {/* Body details */}
                <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
                  <div className="rounded-xl border border-white/[0.03] bg-white/[0.005] p-3 space-y-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-[11px] font-semibold text-white/70">Targeted Practice</h4>
                    <p className="text-[10px] text-white/40 leading-normal">
                      Practice only the questions you have saved.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.03] bg-white/[0.005] p-3 space-y-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]">
                      <Trophy className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-[11px] font-semibold text-white/70">Timed Sessions</h4>
                    <p className="text-[10px] text-white/40 leading-normal">
                      Choose to practice with or without a countdown timer.
                    </p>
                  </div>
                  <div className="rounded-xl border border-white/[0.03] bg-white/[0.005] p-3 space-y-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]">
                      <Calendar className="h-3.5 w-3.5" />
                    </div>
                    <h4 className="text-[11px] font-semibold text-white/70">Track Progress</h4>
                    <p className="text-[10px] text-white/40 leading-normal">
                      See how your performance improves over time.
                    </p>
                  </div>
                </div>

                {/* Upgrade Button */}
                <button
                  onClick={() => setUpsellOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[var(--sb-gold)] via-[#c17a28] to-[#8b4f1a] shadow-[0_4px_20px_rgba(212,161,33,0.15)] hover:shadow-[0_4px_30px_rgba(212,161,33,0.22)] active:scale-[0.98] transition-all duration-300 border border-[var(--sb-gold)]/20 cursor-pointer"
                >
                  <Crown className="h-4 w-4" />
                  Unlock Premium Features
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 2: PREMIUM BUT INSUFFICIENT QUESTIONS (< 20) */}
          {gate.status === "LOCKED_INSUFFICIENT" && (
            <motion.div
              key="locked-insufficient"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.015] p-5 md:p-6"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] text-white/30 border border-white/[0.05] shrink-0">
                      <Lock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/95 tracking-wide">
                        Bookmark Exam
                      </h3>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mt-0.5">
                        {bookmarkCount} of {BOOKMARK_EXAM_MIN_QUESTIONS} questions saved
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-white/[0.04] text-white/40 border border-white/[0.05]">
                    Premium
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="h-2 w-full rounded-full bg-white/[0.03] overflow-hidden border border-white/[0.02]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--sb-accent)]/70 to-[var(--sb-accent)] shadow-[0_0_12px_var(--sb-accent-glow)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-white/20">
                    <span>{bookmarkCount} saved</span>
                    <span>Requires {BOOKMARK_EXAM_MIN_QUESTIONS} saved questions</span>
                  </div>
                </div>

                {/* Recommendation instructions */}
                <div className="rounded-xl border border-[var(--sb-accent)]/10 bg-[var(--sb-accent)]/[0.02] p-4 text-xs text-[var(--sb-accent-text)]/90 leading-relaxed">
                  You need to save at least <span className="font-bold text-white">{BOOKMARK_EXAM_MIN_QUESTIONS - bookmarkCount} more</span> question{BOOKMARK_EXAM_MIN_QUESTIONS - bookmarkCount !== 1 ? "s" : ""} to start a practice test. Keep bookmarking questions while practicing.
                </div>

                {/* CTA disabled */}
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white/10 bg-white/[0.01] border border-white/[0.03] cursor-not-allowed"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Locked (Save {BOOKMARK_EXAM_MIN_QUESTIONS - bookmarkCount} more)
                </button>
              </div>
            </motion.div>
          )}

          {/* STATE 3: UNLOCKED CONSOLE */}
          {gate.status === "UNLOCKED" && (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="relative overflow-hidden rounded-2xl border border-[var(--sb-accent)]/20 bg-gradient-to-br from-white/[0.02] to-white/[0.005] p-5 md:p-6 shadow-[0_4px_30px_var(--sb-accent-glow)]"
            >
              <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-[var(--sb-accent)]/[0.08] blur-3xl animate-pulse" />

              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--sb-accent)]/10 text-[var(--sb-accent)] border border-[var(--sb-accent)]/20 shadow-[0_0_15px_var(--sb-accent-glow)] shrink-0">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white/95 tracking-wide">
                        Bookmark Exam
                      </h3>
                      <p className="text-[10px] text-white/30 uppercase tracking-widest font-semibold mt-0.5">
                        {bookmarkCount} Questions Saved
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[var(--sb-accent)]/10 text-[var(--sb-accent-text)] border border-[var(--sb-accent)]/20">
                    Ready
                  </span>
                </div>

                {/* Sub-filtering */}
                {availableSubjects.length > 1 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-wider">Filter by Subject</p>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setSelectedSubject(undefined)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 border outline-none",
                          !selectedSubject
                            ? "border-[var(--sb-accent)]/30 bg-[var(--sb-accent)]/[0.12] text-[var(--sb-accent-text)]"
                            : "border-white/[0.03] bg-white/[0.01] text-white/30 hover:border-white/[0.06] hover:text-white/60"
                        )}
                      >
                        All Subjects ({bookmarkCount})
                      </button>
                      {availableSubjects.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => setSelectedSubject(subject === selectedSubject ? undefined : subject)}
                          className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 border outline-none",
                            selectedSubject === subject
                              ? "border-[var(--sb-accent)]/30 bg-[var(--sb-accent)]/[0.12] text-[var(--sb-accent-text)]"
                              : "border-white/[0.03] bg-white/[0.01] text-white/30 hover:border-white/[0.06] hover:text-white/60"
                          )}
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error presentation */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[10px] text-red-400 bg-red-400/[0.05] rounded-xl border border-red-400/10 p-3 leading-relaxed"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Launch Button */}
                <button
                  onClick={handleLaunch}
                  disabled={isLaunching}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 border",
                    isLaunching
                      ? "border-white/[0.04] bg-white/[0.01] text-white/30 cursor-wait"
                      : "border-[var(--sb-accent)]/40 bg-gradient-to-r from-[var(--sb-accent)] via-[#d48a34] to-[var(--sb-accent)] text-[#0c0c0e] hover:shadow-[0_4px_24px_var(--sb-accent-glow)] active:scale-[0.98] cursor-pointer"
                  )}
                >
                  {isLaunching ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting Exam...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 fill-current" />
                      Start Bookmark Exam ({selectedSubject ? `${selectedSubject} Only` : `${bookmarkCount} Questions`})
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Premium upsell sheet modal overlay */}
      <PremiumUpsellSheet
        open={upsellOpen}
        bookmarkCount={bookmarkCount}
        onUpgrade={() => router.push("/dashboard/settings")}
        onDismiss={() => setUpsellOpen(false)}
      />
    </>
  );
}
