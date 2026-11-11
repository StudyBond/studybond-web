import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { InviteLanding } from "@/features/duel/invite/invite-landing";
import { fetchDuelInvite, inviteBoardLabel } from "@/features/duel/invite/fetch-invite";
import { WEB_ACCESS_COOKIE, WEB_REFRESH_COOKIE } from "@/lib/auth/cookies";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const invite = await fetchDuelInvite(code);
  if (!invite) return { title: "Duel | StudyBond", robots: { index: false } };
  const what = invite.isTaster
    ? `A ${invite.subjects[0]} taster, ${invite.totalQuestions} questions`
    : `${invite.subjects.join(", ")}, ${invite.totalQuestions} questions`;
  const title = `${invite.host.firstName} challenged you to a duel`;
  const description = `${what} on ${inviteBoardLabel(invite)}. Same paper, same clock.`;
  // The slip as a link preview (mockup 11h), drawn by /api/og/invite.
  const image = `/api/og/invite/${invite.code}`;
  return {
    title: `${title} | StudyBond`,
    description,
    robots: { index: false },
    openGraph: { title, description, url: `/d/${invite.code}`, images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/**
 * /d/<CODE>, the link on a duel slip (mockup 13a). Visitors with no account
 * see the slip and sign up; signed-in students go straight to the duel.
 */
export default async function DuelInvitePage({ params }: Props) {
  const { code } = await params;
  const clean = code.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  const jar = await cookies();
  if (jar.has(WEB_ACCESS_COOKIE) || jar.has(WEB_REFRESH_COOKIE)) {
    redirect(`/dashboard/duel/${clean}`);
  }
  const invite = await fetchDuelInvite(clean);
  return <InviteLanding code={clean} invite={invite} />;
}
