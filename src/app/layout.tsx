import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
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

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "700"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studybond.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "StudyBond — UI Post-UTME Past Questions & CBT Practice",
    template: "%s — StudyBond",
  },
  description:
    "Practice with real University of Ibadan Post-UTME past questions on StudyBond. Free CBT simulation, 100 questions in 90 minutes, score analytics, leaderboards, and 1v1 duels. Start free — no credit card.",
  keywords: [
    "StudyBond",
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
    icon: "/studybond-logo.png",
    apple: "/studybond-logo.png",
  },
  alternates: {
    canonical: appUrl,
  },
  other: {
    "geo.region": "NG",
    "geo.placename": "Nigeria",
  },
  openGraph: {
    title: "StudyBond — UI Post-UTME Past Questions & CBT Practice",
    description:
      "Practice with real University of Ibadan Post-UTME past questions. Free CBT simulation, score analytics, leaderboards, and 1v1 duels. Start free.",
    url: appUrl,
    siteName: "StudyBond",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "StudyBond — UI Post-UTME CBT Practice",
      },
    ],
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyBond — UI Post-UTME Past Questions & Practice",
    description:
      "Nigeria's #1 Post-UTME exam prep platform. Real past questions, timed CBT, score analytics. Free to start.",
    images: ["/api/og"],
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
      className={`${inter.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable}`}
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
