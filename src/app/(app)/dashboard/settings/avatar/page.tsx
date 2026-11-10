import { AvatarMakerPage } from "@/features/avatar/components/avatar-maker-page";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your avatar | StudyBond",
};

export default function DashboardAvatarPage() {
  return <AvatarMakerPage />;
}
