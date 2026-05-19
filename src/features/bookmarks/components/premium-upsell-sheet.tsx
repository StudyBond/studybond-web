"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, X, BookOpen, Zap, Shield, TrendingUp } from "lucide-react";

type PremiumUpsellSheetProps = {
  open: boolean;
  bookmarkCount: number;
  onUpgrade: () => void;
  onDismiss: () => void;
};

const UPSELL_DISMISS_KEY = "bookmark_exam_upsell_dismissed_at";
const DISMISS_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

function shouldShowUpsell(): boolean {
  if (typeof window === "undefined") return true;
  const dismissed = localStorage.getItem(UPSELL_DISMISS_KEY);
  if (!dismissed) return true;
  return Date.now() - Number(dismissed) > DISMISS_COOLDOWN_MS;
}

function recordDismissal(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(UPSELL_DISMISS_KEY, String(Date.now()));
}

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Bookmark Exam",
    description: "Turn saved questions into a full timed exam",
  },
  {
    icon: Zap,
    title: "Unlimited Practice",
    description: "Access all subjects and question types",
  },
  {
    icon: Shield,
    title: "50 Bookmark Slots",
    description: "Save 5× more questions for focused review",
  },
  {
    icon: TrendingUp,
    title: "Performance Analytics",
    description: "Track your growth with detailed insights",
  },
];

export function PremiumUpsellSheet({
  open,
  bookmarkCount,
  onUpgrade,
  onDismiss,
}: PremiumUpsellSheetProps) {
  const handleDismiss = useCallback(() => {
    recordDismissal();
    onDismiss();
  }, [onDismiss]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleDismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleDismiss]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Sheet — slides up on mobile, scales in on desktop */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Premium upgrade"
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl border-t border-white/[0.06] bg-[#111114] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-md md:rounded-2xl md:border"
          >
            {/* Drag indicator (mobile) */}
            <div className="flex justify-center pt-3 md:hidden">
              <div className="h-1 w-10 rounded-full bg-white/[0.08]" />
            </div>

            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6 pt-5 md:p-8 space-y-6">
              {/* Crown icon */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ scale: 0.6, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, delay: 0.15 }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--sb-accent)] to-[#d07830] shadow-[0_0_40px_var(--sb-accent-glow)]"
                >
                  <Crown className="h-8 w-8 text-[#0c0c0e]" />
                </motion.div>
              </div>

              {/* Copy */}
              <div className="text-center space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl font-black text-white tracking-tight"
                >
                  Unlock Bookmark Exam
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm text-white/35 leading-relaxed max-w-xs mx-auto"
                >
                  You&apos;ve bookmarked <span className="text-[var(--sb-accent)] font-semibold">{bookmarkCount}</span> question{bookmarkCount !== 1 ? "s" : ""}. That&apos;s real study discipline. Premium unlocks the ability to turn those into a full exam.
                </motion.p>
              </div>

              {/* Benefits */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-2.5"
              >
                {BENEFITS.map((b, i) => (
                  <div
                    key={b.title}
                    className="flex items-center gap-3 rounded-xl bg-white/[0.02] border border-white/[0.03] px-4 py-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--sb-accent)]/[0.08] text-[var(--sb-accent)]">
                      <b.icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white/70">{b.title}</p>
                      <p className="text-[10px] text-white/25">{b.description}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="space-y-3 pt-2"
              >
                <button
                  onClick={onUpgrade}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--sb-accent)] to-[#d07830] text-[#0c0c0e] hover:shadow-[0_0_24px_var(--sb-accent-glow)] transition-all duration-200"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Premium
                </button>
                <button
                  onClick={handleDismiss}
                  className="w-full py-2.5 text-xs font-semibold text-white/20 hover:text-white/40 transition-colors"
                >
                  Not now
                </button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
