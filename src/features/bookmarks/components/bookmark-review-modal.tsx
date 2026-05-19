"use client";

import { X, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useBookmarkById } from "@/features/bookmarks/hooks/use-bookmarks";
import { QuestionReviewItem } from "@/features/exam/components/answer-review";
import type { QuestionWithAnswer } from "@/lib/api/types";
import { createPortal } from "react-dom";
import { useEffect } from "react";

type BookmarkReviewModalProps = {
  bookmarkId: number | null;
  onClose: () => void;
};

export function BookmarkReviewModal({ bookmarkId, onClose }: BookmarkReviewModalProps) {
  const { data: bookmark, isLoading, isError } = useBookmarkById(bookmarkId || 0, !!bookmarkId);

  // Prevent background scroll
  useEffect(() => {
    if (bookmarkId) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [bookmarkId]);

  if (!bookmarkId) return null;

  const content = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c0c0e] shadow-[0_32px_128px_rgba(0,0,0,0.8)] animate-in zoom-in-95 fade-in duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]">
              <Info className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Review Bookmarked Question</h3>
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Study Vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.03] text-white/40 hover:bg-white/[0.08] hover:text-white transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-accent)] opacity-50" />
            </div>
          ) : isError || !bookmark ? (
            <div className="flex h-64 flex-col items-center justify-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-red-400/10 flex items-center justify-center text-red-400">
                <X className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/80">Failed to load question</p>
                <p className="text-xs text-white/30">The question might have been removed or is no longer available.</p>
              </div>
              <button 
                onClick={onClose}
                className="mt-2 text-xs font-bold text-[var(--sb-accent)] hover:underline"
              >
                Go back
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Note if exists */}
              {bookmark.notes && (
                <div className="rounded-2xl border border-[var(--sb-accent)]/10 bg-[var(--sb-accent)]/[0.02] p-4 flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-[var(--sb-accent)]/10 flex items-center justify-center text-[var(--sb-accent)] shrink-0">
                    <Info className="h-3 w-3" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sb-accent)]/60">Your Study Note</p>
                    <p className="text-xs text-white/50 leading-relaxed italic">"{bookmark.notes}"</p>
                  </div>
                </div>
              )}

              {/* Question Item - Reusing QuestionReviewItem */}
              <div className="sb-protected">
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

              {/* Expert Tip Notice */}
              <div className="rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4 flex items-center justify-center text-center">
                <p className="text-[10px] text-white/20 font-medium leading-relaxed max-w-sm">
                  This question is part of your personal study vault. Focus on understanding the core concept and the explanation provided.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.01] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-white/[0.05] hover:bg-white/[0.1] transition-all"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
