"use client";

import { motion } from "framer-motion";
import { Bookmark, BookOpen, Zap, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

export function BookmarkEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center py-20 px-6 text-center overflow-hidden"
    >
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/3 h-48 w-48 rounded-full bg-[var(--sb-accent)]/[0.03] blur-[80px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/3 h-36 w-36 rounded-full bg-purple-500/[0.02] blur-[60px]" />

      {/* Icon composition */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="relative mb-8"
      >
        <div className="relative">
          {/* Main icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--sb-accent)]/[0.08] to-[var(--sb-accent)]/[0.03] border border-[var(--sb-accent)]/[0.08]">
            <Bookmark className="h-9 w-9 text-[var(--sb-accent)]/30" />
          </div>

          {/* Orbiting sparkle */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="h-4 w-4 text-[var(--sb-accent)]/20" />
          </motion.div>
        </div>

        {/* Subtle glow */}
        <div className="absolute inset-0 -m-4 rounded-[2rem] bg-[var(--sb-accent)]/[0.03] blur-2xl" />
      </motion.div>

      {/* Copy */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="space-y-3 mb-8"
      >
        <h3 className="text-lg font-bold text-white/70 tracking-tight">
          Your Vault is Empty
        </h3>
        <p className="text-sm text-white/20 max-w-sm leading-relaxed mx-auto">
          When you encounter questions worth revisiting — ones that challenge you, 
          ones that teach you something new — bookmark them. They&apos;ll appear here.
        </p>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
        className="space-y-4"
      >
        <Link
          href={"/dashboard/practice" as Route}
          className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold text-[#0c0c0e] bg-gradient-to-r from-[var(--sb-accent)] to-[#c06830] shadow-[0_4px_24px_var(--sb-accent-glow)] hover:shadow-[0_8px_40px_var(--sb-accent-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <Zap className="h-4 w-4 fill-current" />
          Take a Practice Exam
          <ArrowRight className="h-3.5 w-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </motion.div>

      {/* Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex items-center gap-2.5 mt-10 px-4 py-3 rounded-xl bg-white/[0.015] border border-white/[0.03]"
      >
        <BookOpen className="h-3.5 w-3.5 text-white/12 shrink-0" />
        <p className="text-[11px] text-white/15 leading-relaxed">
          Look for the{" "}
          <Bookmark className="inline h-3 w-3 text-[var(--sb-accent)]/25 -mt-0.5" />{" "}
          icon when reviewing your exam results
        </p>
      </motion.div>
    </motion.div>
  );
}
