import {
  ApiError,
  createApiErrorFromResponse,
  createApiErrorFromUnknown,
} from "@/lib/api/errors";

function isFormDataBody(body: BodyInit | null | undefined) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

let tokenRefreshInFlight: Promise<boolean> | null = null;

async function performTokenRefresh(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      credentials: "include",
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function handleTokenRefresh(): Promise<boolean> {
  // If a refresh is already in flight, wait for it
  if (tokenRefreshInFlight) {
    return tokenRefreshInFlight;
  }

  // Otherwise, start a new refresh
  tokenRefreshInFlight = performTokenRefresh();
  try {
    return await tokenRefreshInFlight;
  } finally {
    tokenRefreshInFlight = null;
  }
}

export async function apiClient<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers ?? {});

  if (
    !headers.has("Content-Type") &&
    init?.body &&
    !isFormDataBody(init.body)
  ) {
    headers.set("Content-Type", "application/json");
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw createApiErrorFromUnknown(new TypeError("Network is offline"));
  }

  let response: Response;
  try {
    response = await fetch(input, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    throw createApiErrorFromUnknown(error);
  }

  // Handle 401 by refreshing token and retrying
  if (response.status === 401) {
    const refreshSuccess = await handleTokenRefresh();
    if (refreshSuccess) {
      // Retry the original request with refreshed token
      try {
        response = await fetch(input, {
          ...init,
          headers,
          credentials: "include",
          cache: "no-store",
        });
      } catch (error) {
        throw createApiErrorFromUnknown(error);
      }
    }
  }

  const payload = await response.json().catch(() => undefined);

  if (!response.ok) {
    throw createApiErrorFromResponse(response.status, payload);
  }

  return payload as T;
}

export { ApiError };
