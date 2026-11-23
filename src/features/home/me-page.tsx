"use client";

import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { Avatar } from "@/features/avatar/components/avatar";
import { useMyAvatar } from "@/features/avatar/hooks/use-my-avatar";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutations";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { notificationsUiEnabled } from "@/features/notifications/notifications.config";
import { getUserProfile } from "@/lib/api/users";
import { cn } from "@/lib/utils/cn";

import { getDashboardHome, homeKeys } from "./api";
import { boardLabel, nextFreezeDay } from "./format";
import { BookmarkIcon, CardIcon, ChevronRight } from "./icons";
import s from "./me.module.css";

const Icon = ({ d }: { d: ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const PersonIcon = () => <Icon d={<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>} />;
const ShieldIcon = () => <Icon d={<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />} />;
const SlidersIcon = () => <Icon d={<><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>} />;
const ChatIcon = () => <Icon d={<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />} />;
const BellIcon = () => <Icon d={<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>} />;
const KeyIcon = () => <Icon d={<><circle cx="7.5" cy="15.5" r="4.5" /><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14.5 8.5l2 2" /></>} />;

function Row({ href, icon, title, sub, pill }: { href: string; icon: ReactNode; title: string; sub: string; pill?: ReactNode }) {
  return (
    <Link href={href as Route} className={s.row}>
      <span className={s.ic}>{icon}</span>
      <span className={s.t}><b>{title}</b><small>{sub}</small></span>
      {pill ?? <span />}
      <ChevronRight className={s.chev} />
    </Link>
  );
}

/**
 * Me (canvas 16i): the phone tab that replaces Settings, and where the
 * laptop name box goes. Each row opens one settings page (back to Me) or
 * the vault. "Invite friends" waits for the referral feature.
 */
export function MePage() {
  const router = useRouter();
  const profile = useQuery({ queryKey: ["dashboard", "profile"], queryFn: getUserProfile, retry: 1 });
  const home = useQuery({ queryKey: homeKeys.home, queryFn: getDashboardHome, staleTime: 30_000, retry: 1 });
  const avatar = useMyAvatar();
  const logout = useLogoutMutation();
  const p = profile.data;
  const d = home.data;
  const plan = d?.plan;
  const premium = plan?.isPremium ?? p?.isPremium ?? false;
  const isAdmin = p?.role === "ADMIN" || p?.role === "SUPERADMIN";

  const aim = p?.aspiringCourse
    ? `Wants ${p.aspiringCourse}${d ? ` · ${boardLabel(d.board)}` : ""}`
    : p?.department
      ? `${p.department.charAt(0)}${p.department.slice(1).toLowerCase()}${d ? ` · ${boardLabel(d.board)}` : ""}`
      : d ? boardLabel(d.board) : "";

  const planSub = !plan
    ? "Your plan on this board"
    : plan.isPremium
      ? `Premium on ${boardLabel(d!.board)} · ${plan.daysLeft ?? 0} day${plan.daysLeft === 1 ? "" : "s"} left`
      : plan.freeSubjectsLeft
        ? `Free · ${plan.freeSubjectsLeft} of ${plan.freeSubjectsTotal} free subjects left`
        : "Free plan";

  const streak = d?.streak;
  const freezeText = !streak
    ? "Streak freezes"
    : streak.freezes > 0
      ? "Freeze ready"
      : streak.count < 7
        ? "Freezes · first at day 7"
        : `Freezes · next at day ${nextFreezeDay(streak.count)}`;

  async function signOut() {
    await logout.mutateAsync();
    router.push("/login");
  }

  return (
    <LearnerShell
      isPremium={premium}
      profile={p}
      mobileTopBar={<div className={cn("sb-ui", s.bar)}><h1>Me</h1></div>}
    >
      <div className={cn("sb-ui", s.wrap)}>
        <h1 className={s.title}>Me</h1>

        <section className={s.who} aria-label="You">
          <span className={cn(s.ring, !premium && s.ringFree)}>
            <Avatar look={avatar.data?.avatar ?? null} size={68} />
          </span>
          <div>
            <span className={s.nm}>{p?.fullName ?? " "}</span>
            {aim ? <span className={s.aim}>{aim}</span> : null}
            <div className={s.acts}>
              <Link href={"/dashboard/settings?tab=profile" as Route} className={s.chip}>Edit profile</Link>
              <Link href={"/dashboard/settings/avatar" as Route} className={s.chip}>Change avatar</Link>
            </div>
          </div>
        </section>

        <Link href={"/dashboard/streak" as Route} className={s.facts} aria-label="Your streak">
          <span className={s.fact}><b>{streak?.count ?? 0} <small>days</small></b><span>Streak now</span></span>
          <span className={s.fact}><b>{streak?.longest ?? 0} <small>days</small></b><span>Longest run</span></span>
          <span className={s.fact}><b>{streak?.freezes ?? 0}</b><span>{freezeText}</span></span>
        </Link>

        <h2 className={s.gh}>Account</h2>
        <section className={s.list}>
          <Row href="/dashboard/settings?tab=profile" icon={<PersonIcon />} title="Profile" sub="Name, course, department, target score" />
          <Row
            href="/dashboard/settings?tab=subscription"
            icon={<CardIcon />}
            title="Plan"
            sub={planSub}
            pill={premium
              ? <span className={cn(s.pill, plan?.endingSoon ? s.pillWarn : s.pillOn)}>Premium</span>
              : <span className={cn(s.pill, s.pillGo)}>Go premium</span>}
          />
          <Row href="/dashboard/settings?tab=security" icon={<ShieldIcon />} title="Security" sub="Password and the devices you're signed in on" />
        </section>

        <h2 className={s.gh}>Study</h2>
        <section className={s.list}>
          <Row
            href="/dashboard/bookmarks"
            icon={<BookmarkIcon />}
            title="Study vault"
            sub={d && d.vault.saved > 0 ? `${d.vault.saved} saved question${d.vault.saved === 1 ? "" : "s"}` : "Questions you save to practise later"}
          />
          <Row href="/dashboard/settings?tab=exam" icon={<SlidersIcon />} title="Exam settings" sub="Paper colour, auto-advance, text size, grades" />
          {notificationsUiEnabled ? (
            <Row href="/dashboard/settings?tab=notifications" icon={<BellIcon />} title="Notifications" sub="What StudyBond tells you about" />
          ) : null}
        </section>

        <h2 className={s.gh}>Friends</h2>
        <section className={s.list}>
          <Row
            href="/dashboard/settings?tab=community"
            icon={<ChatIcon />}
            title="Community"
            sub={premium ? "WhatsApp channel and the premium group" : "WhatsApp channel · the group is for premium"}
          />
        </section>

        {isAdmin ? (
          <>
            <h2 className={s.gh}>Admin</h2>
            <section className={s.list}>
              <Row href="/dashboard/settings?tab=admin" icon={<KeyIcon />} title="Admin controls" sub="Study mode for this board. Only admins see this." />
            </section>
          </>
        ) : null}

        <button type="button" className={s.out} onClick={signOut} disabled={logout.isPending}>Sign out</button>
        <Link href={"/dashboard/settings?tab=danger" as Route} className={s.del}>Delete account</Link>
      </div>
    </LearnerShell>
  );
}
