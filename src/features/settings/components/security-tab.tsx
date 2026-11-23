"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Globe, Monitor, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutations";
import { useChangePassword, useSecurityOverview } from "@/features/settings/hooks/use-settings";
import type { ActiveSession } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import { errorText, Loading, PasswordInput } from "./settings-ui";
import s from "./settings.module.css";

const STRENGTH_COLOURS = ["", "#f87171", "#d4a121", "#4ade80", "#4ade80"];

/** Security: change password, the devices signed in, sign out. */
export function SecurityTab() {
  const qc = useQueryClient();
  const security = useSecurityOverview();
  const changePassword = useChangePassword();
  const logout = useLogoutMutation();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changed, setChanged] = useState(false);
  const strength = calculateStrength(newPassword);

  async function handleChangePassword() {
    if (!currentPassword || newPassword.length < 8) return;
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setChanged(true);
      setCurrentPassword("");
      setNewPassword("");
      window.setTimeout(() => setChanged(false), 4000);
      void qc.invalidateQueries({ queryKey: ["security-overview"] });
    } catch {
      /* Shown under the button from the mutation state. */
    }
  }

  async function handleLogout() {
    await logout.mutateAsync();
    router.push("/login");
  }

  const sessions = security.data?.activeSessions ?? [];

  return (
    <>
      <h2 className={cn(s.gh, s.ghFirst)}>Change password</h2>
      <div className={s.list}>
        <div className={s.item}>
          <label className={s.label} htmlFor="password-current">Current password</label>
          <PasswordInput
            id="password-current"
            value={currentPassword}
            onChange={(value) => { setCurrentPassword(value); setChanged(false); }}
            autoComplete="current-password"
            disabled={changePassword.isPending}
          />
        </div>
        <div className={s.item}>
          <label className={s.label} htmlFor="password-new">New password</label>
          <PasswordInput
            id="password-new"
            value={newPassword}
            onChange={(value) => { setNewPassword(value); setChanged(false); }}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            disabled={changePassword.isPending}
          />
          {newPassword ? (
            <>
              <div className={s.meter} aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <i key={i} style={i < strength.level ? { background: STRENGTH_COLOURS[strength.level] } : undefined} />
                ))}
              </div>
              <span className={s.meterLabel} style={{ color: STRENGTH_COLOURS[strength.level] || "var(--ui-ink-3)" }}>
                {newPassword.length < 8 ? `${8 - newPassword.length} more character${8 - newPassword.length === 1 ? "" : "s"}` : strength.label}
              </span>
            </>
          ) : null}
        </div>
      </div>
      <div className={s.actions}>
        <button
          type="button"
          className={s.btn}
          onClick={handleChangePassword}
          disabled={!currentPassword || newPassword.length < 8 || changePassword.isPending}
        >
          {changePassword.isPending ? "Changing…" : "Change password"}
        </button>
        {changed ? (
          <p className={s.note} role="status" style={{ color: "#86efac" }}>Password changed. Your other devices have been signed out.</p>
        ) : changePassword.isError ? (
          <p className={s.err} role="alert">{errorText(changePassword.error, "Couldn't change your password. Try again.")}</p>
        ) : (
          <p className={s.note}>Changing it signs you out on your other devices.</p>
        )}
      </div>

      <h2 className={s.gh}>Signed in on</h2>
      {security.isLoading ? (
        <Loading />
      ) : security.isError ? (
        <Loading text="We couldn't load your devices. Check your internet and try again." />
      ) : (
        <div className={s.list}>
          {sessions.map((session) => (
            <DeviceRow key={session.sessionId} session={session} />
          ))}
        </div>
      )}

      <button type="button" className={s.out} onClick={handleLogout} disabled={logout.isPending}>
        {logout.isPending ? "Signing out…" : "Sign out"}
      </button>
    </>
  );
}

function DeviceRow({ session }: { session: ActiveSession }) {
  return (
    <div className={s.dev}>
      <span className={s.ic}><DeviceIcon ua={session.userAgent} /></span>
      <span className={s.itemT}>
        <b>{session.deviceName || browserName(session.userAgent)}</b>
        <small>
          {session.isCurrent
            ? "You're using this one"
            : session.lastLoginAt
              ? `Last signed in ${timeAgo(session.lastLoginAt)}`
              : `Signed in ${timeAgo(session.createdAt)}`}
        </small>
      </span>
      {session.isCurrent ? <span className={cn(s.pill, s.pillOk)}>This device</span> : <span />}
    </div>
  );
}

/* ─── Helpers ─── */

function calculateStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const level = Math.min(4, Math.max(0, score));
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  return { level, label: labels[level] || "" };
}

function DeviceIcon({ ua }: { ua: string | null }) {
  if (!ua) return <Globe aria-hidden="true" />;
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) return <Smartphone aria-hidden="true" />;
  return <Monitor aria-hidden="true" />;
}

function browserName(ua: string | null): string {
  if (!ua) return "A browser";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  return "A browser";
}

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
