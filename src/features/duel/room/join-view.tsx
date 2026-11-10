"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { duelSessionQueryKey, useJoinDuelMutation } from "@/features/duel/hooks/use-duel";
import { useAnswerChallenge, useDuelHome } from "@/features/duel/hooks/use-duel-play";
import { askForTaster, type DuelSessionFull } from "@/lib/api/duel";
import type { UserProfile, UserStats } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import { PassUsedSheet } from "../home/pass-used-sheet";
import s from "../ui/duel.module.css";
import { DuelSlip } from "../ui/duel-slip";
import { GiftIcon, PaperIcon } from "../ui/icons";
import { apiErrorCode, apiErrorMessage, firstName, shortName } from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import r from "./room.module.css";

const GATE_EXAMS = 2;

/**
 * Someone signed in opens a friend's slip link. Premium students join; free
 * students join tasters with this week's free duel, and on a full paper can
 * ask the host for a taster instead (the note the invite landing promises).
 */
export function JoinView({
  duel,
  profile,
  stats,
  hostName,
  board,
}: {
  duel: DuelSessionFull;
  profile: UserProfile;
  stats: UserStats;
  hostName: string;
  board: string;
}) {
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const home = useDuelHome();
  const join = useJoinDuelMutation();
  const { accept, decline } = useAnswerChallenge();
  const [passSheet, setPassSheet] = useState(false);
  const host = firstName(hostName);
  const freeDuel = home.data?.freeDuel;
  const isPremium = freeDuel?.isPremium ?? profile.isPremium;
  const forMe = duel.kind === "CHALLENGE" && duel.challengedUserId === profile.id;
  const gateLeft = Math.max(0, GATE_EXAMS - stats.realExamsCompleted);

  const ask = useMutation({
    mutationFn: () => askForTaster(duel.id),
    onSuccess: () => playDuelSound("go"),
  });

  // Back from signup with ?ask=taster: send the request the landing promised.
  const asked = useRef(false);
  useEffect(() => {
    if (asked.current || params.get("ask") !== "taster" || isPremium || duel.isTaster) return;
    asked.current = true;
    ask.mutate();
  }, [params, isPremium, duel.isTaster, ask]);

  async function takeSeat() {
    playDuelSound("tap");
    try {
      if (forMe) await accept.mutateAsync(duel.id);
      else await join.mutateAsync(duel.code);
      await queryClient.invalidateQueries({ queryKey: duelSessionQueryKey(duel.code) });
    } catch (error) {
      const code = apiErrorCode(error);
      if (code === "DUEL_FREE_PASS_USED") {
        setPassSheet(true);
        return;
      }
      if (code === "DUEL_INVITE_EXPIRED") {
        toast.error(`This slip has expired. Ask ${host} for a new one.`);
        return;
      }
      toast.error(apiErrorMessage(error, "Could not join the duel."));
    }
  }

  const fullPaperForFree = !isPremium && !duel.isTaster;
  const gated = isPremium && !duel.isTaster && gateLeft > 0;
  const busy = join.isPending || accept.isPending;

  return (
    <div className={r.joinWrap}>
      <h2>{duel.kind === "CHALLENGE" && duel.rematchOfSessionId ? `${host} wants a rematch` : `${host} challenged you to a duel`}</h2>
      <p>
        {duel.isTaster
          ? `You both get the same ${duel.totalQuestions} questions and the same clock, and you watch each other live. Whoever gets more right wins.`
          : "Same questions, same clock, and you watch each other's progress live. Whoever gets more marks wins."}
      </p>

      <DuelSlip duel={duel} hostName={hostName} boardName={board} variant="preview" onDesk />

      {fullPaperForFree ? (
        <>
          <div className={cn(r.freeline, r.full)}>
            <PaperIcon />
            <span>
              <b>This one is a full paper</b>
              Free accounts play taster duels: one subject, 15 questions. Ask {host} for a taster, or go premium to take the full paper.
            </span>
          </div>
          <div className={r.actions}>
            <button
              type="button"
              className={cn(s.btn, s.ink, s.wide)}
              disabled={ask.isPending || ask.isSuccess}
              onClick={() => ask.mutate()}
            >
              {ask.isSuccess ? "Asked" : `Ask ${host} for a taster`}
            </button>
            <Link className={cn(s.btn, s.line, s.wide)} href={"/dashboard/settings?tab=subscription" as Route}>
              Go premium and take the full paper
            </Link>
          </div>
          {ask.isSuccess && (
            <p className={r.sentNote}>
              {ask.data?.alreadyAsked ? `You've asked ${host} already.` : `${host} gets a note: "Your friend wants a taster. Send one?"`}
            </p>
          )}
          {ask.isError && <p className={r.note}>{apiErrorMessage(ask.error, "Could not send the request.")}</p>}
        </>
      ) : gated ? (
        <>
          <div className={cn(r.freeline, r.full)}>
            <PaperIcon />
            <span>
              <b>Finish {gateLeft} more real exam{gateLeft === 1 ? "" : "s"} first</b>
              Full duels open after 2 finished exams. Taster duels are open now.
            </span>
          </div>
          <div className={r.actions}>
            <Link className={cn(s.btn, s.ink, s.wide)} href={"/dashboard/practice" as Route}>
              Take a real exam
            </Link>
          </div>
        </>
      ) : (
        <>
          {!isPremium && (
            <div className={r.freeline}>
              <GiftIcon />
              <span>
                <b>{freeDuel?.available === false ? "This week's free duel is used" : "This one is free"}</b>
                {freeDuel?.available === false
                  ? "A new free duel comes on Sunday."
                  : "It uses your free duel for this week. It never touches your free exam credits."}
              </span>
            </div>
          )}
          <div className={r.actions}>
            <button type="button" className={cn(s.btn, s.ink, s.wide)} disabled={busy} onClick={takeSeat}>
              {busy ? "Joining…" : forMe ? `Accept ${shortName(hostName)}'s challenge` : "Join the duel"}
            </button>
            {forMe && (
              <button
                type="button"
                className={cn(s.btn, s.line, s.wide)}
                disabled={decline.isPending}
                onClick={() => decline.mutate(duel.id)}
              >
                Not now
              </button>
            )}
          </div>
        </>
      )}

      {passSheet && freeDuel && <PassUsedSheet duel={duel} freeDuel={freeDuel} onClose={() => setPassSheet(false)} />}
    </div>
  );
}
