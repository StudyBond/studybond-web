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

/** Where things live. studybond.app in production. */
export const SHARE_HOST = "studybond.app";

export function resultPath(number: string) {
  return `/r/${number}`;
}

export function challengePath(name: string) {
  return `/c/${name}`;
}
