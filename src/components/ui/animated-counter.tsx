"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

type AnimatedCounterProps = {
  /** The target value to count to */
  value: number;
  /** Duration of the animation in ms */
  duration?: number;
  /** Format function to transform the number for display */
  format?: (n: number) => string;
  /** Optional className for the displayed text */
  className?: string;
  /** Whether to animate only when scrolled into view */
  triggerOnView?: boolean;
  /** Easing function — "ease-out" gives a decelerating effect */
  easing?: "linear" | "ease-out" | "ease-in-out";
};

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const easingFns = {
  linear: (t: number) => t,
  "ease-out": easeOut,
  "ease-in-out": easeInOut,
};

const defaultFormat = (n: number) => {
  if (Number.isInteger(n)) return n.toLocaleString();
  return n.toFixed(1);
};

export function AnimatedCounter({
  value,
  duration = 1200,
  format = defaultFormat,
  className,
  triggerOnView = true,
  easing = "ease-out",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(triggerOnView ? 0 : value);
  const [hasTriggered, setHasTriggered] = useState(!triggerOnView);
  const ref = useRef<HTMLSpanElement>(null);
  const animFrameRef = useRef<number>(0);
  const startValueRef = useRef(0);

  // Intersection observer — trigger animation when visible
  useEffect(() => {
    if (!triggerOnView || hasTriggered) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasTriggered(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3, rootMargin: "0px 0px -20px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [triggerOnView, hasTriggered]);

  // Animation loop
  const animate = useCallback(
    (targetValue: number) => {
      const easeFn = easingFns[easing];
      const startVal = startValueRef.current;
      const startTime = performance.now();

      function tick(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeFn(progress);
        const currentValue = startVal + (targetValue - startVal) * easedProgress;

        setDisplayValue(currentValue);

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          setDisplayValue(targetValue);
        }
      }

      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(tick);
    },
    [duration, easing],
  );

  // Start animation when triggered or value changes
  useEffect(() => {
    if (!hasTriggered) return;
    animate(value);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [hasTriggered, value, animate]);

  // Store current display for smooth transitions on value change
  useEffect(() => {
    startValueRef.current = displayValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className={cn("sb-number-slot", className)}>
      {format(Math.round(displayValue * 100) / 100)}
    </span>
  );
}
