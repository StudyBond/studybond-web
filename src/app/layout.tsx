import type { Metadata, Viewport } from "next";
import {
  Inter,
  JetBrains_Mono,
  Outfit,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { Analytics } from "@vercel/analytics/next";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo/json-ld";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-marketing",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Headings, scores, ranks, timers and SP on the Duel and leaderboard screens
// (with Satoshi for reading text, set up in globals.css). Not preloaded: only
// those screens use it, so other pages never download it.
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: false,
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studybond.app";

/* interactive-widget=resizes-content: when the phone keyboard opens, the
   page shrinks to the space above it. Without it, Android lays the keyboard
   over the page, so a bottom sheet's button (Join on the duel code sheet)
   hides behind the keyboard and students have to scroll to find it. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "StudyBond — JAMB UTME & UI Post-UTME Past Questions and CBT Practice",
    template: "%s — StudyBond",
  },
  description:
    "Real JAMB UTME and UI Post-UTME past questions in timed CBT practice, each exam kept on its own. Every answer explained, live duels with other students, free to start.",
  keywords: [
    "StudyBond",
    "JAMB past questions",
    "JAMB UTME past questions",
    "JAMB CBT practice",
    "UTME practice",
    "UI Post UTME",
    "UI post utme past questions",
    "University of Ibadan Post UTME",
    "university of ibadan post utme past questions",
    "UI past questions",
    "real UI past questions",
    "UI post utme practice",
    "how to pass UI post utme",
    "UI post utme English questions",
    "UI post utme chemistry questions",
    "UI post utme biology questions",
    "UI post utme physics questions",
    "best site for UI post utme",
    "UI post utme cut off mark",
    "UI post utme exam format",
    "UI post utme score calculator",
    "Nigerian students",
    "Post UTME practice",
    "CBT practice",
    "exam preparation Nigeria",
    "UI MBBS post utme",
    "UI Engineering post utme",
  ],
  applicationName: "StudyBond",
  icons: {
    // Solid dark tile: the logo's white half vanishes on white (Google results, light tabs).
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  /* No site-wide canonical: each indexable page sets its own. A canonical
     here made every page without one (duel links, share pages) point at the
     homepage. */
  other: {
    "geo.region": "NG",
    "geo.placename": "Nigeria",
  },
  openGraph: {
    title: "StudyBond — JAMB UTME & UI Post-UTME Past Questions and CBT Practice",
    description:
      "Real JAMB UTME and UI Post-UTME past questions in timed CBT practice, each exam kept on its own. Every answer explained, live duels, free to start.",
    url: appUrl,
    siteName: "StudyBond",
    images: [
      {
        // The homepage's picture is the site's default.
        url: "/api/og/home",
        width: 1200,
        height: 630,
        alt: "StudyBond — JAMB UTME and UI Post-UTME CBT practice",
      },
    ],
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyBond — JAMB UTME & UI Post-UTME Past Questions and CBT Practice",
    description:
      "Real JAMB UTME and UI Post-UTME past questions in timed CBT practice, each exam kept on its own. Free to start.",
    images: ["/api/og/home"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-NG"
      className={`${inter.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen font-[family-name:var(--font-marketing)] antialiased"
        suppressHydrationWarning
      >
        {/* Global structured data — inherited by every page */}
        <JsonLdScript data={organizationJsonLd(appUrl)} />
        <JsonLdScript data={websiteJsonLd(appUrl)} />
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
