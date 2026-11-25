import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { SHARE_HOST } from "@/features/duel/share/types";
import { WordCardPreviewArt } from "@/features/words/components/word-preview-art";
import { fetchWordPage } from "@/features/words/server";

import { cardFonts } from "../../_lib/fonts";

/* The link preview for one card's page, studybond.app/word-of-the-day/<slug>. 1200x630.
   The pill shows the short address: a long slug would wrap onto two lines. */

export const runtime = "nodejs";

type Props = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { slug } = await params;
  const page = await fetchWordPage(slug);
  if (!page) return new Response("Card not found", { status: 404 });
  const { fonts, families } = await cardFonts();
  return new ImageResponse(
    <WordCardPreviewArt card={page.card} u={2} fonts={families} origin={request.nextUrl.origin} link={`${SHARE_HOST}/word-of-the-day`} />,
    { width: 1200, height: 630, fonts, headers: { "cache-control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=604800" } },
  );
}
