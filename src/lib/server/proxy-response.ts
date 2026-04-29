import "server-only";

import { NextResponse } from "next/server";

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  // Check for common network-related error types
  const networkErrorPatterns = [
    "fetch failed",
    "ECONNREFUSED",
    "ENOTFOUND",
    "ETIMEDOUT",
    "ECONNRESET",
    "ERR_HTTP_REQUEST_TIMEOUT",
    "network error",
    "timeout",
    "socket hang up",
  ];

  const message = error.message?.toLowerCase() || "";
  return networkErrorPatterns.some((pattern) => message.includes(pattern));
}

function safeMessageForStatus(status: number) {
  if (status === 400 || status === 422) {
    return "Check the details and try again.";
  }

  if (status === 401) {
    return "Your session expired. Please sign in again.";
  }

  if (status === 402) {
    return "This action needs premium access.";
  }

  if (status === 403) {
    return "You do not have access to this action.";
  }

  if (status === 404) {
    return "We could not find what you asked for.";
  }

  return "Something went wrong. Please try again.";
}

function extractBackendMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.message === "string" && p.message.length > 0) return p.message;

  const nestedError = p.error;
  if (!nestedError || typeof nestedError !== "object") return null;

  const errorMessage = (nestedError as Record<string, unknown>).message;
  if (typeof errorMessage === "string" && errorMessage.length > 0)
    return errorMessage;

  return null;
}

export function createSafeJsonResponse(payload: unknown, status: number) {
  if (status >= 400) {
    const backendMessage = extractBackendMessage(payload);
    return NextResponse.json(
      {
        success: false,
        message: backendMessage || safeMessageForStatus(status),
      },
      { status },
    );
  }

  return NextResponse.json(payload ?? null, { status });
}

export function createBackendUnavailableResponse() {
  const isDevelopment = process.env.NODE_ENV === "development";

  return NextResponse.json(
    {
      success: false,
      message: isDevelopment
        ? "The backend service is currently unavailable. Please start the backend server or try again later."
        : "Something went wrong. Please try again.",
    },
    { status: 502 },
  );
}

export function createNetworkErrorResponse() {
  return NextResponse.json(
    {
      success: false,
      message:
        "It looks like you have a connectivity issue. Please check your internet connection and try again.",
    },
    { status: 503 },
  );
}

export function createServerErrorResponse() {
  return NextResponse.json(
    {
      success: false,
      message:
        "Something went wrong on our side. Please try again in a moment.",
    },
    { status: 502 },
  );
}

export { isNetworkError };
