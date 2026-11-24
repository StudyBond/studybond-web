"use client";

import { useEffect, useRef } from "react";

/* The hero's amber spacetime grid: a gravity well bends the lines, a slow
   ripple runs out of it, and the well drifts after the pointer, then home.
   Drawn on a canvas behind the headline. It only animates while the hero is
   on screen and the tab is visible; with reduced motion it draws one still
   frame. */

const STRENGTH = 0.32;
const SPACING = 42;

export function SpacetimeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = canvas?.parentElement;
    const hero = canvas?.closest("section");
    const ctx = canvas?.getContext("2d");
    if (!canvas || !box || !hero || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let target: { x: number; y: number } | null = null;
    let cx: number | null = null;
    let cy: number | null = null;
    let raf = 0;
    let onScreen = true;

    const draw = (t: number) => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = Math.round(w * dpr);
      const H = Math.round(h * dpr);
      if (canvas.width !== W || canvas.height !== H) {
        canvas.width = W;
        canvas.height = H;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const tx = target ? target.x : w / 2;
      const ty = target ? target.y : h * 0.56;
      cx = cx === null ? tx : cx + (tx - cx) * 0.035;
      cy = cy === null ? ty : cy + (ty - cy) * 0.035;
      const wellX = cx;
      const wellY = cy;
      const maxD = Math.min(w, h) * 0.9;

      const warp = (x: number, y: number): [number, number] => {
        const dx = x - wellX;
        const dy = y - wellY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const inf = Math.max(0, 1 - d / maxD);
        const wave = Math.sin(d * 0.02 - t * 0.9) * 16 * inf;
        const dip = 70 * Math.pow(inf, 2.5);
        return [x - dx * inf * 0.15, y + wave + dip];
      };

      ctx.strokeStyle = `rgba(224,144,64,${STRENGTH})`;
      ctx.lineWidth = 1;
      for (let y = -SPACING; y <= h + SPACING; y += SPACING) {
        ctx.beginPath();
        for (let x = -SPACING; x <= w + SPACING * 2; x += SPACING / 2) {
          const [px, py] = warp(x, y);
          if (x === -SPACING) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      for (let x = -SPACING; x <= w + SPACING; x += SPACING) {
        ctx.beginPath();
        for (let y = -SPACING; y <= h + SPACING * 2; y += SPACING / 2) {
          const [px, py] = warp(x, y);
          if (y === -SPACING) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
    };

    const loop = (ms: number) => {
      draw(ms / 1000);
      raf = window.requestAnimationFrame(loop);
    };
    const start = () => {
      if (still || raf || !onScreen || document.hidden) return;
      raf = window.requestAnimationFrame(loop);
    };
    const stop = () => {
      window.cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = hero.getBoundingClientRect();
      target = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };
    const onLeave = () => {
      target = null;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => {
      if (still) draw(0);
    };

    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    seen.observe(hero);

    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    if (still) draw(0);
    else start();

    return () => {
      stop();
      seen.disconnect();
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="fx" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
