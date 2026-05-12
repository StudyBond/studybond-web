"use client";

import { cn } from "@/lib/utils/cn";
import {
  Crown,
  Check,
  X as XIcon,
  Zap,
  BookOpen,
  Target,
  Users,
  Sparkles,
  ChevronRight,
  Shield,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import type { SubscriptionStatus } from "@/lib/api/types";

import { useInitiateSubscription } from "../hooks/use-subscription";

type SubscriptionTabProps = {
  isPremium: boolean;
  subscriptionData?: SubscriptionStatus;
};

const PREMIUM_PERKS = [
  { icon: BookOpen, label: "Unlimited Practice Exams", free: false, premium: true },
  { icon: Target, label: "Subject-specific Real Exams", free: false, premium: true },
  { icon: Zap, label: "Mixed Mode Exams", free: false, premium: true },
  { icon: Users, label: "1v1 Competitive Duels", free: false, premium: true },
  { icon: Sparkles, label: "AI-Powered Explanations", free: "0/day", premium: "5/day" },
  { icon: Shield, label: "Bookmarks Slots", free: "20 max", premium: "50 max" },
];

export function SubscriptionTab({ isPremium, subscriptionData }: SubscriptionTabProps) {
  const sub = subscriptionData?.currentSubscription;
  const initiateMutation = useInitiateSubscription();

  const handleUpgrade = () => {
    // TEMPORARY: Redirect to WhatsApp until Paystack is activated
    window.location.href = "https://wa.link/cmo8uj";
    
    /* Original Paystack logic (disabled for now)
    initiateMutation.mutate(
      { autoRenew: false },
      {
        onSuccess: (data) => {
          window.location.href = data.checkoutUrl;
        },
      }
    );
    */
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Card */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border p-6",
          isPremium
            ? "border-[var(--sb-gold)]/20 bg-gradient-to-br from-[var(--sb-gold)]/[0.04] to-transparent"
            : "border-white/[0.04] bg-white/[0.015]",
        )}
      >
        {/* Premium ambient glow */}
        {isPremium && (
          <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-[var(--sb-gold)]/[0.06] blur-3xl" />
        )}

        <div className="relative flex flex-col sm:flex-row items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl",
              isPremium
                ? "bg-gradient-to-br from-[var(--sb-gold)] to-[#8b4f1a] shadow-[0_0_20px_var(--sb-gold-glow)] text-white"
                : "bg-white/[0.04] text-white/30",
            )}
          >
            <Crown className="h-6 w-6" />
          </div>
          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white">
                {isPremium ? "Elite Plan" : "Explorer Plan"}
              </h3>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                  isPremium
                    ? "bg-[var(--sb-gold)]/15 text-[var(--sb-gold)]"
                    : "bg-white/[0.06] text-white/30",
                )}
              >
                {isPremium ? "Active" : "Free"}
              </span>
            </div>

            {isPremium && sub ? (
              <div className="mt-2 space-y-1">
                <p className="text-xs text-white/40">
                  {sub.daysRemaining > 0
                    ? `${sub.daysRemaining} day${sub.daysRemaining === 1 ? "" : "s"} remaining`
                    : "Expired"}
                </p>
                {/* Expiry bar */}
                <div className="h-1.5 w-full max-w-[200px] rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      sub.daysRemaining > 10
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : sub.daysRemaining > 3
                          ? "bg-gradient-to-r from-amber-400 to-orange-400"
                          : "bg-gradient-to-r from-red-400 to-red-500",
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(2, (sub.daysRemaining / 30) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-white/30 mt-1">Upgrade to unlock the full StudyBond experience</p>
            )}
          </div>
        </div>
      </div>

      {/* Perks Comparison */}
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-white/30 ml-1">
          Feature Comparison
        </h4>
        <div className="space-y-2">
          {PREMIUM_PERKS.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.label}
                className="flex items-center gap-2 sm:gap-3 rounded-xl border border-white/[0.03] bg-white/[0.01] px-2 sm:px-4 py-2.5 sm:py-3 transition-colors hover:bg-white/[0.02]"
              >
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/30">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </div>
                <span className="flex-1 text-[11px] sm:text-sm text-white/60 leading-tight">{perk.label}</span>
                {/* Free column */}
                <div className="w-12 sm:w-16 flex justify-center shrink-0">
                  {typeof perk.free === "string" ? (
                    <span className="text-[9px] sm:text-[10px] font-semibold text-white/25 text-center leading-none">{perk.free}</span>
                  ) : perk.free ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-400/50" />
                  ) : (
                    <XIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/10" />
                  )}
                </div>
                {/* Premium column */}
                <div className="w-12 sm:w-16 flex justify-center shrink-0">
                  {typeof perk.premium === "string" ? (
                    <span className="text-[9px] sm:text-[10px] font-bold text-[var(--sb-gold)] text-center leading-none">{perk.premium}</span>
                  ) : perk.premium ? (
                    <Check className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--sb-gold)]" />
                  ) : (
                    <XIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white/10" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Column headers */}
        <div className="flex justify-end gap-2 sm:gap-3 pr-2 sm:pr-4 -mt-1">
          <span className="w-12 sm:w-16 text-center text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-white/15">Free</span>
          <span className="w-12 sm:w-16 text-center text-[7px] sm:text-[8px] font-bold uppercase tracking-wider text-[var(--sb-gold)]/40">Elite</span>
        </div>
      </div>

      {/* Upgrade CTA */}
      {!isPremium && (
        <div className="pt-2">
          <button
            onClick={handleUpgrade}
            disabled={initiateMutation.isPending}
            className={cn(
              "group relative flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white overflow-hidden transition-all duration-300",
              "bg-gradient-to-r from-[var(--sb-gold)] via-[var(--sb-accent)] to-[#8b4f1a]",
              "shadow-[0_4px_24px_var(--sb-gold-glow)] hover:shadow-[0_6px_32px_var(--sb-gold-glow)] hover:scale-[1.01] disabled:opacity-70 disabled:pointer-events-none",
            )}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {initiateMutation.isPending ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            ) : (
              <Crown className="h-4 w-4 relative z-10" />
            )}
            <span className="relative z-10">
              {initiateMutation.isPending ? "Preparing Checkout..." : "Upgrade to Elite"}
            </span>
            {!initiateMutation.isPending && (
              <ChevronRight className="h-4 w-4 relative z-10 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

