"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { NotificationsSettingsTab } from "@/features/notifications/components/notifications-settings-tab";
import { notificationsUiEnabled } from "@/features/notifications/notifications.config";
import { useProfile } from "@/features/settings/hooks/use-settings";
import { getSubscriptionStatus } from "@/lib/api/subscriptions";
import { useVerifySubscription } from "@/features/settings/hooks/use-subscription";
import { ProfileTab } from "@/features/settings/components/profile-tab";
import { SecurityTab } from "@/features/settings/components/security-tab";
import { SubscriptionTab } from "@/features/settings/components/subscription-tab";
import { DangerZone } from "@/features/settings/components/danger-zone";
import { CommunityTab } from "@/features/settings/components/community-tab";
import { AdminTab } from "@/features/settings/components/admin-tab";
import { useSwipe } from "@/hooks/use-swipe";
import {
  Settings,
  User,
  Shield,
  Crown,
  AlertTriangle,
  Loader2,
  BellRing,
  MessageCircle,
} from "lucide-react";

const baseTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "subscription", label: "Plan", icon: Crown },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
] as const;

const notificationsTab = {
  id: "notifications",
  label: "Notifications",
  icon: BellRing,
} as const;

const communityTab = {
  id: "community",
  label: "Community",
  icon: MessageCircle,
} as const;

const adminTab = {
  id: "admin",
  label: "Admin Controls",
  icon: Shield,
} as const;

type TabId = "profile" | "security" | "subscription" | "community" | "notifications" | "admin" | "danger";

const VALID_TAB_IDS: readonly string[] = ["profile", "security", "subscription", "community", "notifications", "admin", "danger"];

function isTabId(value: string): value is TabId {
  return VALID_TAB_IDS.includes(value);
}

export function SettingsPageClient() {
  const critical = useDashboardCriticalData();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const isAdmin = profile?.role === "ADMIN" || profile?.role === "SUPERADMIN";

  const TABS = [
    baseTabs[0],
    baseTabs[1],
    baseTabs[2],
    communityTab,
    ...(notificationsUiEnabled ? [notificationsTab] : []),
    ...(isAdmin ? [adminTab] : []),
    baseTabs[3],
  ];

  // Derive premium status from stats (always available in critical data)
  const isPremium = critical.stats.data?.isPremium ?? false;

  // Fetch subscription details separately (only when needed)
  const { data: subscriptionData, refetch: refetchSubscription } = useQuery({
    queryKey: ["settings", "subscription-status"],
    queryFn: getSubscriptionStatus,
  });

  // Handle Paystack callback verification
  const searchParams = useSearchParams();
  const router = useRouter();
  const verifyMutation = useVerifySubscription();
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    const reference = searchParams.get("reference");
    const tab = searchParams.get("tab");

    if (tab && isTabId(tab) && activeTab !== tab) {
      setActiveTab(tab);
    }

    if (reference && !hasVerified && !verifyMutation.isPending) {
      setHasVerified(true);
      verifyMutation.mutate(
        { reference },
        {
          onSuccess: (data) => {
            if (data.paymentStatus === "SUCCESS") {
              toast.success("Premium Activated!", {
                description: data.message,
              });
              refetchSubscription();
              // Clean up URL
              router.replace("/dashboard/settings?tab=subscription");
            } else {
              toast.error("Payment Not Successful", {
                description: data.message,
              });
            }
          },
        }
      );
    }
  }, [searchParams, hasVerified, verifyMutation, activeTab, router, refetchSubscription]);

  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      const currentIndex = TABS.findIndex((t) => t.id === activeTab);
      if (currentIndex < TABS.length - 1) setActiveTab(TABS[currentIndex + 1].id);
    },
    onSwipedRight: () => {
      const currentIndex = TABS.findIndex((t) => t.id === activeTab);
      if (currentIndex > 0) setActiveTab(TABS[currentIndex - 1].id);
    },
  });

  if (critical.isLoading || profileLoading) {
    return (
      <LearnerShell>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-accent)] opacity-50" />
        </div>
      </LearnerShell>
    );
  }

  if (critical.isError || !critical.profile.data) {
    return (
      <LearnerShell>
        <div className="p-8 text-center text-red-400/80">Failed to load profile.</div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell
      profile={critical.profile.data}
      isPremium={isPremium}
      subscriptionData={subscriptionData ?? undefined}
    >
      <div className="space-y-6 md:space-y-8" {...swipeHandlers}>
        {/* Header */}
        <div className="flex items-center gap-4 pb-2">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-white/50 shadow-lg">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Settings</h1>
            <p className="text-[13px] md:text-sm text-white/30">Manage your account, security, and preferences</p>
          </div>
        </div>

        {/* Layout: sidebar tabs on desktop, horizontal pills on mobile */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 min-w-0">
          {/* Tab Navigation */}
          <nav className="md:w-56 shrink-0 z-10 sticky top-[60px] md:top-24 min-w-0">
            {/* Mobile: horizontal scroll pills */}
            <div className="md:hidden -mx-4 sm:-mx-5 flex gap-2 overflow-x-auto px-4 sm:px-5 pb-2 sb-scroll-hide">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-xs font-semibold transition-all duration-300 shrink-0",
                      isActive
                        ? tab.id === "danger"
                          ? "bg-red-400/10 text-red-400 ring-1 ring-red-400/20"
                          : "bg-[var(--sb-accent)]/10 text-[var(--sb-accent)] ring-1 ring-[var(--sb-accent)]/20"
                        : "bg-white/[0.02] text-white/30 hover:bg-white/[0.04] hover:text-white/50",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Desktop: vertical tabs */}
            <div className="hidden md:flex flex-col gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] font-medium transition-all duration-300 text-left",
                      isActive
                        ? tab.id === "danger"
                          ? "bg-red-400/[0.06] text-red-400"
                          : "bg-white/[0.04] text-white"
                        : "text-white/30 hover:bg-white/[0.02] hover:text-white/50",
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && tab.id !== "danger" && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--sb-accent)] shadow-[0_0_8px_var(--sb-accent-glow)]" />
                    )}
                    {isActive && tab.id === "danger" && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.3)]" />
                    )}
                    <Icon className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive && tab.id !== "danger" && "text-[var(--sb-accent)]",
                      isActive && tab.id === "danger" && "text-red-400",
                    )} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Tab Content */}
          <div className="flex-1 min-w-0 pb-12">
            <div className="animate-in fade-in slide-in-from-right-4 duration-300" key={activeTab}>
              {activeTab === "profile" && profile && (
                <ProfileTab profile={profile} isPremium={isPremium} />
              )}
              {activeTab === "security" && <SecurityTab isPremium={isPremium} />}
              {activeTab === "subscription" && (
                <SubscriptionTab
                  isPremium={isPremium}
                  subscriptionData={subscriptionData ?? undefined}
                />
              )}
              {activeTab === "notifications" && <NotificationsSettingsTab />}
              {activeTab === "community" && <CommunityTab isPremium={isPremium} />}
              {activeTab === "admin" && <AdminTab />}
              {activeTab === "danger" && <DangerZone />}
            </div>
          </div>
        </div>
      </div>
    </LearnerShell>
  );
}
