"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { CourseCombobox } from "@/components/ui/course-combobox";
import { Avatar } from "@/features/avatar/components/avatar";
import { DEPARTMENTS } from "@/features/institution/components/department-picker";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { useUpdateProfile } from "@/features/settings/hooks/use-settings";
import type { Department, UserProfile } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";

import { errorText, Switch } from "./settings-ui";
import s from "./settings.module.css";

type ProfileTabProps = {
  profile: UserProfile;
  isPremium: boolean;
};

/** Profile: avatar, name, course, department (boards that ask), target score, emails. */
export function ProfileTab({ profile, isPremium }: ProfileTabProps) {
  const updateProfile = useUpdateProfile();
  const examProfile = useExamProfile();

  /* Each board's exam has its own scale: UI Post-UTME 100, JAMB 400. */
  const scoreMax = examProfile.data?.targetScoreMax ?? 100;
  const suggestedScore = Math.round(scoreMax * 0.8);
  const showDepartment = Boolean(examProfile.data?.signupAsksDepartment) || Boolean(profile.department);

  const [fullName, setFullName] = useState(profile.fullName);
  const [aspiringCourse, setAspiringCourse] = useState(profile.aspiringCourse ?? "");
  /* Null until the student sets one; the suggestion only places the slider. */
  const [targetScore, setTargetScore] = useState<number | null>(profile.targetScore ?? null);
  const [department, setDepartment] = useState<Department | undefined>(profile.department ?? undefined);
  const [emailUnsubscribed, setEmailUnsubscribed] = useState(profile.emailUnsubscribed);
  const [saved, setSaved] = useState(false);

  const targetScoreChanged = targetScore !== (profile.targetScore ?? null);
  const departmentChanged = department !== (profile.department ?? undefined);
  const nameEmpty = !fullName.trim();
  const hasChanges =
    fullName !== profile.fullName ||
    aspiringCourse !== (profile.aspiringCourse ?? "") ||
    targetScoreChanged ||
    departmentChanged ||
    emailUnsubscribed !== profile.emailUnsubscribed;

  async function handleSave() {
    try {
      await updateProfile.mutateAsync({
        fullName: fullName.trim() || undefined,
        aspiringCourse: aspiringCourse.trim() || null,
        /* Only sent when changed, so an old score never blocks other edits. */
        targetScore: targetScoreChanged ? targetScore : undefined,
        department: departmentChanged ? department : undefined,
        emailUnsubscribed,
      });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      /* Shown under the button from the mutation state. */
    }
  }

  const customAvatar = Boolean(profile.avatar && !profile.avatar.isDefault);

  return (
    <>
      <section className={s.who} aria-label="You">
        <span className={cn(s.ring, !isPremium && s.ringFree)}>
          <Avatar look={profile.avatar ?? null} size={64} label="Your avatar" />
        </span>
        <div>
          <span className={s.whoName}>{profile.fullName}</span>
          <span className={s.whoSub}>{profile.email}</span>
          <Link href={"/dashboard/settings/avatar" as Route} className={s.chip}>
            {customAvatar ? "Change avatar" : "Make your avatar"}
          </Link>
        </div>
      </section>

      <h2 className={s.gh}>Your details</h2>
      <div className={s.list}>
        <div className={s.item}>
          <label className={s.label} htmlFor="profile-name">Full name</label>
          <input
            id="profile-name"
            className={s.input}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            autoComplete="name"
            maxLength={100}
            placeholder="Your full name"
          />
          {nameEmpty ? <small className={s.fieldErr}>Your name can&rsquo;t be empty.</small> : null}
        </div>

        <div className={s.item}>
          <label className={s.label} htmlFor="profile-course">Course you want to study</label>
          <CourseCombobox
            id="profile-course"
            value={aspiringCourse}
            onChange={setAspiringCourse}
            className={s.input}
            placeholder="e.g. Medicine and Surgery"
          />
        </div>

        {showDepartment ? (
          <div className={s.item}>
            <span className={s.label} id="profile-department">Department</span>
            <div className={s.seg} role="radiogroup" aria-labelledby="profile-department">
              {DEPARTMENTS.map((option) => {
                const on = department === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    className={cn(s.segBtn, on && s.segOn)}
                    onClick={() => setDepartment(option.value)}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className={s.item}>
          <label className={s.label} htmlFor="profile-target">Target score</label>
          <div className={s.range}>
            <input
              id="profile-target"
              type="range"
              min={Math.round(scoreMax / 2)}
              max={scoreMax}
              step={scoreMax / 20}
              value={targetScore ?? suggestedScore}
              onChange={(event) => setTargetScore(Number(event.target.value))}
            />
            <output htmlFor="profile-target">
              {targetScore === null ? <small>Not set</small> : <>{targetScore}<small>/{scoreMax}</small></>}
            </output>
          </div>
          {targetScore === null ? <small className={s.help}>Move the slider to set it, out of {scoreMax}.</small> : null}
        </div>
      </div>

      <h2 className={s.gh}>Email</h2>
      <div className={s.list}>
        <div className={cn(s.item, s.itemRow)}>
          <span className={s.itemT}>
            <b>Reminders and tips by email</b>
            <small>
              {emailUnsubscribed
                ? "Off. You still get your sign-in codes by email."
                : "Streak reminders, study tips and news from StudyBond."}
            </small>
          </span>
          <Switch
            on={!emailUnsubscribed}
            onChange={(on) => setEmailUnsubscribed(!on)}
            label="Reminders and tips by email"
          />
        </div>
      </div>

      <div className={s.actions}>
        <button
          type="button"
          className={s.btn}
          onClick={handleSave}
          disabled={!hasChanges || nameEmpty || updateProfile.isPending}
        >
          {updateProfile.isPending ? "Saving…" : saved && !hasChanges ? "Saved" : "Save changes"}
        </button>
        {updateProfile.isError ? (
          <p className={s.err} role="alert">{errorText(updateProfile.error, "Couldn't save. Check your internet and try again.")}</p>
        ) : null}
      </div>
    </>
  );
}
