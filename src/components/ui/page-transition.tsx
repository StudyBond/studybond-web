"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

type PageTransitionProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Wraps page content with a smooth blur-in entrance animation on mount.
 * Automatically triggers on first render — used inside the shell so
 * every route change feels silky smooth.
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Small delay to ensure the exit frame is painted first
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className={cn(
        "transition-all duration-500",
        mounted
          ? "opacity-100 translate-y-0 blur-0"
          : "opacity-0 translate-y-3 blur-[6px]",
        className,
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
    >
      {children}
    </div>
  );
}
