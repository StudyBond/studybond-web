"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { ShieldBan, Clock, Unlock, Lock, ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

type ReviewLockedPageProps = {
  examId: number;
  isPermanent: boolean;
  canRequestLastChance: boolean;
  cooldownMinutes: number;
  onRequestLastChance: () => void;
};

export function ReviewLockedPage({
  examId,
  isPermanent,
  canRequestLastChance,
  cooldownMinutes,
  onRequestLastChance,
}: ReviewLockedPageProps) {
  // Live countdown for the cooldown timer
  const [minutesLeft, setMinutesLeft] = useState(cooldownMinutes);

  useEffect(() => {
    if (isPermanent || canRequestLastChance || minutesLeft <= 0) return;

    const interval = setInterval(() => {
      setMinutesLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Force a re-render to show the button
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [isPermanent, canRequestLastChance, minutesLeft]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icon */}
        <div className="relative mx-auto w-fit">
          <div
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-3xl mx-auto",
              isPermanent
                ? "bg-red-500/10 text-red-400"
                : "bg-amber-500/10 text-amber-400",
            )}
          >
            {isPermanent ? (
              <Lock className="h-12 w-12" />
            ) : (
              <ShieldBan className="h-12 w-12" />
            )}
          </div>
          {/* Pulse */}
          <div
            className={cn(
              "absolute inset-0 rounded-3xl animate-ping opacity-10",
              isPermanent ? "bg-red-400" : "bg-amber-400",
            )}
            style={{ animationDuration: "3s" }}
          />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-white tracking-tight">
            {isPermanent ? "Review Access Revoked" : "Review Temporarily Locked"}
          </h2>

          <p className="text-sm text-white/40 leading-relaxed max-w-sm mx-auto">
            {isPermanent
              ? "We detected repeated suspicious activities on this exam review that violate StudyBond's content protection policy. Access to review this exam's questions and explanations has been permanently revoked."
              : "We detected suspicious activities while you were reviewing this exam. To protect our content, access to this review has been temporarily restricted."}
          </p>
        </div>

        {/* Violation badge */}
        <div className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-400/[0.05] border border-red-400/10 mx-auto w-fit">
          <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <span className="text-[11px] font-bold text-red-400/70">
            {isPermanent
              ? "Content protection violation — access permanently revoked"
              : "Screenshots & screen capture are forbidden on StudyBond"}
          </span>
        </div>

        {/* Last Chance Section */}
        {!isPermanent && (
          <div className="space-y-4 pt-2">
            {canRequestLastChance ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.03] p-5 space-y-3">
                  <div className="flex items-center justify-center gap-2 text-amber-400">
                    <Unlock className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Unlock Available
                    </span>
                  </div>
                  <p className="text-[11px] text-white/30 leading-relaxed">
                    You can request to unlock your exam review. If suspicious
                    activity is detected again, access will be restricted with
                    escalating penalties.
                  </p>
                </div>

                <button
                  onClick={onRequestLastChance}
                  className={cn(
                    "flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                    "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400",
                    "border border-amber-400/20 hover:border-amber-400/40",
                    "hover:shadow-[0_4px_24px_rgba(245,158,11,0.1)]",
                  )}
                >
                  <Unlock className="h-4 w-4" />
                  Unlock Review
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
                <div className="flex items-center justify-center gap-2 text-white/40">
                  <Clock className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Cooldown Active
                  </span>
                </div>
                <p className="text-[11px] text-white/25 leading-relaxed">
                  You can request to unlock this exam in{" "}
                  <span className="text-white/50 font-bold">
                    {minutesLeft} minute{minutesLeft !== 1 ? "s" : ""}
                  </span>
                  . Until then, access remains restricted.
                </p>

                {/* Countdown visual */}
                <div className="h-1.5 w-full max-w-[200px] mx-auto rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-white/10 to-white/20 transition-all duration-1000"
                    style={{ width: `${Math.max(5, ((5 - minutesLeft) / 5) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="pt-2">
          <Link
            href={"/dashboard" as Route}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300",
              "text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06]",
              "border border-white/[0.06] hover:border-white/[0.12]",
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Policy footer */}
        <p className="text-[9px] text-white/15 max-w-xs mx-auto leading-relaxed">
          StudyBond's exam content is proprietary and protected under our Terms of Service.
          Unauthorized reproduction, screenshots, or distribution of exam questions and
          explanations is strictly prohibited.
        </p>
      </div>
    </div>
  );
}
