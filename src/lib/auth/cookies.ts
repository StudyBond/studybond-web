export const WEB_ACCESS_COOKIE = "studybond_web_access_token";
export const WEB_REFRESH_COOKIE = "studybond_web_refresh_token";

const isProduction = process.env.NODE_ENV === "production";

export const accessCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 15,
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
