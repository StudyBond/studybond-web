"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { useBookmarks } from "@/features/bookmarks/hooks/use-bookmarks";
import { CapacityGauge } from "@/features/bookmarks/components/capacity-gauge";
import { SubjectFilter } from "@/features/bookmarks/components/subject-filter";
import { BookmarkCard } from "@/features/bookmarks/components/bookmark-card";
import { BookmarkEmptyState } from "@/features/bookmarks/components/bookmark-empty-state";
import { BookmarkExamLauncher } from "@/features/bookmarks/components/bookmark-exam-launcher";
import { Bookmark, Loader2 } from "lucide-react";
import { ExamSecurityOverlay } from "@/features/exam/components/exam-security-overlay";
import { useExamGuard } from "@/features/exam/hooks/use-exam-guard";
import { useReportViolationMutation } from "@/features/exam/hooks/use-exam-mutations";
import { BookmarkReviewModal } from "@/features/bookmarks/components/bookmark-review-modal";
import { motion } from "framer-motion";

export function BookmarksPageClient() {
  const critical = useDashboardCriticalData();
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [reviewingBookmarkId, setReviewingBookmarkId] = useState<number | null>(null);

  const reportViolation = useReportViolationMutation();

  const { guardState, dismissViolation } = useExamGuard({
    mode: "review",
    onViolation: (type, metadata) => {
      reportViolation.mutate({ examId: 0, violationType: type, metadata });
    },
    enabled: true,
  });

  const { data: bookmarksData, isLoading, isError, error } = useBookmarks({
    page,
    limit: 20,
    subject: selectedSubject,
  });

  // Extract unique subjects from bookmarks for the filter
  const availableSubjects = useMemo(() => {
    if (!bookmarksData?.bookmarks) return [];
    const subjects = new Set(bookmarksData.bookmarks.map((b) => b.question.subject));
    return Array.from(subjects).sort();
  }, [bookmarksData]);

  if (critical.isLoading) {
    return (
      <LearnerShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-accent)] opacity-50" />
        </div>
      </LearnerShell>
    );
  }

  if (critical.isError || !critical.profile.data) {
    return (
      <LearnerShell>
        <div className="p-8 text-center text-red-400/80">Failed to load essential data.</div>
      </LearnerShell>
    );
  }

  const isPremium = critical.stats.data?.isPremium ?? false;

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
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--sb-accent)]/[0.08] text-[var(--sb-accent)] shadow-[0_0_20px_var(--sb-accent-glow)]">
            <Bookmark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Study Vault</h1>
            <p className="text-sm text-white/30 font-medium">Your saved questions for focused review</p>
          </div>
        </div>

        {/* Bento Grid Header */}
        {bookmarksData?.limits && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            <CapacityGauge limits={bookmarksData.limits} />
            <BookmarkExamLauncher
              bookmarkCount={bookmarksData.limits.activeBookmarks}
              isPremium={isPremium}
              availableSubjects={availableSubjects}
            />
          </div>
        )}

        {/* Subject Filter */}
        {availableSubjects.length > 0 && (
          <SubjectFilter
            subjects={availableSubjects}
            selected={selectedSubject}
            onSelect={(s) => { setSelectedSubject(s); setPage(1); }}
          />
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex h-[30vh] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-white/20" />
          </div>
        ) : isError ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.02] p-6 text-center">
            <div className="space-y-2">
              <p className="text-red-400 font-bold text-sm">Failed to load bookmarks</p>
              <p className="text-red-400/60 text-xs">{error instanceof Error ? error.message : "Unknown error"}</p>
            </div>
          </div>
        ) : !bookmarksData?.bookmarks.length ? (
          <BookmarkEmptyState />
        ) : (
          <div className="space-y-4">
            {/* Bookmark Cards list with stagger container animation */}
            <motion.div 
              className="grid grid-cols-1 gap-4"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.05
                  }
                }
              }}
            >
              {bookmarksData.bookmarks.map((bookmark) => (
                <motion.div
                  key={bookmark.id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    show: { opacity: 1, y: 0, transition: { type: "spring", damping: 20 } }
                  }}
                >
                  <BookmarkCard 
                    bookmark={bookmark} 
                    onReview={(id) => setReviewingBookmarkId(id)}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {bookmarksData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/30 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-xs text-white/20 px-3">
                  {page} / {bookmarksData.pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(bookmarksData.pagination.totalPages, p + 1))}
                  disabled={page >= bookmarksData.pagination.totalPages}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/30 bg-white/[0.02] hover:bg-white/[0.05] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </LearnerShell>
  );
}
