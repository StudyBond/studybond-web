"use client";

import { useProfile } from "@/features/settings/hooks/use-settings";
import { useEffect, useState } from "react";

type WatermarkOverlayProps = {
  /** Optional override for the text */
  text?: string;
  /** Opacity of the watermark (default: 0.03) */
  opacity?: number;
};

export function WatermarkOverlay({ text, opacity = 0.04 }: WatermarkOverlayProps) {
  const { data: profile } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    setMounted(true);
    setTimestamp(new Date().toLocaleString());
    
    // Update timestamp every minute to make it dynamic
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleString());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !profile) return null;

  const watermarkText = text || `STUDYBOND • ${profile.fullName.toUpperCase()} • ID:${profile.id} • ${timestamp}`;

  return (
    <div 
      className="fixed inset-0 pointer-events-none select-none z-[150] overflow-hidden flex flex-wrap content-start justify-start gap-x-24 gap-y-32 p-12"
      style={{ opacity }}
    >
      {Array.from({ length: 40 }).map((_, i) => (
        <div 
          key={i} 
          className="text-[10px] font-black tracking-[0.2em] uppercase whitespace-nowrap -rotate-[25deg] text-white/40"
        >
          {watermarkText}
        </div>
      ))}
    </div>
  );
}
