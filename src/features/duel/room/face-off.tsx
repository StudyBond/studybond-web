"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { useDuelFaceOff, useTapReady } from "@/features/duel/hooks/use-duel-play";
import type { DuelSessionFull, FaceOffPlayer } from "@/lib/api/duel";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import {
  DuelAvatar,
  FormGuide,
  apiErrorMessage,
  firstName,
  headToHeadLine,
  minutesLabel,
  shortName,
} from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import r from "./room.module.css";

function recordText(player: FaceOffPlayer | undefined) {
  if (!player) return "0–0–0";
  const { won, lost, drawn } = player.record;
  return `${won}–${lost}–${drawn}`;
}

/**
 * The face-off (board 3): both students on gradient cards, "v.", the
 * head-to-head form, READY stamps, then 3-2-1 once both have tapped ready.
 * The backend starts the duel by itself when the second player is ready.
 */
export function FaceOff({
  duel,
  myUserId,
  myName,
  paperLine,
  started,
  onCountdownDone,
  onLeave,
  leaving,
}: {
  duel: DuelSessionFull;
  myUserId: number;
  myName: string;
  paperLine: React.ReactNode;
  /** True once the duel is IN_PROGRESS: the countdown runs, then onCountdownDone. */
  started: boolean;
  onCountdownDone: () => void;
  onLeave: () => void;
  leaving: boolean;
}) {
  const faceOff = useDuelFaceOff(duel.id);
  const ready = useTapReady(duel.code);
  const me = duel.participants.find((participant) => participant.userId === myUserId);
  const rival = duel.participants.find((participant) => participant.userId !== myUserId);
  const mePlayer = faceOff.data?.players.find((player) => player.userId === myUserId);
  const rivalPlayer = faceOff.data?.players.find((player) => player.userId !== myUserId);
  const h2h = faceOff.data?.headToHead ?? null;
  const rivalFirst = firstName(rival?.fullName);

  const [tapped, setTapped] = useState(false);
  const iAmReady = Boolean(me?.readyAt) || tapped;
  const rivalReady = Boolean(rival?.readyAt) || started;

  // The countdown: 3, 2, 1, then "Begin." with the button.
  const [count, setCount] = useState(0);
  const counted = useRef(false);
  useEffect(() => {
    if (!started || counted.current) return;
    counted.current = true;
    const steps: Array<[number, number]> = [[3, 0], [2, 900], [1, 1800], [4, 2700]];
    const timers = steps.map(([value, at]) =>
      window.setTimeout(() => {
        setCount(value);
        playDuelSound(value === 4 ? "start" : "count");
      }, at),
    );
    timers.push(window.setTimeout(onCountdownDone, 4100));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [started, onCountdownDone]);

  // Each card jolts once as its READY stamp lands (the class starts the animation).
  const lastRivalReady = useRef(rivalReady);
  useEffect(() => {
    if (rivalReady && !lastRivalReady.current) playDuelSound("ready");
    lastRivalReady.current = rivalReady;
  }, [rivalReady]);

  async function tapReady() {
    if (iAmReady) return;
    setTapped(true);
    playDuelSound("ready");
    try {
      await ready.mutateAsync(duel.id);
    } catch (error) {
      setTapped(false);
      toast.error(apiErrorMessage(error, "Could not tell the duel you're ready. Try again."));
    }
  }

  const minutes = minutesLabel(duel.durationSeconds);

  return (
    <div className={r.faceoff}>
      <div className={r.paperline}>{paperLine}</div>

      <div className={r.stage}>
        <section className={cn(r.cand, r.you, iAmReady && r.jolt)} aria-label="You">
          <div className={r.ring}><DuelAvatar self size={76} /></div>
          <div className={r.who}>
            <span className={r.tagline}><i />You</span>
            <b>{shortName(myName)}</b>
            <span className={r.course}>{mePlayer?.course ?? " "}</span>
            <div className={r.stats}>
              <div><strong>{mePlayer?.weeklyRank ? `#${mePlayer.weeklyRank}` : "–"}</strong><span>this week</span></div>
              <div><strong>{recordText(mePlayer)}</strong><span>duels</span></div>
            </div>
          </div>
          {iAmReady && <span className={r.stamp}>READY</span>}
        </section>

        <div className={r.mid}>
          <div className={r.vs}><hr /><b aria-label="versus">v.</b><hr /></div>
          <div className={r.h2h}>
            <span>{h2h ? headToHeadLine(h2h.wins, h2h.losses, rivalFirst) : "First duel"}</span>
            {h2h && h2h.form.length > 0 && (
              <FormGuide form={h2h.form} label={`Your last ${h2h.form.length} duels with ${rivalFirst}`} />
            )}
          </div>
          <p className={r.ruleNote}>
            Same {duel.totalQuestions} questions{minutes ? `, same ${minutes.replace(" min", " minutes")}` : ""}. The higher mark wins. Equal marks is a draw.
          </p>
        </div>

        <section className={cn(r.cand, r.rival, rivalReady && r.jolt)} aria-label="Your challenger">
          <div className={r.ring}><DuelAvatar size={76} /></div>
          <div className={r.who}>
            <span className={r.tagline}><i />Challenger</span>
            <b>{shortName(rival?.fullName)}</b>
            <span className={r.course}>{rivalPlayer?.course ?? " "}</span>
            <div className={r.stats}>
              <div><strong>{rivalPlayer?.weeklyRank ? `#${rivalPlayer.weeklyRank}` : "–"}</strong><span>this week</span></div>
              <div><strong>{recordText(rivalPlayer)}</strong><span>duels</span></div>
            </div>
          </div>
          {rivalReady ? (
            <span className={r.stamp}>READY</span>
          ) : (
            <span className={r.notReady} aria-label="Not ready yet"><i /><i /><i /></span>
          )}
        </section>
      </div>

      <div className={r.bottom}>
        {!iAmReady ? (
          <button type="button" className={cn(s.btn, s.ink, s.wide)} style={{ minHeight: 52 }} onClick={tapReady}>
            I&apos;m ready
          </button>
        ) : !started ? (
          <div className={r.waitline} aria-live="polite">Waiting for {rivalFirst} to tap ready</div>
        ) : null}
        {!started && (
          <button type="button" className={r.leave} disabled={leaving} onClick={onLeave}>
            Leave the duel
          </button>
        )}
      </div>

      {count > 0 && (
        <div className={cn("sb-ui", r.count)} aria-live="assertive">
          <div className={r.countIn}>
            {count < 4 ? (
              <>
                <b key={count} className={r.countN}>{count}</b>
                <small>{firstName(myName)} v {rivalFirst} · {duel.totalQuestions} questions</small>
              </>
            ) : (
              <>
                <b className={r.countGo}>Begin.</b>
                <small>Your paper is open. {rivalFirst}&apos;s is too.</small>
                <button type="button" className={cn(s.btn, s.ink, r.countBtn)} onClick={onCountdownDone}>
                  Start writing
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
