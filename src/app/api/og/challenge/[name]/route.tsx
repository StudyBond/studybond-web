import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { ChallengePreviewArt } from "@/features/duel/share/card/link-preview";
import { boardLabelOf, fetchChallengeLink } from "@/features/duel/share/server";
import { SHARE_HOST } from "@/features/duel/share/types";

import { cardFonts } from "../../_lib/fonts";

/* The link preview for a personal challenge link, studybond.app/c/<name>. 1200x630. */

export const runtime = "nodejs";

type Props = { params: Promise<{ name: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { name } = await params;
  const link = await fetchChallengeLink(name);
  if (!link) return new Response("Link not found", { status: 404 });
  const { fonts, families } = await cardFonts();
  return new ImageResponse(
    <ChallengePreviewArt
      u={2}
      fonts={families}
      origin={request.nextUrl.origin}
      shortName={link.shortName}
      firstName={link.firstName}
      course={link.course}
      avatar={link.avatar}
      board={boardLabelOf(link.board)}
      weeklyRank={link.weeklyRank}
      link={`${SHARE_HOST}/c/${link.name}`}
    />,
    { width: 1200, height: 630, fonts, headers: { "cache-control": "public, max-age=300, s-maxage=300" } },
  );
}
