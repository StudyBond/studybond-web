import type { Metadata, Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ChallengeLanding } from "@/features/duel/share/pages/challenge-landing";
import { boardLabelOf, cleanChallengeName, fetchChallengeLink } from "@/features/duel/share/server";
import { WEB_ACCESS_COOKIE, WEB_REFRESH_COOKIE } from "@/lib/auth/cookies";

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const link = await fetchChallengeLink(name);
  if (!link) return { title: "Duel | StudyBond", robots: { index: false } };
  const title = `${link.firstName} wants a duel`;
  const description = "Same real past questions, same clock, live. Your first duel is free.";
  const image = `/api/og/challenge/${link.name}`;
  return {
    title: `${title} | StudyBond`,
    description,
    robots: { index: false },
    openGraph: { title, description, url: `/c/${link.name}`, images: [{ url: image, width: 1200, height: 630, alt: title }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

/**
 * studybond.app/c/<name>, a student's personal challenge link. Visitors see
 * the landing; signed-in students go straight to Challenge a friend.
 */
export default async function ChallengeLinkPage({ params }: Props) {
  const { name } = await params;
  const clean = cleanChallengeName(name);
  const jar = await cookies();
  if (jar.has(WEB_ACCESS_COOKIE) || jar.has(WEB_REFRESH_COOKIE)) {
    redirect(`/c/${encodeURIComponent(clean)}/go` as Route);
  }
  const link = await fetchChallengeLink(clean);
  return <ChallengeLanding link={link} board={boardLabelOf(link?.board ?? null)} />;
}
