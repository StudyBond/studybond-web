"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo, LogoLockup } from "@/components/ui/logo";
import { PageTransition } from "@/components/ui/page-transition";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutations";
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
  Zap,
  ChevronRight,
  Bell,
  Swords,
  PanelLeftClose,
  PanelLeftOpen,
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
      { label: "History", href: "/dashboard/history", icon: BarChart3 },
      { label: "Study Vault", href: "/dashboard/bookmarks", icon: Bookmark },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Collaboration", href: "/dashboard/collaboration", icon: Swords },
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

/** Bottom tab items — the most important for mobile */
const bottomTabs: NavItemConfig[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Practice", href: "/dashboard/practice", icon: BookOpen },
  { label: "Vault", href: "/dashboard/bookmarks", icon: Bookmark },
  { label: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

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
};

export function LearnerShell({
  children,
  isPremium = false,
  subscriptionData,
  profile,
}: Readonly<LearnerShellProps>) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogoutMutation();
  
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
  const initials = profile?.fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "ST";

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
              <div className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-white/[0.03]">
                <UserAvatar avatarId={avatarId} size="sm" isPremium={isPremium} showRing />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-white/70 truncate">{firstName}</p>
                  <p className="text-[10px] text-white/20 truncate">
                    {isPremium ? "Elite Member" : "Explorer"}
                  </p>
                </div>
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
          {isPremium ? (
            <Badge tone="accent" className="text-[8px] bg-[var(--sb-gold)]/10 text-[var(--sb-gold)] ring-1 ring-[var(--sb-gold)]/20 shadow-[0_0_10px_var(--sb-gold-glow)]">
              <Crown className="h-2.5 w-2.5 mr-1" />
              Elite User
            </Badge>
          ) : (
            <Link
              href={"https://wa.link/k6fl61" as any}
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

        <div className="relative flex h-12 items-center justify-between px-4">
          {/* Left: Logo + tier */}
          <div className="flex items-center">
            <LogoLockup size="xs" />
          </div>

          {/* Right: Notification Bell */}
          <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] border border-white/[0.05] transition-colors hover:bg-white/[0.08]">
            <Bell className="h-3.5 w-3.5 text-white/70" />
          </button>
        </div>
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
            const active = isRouteActive(pathname, item.href);

            const content = (
              <div
                className={cn(
                  "relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-300",
                  active
                    ? "text-white"
                    : "text-white/20",
                  item.coming && "opacity-15 pointer-events-none",
                )}
              >
                {/* Active background pill */}
                {active ? (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-[var(--sb-accent)]/15 to-transparent" />
                ) : null}

                <Icon className={cn(
                  "h-[20px] w-[20px] relative z-10 transition-all duration-300",
                  active && "text-[var(--sb-accent)] drop-shadow-[0_0_6px_var(--sb-accent-glow)]",
                )} />
                <span className={cn(
                  "text-[9px] font-semibold relative z-10 transition-all duration-300",
                  active && "text-[var(--sb-accent-text)]",
                )}>
                  {item.label}
                </span>

                {/* Active dot indicator */}
                {active ? (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-[var(--sb-accent)] shadow-[0_0_8px_var(--sb-accent-glow)]" />
                ) : null}
              </div>
            );

            if (item.coming) {
              return <div key={item.label}>{content}</div>;
            }

            return (
              <Link key={item.label} href={item.href as Route}>
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
        <div className="mx-auto max-w-5xl px-4 sm:px-5 pt-14 pb-24 md:pt-[calc(var(--sb-topbar-height)+1.5rem)] md:pb-8">
          <PageTransition key={pathname}>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}
