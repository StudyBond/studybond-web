"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Avatar } from "@/features/avatar/components/avatar";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useLeaderboardBoard } from "@/features/leaderboard/hooks/use-leaderboard";
import { boardSounds } from "@/features/leaderboard/lib/board-sounds";
import { firstName, shortDate } from "@/features/leaderboard/lib/names";
import { passedSince, readSeen, writeSeen } from "@/features/leaderboard/lib/last-seen";
import type { BoardEntry, LeaderboardBoard } from "@/lib/api/leaderboard";
import styles from "./leaderboard.module.css";
import { BoardToast } from "./board-toast";
import { RowSheet } from "./row-sheet";

type Tab = "week" | "all" | "group";

type ScreenProps = {
  viewerId: number;
  isPremium: boolean;
  /** "UI Post-UTME" */
  boardLabel: string;
  /** The third tab's name: the student's course, or their department on JAMB. */
  groupTabLabel: string;
  /** Departments instead of courses (JAMB). */
  departmentBoard: boolean;
  /** Questions in a full paper: a real paper pays 1 SP per right answer. */
  fullPaperSp: number;
};

const ROW = 58;
const LINE = 40;
const fmt = (n: number) => n.toLocaleString("en-US");

function isoWeek(isoDate: string): number {
  const date = new Date(`${isoDate}T12:00:00Z`);
  const thursday = new Date(date);
  thursday.setUTCDate(date.getUTCDate() + 3 - ((date.getUTCDay() + 6) % 7));
  const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((thursday.getTime() - firstThursday.getTime()) / 86_400_000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}

function useCountdown(endsAt: string | undefined) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!endsAt) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [endsAt]);
  if (!endsAt) return "";
  const left = Math.max(0, Math.floor((Date.parse(endsAt) - now) / 1000));
  const p = (x: number) => String(x).padStart(2, "0");
  return `${Math.floor(left / 86400)}d ${p(Math.floor((left % 86400) / 3600))}h ${p(Math.floor((left % 3600) / 60))}m ${p(left % 60)}s`;
}

export function LeaderboardScreen(props: Readonly<ScreenProps>) {
  const [tab, setTab] = useState<Tab>("week");
  const query = useLeaderboardBoard(tab === "all" ? "ALL_TIME" : "WEEKLY", tab === "group" ? "group" : "board");
  const data = query.data;
  const countdown = useCountdown(tab === "all" ? undefined : data?.week?.endsAt);

  const tabs: Array<[Tab, string]> = [
    ["week", "This week"],
    ["all", "All time"],
    ["group", props.groupTabLabel],
  ];

  let whenLeft = "";
  if (data) {
    if (tab === "all") whenLeft = `${props.boardLabel} · never resets`;
    else if (tab === "group") whenLeft = data.group?.label ? `${data.group.label}${props.departmentBoard ? "" : " hopefuls"} · this week` : "This week";
    else whenLeft = `${props.boardLabel} · week ${data.week ? isoWeek(data.week.weekStartDate) : ""} · ends Sun 11:59 PM`;
  }

  return (
    <div className={cn("sb-ui", styles.root, "mx-auto w-full max-w-[560px] px-3.5 pb-24 pt-3")}>
      <h1 className={cn(styles.head, "mb-3 px-1 text-[17px] font-bold")}>Leaderboard</h1>

      <div role="group" aria-label="Which leaderboard" className="grid grid-cols-3 gap-0.5 rounded-xl bg-[var(--sheet)] p-[3px] ring-1 ring-inset ring-[var(--rule)]">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={tab === id}
            onClick={() => {
              boardSounds.tap();
              setTab(id);
            }}
            className={cn(
              styles.tab,
              "min-h-10 truncate rounded-[9px] px-1.5",
              tab === id
                ? "bg-[#e09040]/[0.12] font-bold text-[var(--mark-ink)] ring-1 ring-inset ring-[#e09040]/[0.32]"
                : "text-[var(--ink-2)] hover:text-[var(--ink)]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mx-1 mt-3.5 flex items-baseline justify-between gap-2.5 text-[13px] text-[var(--ink-3)]">
        <span className="min-w-0">{whenLeft}</span>
        {countdown ? <b className={cn(styles.num, "shrink-0 text-sm font-bold text-[var(--ink)]")}>{countdown}</b> : null}
      </div>

      {query.isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#e09040] opacity-60" />
        </div>
      ) : query.isError || !data ? (
        <div className="mt-6 rounded-2xl bg-[var(--sheet)] p-5 text-sm text-[var(--ink-2)]">
          We couldn&apos;t load the leaderboard.{" "}
          <button type="button" className={cn(styles.textBtn, "text-[var(--mark-ink)] underline")} onClick={() => query.refetch()}>
            Try again
          </button>
        </div>
      ) : tab === "all" ? (
        <AllTime data={data} />
      ) : tab === "group" && !data.group?.value ? (
        <GroupPrompt departmentBoard={props.departmentBoard} />
      ) : data.me.rank === null && tab === "week" ? (
        <NotOnBoardYet data={data} isPremium={props.isPremium} />
      ) : (
        <Ranked data={data} tab={tab} {...props} />
      )}
    </div>
  );
}

/* ─── Ranked: chase ladder, the live list, last week ─── */

function Ranked({ data, tab, viewerId, fullPaperSp, departmentBoard }: { data: LeaderboardBoard; tab: Tab } & ScreenProps) {
  const me = data.me.entry;
  const above = data.ladder.above;
  const below = data.ladder.below;
  const tenth = data.meritList.cutoffHolder;
  const group = tab === "group";
  const groupName = data.group?.label ?? "your course";

  let cutText = "";
  let made = false;
  if (data.me.rank !== null && data.me.rank <= data.meritList.size) {
    made = true;
    cutText = group
      ? `You are in the top 10 of ${groupName} this week.`
      : "You are on the merit list. Hold #10 or better until Sunday, 11:59 PM.";
  } else if (tenth && data.me.rank !== null) {
    const need = tenth.points - data.me.points + 1;
    cutText = group
      ? `The top 10 of ${groupName} starts at ${fmt(tenth.points)} SP. You need ${fmt(need)} more.`
      : `The merit list cut-off is ${fmt(tenth.points)} SP, held by ${firstName(tenth.displayName)} at #10. You need ${fmt(need)} more. A full real paper pays up to ${fmt(fullPaperSp)} SP.`;
  } else if (data.me.rank === null) {
    cutText = "Score any SP this week and you're on it.";
  }

  return (
    <>
      {me ? (
        <section aria-live="polite" className="mt-3 rounded-2xl border border-white/[0.06] bg-[var(--sheet)] px-4 pb-3.5 pt-4">
          <h2 className={cn(styles.head, "text-[22px] font-extrabold")}>
            You&apos;re #{data.me.rank}{" "}
            <small className="ml-1 text-sm font-semibold text-[var(--ink-3)]">of {fmt(data.totalParticipants)}</small>
          </h2>
          <div className="mt-3 grid gap-0.5">
            {above ? <Rung entry={above} gap={`${fmt(above.points - data.me.points)} ahead`} strong /> : null}
            <Rung entry={me} gap={fmt(me.points)} you strong />
            {below ? <Rung entry={below} gap={`${fmt(data.me.points - below.points)} behind`} /> : null}
          </div>
          <p className={cn("mt-3 text-[13.5px]", made ? "font-bold text-[var(--good)]" : "text-[var(--ink-2)]")}>{cutText}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={"/dashboard/duel" as Route}
              className={cn(styles.btn, styles.btnInk)}
            >
              Find a challenger
            </Link>
            <Link
              href={"/dashboard/practice?mode=REAL_PAST_QUESTION" as Route}
              className={cn(styles.btn, styles.btnLine)}
            >
              Start an exam
            </Link>
          </div>
        </section>
      ) : null}

      <BoardList
        data={data}
        viewerId={viewerId}
        animate={tab === "week"}
        title={
          group
            ? departmentBoard
              ? `${groupName} on this board`
              : "Admission is by course. These are your real rivals."
            : "Top students this week"
        }
        lineLabel={group ? `Top 10 of ${departmentBoard ? groupName.toLowerCase() : "your course"}` : "Top 10 · merit list"}
        belowNoun={group ? (departmentBoard ? `${groupName.toLowerCase()}` : `${groupName} hopefuls`) : "students"}
        rankLabel={group ? (departmentBoard ? "in your department" : "in your course") : "this week"}
      />

      {tab === "week" && data.lastWeek ? <LastWeek data={data} /> : null}
    </>
  );
}

function Rung({ entry, gap, you, strong }: { entry: BoardEntry; gap: string; you?: boolean; strong?: boolean }) {
  return (
    <div className={cn("grid min-h-[42px] grid-cols-[34px_30px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-lg px-2 py-1", you && "bg-[var(--sheet-2)]")}>
      <span className={cn(styles.rank, "text-lg", you ? "text-[var(--ink)]" : "text-[var(--ink-3)]")}>{entry.rank}</span>
      <Avatar look={entry.avatar} size={30} />
      <span className="truncate text-[14.5px] font-bold">{you ? "You" : entry.displayName}</span>
      <span className={cn(styles.num, "text-right text-[13px] font-bold", strong ? "text-[var(--ink)]" : "text-[var(--ink-3)]")}>{gap}</span>
    </div>
  );
}

/* The list. Rows sit at absolute positions so a climb can slide them. */
function BoardList({ data, viewerId, animate, title, belowNoun, lineLabel, rankLabel }: { data: LeaderboardBoard; viewerId: number; animate: boolean; title: string; belowNoun: string; lineLabel: string; rankLabel: string }) {
  const rows = data.entries;
  const [peek, setPeek] = useState<BoardEntry | null>(null);
  const showLine = rows.length > data.meritList.size;
  const posY = (rank: number) => (rank - 1) * ROW + (showLine && rank > data.meritList.size ? LINE : 0);
  const height = rows.length * ROW + (showLine ? LINE : 0);
  const top = rows[0]?.points || 1;
  const second = rows[1];

  /* The replay: rows start at last visit's places, then slide to today's.
     Worked out during render (a plain read of this browser's note), so there
     is no flicker. The effect saves today's places and runs the timers, and
     is safe to run twice (React does that in development). */
  const stamp = `${data.institution.id}:${data.generatedAt}`;
  const plan = useMemo(() => {
    if (!animate || !data.week || typeof window === "undefined") return null;
    const seen = readSeen(viewerId, data.institution.id, data.week.weekStartDate);
    const myNew = data.me.rank;
    if (!seen || seen.myRank === null || myNew === null || myNew >= seen.myRank) return null;
    const passed = passedSince(seen, seen.myRank, myNew, data.entries);
    const madeIt = seen.myRank > data.meritList.size && myNew <= data.meritList.size;
    let text = `Now #${myNew}.`;
    if (passed.length === 1) text = `You passed ${passed[0]}. Now #${myNew}.`;
    if (passed.length > 1) text = `You passed ${passed.slice(0, -1).join(", ")} and ${passed[passed.length - 1]}. Now #${myNew}.`;
    if (madeIt) text = `You made the merit list at #${myNew}.${passed.length ? ` ${text.replace(` Now #${myNew}.`, "")}` : ""}`;
    const start: Record<string, number> = { ...seen.ranks, [viewerId]: seen.myRank };
    return { start, text, madeIt };
  }, [animate, data, viewerId]);

  const [settled, setSettled] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [toast, setToast] = useState<{ key: number; text: string } | null>(null);
  const from = plan && settled !== stamp ? plan.start : null;

  useEffect(() => {
    if (!animate || !data.week) return;
    writeSeen(viewerId, data.institution.id, data.week.weekStartDate, data.me.rank, data.entries);
    if (!plan) return;
    const t1 = setTimeout(() => {
      setSettled(stamp);
      setFlash(true);
      setToast((current) => ({ key: (current?.key ?? 0) + 1, text: plan.text }));
      if (plan.madeIt) boardSounds.merit();
      else boardSounds.up();
    }, 450);
    const t2 = setTimeout(() => setFlash(false), 2100);
    const t3 = setTimeout(() => setToast(null), 4500);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, [animate, data, viewerId, plan, stamp]);

  const more = data.totalParticipants - rows.length;

  return (
    <div className="pt-[18px]">
      <div className="mx-1 mb-1.5 flex items-baseline justify-between gap-3">
        <h3 className={cn(styles.head, "text-base font-extrabold")}>{title}</h3>
        <span className="shrink-0 text-[12.5px] text-[var(--ink-3)]">SP</span>
      </div>
      <ol className="relative" style={{ height }} aria-label={title}>
        {showLine ? (
          <li
            aria-hidden="true"
            className={cn(styles.cutline, "absolute left-0 right-0 flex h-10 items-center gap-2.5 px-1.5 text-xs font-bold text-[var(--mark-ink)]")}
            style={{ top: data.meritList.size * ROW }}
          >
            {lineLabel}
          </li>
        ) : null}
        {rows.map((row) => {
          const isMe = row.userId === viewerId;
          const startRank = from?.[row.userId];
          const y = startRank !== undefined ? posY(Math.min(startRank, rows.length)) : posY(row.rank);
          const hiddenStart = from !== null && startRank === undefined;
          const mv = row.movement ?? 0;
          return (
            <li
              key={row.userId}
              className={cn(
                styles.row,
                "absolute left-0 right-0 h-[58px] rounded-[10px]",
                isMe && "bg-[var(--sheet)]",
                isMe && flash && styles.flash,
              )}
              style={{ transform: `translateY(${y}px)`, opacity: hiddenStart ? 0 : 1, zIndex: isMe ? 3 : 1, transition: from ? "none" : undefined }}
            >
              <RowCells
                tap={
                  isMe
                    ? null
                    : () => {
                        boardSounds.tap();
                        setPeek(row);
                      }
                }
              >
              <span className={cn(styles.rank, "justify-self-center", row.rank <= 3 ? "text-[27px] text-[var(--ink)]" : "text-xl text-[var(--ink-3)]")}>{row.rank}</span>
              <Avatar look={row.avatar} size={36} label={isMe ? undefined : `${row.displayName}'s avatar`} />
              <span className="grid min-w-0">
                <span className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap text-[15px] font-bold">
                  <span className={cn("truncate", isMe && styles.hl)}>{isMe ? "You" : row.displayName}</span>
                  {mv !== 0 ? (
                    <span className={cn(styles.num, "text-[11.5px] font-bold", mv > 0 ? "text-[var(--good)]" : "text-[var(--bad)]")}>
                      <span aria-hidden="true">{mv > 0 ? "▲" : "▼"}</span>
                      {Math.abs(mv)}
                      <span className="sr-only">{mv > 0 ? " places up today" : " places down today"}</span>
                    </span>
                  ) : null}
                </span>
                <span className="truncate text-xs text-[var(--ink-3)]">
                  {[row.rank === 1 && second ? `Leads by ${fmt(row.points - second.points)}` : null, row.subtitle].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="grid min-w-[74px] justify-items-end gap-1">
                <b className={cn(styles.num, "text-[15px] font-bold")}>{fmt(row.points)}</b>
                <span className={cn(styles.bar, "block h-1 w-[74px] overflow-hidden rounded-sm bg-[var(--rule)]")} aria-hidden="true">
                  <i className="block h-full rounded-sm" style={{ width: `${Math.round((row.points / top) * 100)}%`, background: isMe ? "var(--bar-me)" : "var(--bar)" }} />
                </span>
              </span>
              </RowCells>
            </li>
          );
        })}
      </ol>
      {more > 0 ? (
        <p className="mx-1 mt-1.5 text-[12.5px] text-[var(--ink-3)]">
          {fmt(more)} more {belowNoun} {more === 1 ? "is" : "are"} below.
        </p>
      ) : null}
      <BoardToast toast={toast} />
      <RowSheet
        entry={peek}
        myPoints={data.me.points}
        rankLabel={rankLabel}
        record={peek && data.headToHead ? (data.headToHead.find((item) => item.userId === peek.userId) ?? null) : undefined}
        onClose={() => setPeek(null)}
      />
    </div>
  );
}

/* A row's cells. Other students' rows are buttons that open their sheet;
   your own row isn't. */
function RowCells({ tap, children }: { tap: (() => void) | null; children: ReactNode }) {
  const layout = "grid h-full w-full grid-cols-[40px_36px_minmax(0,1fr)_auto] items-center gap-2.5 pl-1 pr-1.5 text-left";
  if (!tap) return <div className={layout}>{children}</div>;
  return (
    <button type="button" aria-haspopup="dialog" onClick={tap} className={cn(styles.tap, layout)}>
      {children}
    </button>
  );
}

function LastWeek({ data }: { data: LeaderboardBoard }) {
  const last = data.lastWeek;
  if (!last) return null;
  const mine = last.myRank;
  const best = data.myBest;
  return (
    <section className="mt-[22px] rounded-2xl border border-white/[0.06] p-4">
      <h3 className={cn(styles.head, "mb-2 text-base font-extrabold")}>Last week&apos;s merit list</h3>
      {last.entries.length === 0 ? (
        <p className="text-[13.5px] text-[var(--ink-2)]">Nobody scored on this board last week.</p>
      ) : (
        <ol className="grid gap-1.5">
          {last.entries.map((entry) => (
            <li key={entry.userId} className="grid grid-cols-[24px_28px_minmax(0,1fr)_auto] items-center gap-2.5 text-sm">
              <span className={cn(styles.rank, "text-[17px] text-[var(--ink-2)]")}>{entry.rank}</span>
              <Avatar look={entry.avatar} size={28} />
              <span className={cn("truncate", entry.isCurrentUser && "font-bold")}>{entry.isCurrentUser ? "You" : entry.displayName}</span>
              <span className={styles.num}>{fmt(entry.points)}</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-3 text-[13.5px] text-[var(--ink-2)]">
        {mine ? (
          <>
            You finished <b className="text-[var(--ink)]">#{mine}</b> last week.
          </>
        ) : (
          "You weren't on last week's board."
        )}
        {best ? (
          <>
            {" "}Your best is <b className="text-[var(--ink)]">#{best.rank}</b>, in the week of {shortDate(best.weekStartDate)}.
          </>
        ) : null}
      </p>
    </section>
  );
}

/* ─── All time ─── */

function AllTime({ data }: { data: LeaderboardBoard }) {
  const top = data.entries.slice(0, data.meritList.size);
  const shownIds = new Set(top.map((entry) => entry.userId));
  const tail = [data.ladder.above, data.me.entry, data.ladder.below].filter(
    (entry): entry is BoardEntry => entry !== null && !shownIds.has(entry.userId),
  );
  const gap = tail.length > 0 ? tail[0].rank - top.length - 1 : 0;

  return (
    <div className="pt-[18px]">
      <div className="mx-1 mb-1.5 flex items-baseline justify-between">
        <h3 className={cn(styles.head, "text-base font-extrabold")}>Since StudyBond opened</h3>
        <span className="text-[12.5px] text-[var(--ink-3)]">SP</span>
      </div>
      {top.length === 0 ? <p className="mx-1 text-sm text-[var(--ink-2)]">Nobody has scored on this board yet.</p> : null}
      <ol>
        {top.map((entry) => <StaticRow key={entry.userId} entry={entry} />)}
        {gap > 0 ? (
          <li className="grid h-[30px] place-items-center text-[12.5px] text-[var(--ink-3)]">{fmt(gap)} more</li>
        ) : null}
        {tail.map((entry) => <StaticRow key={entry.userId} entry={entry} />)}
      </ol>
      {data.me.rank === null ? (
        <p className="mx-1 mt-2 text-[12.5px] text-[var(--ink-3)]">You&apos;re not on the all-time board yet. Your first SP puts you on it.</p>
      ) : null}
      <p className="mx-1 mt-1.5 text-[12.5px] text-[var(--ink-3)]">All time never resets. The weekly board is where you can climb fast.</p>
    </div>
  );
}

function StaticRow({ entry }: { entry: BoardEntry }) {
  return (
    <li className={cn("grid h-14 grid-cols-[40px_36px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-[10px] pl-1 pr-1.5", entry.isCurrentUser && "bg-[var(--sheet)]")}>
      <span className={cn(styles.rank, "justify-self-center", entry.rank <= 3 ? "text-[27px] text-[var(--ink)]" : "text-xl text-[var(--ink-3)]")}>{entry.rank}</span>
      <Avatar look={entry.avatar} size={36} />
      <span className="grid min-w-0">
        <span className="truncate text-[15px] font-bold">
          <span className={cn(entry.isCurrentUser && styles.hl)}>{entry.isCurrentUser ? "You" : entry.displayName}</span>
        </span>
        <span className="truncate text-xs text-[var(--ink-3)]">{entry.subtitle}</span>
      </span>
      <b className={cn(styles.num, "text-[15px]")}>{fmt(entry.points)}</b>
    </li>
  );
}

/* ─── My course, with no course yet ─── */

function GroupPrompt({ departmentBoard }: { departmentBoard: boolean }) {
  return (
    <section className="mt-3 rounded-2xl border border-white/[0.06] bg-[var(--sheet)] p-4">
      <h2 className={cn(styles.head, "text-xl font-bold")}>
        {departmentBoard ? "Which department are you in?" : "Which course are you aiming for?"}
      </h2>
      <p className="mt-2 text-sm text-[var(--ink-2)]">
        {departmentBoard
          ? "Add Science, Art or Commercial to your profile and this tab ranks you against students in the same department."
          : "Admission is by course. Add yours to your profile and this tab ranks you against the students chasing the same seat."}
      </p>
      <Link
        href={"/dashboard/settings" as Route}
        className={cn(styles.btn, styles.btnLine, "mt-3 px-3.5")}
      >
        {departmentBoard ? "Add my department" : "Add my course"}
      </Link>
    </section>
  );
}

/* ─── Not on this week's board yet (mockup 14a) ─── */

function NotOnBoardYet({ data, isPremium }: { data: LeaderboardBoard; isPremium: boolean }) {
  const top = useMemo(() => data.entries.slice(0, 5), [data.entries]);
  return (
    <>
      <section className="mt-3 rounded-2xl border border-white/[0.06] bg-[var(--sheet)] px-4 pb-4 pt-[18px]">
        <span className="inline-flex items-center gap-2 rounded-full bg-[var(--sheet-2)] py-1 pl-1 pr-2.5 text-[12.5px] font-semibold text-[var(--ink-2)]">
          <span className={cn(styles.num, "grid h-[26px] w-[26px] place-items-center rounded-full border-[1.5px] border-dashed border-white/25 text-xs text-[var(--ink-3)]")}>?</span>
          Your spot is waiting
        </span>
        <h2 className={cn(styles.head, "mt-3 text-[22px] font-bold leading-tight")}>You&apos;re not on this week&apos;s board yet</h2>
        <p className="mt-2 text-sm text-[var(--ink-2)]">
          Score any SP before Sunday and you&apos;re on it.
          {data.totalParticipants > 0 ? (
            <>
              {" "}<b className="text-[var(--ink)]">{fmt(data.totalParticipants)} {data.totalParticipants === 1 ? "student is" : "students are"}</b> already climbing.
            </>
          ) : null}
        </p>
        <div className="mt-3.5 grid gap-2">
          <Step
            href="/dashboard/duel"
            title={isPremium ? "Find a challenger" : "Your free duel"}
            small={isPremium ? "Win and every right answer pays 1.5 SP" : "A 15-question taster with a friend"}
            pts={isPremium ? null : "up to 23"}
            icon="duel"
          />
          <Step href="/dashboard/practice?mode=DAILY_CHALLENGE" title="Take the daily challenge" small="A few questions, every day" pts="40" icon="paper" />
        </div>
        {data.lastWeek?.cutoffPoints ? (
          <p className="mt-3 text-[13px] text-[var(--ink-3)]">
            Last week, the top 10 needed <b className="text-[var(--ink-2)]">{fmt(data.lastWeek.cutoffPoints)} SP</b>.
          </p>
        ) : null}
      </section>

      {top.length > 0 ? (
        <>
          <div className="mx-1 mb-1.5 mt-[22px] flex items-baseline justify-between">
            <h3 className={cn(styles.head, "text-base font-bold")}>Top this week</h3>
            <span className="text-[12.5px] text-[var(--ink-3)]">SP</span>
          </div>
          <ol>
            {top.map((entry) => <StaticRow key={entry.userId} entry={entry} />)}
          </ol>
        </>
      ) : null}
      <div className="mt-2.5 grid grid-cols-[36px_36px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-[#e09040]/[0.35] py-2.5 pl-1 pr-1.5">
        <span className={cn(styles.num, "justify-self-center text-lg text-[var(--ink-3)]")}>–</span>
        <UserAvatar px={36} />
        <span>
          <b className="text-[15px]">You</b>
          <small className="block text-xs text-[var(--ink-3)]">Not ranked yet this week</small>
        </span>
        <span className={cn(styles.num, "font-bold text-[var(--ink-3)]")}>0</span>
      </div>
    </>
  );
}

function Step({ href, title, small, pts, icon }: { href: string; title: string; small: string; pts: string | null; icon: "duel" | "paper" }) {
  return (
    <Link href={href as Route} className="grid grid-cols-[38px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-[var(--sheet-2)] px-3 py-2.5 hover:bg-white/[0.07]">
      <span className="grid h-[38px] w-[38px] place-items-center rounded-[10px] bg-[#e09040]/[0.12] text-[var(--mark-ink)]">
        {icon === "duel" ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[19px] w-[19px]" aria-hidden="true">
            <path d="M9 10h.01M15 10h.01" />
            <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[19px] w-[19px]" aria-hidden="true">
            <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
            <path d="M14 3v6h6" />
            <path d="M8 13h8M8 17h5" />
          </svg>
        )}
      </span>
      <span>
        <b className="block text-[14.5px]">{title}</b>
        <small className="block text-xs text-[var(--ink-3)]">{small}</small>
      </span>
      {pts ? (
        <span className={cn(styles.num, "text-right text-sm font-bold text-[var(--mark-ink)]")}>
          {pts}
          <small className="font-normal text-[var(--ink-3)]"> SP</small>
        </span>
      ) : (
        <span />
      )}
    </Link>
  );
}
