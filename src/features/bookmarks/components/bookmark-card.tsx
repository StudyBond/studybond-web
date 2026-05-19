"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import {
  useDeleteBookmark,
  useUpdateBookmarkNotes,
} from "@/features/bookmarks/hooks/use-bookmarks";
import type { Bookmark } from "@/lib/api/types";
import {
  BookmarkX,
  Clock,
  Pencil,
  Check,
  X,
  Loader2,
  StickyNote,
  ImageIcon,
  AlertCircle,
} from "lucide-react";

type BookmarkCardProps = {
  bookmark: Bookmark;
  onReview: (bookmarkId: number) => void;
};

const SUBJECT_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Mathematics: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  English: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  Physics: { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
  Chemistry: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  Biology: { bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-400" },
};

export function BookmarkCard({ bookmark, onReview }: BookmarkCardProps) {
  const deleteBookmark = useDeleteBookmark();
  const updateNotes = useUpdateBookmarkNotes();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(bookmark.notes ?? "");
  const [isDeleting, setIsDeleting] = useState(false);

  const subjectStyle = SUBJECT_COLORS[bookmark.question.subject] ?? {
    bg: "bg-white/5",
    text: "text-white/50",
    dot: "bg-white/40",
  };

  // Expiry calculation
  const expiryInfo = useMemo(() => {
    if (!bookmark.expiresAt) return null;
    const now = Date.now();
    const expiresAt = new Date(bookmark.expiresAt).getTime();
    const daysLeft = Math.max(
      0,
      Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)),
    );
    const totalDays = 30;
    const progress = Math.min(
      100,
      Math.max(0, ((totalDays - daysLeft) / totalDays) * 100),
    );
    const color =
      daysLeft <= 3
        ? "bg-red-400"
        : daysLeft <= 10
          ? "bg-amber-400"
          : "bg-emerald-400/60";
    return { daysLeft, progress, color };
  }, [bookmark.expiresAt]);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteBookmark.mutateAsync(bookmark.id);
    } catch {
      setIsDeleting(false);
    }
  }

  async function handleSaveNotes() {
    const trimmed = notesDraft.trim();
    await updateNotes.mutateAsync({
      bookmarkId: bookmark.id,
      notes: trimmed || null,
    });
    setIsEditingNotes(false);
  }

  return (
    <div
      className={cn(
        "group relative rounded-2xl border overflow-hidden transition-all duration-300 backdrop-blur-sm",
        isDeleting
          ? "border-red-400/15 opacity-50 scale-[0.98] pointer-events-none bg-white/[0.005]"
          : "border-white/[0.08] bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-white/[0.12] hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--sb-accent)]/5",
      )}
    >
      {/* Expiry progress bar - Top */}
      {expiryInfo && (
        <div className="h-1 w-full bg-gradient-to-r from-white/[0.02] to-transparent">
          <div
            className={cn(
              "h-full rounded-r-full transition-all duration-700",
              expiryInfo.color,
            )}
            style={{ width: `${100 - expiryInfo.progress}%` }}
          />
        </div>
      )}

      <div className="p-4 sm:p-5 space-y-4">
        {/* ──── HEADER SECTION ──── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-2">
          {/* Subject Badge */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                subjectStyle.bg,
                subjectStyle.text,
              )}
            >
              <span
                className={cn("h-1.5 w-1.5 rounded-full", subjectStyle.dot)}
              />
              {bookmark.question.subject}
            </span>
          </div>

          {/* Topic & Expiry Container */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Topic */}
            {bookmark.question.topic && (
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.05] text-[10px] font-medium text-white/40 truncate border border-white/[0.03] hover:bg-white/[0.08] transition-colors">
                {bookmark.question.topic}
              </span>
            )}

            {/* Expiry Status - with better visibility */}
            {expiryInfo && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-[10px] font-semibold shrink-0 px-2 py-1 rounded-lg transition-all",
                  expiryInfo.daysLeft <= 3
                    ? "text-red-400 bg-red-400/[0.08] border border-red-400/15"
                    : expiryInfo.daysLeft <= 10
                      ? "text-amber-400 bg-amber-400/[0.08] border border-amber-400/15"
                      : "text-emerald-400/70 bg-emerald-400/[0.05] border border-emerald-400/10",
                )}
              >
                <Clock className="h-3 w-3" />
                <span>{expiryInfo.daysLeft}d left</span>
              </div>
            )}
          </div>
        </div>

        {/* ──── QUESTION CONTENT ──── */}
        <div className="space-y-2.5">
          <p className="text-sm leading-relaxed text-white/75 line-clamp-4 hover:line-clamp-none transition-all">
            {bookmark.question.questionText}
          </p>

          {/* Image indicator */}
          {bookmark.question.hasImage && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-400/[0.04] border border-blue-400/10 w-fit">
              <ImageIcon className="h-3.5 w-3.5 text-blue-400/50" />
              <span className="text-[10px] text-blue-400/60 font-medium">
                Has image attachment
              </span>
            </div>
          )}
        </div>

        {/* ──── NOTES SECTION ──── */}
        {isEditingNotes ? (
          <div className="space-y-3 animate-in slide-in-from-top-2 fade-in duration-200">
            <div className="relative">
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                autoFocus
                rows={3}
                maxLength={2000}
                placeholder="Add your study notes here... (max 2000 characters)"
                className="w-full rounded-xl border border-[var(--sb-accent)]/25 bg-gradient-to-br from-[var(--sb-accent)]/[0.04] to-[var(--sb-accent)]/[0.01] px-4 py-3 text-xs text-white/80 placeholder:text-white/25 outline-none resize-none transition-all focus:border-[var(--sb-accent)]/50 focus:ring-2 focus:ring-[var(--sb-accent)]/20"
              />
              <span className="text-[9px] text-white/20 mt-1 block text-right">
                {notesDraft.length}/2000
              </span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => {
                  setIsEditingNotes(false);
                  setNotesDraft(bookmark.notes ?? "");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white/40 hover:text-white/70 hover:bg-white/[0.05] transition-all border border-white/[0.05] hover:border-white/[0.10]"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={updateNotes.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r from-[var(--sb-accent)] to-[var(--sb-accent)]/80 hover:shadow-lg hover:shadow-[var(--sb-accent)]/20 transition-all disabled:opacity-50 border border-[var(--sb-accent)]/30"
              >
                {updateNotes.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save Notes
              </button>
            </div>
          </div>
        ) : bookmark.notes ? (
          <button
            onClick={() => setIsEditingNotes(true)}
            className="group/notes w-full text-left rounded-xl bg-gradient-to-br from-[var(--sb-accent)]/[0.06] to-[var(--sb-accent)]/[0.02] border border-[var(--sb-accent)]/[0.12] px-4 py-3 transition-all hover:from-[var(--sb-accent)]/[0.10] hover:to-[var(--sb-accent)]/[0.04] hover:border-[var(--sb-accent)]/20 group-hover:shadow-lg group-hover:shadow-[var(--sb-accent)]/10"
          >
            <div className="flex items-start gap-3">
              <StickyNote className="h-4 w-4 shrink-0 text-[var(--sb-accent)]/60 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white/60 mb-1">
                  Your Notes
                </p>
                <p className="text-[11px] text-white/45 line-clamp-2 leading-relaxed">
                  {bookmark.notes}
                </p>
              </div>
              <Pencil className="h-3.5 w-3.5 shrink-0 text-white/20 group-hover/notes:text-[var(--sb-accent)]/80 transition-colors mt-0.5" />
            </div>
          </button>
        ) : null}

        {/* ──── ACTIONS SECTION ──── */}
        <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.03]">
          {/* Primary Action: Review Question - Full width on mobile, flex on desktop */}
          <button
            onClick={() => onReview(bookmark.id)}
            className="w-full sm:flex-1 px-4 py-2.5 rounded-xl text-[11px] font-bold text-white bg-gradient-to-r from-[var(--sb-accent)] via-[var(--sb-accent)]/90 to-[var(--sb-accent)]/80 hover:shadow-lg hover:shadow-[var(--sb-accent)]/20 hover:translate-y-[-1px] transition-all border border-[var(--sb-accent)]/40 active:scale-[0.97]"
          >
            Review Question
          </button>

          {/* Secondary Actions - Flex layout */}
          <div className="flex items-center gap-2">
            {/* Add Notes Button */}
            {!bookmark.notes && !isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-semibold text-white/50 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.10] transition-all"
              >
                <StickyNote className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Add notes</span>
              </button>
            )}

            {/* Delete Button - Always Visible */}
            <button
              onClick={handleDelete}
              disabled={deleteBookmark.isPending || isDeleting}
              className={cn(
                "flex-1 sm:flex-0 sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-semibold transition-all border",
                deleteBookmark.isPending || isDeleting
                  ? "text-red-400/40 bg-red-400/[0.03] border-red-400/10 cursor-not-allowed opacity-50"
                  : "text-red-400/70 bg-red-400/[0.04] hover:bg-red-400/[0.08] hover:text-red-400 border-red-400/15 hover:border-red-400/30 active:scale-[0.97]",
              )}
              title="Remove this bookmark"
            >
              {deleteBookmark.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="hidden sm:inline">Removing...</span>
                </>
              ) : (
                <>
                  <BookmarkX className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </>
              )}
            </button>

            {/* Spacer for layout when notes exist */}
            {(bookmark.notes || isEditingNotes) && (
              <div className="hidden sm:block flex-1" />
            )}
          </div>
        </div>
      </div>

      {/* Decorative corner accent */}
      <div className="pointer-events-none absolute -top-10 -right-10 w-20 h-20 rounded-full bg-[var(--sb-accent)]/[0.04] blur-2xl group-hover:bg-[var(--sb-accent)]/[0.06] transition-all" />
    </div>
  );
}
