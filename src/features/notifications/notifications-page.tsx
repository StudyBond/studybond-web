"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { getDashboardHome, homeKeys } from "@/features/home/api";
import { getUserProfile } from "@/lib/api/users";
import { cn } from "@/lib/utils/cn";

import { useInboxActions, useUnreadCount } from "./hooks";
import { ChevronLeft } from "./icons";
import { Inbox } from "./inbox";
import s from "./notifications.module.css";

/* /dashboard/notifications (board 1). The phone bell opens it; on a laptop
   the bell opens a panel and "See all notifications" lands here. An alert
   tapped on this device opens it with ?open=<note id>. */

function MarkAllRead() {
  const unread = useUnreadCount();
  const { readAll } = useInboxActions();
  const allRead = (unread.data ?? 0) === 0;
  return (
    <button type="button" className={s.textBtn} onClick={() => readAll.mutate()} disabled={allRead}>
      {allRead ? "All read" : "Mark all read"}
    </button>
  );
}

export function NotificationsPage() {
  const params = useSearchParams();
  const picked = params.get("open");
  const profile = useQuery({ queryKey: ["dashboard", "profile"], queryFn: getUserProfile, retry: 1 });
  const home = useQuery({ queryKey: homeKeys.home, queryFn: getDashboardHome, staleTime: 30_000, retry: 1 });
  const premium = home.data?.plan.isPremium ?? profile.data?.isPremium ?? false;

  return (
    <LearnerShell
      isPremium={premium}
      profile={profile.data}
      mobileTopBar={
        <div className={cn("sb-ui", s.bar)}>
          <Link href={"/dashboard" as Route} className={s.barBack} aria-label="Back to Home"><ChevronLeft /></Link>
          <h1>Notifications</h1>
          <MarkAllRead />
        </div>
      }
    >
      <div className={cn("sb-ui", s.pageWrap)}>
        <div className={s.pageHead}>
          <h1>Notifications</h1>
          <MarkAllRead />
        </div>
        <Inbox variant="page" pickedId={picked} />
      </div>
    </LearnerShell>
  );
}
