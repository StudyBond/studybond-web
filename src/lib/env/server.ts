import "server-only";

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function getBackendApiBaseUrl() {
  return normalizeBaseUrl(process.env.BACKEND_API_BASE_URL || "http://localhost:5000");
}

export function getPublicAppUrl() {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
}
