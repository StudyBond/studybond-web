"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils/cn";

import { DuelAvatar, firstName } from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import d from "./race.module.css";

/** The six reactions, server-checked keys (duel phase two). */
export const DUEL_REACTIONS: Array<{ key: string; label: string }> = [
  { key: "omo", label: "Omo!" },
  { key: "no_shaking", label: "No shaking" },
  { key: "oya", label: "Oya!" },
  { key: "chai", label: "Chai!" },
  { key: "sharp", label: "Sharp!" },
  { key: "calm_down", label: "Calm down" },
];

const COOL_SECONDS = 5;

export type IncomingReaction = { id: string; label: string };

export function reactionLabel(keyOrEmoji: string): string {
  return DUEL_REACTIONS.find((reaction) => reaction.key === keyOrEmoji)?.label ?? keyOrEmoji;
}

/**
 * During the duel (mockup board 4): two race lanes showing the question each
 * of you is on, the subject marks, a short coach line, Hide / Show, and the
 * six reactions. Reactions pop up as speech bubbles on the runners.
 */
export function DuelRace({
  rivalName,
  myQuestion,
  rivalQuestion,
  rivalFinished,
  total,
  questionSubjects,
  incoming,
  onReact,
}: {
  rivalName: string;
  /** 1-based. */
  myQuestion: number;
  /** 1-based; null until the rival's first update arrives. */
  rivalQuestion: number | null;
  rivalFinished: boolean;
  total: number;
  /** The subject of each question in paper order, for the subject marks. */
  questionSubjects: string[];
  incoming: IncomingReaction | null;
  /** Null hides the reactions (a ghost can't hear them). */
  onReact: ((key: string) => void) | null;
}) {
  const [hidden, setHidden] = useState(false);
  const [cool, setCool] = useState(0);
  const [mySay, setMySay] = useState<{ id: string; label: string } | null>(null);
  const [rivalSay, setRivalSay] = useState<IncomingReaction | null>(null);
  const rival = firstName(rivalName);

  // A reaction from the rival: bubble on their runner for a moment.
  const lastIncoming = useRef<string | null>(null);
  const sent = useRef(0);
  useEffect(() => {
    if (!incoming || incoming.id === lastIncoming.current) return;
    lastIncoming.current = incoming.id;
    playDuelSound("react");
    const show = window.setTimeout(() => setRivalSay(incoming), 0);
    const hide = window.setTimeout(() => setRivalSay((current) => (current?.id === incoming.id ? null : current)), 2600);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [incoming]);

  useEffect(() => {
    if (cool <= 0) return;
    const timer = window.setTimeout(() => setCool((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cool]);

  function send(key: string, label: string) {
    if (cool > 0) return;
    playDuelSound("react");
    onReact?.(key);
    sent.current += 1;
    const id = `mine-${sent.current}`;
    setMySay({ id, label });
    setCool(COOL_SECONDS);
    window.setTimeout(() => setMySay((current) => (current?.id === id ? null : current)), 2600);
  }

  const theirs = rivalFinished ? total : rivalQuestion;
  const pct = (q: number | null) => (q === null || total <= 1 ? 0 : Math.min(100, ((q - 1) / (total - 1)) * 100));

  // Subject marks, sized by how many questions each subject has.
  const marks = useMemo(() => {
    const out: Array<{ name: string; count: number }> = [];
    for (const subject of questionSubjects) {
      const last = out[out.length - 1];
      if (last && last.name === subject) last.count += 1;
      else out.push({ name: subject, count: 1 });
    }
    return out;
  }, [questionSubjects]);

  let coach = `You're on the same question as ${rival}.`;
  if (rivalFinished) coach = `${rival} has ${onReact ? "submitted" : "finished"}. Take your time: marks win, not speed.`;
  else if (theirs === null) coach = `Waiting to see where ${rival} is.`;
  else if (theirs > myQuestion) {
    const gap = theirs - myQuestion;
    coach = `${rival} is ${gap} question${gap === 1 ? "" : "s"} ahead. Speed doesn't win a duel. Marks do.`;
  } else if (theirs < myQuestion) {
    const gap = myQuestion - theirs;
    coach = `You are ${gap} ahead. Use the spare time to check your answers.`;
  }

  return (
    <div className={cn("sb-ui", d.wrap)}>
      {hidden ? (
        <div className={d.mini}>
          <span><i style={{ background: "var(--ui-you)" }} />You <b className="ui-num">Q{myQuestion}</b></span>
          <span>
            <i style={{ background: "var(--ui-rival)" }} />
            {rival} <b className="ui-num">{rivalFinished ? "done" : theirs ? `Q${theirs}` : "…"}</b>
          </span>
          <button type="button" onClick={() => setHidden(false)}>Show</button>
        </div>
      ) : (
        <section className={d.race} aria-label="Duel progress">
          <div className={d.raceTop}>
            <span>Question you&apos;re each on</span>
            <button type="button" onClick={() => setHidden(true)}>Hide</button>
          </div>
          <Lane who="you" label="You" q={myQuestion} pct={pct(myQuestion)} say={mySay?.label ?? null} self />
          <Lane
            who="rival"
            label={rival}
            q={theirs}
            pct={pct(theirs)}
            say={rivalSay?.label ?? null}
            done={rivalFinished}
          />
          {marks.length > 1 && (
            <div className={d.subjects} aria-hidden="true" style={{ gridTemplateColumns: marks.map((mark) => `${mark.count}fr`).join(" ") }}>
              {marks.map((mark, index) => (
                <span key={`${mark.name}-${index}`}>{mark.name}</span>
              ))}
            </div>
          )}
          <p className={d.coach} aria-live="polite">{coach}</p>
        </section>
      )}

      {onReact && (
      <div className={d.react} aria-label={`Send ${rival} a reaction`}>
        <span>Send</span>
        {DUEL_REACTIONS.map((reaction) => (
          <button key={reaction.key} type="button" disabled={cool > 0} onClick={() => send(reaction.key, reaction.label)}>
            {reaction.label}
          </button>
        ))}
      </div>
      )}
      {/* Screen readers hear reactions without the bubbles. */}
      <p className={d.srOnly} aria-live="polite">{rivalSay ? `${rival}: ${rivalSay.label}` : ""}</p>
    </div>
  );
}

function Lane({
  who,
  label,
  q,
  pct,
  say,
  self = false,
  done = false,
}: {
  who: "you" | "rival";
  label: string;
  q: number | null;
  pct: number;
  say: string | null;
  self?: boolean;
  done?: boolean;
}) {
  return (
    <div className={cn(d.lane, who === "you" ? d.you : d.rival)}>
      <span className={d.nm}>{label}</span>
      <div className={d.track}>
        <div className={d.base} />
        <div className={d.fill} style={{ width: `${pct}%` }} />
        <div className={d.runner} style={{ left: `${pct}%` }}>
          {say && <span key={say} className={d.say}>{say}</span>}
          <div className={d.ringed}><DuelAvatar self={self} size={24} /></div>
        </div>
      </div>
      <span className={cn(d.q, "ui-num")}>{done ? "Done" : q ? `Q${q}` : "…"}</span>
    </div>
  );
}
