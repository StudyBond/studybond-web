"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { useUpdateProfile } from "@/features/settings/hooks/use-settings";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AvatarPickerModal } from "@/features/settings/components/avatar-picker-modal";
import {
  getSavedAvatarId,
  getAvatarById,
} from "@/lib/avatars/avatar-collection";
import {
  Camera,
  User,
  GraduationCap,
  Target,
  Mail,
  Check,
  Loader2,
} from "lucide-react";
import type { UserProfile } from "@/lib/api/types";

type ProfileTabProps = {
  profile: UserProfile;
  isPremium: boolean;
};

export function ProfileTab({ profile, isPremium }: ProfileTabProps) {
  const updateProfile = useUpdateProfile();

  const [avatarId, setAvatarId] = useState(() => getSavedAvatarId(profile.id));
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [fullName, setFullName] = useState(profile.fullName);
  const [aspiringCourse, setAspiringCourse] = useState(
    profile.aspiringCourse ?? "",
  );
  const [targetScore, setTargetScore] = useState(profile.targetScore ?? 80);
  const [emailUnsubscribed, setEmailUnsubscribed] = useState(
    profile.emailUnsubscribed,
  );

  const [editingField, setEditingField] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const currentAvatar = getAvatarById(avatarId);

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({
        fullName: fullName.trim() || undefined,
        aspiringCourse: aspiringCourse.trim() || null,
        targetScore: targetScore || null,
        emailUnsubscribed,
      });
      setSaveSuccess(true);
      setEditingField(null);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      // Error handled via mutation state
    }
  }

  const hasChanges =
    fullName !== profile.fullName ||
    (aspiringCourse || "") !== (profile.aspiringCourse || "") ||
    targetScore !== (profile.targetScore ?? 80) ||
    emailUnsubscribed !== profile.emailUnsubscribed;

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4 pb-6 border-b border-white/[0.04]">
        <button
          onClick={() => setShowAvatarPicker(true)}
          className="group relative cursor-pointer"
        >
          <div className="relative">
            <div
              className="rounded-full p-[3px] transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${currentAvatar.gradient[0]}, ${currentAvatar.gradient[1]})`,
              }}
            >
              <div className="h-24 w-24 rounded-full bg-[var(--sb-bg)] flex items-center justify-center overflow-hidden">
                <UserAvatar avatarId={avatarId} size="xl" showRing={false} />
              </div>
            </div>
            {/* Camera overlay */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
              <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            {/* Ambient glow */}
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 blur-2xl -z-10 transition-opacity duration-300"
              style={{
                background: `linear-gradient(135deg, ${currentAvatar.gradient[0]}, ${currentAvatar.gradient[1]})`,
              }}
            />
          </div>
          <p className="text-[10px] font-semibold text-[var(--sb-accent-text)] mt-2 text-center">
            {currentAvatar.name}
          </p>
        </button>
      </div>

      {/* Profile Fields */}
      <div className="space-y-3">
        {/* Full Name */}
        <FieldCard
          icon={<User className="h-4 w-4" />}
          label="Full Name"
          editing={editingField === "fullName"}
          onEdit={() => setEditingField("fullName")}
          onClose={() => setEditingField(null)}
        >
          {editingField === "fullName" ? (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder:text-white/20"
              placeholder="Your full name"
            />
          ) : (
            <span className="text-sm text-white/80 font-medium">
              {fullName}
            </span>
          )}
        </FieldCard>

        {/* Aspiring Course */}
        <FieldCard
          icon={<GraduationCap className="h-4 w-4" />}
          label="Aspiring Course"
          editing={editingField === "aspiringCourse"}
          onEdit={() => setEditingField("aspiringCourse")}
          onClose={() => setEditingField(null)}
        >
          {editingField === "aspiringCourse" ? (
            <input
              value={aspiringCourse}
              onChange={(e) => setAspiringCourse(e.target.value)}
              autoFocus
              className="w-full bg-transparent text-sm text-white font-medium outline-none placeholder:text-white/20"
              placeholder="e.g. Medicine & Surgery"
            />
          ) : (
            <span
              className={cn(
                "text-sm font-medium",
                aspiringCourse ? "text-white/80" : "text-white/25 italic",
              )}
            >
              {aspiringCourse || "Not set"}
            </span>
          )}
        </FieldCard>

        {/* Target Score */}
        <FieldCard
          icon={<Target className="h-4 w-4" />}
          label="Target Score"
          editing={editingField === "targetScore"}
          onEdit={() => setEditingField("targetScore")}
          onClose={() => setEditingField(null)}
        >
          {editingField === "targetScore" ? (
            <div className="flex items-center gap-2 sm:gap-3 w-full">
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={targetScore}
                onChange={(e) => setTargetScore(Number(e.target.value))}
                className="flex-1 min-w-0 h-1.5 rounded-full appearance-none bg-white/[0.08] accent-[var(--sb-accent)] cursor-pointer"
              />
              <span className="text-[11px] sm:text-sm font-bold text-[var(--sb-accent)] min-w-[32px] sm:min-w-[40px] text-right">
                {targetScore}
              </span>
            </div>
          ) : (
            <span className="text-sm text-white/80 font-medium">
              {targetScore}/100
            </span>
          )}
        </FieldCard>

        {/* Email Preferences */}
        <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-white/30">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                Email Updates
              </p>
              <p className="text-[11px] sm:text-sm text-white/60 mt-0.5 leading-tight">
                {emailUnsubscribed
                  ? "You won't receive promotional emails"
                  : "Receive study tips & updates"}
              </p>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setEmailUnsubscribed(!emailUnsubscribed)}
              className={cn(
                "relative h-7 w-12 rounded-full transition-all duration-300 shrink-0",
                emailUnsubscribed
                  ? "bg-white/[0.08]"
                  : "bg-[var(--sb-accent)] shadow-[0_0_12px_var(--sb-accent-glow)]",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-300",
                  emailUnsubscribed ? "left-0.5" : "left-[calc(100%-1.625rem)]",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {hasChanges && (
        <div className="pt-2 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-white transition-all duration-300",
              saveSuccess
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-400/20"
                : "bg-gradient-to-r from-[var(--sb-accent)] via-[#a06520] to-[#7a4a14] shadow-[0_4px_24px_var(--sb-accent-glow)] hover:shadow-[0_4px_32px_var(--sb-accent-glow)] hover:scale-[1.01]",
              updateProfile.isPending && "opacity-70 cursor-not-allowed",
            )}
          >
            {updateProfile.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      )}

      {updateProfile.isError && (
        <p className="text-xs text-red-400 text-center">
          {updateProfile.error instanceof Error
            ? updateProfile.error.message
            : "Failed to save."}
        </p>
      )}

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={showAvatarPicker}
        onClose={() => setShowAvatarPicker(false)}
        onSelect={(id) => setAvatarId(id)}
        currentAvatarId={avatarId}
        isPremium={isPremium}
        userId={profile.id}
      />
    </div>
  );
}

/* ─── Field Card Component ─── */

function FieldCard({
  icon,
  label,
  editing,
  onEdit,
  onClose,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={!editing ? onEdit : undefined}
      className={cn(
        "group rounded-2xl border p-4 transition-all duration-300 cursor-pointer",
        editing
          ? "border-[var(--sb-accent)]/30 bg-[var(--sb-accent)]/[0.03] ring-1 ring-[var(--sb-accent)]/20"
          : "border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08]",
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300",
            editing
              ? "bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]"
              : "bg-white/[0.04] text-white/30",
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/30 mb-1">
            {label}
          </p>
          {children}
        </div>
        {editing && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-[10px] font-bold uppercase tracking-wider text-[var(--sb-accent)] hover:text-[var(--sb-accent-hover)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--sb-accent)]/10"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
