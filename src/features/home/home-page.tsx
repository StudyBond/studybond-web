"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { SubjectIcon, subjectPalette } from "@/components/ui/subject-icon";
import { Avatar } from "@/features/avatar/components/avatar";
import { useMyAvatar } from "@/features/avatar/hooks/use-my-avatar";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDuelHome } from "@/features/duel/hooks/use-duel-play";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { getLeaderboardBoard, type LeaderboardBoard } from "@/lib/api/leaderboard";
import { getUserProfile } from "@/lib/api/users";
import { cn } from "@/lib/utils/cn";

import type { DashboardHome, RecentPaper, SubjectRef } from "./api";
import { BoardSheet } from "./board-sheet";
import {
  boardLabel, dayGap, dayList, dayMonth, daysHours, greeting, hoursMinutes, lagosKey, lagosTime, monthName,
  nextFreezeDay, ordinal, paperTitle, priceLine, shortDate, thousands, weekday, whenLine,
} from "./format";
import { caveat } from "./home-fonts";
import {
  BookmarkIcon, BrokenLinkIcon, CardIcon, ChallengeIcon, ChevronDown, ChevronRight, CrossIcon,
  FreezeIcon, OfflineIcon, SwordsIcon, TickIcon,
} from "./icons";
import { useHome } from "./use-home";
import { WordsCard } from "./words-card";
import s from "./home.module.css";

const LAST_USER_KEY = "sb-home-last-user";
const PRACTICE = "/dashboard/practice" as Route;
const CHALLENGE = "/dashboard/practice?mode=DAILY_CHALLENGE" as Route;
const PLAN = "/dashboard/settings?tab=subscription" as Route;
const NEED_NET = "You need internet to start a paper. The rest of this page is from your last visit.";

function readLastUser(): number | null {
  try {
    const raw = window.localStorage.getItem(LAST_USER_KEY);
    return raw ? Number(raw) || null : null;
  } catch {
    return null;
  }
}

function Subj({ subject, size = 28 }: { subject: SubjectRef; size?: number }) {
  return (
    <span className={s.subj} style={{ width: size, height: size }}>
      <SubjectIcon iconName={subject.iconName} code={subject.code} size={Math.round(size * 0.6)} className={subjectPalette(subject.colorToken).text} />
    </span>
  );
}

/** A start button that explains, offline, that papers need internet. */
function Go({ href, offline, className, children }: { href: Route; offline: boolean; className?: string; children: ReactNode }) {
  if (offline) {
    return (
      <button type="button" className={cn(s.btn, s.btnOff, className)} onClick={() => toast(NEED_NET)}>
        {children}
      </button>
    );
  }
  return <Link href={href} className={cn(s.btn, className)}>{children}</Link>;
}

export function HomePage() {
  const profile = useQuery({ queryKey: ["dashboard", "profile"], queryFn: getUserProfile, retry: 1 });
  const [lastUser] = useState<number | null>(() => (typeof window === "undefined" ? null : readLastUser()));
  useEffect(() => {
    if (profile.data?.id) {
      try {
        window.localStorage.setItem(LAST_USER_KEY, String(profile.data.id));
      } catch {
        // Storage blocked: the page still works online.
      }
    }
  }, [profile.data?.id]);

  const home = useHome(profile.data?.id ?? lastUser);
  const avatar = useMyAvatar();
  const online = !home.offline;
  const race = useQuery({
    queryKey: ["home", "race"],
    queryFn: () => getLeaderboardBoard("WEEKLY", "board", 20),
    enabled: online && Boolean(home.data),
    staleTime: 60_000,
    retry: 1,
  });
  const duel = useDuelHome(online && Boolean(home.data));
  const examProfile = useExamProfile();
  const [boardsOpen, setBoardsOpen] = useState(false);

  const data = home.data;
  const look = avatar.data?.avatar ?? null;

  const topBar = (
    <TopBar
      data={data}
      look={look}
      onBoards={() => setBoardsOpen(true)}
      boardName={data ? boardLabel(data.board) : examProfile.data ? boardLabel({ code: examProfile.data.institution.code, examName: examProfile.data.trackName ?? "" }) : "Your board"}
    />
  );

  return (
    <LearnerShell
      isPremium={data?.plan.isPremium ?? false}
      profile={profile.data}
      mobileTopBar={topBar}
      planText={data ? planLine(data) : undefined}
    >
      <div className={cn("sb-ui", s.root, caveat.variable)}>
        <div className={s.page}>
          {data ? (
            <Loaded
              data={data}
              offline={home.offline}
              savedAt={home.savedAt}
              skewMs={home.skewMs}
              race={race.data ?? null}
              duel={duel.data ?? null}
              firstPaper={examProfile.data ?? null}
            />
          ) : home.error && !home.loading ? (
            <div className={s.offbar} role="alert">
              <OfflineIcon />
              <span>
                <b>We couldn&apos;t load your page.</b> Check your connection.{" "}
                <button type="button" className={s.try} onClick={home.refetch}>Try again</button>
              </span>
            </div>
          ) : (
            <Loading slow={home.slow} />
          )}
        </div>
      </div>
      {boardsOpen ? <BoardSheet currentCode={data?.board.code ?? examProfile.data?.institution.code ?? null} onClose={() => setBoardsOpen(false)} /> : null}
    </LearnerShell>
  );
}

function TopBar({ data, look, onBoards, boardName }: {
  data: DashboardHome | null;
  look: Parameters<typeof Avatar>[0]["look"];
  onBoards: () => void;
  boardName: string;
}) {
  const st = data?.streak;
  const brandNew = !data || (data.nextUp.kind === "FIRST_PAPER" && (st?.longest ?? 0) === 0 && !data.broken);
  const broke = st?.status === "BROKEN";
  const ticked = Boolean(st?.studiedToday);
  return (
    <div className={cn("sb-ui", s.top)}>
      <button type="button" className={s.boardBtn} onClick={onBoards}>
        {boardName}
        <ChevronDown />
      </button>
      {!brandNew && st ? (
        <Link
          href={"/dashboard/streak" as Route}
          className={cn(s.streak, broke ? s.streakBroke : !ticked && s.streakOpen)}
          aria-label={`Your streak: ${st.count} days, ${ticked ? "today is ticked" : "today not ticked yet"}`}
        >
          <span className={s.stMark}>{broke ? <CrossIcon /> : <TickIcon />}</span>
          <span><b>{st.count}</b> days</span>
        </Link>
      ) : null}
      <NotificationBell mobile />
      <Link href={"/dashboard/me" as Route} className={s.meLink} aria-label="Me: your profile and settings">
        <span className={cn(s.meRing, !data?.plan.isPremium && s.meRingFree)}>
          <Avatar look={look} size={32} />
        </span>
      </Link>
    </div>
  );
}

function Loading({ slow }: { slow: boolean }) {
  return (
    <div aria-busy="true">
      <span className={cn(s.sk, s.skLine)} style={{ width: "60%", height: 26 }} />
      <span className={cn(s.sk, s.skLine)} style={{ width: "78%" }} />
      <span className={cn(s.sk, s.skChip)} />
      <span className={cn(s.sk, s.skNext)} aria-hidden="true" />
      <div className={s.skCard} aria-hidden="true">
        <span className={cn(s.sk, s.skLine)} style={{ width: "34%", margin: "0 0 12px" }} />
        {[70, 55, 62].map((w) => (
          <div key={w} className={s.skRow}><span className={s.sk} /><span className={cn(s.sk, s.skLine)} style={{ margin: 0, width: `${w}%` }} /><span /></div>
        ))}
      </div>
      <div className={s.skCard} aria-hidden="true">
        <span className={cn(s.sk, s.skLine)} style={{ width: "30%", margin: "0 0 12px" }} />
        {[60, 48, 52, 44].map((w) => (
          <div key={w} className={s.skRow}><span className={s.sk} /><span className={cn(s.sk, s.skLine)} style={{ margin: 0, width: `${w}%` }} /><span className={cn(s.sk, s.skLine)} style={{ margin: 0 }} /></div>
        ))}
      </div>
      {slow ? <p className={s.slow} role="status"><i />Still loading. Your connection is slow, so this may take a moment.</p> : null}
    </div>
  );
}

type FirstPaperProfile = { subjects: Array<{ questionCount: number; soloDurationSeconds: number; isCompulsory: boolean }> } | null;

function Loaded({ data, offline, savedAt, skewMs, race, duel, firstPaper }: {
  data: DashboardHome;
  offline: boolean;
  savedAt: string | null;
  skewMs: number;
  race: LeaderboardBoard | null;
  duel: ReturnType<typeof useDuelHome>["data"] | null;
  firstPaper: FirstPaperProfile;
}) {
  const [now, setNow] = useState(() => Date.now() + skewMs);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now() + skewMs), 30_000);
    return () => window.clearInterval(timer);
  }, [skewMs]);

  const { streak, plan, nextUp, challenge } = data;
  const today = data.clock.date;
  const isChallengeNext = nextUp.kind === "RESCUE" || nextUp.kind === "BROKEN" || nextUp.kind === "PREMIUM_ENDED";
  const challengeOpen = challenge.state === "OPEN" || challenge.state === "IN_PROGRESS";
  const chalCount = challenge.subjects.length || data.board.maxSubjects;
  const chalMax = 8 + 8 * chalCount;
  const myRank = race?.me.rank ?? null;
  const position = myRank && race ? `${ordinal(myRank)} of ${thousands(race.totalParticipants)}` : null;
  const premiumEndedRecently = !plan.isPremium && plan.endedAt !== null && dayGap(lagosKey(plan.endedAt), today) <= 7;

  /* Hello line */
  let helloLine: ReactNode;
  const sp = `${thousands(data.student.weeklySp)} SP this week`;
  if (nextUp.kind === "FIRST_PAPER" && streak.longest === 0) helloLine = "Welcome to StudyBond. Your first paper sets up everything below.";
  else if (data.broken) helloLine = <>{sp}{position ? `, ${position.split(" of ")[0]} on the board` : ""}.</>;
  else if (streak.count > 0 && streak.studiedToday) helloLine = <>Day {streak.count} of your run. {sp}<span className={s.posWide}>{position ? `, ${position}` : ""}</span>.</>;
  else if (streak.count > 0) helloLine = <>{streak.count}-day run, and today isn&rsquo;t ticked yet. {sp}<span className={s.posWide}>{position ? `, ${position}` : ""}</span>.</>;
  else helloLine = <>{sp}<span className={s.posWide}>{position ? `, ${position}` : ""}</span>.</>;

  /* Plan chip */
  const planText = planLine(data);
  const planCls = plan.isPremium ? (plan.endingSoon ? s.planWarn : "") : s.planFree;

  return (
    <>
      {offline ? (
        <div className={s.offbar} role="status">
          <OfflineIcon />
          <span><b>You&rsquo;re offline.</b> {savedAt ? `This is your page from ${lagosTime(savedAt)}. ` : ""}Papers need internet.</span>
        </div>
      ) : null}

      <header className={s.head}>
        <div className={s.hello}>
          <h1>{greeting(data.clock.hour, data.student.firstName)}</h1>
          <p>{helloLine}</p>
          <span className={cn(s.plan, s.planChip, planCls)}>{planText}</span>
        </div>
        <WeekStrip data={data} />
      </header>

      <div className={s.cols}>
        <div className={cn(s.col, s.colGap)}>
          {streak.freezeMissedDate && !streak.rescue && !streak.studiedToday ? (
            <div className={cn(s.notice, s.o1)}>
              <FreezeIcon />
              <span><b>You missed {weekday(streak.freezeMissedDate)}.</b> Study today and your streak freeze covers it, so your run goes on to day {streak.count + 1}.</span>
            </div>
          ) : null}

          {nextUp.kind === "BROKEN" && data.broken ? (
            <BrokenCard data={data} offline={offline} />
          ) : (
            <NextUp data={data} offline={offline} now={now} firstPaper={firstPaper} />
          )}

          {challengeOpen && !isChallengeNext ? (
            <Link href={offline ? ("/dashboard" as Route) : CHALLENGE} className={cn(s.line, s.o3)} onClick={offline ? (e) => { e.preventDefault(); toast(NEED_NET); } : undefined}>
              <span className={s.ic}><ChallengeIcon /></span>
              <span className={s.t}>
                <b>Today&rsquo;s challenge</b>
                <small>{chalCount} questions · 3 min · up to {chalMax} SP</small>
              </span>
              <span className={cn(s.pill, s.pillGo)}>{challenge.state === "IN_PROGRESS" ? "Resume" : "Start"}</span>
            </Link>
          ) : null}

          {plan.isPremium && plan.endingSoon && plan.endsAt ? (
            <Link href={PLAN} className={cn(s.line, s.o4)}>
              <span className={s.ic}><CardIcon /></span>
              <span className={s.t}>
                <b>Premium ends on {shortDate(lagosKey(plan.endsAt))}</b>
                <small>{plan.daysLeft} day{plan.daysLeft === 1 ? "" : "s"} left · ₦{thousands(plan.priceNaira)} to renew</small>
              </span>
              <span className={cn(s.pill, s.pillGo)}>Renew</span>
            </Link>
          ) : null}

          {nextUp.kind === "PREMIUM_ENDED" ? (
            <section className={cn(s.renew, s.o5)}>
              <b>Renew premium · {priceLine(plan.priceNaira, plan.durationMonths)}</b>
              <p>Your report card, streak, saved questions and duel record are all still here. Renew to open every subject again.</p>
              <Link href={PLAN} className={s.btn}>Renew premium</Link>
            </section>
          ) : null}

          <div className={s.o7}>
            <ReportCard data={data} position={position} />
          </div>

          <div className={s.o11}>
            <RecentPapers papers={data.recentPapers} today={today} subjects={[...data.report.subjects, ...data.challenge.subjects, ...data.report.emptySubjects]} />
          </div>
        </div>

        <div className={cn(s.col, s.colGap)}>
          <WordsCard className={s.o6} />

          <ExamDateCard data={data} />

          <RematchCard duel={duel} isPremium={plan.isPremium} now={now} />

          <div className={s.o8}>
            <Race race={race} now={now} />
          </div>

          <div className={s.o12}>
            <MonthCard data={data} />
          </div>

          <div className={s.o13}>
            {challenge.state === "DONE" || challenge.state === "CLOSED" ? (
              <div className={s.line}>
                <span className={s.ic}><ChallengeIcon /></span>
                <span className={s.t}>
                  <b>Today&rsquo;s challenge</b>
                  <small>
                    {challenge.state === "DONE"
                      ? `${challenge.right ?? 0} of ${challenge.total ?? chalCount} right · a new one at midnight`
                      : "Time ran out · a new one at midnight"}
                  </small>
                </span>
                <span className={cn(s.pill, challenge.state === "DONE" ? s.pillOk : s.pillDim)}>
                  {challenge.state === "DONE" ? `Done · +${challenge.spEarned ?? 0} SP` : "Closed"}
                </span>
              </div>
            ) : null}
            {plan.isPremium || premiumEndedRecently ? (
              <Link href={"/dashboard/bookmarks" as Route} className={s.line}>
                <span className={s.ic}><BookmarkIcon /></span>
                <span className={s.t}>
                  <b>Study vault</b>
                  <small>{data.vault.saved > 0 ? `${data.vault.saved} saved question${data.vault.saved === 1 ? "" : "s"}. Turn them into a paper.` : "Questions you save to practise later"}</small>
                </span>
                <ChevronRight className={s.chev} />
              </Link>
            ) : null}
          </div>

          {!plan.isPremium && !premiumEndedRecently ? (
            <section className={cn(s.prem, s.o14)}>
              <b>Premium · {priceLine(plan.priceNaira, plan.durationMonths)}</b>
              <p>Unlimited papers on every subject, the whole question bank, duels on full papers, and your full report card.</p>
              <Link href={PLAN} className={s.btn}>See premium</Link>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}

/** "Premium · 112 days left", "Premium ended yesterday", "2 of 4 free subjects left" */
function planLine(data: DashboardHome): string {
  const { plan } = data;
  const today = data.clock.date;
  const endedRecently = !plan.isPremium && plan.endedAt !== null && dayGap(lagosKey(plan.endedAt), today) <= 7;
  if (plan.isPremium) return `Premium · ${plan.daysLeft ?? 0} day${plan.daysLeft === 1 ? "" : "s"} left`;
  if (endedRecently && plan.endedAt) {
    return dayGap(lagosKey(plan.endedAt), today) <= 1 ? "Premium ended yesterday" : `Premium ended on ${shortDate(lagosKey(plan.endedAt))}`;
  }
  return plan.freeSubjectsLeft !== null && plan.freeSubjectsLeft > 0
    ? `${plan.freeSubjectsLeft} of ${plan.freeSubjectsTotal} free subjects left`
    : "Free plan";
}

/* ── Laptop week strip (Mon to Sun) ── */
function WeekStrip({ data }: { data: DashboardHome }) {
  const today = data.clock.date;
  const dow = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7;
  const studied = new Set(data.month.studied);
  const frozen = new Set(data.month.frozen);
  const days = Array.from({ length: 7 }, (_, i) => {
    const key = new Date(Date.parse(`${today}T00:00:00Z`) + (i - dow) * 86_400_000).toISOString().slice(0, 10);
    const n = Number(key.slice(8, 10));
    const cls = studied.has(key) ? s.dayDone : frozen.has(key) ? s.dayFreeze : key === today ? s.dayToday : key > today ? s.dayLater : "";
    return { key, n, cls, label: "MTWTFSS"[i], done: studied.has(key), frz: frozen.has(key) };
  });
  return (
    <div className={s.week} aria-label="This week">
      {days.map((d, i) => (
        <div key={d.key} className={cn(s.day, d.cls)}>
          <span className={s.mark} style={{ animationDelay: `${i * 60}ms` }}>
            {d.done ? <TickIcon /> : d.frz ? <FreezeIcon /> : <span className={s.num}>{d.n}</span>}
          </span>
          {d.label}
        </div>
      ))}
    </div>
  );
}

/* ── Next up ── */
function NextUp({ data, offline, now, firstPaper }: { data: DashboardHome; offline: boolean; now: number; firstPaper: FirstPaperProfile }) {
  const { nextUp, streak, challenge, plan } = data;
  const chalCount = challenge.subjects.length || data.board.maxSubjects;
  const challengeAvailable = challenge.state === "OPEN" || challenge.state === "IN_PROGRESS";
  let kicker = "Next up";
  let title = "";
  let body = "";
  let btn = "";
  let href: Route = CHALLENGE;
  let showSubjects = false;
  let left: string | null = null;

  if (nextUp.kind === "RESCUE") {
    kicker = "Save your streak";
    left = hoursMinutes(Date.parse(data.clock.dayEndsAt) - now);
    title = `Your ${streak.count}-day streak ends at midnight`;
    if (!challengeAvailable) {
      body = `You haven’t studied today. Finish any paper before midnight to tick day ${streak.count + 1}.`;
      btn = "Start a paper";
      href = PRACTICE;
    } else {
      body = streak.freezeMissedDate
        ? `You missed ${weekday(streak.freezeMissedDate)}. Study today and your streak freeze covers it. Today’s challenge takes 3 minutes.`
        : `You haven’t studied today. Today’s challenge takes 3 minutes, and finishing it ticks day ${streak.count + 1}.`;
      btn = "Start today’s challenge";
      showSubjects = true;
    }
  } else if (nextUp.kind === "PREMIUM_ENDED") {
    const endedDay = plan.endedAt ? lagosKey(plan.endedAt) : data.clock.date;
    const when = dayGap(endedDay, data.clock.date) <= 1 ? "yesterday" : `on ${shortDate(endedDay)}`;
    title = "Today’s challenge is still free";
    body = `Your premium ended ${when}, but the daily challenge is free for everyone. ${chalCount} questions in 3 minutes, and it ${streak.count > 0 ? `keeps your ${streak.count}-day run going` : "ticks today"}.`;
    btn = "Start today’s challenge";
    showSubjects = true;
  } else if (nextUp.kind === "FIRST_PAPER") {
    const sample = firstPaper?.subjects.find((x) => !x.isCompulsory) ?? firstPaper?.subjects[0];
    title = "Start with one subject";
    body = sample
      ? `Pick the subject you feel best in. A ${sample.questionCount}-question paper takes about ${Math.round(sample.soloDurationSeconds / 60)} minutes, and your report card starts filling in right after.`
      : "Pick the subject you feel best in. Your report card starts filling in right after your first paper.";
    btn = "Start my first paper";
    href = PRACTICE;
  } else {
    const w = nextUp.weakest;
    href = PRACTICE;
    if (!w) {
      title = "Start a paper";
      body = "Any finished paper adds to your report card.";
      btn = "Start a paper";
    } else if (!plan.isPremium) {
      /* Free credits can't sit the same subject twice, so a free student is
         pointed at a new subject or the free daily challenge, never at a
         second paper of the same subject. */
      if (plan.freeSubjectsLeft && plan.freeSubjectsLeft > 0) {
        title = `${w.name} needs another look`;
        body = `You scored ${w.average}% on ${w.papers === 1 ? "your first" : `your last ${w.papers}`} ${w.name} paper${w.papers === 1 ? "" : "s"}. You have ${plan.freeSubjectsLeft} free subject${plan.freeSubjectsLeft === 1 ? "" : "s"} left for a subject you haven’t tried.`;
        btn = "Pick a subject";
      } else {
        title = `${w.name} needs another look`;
        body = `You scored ${w.average}% on ${w.papers === 1 ? "your first" : `your last ${w.papers}`} ${w.name} paper${w.papers === 1 ? "" : "s"}. More ${w.name} papers come with premium. Today’s challenge is free, with one question from each subject.`;
        btn = "Start today’s challenge";
        href = CHALLENGE;
      }
    } else {
      title = `${w.name} is pulling you down`;
      body = `${w.average}% ${w.papers === 1 ? `on your only ${w.name} paper` : `over your last ${w.papers} ${w.name} papers`}${data.report.waecGrades ? `, a ${w.grade}` : ""}. One ${w.paperQuestions}-question paper takes about ${w.paperMinutes} minutes.`;
      btn = `Start a ${w.name} paper`;
    }
  }

  return (
    <section className={cn(s.next, s.o2)} aria-label="Next up">
      <div>
        <div className={s.kRow}>
          <span className={s.k}><i />{kicker}</span>
          {left ? <span className={s.left}>{left} left</span> : null}
        </div>
        <h2>{title}</h2>
        <p>{body}</p>
        {showSubjects && challenge.subjects.length > 0 ? (
          <div className={s.qs}>
            <span className={s.ics}>{challenge.subjects.map((sub) => <Subj key={sub.code} subject={sub} size={24} />)}</span>
            1 question from each subject
          </div>
        ) : null}
      </div>
      <div className={s.row}>
        <Go href={href} offline={offline} className={s.grow}>{btn}</Go>
        <Link href={PRACTICE} className={s.ghost}>Something else</Link>
      </div>
    </section>
  );
}

/* ── Streak just broke (16j) ── */
function BrokenCard({ data, offline }: { data: DashboardHome; offline: boolean }) {
  const broken = data.broken!;
  const missed = broken.missedDates;
  return (
    <section className={cn(s.broke, s.o2)} aria-label="Your streak ended">
      <div className={s.brK}><BrokenLinkIcon />Streak ended</div>
      <h2>Your {broken.length}-day streak ended</h2>
      <div className={s.runline} aria-hidden="true">
        <div className={cn(s.rlGrp, s.rlRun)}>
          <div className={s.rlDots} style={{ gridTemplateColumns: `repeat(${Math.max(broken.days.length, 1)}, minmax(0, 1fr))` }}>
            {broken.days.map((d, i) => (
              <span key={d.date} className={cn(s.rl, d.kind === "FREEZE" ? s.rlFz : s.rlOn)} style={{ animationDelay: `${120 + i * 40}ms` }}>
                {d.kind === "FREEZE" ? <FreezeIcon /> : <TickIcon />}
              </span>
            ))}
          </div>
          <span className={s.rlLab}>{broken.length} days</span>
        </div>
        <div className={cn(s.rlGrp, s.rlMissGrp)}>
          <span className={cn(s.rl, s.rlMiss)}><CrossIcon /></span>
          <span className={s.rlLab}>{missed.length === 1 ? weekday(missed[0]).slice(0, 3) : `${missed.length} days`}</span>
        </div>
        <div className={cn(s.rlGrp, s.rlNowGrp)}>
          <span className={cn(s.rl, s.rlNow)}>1</span>
          <span className={s.rlLab}>Today</span>
        </div>
      </div>
      <p>
        {missed.length === 1
          ? <>You missed <b>{weekday(missed[0])}</b>, and no streak freeze was left to cover it.</>
          : <>You missed <b>{dayList(missed)}</b>. A streak freeze covers one day only.</>}
        {" "}Your longest run is still {data.streak.longest} days.
      </p>
      <div className={s.row}>
        <Go href={CHALLENGE} offline={offline} className={s.grow}>Start a new streak</Go>
        <Link href={PRACTICE} className={s.ghost}>Something else</Link>
      </div>
      <small>Today&rsquo;s challenge: {data.challenge.subjects.length || data.board.maxSubjects} questions, 3 minutes. Finish it and today is day 1.</small>
    </section>
  );
}

/* ── Report card ── */
function gradeClass(grade: string | null) {
  if (!grade) return s.gX;
  if (grade === "A1" || grade.startsWith("B")) return s.gA;
  if (grade.startsWith("C")) return s.gC;
  if (grade === "D7" || grade === "E8") return s.gD;
  return s.gF;
}

function ReportCard({ data, position }: { data: DashboardHome; position: string | null }) {
  const { report } = data;
  const waec = report.waecGrades;
  const graded = report.subjects.filter((x) => x.average !== null);
  const papersTotal = graded.reduce((sum, x) => sum + x.papers, 0);
  const span = report.subjects.length === 0
    ? "Starts after your first paper"
    : graded.every((x) => x.papers === 1)
      ? `From ${papersTotal} paper${papersTotal === 1 ? "" : "s"}`
      : "Last 10 papers in each subject";
  return (
    <>
      <div className={s.h}><h3>Report card</h3><span>{span}</span></div>
      <section className={cn(s.report, !waec && s.pct)} aria-label="Report card">
        {report.subjects.length > 0 ? (
          <>
            <div className={s.rpHead}><b>{data.board.examName} subjects</b><span>{waec ? "Avg · Grade · Trend" : "Avg · Trend"}</span></div>
            <div className={s.rpCols}><span /><span>Subject</span><span>Last 5</span><span>Avg</span><span className={s.gh}>Grade</span><span>Trend</span></div>
            {report.subjects.map((r) => {
              const has = r.average !== null;
              return (
                <div key={r.code} className={cn(s.rpRow, !has && s.rpNone)}>
                  <Subj subject={r} />
                  <span className={s.nm}>
                    <b>{r.name}</b>
                    <small>{has ? (r.papers === 1 ? "1 paper" : `Last ${r.papers} papers`) : "No papers yet"}</small>
                  </span>
                  <span className={s.bars} aria-hidden="true">
                    {r.lastFive.map((v, i) => <i key={i} className={i === r.lastFive.length - 1 ? s.barLast : ""} style={{ height: `${Math.max(12, v)}%` }} />)}
                  </span>
                  <span className={s.avg}>{has ? `${r.average}%` : "—"}</span>
                  <span className={cn(s.grade, gradeClass(r.grade))}>{has ? (waec ? r.grade : `${r.average}`) : "—"}</span>
                  <span className={cn(s.trend, r.trend === null ? s.flat : r.trend > 0 ? s.up : r.trend < 0 ? s.down : s.flat)}>
                    {r.trend === null || !has ? "" : r.trend > 0 ? `+${r.trend}` : r.trend < 0 ? `−${Math.abs(r.trend)}` : "0"}
                  </span>
                </div>
              );
            })}
            <div className={s.rpFoot}>
              <div className={s.pos}><span>Position this week</span><b>{position ?? "Not on the board yet"}</b></div>
              {report.remark ? <div className={s.remark}><span>Remark:</span><p>{report.remark}</p></div> : null}
            </div>
          </>
        ) : (
          <div className={s.rpEmpty}>
            <span className={s.slots}>
              {report.emptySubjects.map((sub) => (
                <div key={sub.code} className={s.slot}><Subj subject={sub} size={32} /><b>{sub.name}</b><span>?</span></div>
              ))}
            </span>
            <b>Your report card fills in after your first paper</b>
            <span className={s.rpEmptyText}>Every subject gets an average and a grade, A1 to F9, just like a school report. It updates after each paper you finish.</span>
          </div>
        )}
      </section>
    </>
  );
}

/* ── Race ── */
function Race({ race, now }: { race: LeaderboardBoard | null; now: number }) {
  if (!race) {
    return (
      <>
        <div className={s.h}><h3>This week&rsquo;s race</h3></div>
        <section className={s.race}><p className={s.raceNote}>Loading the race...</p></section>
      </>
    );
  }
  const me = race.me;
  const closes = race.week ? `closes Sun · ${daysHours(Date.parse(race.week.endsAt) - now)}` : "";
  const above = race.ladder.above;
  const below = race.ladder.below;
  const cutoff = race.meritList.cutoffPoints;
  const rows = [above, me.entry, below].filter((x): x is NonNullable<typeof x> => Boolean(x));
  let note: ReactNode = null;
  if (me.rank && above && me.entry) {
    const gap = above.points - me.points;
    note = <>{gap} SP behind {endSentence(above.displayName)}{below ? ` ${below.displayName} is ${me.points - below.points} SP behind you.` : ""}</>;
  } else if (me.rank === 1) {
    note = <>You&rsquo;re top of this week&rsquo;s board.{below ? ` ${below.displayName} is ${me.points - below.points} SP behind you.` : ""}</>;
  }
  return (
    <>
      <div className={s.h}><h3>This week&rsquo;s race</h3><span className={s.num}>{closes}</span></div>
      <section className={s.race} aria-label="This week's race">
        {me.rank ? (
          <>
            {me.rank > race.meritList.size && cutoff !== null ? <div className={s.cut}>Top {race.meritList.size} line · {thousands(cutoff)} SP</div> : null}
            {rows.map((p) => (
              <div key={p.userId} className={cn(s.rr, p.isCurrentUser && s.rrMe)}>
                <span className={s.rk}>#{p.rank}</span>
                <Avatar look={p.avatar} size={32} />
                <b>{p.isCurrentUser ? "You" : p.displayName}</b>
                <span className={s.sp}>{thousands(p.points)} SP</span>
              </div>
            ))}
            {note ? <p className={s.raceNote}>{note}</p> : null}
          </>
        ) : (
          <p className={s.raceNote}>
            <b>You&rsquo;re not on this week&rsquo;s board yet.</b> Any SP before Sunday puts you on it.
            {race.lastWeek?.cutoffPoints != null ? ` Last week, the top ${race.meritList.size} needed ${thousands(race.lastWeek.cutoffPoints)} SP.` : ""}
          </p>
        )}
      </section>
    </>
  );
}

/** "Amaka E." already ends the sentence; "Amaka" needs a full stop. */
function endSentence(name: string) {
  return name.endsWith(".") ? name : `${name}.`;
}

/* ── Rematch ── */
function RematchCard({ duel, isPremium, now }: { duel: ReturnType<typeof useDuelHome>["data"] | null; isPremium: boolean; now: number }) {
  if (!duel) return null;
  const challenge = duel.incomingChallenges[0];
  if (challenge) {
    const first = challenge.from.fullName.trim().split(/\s+/)[0] ?? "A friend";
    const h = challenge.headToHead;
    const record = h && h.wins + h.losses + h.draws > 0
      ? h.wins > h.losses ? `You lead ${h.wins}–${h.losses}` : h.losses > h.wins ? `${first} leads ${h.losses}–${h.wins}` : `Level at ${h.wins}–${h.losses}`
      : null;
    const hours = challenge.expiresAt ? Math.max(0, Math.round((Date.parse(challenge.expiresAt) - now) / 3_600_000)) : null;
    const meta = [record, challenge.subjects.join(", "), `${challenge.totalQuestions} questions`, hours !== null ? `expires in ${hours}h` : null].filter(Boolean).join(" · ");
    return (
      <section className={cn(s.duel, s.o9)} aria-label="Duel">
        <span className={s.duelRing}><SwordsIcon className={s.chev} /></span>
        <span className={s.t}><b>{challenge.isRematch ? `${first} wants a rematch` : `${first} has challenged you`}</b><small>{meta}</small></span>
        <div className={s.duelActs}>
          <Link href={"/dashboard/duel" as Route} className={cn(s.btn, s.btnBlue)}>See the challenge</Link>
        </div>
      </section>
    );
  }
  if (!isPremium && duel.freeDuel.available) {
    return (
      <section className={cn(s.duel, s.o9)} aria-label="Duel">
        <span className={s.duelRing}><SwordsIcon className={s.chev} /></span>
        <span className={s.t}><b>Your free duel this week</b><small>A 15-question taster. Race a ghost, or send a friend a slip.</small></span>
        <div className={s.duelActs}>
          <Link href={"/dashboard/duel" as Route} className={cn(s.btn, s.btnBlue)}>Pick a duel</Link>
        </div>
      </section>
    );
  }
  return null;
}

/* ── Exam date ── */
function ExamDateCard({ data }: { data: DashboardHome }) {
  const { examDate, board, clock } = data;
  const name = board.examName;
  if (examDate.startsOn) {
    const days = dayGap(clock.date, examDate.startsOn);
    const start = new Date(`${examDate.startsOn}T00:00:00Z`);
    const range = examDate.endsOn && examDate.endsOn !== examDate.startsOn
      ? `${dayMonth(examDate.startsOn)} to ${dayMonth(examDate.endsOn)}`
      : dayMonth(examDate.startsOn);
    return (
      <section className={cn(s.count, s.o10)} aria-label="Exam date">
        <span className={s.calPage} aria-hidden="true">
          <span className={s.calBar}>{monthName(examDate.startsOn.slice(0, 7)).slice(0, 3)} {start.getUTCFullYear()}</span>
          <b>{start.getUTCDate()}</b>
          <span className={s.calSub}>{name}</span>
        </span>
        <span className={s.t}>
          <b>{name} {start.getUTCFullYear()} · {range}</b>
          <small>{days > 1 ? `${days} days to go.` : days === 1 ? "Tomorrow." : days === 0 ? "It starts today. All the best." : "It has started. All the best."}{examDate.note ? ` ${examDate.note}` : ""}</small>
        </span>
      </section>
    );
  }
  return (
    <section className={cn(s.count, s.o10)} aria-label="Exam date">
      <span className={s.calPage} aria-hidden="true">
        <span className={s.calBar}>{name}</span>
        <b>{examDate.year ?? "—"}</b>
        <span className={s.calSub}>date not out</span>
      </span>
      <span className={s.t}>
        <b>{name}{examDate.year ? ` ${examDate.year}` : ""}</b>
        <small>{examDate.note ?? `${board.name} hasn’t announced the date yet.`} We start the countdown the day it&rsquo;s out.</small>
      </span>
    </section>
  );
}

/* ── Recent papers ── */
function Ticks({ marks }: { marks: string }) {
  if (!marks) return null;
  const cells = marks.length <= 60
    ? marks.split("").map((m) => (m === "1" ? 1 : 0))
    : Array.from({ length: 30 }, (_, i) => {
      const part = marks.slice(Math.floor((i * marks.length) / 30), Math.floor(((i + 1) * marks.length) / 30));
      return part.length ? part.split("").filter((m) => m === "1").length / part.length : 0;
    });
  return (
    <span className={s.ticks} style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }} aria-hidden="true">
      {cells.map((v, i) => <i key={i} className={v >= 1 ? s.tickOn : ""} style={v > 0 && v < 1 ? { background: `rgba(193, 122, 40, ${0.25 + v * 0.75})` } : undefined} />)}
    </span>
  );
}

function RecentPapers({ papers, today, subjects }: { papers: RecentPaper[]; today: string; subjects: SubjectRef[] }) {
  return (
    <>
      <div className={s.h}><h3>Recent papers</h3><Link href={"/dashboard/history" as Route} className={s.hLink}>See all</Link></div>
      <section className={s.papers}>
        {papers.length === 0 ? <p className={s.none}>Papers you finish show up here, with your score and every answer to review.</p> : null}
        {papers.map((p) => {
          const duel = p.duel;
          const score = duel ? (duel.result === "W" ? "Won" : duel.result === "L" ? "Lost" : duel.result === "D" ? "Draw" : `${p.percentage}%`) : `${p.percentage}%`;
          const sub = duel && duel.opponentScore !== null ? `${duel.myScore}–${duel.opponentScore}` : `${p.score}/${p.total}`;
          return (
            <Link key={p.examId} href={`/exams/${p.examId}/results` as Route} className={s.pp}>
              {duel ? <span className={s.duelIc}><SwordsIcon /></span> : <PaperIcon names={p.subjects} known={subjects} />}
              <span className={s.ppT}>
                <b>{paperTitle(p)}</b>
                <Ticks marks={p.marks} />
                <small>{whenLine(p.completedAt, today)}</small>
              </span>
              <span className={s.ppWide}><Ticks marks={p.marks} /></span>
              <span className={s.sc}><b className={duel?.result === "W" ? s.won : ""}>{score}</b><small>{sub}</small></span>
            </Link>
          );
        })}
      </section>
    </>
  );
}

/** One subject: its icon. A full paper: the count of subjects, on a plain tile. */
function PaperIcon({ names, known }: { names: string[]; known: SubjectRef[] }) {
  const match = names.length === 1 ? known.find((k) => k.name.toLowerCase() === names[0].toLowerCase()) : undefined;
  if (match) return <Subj subject={match} size={30} />;
  const label = names.length === 1 ? names[0].slice(0, 3).toUpperCase() : `${names.length}`;
  return <span className={cn(s.subj, s.num)} style={{ width: 30, height: 30, fontSize: 12, fontWeight: 800, color: "var(--ink-2)" }}>{label}</span>;
}

/* ── Month ── */
export function MonthGrid({ month, today, studied, frozen }: { month: string; today: string; studied: string[]; frozen: string[] }) {
  const cells = useMemo(() => {
    const first = new Date(`${month}-01T00:00:00Z`);
    const lead = (first.getUTCDay() + 6) % 7;
    const daysIn = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
    const st = new Set(studied);
    const fz = new Set(frozen);
    const out: Array<{ n: string; cls: string; key: string }> = [];
    for (let i = 0; i < lead; i += 1) out.push({ n: "", cls: "", key: `lead-${i}` });
    for (let d = 1; d <= daysIn; d += 1) {
      const key = `${month}-${String(d).padStart(2, "0")}`;
      let cls = st.has(key) ? s.st : fz.has(key) ? s.fz : "";
      if (key === today && !st.has(key)) cls = s.td;
      if (key > today) cls = s.fu;
      out.push({ n: String(d), cls, key });
    }
    return out;
  }, [month, today, studied, frozen]);
  return (
    <div className={s.grid7}>
      {["M", "T", "W", "T", "F", "S", "S"].map((l, i) => <span key={i} className={s.dl}>{l}</span>)}
      {cells.map((c) => <span key={c.key} className={cn(s.cell, c.cls)}>{c.n}</span>)}
    </div>
  );
}

function MonthCard({ data }: { data: DashboardHome }) {
  const { month, streak } = data;
  const n = month.studied.length;
  let miles: string;
  if (data.nextUp.kind === "FIRST_PAPER" && streak.longest === 0) miles = "Finish a paper 7 days in a row to earn your first streak freeze.";
  else if (data.broken || (streak.count === 0 && streak.longest > 0)) miles = `Your longest run is ${streak.longest} days. Day 7 of a new run earns a streak freeze.`;
  else if (streak.freezeMissedDate) miles = `Study today and your freeze covers ${weekday(streak.freezeMissedDate)}. Day ${nextFreezeDay(streak.count + 1)} earns your next one.`;
  else if (streak.freezes > 0) miles = `You hold a streak freeze. Longest run so far: ${streak.longest} days.`;
  else if (streak.count < 7) miles = "Day 7 of your run earns your first streak freeze.";
  else if (streak.studiedToday) miles = `Day ${nextFreezeDay(streak.count)} earns your next streak freeze. Longest run so far: ${streak.longest} days.`;
  else miles = `Study today to reach day ${streak.count + 1}. Day ${nextFreezeDay(streak.count)} earns your next streak freeze.`;
  return (
    <>
      <div className={s.h}><h3>{monthName(month.month)}</h3><span>{n === 0 ? "Nothing ticked yet" : `${n} day${n === 1 ? "" : "s"} studied`}</span></div>
      <section className={s.month} aria-label={`Days studied in ${monthName(month.month)}`}>
        <MonthGrid month={month.month} today={month.today} studied={month.studied} frozen={month.frozen} />
        <div className={s.legend}><span><i className={s.lgS} />Studied</span><span><i className={s.lgF} />Streak freeze used</span></div>
        <p className={s.miles}>{miles}</p>
      </section>
    </>
  );
}
