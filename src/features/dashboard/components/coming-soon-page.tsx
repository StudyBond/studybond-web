"use client";

import { Button } from "@/components/ui/button";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import type { Route } from "next";

export function ComingSoonPage({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: Route;
  primaryLabel: string;
}) {
  return (
    <LearnerShell>
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#09090b] p-8 shadow-2xl shadow-[#e09040]/10">
        <div className="pointer-events-none absolute -left-8 top-0 h-48 w-48 rounded-full bg-[#e09040]/10 blur-[90px]" />
        <div className="pointer-events-none absolute -right-12 bottom-0 h-56 w-56 rounded-full bg-emerald-500/[0.06] blur-[110px]" />

        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#e09040]">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">
            {title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/55 md:text-base">
            {description}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild href={primaryHref} size="lg">
              {primaryLabel}
            </Button>
            <Button asChild href="/dashboard" size="lg" variant="secondary">
              Back to dashboard
            </Button>
          </div>
        </div>
      </section>
    </LearnerShell>
  );
}
