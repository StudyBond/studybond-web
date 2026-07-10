"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { Route } from "next";
import {
  Check,
  ExternalLink,
  Lock,
  Crown,
  ChevronRight,
  Sparkles,
  MessageCircle,
} from "lucide-react";

const WHATSAPP_CHANNEL_URL =
  "https://whatsapp.com/channel/0029Vb7slPoGpLHLS3JENm0g";
const PREMIUM_WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/HGHGmxBYOtzDwzOyrb6GVx?s=sh&p=a&ilr=1";
const LS_JOINED_KEY = "sb-whatsapp-channel-joined";

/* ─── WhatsApp Icon ─── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── Community Tab Props ─── */
type CommunityTabProps = {
  isPremium: boolean;
};

export function CommunityTab({ isPremium }: CommunityTabProps) {
  const [hasJoinedChannel, setHasJoinedChannel] = useState(false);
  const [showPremiumUpsell, setShowPremiumUpsell] = useState(false);

  useEffect(() => {
    setHasJoinedChannel(localStorage.getItem(LS_JOINED_KEY) === "true");
  }, []);

  function handleToggleChannelJoined() {
    const next = !hasJoinedChannel;
    if (next) {
      localStorage.setItem(LS_JOINED_KEY, "true");
    } else {
      localStorage.removeItem(LS_JOINED_KEY);
    }
    setHasJoinedChannel(next);
  }

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Community</h2>
        <p className="text-[13px] text-white/30">
          Stay connected with the StudyBond community
        </p>
      </div>

      {/* ─── Card 1: StudyBond Updates Channel (for everyone) ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--sb-whatsapp)]/15 bg-gradient-to-br from-[var(--sb-whatsapp)]/[0.04] to-transparent p-5 sm:p-6">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-[var(--sb-whatsapp)]/[0.06] blur-[50px]" />

        <div className="relative z-10">
          <div className="flex items-start gap-3 sm:gap-4 mb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sb-whatsapp)]/10 text-[var(--sb-whatsapp)] shadow-[0_0_16px_var(--sb-whatsapp-glow)]">
              <WhatsAppIcon className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white">
                  StudyBond Updates
                </h3>
                <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--sb-whatsapp)]/60 bg-[var(--sb-whatsapp)]/[0.08] px-1.5 py-0.5 rounded-md">
                  Channel
                </span>
                {hasJoinedChannel && (
                  <span className="flex items-center gap-1 text-[9px] font-semibold text-[var(--sb-whatsapp)]">
                    <Check className="h-3 w-3" />
                    Joined
                  </span>
                )}
              </div>
              <p className="text-[12px] text-white/40 leading-relaxed mt-1">
                Get exam tips, platform updates, study reminders, and be the
                first to know about new features.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Join button */}
            <a
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--sb-whatsapp)]/10 px-4 py-2.5 text-[12px] font-semibold text-[var(--sb-whatsapp)] transition-all duration-200 hover:bg-[var(--sb-whatsapp)]/15 hover:shadow-[0_0_12px_var(--sb-whatsapp-glow)]"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              {hasJoinedChannel ? "Open Channel" : "Join Channel"}
              <ExternalLink className="h-3 w-3 opacity-50" />
            </a>

            {/* Toggle: I've joined */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <button
                onClick={handleToggleChannelJoined}
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 cursor-pointer",
                  hasJoinedChannel
                    ? "bg-[var(--sb-whatsapp)] border-[var(--sb-whatsapp)] shadow-[0_0_8px_var(--sb-whatsapp-glow)]"
                    : "border-white/15 bg-white/[0.03] group-hover:border-white/25"
                )}
              >
                {hasJoinedChannel && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </button>
              <span
                className={cn(
                  "text-[11px] transition-colors select-none",
                  hasJoinedChannel
                    ? "text-[var(--sb-whatsapp)]/70 font-medium"
                    : "text-white/25 group-hover:text-white/40"
                )}
              >
                I&apos;ve already joined
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* ─── Card 2: Premium Inner Circle ─── */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.06]">
        {/* Content wrapper — overlay is scoped to this */}
        <div
          className={cn(
            "relative cursor-pointer",
            !isPremium && "select-none"
          )}
          onClick={!isPremium ? () => setShowPremiumUpsell((v) => !v) : undefined}
        >
          {/* Card content — visible but blurred for free users */}
          <div className="p-5 sm:p-6">
            {/* Ambient glow */}
            <div
              className={cn(
                "pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full blur-[50px]",
                isPremium
                  ? "bg-emerald-400/[0.06]"
                  : "bg-[var(--sb-gold)]/[0.04]"
              )}
            />

            <div className="relative z-10">
              <div className="flex items-start gap-3 sm:gap-4 mb-4">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg",
                    isPremium
                      ? "bg-emerald-400/10 text-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.1)]"
                      : "bg-[var(--sb-gold)]/10 text-[var(--sb-gold)] shadow-[0_0_16px_var(--sb-gold-glow)]"
                  )}
                >
                  {isPremium ? (
                    <MessageCircle className="h-5 w-5" />
                  ) : (
                    <Crown className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={cn(
                        "text-sm font-bold",
                        isPremium ? "text-white" : "text-white/60"
                      )}
                    >
                      Premium Inner Circle
                    </h3>
                    <span
                      className={cn(
                        "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md",
                        isPremium
                          ? "text-emerald-400/60 bg-emerald-400/[0.08]"
                          : "text-[var(--sb-gold)]/60 bg-[var(--sb-gold)]/[0.08]"
                      )}
                    >
                      {isPremium ? "Members Only" : "Elite Only"}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-[12px] leading-relaxed mt-1",
                      isPremium ? "text-white/40" : "text-white/30"
                    )}
                  >
                    Connect with top-performing students in our private WhatsApp
                    group. Brainstorm, share tips, and push each other forward.
                  </p>
                </div>
              </div>

              {/* Premium users: direct join */}
              {isPremium && (
                <a
                  href={PREMIUM_WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400/10 px-4 py-2.5 text-[12px] font-semibold text-emerald-400 transition-all duration-200 hover:bg-emerald-400/15 hover:shadow-[0_0_12px_rgba(52,211,153,0.1)]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Join Group
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              )}
            </div>
          </div>

          {/* ─── Frosted overlay for free users (scoped to content area only) ─── */}
          {!isPremium && !showPremiumUpsell && (
            <div className="absolute inset-0 z-20">
              {/* Frosted glass */}
              <div className="absolute inset-0 rounded-2xl bg-[var(--sb-bg)]/50 backdrop-blur-[6px]" />

              {/* Lock icon + label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sb-gold)]/10 text-[var(--sb-gold)] shadow-[0_0_16px_var(--sb-gold-glow)]">
                  <Lock className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--sb-gold)]/70">
                  Elite Members Only
                </span>
                <span className="text-[11px] text-white/30 mt-0.5">
                  Tap to learn more
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─── Inline upsell expansion for free users ─── */}
        {!isPremium && showPremiumUpsell && (
          <div className="relative border-t border-[var(--sb-gold)]/10 bg-gradient-to-br from-[var(--sb-gold)]/[0.03] to-transparent p-5 sm:p-6">
            {/* Shimmer */}
            <div className="absolute inset-0 overflow-hidden rounded-b-2xl">
              <div className="absolute inset-0 sb-shimmer-gold opacity-30" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[var(--sb-gold)]" />
                <h4 className="text-sm font-bold sb-gradient-text-gold">
                  Join the Inner Circle
                </h4>
              </div>

              <p className="text-[12px] text-white/40 leading-relaxed mb-4">
                Upgrade to{" "}
                <span className="text-[var(--sb-gold)] font-semibold">
                  Elite
                </span>{" "}
                and unlock access to our private Premium community — connect
                with top-performing students, share strategies, and get ahead
                together.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={"/dashboard/settings?tab=subscription" as Route}
                  className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--sb-gold)] via-[var(--sb-accent)] to-[#8b4f1a] px-5 py-3 text-[12px] font-bold text-white shadow-[0_4px_20px_var(--sb-gold-glow)] transition-all duration-200 hover:shadow-[0_6px_28px_var(--sb-gold-glow)] hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                >
                  {/* Button shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <Crown className="h-3.5 w-3.5 relative z-10" />
                  <span className="relative z-10">Unlock with Premium</span>
                  <ChevronRight className="h-3.5 w-3.5 relative z-10 group-hover:translate-x-0.5 transition-transform" />
                </Link>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPremiumUpsell(false);
                  }}
                  className="text-[11px] text-white/20 hover:text-white/40 transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-[11px] text-white/15 text-center leading-relaxed">
        More community channels coming soon — stay tuned!
      </p>
    </div>
  );
}
