import type { BoardEntry } from "@/lib/api/leaderboard";

/* What the student saw on their last visit to this week's board, so the next
   visit can replay the climb: rows slide from where they were to where they
   are now, and a note says who they passed. Kept in this browser only, keyed
   by account, board and week, so it never leaks between accounts. It is a
   nicety: if storage is blocked, the board simply shows without the replay. */

export type SeenBoard = {
  myRank: number | null;
  /** userId -> rank at the last visit, for the rows that were shown. */
  ranks: Record<string, number>;
  names: Record<string, string>;
};

function key(userId: number, boardId: number, weekStartDate: string) {
  return `sb-lb-seen:${userId}:${boardId}:${weekStartDate}`;
}

export function readSeen(userId: number, boardId: number, weekStartDate: string): SeenBoard | null {
  try {
    const raw = window.localStorage.getItem(key(userId, boardId, weekStartDate));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SeenBoard;
    return parsed && typeof parsed === "object" && parsed.ranks ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSeen(userId: number, boardId: number, weekStartDate: string, myRank: number | null, rows: BoardEntry[]) {
  try {
    const ranks: Record<string, number> = {};
    const names: Record<string, string> = {};
    for (const row of rows) {
      ranks[row.userId] = row.rank;
      names[row.userId] = row.displayName;
    }
    window.localStorage.setItem(key(userId, boardId, weekStartDate), JSON.stringify({ myRank, ranks, names }));
    /* Last week's key is no use any more. */
    for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(`sb-lb-seen:${userId}:${boardId}:`) && k !== key(userId, boardId, weekStartDate)) {
        window.localStorage.removeItem(k);
      }
    }
  } catch {
    // Storage blocked: no replay next time, nothing else changes.
  }
}

/** First names of the students the viewer passed since the last visit. */
export function passedSince(seen: SeenBoard, myOldRank: number, myNewRank: number, rows: BoardEntry[]): string[] {
  const nowRank = new Map(rows.map((row) => [String(row.userId), row.rank]));
  return Object.entries(seen.ranks)
    .filter(([id, oldRank]) => {
      const current = nowRank.get(id);
      return oldRank < myOldRank && current !== undefined && current > myNewRank;
    })
    .sort((a, b) => a[1] - b[1])
    .map(([id]) => (seen.names[id] ?? "someone").split(" ")[0]);
}
