import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { InvitePreviewArt } from "@/features/duel/share/card/link-preview";
import { fetchDuelInvite } from "@/features/duel/invite/fetch-invite";
import { boardLabelOf } from "@/features/duel/share/server";
import { SHARE_HOST } from "@/features/duel/share/types";

import { cardFonts } from "../../_lib/fonts";

/* The link preview for a duel slip, studybond.app/d/<CODE> (mockup 11h). 1200x630. */

export const runtime = "nodejs";

type Props = { params: Promise<{ code: string }> };

const SHORT: Record<string, string> = {
  English: "Eng",
  "Use of English": "Eng",
  Biology: "Bio",
  Chemistry: "Chem",
  Physics: "Phy",
  Mathematics: "Maths",
};

export async function GET(request: NextRequest, { params }: Props) {
  const { code } = await params;
  const invite = await fetchDuelInvite(code);
  if (!invite) return new Response("Duel not found", { status: 404 });
  const { fonts, families } = await cardFonts();
  const subjects = invite.subjects.length > 2 ? invite.subjects.map((s) => SHORT[s] ?? s).join(", ") : invite.subjects.join(", ");
  const minutes = invite.durationSeconds ? ` · ${Math.round(invite.durationSeconds / 60)} min` : "";
  return new ImageResponse(
    <InvitePreviewArt
      u={2}
      fonts={families}
      origin={request.nextUrl.origin}
      hostName={invite.host.shortName}
      firstName={invite.host.firstName}
      board={boardLabelOf(invite.board)}
      code={`${invite.code.slice(0, 3)} ${invite.code.slice(3)}`}
      subjects={subjects}
      length={`${invite.totalQuestions} questions${minutes}`}
      link={`${SHARE_HOST}/d/${invite.code}`}
      isTaster={invite.isTaster}
    />,
    { width: 1200, height: 630, fonts, headers: { "cache-control": "public, max-age=120, s-maxage=120" } },
  );
}
