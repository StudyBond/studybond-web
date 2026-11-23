"use client";

import { Badge } from "@/components/ui/badge";
import { Logo, LogoLockup } from "@/components/ui/logo";
import { PageTransition } from "@/components/ui/page-transition";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  WhatsAppChannelPrompt,
  useWhatsAppChannelState,
} from "@/components/ui/whatsapp-channel-prompt";
import {
  WhatsAppChannelSidebarPill,
  WhatsAppChannelMobilePill,
} from "@/components/ui/whatsapp-channel-pill";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutations";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { useNotificationsRealtime } from "@/features/notifications/hooks/use-notifications";
import { getSavedAvatarId } from "@/lib/avatars/avatar-collection";
import type { SubscriptionStatus, UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import {
  BarChart3,
  Bookmark,
  BookOpen,
  Home,
  LogOut,
  Trophy,
  Settings,
  Crown,
  AlertTriangle,
  ChevronRight,
  Swords,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
  ListOrdered,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import { useEffect, useState } from "react";

/* ─── Route Matching ─── */
function isRouteActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

/* ─── Nav Configuration ─── */

type NavGroup = {
  label: string;
  items: NavItemConfig[];
};

type NavItemConfig = {
  label: string;
  href: string;
  icon: typeof Home;
  coming?: boolean;
};

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home },
      { label: "Practice", href: "/dashboard/practice", icon: BookOpen },
      { label: "Study Mode", href: "/dashboard/study", icon: GraduationCap },
      { label: "History", href: "/dashboard/history", icon: BarChart3 },
      { label: "Study Vault", href: "/dashboard/bookmarks", icon: Bookmark },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Duel", href: "/dashboard/duel", icon: Swords },
      { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

/** The phone tab bar (dashboard canvas 16a): Home / Practice / Duel / Board / Me.
 *  Settings and the study vault are reached from Me. */
const bottomTabs: NavItemConfig[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Practice", href: "/dashboard/practice", icon: BookOpen },
  { label: "Duel", href: "/dashboard/duel", icon: Swords },
  { label: "Board", href: "/dashboard/leaderboard", icon: ListOrdered },
  { label: "Me", href: "/dashboard/me", icon: User },
];

/* Me also covers the pages it opens. */
function isTabActive(pathname: string, href: string) {
  if (href === "/dashboard/me") {
    return ["/dashboard/me", "/dashboard/settings", "/dashboard/streak"].some((h) => isRouteActive(pathname, h));
  }
  return isRouteActive(pathname, href);
}

/* ─── Nav Item Component ─── */

function NavItem({
  item,
  active,
  isCollapsed,
}: {
  item: NavItemConfig;
  active: boolean;
  isCollapsed: boolean;
}) {
  const Icon = item.icon;
  const className = cn(
    "group relative flex items-center gap-3 rounded-xl py-3 transition-all duration-200",
    isCollapsed ? "px-0 justify-center" : "px-3",
    active
      ? "bg-white/[0.06] text-white"
      : "text-white/30 hover:bg-white/[0.03] hover:text-white/55",
    item.coming && "opacity-20 pointer-events-none",
  );

  const content = (
    <>
      {/* Active bar — left edge indicator */}
      {active && !isCollapsed ? (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[var(--sb-accent)] shadow-[0_0_8px_var(--sb-accent-glow)]" />
      ) : null}

      <div className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
        active ? "bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]" : "text-inherit"
      )}>
        <Icon className="h-4 w-4" />
      </div>

      {!isCollapsed && (
        <span className="truncate flex-1">{item.label}</span>
      )}

      {!isCollapsed && item.coming ? (
        <span className="ml-auto rounded bg-white/[0.04] px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-white/15 font-bold">
          Soon
        </span>
      ) : null}

      {/* Tooltip for collapsed mode */}
      {isCollapsed && (
        <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
          {item.label}
        </div>
      )}
    </>
  );

  if (item.coming) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={item.href as Route} className={className}>
      {content}
    </Link>
  );
}

/* ─── Section Label ─── */

function SectionLabel({ label, isCollapsed }: { label: string; isCollapsed: boolean }) {
  if (isCollapsed) return <div className="h-4" />; // Spacer
  return (
    <p className="mb-2 mt-6 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/[0.12] first:mt-0">
      {label}
    </p>
  );
}

/* ─── Shell Props ─── */

type LearnerShellProps = {
  children: React.ReactNode;
  isPremium?: boolean;
  subscriptionData?: SubscriptionStatus;
  profile?: UserProfile;
  /** Replaces the phone top strip (logo and bell). Home passes its own:
   *  board switcher, streak count and avatar. */
  mobileTopBar?: React.ReactNode;
};

export function LearnerShell({
  children,
  isPremium = false,
  subscriptionData,
  profile,
  mobileTopBar,
}: Readonly<LearnerShellProps>) {
  useNotificationsRealtime();

  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogoutMutation();

  // WhatsApp channel state
  const waChannel = useWhatsAppChannelState();
  
  // Avatar state keyed per user
  const [avatarId, setAvatarId] = useState("freshman");

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("sb-sidebar-collapsed");
    if (saved === "true") setIsCollapsed(true);
  }, []);

  useEffect(() => {
    setAvatarId(getSavedAvatarId(profile?.id));
  }, [profile?.id]);

  function toggleSidebar() {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sb-sidebar-collapsed", String(newState));
  }

  const daysRemaining = subscriptionData?.currentSubscription?.daysRemaining;
  const showExpiryWarning = isPremium && daysRemaining !== undefined && daysRemaining <= 10;

  async function handleLogout() {
    await logout.mutateAsync();
    router.push("/login");
  }

  const firstName = profile?.fullName.split(" ")[0] ?? "Student";
  const sidebarWidth = isCollapsed ? "72px" : "260px";

  return (
    <div 
      className="relative flex min-h-screen bg-[var(--sb-bg)] transition-[--sb-sidebar-width] duration-300 ease-in-out"
      style={{ "--sb-sidebar-width": isMounted ? sidebarWidth : "260px" } as React.CSSProperties}
    >

      {/* ══════════════════════════════════════════════ */}
      {/* ═════ DESKTOP SIDEBAR ═══════════════════════ */}
      {/* ══════════════════════════════════════════════ */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:z-30 w-[var(--sb-sidebar-width)] bg-[var(--sb-bg)] transition-all duration-300 ease-in-out">
        {/* Subtle right edge — gradient line instead of harsh border */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />

        {/* Premium: animated gold edge */}
        {isPremium ? (
          <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[var(--sb-gold)]/20 to-transparent" />
        ) : null}

        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn("flex h-16 items-center", isCollapsed ? "justify-center" : "px-5")}>
            {isCollapsed ? (
              <Logo size="xs" />
            ) : (
              <LogoLockup size="sm" />
            )}
          </div>

          {/* Nav groups */}
          <nav className="flex-1 overflow-y-auto px-3 sb-scroll-hide">
            {navGroups.map((group) => (
              <div key={group.label}>
                <SectionLabel label={group.label} isCollapsed={isCollapsed} />
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavItem 
                      key={item.label} 
                      item={item} 
                      active={isRouteActive(pathname, item.href)} 
                      isCollapsed={isCollapsed} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Expiry warning */}
          {!isCollapsed && showExpiryWarning ? (
            <div className="mx-3 mb-3 rounded-xl border border-red-400/10 bg-red-400/[0.03] p-3">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400/80" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-400/80">Expiring</span>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed">
                Premium expires in {daysRemaining} day{daysRemaining === 1 ? "" : "s"}.
              </p>
            </div>
          ) : null}

          {/* WhatsApp channel pill */}
          {waChannel.shouldShowPill && (
            <WhatsAppChannelSidebarPill
              onClick={waChannel.resetDismissed}
              isCollapsed={isCollapsed}
            />
          )}

          {/* User identity + logout */}
          <div className="border-t border-white/[0.04] p-3">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3">
                <UserAvatar avatarId={avatarId} size="sm" isPremium={isPremium} showRing className="w-8 h-8" />
                <button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-white/15 transition-all hover:bg-red-400/8 hover:text-red-400/80 disabled:opacity-40"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl px-1 py-1">
                {/* Name box: opens settings (canvas 16e). */}
                <Link
                  href={"/dashboard/settings" as Route}
                  aria-label="Your profile and settings"
                  className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.04]"
                >
                  <UserAvatar avatarId={avatarId} size="sm" isPremium={isPremium} showRing />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white/70 truncate">{firstName}</p>
                    <p className={cn("text-[11px] truncate", isPremium ? "text-[#f5c890]" : "text-white/40")}>
                      {isPremium
                        ? daysRemaining !== undefined ? `Premium · ${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left` : "Premium"
                        : "Free plan"}
                    </p>
                  </div>
                  <Settings className="h-4 w-4 shrink-0 text-white/35 transition-colors group-hover:text-white/80" aria-hidden="true" />
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-white/15 transition-all hover:bg-red-400/8 hover:text-red-400/80 disabled:opacity-40 cursor-pointer shrink-0"
                  title="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════ */}
      {/* ═════ DESKTOP TOP BAR ═══════════════════════ */}
      {/* ══════════════════════════════════════════════ */}
      <div
        className="hidden md:flex fixed top-0 right-0 z-20 h-[var(--sb-topbar-height)] items-center justify-between bg-[var(--sb-bg)]/90 backdrop-blur-xl transition-[left] duration-300 ease-in-out"
        style={{ left: "var(--sb-sidebar-width)" }}
      >
        {/* Subtle bottom edge — gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />

        <div className="flex items-center gap-4 px-6">
          {/* Collapse Toggle */}
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/30 hover:bg-white/[0.05] hover:text-white/70 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
          <span className="text-[11px] font-medium text-white/20">
            {pathname === "/dashboard" ? "Overview" : pathname.split("/").pop()?.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
          </span>
        </div>

        <div className="flex items-center gap-3 px-6">
          <NotificationBell />
          {isPremium ? (
            <Badge tone="accent" className="text-[8px] bg-[var(--sb-gold)]/10 text-[var(--sb-gold)] ring-1 ring-[var(--sb-gold)]/20 shadow-[0_0_10px_var(--sb-gold-glow)]">
              <Crown className="h-2.5 w-2.5 mr-1" />
              Elite User
            </Badge>
          ) : (
            <Link
              href={"/dashboard/settings?tab=subscription" as Route}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[var(--sb-gold)]/[0.08] to-[var(--sb-accent)]/[0.05] px-2.5 py-1 text-[10px] font-semibold text-[var(--sb-accent-text)] transition-all hover:from-[var(--sb-gold)]/[0.14] hover:to-[var(--sb-accent)]/[0.10]"
            >
              <Crown className="h-2.5 w-2.5" />
              Upgrade
              <ChevronRight className="h-2.5 w-2.5" />
            </Link>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* ═════ MOBILE TOP BAR — minimal, Spotify-style */}
      {/* ══════════════════════════════════════════════ */}
      <div className="fixed inset-x-0 top-0 z-40 md:hidden">
        {/* Gradient fade background — not a solid bar */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--sb-bg)] via-[var(--sb-bg)]/95 to-transparent" />

        {mobileTopBar ? (
          <div className="relative flex h-14 items-center px-3.5">{mobileTopBar}</div>
        ) : (
          <div className="relative flex h-12 items-center justify-between px-4">
            {/* Left: Logo + tier */}
            <div className="flex items-center">
              <LogoLockup size="xs" />
            </div>

            {/* Right: Notification Bell (renders only while notificationsUiEnabled is on) */}
            <NotificationBell mobile />
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* ═════ MOBILE BOTTOM TAB BAR — Spotify-grade  */}
      {/* ══════════════════════════════════════════════ */}
      <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        {/* Background: deep blur with gradient edge */}
        <div className="absolute inset-0 bg-[var(--sb-bg)]/85 backdrop-blur-2xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="relative flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {bottomTabs.map((item) => {
            const Icon = item.icon;
            const active = isTabActive(pathname, item.href);

            const content = (
              <div
                className={cn(
                  "flex min-w-[56px] flex-col items-center gap-1 px-2 py-1 transition-colors duration-200",
                  active ? "text-[#f5c890]" : "text-[#848486]",
                  item.coming && "opacity-15 pointer-events-none",
                )}
              >
                <Icon className="h-[21px] w-[21px]" strokeWidth={1.9} aria-hidden="true" />
                <span className="text-[11px] font-bold">{item.label}</span>
              </div>
            );

            if (item.coming) {
              return <div key={item.label}>{content}</div>;
            }

            return (
              <Link key={item.label} href={item.href as Route} aria-current={isTabActive(pathname, item.href) ? "page" : undefined}>
                {content}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════ */}
      {/* ═════ MAIN CONTENT ══════════════════════════ */}
      {/* ══════════════════════════════════════════════ */}
      <main className="flex-1 min-w-0 w-full transition-[margin] duration-300 ease-in-out md:ml-[var(--sb-sidebar-width)]">
        <div className={cn("mx-auto max-w-5xl px-4 sm:px-5 pb-24 md:pt-[calc(var(--sb-topbar-height)+1.5rem)] md:pb-8", mobileTopBar ? "pt-[60px]" : "pt-14")}>
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </div>
      </main>

      {/* ══════════════════════════════════════════════ */}
      {/* ═════ WHATSAPP CHANNEL PROMPT ════════════════ */}
      {/* ══════════════════════════════════════════════ */}
      {waChannel.shouldShowPrompt && (
        <WhatsAppChannelPrompt
          onJoined={waChannel.markJoined}
          onDismiss={waChannel.markDismissed}
        />
      )}

      {/* Mobile floating pill */}
      {waChannel.shouldShowPill && (
        <WhatsAppChannelMobilePill onClick={waChannel.resetDismissed} />
      )}
    </div>
  );
}
