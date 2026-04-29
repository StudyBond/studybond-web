"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export function SpacetimeGrid({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.offsetWidth;
        canvas.height = parent.offsetHeight;
      }
    };
    window.addEventListener("resize", resize);
    resize();

    const draw = () => {
      time += 0.015; // Speed of the gravitational waves
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      
      // Center of the gravity well
      const centerX = width / 2;
      const centerY = height / 2 + 50; 

      ctx.strokeStyle = "rgba(224, 144, 64, 0.2)"; // Carbon amber with low opacity
      ctx.lineWidth = 1;

      const spacing = 40; // Base grid spacing

      // Draw horizontal lines
      for (let y = -spacing; y <= height + spacing; y += spacing) {
        ctx.beginPath();
        for (let x = -spacing; x <= width + spacing * 2; x += spacing / 2) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Relativity "gravity well" dip effect. 
          const maxDistance = Math.min(width, height) * 0.8;
          const influence = Math.max(0, 1 - distance / maxDistance);
          
          // Undulation moving outwards (gravitational waves)
          const wave = Math.sin(distance * 0.02 - time) * 15 * influence;
          
          // Gravity dip
          const dip = 60 * Math.pow(influence, 2.5);

          const finalY = y + wave + dip;
          const finalX = x - (dx * influence * 0.15); // Pull x towards center

          if (x === -spacing) ctx.moveTo(finalX, finalY);
          else ctx.lineTo(finalX, finalY);
        }
        ctx.stroke();
      }

      // Draw vertical lines
      for (let x = -spacing; x <= width + spacing; x += spacing) {
        ctx.beginPath();
        for (let y = -spacing; y <= height + spacing * 2; y += spacing / 2) {
          const dx = x - centerX;
          const dy = y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const maxDistance = Math.min(width, height) * 0.8;
          const influence = Math.max(0, 1 - distance / maxDistance);
          
          const wave = Math.sin(distance * 0.02 - time) * 15 * influence;
          const dip = 60 * Math.pow(influence, 2.5);

          const finalY = y + wave + dip;
          const finalX = x - (dx * influence * 0.15); // Pull x towards center

          if (y === -spacing) ctx.moveTo(finalX, finalY);
          else ctx.lineTo(finalX, finalY);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none z-0", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-70 [mask-image:radial-gradient(ellipse_100%_100%_at_50%_40%,black_10%,transparent_70%)]"
      />
    </div>
  );
}
