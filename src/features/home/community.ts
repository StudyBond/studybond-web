"use client";

import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";

/* GET /api/dashboard/community: the WhatsApp channel and premium group for
   the student's board. Admins set the links per board, so nothing here is
   hard-coded. The group link only comes back for premium on this board. */
export type Community = {
  boardCode: string;
  boardName: string;
  examName: string;
  isPremium: boolean;
  channelUrl: string | null;
  groupUrl: string | null;
  hasGroup: boolean;
};

export async function getCommunity() {
  const response = await apiClient<SuccessEnvelope<Community>>("/api/dashboard/community");
  return response.data;
}

export function useCommunity(enabled = true) {
  return useQuery({
    queryKey: ["home", "community"],
    queryFn: getCommunity,
    enabled,
    staleTime: 10 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/* Joined is remembered per board: joining UI's channel says nothing about
   JAMB's. The old single key meant UI's channel, the only one there was. */
const LEGACY_JOINED_KEY = "sb-whatsapp-channel-joined";
const joinedKey = (boardCode: string) => `sb-wa-channel-joined:${boardCode}`;
const DISMISSED_KEY = "sb-wa-channel-dismissed";

export function hasJoinedChannel(boardCode: string): boolean {
  try {
    if (window.localStorage.getItem(joinedKey(boardCode)) === "true") return true;
    return boardCode === "UI" && window.localStorage.getItem(LEGACY_JOINED_KEY) === "true";
  } catch {
    return false;
  }
}

export function setJoinedChannel(boardCode: string, joined: boolean) {
  try {
    if (joined) window.localStorage.setItem(joinedKey(boardCode), "true");
    else {
      window.localStorage.removeItem(joinedKey(boardCode));
      if (boardCode === "UI") window.localStorage.removeItem(LEGACY_JOINED_KEY);
    }
  } catch {
    // Storage blocked: the sheet may ask again next visit, which is harmless.
  }
}

/** "Not now" holds for this browser session only. */
export function wasDismissedThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === "true";
  } catch {
    return false;
  }
}

export function dismissForSession() {
  try {
    window.sessionStorage.setItem(DISMISSED_KEY, "true");
  } catch {
    // ignore
  }
}
