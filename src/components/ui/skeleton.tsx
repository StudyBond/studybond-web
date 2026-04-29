import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "sb-shimmer rounded-2xl border border-white/[0.06]",
        className,
      )}
    />
  );
}
