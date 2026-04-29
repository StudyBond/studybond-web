import { WEB_ACCESS_COOKIE, WEB_REFRESH_COOKIE } from "@/lib/auth/cookies";
import { NextRequest, NextResponse } from "next/server";

const authRoutes = new Set([
  "/login",
  "/signup",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
]);

function isAuthRoute(pathname: string) {
  return authRoutes.has(pathname);
}

function isProtectedRoute(pathname: string) {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession =
    request.cookies.has(WEB_ACCESS_COOKIE) || request.cookies.has(WEB_REFRESH_COOKIE);

  if (isProtectedRoute(pathname) && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute(pathname) && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
