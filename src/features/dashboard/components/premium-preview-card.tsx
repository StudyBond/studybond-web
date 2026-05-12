import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  Flame,
  Trophy,
  BarChart3,
  Swords,
  Bookmark,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";
import type { Route } from "next";

const premiumFeatures = [
  {
    icon: <Flame className="h-5 w-5 text-orange-400" />,
    title: "Streak Heatmap",
    description: "Visual 30-day activity calendar with SP intensity tracking",
    previewGradient: "from-orange-500/20 to-orange-500/5",
  },
  {
    icon: <Trophy className="h-5 w-5 text-yellow-400" />,
    title: "Achievements",
    description: "Unlock badges, track progress, and earn rewards",
    previewGradient: "from-yellow-500/20 to-yellow-500/5",
  },
  {
    icon: <BarChart3 className="h-5 w-5 text-blue-400" />,
    title: "Advanced Analytics",
    description: "Score trends, subject breakdown, and performance insights",
    previewGradient: "from-blue-500/20 to-blue-500/5",
  },
  {
    icon: <Swords className="h-5 w-5 text-purple-400" />,
    title: "1v1 Duels",
    description: "Challenge friends in real-time exam battles",
    previewGradient: "from-purple-500/20 to-purple-500/5",
  },
  {
    icon: <Bookmark className="h-5 w-5 text-emerald-400" />,
    title: "50 Bookmarks",
    description: "Save more questions for focused revision",
    previewGradient: "from-emerald-500/20 to-emerald-500/5",
  },
];

/** A fake blurred heatmap grid to tease the premium feature */
function BlurredHeatmapPreview() {
  const cells = Array.from({ length: 35 }, (_, i) => {
    const intensity = [0, 0, 1, 2, 0, 3, 1, 0, 2, 4, 1, 0, 0, 3, 2, 1, 0, 4, 2, 0, 1, 3, 0, 2, 1, 0, 0, 2, 3, 1, 0, 4, 2, 1, 0][i] ?? 0;
    return intensity;
  });

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.04] bg-[var(--sb-bg-surface-1)] p-4">
      {/* Blurred heatmap grid */}
      <div className="flex flex-wrap gap-[3px] blur-[2px]">
        {cells.map((intensity, i) => (
          <div
            key={i}
            className={cn(
              "h-3 w-3 rounded-[2px]",
              `sb-heatmap-intensity-${intensity}`,
            )}
          />
        ))}
      </div>

      {/* Frosted overlay with lock */}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#09090b]/40 backdrop-blur-[3px]">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
            <Lock className="h-3.5 w-3.5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-yellow-400/70">
            Premium
          </span>
        </div>
      </div>
    </div>
  );
}

/** A fake blurred chart to tease analytics */
function BlurredChartPreview() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.04] bg-[var(--sb-bg-surface-1)] p-4 h-full">
      <svg viewBox="0 0 100 40" className="w-full h-16 blur-[2px]">
        <defs>
          <linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 35 L15 28 L30 32 L45 22 L60 26 L75 15 L90 18 L100 12 L100 40 L0 40 Z"
          fill="url(#previewGrad)"
        />
        <path
          d="M0 35 L15 28 L30 32 L45 22 L60 26 L75 15 L90 18 L100 12"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Frosted overlay */}
      <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-[#09090b]/40 backdrop-blur-[3px]">
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400/10 text-blue-400">
            <Lock className="h-3.5 w-3.5" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-blue-400/70">
            Premium
          </span>
        </div>
      </div>
    </div>
  );
}

export function PremiumPreviewCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-yellow-400/10 bg-gradient-to-br from-[#14120d] via-[#09090b] to-[#0d0b14]">
      {/* Animated gradient border sweep */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 via-orange-400/5 to-purple-400/10 opacity-30" />
        <div className="absolute inset-0 sb-shimmer-gold" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400 shadow-[0_0_16px_rgba(251,191,36,0.15)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-bold sb-gradient-text-gold">
              See What You&apos;re Missing
            </span>
            <p className="text-[10px] text-white/25">Upgrade to unlock everything below</p>
          </div>
        </div>

        {/* Blurred Feature Previews — "peek behind the curtain" */}
        <div className="grid gap-3 sm:grid-cols-2 mb-6">
          <BlurredHeatmapPreview />
          <BlurredChartPreview />
        </div>

        {/* Feature Grid */}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {premiumFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group flex items-start gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 transition-all duration-200 hover:bg-white/[0.04] hover:-translate-y-0.5"
            >
              <div className="shrink-0 mt-0.5">{feature.icon}</div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white/70">{feature.title}</p>
                <p className="text-[10px] text-white/25 leading-relaxed mt-0.5">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            asChild
            href={"https://wa.link/cmo8uj" as any}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-[#e09040] border-t border-yellow-400/40 shadow-[0_0_24px_rgba(251,191,36,0.2)] rounded-xl"
          >
            <div className="flex items-center justify-center px-4 font-bold text-[#09090b]">
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Unlock Premium — ₦5,000</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Button>
          <div className="flex items-center justify-center sm:justify-start">
            <span className="text-[11px] text-white/25">5 months of full access</span>
          </div>
        </div>
      </div>

      {/* Decorative orbs */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-yellow-400/[0.06] blur-[60px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-purple-400/[0.04] blur-[80px]" />
    </div>
  );
}
