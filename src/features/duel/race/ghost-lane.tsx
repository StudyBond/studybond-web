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
 * The ghost's lane during a ghost race: the question it is on follows the
 * real times in its timeline, counted from when the race started.
 */
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
  const [ghost] = useState(() => (typeof window === "undefined" ? null : readGhost(examId)));
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

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
