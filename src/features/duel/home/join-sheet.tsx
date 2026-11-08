"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useJoinDuelMutation } from "@/features/duel/hooks/use-duel";
import { getDuelByCode, type DuelHome, type DuelSessionFull } from "@/lib/api/duel";
import type { UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { DuelSlip } from "../ui/duel-slip";
import { PassUsedSheet } from "./pass-used-sheet";

type CodeState = "idle" | "checking" | "bad" | "found";

function clean(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

/**
 * "Join a duel": the six-character code from a friend's slip, typed or
 * pasted. A link from WhatsApp opens the duel straight away instead.
 */
export function JoinSheet({
  profile,
  freeDuel,
  onClose,
}: {
  profile: UserProfile;
  freeDuel: DuelHome["freeDuel"];
  onClose: () => void;
}) {
  const router = useRouter();
  const join = useJoinDuelMutation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [state, setState] = useState<CodeState>("idle");
  const [focus, setFocus] = useState(false);
  const [shake, setShake] = useState(0);
  const [found, setFound] = useState<DuelSessionFull | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (code.length !== 6 && code.length !== 8) return;
    let cancelled = false;
    getDuelByCode(code)
      .then((snapshot) => {
        if (cancelled) return;
        setFound(snapshot.session);
        setState("found");
      })
      .catch(() => {
        if (cancelled) return;
        setFound(null);
        setState("bad");
        setShake((n) => n + 1);
      });
    return () => {
      cancelled = true;
    };
  }, [code]);

  function type(raw: string) {
    const next = clean(raw);
    setCode(next);
    setError(null);
    if (next.length === 6 || next.length === 8) {
      setState("checking");
    } else {
      setState("idle");
      setFound(null);
    }
  }

  async function paste() {
    try {
      type(await navigator.clipboard.readText());
    } catch {
      inputRef.current?.focus();
    }
  }

  const free = !freeDuel.isPremium;
  const passUsed = free && freeDuel.available === false;
  const alreadyIn = found?.participants.some((participant) => participant.userId === profile.id) ?? false;

  if (found && free && found.isTaster && passUsed && !alreadyIn) {
    return <PassUsedSheet duel={found} freeDuel={freeDuel} onClose={onClose} />;
  }

  async function go() {
    if (!found) return;
    setError(null);
    if (alreadyIn) {
      router.push(`/dashboard/duel/${found.code}` as Route);
      return;
    }
    try {
      await join.mutateAsync(found.code);
      router.push(`/dashboard/duel/${found.code}` as Route);
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : "Could not join this duel.");
    }
  }

  const host = found?.participants.find((participant) => participant.userId === found.hostUserId);
  const cells: Array<{ dash: true } | { dash: false; ch: string; cls: string }> = [];
  for (let index = 0; index < 6; index += 1) {
    if (index === 3) cells.push({ dash: true });
    const ch = code[index] ?? "";
    let cls = ch ? s.filled : "";
    if (state === "found") cls = s.good;
    else if (state === "bad") cls = s.bad;
    else if (focus && index === Math.min(code.length, 5) && state === "idle") cls = cn(cls, s.active);
    cells.push({ dash: false, ch, cls });
  }

  const fullDuelBlocked = Boolean(found && free && !found.isTaster && !alreadyIn);

  return (
    <div className={cn("sb-ui", s.scrim)} onClick={onClose}>
      <div className={s.sheet} role="dialog" aria-label="Join a duel" onClick={(event) => event.stopPropagation()}>
        <div className={s.grab} aria-hidden="true" />
        <div className={s.sheetHead}>
          <h2>Join a duel</h2>
          <button type="button" className={s.iconBtn} aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <p className={s.sub}>Type the 6-character code on your friend&apos;s duel slip. A link from WhatsApp fills it in for you.</p>

        <label className={s.codebox}>
          <input
            ref={inputRef}
            className={s.codeInput}
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={9}
            aria-label="Duel code"
            value={code}
            onChange={(event) => type(event.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
          <span key={shake} className={cn(s.cells, state === "bad" && s.shake)} aria-hidden="true">
            {cells.map((cell, index) =>
              cell.dash ? (
                <span key={index} className={s.dashcell}>–</span>
              ) : (
                <span key={index} className={cn(s.cell, cell.cls)}>{cell.ch}</span>
              ),
            )}
          </span>
        </label>

        <div className={s.codeRow}>
          <button type="button" className={cn(s.btn, s.line, s.sm)} onClick={paste}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect width="8" height="4" x="8" y="2" rx="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            </svg>
            Paste
          </button>
          {state === "checking" && (
            <span className={s.status}>
              <span className={s.checking} aria-hidden="true"><i /><i /><i /></span>
              Checking the code
            </span>
          )}
        </div>

        {state === "bad" && (
          <p className={s.badMsg} role="alert">
            No duel has that code. Check it with your friend, or ask them for a fresh slip.
          </p>
        )}

        {state === "found" && found && (
          <>
            <DuelSlip duel={found} hostName={host?.fullName ?? "Your friend"} variant="preview" />
            {fullDuelBlocked ? (
              <p className={s.badMsg} role="alert">
                This is a full duel, and those need premium. Ask your friend to switch on &quot;Taster duel&quot; so you can play free.
              </p>
            ) : (
              <button type="button" className={cn(s.btn, s.ink, s.wide, s.joinGo)} disabled={join.isPending} onClick={go}>
                {alreadyIn ? "Back to this duel" : `Join ${host ? host.fullName.split(" ")[0] : "your friend"}'s duel`}
              </button>
            )}
            {error && <p className={s.badMsg} role="alert">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
