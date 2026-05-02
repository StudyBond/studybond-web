import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WEB_ACCESS_COOKIE } from "@/lib/auth/cookies";
import { getBackendApiBaseUrl } from "@/lib/env/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(WEB_ACCESS_COOKIE)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const backendHttp = getBackendApiBaseUrl();
  const backendWsUrl = backendHttp.replace(/^http/, "ws");

  return NextResponse.json({ success: true, token, backendWsUrl });
}
