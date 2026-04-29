import {
  authorizedBackendRequest,
  buildBackendUrl,
  clearWebAuthCookies,
  parseJsonSafely,
  sanitizeAuthPayload,
  setWebAuthCookies,
} from "@/lib/server/backend-session";
import {
  createBackendUnavailableResponse,
  createNetworkErrorResponse,
  createSafeJsonResponse,
  isNetworkError,
} from "@/lib/server/proxy-response";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ slug: string[] }>;
};

type TokenPayload = {
  accessToken?: unknown;
  refreshToken?: unknown;
};

function hasTokens(
  payload: unknown,
): payload is { accessToken: string; refreshToken: string } {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const tokens = payload as TokenPayload;
  return (
    typeof tokens.accessToken === "string" &&
    typeof tokens.refreshToken === "string"
  );
}

function copyDeviceHeaders(request: NextRequest) {
  const headers = new Headers();
  const forwardedFor = request.headers.get("x-forwarded-for");
  const userAgent = request.headers.get("user-agent");

  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor);
  if (userAgent) headers.set("user-agent", userAgent);

  return headers;
}

async function forwardPublicAuthRequest(
  request: NextRequest,
  backendPath: string,
  method: "POST",
) {
  const body = await request.text().then((value) => value || undefined);

  try {
    const response = await fetch(buildBackendUrl(backendPath), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...Object.fromEntries(copyDeviceHeaders(request)),
      },
      body,
      cache: "no-store",
    });

    const payload = await parseJsonSafely(response);
    const safePayload = sanitizeAuthPayload(payload);
    const nextResponse = createSafeJsonResponse(safePayload, response.status);

    if (response.ok && hasTokens(payload)) {
      setWebAuthCookies(nextResponse, payload);
    }

    return nextResponse;
  } catch (error) {
    if (isNetworkError(error)) {
      return createNetworkErrorResponse();
    }
    return createBackendUnavailableResponse();
  }
}

async function forwardProtectedAuthRequest(
  request: NextRequest,
  backendPath: string,
  method: "GET" | "POST",
) {
  const body =
    method === "GET"
      ? undefined
      : await request.text().then((value) => value || undefined);

  try {
    const { response, refreshedTokens } = await authorizedBackendRequest(
      request,
      backendPath,
      {
        method,
        body,
      },
    );

    const payload = await parseJsonSafely(response);
    const nextResponse = createSafeJsonResponse(
      sanitizeAuthPayload(payload),
      response.status,
    );

    if (refreshedTokens) {
      setWebAuthCookies(nextResponse, refreshedTokens);
    }

    if (backendPath.endsWith("/logout") || response.status === 401) {
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

async function forwardAuthRequest(
  request: NextRequest,
  context: RouteContext,
  method: "GET" | "POST",
) {
  const { slug } = await context.params;
  const endpoint = slug.join("/");
  const queryString = request.nextUrl.search || "";
  const backendPath = `/api/auth/${endpoint}${queryString}`;

  if (method === "GET" && endpoint === "me") {
    return forwardProtectedAuthRequest(request, backendPath, method);
  }

  if (method === "POST" && (endpoint === "logout" || endpoint === "me")) {
    return forwardProtectedAuthRequest(request, backendPath, method);
  }

  if (
    method === "POST" &&
    [
      "signup",
      "login",
      "verify-otp",
      "resend-verification-otp",
      "forgot-password",
      "resend-reset-otp",
      "reset-password",
    ].includes(endpoint)
  ) {
    return forwardPublicAuthRequest(request, backendPath, method);
  }

  return NextResponse.json(
    {
      success: false,
      message: "We could not find what you asked for.",
    },
    { status: 404 },
  );
}

export async function GET(request: NextRequest, context: RouteContext) {
  return forwardAuthRequest(request, context, "GET");
}

export async function POST(request: NextRequest, context: RouteContext) {
  return forwardAuthRequest(request, context, "POST");
}
