"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import {
  useDeleteBookmark,
  useUpdateBookmarkNotes,
} from "@/features/bookmarks/hooks/use-bookmarks";
import type { Bookmark } from "@/lib/api/types";
import {
  Clock,
  Pencil,
  Check,
  X,
  Loader2,
  StickyNote,
  ImageIcon,
  Eye,
  Trash2,
} from "lucide-react";

type BookmarkCardProps = {
  bookmark: Bookmark;
  onReview: (bookmarkId: number) => void;
};

const SUBJECT_COLORS: Record<
  string,
  { bg: string; text: string; dot: string; border: string }
> = {
  Mathematics: {
    bg: "bg-blue-500/[0.06]",
    text: "text-blue-400",
    dot: "bg-blue-400",
    border: "border-blue-400/10",
  },
  English: {
    bg: "bg-purple-500/[0.06]",
    text: "text-purple-400",
    dot: "bg-purple-400",
    border: "border-purple-400/10",
  },
  Physics: {
    bg: "bg-cyan-500/[0.06]",
    text: "text-cyan-400",
    dot: "bg-cyan-400",
    border: "border-cyan-400/10",
  },
  Chemistry: {
    bg: "bg-emerald-500/[0.06]",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    border: "border-emerald-400/10",
  },
  Biology: {
    bg: "bg-rose-500/[0.06]",
    text: "text-rose-400",
    dot: "bg-rose-400",
    border: "border-rose-400/10",
  },
};

export function BookmarkCard({ bookmark, onReview }: BookmarkCardProps) {
  const deleteBookmark = useDeleteBookmark();
  const updateNotes = useUpdateBookmarkNotes();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesDraft, setNotesDraft] = useState(bookmark.notes ?? "");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const subjectStyle = SUBJECT_COLORS[bookmark.question.subject] ?? {
    bg: "bg-white/[0.04]",
    text: "text-white/50",
    dot: "bg-white/40",
    border: "border-white/[0.06]",
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
    const urgency: "critical" | "warning" | "safe" =
      daysLeft <= 3 ? "critical" : daysLeft <= 10 ? "warning" : "safe";
    return { daysLeft, progress, urgency };
  }, [bookmark.expiresAt]);

  const expiryColor = expiryInfo
    ? expiryInfo.urgency === "critical"
      ? "text-red-400 bg-red-400/[0.06] border-red-400/10"
      : expiryInfo.urgency === "warning"
        ? "text-amber-400 bg-amber-400/[0.06] border-amber-400/10"
        : "text-emerald-400/60 bg-emerald-400/[0.04] border-emerald-400/[0.06]"
    : "";

  const expiryBarColor = expiryInfo
    ? expiryInfo.urgency === "critical"
      ? "bg-red-400"
      : expiryInfo.urgency === "warning"
        ? "bg-amber-400"
        : "bg-emerald-400/50"
    : "";

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Auto-dismiss after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteBookmark.mutateAsync(bookmark.id);
    } catch {
      setIsDeleting(false);
      setConfirmDelete(false);
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

  // Created date
  const createdDate = new Date(bookmark.createdAt);
  const dateStr = createdDate.toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={cn(
        "group relative rounded-2xl border overflow-hidden transition-all duration-300",
        isDeleting
          ? "border-red-400/10 opacity-40 scale-[0.97] pointer-events-none bg-white/[0.005]"
          : "border-white/[0.06] bg-gradient-to-br from-white/[0.025] to-white/[0.008] hover:border-white/[0.10] hover:bg-white/[0.03]",
      )}
    >
      {/* Expiry progress — thin bar at top */}
      {expiryInfo && (
        <div className="h-[2px] w-full bg-white/[0.02]">
          <div
            className={cn(
              "h-full rounded-r-full transition-all duration-700",
              expiryBarColor,
            )}
            style={{ width: `${100 - expiryInfo.progress}%` }}
          />
        </div>
      )}

      <div className="p-4 sm:p-5 space-y-3.5">
        {/* ──── META ROW ──── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject */}
          <span
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
              subjectStyle.bg,
              subjectStyle.text,
              subjectStyle.border,
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", subjectStyle.dot)}
            />
            {bookmark.question.subject}
          </span>

          {/* Topic */}
          {bookmark.question.topic && (
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] text-[10px] font-medium text-white/30 truncate max-w-[180px] border border-white/[0.03]">
              {bookmark.question.topic}
            </span>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Date saved */}
          <span className="text-[10px] text-white/15 font-medium shrink-0 hidden sm:inline">
            {dateStr}
          </span>

          {/* Expiry */}
          {expiryInfo && (
            <span
              className={cn(
                "flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg border shrink-0",
                expiryColor,
              )}
            >
              <Clock className="h-2.5 w-2.5" />
              {expiryInfo.daysLeft}d
            </span>
          )}
        </div>

        {/* ──── QUESTION TEXT ──── */}
        <div className="space-y-2">
          <p className="text-sm leading-relaxed text-white/65 line-clamp-3 group-hover:text-white/75 transition-colors duration-300">
            {bookmark.question.questionText}
          </p>

          {/* Image indicator */}
          {bookmark.question.hasImage && (
            <div className="flex items-center gap-1.5 text-[10px] text-blue-400/40 font-medium">
              <ImageIcon className="h-3 w-3" />
              <span>Has image</span>
            </div>
          )}
        </div>

        {/* ──── NOTES ──── */}
        <AnimatePresence mode="wait">
          {isEditingNotes ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2.5"
            >
              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                autoFocus
                rows={3}
                maxLength={2000}
                placeholder="What do you want to remember about this question?"
                className="w-full rounded-xl border border-[var(--sb-accent)]/20 bg-[var(--sb-accent)]/[0.03] px-4 py-3 text-xs text-white/70 placeholder:text-white/20 outline-none resize-none transition-all focus:border-[var(--sb-accent)]/40 focus:ring-1 focus:ring-[var(--sb-accent)]/15"
                aria-label="Edit bookmark notes"
              />
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-white/15">
                  {notesDraft.length}/2000
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsEditingNotes(false);
                      setNotesDraft(bookmark.notes ?? "");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                    aria-label="Cancel editing notes"
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={updateNotes.isPending}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[10px] font-bold text-[#0c0c0e] bg-[var(--sb-accent)] hover:bg-[var(--sb-accent-hover)] transition-all disabled:opacity-50"
                    aria-label="Save notes"
                  >
                    {updateNotes.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          ) : bookmark.notes ? (
            <motion.button
              key="notes-display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsEditingNotes(true)}
              className="group/notes w-full text-left rounded-xl bg-[var(--sb-accent)]/[0.03] border border-[var(--sb-accent)]/[0.08] px-3.5 py-2.5 transition-all hover:bg-[var(--sb-accent)]/[0.06] hover:border-[var(--sb-accent)]/15"
              aria-label="Edit your study notes"
            >
              <div className="flex items-start gap-2.5">
                <StickyNote className="h-3.5 w-3.5 shrink-0 text-[var(--sb-accent)]/40 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-[var(--sb-accent)]/50 mb-0.5">
                    Your Note
                  </p>
                  <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">
                    {bookmark.notes}
                  </p>
                </div>
                <Pencil className="h-3 w-3 shrink-0 text-white/10 group-hover/notes:text-[var(--sb-accent)]/60 transition-colors mt-1" />
              </div>
            </motion.button>
          ) : null}
        </AnimatePresence>

        {/* ──── ACTIONS ──── */}
        <div className="flex items-center gap-2 pt-1">
          {/* Review — primary */}
          <button
            onClick={() => onReview(bookmark.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold text-[#0c0c0e] bg-gradient-to-r from-[var(--sb-accent)] to-[var(--sb-accent)]/85 hover:shadow-[0_0_20px_var(--sb-accent-glow)] active:scale-[0.98] transition-all duration-200"
            aria-label="Review this question"
          >
            <Eye className="h-3.5 w-3.5" />
            Review
          </button>

          {/* Add notes — secondary, only if no notes */}
          {!bookmark.notes && !isEditingNotes && (
            <button
              onClick={() => setIsEditingNotes(true)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-semibold text-white/35 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:text-white/55 hover:border-white/[0.08] transition-all"
              aria-label="Add study notes"
            >
              <StickyNote className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Note</span>
            </button>
          )}

          {/* Remove — destructive, with confirmation */}
          <button
            onClick={handleDelete}
            disabled={deleteBookmark.isPending || isDeleting}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[10px] font-semibold transition-all duration-200 border",
              confirmDelete
                ? "text-red-400 bg-red-400/[0.08] border-red-400/20 hover:bg-red-400/[0.15]"
                : deleteBookmark.isPending || isDeleting
                  ? "text-red-400/30 bg-red-400/[0.02] border-red-400/[0.06] cursor-not-allowed opacity-50"
                  : "text-white/20 bg-white/[0.01] border-white/[0.03] hover:text-red-400/70 hover:bg-red-400/[0.04] hover:border-red-400/10",
            )}
            title={confirmDelete ? "Click again to confirm removal" : "Remove this bookmark"}
            aria-label={confirmDelete ? "Confirm removal" : "Remove bookmark"}
          >
            {deleteBookmark.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            {confirmDelete && (
              <span className="hidden sm:inline">Confirm?</span>
            )}
          </button>
        </div>
      </div>

      {/* Decorative corner glow */}
      <div className="pointer-events-none absolute -top-8 -right-8 w-16 h-16 rounded-full bg-[var(--sb-accent)]/[0.03] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </div>
  );
}
