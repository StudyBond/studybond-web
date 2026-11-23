"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { getDashboardHome, homeKeys } from "@/features/home/api";
import { ChevronLeft } from "@/features/home/icons";
import { NotificationsSettingsTab } from "@/features/notifications/components/notifications-settings-tab";
import { notificationsUiEnabled } from "@/features/notifications/notifications.config";
import { AdminTab } from "@/features/settings/components/admin-tab";
import { CommunityTab } from "@/features/settings/components/community-tab";
import { DangerZone } from "@/features/settings/components/danger-zone";
import { ExamTab } from "@/features/settings/components/exam-tab";
import { ProfileTab } from "@/features/settings/components/profile-tab";
import { SecurityTab } from "@/features/settings/components/security-tab";
import { SubscriptionTab } from "@/features/settings/components/subscription-tab";
import { useProfile } from "@/features/settings/hooks/use-settings";
import { PAYMENT_SUPPORT_EMAIL, useRefreshPremium, useVerifySubscription } from "@/features/settings/hooks/use-subscription";
import { cn } from "@/lib/utils/cn";

import { Loading } from "./settings-ui";
import s from "./settings.module.css";

/* Each settings section is its own page, opened from a row on Me (canvas
   16i), with a way back to Me. The address stays /dashboard/settings?tab=…
   because premium buttons, emails and the Paystack return all use it. */

const SECTIONS = {
  profile: "Profile",
  subscription: "Plan",
  security: "Security",
  exam: "Exam settings",
  community: "Community",
  notifications: "Notifications",
  admin: "Admin controls",
  danger: "Delete account",
} as const;

type Section = keyof typeof SECTIONS;

function pickSection(tab: string | null, hasReference: boolean, isAdmin: boolean): Section {
  if (!tab || !(tab in SECTIONS)) return hasReference ? "subscription" : "profile";
  if (tab === "notifications" && !notificationsUiEnabled) return "profile";
  if (tab === "admin" && !isAdmin) return "profile";
  return tab as Section;
}

export function SettingsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const profile = useProfile();
  const home = useQuery({ queryKey: homeKeys.home, queryFn: getDashboardHome, staleTime: 30_000, retry: 1 });

  const p = profile.data;
  const isAdmin = p?.role === "ADMIN" || p?.role === "SUPERADMIN";
  const premium = home.data?.plan.isPremium ?? p?.isPremium ?? false;
  const reference = searchParams.get("reference");
  const tab = searchParams.get("tab");
  const section = pickSection(tab, Boolean(reference), isAdmin);
  /* Wait for the role before deciding an admin link isn't one. */
  const waitingForRole = tab === "admin" && !p;
  const title = waitingForRole ? SECTIONS.admin : SECTIONS[section];

  /* Back from Paystack's own page: confirm the payment once. */
  const { mutate: verify } = useVerifySubscription();
  const refreshPremium = useRefreshPremium();
  const verified = useRef<string | null>(null);
  useEffect(() => {
    if (!reference || verified.current === reference) return;
    verified.current = reference;
    verify(
      { reference },
      {
        onSuccess: async (data) => {
          if (data.paymentStatus === "SUCCESS") {
            if (data.activated) {
              toast.success("Premium is on", { description: data.message });
            } else {
              /* Paid, but held: a plan is still running on another exam. */
              toast.warning("Payment received", {
                description: `${data.message} Questions? Email ${PAYMENT_SUPPORT_EMAIL}.`,
                duration: 20000,
              });
            }
            await refreshPremium();
            router.replace("/dashboard/settings?tab=subscription" as Route);
          } else {
            toast.error("The payment didn't go through", { description: data.message });
          }
        },
      },
    );
  }, [reference, verify, refreshPremium, router]);

  let body: React.ReactNode;
  if (waitingForRole) body = <Loading />;
  else if (section === "profile") body = p ? <ProfileTab profile={p} isPremium={premium} /> : <Loading text={profile.isError ? "We couldn't load your profile. Check your internet and try again." : undefined} />;
  else if (section === "subscription") body = <SubscriptionTab />;
  else if (section === "security") body = <SecurityTab />;
  else if (section === "exam") body = <ExamTab />;
  else if (section === "community") body = <CommunityTab />;
  else if (section === "notifications") body = <NotificationsSettingsTab />;
  else if (section === "admin") body = <AdminTab />;
  else body = <DangerZone />;

  return (
    <LearnerShell
      isPremium={premium}
      profile={p}
      mobileTopBar={
        <div className={cn("sb-ui", s.bar)}>
          <Link href={"/dashboard/me" as Route} className={s.barBack} aria-label="Back to Me"><ChevronLeft /></Link>
          <h1>{title}</h1>
        </div>
      }
    >
      <div className={cn("sb-ui", s.wrap)}>
        <Link href={"/dashboard/me" as Route} className={s.back}><ChevronLeft />Me</Link>
        <h1 className={s.title}>{title}</h1>
        {body}
      </div>
    </LearnerShell>
  );
}
