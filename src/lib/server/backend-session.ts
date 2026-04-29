import "server-only";

import { NextRequest, NextResponse } from "next/server";
import {
  WEB_ACCESS_COOKIE,
  WEB_REFRESH_COOKIE,
  accessCookieOptions,
  refreshCookieOptions,
} from "@/lib/auth/cookies";
import { getBackendApiBaseUrl } from "@/lib/env/server";

type RefreshSuccessPayload = {
  accessToken: string;
  refreshToken: string;
};

const RECENT_REFRESH_TTL_MS = 30_000;
const inFlightRefreshes = new Map<string, Promise<RefreshSuccessPayload | null>>();
const recentRefreshResults = new Map<
  string,
  { result: RefreshSuccessPayload; expiresAt: number }
>();

export function buildBackendUrl(path: string) {
  const base = getBackendApiBaseUrl();
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function parseJsonSafely(response: Response) {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function sanitizeAuthPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return payload;
  }

  const clone = { ...(payload as Record<string, unknown>) };
  delete clone.accessToken;
  delete clone.refreshToken;
  return clone;
}

async function performRefreshWebSession(refreshToken: string): Promise<RefreshSuccessPayload | null> {
  const response = await fetch(buildBackendUrl("/api/auth/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  const payload = await parseJsonSafely(response);
  if (!response.ok || !payload || typeof payload !== "object") {
    return null;
  }

  const tokens = payload as Partial<RefreshSuccessPayload>;
  if (!tokens.accessToken || !tokens.refreshToken) {
    return null;
  }

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
}

export async function refreshWebSession(refreshToken: string) {
  const recentRefresh = recentRefreshResults.get(refreshToken);
  if (recentRefresh) {
    if (recentRefresh.expiresAt > Date.now()) {
      return recentRefresh.result;
    }

    recentRefreshResults.delete(refreshToken);
  }

  const existingRefresh = inFlightRefreshes.get(refreshToken);
  if (existingRefresh) {
    return existingRefresh;
  }

  const refreshPromise = performRefreshWebSession(refreshToken)
    .then((result) => {
      if (result) {
        recentRefreshResults.set(refreshToken, {
          result,
          expiresAt: Date.now() + RECENT_REFRESH_TTL_MS,
        });
      }

      return result;
    })
    .finally(() => {
      inFlightRefreshes.delete(refreshToken);
    });

  inFlightRefreshes.set(refreshToken, refreshPromise);
  return refreshPromise;
}

export function setWebAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string },
) {
  response.cookies.set(WEB_ACCESS_COOKIE, tokens.accessToken, accessCookieOptions);
  response.cookies.set(WEB_REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions);
}

export function clearWebAuthCookies(response: NextResponse) {
  response.cookies.set(WEB_ACCESS_COOKIE, "", {
    ...accessCookieOptions,
    maxAge: 0,
  });
  response.cookies.set(WEB_REFRESH_COOKIE, "", {
    ...refreshCookieOptions,
    maxAge: 0,
  });
}

export async function authorizedBackendRequest(
  request: NextRequest,
  path: string,
  init: {
    method: string;
    body?: BodyInit;
    headers?: HeadersInit;
  },
) {
  const accessToken = request.cookies.get(WEB_ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(WEB_REFRESH_COOKIE)?.value;

  const perform = async (token?: string) => {
    const headers = new Headers(init.headers ?? {});
    const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

    if (!headers.has("Content-Type") && init.body && !isFormData) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const idempotencyKey = request.headers.get("idempotency-key");
    if (idempotencyKey) {
      headers.set("idempotency-key", idempotencyKey);
    }

    return fetch(buildBackendUrl(path), {
      method: init.method,
      headers,
      body: init.body,
      cache: "no-store",
    });
  };

  let response = await perform(accessToken);

  if (response.status !== 401 || !refreshToken) {
    return {
      response,
      refreshedTokens: null,
    };
  }

  const refreshedTokens = await refreshWebSession(refreshToken);
  if (!refreshedTokens) {
    return {
      response,
      refreshedTokens: null,
    };
  }

  response = await perform(refreshedTokens.accessToken);
  return {
    response,
    refreshedTokens,
  };
}
