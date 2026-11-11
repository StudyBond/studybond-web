import "server-only";

import { cache } from "react";

import { getBackendApiBaseUrl } from "@/lib/env/server";

import type { ChallengeLinkView, ShareCardView } from "./types";

/* Public reads, straight from the backend with no login: the result check
   page, the challenge-link landing and the share images. */

async function publicRead<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${getBackendApiBaseUrl()}${path}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { success?: boolean; data?: T };
    return body.success && body.data ? body.data : null;
  } catch {
    return null;
  }
}

export function cleanNumber(raw: string) {
  return raw.replace(/[^A-Z0-9]/gi, "").toUpperCase();
}

export function cleanChallengeName(raw: string) {
  return decodeURIComponent(raw).trim().toLowerCase();
}

export const fetchShareCard = cache(async (number: string) => {
  const clean = cleanNumber(number);
  if (clean.length !== 6) return null;
  return publicRead<ShareCardView>(`/api/share/results/${clean}`);
});

export const fetchChallengeLink = cache(async (name: string) => {
  const clean = cleanChallengeName(name);
  if (!/^[a-z0-9-]{2,30}$/.test(clean)) return null;
  return publicRead<ChallengeLinkView>(`/api/share/challenge-links/${encodeURIComponent(clean)}`);
});

/** The short board name, as students say it and as the cards print it: "UI Post-UTME". */
export function boardLabelOf(board: { code: string; name: string; trackName: string | null } | null): string {
  if (!board) return "StudyBond";
  const short = board.code || board.name;
  return board.trackName && !short.includes(board.trackName) ? `${short} ${board.trackName}` : short;
}
