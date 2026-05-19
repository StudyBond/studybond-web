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
} from "lucide-react";
import { MathMarkdown } from "@/components/ui/math-markdown";
import { motion, AnimatePresence } from "framer-motion";

type BookmarkCardProps = {
  bookmark: Bookmark;
  onReview: (bookmarkId: number) => void;
};

const SUBJECT_COLORS: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  Mathematics: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400", dot: "bg-blue-400" },
  English: { bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400", dot: "bg-amber-400" },
  Physics: { bg: "bg-cyan-500/10 border-cyan-500/20", text: "text-cyan-400", dot: "bg-cyan-400" },
  Chemistry: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
  Biology: { bg: "bg-rose-500/10 border-rose-500/20", text: "text-rose-400", dot: "bg-rose-400" },
};

export function BookmarkCard({ bookmark, onReview }: BookmarkCardProps) {
  const deleteBookmark = useDeleteBookmark();
  const updateNotes = useUpdateBookmarkNotes();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(bookmark.notes ?? "");
  const [isDeleting, setIsDeleting] = useState(false);

  const subjectStyle = SUBJECT_COLORS[bookmark.question.subject] ?? {
    bg: "bg-white/5 border-white/10",
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
        "group relative rounded-2xl border overflow-hidden transition-all duration-300 backdrop-blur-sm bg-[#141416] border-[#1e1e22]",
        isDeleting
          ? "border-red-400/15 opacity-40 scale-[0.98] pointer-events-none"
          : "hover:border-[#3a3a40] hover:-translate-y-1 hover:shadow-lg hover:shadow-[var(--sb-accent)]/5",
      )}
    >
      {/* Expiry progress bar - Top */}
      {expiryInfo && (
        <div className="h-1 w-full bg-white/[0.02]">
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Subject & Topic Badges */}
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border",
                subjectStyle.bg,
                subjectStyle.text,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", subjectStyle.dot)} />
              {bookmark.question.subject}
            </span>

            {bookmark.question.topic && (
              <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-[9px] font-bold uppercase tracking-wider text-white/40 border border-white/[0.04] max-w-[150px] truncate">
                {bookmark.question.topic}
              </span>
            )}
          </div>

          {/* Expiry Countdown */}
          {expiryInfo && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border",
                expiryInfo.daysLeft <= 3
                  ? "text-red-400 bg-red-400/[0.06] border-red-400/15"
                  : expiryInfo.daysLeft <= 10
                    ? "text-amber-400 bg-amber-400/[0.06] border-amber-400/15"
                    : "text-white/40 bg-white/[0.02] border-white/[0.04]",
              )}
            >
              <Clock className="h-3 w-3" />
              <span>{expiryInfo.daysLeft}d left</span>
            </div>
          )}
        </div>

        {/* ──── QUESTION CONTENT (Physical Book print style) ──── */}
        <div className="space-y-2">
          <div className="font-serif text-sm leading-relaxed text-[#f0ede8]">
            <MathMarkdown content={bookmark.question.questionText} />
          </div>

          {/* Image indicator */}
          {bookmark.question.hasImage && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <ImageIcon className="h-3 w-3 text-blue-400" />
              <span className="text-[9px] text-blue-400 font-bold uppercase tracking-wider">
                Media attached
              </span>
            </div>
          )}
        </div>

        {/* ──── NOTES SECTION ──── */}
        <AnimatePresence initial={false} mode="wait">
          {isEditingNotes ? (
            <motion.div
              key="edit-notes"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-2"
            >
              <div className="relative">
                <textarea
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  autoFocus
                  rows={3}
                  maxLength={2000}
                  placeholder="Add study notes or key rules for this question..."
                  className="w-full rounded-xl border border-[var(--sb-accent)]/20 bg-gradient-to-br from-[#121214] to-[#0c0c0e] px-4 py-3 text-xs text-white/80 placeholder:text-white/20 outline-none resize-none transition-all focus:border-[var(--sb-accent)]/45 focus:ring-2 focus:ring-[var(--sb-accent)]/10"
                />
                <span className="text-[8px] text-white/25 mt-1 block text-right font-semibold">
                  {notesDraft.length}/2000
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button
                  onClick={() => {
                    setIsEditingNotes(false);
                    setNotesDraft(bookmark.notes ?? "");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white/40 hover:text-white/60 hover:bg-white/[0.03] transition-all border border-white/[0.04]"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={updateNotes.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-[#0c0c0e] bg-gradient-to-r from-[var(--sb-accent)] to-[#d48a34] hover:shadow-[0_0_12px_var(--sb-accent-glow)] transition-all disabled:opacity-50 border border-[var(--sb-accent)]/20"
                >
                  {updateNotes.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  Save
                </button>
              </div>
            </motion.div>
          ) : bookmark.notes ? (
            <motion.button
              key="view-notes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingNotes(true)}
              className="group/notes w-full text-left rounded-xl bg-gradient-to-br from-[var(--sb-accent)]/[0.05] to-[var(--sb-accent)]/[0.01] border border-[var(--sb-accent)]/15 px-4 py-3 transition-all hover:border-[var(--sb-accent)]/30"
            >
              <div className="flex items-start gap-3">
                <StickyNote className="h-4 w-4 shrink-0 text-[var(--sb-accent)]/65 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-[var(--sb-accent-text)]/70 uppercase tracking-wider mb-1">
                    Your Notes
                  </p>
                  <p className="text-xs text-white/60 leading-relaxed font-serif italic">
                    &ldquo;{bookmark.notes}&rdquo;
                  </p>
                </div>
                <Pencil className="h-3.5 w-3.5 shrink-0 text-white/30 group-hover/notes:text-[var(--sb-accent)]/70 transition-colors mt-0.5" />
              </div>
            </motion.button>
          ) : null}
        </AnimatePresence>

        {/* ──── ACTIONS SECTION ──── */}
        <div className="flex flex-col gap-2 pt-3 border-t border-white/[0.04]">
          {/* Primary Action: Review Question */}
          <button
            onClick={() => onReview(bookmark.id)}
            className="w-full px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[var(--sb-accent)] to-[#d48a34] hover:shadow-[0_0_12px_var(--sb-accent-glow)] hover:translate-y-[-1px] transition-all border border-[var(--sb-accent)]/30 active:scale-[0.98] cursor-pointer"
          >
            Review Solution
          </button>

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            {!bookmark.notes && !isEditingNotes && (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-semibold text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-white/[0.10] transition-all cursor-pointer"
              >
                <StickyNote className="h-3.5 w-3.5 text-white/50" />
                <span>Add notes</span>
              </button>
            )}

            <button
              onClick={handleDelete}
              disabled={deleteBookmark.isPending || isDeleting}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer",
                deleteBookmark.isPending || isDeleting
                  ? "text-red-400/40 bg-red-400/[0.02] border-red-400/10 cursor-not-allowed opacity-50"
                  : "text-red-400/70 bg-red-400/[0.04] hover:bg-red-400/[0.08] hover:text-red-400 border-red-400/10 hover:border-red-400/20 active:scale-[0.98]",
              )}
              title="Remove this bookmark"
            >
              {deleteBookmark.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Removing...</span>
                </>
              ) : (
                <>
                  <BookmarkX className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
