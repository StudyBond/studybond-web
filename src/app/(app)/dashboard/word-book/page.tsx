import type { Metadata } from "next";

import { WordBookPage } from "@/features/words/components/word-book-page";

export const metadata: Metadata = {
  title: "Word book | StudyBond",
};

export default function WordBookRoute() {
  return <WordBookPage />;
}
