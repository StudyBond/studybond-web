import { AnimatedCounter } from "@/components/ui/animated-counter";
import { cn } from "@/lib/utils/cn";

type StatTileVariant = "default" | "hero" | "compact";

type StatTileProps = {
  label: string;
  value: string;
  /** If provided, the value is animated as a number */
  numericValue?: number;
  icon?: React.ReactNode;
  tone?: "default" | "accent" | "streak" | "success" | "info" | "gold";
  subMetric?: string;
  subMetricTone?: "positive" | "neutral" | "negative";
  /** Capacity ring: 0–100 */
  capacity?: number;
  capacityLabel?: string;
  /** Layout variant: hero (full-width, large), compact (dense), default (standard) */
  variant?: StatTileVariant;
  /** Additional className override */
  className?: string;
};

const iconBgMap = {
  default: "bg-white/[0.05] text-white/40",
  accent: "bg-[var(--sb-accent)]/10 text-[var(--sb-accent)] shadow-[0_0_15px_var(--sb-accent-glow)]",
  streak: "bg-[var(--sb-streak)]/10 text-[var(--sb-streak)] shadow-[0_0_15px_var(--sb-streak-soft)]",
  success: "bg-emerald-400/10 text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.15)]",
  info: "bg-blue-400/10 text-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.15)]",
  gold: "bg-[var(--sb-gold)]/10 text-[var(--sb-gold)] shadow-[0_0_15px_var(--sb-gold-glow)]",
};

const borderMap = {
  default: "border-white/[0.04]",
  accent: "border-[var(--sb-accent)]/15",
  streak: "border-[var(--sb-streak)]/15",
  success: "border-emerald-400/15",
  info: "border-blue-400/15",
  gold: "border-[var(--sb-gold)]/15",
};

const glowMap = {
  default: "from-white/[0.01]",
  accent: "from-[var(--sb-accent)]/[0.03]",
  streak: "from-[var(--sb-streak)]/[0.03]",
  success: "from-emerald-400/[0.03]",
  info: "from-blue-400/[0.03]",
  gold: "from-[var(--sb-gold)]/[0.03]",
};

/* Stronger gradient backgrounds for hero variant */
const heroGradientMap = {
  default: "from-white/[0.02] via-transparent to-transparent",
  accent: "from-[var(--sb-accent)]/[0.06] via-[var(--sb-accent)]/[0.02] to-transparent",
  streak: "from-[var(--sb-streak)]/[0.06] via-[var(--sb-streak)]/[0.02] to-transparent",
  success: "from-emerald-400/[0.06] via-emerald-400/[0.02] to-transparent",
  info: "from-blue-400/[0.06] via-blue-400/[0.02] to-transparent",
  gold: "from-[var(--sb-gold)]/[0.06] via-[var(--sb-gold)]/[0.02] to-transparent",
};

const heroBorderMap = {
  default: "border-white/[0.06]",
  accent: "border-[var(--sb-accent)]/25",
  streak: "border-[var(--sb-streak)]/25",
  success: "border-emerald-400/25",
  info: "border-blue-400/25",
  gold: "border-[var(--sb-gold)]/25",
};

const subToneMap = {
  positive: "text-emerald-400",
  neutral: "text-white/40",
  negative: "text-red-400",
};

export function StatTile({
  label,
  value,
  numericValue,
  icon,
  tone = "default",
  subMetric,
  subMetricTone = "neutral",
  capacity,
  capacityLabel,
  variant = "default",
  className: extraClassName,
}: StatTileProps) {
  const isHero = variant === "hero";
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "sb-shimmer-sweep group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1",
        /* ─── Variant-specific sizing ─── */
        isHero
          ? "rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-[var(--sb-bg-surface-1)] to-[var(--sb-bg-surface-2)]"
          : isCompact
            ? "p-3.5 sm:p-4 bg-[var(--sb-bg-surface-1)] hover:bg-[var(--sb-bg-surface-2)]"
            : "p-5 bg-[var(--sb-bg-surface-1)] hover:bg-[var(--sb-bg-surface-2)]",
        /* ─── Border ─── */
        isHero ? heroBorderMap[tone] : borderMap[tone],
        extraClassName,
      )}
    >
      {/* Hero: ambient glow orb behind the tile */}
      {isHero ? (
        <div className="pointer-events-none absolute inset-0">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br opacity-80",
            heroGradientMap[tone],
          )} />
          {/* Floating ambient orb */}
          <div className={cn(
            "absolute -right-12 -top-12 h-40 w-40 rounded-full blur-[80px] opacity-60",
            tone === "accent" ? "bg-[var(--sb-accent)]/15" :
            tone === "gold" ? "bg-[var(--sb-gold)]/15" :
            tone === "streak" ? "bg-[var(--sb-streak)]/15" :
            tone === "success" ? "bg-emerald-400/15" :
            tone === "info" ? "bg-blue-400/15" :
            "bg-white/5",
          )} />
        </div>
      ) : null}

      {/* Hover glow — tone-colored */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100",
          glowMap[tone],
        )}
      />

      {/* Shimmer sweep on first render */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 -translate-x-full animate-[sb-shimmer-sweep_2s_ease-in-out_0.5s_1_forwards] bg-gradient-to-r from-transparent via-white/[0.03] to-transparent" />
      </div>

      <div className={cn(
        "relative z-10 flex items-start justify-between",
        isHero && "items-center",
      )}>
        <div className="min-w-0 flex-1">
          <p className={cn(
            "font-bold text-white/40 uppercase tracking-widest",
            isHero ? "text-[10px] sm:text-[11px] mb-2 sm:mb-3" :
            isCompact ? "text-[9px] mb-1.5" :
            "text-[10px] mb-2",
          )}>
            {label}
          </p>
          {numericValue !== undefined ? (
            <AnimatedCounter
              value={numericValue}
              className={cn(
                "font-mono font-bold text-white tracking-tight drop-shadow-sm",
                isHero ? "text-4xl sm:text-5xl" :
                isCompact ? "text-2xl" :
                "text-3xl",
              )}
              duration={isHero ? 1800 : 1400}
              easing="ease-out"
            />
          ) : (
            <p className={cn(
              "font-mono font-bold text-white tracking-tight drop-shadow-sm",
              isHero ? "text-4xl sm:text-5xl" :
              isCompact ? "text-2xl" :
              "text-3xl",
            )}>
              {value}
            </p>
          )}

          {subMetric ? (
            <p className={cn(
              "font-semibold",
              isHero ? "mt-2 sm:mt-3 text-[11px] sm:text-xs" :
              isCompact ? "mt-1 text-[10px]" :
              "mt-2 text-[11px]",
              subToneMap[subMetricTone],
            )}>
              {subMetric}
            </p>
          ) : null}
        </div>

        <div className={cn(
          "flex flex-col items-end shrink-0",
          isHero ? "gap-3" : "gap-2",
        )}>
          {icon ? (
            <div
              className={cn(
                "flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110",
                isHero ? "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl" :
                isCompact ? "h-8 w-8" :
                "h-10 w-10",
                iconBgMap[tone],
              )}
            >
              <div className={cn(
                isHero && "scale-125",
              )}>
                {icon}
              </div>
            </div>
          ) : null}

          {capacity !== undefined ? (
            <div className="relative flex items-center justify-center">
              <svg className={cn(
                "-rotate-90",
                isHero ? "h-12 w-12" :
                isCompact ? "h-8 w-8" :
                "h-10 w-10",
              )} viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="14" fill="none" stroke="currentColor"
                  strokeWidth="3" className="text-white/[0.04]"
                />
                <circle
                  cx="18" cy="18" r="14" fill="none" stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={88}
                  strokeDashoffset={88 - (88 * Math.min(capacity, 100)) / 100}
                  strokeLinecap="round"
                  className={cn(
                    "transition-all duration-1000 ease-out",
                    capacity > 80 ? "text-red-400" : capacity > 50 ? "text-[#e09040]" : "text-emerald-400",
                  )}
                />
              </svg>
              {capacityLabel ? (
                <span className="absolute text-[7px] font-bold text-white/50">{capacityLabel}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* Hero: bottom edge gradient line */}
      {isHero ? (
        <div className={cn(
          "absolute bottom-0 left-4 right-4 h-px",
          tone === "accent" ? "bg-gradient-to-r from-transparent via-[var(--sb-accent)]/20 to-transparent" :
          tone === "gold" ? "bg-gradient-to-r from-transparent via-[var(--sb-gold)]/20 to-transparent" :
          "bg-gradient-to-r from-transparent via-white/[0.06] to-transparent",
        )} />
      ) : null}
    </div>
  );
}
