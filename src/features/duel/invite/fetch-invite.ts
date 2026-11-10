import "server-only";

import { cache } from "react";

import type { DuelInvite } from "@/lib/api/duel";
import { getBackendApiBaseUrl } from "@/lib/env/server";

/** The public slip read, straight from the backend (no login). Null if it doesn't exist. */
export const fetchDuelInvite = cache(async (code: string): Promise<DuelInvite | null> => {
  const clean = code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (clean.length < 4 || clean.length > 12) return null;
  try {
    const response = await fetch(`${getBackendApiBaseUrl()}/api/duel/invites/${clean}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { success?: boolean; data?: DuelInvite };
    return body.success && body.data ? body.data : null;
  } catch {
    return null;
  }
});

export function inviteBoardLabel(invite: DuelInvite): string {
  const { name, trackName } = invite.board;
  return trackName && !name.includes(trackName) ? `${name} ${trackName}` : name;
}
