import { BookmarksPageClient } from "@/features/bookmarks/components/bookmarks-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Vault | StudyBond",
};

export default function BookmarksPage() {
  return <BookmarksPageClient />;
}
