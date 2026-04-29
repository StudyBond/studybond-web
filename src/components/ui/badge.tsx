import { cn } from "@/lib/utils/cn";

const toneStyles = {
  accent:
    "bg-[#e09040]/10 text-[#f5c890] border-[#e09040]/15",
  neutral:
    "bg-white/[0.05] text-white/50 border-white/[0.08]",
  danger:
    "bg-red-400/10 text-red-400 border-red-400/15",
  success:
    "bg-emerald-400/10 text-emerald-400 border-emerald-400/15",
  info:
    "bg-blue-400/10 text-blue-400 border-blue-400/15",
  streak:
    "bg-orange-400/10 text-orange-400 border-orange-400/15",
};

export function Badge({
  children,
  tone = "neutral",
  dot = false,
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof toneStyles;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneStyles[tone],
        className,
      )}
    >
      {dot ? (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      ) : null}
      {children}
    </span>
  );
}
