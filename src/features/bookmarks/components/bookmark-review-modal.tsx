"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, Info, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBookmarkById } from "@/features/bookmarks/hooks/use-bookmarks";
import { QuestionReviewItem } from "@/features/exam/components/answer-review";
import type { QuestionWithAnswer } from "@/lib/api/types";
import { motion, AnimatePresence } from "framer-motion";

type BookmarkReviewModalProps = {
  bookmarkId: number | null;
  onClose: () => void;
};

export function BookmarkReviewModal({ bookmarkId, onClose }: BookmarkReviewModalProps) {
  const { data: bookmark, isLoading, isError } = useBookmarkById(bookmarkId || 0, !!bookmarkId);

  // Prevent background scroll when open
  useEffect(() => {
    if (bookmarkId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [bookmarkId]);

  // Handle ESC key to close
  useEffect(() => {
    if (!bookmarkId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [bookmarkId, onClose]);

  if (!bookmarkId) return null;

  const content = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 260 }}
          className="relative w-full max-w-4xl max-h-[88vh] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0c0e] shadow-[0_32px_128px_rgba(0,0,0,0.85)] flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.01] shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sb-accent)]/10 text-[var(--sb-accent)] border border-[var(--sb-accent)]/20 shadow-[0_0_10px_var(--sb-accent-glow)]">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Review Bookmarked Question</h3>
                <p className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">Study Vault Chamber</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.03] text-white/30 hover:bg-white/[0.08] hover:text-white transition-all duration-200"
              title="Close focus view"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-accent)] opacity-40" />
              </div>
            ) : isError || !bookmark ? (
              <div className="flex h-64 flex-col items-center justify-center text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-red-400/10 flex items-center justify-center text-red-400 border border-red-400/20">
                  <X className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white/80">Question Locked or Removed</p>
                  <p className="text-xs text-white/35 max-w-xs leading-relaxed">
                    We couldn't retrieve the requested data. It may have expired or been deleted from the database.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors"
                >
                  Go Back
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left/Middle Column: Question and Solution */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="sb-protected rounded-2xl border border-white/[0.03] bg-white/[0.005] p-5">
                    <QuestionReviewItem
                      index={0}
                      q={{
                        ...bookmark.question,
                        userAnswer: null,
                        isCorrect: false,
                        timeSpentSeconds: null,
                      } as QuestionWithAnswer}
                    />
                  </div>
                </div>

                {/* Right Column: Study Notes and Expiry Info */}
                <div className="space-y-4">
                  {/* Parchment-style Study Annotations */}
                  <div className="rounded-xl border border-[var(--sb-accent)]/20 bg-gradient-to-br from-[var(--sb-accent)]/[0.05] to-[var(--sb-accent)]/[0.01] p-5 space-y-3 relative overflow-hidden">
                    {/* Corner paper fold representation */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-[var(--sb-accent)]/10 border-b border-l border-[var(--sb-accent)]/20 rounded-bl-xl pointer-events-none" />
                    
                    <div className="flex items-center gap-2 text-[var(--sb-accent-text)]">
                      <Info className="h-4 w-4" />
                      <h4 className="text-[10px] font-bold uppercase tracking-wider">Vault Notes</h4>
                    </div>

                    <p className="text-xs text-white/60 leading-relaxed font-serif italic">
                      {bookmark.notes ? (
                        `“${bookmark.notes}”`
                      ) : (
                        <span className="text-white/20 not-italic">No annotations added to this card yet. Close focus and click the notes icon on the card to edit.</span>
                      )}
                    </p>
                  </div>

                  {/* Tips banner */}
                  <div className="rounded-xl border border-white/[0.03] bg-white/[0.005] p-4 text-center">
                    <p className="text-[9px] text-white/25 leading-relaxed font-semibold uppercase tracking-wider">
                      Study Tip
                    </p>
                    <p className="text-[10px] text-white/30 mt-1 leading-normal">
                      Try writing down the derivation rules in your notebook. Active retrieval doubles retention.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/[0.06] bg-[#09090b] flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] active:scale-[0.98] transition-all"
            >
              Exit Focus Chamber
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
