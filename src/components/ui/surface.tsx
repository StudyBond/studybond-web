import { cn } from "@/lib/utils/cn";

type SurfaceProps = React.HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "accent" | "warm" | "danger";
  interactive?: boolean;
};

const toneStyles = {
  default: "border-white/[0.06]",
  accent: "border-[#e09040]/12",
  warm: "border-orange-400/12",
  danger: "border-red-400/12",
};

export function Surface({
  className,
  tone = "default",
  interactive = false,
  ...props
}: SurfaceProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white/[0.03] transition-all duration-200",
        toneStyles[tone],
        interactive &&
          "cursor-pointer hover:bg-white/[0.05] hover:border-white/[0.12] hover:-translate-y-0.5",
        className,
      )}
      {...props}
    />
  );
}
