import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },

  async redirects() {
    return [
      // Catch common alternative URL patterns and redirect to canonical SEO pages
      {
        source: "/past-questions",
        destination: "/ui-post-utme",
        permanent: true,
      },
      {
        source: "/post-utme",
        destination: "/ui-post-utme",
        permanent: true,
      },
      {
        source: "/ui-post-utme-past-questions",
        destination: "/ui-post-utme",
        permanent: true,
      },
      {
        source: "/ui-past-questions",
        destination: "/ui-post-utme",
        permanent: true,
      },
      {
        source: "/university-of-ibadan-post-utme",
        destination: "/ui-post-utme",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
