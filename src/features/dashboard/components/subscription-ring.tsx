import type { SubscriptionStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

type SubscriptionRingProps = {
  subscription: SubscriptionStatus;
  variant?: "full" | "compact";
};

export function SubscriptionRing({ subscription, variant = "full" }: SubscriptionRingProps) {
  const sub = subscription.currentSubscription;

  if (!sub) return null;

  const totalDays = subscription.durationMonths * 30;
  const remaining = sub.daysRemaining;
  const progress = Math.max(0, Math.min(100, (remaining / totalDays) * 100));

  // Color shifts: green > 30 days, amber 10-30, red < 10
  const ringColor =
    remaining > 30
      ? "text-emerald-400"
      : remaining > 10
        ? "text-[#e09040]"
        : "text-red-400";

  const glowColor =
    remaining > 30
      ? "rgba(52,211,153,0.3)"
      : remaining > 10
        ? "rgba(224,144,64,0.3)"
        : "rgba(248,113,113,0.3)";

  const circumference = 2 * Math.PI * 46;
  const offset = circumference - (circumference * progress) / 100;

  if (variant === "compact") {
    const compactCircumference = 2 * Math.PI * 14;
    const compactOffset = compactCircumference - (compactCircumference * progress) / 100;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/[0.04]" />
          <circle
            cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={compactCircumference}
            strokeDashoffset={compactOffset}
            strokeLinecap="round"
            className={cn("sb-ring-animate transition-colors duration-500", ringColor)}
            style={{ "--ring-circumference": compactCircumference, "--ring-offset": compactOffset } as React.CSSProperties}
          />
        </svg>
        <span className="absolute text-[8px] font-bold text-white/70 font-mono">{remaining}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        {/* Glow ring */}
        <svg className="absolute h-32 w-32 -rotate-90" viewBox="0 0 112 112">
          <circle
            cx="56" cy="56" r="46" fill="none" stroke={glowColor}
            strokeWidth="12" opacity="0.3"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="blur-sm"
          />
        </svg>

        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="46" fill="none" stroke="currentColor" strokeWidth="6" className="text-white/[0.04]" />
          <circle
            cx="56" cy="56" r="46" fill="none" stroke="currentColor"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn("sb-ring-animate transition-colors duration-500", ringColor)}
            style={{ "--ring-circumference": circumference, "--ring-offset": offset } as React.CSSProperties}
          />
        </svg>

        <div className="absolute flex flex-col items-center">
          <span className={cn("font-mono text-3xl font-bold tracking-tighter drop-shadow-lg", ringColor)}>
            {remaining}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">
            days left
          </span>
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-white/70">{sub.planType}</p>
        <p className="text-[10px] text-white/30 mt-0.5">
          {sub.autoRenew ? "Auto-renews" : "Expires"} {new Date(sub.endDate).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
        </p>
      </div>
    </div>
  );
}
