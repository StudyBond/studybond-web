import type { AvatarView } from "@/features/avatar/avatar-look";

/* The backend's share card (GET /api/share/results/:number), written by the
   server so the sheet, the images and the public page say the same thing.
   Kept here by hand until the generated types are re-synced. */

export type ShareKind = "DUEL" | "EXAM" | "GHOST";
export type ShareLook = "AMBER" | "MIDNIGHT";
export type ShareShape = "status" | "square" | "link";

export type SharePerson = {
  firstName: string;
  shortName: string;
  course: string | null;
  avatar: AvatarView;
};

export type ShareRow = {
  subject: string;
  total: number;
  mine: number | null;
  theirs: number | null;
  took: "ME" | "THEM" | "LEVEL" | null;
  marks: boolean[] | null;
};

export type ShareCardView = {
  number: string;
  printedNumber: string;
  kind: ShareKind;
  look: ShareLook;
  showScore: boolean;
  showRival: boolean;
  playedAt: string | null;
  kindLabel: string;
  boardLine: string;
  me: SharePerson;
  challengeName: string | null;
  stamp: string | null;
  headline: string;
  story: string | null;
  bigLine: string | null;
  footLeft: string;
  cta: string;
  previewTitle: string;
  previewText: string;
  duel: null | {
    outcome: "W" | "L" | "D";
    rival: SharePerson | null;
    rivalName: string;
    rivalShort: string;
    myScore: number | null;
    rivalScore: number | null;
    rows: ShareRow[];
  };
  exam: null | { score: number | null; total: number; rows: ShareRow[] };
  ghost: null | { levelLabel: string; ghostScore: number | null; ghostMarks: boolean[] | null };
  /** Daily Challenge results only (kind stays EXAM). Older backends leave it out. */
  daily?: null | {
    /** "THU 19 NOV", the stamp's second line. */
    stampDate: string;
    /** "Thu 19 Nov". */
    dateLine: string;
    /** "Thursday". */
    weekday: string;
    isToday: boolean;
    minutes: number;
    /** "1:48"; null when not recorded. */
    timeTaken: string | null;
  };
};

export type ShareSettings = { showScore: boolean; showRival: boolean; look: ShareLook };

export type OwnerShare = { card: ShareCardView; settings: ShareSettings; challengeName: string };

export type ChallengeLinkView = {
  name: string;
  firstName: string;
  shortName: string;
  course: string | null;
  avatar: AvatarView;
  board: { code: string; name: string; trackName: string | null } | null;
  weeklyRank: number | null;
};

/** studybond.app/daily/<name>: the link profile and the latest shared Daily Challenge. */
export type DailyLinkView = { link: ChallengeLinkView; card: ShareCardView | null };

/** A signed-in visitor on /daily/<name>: their own link, or today's Daily Challenge if done. */
export type DailyViewer = {
  isMe: boolean;
  /** Me, as a card prints a student. */
  you: SharePerson;
  latestNumber: string | null;
  today: null | { score: number; total: number; timeTaken: string | null; sameBoard: boolean };
};

/** Where things live. studybond.app in production. */
export const SHARE_HOST = "studybond.app";

export function resultPath(number: string) {
  return `/r/${number}`;
}

export function challengePath(name: string) {
  return `/c/${name}`;
}

export function dailyPath(name: string) {
  return `/daily/${name}`;
}

/** Where today's Daily Challenge starts, subjects picked for the student. */
export const DAILY_START_PATH = "/dashboard/practice?mode=DAILY_CHALLENGE";

/**
 * Where a card's link goes, and what it prints: a Daily Challenge sends
 * friends to /daily/<name> (today's challenge); other cards to the sharer's
 * /c/<name> duel link; with no link name yet, the result page.
 */
export function cardLinkPath(card: Pick<ShareCardView, "daily" | "challengeName" | "number">) {
  if (!card.challengeName) return resultPath(card.number);
  return card.daily ? dailyPath(card.challengeName) : challengePath(card.challengeName);
}

/** The link a chat message carries: the daily page for a daily, else the result page. */
export function chatLinkPath(card: Pick<ShareCardView, "daily" | "challengeName" | "number">) {
  return card.daily && card.challengeName ? dailyPath(card.challengeName) : resultPath(card.number);
}
