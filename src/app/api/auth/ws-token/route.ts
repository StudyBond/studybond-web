import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WEB_ACCESS_COOKIE } from "@/lib/auth/cookies";
import { getBackendApiBaseUrl } from "@/lib/env/server";

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
  const token = cookieStore.get(WEB_ACCESS_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    token,
    backendWsUrl: getBackendWebSocketBaseUrl(),
  });
}
