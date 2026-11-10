"use client";

import { Loader2 } from "lucide-react";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData } from "@/features/dashboard/hooks/use-dashboard-data";
import { useExamProfile } from "@/features/institution/hooks/use-exam-profile";
import { departmentLabel } from "@/features/institution/components/department-picker";
import { LeaderboardScreen } from "@/features/leaderboard/components/leaderboard-screen";

export function LeaderboardPageClient() {
  const critical = useDashboardCriticalData();
  const examProfile = useExamProfile();
  const profile = critical.profile.data;

  if (critical.isLoading || examProfile.isLoading || !profile) {
    return (
      <LearnerShell profile={profile}>
        <div className="flex h-[50vh] items-center justify-center">
          {critical.isError ? (
            <p className="text-sm text-white/60">We couldn&apos;t load your profile. Refresh to try again.</p>
          ) : (
            <Loader2 className="h-7 w-7 animate-spin text-[#e09040] opacity-60" />
          )}
        </div>
      </LearnerShell>
    );
  }

  const exam = examProfile.data;
  const departmentBoard = Boolean(exam?.signupAsksDepartment);
  const boardLabel = exam ? `${exam.institution.code} ${exam.trackName}` : "This board";
  const groupTabLabel = departmentBoard
    ? departmentLabel(profile.department) ?? "My department"
    : profile.aspiringCourse || "My course";

  return (
    <LearnerShell profile={profile} isPremium={Boolean(critical.stats.data?.isPremium)}>
      <LeaderboardScreen
        viewerId={profile.id}
        isPremium={Boolean(critical.stats.data?.isPremium)}
        boardLabel={boardLabel}
        groupTabLabel={groupTabLabel}
        departmentBoard={departmentBoard}
        fullPaperSp={exam?.fullExamQuestions ?? 100}
      />
    </LearnerShell>
  );
}
