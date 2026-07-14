"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { CURATED_AVATARS, getAvatarById, getSavedAvatarId, saveAvatarId } from "@/lib/avatars/avatar-collection";
import type { CuratedAvatar } from "@/lib/avatars/avatar-collection";
import { UserAvatar } from "@/components/ui/user-avatar";
import { X, Check, Sparkles } from "lucide-react";

type AvatarPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (avatarId: string) => void;
  currentAvatarId: string;
  isPremium?: boolean;
  userId?: number;
};

export function AvatarPickerModal({
  isOpen,
  onClose,
  onSelect,
  currentAvatarId,
  isPremium = false,
  userId,
}: AvatarPickerModalProps) {
  const [selectedId, setSelectedId] = useState(currentAvatarId);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(currentAvatarId);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, currentAvatarId]);

  if (!isOpen || !mounted) return null;

  function handleSave() {
    setIsAnimating(true);
    saveAvatarId(selectedId, userId);
    onSelect(selectedId);
    setTimeout(() => {
      setIsAnimating(false);
      onClose();
    }, 600);
  }

  function scroll(direction: "left" | "right") {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-[calc(100vw-2rem)] sm:max-w-2xl max-h-[90vh] rounded-3xl border border-white/[0.06] bg-[var(--sb-bg-elevated)] shadow-2xl animate-in zoom-in-95 fade-in duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 bg-[var(--sb-bg-elevated)]/95 backdrop-blur-xl border-b border-white/[0.04]">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Choose Your Identity</h2>
            <p className="text-xs text-white/40 mt-0.5">Select an avatar that represents your journey</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Avatar Carousel */}
        <div className="relative w-full overflow-hidden flex-1 flex items-center min-h-[260px] group/carousel">
          {/* Desktop scroll buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 z-20 hidden h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 sm:group-hover/carousel:flex"
            aria-label="Scroll left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div 
            ref={scrollContainerRef}
            className="flex w-full overflow-x-auto snap-x snap-mandatory sb-scroll-hide gap-4 px-6 py-6 items-center"
          >
            {CURATED_AVATARS.map((avatar, index) => {
            const isSelected = selectedId === avatar.id;
            return (
              <button
                key={avatar.id}
                onClick={() => setSelectedId(avatar.id)}
                className={cn(
                  "group relative flex flex-col items-center gap-3 rounded-2xl p-4 pb-3 transition-all duration-300 outline-none shrink-0 w-[140px] snap-center",
                  isSelected
                    ? "bg-gradient-to-b from-[var(--sb-accent)]/[0.12] to-transparent ring-2 ring-[var(--sb-accent)]/60 scale-[1.05]"
                    : "bg-white/[0.02] hover:bg-white/[0.05] hover:scale-[1.03] hover:shadow-xl",
                )}
                style={{
                  animationDelay: `${index * 40}ms`,
                }}
              >
                {/* Selection check */}
                {isSelected && (
                  <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sb-accent)] shadow-[0_0_12px_var(--sb-accent-glow)] animate-in zoom-in duration-200">
                    <Check className="h-3.5 w-3.5 text-white" />
                  </div>
                )}

                {/* Avatar */}
                <div className={cn(
                  "relative transition-transform duration-300",
                  isSelected && "scale-110",
                )}>
                  <div
                    className="h-16 w-16 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${avatar.gradient[0]}, ${avatar.gradient[1]})`,
                      padding: "3px",
                    }}
                  >
                    <div className="h-full w-full rounded-full bg-[var(--sb-bg)] flex items-center justify-center overflow-hidden">
                      <UserAvatar avatarId={avatar.id} size="lg" showRing={false} />
                    </div>
                  </div>
                  {/* Ambient glow */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-full opacity-30 blur-xl -z-10"
                      style={{
                        background: `linear-gradient(135deg, ${avatar.gradient[0]}, ${avatar.gradient[1]})`,
                      }}
                    />
                  )}
                </div>

                {/* Name + subtext */}
                <div className="text-center min-w-0 w-full">
                  <p className={cn(
                    "text-[11px] font-bold truncate transition-colors",
                    isSelected ? "text-white" : "text-white/60 group-hover:text-white/80",
                  )}>
                    {avatar.name}
                  </p>
                  <p className="text-[9px] text-white/25 truncate mt-0.5">{avatar.subtext}</p>
                </div>
              </button>
            );
          })}
          </div>
          
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 z-20 hidden h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 sm:group-hover/carousel:flex"
            aria-label="Scroll right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 pt-4 bg-[var(--sb-bg-elevated)]/95 backdrop-blur-xl border-t border-white/[0.04] shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white/50 transition-colors hover:text-white/80 hover:bg-white/[0.04]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={selectedId === currentAvatarId || isAnimating}
            className={cn(
              "relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed",
              "bg-gradient-to-r from-[var(--sb-accent)] via-[#a06520] to-[#7a4a14] shadow-[0_2px_20px_var(--sb-accent-glow)]",
              "hover:shadow-[0_4px_30px_var(--sb-accent-glow)] hover:scale-[1.02]",
              isAnimating && "scale-95 opacity-80",
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {isAnimating ? "Saved!" : "Save Identity"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
