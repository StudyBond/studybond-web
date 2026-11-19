import { NextRequest, NextResponse } from "next/server";

import { cleanChallengeName } from "@/features/duel/share/server";
import { DAILY_START_PATH, type DailyViewer } from "@/features/duel/share/types";
import { authorizedBackendRequest, clearWebAuthCookies, parseJsonSafely, setWebAuthCookies } from "@/lib/server/backend-session";

/* A signed-in student opened /daily/<name>. Not taken today's Daily
   Challenge yet: open it, subjects picked. Taken it: both results side by
   side. Their own link: their own result page. */

type Props = { params: Promise<{ name: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { name } = await params;
  const clean = cleanChallengeName(name);
  const to = (path: string) => NextResponse.redirect(new URL(path, request.nextUrl.origin));

  try {
    const { response, refreshedTokens } = await authorizedBackendRequest(
      request,
      `/api/share/daily-links/${encodeURIComponent(clean)}/viewer`,
      { method: "GET" },
    );
    let next: NextResponse;
    if (response.status === 401) {
      // A stale login: clear it, or the login page would bounce back to the dashboard.
      next = to(`/login?next=${encodeURIComponent(`/daily/${clean}`)}`);
      clearWebAuthCookies(next);
    } else if (!response.ok) {
      // An unknown link still leads somewhere useful: today's challenge.
      next = to(DAILY_START_PATH);
    } else {
      const body = (await parseJsonSafely(response)) as { data?: DailyViewer } | null;
      const viewer = body?.data;
      if (viewer?.isMe) next = to(viewer.latestNumber ? `/r/${viewer.latestNumber}` : "/dashboard");
      else if (viewer?.today) next = to(`/daily/${encodeURIComponent(clean)}/you`);
      else next = to(DAILY_START_PATH);
    }
    if (refreshedTokens) setWebAuthCookies(next, refreshedTokens);
    return next;
  } catch {
    return to(DAILY_START_PATH);
  }
}
