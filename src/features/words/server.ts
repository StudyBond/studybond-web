import "server-only";

import { cache } from "react";

import { getBackendApiBaseUrl } from "@/lib/env/server";

import type { WordArchive, WordDay, WordPage, WordSitemap } from "./types";

/* Public reads, straight from the backend with no login: /word-of-the-day,
   the page for each past card, and the sitemap. A backend that is down or
   says 404 gives null, and the page shows its empty state. */

async function publicRead<T>(path: string, revalidate: number | false = false): Promise<T | null> {
  try {
    const response = await fetch(`${getBackendApiBaseUrl()}${path}`, {
      ...(revalidate === false ? { cache: "no-store" as const } : { next: { revalidate } }),
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { success?: boolean; data?: T };
    return body.success && body.data ? body.data : null;
  } catch {
    return null;
  }
}

/** Today's cards (Lagos date). A new day starts at midnight, so never cached. */
export const fetchWordDay = cache(async () => publicRead<WordDay>("/api/word-of-the-day"));

export const fetchWordArchive = cache(async (before?: string) => {
  const query = before && /^\d{4}-\d{2}-\d{2}$/.test(before) ? `&before=${before}` : "";
  return publicRead<WordArchive>(`/api/word-of-the-day/archive?limit=14${query}`);
});

export const fetchWordPage = cache(async (slug: string) => {
  const clean = slug.trim().toLowerCase();
  if (!/^[a-z0-9-]{1,80}$/.test(clean)) return null;
  return publicRead<WordPage>(`/api/word-of-the-day/cards/${clean}`);
});

/** Every card that has had its day. Changes once a day at most. */
export const fetchWordSitemap = cache(async () => publicRead<WordSitemap>("/api/word-of-the-day/sitemap", 3600));
