import "server-only";

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
import { NextRequest, NextResponse } from "next/server";

export type OptionalSlugRouteContext = {
  params: Promise<{ slug?: string[] }>;
};

export async function forwardAuthorizedRoute(
  request: NextRequest,
  context: OptionalSlugRouteContext,
  namespace:
    | "users"
    | "streaks"
    | "exams"
    | "leaderboard"
    | "subscriptions"
    | "bookmarks"
    | "bookmark-exam"
    | "collaboration"
    | "reports"
    | "notifications",
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
) {
  const { slug } = await context.params;
  const pathParts = slug?.length ? `/${slug.join("/")}` : "";
  const queryString = request.nextUrl.search || "";
  const body =
    method === "GET"
      ? undefined
      : await request.text().then((value) => value || undefined);

  try {
    const { response, refreshedTokens } = await authorizedBackendRequest(
      request,
      `/api/${namespace}${pathParts}${queryString}`,
      {
        method,
        body,
      },
    );

    const payload = await parseJsonSafely(response);
    const nextResponse = createSafeJsonResponse(payload, response.status);

    if (refreshedTokens) {
      setWebAuthCookies(nextResponse, refreshedTokens);
    }

    if (response.status === 401) {
      clearWebAuthCookies(nextResponse);
    }

    return nextResponse;
  } catch (error) {
    if (isNetworkError(error)) {
      return createNetworkErrorResponse();
    }
    return createBackendUnavailableResponse();
  }
}

export function methodNotAllowed() {
  return NextResponse.json(
    {
      success: false,
      message: "This action is not available here.",
    },
    { status: 405 },
  );
}
