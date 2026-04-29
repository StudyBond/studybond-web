"use client";

import { useExamStore } from "@/features/exam/stores/exam-store";
import { LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AbandonDialogProps = {
  onConfirm: () => void;
  isAbandoning: boolean;
};

export function AbandonDialog({ onConfirm, isAbandoning }: AbandonDialogProps) {
  const open = useExamStore((s) => s.abandonDialogOpen);
  const setOpen = useExamStore((s) => s.setAbandonDialogOpen);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => !isAbandoning && setOpen(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-3xl border border-red-400/10 bg-[var(--sb-bg-elevated)] p-6 shadow-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close */}
        {!isAbandoning ? (
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-lg text-white/20 hover:bg-white/[0.05] hover:text-white/40 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}

        {/* Icon */}
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-400/10 text-red-400">
          <LogOut className="h-6 w-6" />
        </div>

        {/* Title */}
        <h2 className="text-center text-lg font-bold text-white mb-1.5">
          Leave this exam?
        </h2>

        <p className="text-center text-sm text-white/40 mb-6">
          Your progress will be lost and no Study Points will be earned. This action cannot be undone.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          {!isAbandoning ? (
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Keep going
            </Button>
          ) : null}
          <Button
            variant="danger"
            size="md"
            className="flex-1"
            onClick={onConfirm}
            isLoading={isAbandoning}
            disabled={isAbandoning}
          >
            {isAbandoning ? "Leaving..." : "Leave exam"}
          </Button>
        </div>
      </div>
    </div>
  );
}
