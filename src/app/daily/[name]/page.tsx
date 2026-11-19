import type { Metadata, Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DailyLanding } from "@/features/duel/share/pages/daily-landing";
import { boardLabelOf, cleanChallengeName, fetchDailyLink } from "@/features/duel/share/server";
import { WEB_ACCESS_COOKIE, WEB_REFRESH_COOKIE } from "@/lib/auth/cookies";

type Props = { params: Promise<{ name: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const daily = await fetchDailyLink(name);
  if (!daily) return { title: "Daily Challenge | StudyBond", robots: { index: false } };
  const card = daily.card;
  const title = card ? card.previewTitle : `Take today’s Daily Challenge with ${daily.link.firstName}`;
  const description = card
    ? card.previewText
    : "One question from each of your subjects, 3 minutes, free. New questions every day at midnight.";
  // The preview is the shared result's; with none shared yet, the site's own image.
  const images = card ? [{ url: `/api/og/result/${card.number}?shape=link`, width: 1200, height: 630, alt: title }] : undefined;
  return {
    title: `${title} | StudyBond`,
    description,
    robots: { index: false },
    openGraph: { title, description, url: `/daily/${daily.link.name}`, ...(images ? { images } : {}) },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, ...(images ? { images: images.map((i) => i.url) } : {}) },
  };
}

/**
 * studybond.app/daily/<name>, printed on Daily Challenge cards. Visitors see
 * the landing; signed-in students go on to today's challenge, or to both
 * results side by side if they have taken it.
 */
export default async function DailyLinkPage({ params }: Props) {
  const { name } = await params;
  const clean = cleanChallengeName(name);
  const jar = await cookies();
  if (jar.has(WEB_ACCESS_COOKIE) || jar.has(WEB_REFRESH_COOKIE)) {
    redirect(`/daily/${encodeURIComponent(clean)}/go` as Route);
  }
  const daily = await fetchDailyLink(clean);
  // The board the shared daily was taken on; with none shared, the student's own.
  const board = daily?.card?.boardLine || boardLabelOf(daily?.link.board ?? null);
  return <DailyLanding daily={daily} board={board} />;
}
