"use client";

import { notificationsUiEnabled } from "@/features/notifications/notifications.config";
import {
  useMarkAllNotificationsRead,
  useMarkAnnouncementRead,
  useMarkNotificationRead,
  useNotificationsSummary,
} from "@/features/notifications/hooks/use-notifications";
import { cn } from "@/lib/utils/cn";
import { Bell, Megaphone, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60_000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

function resolveHref(deeplink: string | null): Route {
  if (!deeplink) return "/dashboard/notifications" as Route;
  return (deeplink.startsWith("/") ? deeplink : "/dashboard/notifications") as Route;
}

export function NotificationBell({
  mobile = false,
}: Readonly<{ mobile?: boolean }>) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const summaryQuery = useNotificationsSummary(6);
  const markRead = useMarkNotificationRead();
  const markAnnouncementRead = useMarkAnnouncementRead();
  const markAllRead = useMarkAllNotificationsRead();

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (!notificationsUiEnabled) {
    return null;
  }

  const summary = summaryQuery.data;
  const unreadActivityCount = summary?.counts.unreadActivityCount ?? 0;
  const unreadCount = summary?.counts.totalUnreadCount ?? 0;

  async function openNotification(href: Route, kind: "activity" | "announcement", id: string, isRead: boolean) {
    if (kind === "activity" && !isRead) {
      await markRead.mutateAsync(id).catch(() => undefined);
    }
    if (kind === "announcement" && !isRead) {
      await markAnnouncementRead.mutateAsync(id).catch(() => undefined);
    }
    setOpen(false);
    router.push(href);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "relative flex items-center justify-center transition-colors",
          mobile
            ? "h-8 w-8 rounded-full bg-white/[0.05] border border-white/[0.05] hover:bg-white/[0.08]"
            : "h-9 w-9 rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
        )}
        aria-label="Open notifications"
      >
        <Bell className={cn("shrink-0", mobile ? "h-3.5 w-3.5" : "h-4 w-4")} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-[var(--sb-accent)] px-1 text-[9px] font-bold text-[var(--sb-bg)] shadow-[0_0_14px_var(--sb-accent-glow)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className={cn(
            "absolute z-50 overflow-hidden rounded-3xl border border-white/[0.08] bg-[rgba(11,11,14,0.96)] shadow-[0_24px_80px_rgba(0,0,0,0.55)] backdrop-blur-2xl",
            mobile ? "right-0 top-11 w-[min(92vw,22rem)]" : "right-0 top-12 w-[24rem]"
          )}
        >
          <div className="border-b border-white/[0.06] bg-[radial-gradient(circle_at_top,rgba(224,144,64,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--sb-accent)]/90">
                  Notifications
                </p>
                <h3 className="mt-1 text-base font-semibold text-white">
                  Stay in the loop
                </h3>
                <p className="mt-1 text-xs text-white/45">
                  {unreadCount > 0
                    ? `${unreadCount} unread update${unreadCount === 1 ? "" : "s"} waiting`
                    : "You’re all caught up for now"}
                </p>
              </div>
              <button
                onClick={() => markAllRead.mutate()}
                disabled={unreadActivityCount === 0 || markAllRead.isPending}
                className="rounded-full border border-white/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 transition hover:border-white/[0.16] hover:text-white disabled:opacity-40"
              >
                Read activity
              </button>
            </div>
          </div>

          <div className="max-h-[28rem] overflow-y-auto p-4">
            <div className="space-y-5">
              <section>
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  <Sparkles className="h-3.5 w-3.5" />
                  Activity
                </div>
                <div className="space-y-2">
                  {summary?.recentActivity.length ? (
                    summary.recentActivity.map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          openNotification(resolveHref(item.deeplink), "activity", item.id, item.isRead)
                        }
                        className={cn(
                          "w-full rounded-2xl border p-3 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04]",
                          item.isRead
                            ? "border-white/[0.05] bg-white/[0.02]"
                            : "border-[var(--sb-accent)]/20 bg-[var(--sb-accent)]/[0.06]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-white/55">
                              {item.body}
                            </p>
                          </div>
                          {!item.isRead ? (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--sb-accent)]" />
                          ) : null}
                        </div>
                        <p className="mt-2 text-[11px] text-white/30">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-5 text-sm text-white/40">
                      No activity notifications yet.
                    </div>
                  )}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                  <Megaphone className="h-3.5 w-3.5" />
                  Announcements
                </div>
                <div className="space-y-2">
                  {summary?.activeAnnouncements.length ? (
                    summary.activeAnnouncements.map((item) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          openNotification(resolveHref(item.deeplink), "announcement", item.id, item.isRead)
                        }
                        className={cn(
                          "w-full rounded-2xl border p-3 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.04]",
                          item.isRead
                            ? "border-white/[0.05] bg-white/[0.02]"
                            : "border-cyan-400/20 bg-cyan-400/[0.05]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{item.title}</p>
                            <p className="mt-1 text-xs leading-relaxed text-white/55">
                              {item.body}
                            </p>
                          </div>
                          {!item.isRead ? (
                            <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-300" />
                          ) : null}
                        </div>
                        <p className="mt-2 text-[11px] text-white/30">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-white/[0.05] bg-white/[0.02] px-4 py-5 text-sm text-white/40">
                      No active announcements right now.
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          <div className="border-t border-white/[0.06] p-4">
            <Link
              href={"/dashboard/notifications" as Route}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-2xl bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Open full inbox
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
