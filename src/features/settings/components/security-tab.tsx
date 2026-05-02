"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useSecurityOverview, useChangePassword } from "@/features/settings/hooks/use-settings";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutations";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Globe,
  Check,
  Loader2,
  AlertCircle,
  Fingerprint,
  LogOut,
} from "lucide-react";

export function SecurityTab({ isPremium = false }: { isPremium?: boolean }) {
  const { data: security, isLoading, isError } = useSecurityOverview();
  const changePassword = useChangePassword();
  const logout = useLogoutMutation();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Password strength calculation
  const strength = calculateStrength(newPassword);

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) return;
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      // handled via mutation error state
    }
  }

  async function handleLogout() {
    await logout.mutateAsync();
    router.push("/login");
  }

  return (
    <div className="space-y-8">
      {/* ── Password Change Section ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Change Password</h3>
            <p className="text-[10px] text-white/30">Other active sessions will be signed out</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Current Password */}
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-[var(--sb-accent)]/40 focus:ring-1 focus:ring-[var(--sb-accent)]/20 focus:bg-white/[0.03]"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 8 characters)"
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 outline-none transition-all focus:border-[var(--sb-accent)]/40 focus:ring-1 focus:ring-[var(--sb-accent)]/20 focus:bg-white/[0.03]"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength Meter */}
          {newPassword.length > 0 && (
            <div className="space-y-2 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-all duration-500",
                      i < strength.level
                        ? strength.level <= 1 ? "bg-red-400" : strength.level <= 2 ? "bg-amber-400" : strength.level <= 3 ? "bg-emerald-400" : "bg-emerald-400"
                        : "bg-white/[0.06]",
                    )}
                  />
                ))}
              </div>
              <p className={cn(
                "text-[10px] font-semibold",
                strength.level <= 1 ? "text-red-400/80" : strength.level <= 2 ? "text-amber-400/80" : "text-emerald-400/80",
              )}>
                {strength.label}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleChangePassword}
            disabled={!currentPassword || newPassword.length < 8 || changePassword.isPending}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300",
              passwordSuccess
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-400/20"
                : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed",
            )}
          >
            {changePassword.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : passwordSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Password Updated!
              </>
            ) : (
              "Update Password"
            )}
          </button>

          {changePassword.isError && (
            <div className="flex items-center gap-2 text-xs text-red-400/80 bg-red-400/[0.05] rounded-lg p-2.5">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              {changePassword.error instanceof Error ? changePassword.error.message : "Password change failed."}
            </div>
          )}
        </div>
      </div>

      {/* ── Active Sessions (Premium only) ── */}
      {isPremium && (
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <Fingerprint className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Active Sessions</h3>
              <p className="text-[10px] text-white/30">Devices currently signed into your account</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-white/20" />
            </div>
          ) : isError ? (
            <div className="rounded-xl border border-red-400/10 bg-red-400/[0.03] p-4 text-center text-xs text-red-400/70">
              Failed to load sessions.
            </div>
          ) : (
            <div className="space-y-2">
              {security?.activeSessions.map((session) => {
                const DeviceIcon = getDeviceIcon(session.userAgent);
                return (
                  <div
                    key={session.sessionId}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl border p-4 transition-all duration-300",
                      session.isCurrent
                        ? "border-emerald-400/15 bg-emerald-400/[0.03]"
                        : "border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.025]",
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                      session.isCurrent ? "bg-emerald-400/10 text-emerald-400" : "bg-white/[0.04] text-white/30",
                    )}>
                      <DeviceIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white/80 truncate">
                          {session.deviceName || parseUserAgent(session.userAgent)}
                        </p>
                        {session.isCurrent && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-400/10 text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            This Device
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/25 mt-0.5">
                        {session.lastLoginAt ? `Last active ${formatTimeAgo(session.lastLoginAt)}` : "Active now"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Logout Section ── */}
      <div className="space-y-4 pt-6 border-t border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/10 text-red-400">
            <LogOut className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-400/80">Sign Out</h3>
            <p className="text-[10px] text-white/30">End your session on this device</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300",
            "border border-red-400/20 bg-red-400/[0.05] text-red-400/80 hover:bg-red-400/[0.10] hover:text-red-400 hover:border-red-400/30 disabled:opacity-40 disabled:cursor-not-allowed",
          )}
        >
          {logout.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              Sign Out
            </>
          )}
        </button>
      </div>
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

function getDeviceIcon(ua: string | null) {
  if (!ua) return Globe;
  const lower = ua.toLowerCase();
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) return Smartphone;
  return Monitor;
}

function parseUserAgent(ua: string | null): string {
  if (!ua) return "Unknown Device";
  if (ua.includes("Chrome")) return "Chrome Browser";
  if (ua.includes("Safari")) return "Safari Browser";
  if (ua.includes("Firefox")) return "Firefox Browser";
  if (ua.includes("Edge")) return "Edge Browser";
  return "Web Browser";
}

function formatTimeAgo(dateInput: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateInput).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
