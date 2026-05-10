"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  /** Target value to count up to */
  target: number;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Delay before starting in milliseconds */
  delay?: number;
  /** Whether to start the animation */
  active?: boolean;
  /** Optional callback on each tick (for sound effects) */
  onTick?: () => void;
  /** Optional callback when counting completes */
  onComplete?: () => void;
  /** CSS class for the number display */
  className?: string;
  /** Suffix to append (e.g. "%" or "SP") */
  suffix?: string;
  /** Prefix to prepend (e.g. "+" or "#") */
  prefix?: string;
};

/**
 * Smooth animated number counter using requestAnimationFrame.
 * Counts from 0 to `target` over `duration` ms with an easing curve.
 */
export function AnimatedCounter({
  target,
  duration = 1200,
  delay = 0,
  active = true,
  onTick,
  onComplete,
  className,
  suffix = "",
  prefix = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const lastTickRef = useRef(0);

  useEffect(() => {
    if (!active) {
      setDisplayValue(0);
      completedRef.current = false;
      return;
    }

    let cancelled = false;
    const delayTimer = setTimeout(() => {
      if (cancelled) return;

      function animate(timestamp: number) {
        if (cancelled) return;

        if (!startTimeRef.current) {
          startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out cubic for natural deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(eased * target);

        setDisplayValue(currentValue);

        // Fire tick callback at intervals (not every frame)
        if (onTick && currentValue !== lastTickRef.current && currentValue % Math.max(1, Math.floor(target / 15)) === 0) {
          lastTickRef.current = currentValue;
          onTick();
        }

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(target);
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
        }
      }

      startTimeRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(delayTimer);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [active, target, duration, delay, onTick, onComplete]);

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}
