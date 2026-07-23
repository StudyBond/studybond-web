"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStartStudySession, useStudyTopics } from "@/features/study/hooks/use-study-mutations";
import { useStudyStore } from "@/features/study/stores/study-store";
import { StudyArena } from "@/features/study/components/study-arena";
import { StudyTopicSelector } from "@/features/study/components/study-topic-selector";
import { LearnerShell } from "@/features/dashboard/components/learner-shell";
import { useDashboardCriticalData, useDashboardPremiumData } from "@/features/dashboard/hooks/use-dashboard-data";
import { Button } from "@/components/ui/button";
import type { Subject } from "@/lib/api/exams";
import { cn } from "@/lib/utils/cn";
import { GraduationCap, Sparkles, BookOpen, Loader2, Lock, CheckCircle2, ChevronRight, Crown, Dices, Target } from "lucide-react";

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
  const [studyMode, setStudyMode] = useState<"random" | "topic">("random");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch topics if topic mode is active and subjects are selected
  const topicsQuery = useStudyTopics(selectedSubjects, undefined, studyMode === "topic");
  const subjectTrees = topicsQuery.data?.subjects || [];

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
        mode: studyMode,
        selectedTopics: studyMode === "topic" ? selectedTopics : undefined,
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
            {isPremium ? "Premium Real + Practice Pool" : "Free Exam Pool Sample"}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-white">
          Configure Study Session
        </h1>
        <p className="text-white/40 text-sm sm:text-base md:text-lg">
          Pick any subject combination to learn at your own pace with instant answer explanations.
        </p>

        {/* Question Pool Tier Banner */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Free Pool Card */}
          <div className={cn(
            "p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden",
            !isPremium
              ? "bg-amber-500/[0.06] border-amber-500/30 text-amber-200"
              : "bg-white/[0.02] border-white/[0.06] text-white/50"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
                  FREE
                </span>
                <h3 className="font-bold text-sm text-white">Free Exam Pool</h3>
              </div>
              {!isPremium && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-white/60">
              Includes a curated 3-question sample from your institution's free exam pool.
            </p>
          </div>

          {/* Premium Pool Card */}
          <div className={cn(
            "p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative overflow-hidden",
            isPremium
              ? "bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-black/40 border-indigo-500/40 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.15)]"
              : "bg-gradient-to-br from-amber-950/20 to-black/40 border-amber-500/20 text-white/70"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-black shadow-md">
                  <Crown className="h-4 w-4 fill-black" />
                </div>
                <h3 className="font-bold text-sm text-white">Real Bank & Practice Pool</h3>
              </div>
              {isPremium ? (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Unlocked
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30">
                  <Lock className="h-3 w-3" /> Premium Only
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed text-white/60">
              2,000+ real past exam questions & practice bank across all subjects, unlimited questions, and detailed topic mastery.
            </p>
            {!isPremium && (
              <button
                type="button"
                onClick={() => router.push("/dashboard/settings")}
                className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors w-fit"
              >
                <span>Subscribe to StudyBond Premium to unlock</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Study Mode Selector Switcher (Random vs Topic) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            1. Select Study Strategy
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Random Mix */}
          <button
            type="button"
            onClick={() => setStudyMode("random")}
            className={cn(
              "flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all",
              studyMode === "random"
                ? "bg-[var(--sb-study-accent)]/15 border-[var(--sb-study-accent)] text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                : "bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.04] hover:text-white"
            )}
          >
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl shrink-0 mt-0.5",
              studyMode === "random" ? "bg-[var(--sb-study-accent)] text-white" : "bg-white/5 text-white/40"
            )}>
              <Dices className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Random Adaptive Mix</h4>
              <p className="text-xs text-white/50 leading-relaxed mt-0.5">
                Draws balanced questions across all topics in selected subjects.
              </p>
            </div>
          </button>

          {/* Targeted Topic Mastery */}
          <button
            type="button"
            onClick={() => setStudyMode("topic")}
            className={cn(
              "flex items-start gap-3.5 p-4 rounded-2xl border text-left transition-all",
              studyMode === "topic"
                ? "bg-[var(--sb-study-accent)]/15 border-[var(--sb-study-accent)] text-white shadow-[0_0_20px_rgba(99,102,241,0.15)]"
                : "bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.04] hover:text-white"
            )}
          >
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl shrink-0 mt-0.5",
              studyMode === "topic" ? "bg-[var(--sb-study-accent)] text-white" : "bg-white/5 text-white/40"
            )}>
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Targeted Topic Mastery</h4>
              <p className="text-xs text-white/50 leading-relaxed mt-0.5">
                Focus strictly on specific topics & subtopics (e.g. Phonology — Word Stress).
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Subject selector header */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          2. Select Subjects
        </h3>
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
      </div>

      {/* Topic selector (only when studyMode === 'topic' and subjects are chosen) */}
      {studyMode === "topic" && selectedSubjects.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
          <StudyTopicSelector
            subjectTrees={subjectTrees}
            selectedTopics={selectedTopics}
            onSelectionChange={setSelectedTopics}
            isLoading={topicsQuery.isLoading}
          />
        </div>
      )}

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
            disabled={isMutating || (studyMode === "topic" && selectedTopics.length === 0)}
            className="w-full h-14 sm:h-16 rounded-xl sm:rounded-[20px] text-base sm:text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_30px_rgba(99,102,241,0.2)] transition-all md:max-w-md md:mx-auto md:flex disabled:opacity-50"
          >
            {isMutating ? (
              <Loader2 className="h-5 sm:h-6 w-5 sm:w-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                {studyMode === "topic" && selectedTopics.length === 0
                  ? "Select at least 1 topic to continue"
                  : "Start Targeted Study Session"}
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
