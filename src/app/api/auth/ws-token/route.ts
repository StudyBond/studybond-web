import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  WEB_ACCESS_COOKIE,
  WEB_REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth/cookies";
import { getBackendApiBaseUrl } from "@/lib/env/server";
import {
  refreshWebSession,
  setWebAuthCookies,
} from "@/lib/server/backend-session";

function getBackendWebSocketBaseUrl() {
  const backendUrl = new URL(getBackendApiBaseUrl());
  backendUrl.protocol = backendUrl.protocol === "https:" ? "wss:" : "ws:";
  backendUrl.pathname = backendUrl.pathname.replace(/\/api\/?$/, "") || "/";
  backendUrl.search = "";
  backendUrl.hash = "";

  return backendUrl.toString().replace(/\/$/, "");
}

export async function GET() {
  const cookieStore = await cookies();
  let token = cookieStore.get(WEB_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(WEB_REFRESH_COOKIE)?.value;

  // If no access token but we have a refresh token, refresh immediately
  if (!token && refreshToken) {
    const refreshedTokens = await refreshWebSession(refreshToken);
    if (refreshedTokens) {
      token = refreshedTokens.accessToken;
      // Set the refreshed tokens in cookies for subsequent requests
      const response = NextResponse.json({
        success: true,
        token,
        backendWsUrl: getBackendWebSocketBaseUrl(),
      });
      setWebAuthCookies(response, refreshedTokens);
      return response;
    }
  }

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    token,
    backendWsUrl: getBackendWebSocketBaseUrl(),
  });
}
