"use client";

import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { notificationsUiEnabled } from "@/features/notifications/notifications.config";
import {
  useDismissAnnouncement,
  useDismissNotification,
  useMarkAnnouncementRead,
  useMarkNotificationRead,
  useNotificationActivity,
  useNotificationAnnouncements,
  useNotificationsSummary,
} from "@/features/notifications/hooks/use-notifications";
import { cn } from "@/lib/utils/cn";
import { BellRing, Loader2, Megaphone, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useState } from "react";

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60_000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

function priorityTone(priority: string) {
  switch (priority) {
    case "URGENT":
      return "border-red-400/20 bg-red-400/[0.05]";
    case "HIGH":
      return "border-[var(--sb-accent)]/20 bg-[var(--sb-accent)]/[0.05]";
    default:
      return "border-white/[0.06] bg-white/[0.02]";
  }
}

function resolveHref(deeplink: string | null): Route {
  if (!deeplink) return "/dashboard/notifications" as Route;
  return (deeplink.startsWith("/") ? deeplink : "/dashboard/notifications") as Route;
}

export function NotificationsPageClient() {
  const critical = useDashboardCriticalData();
  const [activityPage, setActivityPage] = useState(1);
  const [announcementPage, setAnnouncementPage] = useState(1);
  const summaryQuery = useNotificationsSummary(6);
  const activityQuery = useNotificationActivity({
    page: activityPage,
    limit: 12,
    state: "all",
  });
  const announcementsQuery = useNotificationAnnouncements({
    page: announcementPage,
    limit: 8,
    state: "all",
  });
  const markNotificationRead = useMarkNotificationRead();
  const dismissNotification = useDismissNotification();
  const markAnnouncementRead = useMarkAnnouncementRead();
  const dismissAnnouncement = useDismissAnnouncement();
  const isPremium = critical.stats.data?.isPremium ?? critical.profile.data?.isPremium ?? false;

  if (critical.isLoading) {
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
        <div className="p-8 text-center text-red-400">Failed to load notifications.</div>
      </LearnerShell>
    );
  }

  return (
    <LearnerShell profile={critical.profile.data} isPremium={isPremium}>
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 pb-24 space-y-8">
        <div className="relative overflow-hidden rounded-[32px] border border-white/[0.06] bg-[radial-gradient(circle_at_top_right,rgba(224,144,64,0.16),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(96,165,250,0.10),transparent_30%),linear-gradient(145deg,#0b0c0f_0%,#101116_48%,#09090b_100%)] px-5 py-7 sm:px-8 sm:py-8">
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--sb-accent)]/12 text-[var(--sb-accent)] shadow-[0_0_22px_var(--sb-accent-glow)]">
                <BellRing className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--sb-accent)]/90">
                  Inbox
                </p>
                <h1 className="mt-1 text-2xl font-bold text-white md:text-3xl">
                  Notifications
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/50">
                  Catch the moments that matter: streak pressure, premium lifecycle,
                  collaboration outcomes, report updates, and operational notices.
                </p>
              </div>
            </div>

            {notificationsUiEnabled ? (
              <div className="grid grid-cols-3 gap-3 text-center">
                <StatPill label="Unread" value={summaryQuery.data?.counts.totalUnreadCount ?? 0} />
                <StatPill label="Activity" value={summaryQuery.data?.counts.unreadActivityCount ?? 0} />
                <StatPill label="Announcements" value={summaryQuery.data?.counts.unreadAnnouncementCount ?? 0} />
              </div>
            ) : null}
          </div>
        </div>

        {!notificationsUiEnabled ? (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-white/50">
            Notifications are still in dark launch mode and will appear here once the feature is enabled.
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-3xl border border-white/[0.06] bg-[#0b0c0f] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Sparkles className="h-4 w-4 text-[var(--sb-accent)]" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Activity feed</h2>
                  <p className="text-sm text-white/40">Your personal learning and account updates.</p>
                </div>
              </div>

              <div className="space-y-3">
                {activityQuery.isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                  </div>
                ) : activityQuery.data?.items.length ? (
                  activityQuery.data.items.map((item) => (
                    <article
                      key={item.id}
                      className={cn(
                        "rounded-2xl border p-4 transition-all",
                        priorityTone(item.priority)
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                            {!item.isRead ? (
                              <span className="h-2.5 w-2.5 rounded-full bg-[var(--sb-accent)]" />
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-white/55">{item.body}</p>
                        </div>
                        <span className="shrink-0 text-[11px] text-white/28">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link
                          href={resolveHref(item.deeplink)}
                          onClick={() => {
                            if (!item.isRead) {
                              markNotificationRead.mutate(item.id);
                            }
                          }}
                          className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/[0.16] hover:text-white"
                        >
                          Open
                        </Link>
                        {!item.isRead ? (
                          <button
                            onClick={() => markNotificationRead.mutate(item.id)}
                            className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/55 transition hover:border-white/[0.16] hover:text-white"
                          >
                            Mark read
                          </button>
                        ) : null}
                        <button
                          onClick={() => dismissNotification.mutate(item.id)}
                          className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/45 transition hover:border-white/[0.16] hover:text-white"
                        >
                          Dismiss
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyInbox message="No activity notifications have landed yet." />
                )}
              </div>

              <PaginationRow
                page={activityPage}
                totalPages={activityQuery.data?.pagination.totalPages ?? 1}
                onPrev={() => setActivityPage((value) => Math.max(1, value - 1))}
                onNext={() =>
                  setActivityPage((value) =>
                    Math.min(activityQuery.data?.pagination.totalPages ?? 1, value + 1)
                  )
                }
              />
            </section>

            <section className="rounded-3xl border border-white/[0.06] bg-[#0b0c0f] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Megaphone className="h-4 w-4 text-cyan-300" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Announcements</h2>
                  <p className="text-sm text-white/40">Platform-wide updates tailored to your account.</p>
                </div>
              </div>

              <div className="space-y-3">
                {announcementsQuery.isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-white/40" />
                  </div>
                ) : announcementsQuery.data?.items.length ? (
                  announcementsQuery.data.items.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                            {!item.isRead ? (
                              <span className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                            ) : null}
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-white/55">{item.body}</p>
                          {item.institutionCode ? (
                            <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-cyan-200/65">
                              {item.institutionCode}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-[11px] text-white/28">
                          {formatRelativeTime(item.createdAt)}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link
                          href={resolveHref(item.deeplink)}
                          onClick={() => {
                            if (!item.isRead) {
                              markAnnouncementRead.mutate(item.id);
                            }
                          }}
                          className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-white/[0.16] hover:text-white"
                        >
                          Open
                        </Link>
                        {!item.isRead ? (
                          <button
                            onClick={() => markAnnouncementRead.mutate(item.id)}
                            className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/55 transition hover:border-white/[0.16] hover:text-white"
                          >
                            Mark read
                          </button>
                        ) : null}
                        <button
                          onClick={() => dismissAnnouncement.mutate(item.id)}
                          className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/45 transition hover:border-white/[0.16] hover:text-white"
                        >
                          Dismiss
                        </button>
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyInbox message="No active announcements right now." />
                )}
              </div>

              <PaginationRow
                page={announcementPage}
                totalPages={announcementsQuery.data?.pagination.totalPages ?? 1}
                onPrev={() => setAnnouncementPage((value) => Math.max(1, value - 1))}
                onNext={() =>
                  setAnnouncementPage((value) =>
                    Math.min(announcementsQuery.data?.pagination.totalPages ?? 1, value + 1)
                  )
                }
              />
            </section>
          </div>
        )}
      </div>
    </LearnerShell>
  );
}

function StatPill({ label, value }: Readonly<{ label: string; value: number }>) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function EmptyInbox({ message }: Readonly<{ message: string }>) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-8 text-center text-sm text-white/40">
      {message}
    </div>
  );
}

function PaginationRow({
  page,
  totalPages,
  onPrev,
  onNext,
}: Readonly<{
  page: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}>) {
  return (
    <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
      <p className="text-sm text-white/35">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:border-white/[0.16] hover:text-white disabled:opacity-35"
        >
          Prev
        </button>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:border-white/[0.16] hover:text-white disabled:opacity-35"
        >
          Next
        </button>
      </div>
    </div>
  );
}
