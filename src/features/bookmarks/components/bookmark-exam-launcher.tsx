"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Crown, Lock, BookOpen, Zap, Loader2, ArrowRight, Target } from "lucide-react";
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

  const remaining = BOOKMARK_EXAM_MIN_QUESTIONS - bookmarkCount;

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border transition-all duration-500",
          gate.status === "UNLOCKED"
            ? "border-[var(--sb-accent)]/[0.12] bg-gradient-to-br from-[var(--sb-accent)]/[0.04] to-transparent"
            : gate.status === "LOCKED_PREMIUM"
              ? "border-[var(--sb-gold)]/[0.08] bg-gradient-to-br from-[var(--sb-gold)]/[0.02] to-transparent"
              : "border-white/[0.05] bg-white/[0.012]",
        )}
      >
        {/* Ambient glow for unlocked */}
        {gate.status === "UNLOCKED" && (
          <div className="pointer-events-none absolute -top-20 left-1/3 h-40 w-60 rounded-full bg-[var(--sb-accent)]/[0.06] blur-[80px]" />
        )}

        {/* Premium shimmer overlay */}
        {gate.status === "LOCKED_PREMIUM" && (
          <div className="pointer-events-none absolute -top-16 right-1/4 h-32 w-48 rounded-full bg-[var(--sb-gold)]/[0.04] blur-[60px]" />
        )}

        <div className="relative p-5 sm:p-6 space-y-4">
          {/* ──── Header ──── */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all",
                  gate.status === "UNLOCKED"
                    ? "bg-[var(--sb-accent)]/[0.12] text-[var(--sb-accent)] shadow-[0_0_16px_var(--sb-accent-glow)]"
                    : gate.status === "LOCKED_PREMIUM"
                      ? "bg-[var(--sb-gold)]/[0.08] text-[var(--sb-gold)]"
                      : "bg-white/[0.04] text-white/20",
                )}
              >
                {gate.status === "UNLOCKED" ? (
                  <Target className="h-5 w-5" />
                ) : gate.status === "LOCKED_PREMIUM" ? (
                  <Crown className="h-5 w-5" />
                ) : (
                  <BookOpen className="h-5 w-5" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white/85 tracking-tight flex items-center gap-2">
                  Bookmark Exam
                  {gate.status === "LOCKED_PREMIUM" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider bg-[var(--sb-gold)]/[0.08] text-[var(--sb-gold)] border border-[var(--sb-gold)]/10">
                      <Crown className="h-2 w-2" />
                      Premium
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-white/25 leading-snug mt-0.5">
                  {gate.status === "UNLOCKED"
                    ? "Turn your saved questions into a live exam"
                    : gate.status === "LOCKED_PREMIUM"
                      ? "A premium feature — test yourself on your weak spots"
                      : `Bookmark ${remaining} more to unlock this feature`}
                </p>
              </div>
            </div>

            {/* Count badge for insufficient */}
            {gate.status === "LOCKED_INSUFFICIENT" && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <span className="text-xs font-bold text-white/40">
                  {bookmarkCount}
                </span>
                <span className="text-[10px] text-white/15">
                  / {BOOKMARK_EXAM_MIN_QUESTIONS}
                </span>
              </div>
            )}
          </div>

          {/* ──── Progress bar for insufficient ──── */}
          {gate.status === "LOCKED_INSUFFICIENT" && (
            <div className="space-y-2">
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--sb-accent)]/50 to-[var(--sb-accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                />
              </div>
              <p className="text-[11px] text-white/20">
                <span className="text-[var(--sb-accent)] font-semibold">{remaining}</span>
                {" "}more question{remaining !== 1 ? "s" : ""} needed
              </p>
            </div>
          )}

          {/* ──── Subject chips for unlocked ──── */}
          <AnimatePresence>
            {gate.status === "UNLOCKED" && availableSubjects.length > 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1.5"
              >
                <button
                  onClick={() => setSelectedSubject(undefined)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all duration-200 border",
                    !selectedSubject
                      ? "bg-[var(--sb-accent)]/[0.12] text-[var(--sb-accent)] border-[var(--sb-accent)]/15 shadow-[0_0_10px_var(--sb-accent-glow)]"
                      : "bg-white/[0.02] text-white/25 border-white/[0.03] hover:bg-white/[0.05] hover:text-white/40",
                  )}
                  aria-label="All subjects"
                >
                  All ({bookmarkCount})
                </button>
                {availableSubjects.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSubject(s === selectedSubject ? undefined : s)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-semibold tracking-wide transition-all duration-200 border",
                      selectedSubject === s
                        ? "bg-[var(--sb-accent)]/[0.12] text-[var(--sb-accent)] border-[var(--sb-accent)]/15 shadow-[0_0_10px_var(--sb-accent-glow)]"
                        : "bg-white/[0.02] text-white/25 border-white/[0.03] hover:bg-white/[0.05] hover:text-white/40",
                    )}
                    aria-label={`Filter to ${s}`}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──── Error ──── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-[11px] text-red-400/80 bg-red-400/[0.04] rounded-lg px-3 py-2 border border-red-400/10"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ──── CTA ──── */}
          {gate.status === "LOCKED_PREMIUM" && (
            <button
              onClick={() => setUpsellOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 bg-gradient-to-r from-[var(--sb-gold)]/[0.08] to-[var(--sb-accent)]/[0.06] text-[var(--sb-gold)] border border-[var(--sb-gold)]/[0.12] hover:from-[var(--sb-gold)]/[0.14] hover:to-[var(--sb-accent)]/[0.10] hover:shadow-[0_0_24px_var(--sb-gold-glow)] group"
              aria-label="Unlock bookmark exam with Premium"
            >
              <Crown className="h-4 w-4" />
              <span>Unlock with Premium</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
            </button>
          )}

          {gate.status === "LOCKED_INSUFFICIENT" && (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-white/12 bg-white/[0.015] border border-white/[0.03] cursor-not-allowed"
              aria-label="Need more bookmarks to unlock"
            >
              <Lock className="h-4 w-4" />
              Need {BOOKMARK_EXAM_MIN_QUESTIONS} Bookmarks
            </button>
          )}

          {gate.status === "UNLOCKED" && (
            <motion.button
              onClick={handleLaunch}
              disabled={isLaunching}
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "w-full flex items-center justify-center gap-2.5 px-4 py-4 rounded-xl text-sm font-bold transition-all duration-300 group",
                isLaunching
                  ? "bg-[var(--sb-accent)]/[0.12] text-[var(--sb-accent)]/50 cursor-wait"
                  : "bg-gradient-to-r from-[var(--sb-accent)] via-[var(--sb-accent)] to-[#c06830] text-[#0c0c0e] hover:shadow-[0_4px_32px_var(--sb-accent-glow)] active:shadow-[0_2px_16px_var(--sb-accent-glow)]",
              )}
              aria-label="Start bookmark exam"
            >
              {isLaunching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Preparing your exam…</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 fill-current" />
                  <span>
                    Start Exam
                    {selectedSubject
                      ? ` · ${selectedSubject}`
                      : ` · ${bookmarkCount} Questions`}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </motion.button>
          )}
        </div>
      </div>

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
