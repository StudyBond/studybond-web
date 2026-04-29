import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/signup", "/verify-otp", "/forgot-password", "/reset-password", "/api"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
