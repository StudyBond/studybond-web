import { cn } from "@/lib/utils/cn";

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("relative min-h-screen overflow-hidden bg-[var(--sb-bg)]", className)}>
      <div className="sb-grid absolute inset-0" />
      <div className="sb-noise absolute inset-0" />
      <div className="relative">{children}</div>
    </main>
  );
}
