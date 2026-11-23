"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  Bookmark,
  ChevronDown,
  Clock,
  GraduationCap,
  Home,
  ListOrdered,
  Settings,
  Swords,
  User,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoLockup } from "@/components/ui/logo";
import { PageTransition } from "@/components/ui/page-transition";
import {
  WhatsAppChannelPrompt,
  useWhatsAppChannelState,
} from "@/components/ui/whatsapp-channel-prompt";
import { WhatsAppChannelMobilePill } from "@/components/ui/whatsapp-channel-pill";
import { Avatar } from "@/features/avatar/components/avatar";
import { useMyAvatar } from "@/features/avatar/hooks/use-my-avatar";
import { BoardSheet } from "@/features/home/board-sheet";
import { boardLabel, shortName } from "@/features/home/format";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { useNotificationsRealtime } from "@/features/notifications/hooks/use-notifications";
import { getDuelHome } from "@/lib/api/duel";
import { getSubscriptionStatus } from "@/lib/api/subscriptions";
import type { SubscriptionStatus, UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import s from "./learner-shell.module.css";

/* The app shell from the dashboard canvas: on a laptop the 232px sidebar
   (16e: logo, board switcher, Study and Compete, the name box that opens
   settings), with no top bar; on a phone the 5-tab bar (16a). The bell
   renders only while notificationsUiEnabled is on (NotificationBell checks). */

function isRouteActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

type NavItem = { label: string; href: string; icon: typeof Home; match?: string[] };

const studyNav: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Practice", href: "/dashboard/practice", icon: BookOpen },
  { label: "Study mode", href: "/dashboard/study", icon: GraduationCap },
  { label: "Past papers", href: "/dashboard/history", icon: Clock },
  { label: "Study vault", href: "/dashboard/bookmarks", icon: Bookmark },
];

const competeNav: NavItem[] = [
  { label: "Duel", href: "/dashboard/duel", icon: Swords },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: ListOrdered },
];

/** Phone tabs: Home / Practice / Duel / Board / Me. Settings and the vault are reached from Me. */
const bottomTabs: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Practice", href: "/dashboard/practice", icon: BookOpen },
  { label: "Duel", href: "/dashboard/duel", icon: Swords },
  { label: "Board", href: "/dashboard/leaderboard", icon: ListOrdered },
  { label: "Me", href: "/dashboard/me", icon: User, match: ["/dashboard/me", "/dashboard/settings", "/dashboard/streak"] },
];

function isActive(pathname: string, item: NavItem) {
  return (item.match ?? [item.href]).some((href) => isRouteActive(pathname, href));
}

type LearnerShellProps = {
  children: React.ReactNode;
  isPremium?: boolean;
  /** Older pages still pass this; the shell reads the plan itself now. */
  subscriptionData?: SubscriptionStatus;
  profile?: UserProfile;
  /** Replaces the phone top strip. Home passes its own (board switcher,
   *  streak count, avatar); Me and the streak page pass their titles. */
  mobileTopBar?: React.ReactNode;
  /** The plan line under the name, when the page knows it better (Home). */
  planText?: string;
};

export function LearnerShell({
  children,
  isPremium = false,
  profile,
  mobileTopBar,
  planText,
}: Readonly<LearnerShellProps>) {
  useNotificationsRealtime();

  const pathname = usePathname();
  const waChannel = useWhatsAppChannelState();
  const avatar = useMyAvatar();
  const examProfile = useExamProfile();
  const [boardsOpen, setBoardsOpen] = useState(false);

  const subscription = useQuery({
    queryKey: ["dashboard", "subscription-status"],
    queryFn: getSubscriptionStatus,
    enabled: isPremium && !planText,
    staleTime: 5 * 60_000,
  });
  /* The blue count on Duel: challenges waiting for you. Read now and then,
     not polled, so every page doesn't keep asking. */
  const duel = useQuery({
    queryKey: ["shell", "duel-waiting"],
    queryFn: getDuelHome,
    staleTime: 2 * 60_000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const waiting = duel.data?.incomingChallenges.length ?? 0;

  const days = subscription.data?.currentSubscription?.daysRemaining;
  const plan = planText ?? (isPremium ? (days !== undefined ? `Premium · ${days} day${days === 1 ? "" : "s"} left` : "Premium") : "Free plan");
  const board = examProfile.data
    ? boardLabel({ code: examProfile.data.institution.code, examName: examProfile.data.trackName ?? "" })
    : "Your board";

  return (
    <div
      className="relative min-h-screen bg-[var(--sb-bg)]"
      style={{ "--sb-sidebar-width": "232px", "--sb-topbar-height": "0px" } as React.CSSProperties}
    >
      {/* Laptop sidebar (16e) */}
      <aside className={cn("sb-ui", s.side)} aria-label="StudyBond">
        <div className={s.logoRow}>
          <Link href={"/dashboard" as Route} aria-label="StudyBond home"><LogoLockup size="sm" /></Link>
          <NotificationBell />
        </div>
        <button type="button" className={s.board} onClick={() => setBoardsOpen(true)}>
          <span>{board}</span>
          <ChevronDown aria-hidden="true" />
        </button>
        <nav className={s.grp} aria-label="Study">
          <small>Study</small>
          {studyNav.map((item) => (
            <SideLink key={item.href} item={item} active={isActive(pathname, item)} />
          ))}
        </nav>
        <nav className={s.grp} aria-label="Compete">
          <small>Compete</small>
          {competeNav.map((item) => (
            <SideLink key={item.href} item={item} active={isActive(pathname, item)} count={item.href === "/dashboard/duel" ? waiting : 0} />
          ))}
        </nav>
        <Link href={"/dashboard/settings" as Route} className={s.me} aria-label="Your profile and settings">
          <span className={cn(s.ring, !isPremium && s.ringFree)}>
            <Avatar look={avatar.data?.avatar ?? null} size={34} />
          </span>
          <span className={s.meText}>
            <b>{shortName(profile?.fullName) || " "}</b>
            <span className={cn(s.pl, !isPremium && s.plFree)}>{plan}</span>
          </span>
          <Settings className={s.gear} aria-hidden="true" />
        </Link>
      </aside>

      {/* Phone top strip: the page's own bar, or the logo */}
      <div className={s.strip}>
        {mobileTopBar ? (
          <div className="flex h-14 items-center px-3.5">{mobileTopBar}</div>
        ) : (
          <div className="flex h-12 items-center justify-between px-4">
            <LogoLockup size="xs" />
            <NotificationBell mobile />
          </div>
        )}
      </div>

      {/* Phone tab bar (16a) */}
      <nav className={cn("sb-ui", s.tabs)} aria-label="Main">
        {bottomTabs.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item);
          return (
            <Link key={item.href} href={item.href as Route} className={cn(s.tab, active && s.tabOn)} aria-current={active ? "page" : undefined}>
              <Icon strokeWidth={1.9} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="min-w-0 w-full md:pl-[232px]">
        <div className={cn("mx-auto max-w-5xl px-4 pb-24 sm:px-5 md:px-8 md:pb-10 md:pt-7", mobileTopBar ? "pt-[60px]" : "pt-14")}>
          <PageTransition key={pathname}>{children}</PageTransition>
        </div>
      </main>

      {waChannel.shouldShowPrompt && (
        <WhatsAppChannelPrompt onJoined={waChannel.markJoined} onDismiss={waChannel.markDismissed} />
      )}
      {waChannel.shouldShowPill && <WhatsAppChannelMobilePill onClick={waChannel.resetDismissed} />}

      {boardsOpen ? (
        <BoardSheet currentCode={examProfile.data?.institution.code ?? null} onClose={() => setBoardsOpen(false)} />
      ) : null}
    </div>
  );
}

function SideLink({ item, active, count = 0 }: { item: NavItem; active: boolean; count?: number }) {
  const Icon = item.icon;
  return (
    <Link href={item.href as Route} className={cn(s.nav, active && s.navOn)} aria-current={active ? "page" : undefined}>
      <Icon strokeWidth={1.9} aria-hidden="true" />
      {item.label}
      {count > 0 ? <span className={s.ct}>{count}</span> : null}
    </Link>
  );
}
