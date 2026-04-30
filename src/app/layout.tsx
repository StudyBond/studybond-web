import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { Analytics } from "@vercel/analytics/next";
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

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "StudyBond — Your Post-UTME Prep Partner",
    template: "%s — StudyBond",
  },
  description:
    "StudyBond is a premium exam preparation platform for Nigerian students. Practice with real past questions, track your progress, compete on leaderboards, and prepare for UI Post-UTME with confidence.",
  keywords: [
    "StudyBond",
    "UI Post UTME",
    "University of Ibadan Post UTME",
    "Nigerian students",
    "Post UTME practice",
    "CBT practice",
    "exam preparation",
  ],
  applicationName: "StudyBond",
  icons: {
    icon: "/studybond-logo.png",
    apple: "/studybond-logo.png",
  },
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    title: "StudyBond — Your Post-UTME Prep Partner",
    description:
      "Practice with real past questions, track your streaks, climb the leaderboard, and crush your Post-UTME exam.",
    url: appUrl,
    siteName: "StudyBond",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StudyBond — Your Post-UTME Prep Partner",
    description:
      "A premium exam preparation platform for serious Nigerian students.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} ${plusJakartaSans.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body
        className="min-h-screen font-[family-name:var(--font-marketing)] antialiased"
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
