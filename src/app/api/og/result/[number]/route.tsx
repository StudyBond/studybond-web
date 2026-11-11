import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { ShareCardArt } from "@/features/duel/share/card/share-card";
import { ResultPreviewArt } from "@/features/duel/share/card/link-preview";
import { fetchShareCard } from "@/features/duel/share/server";
import { SHARE_HOST } from "@/features/duel/share/types";

import { cardFonts } from "../../_lib/fonts";

/* A shared result as an image (mockups 11b-11g):
   ?shape=status  1080x1920, for WhatsApp Status
   ?shape=square  1080x1080
   ?shape=link    1200x630, the link preview (default)
   Always the PUBLIC card: the sharer's switches apply, nothing else shows. */

export const runtime = "nodejs";

type Props = { params: Promise<{ number: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { number } = await params;
  const shape = request.nextUrl.searchParams.get("shape") ?? "link";
  const card = await fetchShareCard(number);
  if (!card) return new Response("Result not found", { status: 404 });

  const { fonts, families } = await cardFonts();
  const origin = request.nextUrl.origin;
  const link = card.challengeName ? `${SHARE_HOST}/c/${card.challengeName}` : `${SHARE_HOST}/r/${card.number}`;
  const headers = { "cache-control": "public, max-age=60, s-maxage=60" };

  if (shape === "status" || shape === "square") {
    const square = shape === "square";
    return new ImageResponse(
      <ShareCardArt card={card} shape={square ? "square" : "status"} u={3} fonts={families} origin={origin} link={link} />,
      { width: 1080, height: square ? 1080 : 1920, fonts, headers },
    );
  }
  return new ImageResponse(
    <ResultPreviewArt card={card} u={2} fonts={families} origin={origin} link={`${SHARE_HOST}/r/${card.number}`} />,
    { width: 1200, height: 630, fonts, headers },
  );
}
