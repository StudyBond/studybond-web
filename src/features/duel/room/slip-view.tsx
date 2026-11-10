"use client";

import { useState } from "react";

import type { DuelSessionFull } from "@/lib/api/duel";
import { cn } from "@/lib/utils/cn";

import s from "../ui/duel.module.css";
import { DuelSlip } from "../ui/duel-slip";
import { WhatsAppIcon } from "../ui/icons";
import { DuelAvatar, firstName, printedCode, shortName } from "../ui/parts";
import { playDuelSound } from "../ui/sfx";
import r from "./room.module.css";

/** The public link a slip carries: /d/<code> opens for anyone, account or not. */
export function slipLink(code: string): string {
  const origin = typeof window === "undefined" ? "https://studybond.app" : window.location.origin;
  return `${origin}/d/${code.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`;
}

export function slipMessage(duel: DuelSessionFull, hostName: string): string {
  const what = duel.isTaster
    ? `a ${duel.subjects[0]} taster, ${duel.totalQuestions} questions`
    : `${duel.subjects.join(", ")}, ${duel.totalQuestions} questions`;
  return `${firstName(hostName)} challenged you to a duel on StudyBond: ${what}. Code ${printedCode(duel.code)}. ${slipLink(duel.code)}`;
}

/**
 * The host's slip while they wait (board 2, after "Make the duel slip"):
 * the printed slip, WhatsApp and Copy link, then "waiting" until the friend
 * joins, then "Tobi A. joined" and Go to the duel.
 */
export function SlipView({
  duel,
  hostName,
  boardName,
  rival,
  rivalLine,
  onGo,
}: {
  duel: DuelSessionFull;
  hostName: string;
  boardName: string;
  rival: { fullName: string } | null;
  rivalLine: string;
  onGo: () => void;
}) {
  const [copied, setCopied] = useState<"" | "link" | "wa">("");

  async function copy() {
    playDuelSound("tap");
    try {
      await navigator.clipboard.writeText(slipLink(duel.code));
      setCopied("link");
    } catch {
      setCopied("");
    }
  }

  function whatsapp() {
    playDuelSound("tap");
    setCopied("wa");
    window.open(`https://wa.me/?text=${encodeURIComponent(slipMessage(duel, hostName))}`, "_blank", "noopener");
  }

  return (
    <div>
      <DuelSlip duel={duel} hostName={hostName} boardName={boardName} variant="printed" onDesk />

      <div className={r.share}>
        <button type="button" className={cn(s.btn, s.wa, s.wide)} onClick={whatsapp}>
          <WhatsAppIcon />
          Send on WhatsApp
        </button>
        <button type="button" className={cn(s.btn, s.line, s.wide)} onClick={copy}>
          Copy link
        </button>
        <div className={r.copied} aria-live="polite">
          {copied === "link" ? "Link copied." : copied === "wa" ? "WhatsApp opens with the slip link, ready to send." : ""}
        </div>
      </div>

      {rival ? (
        <>
          <div className={r.joined}>
            <DuelAvatar size={52} />
            <div>
              <b>{shortName(rival.fullName)} joined</b>
              {rivalLine && <span>{rivalLine}</span>}
            </div>
          </div>
          <div className={r.go}>
            <button type="button" className={cn(s.btn, s.ink, s.wide)} onClick={onGo}>
              Go to the duel
            </button>
          </div>
        </>
      ) : (
        <div className={r.wait} aria-live="polite">
          <i />
          <i />
          <i />
          <span>
            {duel.kind === "CHALLENGE"
              ? "Sent. Waiting for them to say yes"
              : "Waiting for your friend to join"}
          </span>
        </div>
      )}
    </div>
  );
}
