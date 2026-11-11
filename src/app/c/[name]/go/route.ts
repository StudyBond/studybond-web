import { NextRequest, NextResponse } from "next/server";

import { cleanChallengeName } from "@/features/duel/share/server";
import { authorizedBackendRequest, clearWebAuthCookies, parseJsonSafely, setWebAuthCookies } from "@/lib/server/backend-session";

/* A signed-in student opened /c/<name>: look up who it is (signed-in read,
   so the user id never sits on a public page) and open Challenge a friend
   with them filled in. Their own link goes to the Duel home. */

type Props = { params: Promise<{ name: string }> };

export async function GET(request: NextRequest, { params }: Props) {
  const { name } = await params;
  const clean = cleanChallengeName(name);
  const to = (path: string) => NextResponse.redirect(new URL(path, request.nextUrl.origin));

  try {
    const { response, refreshedTokens } = await authorizedBackendRequest(
      request,
      `/api/share/challenge-links/${encodeURIComponent(clean)}/target`,
      { method: "GET" },
    );
    let next: NextResponse;
    if (response.status === 401) {
      // A stale login: clear it, or the login page would bounce back to the dashboard.
      next = to(`/login?next=${encodeURIComponent(`/c/${clean}`)}`);
      clearWebAuthCookies(next);
    } else if (!response.ok) {
      next = to("/dashboard/duel");
    } else {
      const body = (await parseJsonSafely(response)) as { data?: { userId: number; displayName: string; isMe: boolean } } | null;
      const target = body?.data;
      next = !target || target.isMe
        ? to("/dashboard/duel")
        : to(`/dashboard/duel/new?to=${target.userId}&name=${encodeURIComponent(target.displayName)}`);
    }
    if (refreshedTokens) setWebAuthCookies(next, refreshedTokens);
    return next;
  } catch {
    return to("/dashboard/duel");
  }
}
