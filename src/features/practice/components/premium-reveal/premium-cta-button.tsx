"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { ctaContainerVariants, dismissVariants } from "./premium-reveal-variants";
import { Crown } from "lucide-react";

type PremiumCTAButtonProps = {
  readonly onUpgrade: () => void;
  readonly onDismiss: () => void;
};

export function PremiumCTAButton({ onUpgrade, onDismiss }: PremiumCTAButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Primary CTA */}
      <motion.button
        variants={ctaContainerVariants}
        onClick={onUpgrade}
        className={cn(
          "sb-shimmer-sweep relative inline-flex items-center justify-center gap-2.5",
          "h-13 w-full max-w-sm rounded-xl px-8",
          "bg-[var(--sb-accent)] text-[#0a0a0a] font-semibold text-base",
          "shadow-[0_4px_24px_rgba(193,122,40,0.25)]",
          "hover:shadow-[0_6px_32px_rgba(193,122,40,0.35)]",
          "hover:brightness-110",
          "active:scale-[0.98]",
          "transition-all duration-200 ease-out",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent)]",
          "cursor-pointer select-none overflow-hidden",
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label="Unlock StudyBond Premium"
      >
        <Crown className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
        <span>Unlock StudyBond Premium</span>

        {/* Persistent breathing glow ring — runs forever, very subtle */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-xl"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(193, 122, 40, 0.3)",
              "0 0 0 6px rgba(193, 122, 40, 0)",
              "0 0 0 0 rgba(193, 122, 40, 0.3)",
            ],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      </motion.button>

      {/* Secondary dismiss — small, muted, no guilt */}
      <motion.button
        variants={dismissVariants}
        onClick={onDismiss}
        className={cn(
          "text-sm text-[var(--sb-text-tertiary)]",
          "hover:text-[var(--sb-text-secondary)]",
          "transition-colors duration-200",
          "cursor-pointer select-none",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sb-accent)]",
          "rounded-lg px-4 py-2",
        )}
        aria-label="Dismiss premium offer"
      >
        Maybe later
      </motion.button>
    </div>
  );
}
