import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { SHARE_HOST } from "@/features/duel/share/types";
import { WordDayPreviewArt } from "@/features/words/components/word-preview-art";
import { fetchWordDay } from "@/features/words/server";

import { cardFonts } from "../_lib/fonts";

/* The link preview for studybond.app/word-of-the-day, 1200x630.
   ?date=YYYY-MM-DD is the day the page was shared on: the page puts it in
   the image address, so a new day gets a new picture and a day's picture
   never changes. */

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? undefined;
  const day = await fetchWordDay(date);
  if (!day || !(day.word ?? day.idiom ?? day.phrasalVerb)) return new Response("No words for that day", { status: 404 });
  const { fonts, families } = await cardFonts();
  return new ImageResponse(
    <WordDayPreviewArt day={day} u={2} fonts={families} origin={request.nextUrl.origin} link={`${SHARE_HOST}/word-of-the-day`} />,
    { width: 1200, height: 630, fonts, headers: { "cache-control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=604800" } },
  );
}
