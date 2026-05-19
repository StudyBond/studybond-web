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

const BENEFITS = [
  {
    icon: BookOpen,
    title: "Bookmark Exam Engine",
    description: "Convert your bookmarked questions into a timed simulation session.",
  },
  {
    icon: Zap,
    title: "Unlimited Question Bank",
    description: "Unlock full testing across all major subjects with no daily caps.",
  },
  {
    icon: Shield,
    title: "Extended Vault Slots",
    description: "Store up to 50 active bookmarks for focused revision.",
  },
  {
    icon: TrendingUp,
    title: "Elite Performance Insights",
    description: "Trace weakness trends and predict UTME scores in real-time.",
  },
];

export function PremiumUpsellSheet({
  open,
  bookmarkCount,
  onUpgrade,
  onDismiss,
}: PremiumUpsellSheetProps) {
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

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onDismiss]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onDismiss}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Elite Premium Upgrade"
            initial={{ y: "100%", opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-white/[0.08] bg-[#0c0c0e] sb-noise shadow-[0_-16px_48px_rgba(0,0,0,0.8)] md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:rounded-2xl md:border"
          >
            {/* Gold Mesh Gradient Accent */}
            <div className="absolute inset-0 sb-mesh-gradient-gold opacity-[0.05] pointer-events-none" />

            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 md:hidden">
              <div className="h-1.5 w-12 rounded-full bg-white/[0.06]" />
            </div>

            {/* Close Button */}
            <button
              onClick={onDismiss}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.03] text-white/30 hover:bg-white/[0.08] hover:text-white transition-all duration-200"
              title="Close panel"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative p-6 pt-5 md:p-8 space-y-6">
              {/* Crown Emblem */}
              <div className="flex justify-center pt-2">
                <motion.div
                  initial={{ scale: 0.5, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 14, delay: 0.1 }}
                  className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--sb-gold)] via-[#c17a28] to-[#8b4f1a] shadow-[0_0_30px_rgba(212,161,33,0.25)] border border-[var(--sb-gold)]/20"
                >
                  {/* Decorative rotating ring around crown */}
                  <div className="absolute -inset-1 rounded-2xl border border-[var(--sb-gold)]/10 animate-[sb-spin_20s_linear_infinite]" />
                  <Crown className="h-7 w-7 text-white" />
                </motion.div>
              </div>

              {/* Title & Copy */}
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  Unlock the Bookmark Exam
                </h2>
                <p className="text-xs text-white/35 leading-relaxed max-w-sm mx-auto">
                  You have saved <span className="text-[var(--sb-accent-text)] font-bold">{bookmarkCount} questions</span>. Redefine your study sessions by turning your weaknesses list into custom mock tests.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                {BENEFITS.map((benefit, idx) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                    className="flex items-start gap-3 rounded-xl border border-white/[0.03] bg-white/[0.01] p-3 transition-all duration-300 hover:border-white/[0.06] hover:bg-white/[0.02]"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--sb-gold)]/10 text-[var(--sb-gold)] border border-[var(--sb-gold)]/10">
                      <benefit.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-xs font-semibold text-white/80">{benefit.title}</p>
                      <p className="text-[10px] text-white/25 leading-relaxed">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={onUpgrade}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-[var(--sb-gold)] via-[#c17a28] to-[#8b4f1a] text-white shadow-[0_4px_24px_rgba(212,161,33,0.18)] hover:shadow-[0_4px_30px_rgba(212,161,33,0.25)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-300 border border-[var(--sb-gold)]/30"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade to Elite Membership
                </button>
                <button
                  onClick={onDismiss}
                  className="w-full py-2.5 text-[11px] font-bold text-white/20 hover:text-white/40 transition-colors"
                >
                  Dismiss Focus Room
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

