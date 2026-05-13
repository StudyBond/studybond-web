import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studybond.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/login",
          "/signup",
          "/verify-otp",
          "/forgot-password",
          "/reset-password",
          "/api",
        ],
      },
      // AI Search Crawlers — explicitly allow public SEO pages
      {
        userAgent: "GPTBot",
        allow: ["/", "/ui-post-utme", "/blog"],
        disallow: ["/dashboard", "/api"],
      },
      {
        userAgent: "Google-Extended",
        allow: ["/", "/ui-post-utme", "/blog"],
        disallow: ["/dashboard", "/api"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/ui-post-utme", "/blog"],
        disallow: ["/dashboard", "/api"],
      },
      {
        userAgent: "anthropic-ai",
        allow: ["/", "/ui-post-utme", "/blog"],
        disallow: ["/dashboard", "/api"],
      },
      {
        userAgent: "CCBot",
        allow: ["/", "/ui-post-utme", "/blog"],
        disallow: ["/dashboard", "/api"],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
