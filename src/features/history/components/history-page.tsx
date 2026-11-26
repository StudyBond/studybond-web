"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { SubjectIcon, subjectPalette } from "@/components/ui/subject-icon";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useRetake } from "@/features/exam/components/retake-button";
import { getDashboardHome, homeKeys } from "@/features/home/api";
import { boardLabel, dayGap, dayMonth, lagosKey, lagosTime, paperTitle, shortDate, thousands, weekday } from "@/features/home/format";
import { BookmarkIcon, ChallengeIcon, ChevronLeft, SwordsIcon } from "@/features/home/icons";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import type { ExamProfileSubject } from "@/lib/api/institutions";
import { getExamHistory } from "@/lib/api/exams";
import type { ExamSummary, HistoryKind } from "@/lib/api/types";
import { getUserProfile } from "@/lib/api/users";
import { cn } from "@/lib/utils/cn";

import s from "../past-papers.module.css";

/*
 * Past papers (canvas 94g6nUXE…, boards 1a / 1b): a file of marked scripts.
 * Papers are grouped by Lagos day, each with its tick strip. A retake hangs
 * under its first try. Papers that were never sent stay in the list, greyed
 * (the user's pick, 2026-11-26). Tapping a paper shows it marked: inline on a
 * phone, in the panel on the right on a laptop.
 */

const PAGE_SIZE = 20;

const KINDS: Array<{ id: HistoryKind; label: string }> = [
  { id: "past", label: "Past questions" },
  { id: "practice", label: "Practice" },
  { id: "duel", label: "Duels" },
  { id: "challenge", label: "Challenges" },
  { id: "vault", label: "Vault" },
  { id: "study", label: "Study" },
];

const DUEL_TYPES = new Set(["ONE_V_ONE_DUEL", "GROUP_COLLAB", "GHOST_RACE"]);
const NO_RETAKE_TYPES = new Set(["ONE_V_ONE_DUEL", "GROUP_COLLAB", "GHOST_RACE", "DAILY_CHALLENGE", "STUDY"]);

function findSubject(name: string, list: ExamProfileSubject[]): ExamProfileSubject | undefined {
  const x = name.trim().toLowerCase();
  return list.find((b) => b.name.toLowerCase() === x || b.aliases.some((al) => al.toLowerCase() === x));
}

function SubjectTile({ name, list, small }: { name: string; list: ExamProfileSubject[]; small?: boolean }) {
  const subj = findSubject(name, list);
  return (
    <span className={cn(s.ico, small && s.icoSm)} aria-hidden="true">
      {subj ? (
        <SubjectIcon iconName={subj.iconName} code={subj.code} size={small ? 14 : 18} className={subjectPalette(subj.colorToken).text} />
      ) : (
        name.slice(0, 3)
      )}
    </span>
  );
}

function minutes(sec: number | null): string {
  if (sec === null) return "";
  const m = Math.max(1, Math.round(sec / 60));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

/** The tick strip: one cell per question, or 30 shaded cells for long papers. */
function Ticks({ marks }: { marks: string }) {
  if (!marks) return <span className={s.dash} aria-hidden="true" />;
  const cells = marks.length <= 60
    ? marks.split("").map((m) => (m === "1" ? 1 : 0))
    : Array.from({ length: 30 }, (_, i) => {
      const part = marks.slice(Math.floor((i * marks.length) / 30), Math.floor(((i + 1) * marks.length) / 30));
      return part.length ? part.split("").filter((m) => m === "1").length / part.length : 0;
    });
  return (
    <span className={s.ticks} style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }} aria-hidden="true">
      {cells.map((v, i) => <i key={i} className={v >= 1 ? s.on : ""} style={v > 0 && v < 1 ? { background: `rgba(193, 122, 40, ${0.25 + v * 0.75})` } : undefined} />)}
    </span>
  );
}

function titleOf(p: ExamSummary): string {
  const n = p.subjects.length;
  if (p.examType === "DAILY_CHALLENGE") return `Daily challenge · ${n} subject${n === 1 ? "" : "s"}`;
  if (p.examType === "STUDY") return `${n === 1 ? p.subjects[0] : `${n} subjects`} · Study session`;
  const duel = DUEL_TYPES.has(p.examType)
    ? { opponentName: p.duel?.opponentName ?? (p.examType === "GHOST_RACE" ? "a ghost" : "a friend") }
    : null;
  return paperTitle({ examType: p.examType, subjects: p.subjects, duel });
}

function scoreOf(p: ExamSummary): { big: string; small: string; cls?: string } {
  const d = p.duel;
  if (d && d.opponentScore !== null) {
    const big = d.result === "W" ? "Won" : d.result === "L" ? "Lost" : d.result === "D" ? "Draw" : `${Math.round(p.percentage)}%`;
    return { big, small: `${d.myScore}–${d.opponentScore}`, cls: d.result === "W" ? s.won : d.result === "L" ? s.lost : undefined };
  }
  return { big: `${Math.round(p.percentage)}%`, small: `${p.score}/${p.totalQuestions}` };
}

function dayLabel(day: string, today: string): { label: string; sub: string } {
  const gap = dayGap(day, today);
  const date = dayMonth(day);
  if (gap === 0) return { label: "Today", sub: `${weekday(day)} ${date}` };
  if (gap === 1) return { label: "Yesterday", sub: `${weekday(day)} ${date}` };
  if (gap < 7) return { label: weekday(day), sub: date };
  return { label: shortDate(day), sub: "" };
}

type Item = { paper: ExamSummary; tries: ExamSummary[] };

export function HistoryPageClient() {
  const profile = useQuery({ queryKey: ["dashboard", "profile"], queryFn: getUserProfile, retry: 1 });
  const home = useQuery({ queryKey: homeKeys.home, queryFn: getDashboardHome, staleTime: 30_000, retry: 1 });
  const examProfile = useExamProfile();
  const subjects = examProfile.data?.subjects ?? [];
  const [kind, setKind] = useState<HistoryKind | null>(null);
  const [subject, setSubject] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);

  const list = useInfiniteQuery({
    queryKey: ["exam-history", "file", kind, subject],
    queryFn: ({ pageParam }) => getExamHistory({
      page: pageParam,
      limit: PAGE_SIZE,
      status: "ENDED",
      kind: kind ?? undefined,
      subject: subject ?? undefined,
    }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.pagination.page < last.pagination.totalPages ? last.pagination.page + 1 : undefined),
  });

  const first = list.data?.pages[0];
  const papers = useMemo(() => list.data?.pages.flatMap((p) => p.exams) ?? [], [list.data]);
  const today = lagosKey(home.data?.serverNow ?? new Date().toISOString());

  /* Retakes hang under their first try when it's on the page. */
  const groups = useMemo(() => {
    const ids = new Set(papers.map((p) => p.id));
    const hangs = (p: ExamSummary) => p.isRetake && !!p.originalExamId && ids.has(p.originalExamId);
    const tries = new Map<number, ExamSummary[]>();
    for (const p of papers) {
      if (hangs(p)) tries.set(p.originalExamId!, [...(tries.get(p.originalExamId!) ?? []), p]);
    }
    const out: Array<{ day: string; items: Item[] }> = [];
    for (const p of papers) {
      if (hangs(p)) continue;
      const it = { paper: p, tries: (tries.get(p.id) ?? []).sort((a, b) => a.attemptNumber - b.attemptNumber) };
      const day = lagosKey(p.completedAt ?? p.startedAt);
      const g = out[out.length - 1];
      if (g && g.day === day) g.items.push(it);
      else out.push({ day, items: [it] });
    }
    return out;
  }, [papers]);

  const panelPaper = papers.find((p) => p.id === picked) ?? papers[0] ?? null;
  const counts = first?.kindCounts;
  const total = counts ? Object.values(counts).reduce((a, b) => a + b, 0) : 0;
  const isNew = !!first && !kind && !subject && first.pagination.total === 0;
  const stats = first?.stats;
  const since = stats?.firstPaperAt ? dayMonth(lagosKey(stats.firstPaperAt)) : null;

  const pickKind = (k: HistoryKind | null) => { setKind(k); setPicked(null); };
  const pickSubject = (x: string | null) => { setSubject(x); setPicked(null); };

  const topBar = (
    <div className={cn("sb-ui", s.bar)}>
      <Link href={"/dashboard/me" as Route} className={s.barBack} aria-label="Back to Me"><ChevronLeft /></Link>
      <h1>Past papers</h1>
    </div>
  );

  return (
    <LearnerShell profile={profile.data} isPremium={home.data?.plan.isPremium ?? profile.data?.isPremium ?? false} mobileTopBar={topBar}>
      <div className={cn("sb-ui", s.root)}>
        <div className={s.head}>
          <div className={s.title}>
            <h1>Past papers</h1>
            <p>Every paper you have sent, with every answer marked.</p>
          </div>
          {stats && !isNew ? (
            <section className={s.file} aria-label="Your papers so far">
              <div className={s.fileTop}>
                <b>{home.data ? boardLabel(home.data.board) : " "}</b>
                {since ? <span>Since {since}</span> : null}
              </div>
              <div className={s.facts}>
                <div className={s.fact}><b>{thousands(stats.totalExams)}</b><span>sent</span></div>
                <div className={s.fact}><b>{Math.round(stats.averageScore)}<small>%</small></b><span>average</span></div>
                <div className={s.fact}><b>{Math.round(stats.bestScore)}<small>%</small></b><span>best</span></div>
                <div className={s.fact}><b>{thousands(stats.totalSpEarned)}</b><span>SP</span></div>
              </div>
            </section>
          ) : null}
        </div>

        {isNew ? (
          <div className={s.empty}>
            <div className={s.ghost} aria-hidden="true">
              <div><i /><span /><em /></div><div><i /><span /><em /></div><div><i /><span /><em /></div>
            </div>
            <h3>Your file is empty</h3>
            <p>Every paper you send lands here, marked question by question, so you can come back and see what you got wrong.</p>
            <Link href={"/dashboard/practice" as Route} className={s.btn}>Start your first paper</Link>
          </div>
        ) : (
          <>
            {first ? (
              <div className={s.tools}>
                <div className={s.chips} role="group" aria-label="Kind of paper">
                  <button type="button" className={cn(s.chip, !kind && s.chipOn)} aria-pressed={!kind} onClick={() => pickKind(null)}>
                    All <i>{thousands(total)}</i>
                  </button>
                  {KINDS.filter((k) => (counts?.[k.id] ?? 0) > 0 || kind === k.id).map((k) => (
                    <button key={k.id} type="button" className={cn(s.chip, kind === k.id && s.chipOn)} aria-pressed={kind === k.id} onClick={() => pickKind(kind === k.id ? null : k.id)}>
                      {k.label} <i>{thousands(counts?.[k.id] ?? 0)}</i>
                    </button>
                  ))}
                </div>
                {(first.subjectCounts?.length ?? 0) > 1 ? (
                  <div className={s.subs} role="group" aria-label="Subject">
                    <button type="button" className={cn(s.sub, s.subAll, !subject && s.subOn)} aria-pressed={!subject} onClick={() => pickSubject(null)}>All subjects</button>
                    {first.subjectCounts!.map((x) => (
                      <button key={x.subject} type="button" className={cn(s.sub, subject === x.subject && s.subOn)} aria-pressed={subject === x.subject} onClick={() => pickSubject(subject === x.subject ? null : x.subject)}>
                        <SubjectTile name={x.subject} list={subjects} small />
                        {x.subject}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className={s.cols}>
              <div>
                {list.isLoading ? <><div className={s.skel} /><div className={s.skel} /><div className={s.skel} /></> : null}
                {list.isError ? (
                  <div className={s.noHit}>
                    Your papers didn&rsquo;t load. Check your connection.
                    <div className={s.acts}><button type="button" className={cn(s.btn, s.btn2)} onClick={() => list.refetch()}>Try again</button></div>
                  </div>
                ) : null}
                {first && papers.length === 0 ? <p className={s.noHit}>No papers match. Try All, or another subject.</p> : null}

                {groups.map((g) => {
                  const d = dayLabel(g.day, today);
                  const n = g.items.reduce((a, it) => a + 1 + it.tries.length, 0);
                  return (
                    <section key={g.day} className={s.day}>
                      <div className={s.dayH}><h3>{d.label}</h3><span>{d.sub ? `${d.sub} · ` : ""}{n} paper{n === 1 ? "" : "s"}</span></div>
                      {g.items.map((it) => (
                        <PaperRow
                          key={it.paper.id}
                          item={it}
                          subjects={subjects}
                          picked={picked}
                          panelId={panelPaper?.id ?? null}
                          onPick={(id) => setPicked(picked === id ? null : id)}
                          today={today}
                        />
                      ))}
                    </section>
                  );
                })}

                {list.hasNextPage ? (
                  <div className={s.more}>
                    <button type="button" className={cn(s.btn, s.btn2)} onClick={() => list.fetchNextPage()} disabled={list.isFetchingNextPage}>
                      {list.isFetchingNextPage ? "Loading…" : "Show older papers"}
                    </button>
                  </div>
                ) : null}
                {papers.length > 0 ? <p className={s.endNote}>Tap a paper to see it marked. Papers you did not send keep no score.</p> : null}
              </div>

              <aside className={s.panel} aria-label="The paper you picked">
                {panelPaper ? <Script key={panelPaper.id} paper={panelPaper} subjects={subjects} today={today} /> : null}
              </aside>
            </div>
          </>
        )}
      </div>
    </LearnerShell>
  );
}

function PaperIcon({ p, subjects }: { p: ExamSummary; subjects: ExamProfileSubject[] }): ReactNode {
  if (p.status !== "COMPLETED") {
    return <span className={cn(s.ico, s.iOpen)} aria-hidden="true">{p.subjects.length === 1 ? p.subjects[0].slice(0, 2) : p.subjects.length}</span>;
  }
  if (DUEL_TYPES.has(p.examType)) return <span className={cn(s.ico, s.iDuel)} aria-hidden="true"><SwordsIcon /></span>;
  if (p.examType === "DAILY_CHALLENGE") return <span className={cn(s.ico, s.iChal)} aria-hidden="true"><ChallengeIcon /></span>;
  if (p.examType === "BOOKMARK_EXAM") return <span className={s.ico} aria-hidden="true"><BookmarkIcon /></span>;
  if (p.subjects.length === 1) return <SubjectTile name={p.subjects[0]} list={subjects} />;
  return <span className={s.ico} aria-hidden="true">{p.subjects.length}</span>;
}

function PaperRow({ item, subjects, picked, panelId, onPick, today }: {
  item: Item;
  subjects: ExamProfileSubject[];
  picked: number | null;
  panelId: number | null;
  onPick: (id: number) => void;
  today: string;
}) {
  const p = item.paper;
  const sent = p.status === "COMPLETED";
  const sc = scoreOf(p);
  const when = lagosTime(p.completedAt ?? p.startedAt);
  const meta = sent
    ? [when, `${p.totalQuestions} question${p.totalQuestions === 1 ? "" : "s"}`, minutes(p.timeTakenSeconds)].filter(Boolean).join(" · ")
    : `${when} · time ran out before you sent it`;
  /* On a phone the marked script opens under the row (or under the try) that was tapped. */
  const openOn = picked === p.id ? p : item.tries.find((t) => t.id === picked) ?? null;

  return (
    <>
      <button type="button" className={cn(s.row, !sent && s.dim, panelId === p.id && s.rowSel)} onClick={() => onPick(p.id)} aria-expanded={picked === p.id}>
        <PaperIcon p={p} subjects={subjects} />
        <span className={s.rT}>
          <b>{titleOf(p)}</b>
          {sent ? <Ticks marks={p.marks ?? ""} /> : <span className={s.dash} aria-hidden="true" />}
          <small>{meta}</small>
        </span>
        {sent ? (
          <span className={s.sc}><b className={sc.cls}>{sc.big}</b><small>{sc.small}</small></span>
        ) : (
          <span className={s.pillDim}>Not sent</span>
        )}
      </button>
      {item.tries.map((t) => {
        const diff = t.score - p.score;
        const done = t.status === "COMPLETED";
        return (
          <button key={t.id} type="button" className={cn(s.retake, panelId === t.id && s.rowSel)} onClick={() => onPick(t.id)} aria-expanded={picked === t.id}>
            <span className={s.hook} aria-hidden="true" />
            <span className={s.rT}>
              <b>Try {t.attemptNumber} · {lagosTime(t.completedAt ?? t.startedAt)}</b>
              {done ? <Ticks marks={t.marks ?? ""} /> : <span className={s.dash} aria-hidden="true" />}
            </span>
            {done ? (
              <span className={s.sc}>
                <b>{Math.round(t.percentage)}%</b>
                <span className={diff > 0 ? s.up : s.same}>{diff > 0 ? `+${diff} right` : diff === 0 ? "same score" : `${diff} right`}</span>
              </span>
            ) : <span className={s.pillDim}>Not sent</span>}
          </button>
        );
      })}
      {openOn ? (
        <div className={s.inline}>
          <Script paper={openOn} subjects={subjects} today={today} />
        </div>
      ) : null}
    </>
  );
}

function Script({ paper: p, today }: { paper: ExamSummary; subjects: ExamProfileSubject[]; today: string }) {
  const { retake, isLoading } = useRetake(p.id);
  const sent = p.status === "COMPLETED";
  const duel = p.duel && p.duel.opponentScore !== null ? p.duel : null;
  const pct = Math.round(p.percentage);
  const day = lagosKey(p.completedAt ?? p.startedAt);
  const gap = dayGap(day, today);
  const whenDay = gap === 0 ? "Today" : gap === 1 ? "Yesterday" : gap < 7 ? weekday(day) : shortDate(day);
  const scores = p.subjectScores ?? [];
  const marks = p.marks ?? "";
  const split = scores.length > 1;
  const retakable = !NO_RETAKE_TYPES.has(p.examType);
  const canRetake = sent && retakable && p.retakesRemaining > 0;
  const href = (p.duelSessionCode ? `/exams/${p.id}/results?duel=${p.duelSessionCode}` : `/exams/${p.id}/results`) as Route;

  return (
    <div className={s.script}>
      <div className={s.sHead}>
        <div>
          <h3>{titleOf(p)}</h3>
          <p>{whenDay}, {lagosTime(p.completedAt ?? p.startedAt)}{p.isRetake ? ` · try ${p.attemptNumber}` : ""}</p>
        </div>
        {sent && !duel ? (
          <div className={s.mark} role="img" aria-label={`${p.score} out of ${p.totalQuestions}, ${pct}%`}>
            <b>{p.score}/{p.totalQuestions}</b>
            <small>{pct}%</small>
          </div>
        ) : null}
      </div>

      {duel ? (
        <div className={s.vs}>
          <div><span>You</span><b className={s.vsYou}>{duel.myScore}</b></div>
          <em className={duel.result === "W" ? "" : s.lost}>
            {duel.result === "W" ? "You won" : duel.result === "L" ? `Lost by ${duel.opponentScore! - duel.myScore}` : duel.result === "D" ? "A draw" : "Not marked yet"}
          </em>
          <div><span>{duel.opponentName ?? "Them"}</span><b className={s.vsThem}>{duel.opponentScore}</b></div>
        </div>
      ) : null}

      {sent && marks && !split ? (
        <>
          <div className={s.grid} role="img" aria-label={`${p.score} right out of ${p.totalQuestions}`}>
            {marks.split("").map((m, i) => (
              <span key={i} className={cn(s.q, m === "1" ? s.qR : m === "0" ? s.qW : s.qB)}>{i + 1}</span>
            ))}
          </div>
          <div className={s.key} aria-hidden="true"><span><i className={s.kR} />Right</span><span><i className={s.kW} />Wrong</span><span><i className={s.kB} />Left blank</span></div>
        </>
      ) : null}

      {sent && split ? (
        <div className={s.split}>
          {scores.map((x) => (
            <div key={x.subject} className={s.sp}>
              <span>{x.subject}</span>
              <Ticks marks={x.marks} />
              <b>{x.score}/{x.total}</b>
            </div>
          ))}
        </div>
      ) : null}

      {!sent ? <p className={s.unf}>Time ran out before this paper was sent, so it has no score and its answers can&rsquo;t be opened.</p> : null}

      <div className={s.sFacts}>
        {sent && p.timeTakenSeconds !== null ? <span>Took <b>{minutes(p.timeTakenSeconds)}</b></span> : null}
        {sent ? <span>Earned <b>+{thousands(p.spEarned)} SP</b></span> : <span>Questions <b>{p.totalQuestions}</b></span>}
        {sent && retakable ? <span>Retakes left <b>{p.retakesRemaining}</b></span> : null}
      </div>

      <div className={s.acts}>
        {sent ? (
          <Link href={href} className={s.btn}>{duel ? "See the duel" : "See every answer"}</Link>
        ) : (
          <Link href={"/dashboard/practice" as Route} className={cn(s.btn, s.btn2)}>Start a new paper</Link>
        )}
        {canRetake ? (
          <button type="button" className={cn(s.btn, s.btn2)} onClick={retake} disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? "Starting…" : `Retake · ${p.retakesRemaining} left`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
