import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Exam in Progress",
  robots: { index: false, follow: false },
};

/**
 * Immersive exam layout — NO sidebar, NO bottom nav, NO learner shell.
 * The exam arena owns the entire viewport.
 */
export default function ExamSessionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
