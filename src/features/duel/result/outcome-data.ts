import type { DuelSessionFull, RivalAnswers } from "@/lib/api/duel";
import type { ExamResult } from "@/lib/api/types";

export type Outcome = "W" | "L" | "D";

export type SubjectRow = {
  name: string;
  total: number;
  mine: number;
  theirs: number;
  /** Right or wrong per question, in paper order. */
  myMarks: boolean[];
  /** Null when the rival's picks are locked (free plan): only counts are known. */
  theirMarks: boolean[] | null;
};

/** Subjects in paper order, with both players' marks. */
export function subjectRows(result: ExamResult, rival: RivalAnswers | null, rivalScore: number): SubjectRow[] {
  const theirById = new Map((rival?.answers ?? []).map((answer) => [answer.questionId, answer.isCorrect]));
  const unlocked = Boolean(rival && !rival.locked);
  const rows: SubjectRow[] = [];
  for (const question of result.questions) {
    let row = rows.find((r) => r.name === question.subject);
    if (!row) {
      row = { name: question.subject, total: 0, mine: 0, theirs: 0, myMarks: [], theirMarks: unlocked ? [] : null };
      rows.push(row);
    }
    row.total += 1;
    row.myMarks.push(question.isCorrect);
    if (question.isCorrect) row.mine += 1;
    if (unlocked) {
      const right = theirById.get(question.id) === true;
      row.theirMarks!.push(right);
      if (right) row.theirs += 1;
    }
  }
  // Locked: one subject (tasters) takes the rival's total; more can't be split.
  if (!unlocked && rows.length === 1) rows[0].theirs = rivalScore;
  return rows;
}

export function outcomeFor(duel: DuelSessionFull, myUserId: number): { outcome: Outcome; myScore: number; rivalScore: number; walkover: boolean } {
  const me = duel.participants.find((p) => p.userId === myUserId);
  const rival = duel.participants.find((p) => p.userId !== myUserId);
  const myScore = me?.score ?? 0;
  const rivalScore = rival?.score ?? 0;
  const walkover = Boolean(rival && rival.participantState !== "FINISHED" && !rival.finishedAt);
  let outcome: Outcome;
  if (me?.finalRank && rival?.finalRank) {
    outcome = me.finalRank === rival.finalRank ? "D" : me.finalRank < rival.finalRank ? "W" : "L";
  } else if (walkover) {
    outcome = "W";
  } else {
    outcome = myScore === rivalScore ? "D" : myScore > rivalScore ? "W" : "L";
  }
  return { outcome, myScore, rivalScore, walkover };
}

function names(list: string[]) {
  if (list.length <= 1) return list.join("");
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
}

/** One or two plain sentences on how the duel turned. Only says what is true. */
export function turnLine(rows: SubjectRow[], rival: string, outcome: Outcome, walkover: boolean): string {
  if (walkover) return `${rival}'s time ran out before they submitted, so the duel is yours.`;

  if (rows.length === 1) {
    const row = rows[0];
    const mine = row.myMarks;
    const theirs = row.theirMarks;
    if (theirs) {
      // The last point it was level, counting question by question.
      let you = 0;
      let them = 0;
      let lastLevel = -1;
      let levelAt = 0;
      for (let i = 0; i < mine.length - 1; i++) {
        if (mine[i]) you += 1;
        if (theirs[i]) them += 1;
        if (you === them && you > 0) {
          lastLevel = i + 1;
          levelAt = you;
        }
      }
      if (lastLevel > 0 && outcome !== "D") {
        return `Level at ${levelAt} after ${lastLevel} questions. ${outcome === "W" ? "You" : rival} pulled away from there.`;
      }
    }
    return `You got ${row.mine} of ${row.total}. ${rival} got ${row.theirs}.`;
  }

  const youTook = rows.filter((r) => r.mine > r.theirs).map((r) => r.name);
  const theyTook = rows.filter((r) => r.theirs > r.mine).map((r) => r.name);
  const level = rows.filter((r) => r.theirs === r.mine).map((r) => r.name);

  // Was it level after some subject before the last?
  let you = 0;
  let them = 0;
  let levelClause = "";
  for (let i = 0; i < rows.length - 1; i++) {
    you += rows[i].mine;
    them += rows[i].theirs;
    if (you === them) levelClause = `It was level at ${you} after ${rows[i].name}. `;
  }

  const parts: string[] = [];
  if (youTook.length) parts.push(`you took ${names(youTook)}`);
  if (theyTook.length) parts.push(`${rival} took ${names(theyTook)}`);
  if (level.length) parts.push(`${names(level)} ${level.length === 1 ? "was" : "were"} level`);
  const took = parts.join(", ");
  return `${levelClause}${took.charAt(0).toUpperCase()}${took.slice(1)}.`;
}

export function headline(outcome: Outcome, rival: string, myScore: number, rivalScore: number): string {
  const margin = Math.abs(myScore - rivalScore);
  const marks = `${margin} mark${margin === 1 ? "" : "s"}`;
  if (outcome === "W") return `You beat ${rival} by ${marks}.`;
  if (outcome === "L") return `${rival} won by ${marks}.`;
  return `Dead level at ${myScore} each.`;
}
