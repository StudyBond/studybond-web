/**
 * StudyBond — Centralized JSON-LD Structured Data Generators
 *
 * Every public page must use these generators to produce consistent,
 * validated schema.org markup. Render via <JsonLdScript />.
 */

// ─── EducationalOrganization (root layout) ───────────────────────────

export function organizationJsonLd(appUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "StudyBond",
    url: appUrl,
    logo: `${appUrl}/studybond-logo.png`,
    description:
      "StudyBond is Nigeria's #1 Post-UTME exam preparation platform. Practice with real University of Ibadan past questions, timed CBT simulation, score analytics, and 1v1 competitive duels.",
    foundingDate: "2025",
    areaServed: {
      "@type": "Country",
      name: "Nigeria",
    },
    sameAs: [] as string[],
  };
}

// ─── WebSite with SearchAction (root layout — sitelinks search box) ──

export function websiteJsonLd(appUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "StudyBond",
    url: appUrl,
    description:
      "Free Post-UTME exam preparation with real past questions, CBT simulation, and performance analytics for Nigerian university candidates.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${appUrl}/ui-post-utme?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// ─── Course (pillar + subject pages) ─────────────────────────────────

export function courseJsonLd(params: {
  appUrl: string;
  name: string;
  description: string;
  url: string;
  subject?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: params.name,
    description: params.description,
    url: params.url,
    provider: {
      "@type": "EducationalOrganization",
      name: "StudyBond",
      url: params.appUrl,
    },
    educationalLevel: "University Entrance",
    inLanguage: "en",
    ...(params.subject && { about: params.subject }),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      description: "Free first exam — no credit card required",
    },
  };
}

// ─── FAQPage ─────────────────────────────────────────────────────────

export function faqJsonLd(items: ReadonlyArray<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

// ─── BreadcrumbList ──────────────────────────────────────────────────

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Article / BlogPosting ───────────────────────────────────────────

export function articleJsonLd(params: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified: string;
  appUrl: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished,
    dateModified: params.dateModified,
    image: params.imageUrl || `${params.appUrl}/studybond-lockup.png`,
    author: {
      "@type": "Organization",
      name: "StudyBond",
      url: params.appUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "StudyBond",
      logo: {
        "@type": "ImageObject",
        url: `${params.appUrl}/studybond-logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": params.url,
    },
  };
}

// ─── AggregateRating ─────────────────────────────────────────────────

export function aggregateRatingJsonLd(params: {
  appUrl: string;
  ratingValue: number;
  ratingCount: number;
  bestRating?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "StudyBond",
    url: params.appUrl,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: params.ratingValue,
      ratingCount: params.ratingCount,
      bestRating: params.bestRating ?? 5,
      worstRating: 1,
    },
  };
}
