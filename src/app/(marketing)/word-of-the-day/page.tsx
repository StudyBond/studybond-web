import type { Metadata } from "next";
import { cookies } from "next/headers";

import { WordDayView } from "@/features/words/components/word-day-view";
import { fetchWordArchive, fetchWordDay } from "@/features/words/server";
import { WEB_ACCESS_COOKIE, WEB_REFRESH_COOKIE } from "@/lib/auth/cookies";
import { getPublicAppUrl } from "@/lib/env/server";

type Props = { searchParams: Promise<{ before?: string }> };

/* A new day starts at midnight Lagos time, so the page is built per request. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { before } = await searchParams;
  const day = await fetchWordDay();
  const appUrl = getPublicAppUrl();
  const word = day?.word?.headword;
  const idiom = day?.idiom?.headword;
  const today = [word, idiom].filter(Boolean).join(" and ");
  const title = today ? `Word of the Day: ${today}` : "Word of the Day";
  const description = today
    ? `Today's JAMB English word and idiom: ${today}. Each one came out in a real JAMB paper. Learn what it means, how to say it, and try the real question.`
    : "A word, an idiom and a phrasal verb a day, from real JAMB English past questions.";
  return {
    title: `${title} | StudyBond`,
    description,
    alternates: { canonical: `${appUrl}/word-of-the-day` },
    // Older pages and an empty day stay out of search results.
    robots: before || !today ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: `${appUrl}/word-of-the-day` },
  };
}

export default async function WordOfTheDayPage({ searchParams }: Props) {
  const { before } = await searchParams;
  const olderOnly = before && /^\d{4}-\d{2}-\d{2}$/.test(before) ? before : undefined;
  const [day, archive, jar] = await Promise.all([fetchWordDay(), fetchWordArchive(olderOnly), cookies()]);
  const signedIn = jar.has(WEB_ACCESS_COOKIE) || jar.has(WEB_REFRESH_COOKIE);
  return <WordDayView day={day} archive={archive} signedIn={signedIn} before={olderOnly} />;
}
