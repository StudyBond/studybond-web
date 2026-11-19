"use client";

import { useEffect, useState } from "react";

import { ghostStoreKey, type StoredGhost } from "../ghost/ghost-race";
import { DuelRace } from "./duel-race";

function readGhost(examId: number): StoredGhost | null {
  try {
    const raw = window.sessionStorage.getItem(ghostStoreKey(examId));
    return raw ? (JSON.parse(raw) as StoredGhost) : null;
  } catch {
    return null;
  }
}

/**
 * Where the ghost is: the question it is on follows the real times in its
 * timeline, counted from when the race started. Null when there is no ghost
 * (or `enabled` is false). `question` is 1-based.
 */
export function useGhostPosition(
  examId: number,
  total: number,
  enabled = true,
): { question: number; finished: boolean } | null {
  const [ghost] = useState(() => (typeof window === "undefined" || !enabled ? null : readGhost(examId)));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!ghost) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [ghost]);

  if (!ghost || ghost.timeline.length === 0) return null;

  const elapsed = Math.max(0, (now - new Date(ghost.startedAt).getTime()) / 1000);
  let spent = 0;
  let question = 1;
  for (let i = 0; i < ghost.timeline.length; i++) {
    spent += ghost.timeline[i];
    if (spent > elapsed) break;
    question = Math.min(total, i + 2);
  }
  const finished = spent <= elapsed && elapsed >= ghost.timeline.reduce((sum, seconds) => sum + seconds, 0);
  return { question, finished };
}

/** The ghost's lane during a ghost race (the old race strip). */
export function GhostLane({
  examId,
  myQuestion,
  total,
  questionSubjects,
}: {
  examId: number;
  myQuestion: number;
  total: number;
  questionSubjects: string[];
}) {
  const pos = useGhostPosition(examId, total);
  if (!pos) return null;
  const { question, finished } = pos;

  return (
    <DuelRace
      rivalName="Ghost"
      myQuestion={myQuestion}
      rivalQuestion={question}
      rivalFinished={finished}
      total={total}
      questionSubjects={questionSubjects}
      incoming={null}
      onReact={null}
    />
  );
}
