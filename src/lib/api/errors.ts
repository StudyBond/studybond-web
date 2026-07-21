export type ApiErrorKind = "network" | "auth" | "validation" | "permission" | "premium" | "rate_limit" | "server";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly kind: ApiErrorKind,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function safeMessageForStatus(status: number): { message: string; kind: ApiErrorKind } {
  if (status === 400 || status === 422) {
    return {
      kind: "validation",
      message: "Check the details and try again.",
    };
  }

  if (status === 401) {
    return {
      kind: "auth",
      message: "Your session expired. Please sign in again.",
    };
  }

  if (status === 402) {
    return {
      kind: "premium",
      message: "This action needs premium access.",
    };
  }

  if (status === 403) {
    return {
      kind: "permission",
      message: "You do not have access to this action.",
    };
  }

  if (status === 404) {
    return {
      kind: "server",
      message: "We could not find what you asked for.",
    };
  }

  if (status === 429) {
    return {
      kind: "rate_limit",
      message: "Too many requests. Please slow down and try again shortly.",
    };
  }

  return {
    kind: "server",
    message: "Something went wrong. Please try again.",
  };
}

export function createApiErrorFromResponse(status: number, payload?: unknown) {
  const safe = safeMessageForStatus(status);
  // Use the backend's message if available
  let message = safe.message;
  if (payload && typeof payload === "object" && "message" in payload) {
    const p = payload as { message?: unknown };
    if (typeof p.message === "string" && p.message.length > 0) {
      message = p.message;
    }
  }
  return new ApiError(message, status, safe.kind, payload);
}

export function createApiErrorFromUnknown(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  return new ApiError(
    "We couldn’t reach StudyBond. Check your connection and try again.",
    0,
    "network",
    error,
  );
}
