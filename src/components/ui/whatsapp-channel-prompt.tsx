"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils/cn";
import { X, Check, ExternalLink } from "lucide-react";

const WHATSAPP_CHANNEL_URL =
  "https://whatsapp.com/channel/0029Vb7slPoGpLHLS3JENm0g";

const LS_JOINED_KEY = "sb-whatsapp-channel-joined";
const SS_DISMISSED_KEY = "sb-whatsapp-channel-dismissed";

/* ─── WhatsApp Icon (inline SVG for brand accuracy) ─── */
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

/* ─── Hook: Channel join state ─── */
export function useWhatsAppChannelState() {
  const [hasJoined, setHasJoined] = useState(true); // default true to prevent flash
  const [isDismissed, setIsDismissed] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const joined = localStorage.getItem(LS_JOINED_KEY) === "true";
    const dismissed = sessionStorage.getItem(SS_DISMISSED_KEY) === "true";
    setHasJoined(joined);
    setIsDismissed(dismissed);
    setIsReady(true);
  }, []);

  const markJoined = useCallback(() => {
    localStorage.setItem(LS_JOINED_KEY, "true");
    setHasJoined(true);
  }, []);

  const markDismissed = useCallback(() => {
    sessionStorage.setItem(SS_DISMISSED_KEY, "true");
    setIsDismissed(true);
  }, []);

  const resetDismissed = useCallback(() => {
    sessionStorage.removeItem(SS_DISMISSED_KEY);
    setIsDismissed(false);
  }, []);

  return {
    hasJoined,
    isDismissed,
    isReady,
    markJoined,
    markDismissed,
    resetDismissed,
    /** Should show the full modal? */
    shouldShowPrompt: isReady && !hasJoined && !isDismissed,
    /** Should show the floating pill? */
    shouldShowPill: isReady && !hasJoined && isDismissed,
  };
}

/* ─── Slide-in Modal Component ─── */

type WhatsAppChannelPromptProps = {
  onJoined: () => void;
  onDismiss: () => void;
};

export function WhatsAppChannelPrompt({
  onJoined,
  onDismiss,
}: WhatsAppChannelPromptProps) {
  const [checked, setChecked] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  function handleClose() {
    setIsExiting(true);
    setTimeout(() => {
      if (checked) {
        onJoined();
      } else {
        onDismiss();
      }
    }, 250);
  }

  function handleJoinClick() {
    window.open(WHATSAPP_CHANNEL_URL, "_blank", "noopener,noreferrer");
  }

  function handleCheckboxToggle() {
    const next = !checked;
    setChecked(next);
    if (next) {
      // Auto-close after a brief delay when they confirm
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onJoined(), 250);
      }, 600);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center md:justify-end">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-black/40 backdrop-blur-sm sb-wa-prompt-backdrop",
          isExiting && "opacity-0 transition-opacity duration-200"
        )}
        onClick={handleClose}
      />

      {/* Card */}
      <div
        className={cn(
          "relative w-full md:w-[400px] md:mr-6 sb-wa-prompt-enter",
          isExiting &&
            "opacity-0 translate-y-4 md:translate-y-0 md:translate-x-4 transition-all duration-200"
        )}
      >
        <div className="relative overflow-hidden rounded-t-3xl md:rounded-3xl border border-white/[0.08] bg-[var(--sb-bg-elevated)] shadow-2xl">
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--sb-whatsapp)] via-[var(--sb-whatsapp)]/70 to-emerald-400/50" />

          {/* Ambient glow */}
          <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[var(--sb-whatsapp)]/[0.06] blur-[60px]" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.05] text-white/30 transition-all hover:bg-white/[0.10] hover:text-white/60"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative z-10 p-6 pt-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--sb-whatsapp)]/10 text-[var(--sb-whatsapp)] shadow-[0_0_20px_var(--sb-whatsapp-glow)]">
                <WhatsAppIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Stay Connected
                </h3>
                <p className="text-[11px] text-white/30">
                  StudyBond Updates Channel
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="text-[13px] text-white/50 leading-relaxed mb-5">
              Join our WhatsApp channel for{" "}
              <span className="text-white/70 font-medium">
                exam tips, platform updates, and study reminders
              </span>
              . Be the first to know about new features and exam schedules.
            </p>

            {/* Benefits list */}
            <div className="space-y-2 mb-6">
              {[
                "Exam date reminders & prep tips",
                "New feature announcements",
                "Study motivation & community vibes",
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2.5 text-[12px] text-white/40"
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--sb-whatsapp)]/10 text-[var(--sb-whatsapp)]">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  {benefit}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              onClick={handleJoinClick}
              className="group relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[var(--sb-whatsapp)] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_24px_var(--sb-whatsapp-glow)] transition-all duration-200 hover:shadow-[0_6px_32px_var(--sb-whatsapp-glow)] hover:brightness-110 active:scale-[0.98] cursor-pointer"
            >
              {/* Shimmer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <WhatsAppIcon className="h-5 w-5 relative z-10" />
              <span className="relative z-10">Join Channel</span>
              <ExternalLink className="h-3.5 w-3.5 relative z-10 opacity-60" />
            </button>

            {/* Checkbox: Already joined */}
            <label className="flex items-center gap-3 mt-5 cursor-pointer group">
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
                  checked
                    ? "bg-[var(--sb-whatsapp)] border-[var(--sb-whatsapp)] shadow-[0_0_8px_var(--sb-whatsapp-glow)]"
                    : "border-white/15 bg-white/[0.03] group-hover:border-white/25"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckboxToggle();
                }}
              >
                {checked && <Check className="h-3 w-3 text-white" />}
              </div>
              <span
                className={cn(
                  "text-[12px] transition-colors",
                  checked
                    ? "text-[var(--sb-whatsapp)] font-medium"
                    : "text-white/30 group-hover:text-white/50"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  handleCheckboxToggle();
                }}
              >
                I&apos;ve already joined this channel
              </span>
            </label>

            {/* Maybe later */}
            <div className="mt-4 text-center">
              <button
                onClick={handleClose}
                className="text-[11px] text-white/20 transition-colors hover:text-white/40 cursor-pointer"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
