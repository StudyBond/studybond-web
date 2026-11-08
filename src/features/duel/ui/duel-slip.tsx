"use client";

import type { DuelSessionFull } from "@/lib/api/duel";
import { cn } from "@/lib/utils/cn";

import { DuelAvatar, formatLeft, minutesLabel, printedCode, shortName, useNow } from "./parts";
import s from "./slip.module.css";

const SOURCE_LABEL: Record<string, string> = {
  REAL_PAST_QUESTION: "Real past questions",
  PRACTICE: "Practice questions",
  MIXED: "Mixed questions",
};

export function sourceLabel(duel: Pick<DuelSessionFull, "questionSource" | "isTaster">): string {
  if (duel.isTaster) return "Taster questions";
  return SOURCE_LABEL[duel.questionSource] ?? "Real past questions";
}

/**
 * The duel slip. "printed" is the host's own slip coming out of the printer
 * on Challenge a friend; "preview" is what a friend sees before joining.
 */
export function DuelSlip({
  duel,
  hostName,
  boardName,
  variant,
  hostLine,
  onDesk = false,
}: {
  duel: DuelSessionFull;
  hostName: string;
  boardName?: string;
  variant: "printed" | "preview";
  /** Under the inviter's name on the preview, e.g. "You lead 3–2". */
  hostLine?: string;
  /** Notches cut to the page colour instead of the sheet colour. */
  onDesk?: boolean;
}) {
  const now = useNow();
  const left = duel.expiresAt ? new Date(duel.expiresAt).getTime() - now : null;
  const expired = left !== null && left <= 0;
  const expiresText = left === null ? "No expiry" : expired ? "Expired" : `in ${formatLeft(left)}`;
  const kind = duel.isTaster ? "Taster duel" : "Duel slip";
  const length = `${duel.totalQuestions} questions${duel.durationSeconds ? ` · ${minutesLabel(duel.durationSeconds)}` : ""}`;
  const paper = boardName ? `${boardName} · ${sourceLabel(duel)}` : sourceLabel(duel);

  if (variant === "printed") {
    return (
      <div className={cn(s.paper, onDesk && s.onDesk)}>
        <div className={s.printer}>
          <div className={s.printerTop} />
          <div className={s.printerSlot} />
        </div>
        <div className={s.clip}>
          <div className={s.slip}>
            <div className={s.head}><b>StudyBond</b><span>{kind}</span></div>
            <div className={s.codeLabel}>Code</div>
            <div className={s.bigCode}>{printedCode(duel.code)}</div>
            <dl className={s.dl}>
              <dt>Name</dt><dd>{duel.customName ?? `${shortName(hostName).split(" ")[0]}'s duel`}</dd>
              <dt>From</dt><dd>{shortName(hostName)}</dd>
              <dt>Paper</dt><dd>{paper}</dd>
              <dt>Subjects</dt><dd>{duel.subjects.join(", ")}</dd>
              <dt>Length</dt><dd>{length}</dd>
              <dt>Expires</dt><dd className="ui-num">{expiresText}</dd>
            </dl>
            <div className={s.tear} />
            <p>Your friend opens the link, or taps Join with a code on their Duel page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(s.paper, onDesk && s.onDesk)}>
      <div className={s.mini}>
        <div className={s.head}><b>StudyBond</b><span>{kind}</span></div>
        <div className={s.from}>
          <DuelAvatar size={40} />
          <div>
            <b>{shortName(hostName)} challenged you</b>
            {hostLine && <span>{hostLine}</span>}
          </div>
        </div>
        <dl className={s.dl}>
          <dt>Paper</dt><dd>{paper}</dd>
          <dt>Subjects</dt><dd>{duel.subjects.join(", ")}</dd>
          <dt>Length</dt><dd>{length}</dd>
          <dt>Expires</dt><dd className="ui-num">{expiresText}</dd>
        </dl>
        <div className={s.tear} />
        <span className={s.miniCode}>{printedCode(duel.code)}</span>
      </div>
    </div>
  );
}
