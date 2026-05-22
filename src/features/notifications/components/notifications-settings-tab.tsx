"use client";

import { notificationsUiEnabled } from "@/features/notifications/notifications.config";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/features/notifications/hooks/use-notifications";
import type { NotificationPreferences } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import {
  Award,
  BellRing,
  Crown,
  Flame,
  Flag,
  Loader2,
  Megaphone,
  Swords,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PreferenceKey = keyof NotificationPreferences;

const preferenceCards: Array<{
  key: PreferenceKey;
  label: string;
  description: string;
  Icon: typeof BellRing;
  accentClassName: string;
}> = [
  {
    key: "streaks",
    label: "Streaks",
    description: "Milestones, freezer rewards, and at-risk reminders before the Lagos day closes.",
    Icon: Flame,
    accentClassName: "text-orange-300",
  },
  {
    key: "achievements",
    label: "Achievements",
    description: "Celebrate new unlocks the moment you earn them.",
    Icon: Award,
    accentClassName: "text-emerald-300",
  },
  {
    key: "collaboration",
    label: "Collaboration",
    description: "High-signal duel and session lifecycle updates without join-noise spam.",
    Icon: Swords,
    accentClassName: "text-sky-300",
  },
  {
    key: "subscription",
    label: "Subscription",
    description: "Activation, renewal, warning, and expiry moments that affect access.",
    Icon: Crown,
    accentClassName: "text-amber-300",
  },
  {
    key: "reports",
    label: "Reports",
    description: "Stay updated when question reports are reviewed or resolved.",
    Icon: Flag,
    accentClassName: "text-rose-300",
  },
  {
    key: "announcements",
    label: "Announcements",
    description: "Operational notices from StudyBond tailored to your access tier and institution.",
    Icon: Megaphone,
    accentClassName: "text-cyan-300",
  },
];

export function NotificationsSettingsTab() {
  const preferencesQuery = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();
  const [pendingKey, setPendingKey] = useState<PreferenceKey | null>(null);

  async function togglePreference(key: PreferenceKey, nextValue: boolean) {
    setPendingKey(key);
    try {
      await updatePreferences.mutateAsync({
        [key]: nextValue,
      } as Partial<NotificationPreferences>);
      toast.success(`${nextValue ? "Enabled" : "Paused"} ${key} notifications`);
    } catch (error) {
      toast.error("Could not update notifications", {
        description:
          error instanceof Error ? error.message : "Please try again in a moment.",
      });
    } finally {
      setPendingKey(null);
    }
  }

  if (!notificationsUiEnabled) {
    return (
      <div className="rounded-3xl border border-white/[0.05] bg-white/[0.02] p-6 text-sm text-white/45">
        Notification controls will appear here when the in-app inbox rollout is enabled.
      </div>
    );
  }

  if (preferencesQuery.isLoading) {
    return (
      <div className="flex min-h-[18rem] items-center justify-center rounded-3xl border border-white/[0.05] bg-white/[0.02]">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--sb-accent)]/70" />
      </div>
    );
  }

  if (!preferencesQuery.data) {
    return (
      <div className="rounded-3xl border border-red-400/15 bg-red-400/[0.04] p-6 text-sm text-red-200/85">
        We couldn&apos;t load your notification preferences right now.
      </div>
    );
  }

  const preferences = preferencesQuery.data.preferences;

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-white/[0.06] bg-[radial-gradient(circle_at_top_right,rgba(224,144,64,0.16),transparent_38%),linear-gradient(145deg,#0b0c0f_0%,#101116_54%,#09090b_100%)] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--sb-accent)]/12 text-[var(--sb-accent)] shadow-[0_0_20px_var(--sb-accent-glow)]">
            <BellRing className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">In-app notifications</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
              Fine-tune the signals that should reach your inbox. We keep this focused on
              study-critical moments instead of noisy feed spam.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {preferenceCards.map(({ key, label, description, Icon, accentClassName }) => {
          const enabled = preferences[key];
          const isPending = updatePreferences.isPending && pendingKey === key;

          return (
            <div
              key={key}
              className={cn(
                "rounded-2xl border p-4 transition-all duration-300",
                enabled
                  ? "border-white/[0.08] bg-white/[0.03]"
                  : "border-white/[0.04] bg-white/[0.015]"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05]",
                    accentClassName
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]",
                        enabled
                          ? "bg-[var(--sb-accent)]/12 text-[var(--sb-accent-text)]"
                          : "bg-white/[0.05] text-white/35"
                      )}
                    >
                      {enabled ? "Live" : "Muted"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-white/45">{description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => togglePreference(key, !enabled)}
                  disabled={updatePreferences.isPending}
                  aria-pressed={enabled}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
                    enabled
                      ? "bg-[var(--sb-accent)] shadow-[0_0_14px_var(--sb-accent-glow)]"
                      : "bg-white/[0.08]"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300",
                      enabled ? "left-[calc(100%-1.625rem)]" : "left-0.5"
                    )}
                  >
                    {isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin text-black/70" />
                    ) : null}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4 text-sm leading-relaxed text-white/45">
        Personal activity alerts respect your own category choices. Operational announcements
        stay targeted by audience, institution, and verification state before they ever appear
        in your inbox.
      </div>
    </div>
  );
}
