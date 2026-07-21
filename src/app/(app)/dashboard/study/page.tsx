"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStartStudySession } from "@/features/study/hooks/use-study-mutations";
import { useStudyStore } from "@/features/study/stores/study-store";
import { StudyArena } from "@/features/study/components/study-arena";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData, useDashboardPremiumData } from "@/features/dashboard/hooks/use-dashboard-data";
import { Button } from "@/components/ui/button";
import type { Subject } from "@/lib/api/exams";
import { cn } from "@/lib/utils/cn";
import { GraduationCap, Sparkles, BookOpen, Loader2, Lock, CheckCircle2, ChevronRight, Crown } from "lucide-react";

const STUDY_SUBJECTS: { id: Subject; label: string; icon: any; color: string }[] = [
  { id: "English", label: "English", icon: BookOpen, color: "text-rose-400" },
  { id: "Mathematics", label: "Mathematics", icon: GraduationCap, color: "text-blue-400" },
  { id: "Physics", label: "Physics", icon: GraduationCap, color: "text-purple-400" },
  { id: "Chemistry", label: "Chemistry", icon: GraduationCap, color: "text-emerald-400" },
  { id: "Biology", label: "Biology", icon: GraduationCap, color: "text-green-400" },
];

function StudySetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Dashboard critical data hook contains profile, stats, streak
  const { profile: profileQuery } = useDashboardCriticalData();
  const profile = profileQuery.data;
  const isPremium = profile?.isPremium ?? false;
  
  const startSessionMutation = useStartStudySession();
  const initSession = useStudyStore((s) => s.initSession);
  const sessionActive = useStudyStore((s) => s.sessionActive);
  
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Read URL params
  const subjectsParam = searchParams.get("subjects");

  useEffect(() => {
    if (subjectsParam && profile) {
      const subs = subjectsParam.split(",").filter(Boolean) as Subject[];
      if (subs.length > 0) {
        handleInitiateSession(subs);
      }
    }
  }, [subjectsParam, profile]);

  async function handleInitiateSession(subjectsToStart: Subject[]) {
    setError(null);
    try {
      const response = await startSessionMutation.mutateAsync({
        subjects: subjectsToStart,
      });
      initSession(response.examId, response.questions, response.isPremiumSession);
    } catch (err: any) {
      setError(err?.message || "Failed to start study session. Please try again.");
    }
  }

  function toggleSubject(subject: Subject) {
    setError(null);
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects((prev) => prev.filter((s) => s !== subject));
    } else {
      if (selectedSubjects.length >= 5) {
        setError("You can select up to 5 subjects.");
        return;
      }
      setSelectedSubjects((prev) => [...prev, subject]);
    }
  }

  if (sessionActive) {
    return <StudyArena />;
  }

  const isMutating = startSessionMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl py-4 sm:py-6 md:py-12 px-2 sm:px-4 relative min-h-[500px] overflow-hidden space-y-6 sm:space-y-8">
      {/* Welcome & Info */}
      <div className="space-y-2.5 sm:space-y-3">
        <div className="inline-flex items-center gap-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 w-fit">
          <GraduationCap className="h-4 w-4 text-indigo-400" />
          <span className="text-[10px] sm:text-xs font-bold text-indigo-300 uppercase tracking-widest font-mono">
            Premium Study Mode
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white">
          Configure Study Session
        </h1>
        <p className="text-white/40 text-sm sm:text-base md:text-lg">
          Pick any subject combination to learn at your own pace.
          {!isPremium && (
            <span className="block mt-1 text-amber-400 font-medium text-xs sm:text-sm">
              Free preview: Experience 3 interactive questions.
            </span>
          )}
        </p>
      </div>

      {/* Grid selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4">
        {STUDY_SUBJECTS.map((subject, idx) => {
          const isSelected = selectedSubjects.includes(subject.id);
          const Icon = subject.icon;

          return (
            <button
              key={subject.id}
              onClick={() => toggleSubject(subject.id)}
              disabled={isMutating}
              className={cn(
                "group relative flex flex-col items-center justify-center gap-2.5 sm:gap-3 overflow-hidden rounded-2xl sm:rounded-[20px] border p-4 sm:p-6 transition-all duration-300",
                isSelected
                  ? "border-[var(--sb-study-accent)]/40 bg-[var(--sb-study-accent)]/10 shadow-[0_0_20px_var(--sb-study-glow)] scale-[1.02]"
                  : "border-white/[0.04] bg-[var(--sb-bg-surface-1)] hover:bg-white/[0.04] hover:border-white/10 sm:hover:-translate-y-1"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl transition-all duration-300",
                isSelected ? "bg-[var(--sb-study-accent)] text-white shadow-lg" : "bg-white/[0.03] text-white/50",
              )}>
                <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", isSelected ? "" : subject.color)} />
              </div>
              <span className={cn(
                "font-bold tracking-tight text-xs sm:text-base transition-colors",
                isSelected ? "text-white" : "text-white/60 group-hover:text-white"
              )}>
                {subject.label}
              </span>

              {isSelected && (
                <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-[var(--sb-study-accent)] text-white shadow-md animate-in zoom-in fade-in duration-300">
                  <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3.5 sm:p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-xs sm:text-sm font-medium text-red-200">
          {error}
        </div>
      )}

      {/* Action CTA */}
      {selectedSubjects.length > 0 && (
        <div className="pt-4 sm:pt-6 border-t border-white/[0.05] animate-in slide-in-from-bottom-8 duration-500">
          <Button
            onClick={() => handleInitiateSession(selectedSubjects)}
            disabled={isMutating}
            className="w-full h-14 sm:h-16 rounded-xl sm:rounded-[20px] text-base sm:text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_30px_rgba(99,102,241,0.2)] transition-all md:max-w-md md:mx-auto md:flex"
          >
            {isMutating ? (
              <Loader2 className="h-5 sm:h-6 w-5 sm:w-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                Start Study Session
                <Sparkles className="h-5 w-5" />
              </div>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function StudySetupPage() {
  const { profile: profileQuery } = useDashboardCriticalData();
  const profile = profileQuery.data;
  const isPremium = profile?.isPremium ?? false;
  const { subscription } = useDashboardPremiumData(isPremium);
  const subscriptionData = subscription.data ?? undefined;

  return (
    <LearnerShell
      profile={profile}
      subscriptionData={subscriptionData}
      isPremium={isPremium}
    >
      <Suspense fallback={
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-study-accent)]" />
          <p className="text-sm text-white/40">Loading study session configuration...</p>
        </div>
      }>
        <StudySetupContent />
      </Suspense>
    </LearnerShell>
  );
}
