import { NextRequest } from "next/server";

import {
  authorizedBackendRequest,
  clearWebAuthCookies,
  parseJsonSafely,
  setWebAuthCookies,
} from "@/lib/server/backend-session";
import {
  createBackendUnavailableResponse,
  createNetworkErrorResponse,
  createSafeJsonResponse,
  isNetworkError,
} from "@/lib/server/proxy-response";

/* /api/share/... -> the backend's share module (Duel phase 4). Same as the
   other areas' forwarders (lib/server/authorized-route.ts), kept here so the
   shared helper's list of areas doesn't need touching. */

type Context = { params: Promise<{ slug?: string[] }> };

async function forward(request: NextRequest, context: Context, method: "GET" | "POST" | "PATCH") {
  const { slug } = await context.params;
  const path = `/api/share${slug?.length ? `/${slug.map(encodeURIComponent).join("/")}` : ""}${request.nextUrl.search || ""}`;
  const body = method === "GET" ? undefined : await request.text().then((value) => value || undefined);
  try {
    const { response, refreshedTokens } = await authorizedBackendRequest(request, path, { method, body });
    const next = createSafeJsonResponse(await parseJsonSafely(response), response.status);
    if (refreshedTokens) setWebAuthCookies(next, refreshedTokens);
    if (response.status === 401) clearWebAuthCookies(next);
    return next;
  } catch (error) {
    return isNetworkError(error) ? createNetworkErrorResponse() : createBackendUnavailableResponse();
  }
}

export async function GET(request: NextRequest, context: Context) {
  return forward(request, context, "GET");
}

export async function POST(request: NextRequest, context: Context) {
  return forward(request, context, "POST");
}

export async function PATCH(request: NextRequest, context: Context) {
  return forward(request, context, "PATCH");
}
