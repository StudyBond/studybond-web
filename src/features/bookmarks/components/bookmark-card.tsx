"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useDeleteBookmark, useUpdateBookmarkNotes } from "@/features/bookmarks/hooks/use-bookmarks";
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
} from "lucide-react";

type BookmarkCardProps = {
  bookmark: Bookmark;
  onReview: (bookmarkId: number) => void;
};

const SUBJECT_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Mathematics: { bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  English: { bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
  Physics: { bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
  Chemistry: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
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
    const daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));
    const totalDays = 30;
    const progress = Math.min(100, Math.max(0, ((totalDays - daysLeft) / totalDays) * 100));
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
        "group relative rounded-2xl border bg-white/[0.015] overflow-hidden transition-all duration-300",
        isDeleting
          ? "border-red-400/15 opacity-50 scale-[0.98] pointer-events-none"
          : "border-white/[0.04] hover:border-white/[0.08] hover:-translate-y-0.5 hover:shadow-xl",
      )}
    >
      {/* Expiry progress bar */}
      {expiryInfo && (
        <div className="h-[2px] w-full bg-white/[0.03]">
          <div
            className={cn("h-full rounded-r-full transition-all duration-700", expiryInfo.color)}
            style={{ width: `${100 - expiryInfo.progress}%` }}
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        {/* Header: Subject badge + expiry + actions */}
        <div className="flex items-start gap-2">
          {/* Subject badge */}
          <span className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0", subjectStyle.bg, subjectStyle.text)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", subjectStyle.dot)} />
            {bookmark.question.subject}
          </span>

          {/* Topic */}
          {bookmark.question.topic && (
            <span className="px-2 py-1 rounded-lg bg-white/[0.03] text-[10px] font-medium text-white/20 truncate">
              {bookmark.question.topic}
            </span>
          )}

          <div className="flex-1" />

          {/* Expiry */}
          {expiryInfo && (
            <span className={cn(
              "flex items-center gap-1 text-[10px] font-medium shrink-0",
              expiryInfo.daysLeft <= 3 ? "text-red-400/70" : expiryInfo.daysLeft <= 10 ? "text-amber-400/50" : "text-white/20",
            )}>
              <Clock className="h-3 w-3" />
              {expiryInfo.daysLeft}d
            </span>
          )}
        </div>

        {/* Question Text */}
        <div className="relative">
          <p className="text-sm text-white/70 leading-relaxed line-clamp-3">
            {bookmark.question.questionText}
          </p>
          {bookmark.question.hasImage && (
            <div className="flex items-center gap-1 mt-1.5 text-[10px] text-white/20">
              <ImageIcon className="h-3 w-3" />
              Has image
            </div>
          )}
        </div>

        {/* Notes */}
        {isEditingNotes ? (
          <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
            <textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              autoFocus
              rows={3}
              maxLength={2000}
              placeholder="Add your study notes..."
              className="w-full rounded-xl border border-[var(--sb-accent)]/20 bg-[var(--sb-accent)]/[0.03] px-3 py-2.5 text-xs text-white/80 placeholder:text-white/15 outline-none resize-none transition-all focus:border-[var(--sb-accent)]/40 focus:ring-1 focus:ring-[var(--sb-accent)]/20"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => { setIsEditingNotes(false); setNotesDraft(bookmark.notes ?? ""); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                disabled={updateNotes.isPending}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-[var(--sb-accent)] bg-[var(--sb-accent)]/10 hover:bg-[var(--sb-accent)]/15 transition-colors disabled:opacity-40"
              >
                {updateNotes.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </button>
            </div>
          </div>
        ) : bookmark.notes ? (
          <button
            onClick={() => setIsEditingNotes(true)}
            className="group/notes flex items-start gap-2 w-full text-left rounded-xl bg-[var(--sb-accent)]/[0.03] border border-[var(--sb-accent)]/[0.06] px-3 py-2.5 transition-all hover:bg-[var(--sb-accent)]/[0.05] hover:border-[var(--sb-accent)]/10"
          >
            <StickyNote className="h-3 w-3 shrink-0 text-[var(--sb-accent)]/40 mt-0.5" />
            <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed flex-1">{bookmark.notes}</p>
            <Pencil className="h-3 w-3 shrink-0 text-white/0 group-hover/notes:text-white/20 transition-colors mt-0.5" />
          </button>
        ) : null}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          {/* Add notes button (when no notes exist and not editing) */}
          {/* Review Button */}
          <button
            onClick={() => onReview(bookmark.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold text-[var(--sb-accent)] bg-[var(--sb-accent)]/10 hover:bg-[var(--sb-accent)]/20 transition-all"
          >
            Review Question
          </button>

          {!bookmark.notes && !isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-white/15 hover:text-white/40 transition-colors"
            >
              <StickyNote className="h-3 w-3" />
              Add notes
            </button>
          )}

          {(bookmark.notes || isEditingNotes) && <div />}

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={deleteBookmark.isPending}
            className="flex items-center gap-1 text-[10px] font-semibold text-white/0 group-hover:text-red-400/40 hover:!text-red-400/80 transition-all md:opacity-0 md:group-hover:opacity-100 opacity-100"
          >
            {deleteBookmark.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin text-red-400/50" />
            ) : (
              <>
                <BookmarkX className="h-3 w-3" />
                Remove
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
