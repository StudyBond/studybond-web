"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  Layers,
  BookOpen,
  Trophy,
  Sparkles,
  LineChart,
  Infinity,
  WifiOff,
  Users,
} from "lucide-react";

import {
  bridgeLineVariants,
  bridgeGlowVariants,
  headlineContainerVariants,
  headlineWordVariants,
  subCopyVariants,
  benefitsContainerVariants,
  socialProofVariants,
  overlayBackdropVariants,
  overlayPanelVariants,
} from "./premium-reveal-variants";
import { BenefitCard } from "./benefit-card";
import type { BenefitItem } from "./benefit-card";
import { PremiumCTAButton } from "./premium-cta-button";

// ─── Constants ───

const PREMIUM_BENEFITS: readonly BenefitItem[] = [
  { label: "Unlimited Past Questions — All Years", icon: Layers },
  { label: "Full Subject Coverage — Physics, Chem, Bio, English, Maths", icon: BookOpen },
  { label: "Competitive Duels — Challenge other candidates live", icon: Trophy },
  { label: "AI Tutor Explanations — Deep explanations for every question", icon: Sparkles },
  { label: "Performance Analytics & Score Projector", icon: LineChart },
  { label: "Unlimited Daily Challenges — Not just 1 per day", icon: Infinity },
  { label: "Offline Mode — Study without internet", icon: WifiOff },
] as const;

const SOCIAL_PROOF_COUNT = 4_200;

// ─── Headline personalization ───

function buildHeadline(userData: PremiumRevealUserData): string {
  if (userData.streak >= 3) {
    return `${userData.name}, you're on a ${userData.streak}-day streak. Don't stop now.`;
  }
  if (userData.score >= 8) {
    return "You're just getting started.";
  }
  return "Today's challenge was the warmup. Premium is the full workout.";
}

const SUB_COPY =
  "Free plan gives you a taste. Premium gives you everything you need to walk into that exam hall and own it.";

// ─── Types ───

export type PremiumRevealUserData = {
  readonly name: string;
  readonly score: number;
  readonly streak: number;
};

type DailyChallengePremiumRevealProps = {
  readonly variant: "page" | "overlay";
  readonly userData: PremiumRevealUserData;
  readonly onUpgrade: () => void;
  readonly onDismiss: () => void;
};

// ─── Animated Counter ───

function AnimatedSocialCount({ target }: { readonly target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const startDelay = 2_200;
    const duration = 800;
    const steps = 30;
    const interval = duration / steps;
    let step = 0;
    let timerId: ReturnType<typeof setInterval> | null = null;

    const timeout = setTimeout(() => {
      timerId = setInterval(() => {
        step++;
        const progress = step / steps;
        // Ease-out quad for natural deceleration
        const eased = 1 - (1 - progress) * (1 - progress);
        setCount(Math.round(eased * target));
        if (step >= steps && timerId) clearInterval(timerId);
      }, interval);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      if (timerId) clearInterval(timerId);
    };
  }, [target]);

  return (
    <span className="sb-mono tabular-nums font-semibold text-[var(--sb-accent-text)]">
      {count.toLocaleString()}+
    </span>
  );
}

// ─── Split headline into motion words ───

function AnimatedHeadline({ text }: { readonly text: string }) {
  const words = text.split(" ");

  return (
    <motion.h2
      variants={headlineContainerVariants}
      className={cn(
        "sb-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl",
        "text-[var(--sb-text)]",
      )}
    >
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            variants={headlineWordVariants}
            className="inline-block"
            style={{ marginRight: "0.3em" }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.h2>
  );
}

// ─── Focus Trap Hook — for overlay accessibility ───

function useFocusTrap(active: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableSelectors = [
      "button",
      "[href]",
      "input",
      "select",
      "textarea",
      "[tabindex]:not([tabindex='-1'])",
    ].join(", ");

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab" || !container) return;

      const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (!firstFocusable || !lastFocusable) return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }

    // Focus the first focusable element on mount
    const focusableElements = container.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableElements.length > 0) {
      // Small delay to ensure DOM is ready after animations start
      requestAnimationFrame(() => focusableElements[0]?.focus());
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active]);

  return containerRef;
}

// ─── Inner Content (shared between page and overlay variants) ───

function PremiumRevealContent({
  userData,
  onUpgrade,
  onDismiss,
  isOverlay,
}: {
  readonly userData: PremiumRevealUserData;
  readonly onUpgrade: () => void;
  readonly onDismiss: () => void;
  readonly isOverlay: boolean;
}) {
  const headline = buildHeadline(userData);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className={cn(
        "relative flex flex-col items-center",
        isOverlay ? "px-5 pb-8 pt-6 sm:px-8 sm:pt-8" : "px-5 py-10 sm:px-8 sm:py-16",
      )}
    >
      {/* ── Beat 1: The Bridge ── */}
      <div className="relative mb-8 flex w-full items-center justify-center sm:mb-10">
        {/* Expanding amber line */}
        <motion.div
          variants={bridgeLineVariants}
          className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-[var(--sb-accent)] to-transparent"
          style={{ originX: 0.5 }}
          aria-hidden="true"
        />
        {/* Soft glow bloom behind the line */}
        <motion.div
          variants={bridgeGlowVariants}
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
            "h-16 w-48 rounded-full",
            "bg-[var(--sb-accent)] opacity-0 blur-2xl",
          )}
          aria-hidden="true"
        />
      </div>

      {/* ── Beat 2: The Headline ── */}
      <div className="mb-3 text-center">
        <AnimatedHeadline text={headline} />
      </div>
      <motion.p
        variants={subCopyVariants}
        className={cn(
          "mb-8 max-w-md text-center text-sm leading-relaxed sm:mb-10 sm:text-base",
          "text-[var(--sb-text-secondary)]",
        )}
      >
        {SUB_COPY}
      </motion.p>

      {/* ── Beat 3: The Benefits Cascade ── */}
      <motion.div
        variants={benefitsContainerVariants}
        className={cn(
          "mb-8 w-full max-w-lg sm:mb-10",
          "grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3",
        )}
        role="list"
        aria-label="Premium benefits"
      >
        {PREMIUM_BENEFITS.map((benefit, i) => (
          <BenefitCard key={benefit.label} benefit={benefit} index={i} />
        ))}
      </motion.div>

      {/* ── Beat 4: Social Proof Pulse ── */}
      <motion.div
        variants={socialProofVariants}
        className={cn(
          "relative mb-8 flex items-center justify-center gap-2.5 sm:mb-10",
          "rounded-full bg-white/[0.03] border border-white/[0.06]",
          "px-5 py-2.5",
        )}
      >
        {/* Subtle pulse glow ring behind social proof */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(193, 122, 40, 0.15)",
              "0 0 0 4px rgba(193, 122, 40, 0)",
              "0 0 0 0 rgba(193, 122, 40, 0.15)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2.8,
          }}
          aria-hidden="true"
        />
        <Users
          className="h-4 w-4 text-[var(--sb-accent-text)]"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <span className="text-sm text-[var(--sb-text-secondary)]">
          Join <AnimatedSocialCount target={SOCIAL_PROOF_COUNT} /> students already
          practicing smarter
        </span>
      </motion.div>

      {/* ── Beat 5: CTA Lock-In ── */}
      <div className={cn("w-full max-w-sm", isOverlay && "sticky bottom-0 pb-2 sm:static sm:pb-0")}>
        <PremiumCTAButton onUpgrade={onUpgrade} onDismiss={onDismiss} />
      </div>
    </motion.div>
  );
}

// ─── Main Component ───

export function DailyChallengePremiumReveal({
  variant,
  userData,
  onUpgrade,
  onDismiss,
}: DailyChallengePremiumRevealProps) {
  const focusTrapRef = useFocusTrap(variant === "overlay");

  // Escape key to dismiss — overlay only
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && variant === "overlay") {
        onDismiss();
      }
    },
    [variant, onDismiss],
  );

  // ── Page variant: inline section ──
  if (variant === "page") {
    return (
      <section
        className={cn(
          "relative mx-auto w-full max-w-2xl overflow-hidden",
          "rounded-2xl border border-white/[0.06]",
          "bg-[var(--sb-bg-elevated)]",
        )}
        aria-label="StudyBond Premium offer"
      >
        {/* Ambient mesh gradient background */}
        <div className="sb-mesh-gradient-gold sb-mesh-gradient pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true" />
        {/* Noise texture for tactile depth */}
        <div className="sb-noise pointer-events-none absolute inset-0 rounded-2xl" aria-hidden="true" />

        <div className="relative z-10">
          <PremiumRevealContent
            userData={userData}
            onUpgrade={onUpgrade}
            onDismiss={onDismiss}
            isOverlay={false}
          />
        </div>
      </section>
    );
  }

  // ── Overlay variant: full-screen drawer from bottom ──
  return (
    <AnimatePresence>
      <motion.div
        key="premium-overlay-backdrop"
        variants={overlayBackdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={cn(
          "fixed inset-0 z-50",
          "bg-black/60 backdrop-blur-sm",
        )}
        onClick={onDismiss}
        onKeyDown={handleKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label="StudyBond Premium offer"
        tabIndex={-1}
      >
        <motion.div
          ref={focusTrapRef}
          key="premium-overlay-panel"
          variants={overlayPanelVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto",
            "rounded-t-2xl border-t border-white/[0.08]",
            "bg-[var(--sb-bg-elevated)]",
            "sm:left-auto sm:right-4 sm:bottom-4 sm:max-w-lg sm:rounded-2xl sm:border",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle — mobile affordance */}
          <div className="flex justify-center pt-3 sm:hidden" aria-hidden="true">
            <div className="h-1 w-10 rounded-full bg-white/[0.15]" />
          </div>

          {/* Ambient mesh gradient */}
          <div className="sb-mesh-gradient-gold sb-mesh-gradient pointer-events-none absolute inset-0 rounded-t-2xl sm:rounded-2xl" aria-hidden="true" />
          <div className="sb-noise pointer-events-none absolute inset-0 rounded-t-2xl sm:rounded-2xl" aria-hidden="true" />

          <div className="relative z-10">
            <PremiumRevealContent
              userData={userData}
              onUpgrade={onUpgrade}
              onDismiss={onDismiss}
              isOverlay={true}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
