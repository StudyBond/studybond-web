import type { Metadata, Route } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DailyYou } from "@/features/duel/share/pages/daily-you";
import { cleanChallengeName, fetchDailyLink } from "@/features/duel/share/server";
import { WEB_ACCESS_COOKIE, WEB_REFRESH_COOKIE } from "@/lib/auth/cookies";

export const metadata: Metadata = { title: "Today’s Daily Challenge | StudyBond", robots: { index: false } };

type Props = { params: Promise<{ name: string }> };

/** Both of today's Daily Challenge results, for a signed-in student who has taken it. */
export default async function DailyYouPage({ params }: Props) {
  const { name } = await params;
  const clean = cleanChallengeName(name);
  const jar = await cookies();
  if (!jar.has(WEB_ACCESS_COOKIE) && !jar.has(WEB_REFRESH_COOKIE)) {
    redirect(`/daily/${encodeURIComponent(clean)}` as Route);
  }
  const daily = await fetchDailyLink(clean);
  return <DailyYou name={clean} daily={daily} />;
}
