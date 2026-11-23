import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { SettingsPageClient } from "@/features/settings/components/settings-page";

export const metadata: Metadata = {
  title: "Settings | StudyBond",
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/* Each section has its own address (?tab=profile, ?tab=subscription…).
   With none, Me is the list of sections. A Paystack return carries a
   reference and is kept, so the payment is still confirmed. */
export default async function DashboardSettingsPage({ searchParams }: Props) {
  const params = await searchParams;
  if (!params.tab && !params.reference) redirect("/dashboard/me" as Route);
  return <SettingsPageClient />;
}
