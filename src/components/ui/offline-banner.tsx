"use client";

import { useOfflineStatus } from "@/providers/offline-sync-provider";
import { WifiOff } from "lucide-react";

/**
 * A subtle, non-intrusive banner that appears when the user loses connectivity.
 * Positioned fixed at the bottom of the viewport to avoid conflicting with
 * the exam header or any other top-fixed elements.
 *
 * Auto-hides when connectivity returns — no user action needed.
 */
export function OfflineBanner() {
  const { isOnline } = useOfflineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[200] animate-in slide-in-from-bottom fade-in duration-300">
      <div className="flex items-center justify-center gap-2 bg-amber-500/90 backdrop-blur-sm px-4 py-2 text-center">
        <WifiOff className="h-3.5 w-3.5 text-black/70 shrink-0" />
        <p className="text-xs font-semibold text-black/80">
          You&apos;re offline — your work is saved locally and will sync when you reconnect
        </p>
      </div>
    </div>
  );
}
