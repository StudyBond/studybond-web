"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { DuelScreen } from "@/features/duel/components/duel-screen";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { useCreateDuelMutation, useDuelDurationOptions } from "@/features/duel/hooks/use-duel";
import { useChallenge, useDuelHome } from "@/features/duel/hooks/use-duel-play";
import type { ExamProfileSubject } from "@/lib/api/institutions";
import type { DuelQuestionSource, UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { BackIcon } from "../ui/icons";
import { DuelAvatar, SubjectTile, apiErrorCode, apiErrorMessage, firstName, shortName } from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import { BigSubjectPicker, useNeedsBigPicker } from "./big-subject-picker";
import u from "./setup.module.css";

const TASTER_QUESTIONS = 15;
const TASTER_MINUTES = 14;

type Source = { id: DuelQuestionSource; label: string; note: (board: string) => string; tag?: string };

const SOURCES: Source[] = [
  { id: "REAL_PAST_QUESTION", label: "Real past questions", note: (board) => `Questions from past ${board} papers`, tag: "Full SP" },
  { id: "PRACTICE", label: "Practice questions", note: () => "Written by StudyBond, same syllabus", tag: "Half SP" },
  { id: "MIXED", label: "Mixed", note: () => "Some of each" },
];

function boardLabel(name: string | undefined, trackName: string | undefined) {
  if (!name) return "your exam";
  return trackName && !name.includes(trackName) ? `${name} ${trackName}` : name;
}

/** Plain names, the way students would name a paper. */
function nameIdeas(me: string, them: string | null, subjects: string[]): string[] {
  const ideas = ["Saturday paper", "One more round", "Settle it", "Before the real one"];
  if (them) ideas.splice(1, 0, `${me} v ${them}`);
  if (subjects.length >= 2) ideas.splice(2, 0, `${subjects[0]} and ${subjects[1]} test`);
  else if (subjects.length === 1) ideas.splice(2, 0, `${subjects[0]} test`);
  return ideas;
}

/**
 * Challenge a friend (mockup board 2): taster switch, numbered subjects,
 * question source, time and an optional name, then the printed slip on the
 * room page. With ?to=<userId>&name=<name> (the leaderboard's tap-to-
 * challenge) it challenges that student directly instead of printing an
 * open slip.
 */
export function DuelSetup({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const params = useSearchParams();
  const targetId = Number(params.get("to")) || null;
  const targetName = targetId ? params.get("name")?.trim() || "your rival" : null;

  const { data: examProfile } = useExamProfile();
  const home = useDuelHome();
  const create = useCreateDuelMutation();
  const challenge = useChallenge();

  const isPremium = home.data?.freeDuel.isPremium ?? profile.isPremium;
  const board = boardLabel(examProfile?.institution.name, examProfile?.trackName);
  const subjects = useMemo(() => examProfile?.subjects ?? [], [examProfile]);
  const bigBoard = useNeedsBigPicker(subjects);

  // Null until the student touches the list: then the board's first subjects show.
  const [chosen, setPicked] = useState<string[] | null>(null);
  const [source, setSource] = useState<DuelQuestionSource>("REAL_PAST_QUESTION");
  const [tasterWanted, setTasterWanted] = useState(params.get("taster") === "1");
  const [chosenSeconds, setChosenSeconds] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [warn, setWarn] = useState("");
  const [nudge, setNudge] = useState<string | null>(null);
  const nameIdx = useRef(0);

  // A full paper of the board's first subjects, like the mockup. Big boards
  // start empty: there is no sensible default among 20-odd subjects.
  const picked = chosen ?? subjects.slice(0, bigBoard ? 0 : examProfile?.maxSubjects ?? 4).map((subject) => subject.name);

  const taster = !isPremium || tasterWanted;
  const maxSubjects = examProfile?.maxSubjects ?? 4;
  const mixedMax = examProfile?.allowMixedFullExams === false ? Math.max(1, maxSubjects - 1) : maxSubjects;
  const max = taster ? 1 : source === "MIXED" ? mixedMax : maxSubjects;
  const paper = taster ? picked.slice(0, 1) : picked.slice(0, max);
  const bySubject = new Map(subjects.map((subject) => [subject.name, subject]));
  const questions = taster ? TASTER_QUESTIONS : paper.reduce((sum, nameOf) => sum + (bySubject.get(nameOf)?.questionCount ?? 0), 0);

  const duration = useDuelDurationOptions(paper, !taster && paper.length > 0);
  const options = duration.data;
  const seconds = options ? clamp(chosenSeconds ?? options.defaultSeconds, options.minSeconds, options.maxSeconds) : null;
  const minutes = taster ? TASTER_MINUTES : seconds ? Math.round(seconds / 60) : null;
  const diff = options && seconds ? Math.round((seconds - options.defaultSeconds) / 60) : 0;

  function flash(subject: string, message: string) {
    playDuelSound("no");
    setWarn(message);
    setNudge(subject);
    window.setTimeout(() => setNudge(null), 350);
  }

  function toggle(subject: string) {
    const on = paper.includes(subject);
    if (taster && !on) {
      playDuelSound("add");
      setPicked([subject, ...picked.filter((x) => x !== subject)]);
      setWarn("");
      return;
    }
    if (on) {
      if (paper.length === 1) return flash(subject, "Keep at least one subject.");
      playDuelSound("remove");
      setPicked(picked.filter((x) => x !== subject));
      setWarn("");
      return;
    }
    if (paper.length >= max) {
      return flash(
        subject,
        source === "MIXED" && max < maxSubjects
          ? `Mixed duels take up to ${max} subjects. Remove one to swap it.`
          : `That's ${max} already, a full paper. Remove one to swap it.`,
      );
    }
    playDuelSound("add");
    setPicked([...paper, subject]);
    setWarn("");
  }

  function pickSource(next: DuelQuestionSource) {
    playDuelSound("tap");
    setSource(next);
    setWarn("");
    if (next === "MIXED" && picked.length > mixedMax) {
      const dropped = picked.slice(mixedMax);
      setPicked(picked.slice(0, mixedMax));
      setWarn(`Mixed duels take up to ${mixedMax} subjects, so ${dropped.join(" and ")} came out.`);
    }
  }

  function toggleTaster() {
    if (!isPremium) return playDuelSound("no");
    playDuelSound("tap");
    setTasterWanted(!tasterWanted);
    setWarn("");
  }

  function step(direction: -1 | 1) {
    if (!options || seconds === null) return;
    const next = clamp(seconds + direction * options.stepSeconds, options.minSeconds, options.maxSeconds);
    if (next === seconds) return;
    playDuelSound("tap");
    setChosenSeconds(next);
  }

  function rollName() {
    playDuelSound("tap");
    const ideas = nameIdeas(firstName(profile.fullName), targetName ? firstName(targetName) : null, paper);
    setName(ideas[nameIdx.current % ideas.length]);
    nameIdx.current += 1;
  }

  const busy = create.isPending || challenge.isPending;

  async function submit() {
    if (paper.length === 0) return flash("", "Pick a subject first.");
    const payload = {
      subjects: paper,
      questionSource: taster ? undefined : source,
      customName: name.trim() || null,
      durationSeconds: taster || chosenSeconds === null ? undefined : seconds ?? undefined,
      isTaster: taster,
    };
    try {
      playDuelSound("print");
      const result = targetId
        ? await challenge.mutateAsync({ ...payload, challengedUserId: targetId })
        : await create.mutateAsync(payload);
      router.replace(`/dashboard/duel/${result.session.code}?printed=1` as Route);
    } catch (error) {
      const code = apiErrorCode(error);
      if (code === "DUEL_TARGET_NEEDS_TASTER") {
        setTasterWanted(true);
        setWarn(`${firstName(targetName)} is on the free plan, so it has to be a taster. Taster is on now: pick one subject and send it again.`);
        return;
      }
      if (code === "DUEL_FREE_PASS_USED") {
        toast.error("You've used this week's free duel. A new one comes on Sunday.");
        return;
      }
      if (code === "DUEL_TASTER_SET_NOT_READY") {
        toast.error(`Taster questions for ${paper[0]} aren't ready yet. Pick another subject.`);
        return;
      }
      toast.error(apiErrorMessage(error, "Could not make the duel. Try again."));
    }
  }

  const subjectNote =
    warn ||
    (taster
      ? "Taster duels are one subject. Tap another to swap."
      : paper.length === max
        ? max === maxSubjects
          ? "A full paper, like the real exam. Tap a subject to take it out."
          : "That's the most a mixed duel takes."
        : "Tap to add or remove. Numbers show the order on the paper.");

  return (
    <div className={cn("sb-ui", s.page)}>
      <header className={s.top}>
        <Link className={s.iconBtn} href={"/dashboard/duel" as Route} aria-label="Back to Duel">
          <BackIcon />
        </Link>
        <h1 className={s.topTitle}>{targetName ? `Challenge ${shortName(targetName)}` : "Challenge a friend"}</h1>
      </header>

      <div className={u.form}>
        {targetName && (
          <section className={u.field}>
            <div className={u.to}>
              <DuelAvatar size={44} />
              <div>
                <b>{shortName(targetName)}</b>
                <small>Gets your challenge on their Duel page. They have 30 minutes to say yes.</small>
              </div>
            </div>
          </section>
        )}

        <section className={u.field}>
          <button
            type="button"
            className={cn(u.taster, taster && u.on, !isPremium && u.locked)}
            role="switch"
            aria-checked={taster}
            onClick={toggleTaster}
          >
            <span>
              <b>Taster duel</b>
              <small>
                {!isPremium
                  ? "Free duels are always tasters: one subject, 15 questions."
                  : taster
                    ? "On. Free friends can join. One subject, 15 questions from the taster set."
                    : "Switch on so a free friend can join. One subject, 15 questions."}
              </small>
            </span>
            <span className={u.tsw} aria-hidden="true"><i /></span>
          </button>
        </section>

        <section className={u.field}>
          <div className={u.fHead}>
            <h2>Subjects</h2>
            <span className={u.count}><b>{paper.length}</b> of {max}</span>
          </div>
          {bigBoard ? (
            <BigSubjectPicker
              subjects={subjects}
              picked={paper}
              max={max}
              department={profile.department ?? null}
              taster={taster}
              onToggle={toggle}
              nudge={nudge}
            />
          ) : (
            <div className={u.slist} role="group" aria-label="Pick your subjects">
              {subjects.map((subject) => (
                <SubjectRow
                  key={subject.name}
                  subject={subject}
                  order={paper.indexOf(subject.name)}
                  full={!taster && !paper.includes(subject.name) && paper.length >= max}
                  taster={taster}
                  nudge={nudge === subject.name}
                  onToggle={() => toggle(subject.name)}
                />
              ))}
            </div>
          )}
          <div className={u.paperLine}>
            <span>Your paper: <b>{paper.length ? paper.join(", ") : "nothing yet"}</b></span>
            <span className="ui-num">{questions} Qs</span>
          </div>
          <p className={cn(u.hint, warn && u.warn)} aria-live="polite">{subjectNote}</p>
        </section>

        {taster ? (
          <section className={u.field}>
            <div className={u.fHead}><h2>Questions and time</h2></div>
            <div className={u.fixed}>
              <span>From the taster set, the same for both of you. We pick ones neither of you has seen, where we can.</span>
              <b>{TASTER_QUESTIONS} · {TASTER_MINUTES} min</b>
            </div>
          </section>
        ) : (
          <>
            <section className={u.field}>
              <div className={u.fHead}><h2>Questions</h2></div>
              <div className={u.seg}>
                {SOURCES.map((option) => {
                  const on = source === option.id;
                  return (
                    <button key={option.id} type="button" className={cn(u.opt, on && u.on)} aria-pressed={on} onClick={() => pickSource(option.id)}>
                      <span className={u.dot} aria-hidden="true" />
                      <span>
                        <b>{option.label}</b>
                        <small>{option.id === "MIXED" && mixedMax < maxSubjects ? `Some of each, up to ${mixedMax} subjects` : option.note(board)}</small>
                      </span>
                      {option.tag ? <span className={u.tag}>{option.tag}</span> : <span />}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={u.field}>
              <div className={u.fHead}><h2>Time</h2><span>{questions} questions</span></div>
              <div className={u.stepper}>
                <button type="button" aria-label="Less time" disabled={!options || seconds === null || seconds <= options.minSeconds} onClick={() => step(-1)}>
                  <MinusIcon />
                </button>
                <output>
                  <b>{minutes ?? "–"}</b>
                  <span>
                    {diff === 0 ? "minutes · the normal time" : diff > 0 ? `minutes · ${diff} more than normal` : `minutes · ${-diff} less than normal`}
                  </span>
                </output>
                <button type="button" aria-label="More time" disabled={!options || seconds === null || seconds >= options.maxSeconds} onClick={() => step(1)}>
                  <PlusIcon />
                </button>
              </div>
            </section>
          </>
        )}

        <section className={u.field}>
          <div className={u.fHead}>
            <h2><label htmlFor="duel-name">Name</label></h2>
            <span>optional</span>
          </div>
          <div className={u.namebox}>
            <input
              id="duel-name"
              type="text"
              maxLength={40}
              placeholder="e.g. Saturday paper"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <button type="button" onClick={rollName}>Make one up</button>
          </div>
        </section>
      </div>

      <div className={cn(u.foot, u.stickyBar)}>
        <p>
          {taster
            ? "Anyone can join, free or premium. A free friend uses their free duel for the week."
            : "Your friend needs premium and 2 finished exams to join. Free friends can only join tasters."}
        </p>
        <button type="button" className={cn(s.btn, s.ink, s.wide)} disabled={busy || paper.length === 0} onClick={submit}>
          {busy ? "Printing…" : targetName ? `Send the challenge to ${firstName(targetName)}` : "Make the duel slip"}
        </button>
      </div>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function SubjectRow({
  subject,
  order,
  full,
  taster,
  nudge,
  onToggle,
}: {
  subject: ExamProfileSubject;
  order: number;
  full: boolean;
  taster: boolean;
  nudge: boolean;
  onToggle: () => void;
}) {
  const on = order >= 0;
  const count = taster ? TASTER_QUESTIONS : subject.questionCount;
  const note = taster
    ? on ? `Your taster subject · ${count} questions` : `${count} questions`
    : on ? `Subject ${order + 1} · ${count} questions` : `${count} questions`;
  return (
    <button
      type="button"
      className={cn(u.srow, on && u.on, full && u.full, nudge && u.nudge)}
      aria-pressed={on}
      aria-disabled={full}
      onClick={onToggle}
    >
      <SubjectTile iconName={subject.iconName} code={subject.code} colorToken={subject.colorToken} size={40} />
      <span className={u.stext}>
        <b>{subject.name}</b>
        <small>{note}</small>
      </span>
      <span className={u.mark} aria-hidden="true">{on ? order + 1 : <PlusIcon />}</span>
    </button>
  );
}

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden="true">
    <path d="M12 6v12M6 12h12" />
  </svg>
);
const MinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
    <path d="M6 12h12" />
  </svg>
);

/** The /dashboard/duel/new page. */
export function DuelSetupPage() {
  return <DuelScreen errorText="Could not load Challenge a friend.">{({ profile }) => <DuelSetup profile={profile} />}</DuelScreen>;
}
