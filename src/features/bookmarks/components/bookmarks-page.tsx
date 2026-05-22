"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup, type Variants } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { useBookmarks } from "@/features/bookmarks/hooks/use-bookmarks";
import { BookmarkCard } from "@/features/bookmarks/components/bookmark-card";
import { BookmarkEmptyState } from "@/features/bookmarks/components/bookmark-empty-state";
import { BookmarkExamLauncher } from "@/features/bookmarks/components/bookmark-exam-launcher";
import { BookmarkReviewModal } from "@/features/bookmarks/components/bookmark-review-modal";
import { ExamSecurityOverlay } from "@/features/exam/components/exam-security-overlay";
import { useExamGuard } from "@/features/exam/hooks/use-exam-guard";
import {
  Bookmark,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Library,
  Flame,
  Clock,
  Filter,
} from "lucide-react";

/* ─── Subject Palette ─── */

const SUBJECT_META: Record<string, { label: string; color: string; dotColor: string }> = {
  Physics: { label: "Physics", color: "text-cyan-400", dotColor: "bg-cyan-400" },
  Chemistry: { label: "Chemistry", color: "text-emerald-400", dotColor: "bg-emerald-400" },
  Biology: { label: "Biology", color: "text-rose-400", dotColor: "bg-rose-400" },
  English: { label: "English", color: "text-purple-400", dotColor: "bg-purple-400" },
  Mathematics: { label: "Mathematics", color: "text-blue-400", dotColor: "bg-blue-400" },
};

/* ─── Stagger Variants ─── */

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

/* ─── Page Sections ─── */

function VaultHero({
  bookmarkCount,
  totalBookmarks,
  maxBookmarks,
  expiryDays,
  accessTier,
}: {
  bookmarkCount: number;
  totalBookmarks: number;
  maxBookmarks: number;
  expiryDays: number;
  accessTier: "FREE" | "PREMIUM";
}) {
  const capacityPercent = maxBookmarks > 0 ? Math.min(100, (totalBookmarks / maxBookmarks) * 100) : 0;
  const capacityColor =
    capacityPercent >= 85
      ? "text-red-400"
      : capacityPercent >= 60
        ? "text-amber-400"
        : "text-emerald-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-64 w-96 rounded-full bg-[var(--sb-accent)]/[0.04] blur-[100px]" />
      <div className="pointer-events-none absolute -top-20 right-1/4 h-48 w-64 rounded-full bg-purple-500/[0.02] blur-[80px]" />

      <div className="relative space-y-5">
        {/* Title Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--sb-accent)]/15 to-[var(--sb-accent)]/5 border border-[var(--sb-accent)]/10 shadow-[0_0_24px_var(--sb-accent-glow)]">
                <Bookmark className="h-6 w-6 text-[var(--sb-accent)]" />
              </div>
              {/* Subtle breathing ring */}
              <div className="absolute inset-0 rounded-2xl bg-[var(--sb-accent)]/[0.06] animate-[sb-breathe_4s_ease-in-out_infinite]" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Study Vault
              </h1>
              <p className="text-sm text-white/25 mt-0.5">
                Your curated collection of questions worth revisiting
              </p>
            </div>
          </div>
        </div>

        {/* Stats Ribbon */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Bookmark count */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <Library className="h-3.5 w-3.5 text-[var(--sb-accent)]/60" />
            <span className="text-xs font-semibold text-white/50">
              <span className="text-white/80 font-bold">{bookmarkCount}</span> saved
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <div className="relative h-3.5 w-3.5">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 -rotate-90">
                <circle
                  cx="12" cy="12" r="9"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="3"
                />
                <circle
                  cx="12" cy="12" r="9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 9}`}
                  strokeDashoffset={`${2 * Math.PI * 9 * (1 - capacityPercent / 100)}`}
                  className={cn("transition-all duration-1000", capacityColor)}
                />
              </svg>
            </div>
            <span className="text-xs font-semibold text-white/50">
              <span className={cn("font-bold", capacityColor)}>{totalBookmarks}</span>
              <span className="text-white/20">/{maxBookmarks}</span>
            </span>
          </div>

          {/* Expiry */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
            <Clock className="h-3.5 w-3.5 text-white/20" />
            <span className="text-xs font-semibold text-white/30">
              {expiryDays}d expiry
            </span>
          </div>

          {/* Tier badge */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
            accessTier === "PREMIUM"
              ? "bg-[var(--sb-gold)]/[0.08] text-[var(--sb-gold)] border border-[var(--sb-gold)]/10"
              : "bg-white/[0.03] text-white/20 border border-white/[0.04]",
          )}>
            {accessTier === "PREMIUM" ? (
              <>
                <Flame className="h-2.5 w-2.5" />
                Elite Vault
              </>
            ) : (
              "Explorer"
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Subject Filter Bar ─── */

function SubjectFilterBar({
  subjects,
  subjectCounts,
  selected,
  onSelect,
  totalCount,
}: {
  subjects: string[];
  subjectCounts: Record<string, number>;
  selected: string | undefined;
  onSelect: (subject: string | undefined) => void;
  totalCount: number;
}) {
  if (subjects.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div className="flex items-center gap-2 mb-3">
        <Filter className="h-3 w-3 text-white/15" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/15">
          Filter by subject
        </span>
      </div>
      <div
        className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sb-scroll-hide"
        role="tablist"
        aria-label="Filter bookmarks by subject"
      >
        {/* All */}
        <button
          role="tab"
          aria-selected={!selected}
          onClick={() => onSelect(undefined)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 shrink-0 border",
            !selected
              ? "bg-[var(--sb-accent)]/[0.1] text-[var(--sb-accent)] border-[var(--sb-accent)]/15 shadow-[0_0_16px_var(--sb-accent-glow)]"
              : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/50 hover:border-white/[0.07]",
          )}
        >
          All
          <span className={cn(
            "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
            !selected
              ? "bg-[var(--sb-accent)]/15 text-[var(--sb-accent)]"
              : "bg-white/[0.04] text-white/20",
          )}>
            {totalCount}
          </span>
        </button>

        {/* Subject pills */}
        {subjects.map((subject) => {
          const meta = SUBJECT_META[subject];
          const isActive = selected === subject;
          const count = subjectCounts[subject] || 0;

          return (
            <button
              key={subject}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(isActive ? undefined : subject)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 shrink-0 border",
                isActive
                  ? "bg-[var(--sb-accent)]/[0.1] text-[var(--sb-accent)] border-[var(--sb-accent)]/15 shadow-[0_0_16px_var(--sb-accent-glow)]"
                  : "bg-white/[0.02] text-white/30 border-white/[0.04] hover:bg-white/[0.04] hover:text-white/50 hover:border-white/[0.07]",
              )}
            >
              <span className={cn(
                "h-2 w-2 rounded-full shrink-0 transition-all",
                meta?.dotColor || "bg-white/30",
                isActive ? "scale-110" : "opacity-60",
              )} />
              {meta?.label || subject}
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-all",
                isActive
                  ? "bg-[var(--sb-accent)]/15 text-[var(--sb-accent)]"
                  : "bg-white/[0.04] text-white/20",
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Pagination ─── */

function PaginationBar({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="flex items-center justify-center gap-1.5 pt-6"
    >
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:text-white/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page dots */}
      <div className="flex items-center gap-1 px-3">
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 7) {
            pageNum = i + 1;
          } else if (page <= 4) {
            pageNum = i + 1;
          } else if (page >= totalPages - 3) {
            pageNum = totalPages - 6 + i;
          } else {
            pageNum = page - 3 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              aria-label={`Page ${pageNum}`}
              aria-current={page === pageNum ? "page" : undefined}
              className={cn(
                "flex h-8 min-w-[2rem] items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200",
                page === pageNum
                  ? "bg-[var(--sb-accent)]/15 text-[var(--sb-accent)] shadow-[0_0_12px_var(--sb-accent-glow)]"
                  : "text-white/25 hover:bg-white/[0.04] hover:text-white/50",
              )}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-xl text-white/30 bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:text-white/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* ═══ MAIN PAGE COMPONENT                                   ═══ */
/* ═══════════════════════════════════════════════════════════════ */

export function BookmarksPageClient() {
  const critical = useDashboardCriticalData();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [reviewingBookmarkId, setReviewingBookmarkId] = useState<number | null>(null);

  const { guardState, dismissViolation } = useExamGuard({
    mode: "review",
    enabled: true,
  });

  const { data: bookmarksData, isLoading, isError, error } = useBookmarks({
    page,
    limit: 20,
    subject: selectedSubject,
  });

  // Also fetch unfiltered data for global counts
  const { data: allBookmarksData } = useBookmarks({
    page: 1,
    limit: 1,
  });

  // Extract unique subjects with counts
  const { availableSubjects, subjectCounts } = useMemo(() => {
    if (!bookmarksData?.bookmarks) return { availableSubjects: [], subjectCounts: {} };
    // When filtering, we use the unfiltered subject set from allBookmarks
    const allBookmarks = selectedSubject ? allBookmarksData?.bookmarks : bookmarksData.bookmarks;
    const counts: Record<string, number> = {};
    const subjects = new Set<string>();

    // For counts, use the full dataset when available
    (allBookmarks || bookmarksData.bookmarks).forEach((b) => {
      const s = b.question.subject;
      subjects.add(s);
      counts[s] = (counts[s] || 0) + 1;
    });

    // Also add from current filtered data if subjects aren't in unfiltered
    bookmarksData.bookmarks.forEach((b) => {
      subjects.add(b.question.subject);
    });

    return {
      availableSubjects: Array.from(subjects).sort(),
      subjectCounts: counts,
    };
  }, [bookmarksData, allBookmarksData, selectedSubject]);

  const handleSubjectSelect = useCallback((subject: string | undefined) => {
    setSelectedSubject(subject);
    setPage(1);
  }, []);

  const handleReview = useCallback((id: number) => {
    setReviewingBookmarkId(id);
  }, []);

  /* ─── Loading State ─── */
  if (critical.isLoading) {
    return (
      <LearnerShell>
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-accent)] opacity-40" />
              <div className="absolute inset-0 h-8 w-8 rounded-full bg-[var(--sb-accent)]/[0.06] blur-xl" />
            </div>
            <p className="text-xs text-white/15 font-medium">Loading your vault…</p>
          </div>
        </div>
      </LearnerShell>
    );
  }

  /* ─── Error State ─── */
  if (critical.isError || !critical.profile.data) {
    return (
      <LearnerShell>
        <div className="p-8 text-center text-red-400/80">
          Failed to load essential data.
        </div>
      </LearnerShell>
    );
  }

  const isPremium = critical.stats.data?.isPremium ?? false;
  const limits = bookmarksData?.limits || allBookmarksData?.limits;

  return (
    <LearnerShell
      profile={critical.profile.data}
      isPremium={isPremium}
    >
      <ExamSecurityOverlay
        guardState={guardState}
        onDismiss={dismissViolation}
        mode="review"
      />

      <BookmarkReviewModal
        bookmarkId={reviewingBookmarkId}
        onClose={() => setReviewingBookmarkId(null)}
      />

      <div className="space-y-6">
        {/* ═══ HERO ═══ */}
        {limits && (
          <VaultHero
            bookmarkCount={bookmarksData?.pagination.total ?? limits.activeBookmarks}
            totalBookmarks={limits.activeBookmarks}
            maxBookmarks={limits.maxBookmarks}
            expiryDays={limits.expiryDays}
            accessTier={limits.accessTier}
          />
        )}

        {/* ═══ BOOKMARK EXAM LAUNCHER — the gravitational center ═══ */}
        {limits && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <BookmarkExamLauncher
              bookmarkCount={limits.activeBookmarks}
              isPremium={isPremium}
              availableSubjects={availableSubjects}
            />
          </motion.div>
        )}

        {/* ═══ SUBJECT FILTER ═══ */}
        {availableSubjects.length > 0 && (
          <SubjectFilterBar
            subjects={availableSubjects}
            subjectCounts={subjectCounts}
            selected={selectedSubject}
            onSelect={handleSubjectSelect}
            totalCount={bookmarksData?.pagination.total ?? limits?.activeBookmarks ?? 0}
          />
        )}

        {/* ═══ COLLECTION ═══ */}
        {isLoading ? (
          <div className="flex h-[30vh] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-white/15" />
              <p className="text-[11px] text-white/10">Fetching bookmarks…</p>
            </div>
          </div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex h-48 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.02] p-6 text-center"
          >
            <div className="space-y-2">
              <p className="text-red-400/80 font-bold text-sm">
                Failed to load bookmarks
              </p>
              <p className="text-red-400/40 text-xs max-w-xs">
                {error instanceof Error ? error.message : "Unknown error occurred"}
              </p>
            </div>
          </motion.div>
        ) : !bookmarksData?.bookmarks.length ? (
          <BookmarkEmptyState />
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white/15 font-medium">
                {selectedSubject ? (
                  <>
                    Showing <span className="text-white/30">{bookmarksData.bookmarks.length}</span>{" "}
                    {selectedSubject} bookmark{bookmarksData.bookmarks.length !== 1 ? "s" : ""}
                  </>
                ) : (
                  <>
                    <span className="text-white/30">{bookmarksData.pagination.total}</span>{" "}
                    total bookmark{bookmarksData.pagination.total !== 1 ? "s" : ""}
                  </>
                )}
              </p>

              {bookmarksData.pagination.totalPages > 1 && (
                <p className="text-[10px] text-white/10">
                  Page {page} of {bookmarksData.pagination.totalPages}
                </p>
              )}
            </div>

            {/* Card list */}
            <LayoutGroup>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={`${selectedSubject}-${page}`}
                className="space-y-3"
              >
                {bookmarksData.bookmarks.map((bookmark) => (
                  <motion.div
                    key={bookmark.id}
                    variants={itemVariants}
                    layout
                  >
                    <BookmarkCard
                      bookmark={bookmark}
                      onReview={handleReview}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </LayoutGroup>

            {/* Pagination */}
            <PaginationBar
              page={page}
              totalPages={bookmarksData.pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </LearnerShell>
  );
}
