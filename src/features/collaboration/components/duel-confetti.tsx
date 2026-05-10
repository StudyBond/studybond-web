"use client";

import { useEffect, useState } from "react";

const CONFETTI_COLORS = [
  "#d4a121", // gold
  "#fbbf24", // amber
  "#f59e0b", // yellow
  "#c17a28", // sb-accent
  "#e8b87a", // light gold
  "#ffffff", // white
  "#ff6b35", // coral
  "#60a5fa", // blue accent
];

type ConfettiParticle = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  driftX: number;
  rotation: number;
  shape: "square" | "circle" | "rect";
};

function generateParticles(count: number, originX: number, originY: number): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: originX + (Math.random() - 0.5) * 120,
    y: originY,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 4 + Math.random() * 8,
    duration: 2 + Math.random() * 1.5,
    delay: Math.random() * 0.5,
    driftX: (Math.random() - 0.5) * 120,
    rotation: Math.random() * 720,
    shape: (["square", "circle", "rect"] as const)[Math.floor(Math.random() * 3)],
  }));
}

type DuelConfettiProps = {
  /** Whether to trigger the confetti burst */
  active: boolean;
  /** Number of particles */
  count?: number;
  /** Origin X position (percentage of container width) */
  originX?: number;
  /** Origin Y position (percentage of container height) */
  originY?: number;
};

/**
 * Lightweight CSS-only confetti burst. No heavy libraries.
 * Generates particles that fall with physics-inspired motion.
 */
export function DuelConfetti({
  active,
  count = 40,
  originX = 50,
  originY = 20,
}: DuelConfettiProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    // Convert percentage to approximate pixel position within the container
    const containerWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
    const containerHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const px = (originX / 100) * containerWidth;
    const py = (originY / 100) * containerHeight;

    setParticles(generateParticles(count, px, py));

    // Clean up particles after they've all fallen
    const cleanup = setTimeout(() => {
      setParticles([]);
    }, 4500);

    return () => clearTimeout(cleanup);
  }, [active, count, originX, originY]);

  if (particles.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[300] overflow-hidden" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="sb-confetti-particle"
          style={{
            left: p.x,
            top: p.y,
            "--confetti-color": p.color,
            "--confetti-size": `${p.size}px`,
            "--confetti-duration": `${p.duration}s`,
            "--confetti-delay": `${p.delay}s`,
            "--confetti-x": `${p.driftX}px`,
            "--confetti-radius": p.shape === "circle" ? "50%" : p.shape === "rect" ? "1px" : "2px",
            width: p.shape === "rect" ? p.size * 0.4 : p.size,
            height: p.shape === "rect" ? p.size * 1.5 : p.size,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
