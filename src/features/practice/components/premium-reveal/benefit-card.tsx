"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { benefitCardVariants } from "./premium-reveal-variants";
import type { LucideIcon } from "lucide-react";

export type BenefitItem = {
  readonly label: string;
  readonly icon: LucideIcon;
};

type BenefitCardProps = {
  readonly benefit: BenefitItem;
  readonly index: number;
};

export function BenefitCard({ benefit, index }: BenefitCardProps) {
  const { label, icon: Icon } = benefit;

  return (
    <motion.div
      variants={benefitCardVariants}
      className={cn(
        "group relative flex items-center gap-4 rounded-xl p-4",
        "bg-white/[0.03] border border-white/[0.06]",
        "hover:bg-white/[0.05] hover:border-white/[0.10]",
        "transition-colors duration-200",
      )}
      role="listitem"
      aria-label={label}
    >
      {/* Amber icon container — feels like a small unlock badge */}
      <div
        className={cn(
          "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          "bg-[var(--sb-accent-soft)] border border-[var(--sb-accent)]/15",
        )}
      >
        <Icon
          className="h-5 w-5 text-[var(--sb-accent-text)]"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        {/* Subtle glow behind the icon on hover */}
        <div
          className={cn(
            "absolute inset-0 rounded-lg opacity-0",
            "bg-[var(--sb-accent)]/10 blur-md",
            "transition-opacity duration-300",
            "group-hover:opacity-100",
          )}
          aria-hidden="true"
        />
      </div>

      {/* Benefit label */}
      <span className="text-sm font-medium leading-snug text-[var(--sb-text)] sm:text-[15px]">
        {label}
      </span>

      {/* Sequential unlock indicator — small amber dot that appears on stagger */}
      <motion.div
        className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sb-accent)]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 1.0 + index * 0.12 + 0.3,
          type: "spring",
          stiffness: 400,
          damping: 15,
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
}
