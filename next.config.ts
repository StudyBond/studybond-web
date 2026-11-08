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
      // 1v1 duels used to live under "collaboration". Old invite links and
      // notification deeplinks saved in the database still point there.
      // Temporary on purpose: browsers cache permanent redirects, and the
      // collaboration path is reserved for a future group collab exam.
      // Delete these two rules when that feature takes the path.
      {
        source: "/dashboard/collaboration",
        destination: "/dashboard/duel",
        permanent: false,
      },
      {
        source: "/dashboard/collaboration/:code",
        destination: "/dashboard/duel/:code",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
