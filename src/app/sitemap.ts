import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studybond.app";

const subjects = ["english", "mathematics", "chemistry", "physics", "biology"] as const;
const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;

const blogSlugs = [
  "how-to-pass-ui-post-utme",
  "ui-post-utme-cut-off-mark",
  "ui-post-utme-exam-format",
  "ui-post-utme-score-calculator",
  "best-ui-post-utme-practice",
  "ui-post-utme-registration",
  "ui-mbbs-post-utme",
  "ui-engineering-post-utme",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    // Homepage
    {
      url: appUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Pillar page
    {
      url: `${appUrl}/ui-post-utme`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    // Blog Hub page
    {
      url: `${appUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // Subject cluster pages
  const subjectPages: MetadataRoute.Sitemap = subjects.map((subject) => ({
    url: `${appUrl}/ui-post-utme/${subject}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Year-specific past question pages
  const yearPages: MetadataRoute.Sitemap = years.map((year) => ({
    url: `${appUrl}/ui-post-utme/past-questions/${year}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.85,
  }));

  // Blog / guide pages
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${appUrl}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...subjectPages, ...yearPages, ...blogPages];
}
