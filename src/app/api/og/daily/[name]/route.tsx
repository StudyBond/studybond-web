import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { DailyOpenPreviewArt } from "@/features/duel/share/card/link-preview";
import { boardLabelOf, fetchDailyLink } from "@/features/duel/share/server";
import { dailyOpenPreview, SHARE_HOST } from "@/features/duel/share/types";

import { cardFonts } from "../../_lib/fonts";

/* The link preview for studybond.app/daily/<name> before its owner has
   shared a Daily Challenge result. Once they have, the page uses the
   result's own preview (/api/og/result/<number>). 1200x630. */

export const runtime = "nodejs";

type Props = { params: Promise<{ name: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { name } = await params;
  const daily = await fetchDailyLink(name);
  if (!daily) return new Response("Link not found", { status: 404 });
  const { fonts, families } = await cardFonts();
  const link = daily.link;
  const words = dailyOpenPreview(link.firstName);
  return new ImageResponse(
    <DailyOpenPreviewArt
      u={2}
      fonts={families}
      origin={request.nextUrl.origin}
      shortName={link.shortName}
      course={link.course}
      avatar={link.avatar}
      board={boardLabelOf(link.board)}
      title={words.title}
      text={words.text}
      link={`${SHARE_HOST}/daily/${link.name}`}
    />,
    // Served stale while a fresh copy is made, so WhatsApp never waits on a cold render.
    { width: 1200, height: 630, fonts, headers: { "cache-control": "public, max-age=300, s-maxage=300, stale-while-revalidate=604800" } },
  );
}
