"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { ExamSecurityOverlay } from "@/features/exam/components/exam-security-overlay";
import { useExamGuard } from "@/features/exam/hooks/use-exam-guard";
import { getDashboardHome, homeKeys } from "@/features/home/api";
import { priceLine } from "@/features/home/format";
import { caveat } from "@/features/home/home-fonts";
import { BookmarkIcon, ChevronLeft } from "@/features/home/icons";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { getBookmarks } from "@/lib/api/bookmarks";
import { startBookmarkExam } from "@/lib/api/exams";
import { getUserProfile } from "@/lib/api/users";
import { BOOKMARK_EXAM_MIN_QUESTIONS, evaluateBookmarkExamGate } from "@/lib/utils/bookmark-exam-gate";
import { cn } from "@/lib/utils/cn";

import s from "../vault.module.css";
import { VaultCard } from "./vault-card";
import { VaultReview } from "./vault-review";

/*
 * Study vault (canvas 94g6nUXE…, boards 2a / 2b): a box of question cards.
 * The box strip shows every space (20 free, 50 premium); amber ones expire
 * within soonDays. Two jobs: "Go through them" (one card at a time, free for
 * all, approved 2026-11-26) and "Make a paper" (premium, 20+ saved).
 */

const PAGE_SIZE = 20;
const PLAN = "/dashboard/settings?tab=subscription" as Route;

export function BookmarksPageClient() {
  const router = useRouter();
  const profile = useQuery({ queryKey: ["dashboard", "profile"], queryFn: getUserProfile, retry: 1 });
  const home = useQuery({ queryKey: homeKeys.home, queryFn: getDashboardHome, staleTime: 30_000, retry: 1 });
  const examProfile = useExamProfile();
  const subjects = examProfile.data?.subjects ?? [];
  const [tab, setTab] = useState<string | null>(null);
  const [sort, setSort] = useState<"soon" | "new">("soon");
  const [reviewing, setReviewing] = useState(false);
  const [starting, setStarting] = useState(false);
  const { guardState, dismissViolation } = useExamGuard({ mode: "review", enabled: true });

  const list = useInfiniteQuery({
    queryKey: ["bookmarks", "vault", tab, sort],
    queryFn: ({ pageParam }) => getBookmarks({ page: pageParam, limit: PAGE_SIZE, subject: tab ?? undefined, sort }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined),
  });

  const first = list.data?.pages[0];
  const cards = useMemo(() => list.data?.pages.flatMap((p) => p.bookmarks) ?? [], [list.data]);
  const limits = first?.limits;
  const summary = first?.summary;
  const saved = limits?.activeBookmarks ?? 0;
  const max = limits?.maxBookmarks ?? 0;
  const premium = limits?.accessTier === "PREMIUM";
  const soonDays = summary?.soonDays ?? 3;
  const soon = Math.min(summary?.goingSoon ?? 0, saved);
  const full = !!limits && limits.remainingBookmarks === 0;
  const empty = !!first && saved === 0;
  const gate = evaluateBookmarkExamGate(saved, premium);
  const plan = home.data?.plan;
  const tabCount = tab ? summary?.subjects.find((x) => x.subject === tab)?.count ?? first?.pagination.total ?? 0 : saved;

  async function makePaper() {
    setStarting(true);
    try {
      const session = await startBookmarkExam(tab ? { subject: tab } : undefined);
      router.push(`/exams/${session.examId}`);
    } catch (err: unknown) {
      toast.error((err instanceof Error && err.message) || "The paper didn't start. Try again.");
      setStarting(false);
    }
  }

  const topBar = (
    <div className={cn("sb-ui", s.bar)}>
      <Link href={"/dashboard/me" as Route} className={s.barBack} aria-label="Back to Me"><ChevronLeft /></Link>
      <h1>Study vault</h1>
    </div>
  );

  return (
    <LearnerShell profile={profile.data} isPremium={home.data?.plan.isPremium ?? profile.data?.isPremium ?? false} mobileTopBar={topBar}>
      <ExamSecurityOverlay guardState={guardState} onDismiss={dismissViolation} mode="review" />
      <div className={cn("sb-ui", s.root, caveat.variable)}>
        <div className={s.title}>
          <h1>Study vault</h1>
          <p>Questions you saved to come back to. Each one stays {limits?.expiryDays ?? 30} days.</p>
        </div>

        {list.isLoading ? <div className={s.cards}><div className={s.skel} /><div className={s.skel} /></div> : null}
        {list.isError && !first ? (
          <div className={s.noHit}>
            Your vault didn&rsquo;t load. Check your connection.
            <div className={s.more}><button type="button" className={cn(s.btn, s.btn2)} onClick={() => list.refetch()}>Try again</button></div>
          </div>
        ) : null}

        {empty ? (
          <div className={s.empty}>
            <div className={s.emptyBox} aria-hidden="true"><i /><i /><i /></div>
            <h3>Nothing saved yet</h3>
            <p>Save the questions that caught you. They wait here for {limits?.expiryDays ?? 30} days, with the answer and the full explanation.</p>
            <ul className={s.steps}>
              <li>
                <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 21V4h11l-2 4 2 4H5" /></svg></span>
                <div><b>Flag it during a paper.</b> Flagged questions are saved when you send the paper.</div>
              </li>
              <li>
                <span><BookmarkIcon /></span>
                <div><b>Or save it from your results.</b> Tap the bookmark on any answer.</div>
              </li>
            </ul>
            <Link href={"/dashboard/history" as Route} className={s.btn}>Open your past papers</Link>
          </div>
        ) : null}

        {first && !empty ? (
          <>
            <div className={s.top}>
              <section className={s.box} aria-label="Spaces in your vault">
                <div className={s.boxTop}>
                  <h2>{saved} <small>saved</small></h2>
                  <span className={full ? s.full : undefined}>{full ? `Full: ${saved} of ${max}` : `${max - saved} space${max - saved === 1 ? "" : "s"} left`}</span>
                </div>
                <div className={s.slots} role="img" aria-label={`${saved} of ${max} spaces used, ${soon} going within ${soonDays} days`}>
                  {Array.from({ length: max }, (_, i) => <i key={i} className={i < soon ? s.soon : i < saved ? "" : s.free} />)}
                </div>
                <div className={s.boxFoot}>
                  <span>Amber goes within {soonDays} days <b>· {soon}</b></span>
                  {!premium ? <Link href={PLAN}>Get 50 spaces</Link> : null}
                </div>
              </section>

              <div className={s.jobs}>
                <div className={s.job}>
                  <b>Go through them</b>
                  <p>One card at a time. The answer stays hidden until you pick.</p>
                  <button type="button" className={cn(s.btn, s.btn2)} onClick={() => setReviewing(true)}>Start</button>
                </div>
                {gate.status === "UNLOCKED" ? (
                  <div className={cn(s.job, s.jobGo)}>
                    <b>Make a paper</b>
                    <p>{tab ? `Your ${tab} cards as one timed paper.` : `All ${saved} as one timed paper, or pick a subject first.`}</p>
                    <button type="button" className={s.btn} onClick={makePaper} disabled={starting} aria-busy={starting}>
                      {starting ? "Starting…" : tab ? `Make a ${tab} paper` : "Make a paper"}
                    </button>
                  </div>
                ) : gate.status === "LOCKED_INSUFFICIENT" ? (
                  <div className={s.job}>
                    <b>Make a paper</b>
                    <p>Save {BOOKMARK_EXAM_MIN_QUESTIONS - saved} more to turn them into a timed paper.</p>
                    <div className={s.prog} aria-hidden="true">
                      {Array.from({ length: BOOKMARK_EXAM_MIN_QUESTIONS }, (_, i) => <i key={i} className={i < saved ? s.on : ""} />)}
                    </div>
                  </div>
                ) : (
                  <div className={cn(s.job, s.jobGo)}>
                    <b>Make a paper</b>
                    <p>A timed paper from your saved questions comes with premium{plan ? `: ${priceLine(plan.priceNaira, plan.durationMonths)}` : ""}.</p>
                    <Link href={PLAN} className={cn(s.btn, s.btn2)}>See premium</Link>
                  </div>
                )}
              </div>
            </div>

            <div className={s.tabs} role="tablist" aria-label="Subject">
              <button type="button" role="tab" className={cn(s.tab, !tab && s.tabOn)} aria-selected={!tab} onClick={() => setTab(null)}>All <i>{saved}</i></button>
              {(summary?.subjects ?? []).map((x) => (
                <button key={x.subject} type="button" role="tab" className={cn(s.tab, tab === x.subject && s.tabOn)} aria-selected={tab === x.subject} onClick={() => setTab(x.subject)}>
                  {x.subject} <i>{x.count}</i>
                </button>
              ))}
            </div>
            <div className={s.sortRow}>
              <span>{sort === "soon" ? "The ones going first are on top" : "Last saved on top"}</span>
              <div className={s.seg} role="group" aria-label="Order">
                <button type="button" className={sort === "soon" ? s.segOn : undefined} aria-pressed={sort === "soon"} onClick={() => setSort("soon")}>Going soon</button>
                <button type="button" className={sort === "new" ? s.segOn : undefined} aria-pressed={sort === "new"} onClick={() => setSort("new")}>Newest</button>
              </div>
            </div>

            <div className={s.cards}>
              {cards.length === 0 && !list.isFetching ? <p className={s.noHit}>Nothing saved in this subject yet.</p> : null}
              {cards.map((b) => <VaultCard key={b.id} bookmark={b} subjects={subjects} soonDays={soonDays} />)}
            </div>
            {list.hasNextPage ? (
              <div className={s.more}>
                <button type="button" className={cn(s.btn, s.btn2)} onClick={() => list.fetchNextPage()} disabled={list.isFetchingNextPage}>
                  {list.isFetchingNextPage ? "Loading…" : "Show more"}
                </button>
              </div>
            ) : null}
            <p className={s.endNote}>
              {full
                ? premium
                  ? "Your vault is full. A new save won't fit until you take one out or one runs out."
                  : "Your vault is full. Take one out, wait for one to run out, or go premium for 50 spaces."
                : `Showing ${cards.length} of ${tabCount}.`}
            </p>
          </>
        ) : null}
      </div>

      {reviewing ? <VaultReview subject={tab} subjects={subjects} soonDays={soonDays} onClose={() => setReviewing(false)} /> : null}
    </LearnerShell>
  );
}
