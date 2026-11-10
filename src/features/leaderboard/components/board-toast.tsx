"use client";

import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import styles from "./leaderboard.module.css";

/* A short note near the bottom of the screen ("You passed Kunle. Now #14.",
   "Saved to your account."). Rendered into <body>, because the learner shell
   wraps pages in a transformed element, which pins `fixed` children to the
   page instead of the screen. */
export function BoardToast({ toast }: { toast: { key: number; text: string } | null }) {
  if (!toast || typeof document === "undefined") return null;
  return createPortal(
    <div
      key={toast.key}
      role="status"
      className={cn(
        "sb-ui",
        styles.toast,
        "fixed bottom-[84px] left-1/2 z-[60] w-max max-w-[min(340px,calc(100vw-32px))] -translate-x-1/2 rounded-[10px] bg-[#1c1c21] px-3.5 py-2.5 text-center text-[13.5px] font-bold text-[#fafafa] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.4)]",
      )}
    >
      {toast.text}
    </div>,
    document.body,
  );
}
