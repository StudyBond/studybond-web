"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Sparkles, 
  Target, 
  FlaskConical, 
  Calculator, 
  Dna,
  BookA,
  BookMarked,
  ArrowRight,
  Loader2,
  AlertTriangle,
  ShieldBan,
  CheckCircle2,
  Flame,
  Clock3,
  Lock,
  Unlock,
  Info
} from "lucide-react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useStartExamMutation, useStartDailyChallengeMutation } from "@/features/practice/hooks/use-practice-mutations";
import { getExamQuestions, getExamEligibility, getExamHistory } from "@/lib/api/exams";
import type { ExamType, Subject } from "@/lib/api/exams";
import type { UserProfile } from "@/lib/api/types";

// ----- Data Definitions

const EXAM_MODES: {
  id: ExamType;
  title: string;
  tagline: string;
  features: string[];
  icon: React.ElementType;
  colorFrom: string;
  colorTo: string;
  accentColor: string;
  glowColor: string;
  highlight?: boolean;
}[] = [
  {
    id: "REAL_PAST_QUESTION",
    title: "Official Past Questions",
    tagline: "The real deal — actual UI Post-UTME questions",
    features: ["Previous year papers", "Real exam simulation", "Pattern recognition", "Walk into the hall knowing you've seen it before."],
    icon: Sparkles,
    colorFrom: "#d4a121",
    colorTo: "#a06520",
    accentColor: "var(--sb-gold)",
    glowColor: "rgba(212, 161, 33, 0.25)",
    highlight: true,
  },
  {
    id: "PRACTICE",
    title: "Practice Questions",
    tagline: "Expertly crafted to build mastery (Not Actual Past Questions)",
    features: ["Subject-focused drills", "Concept reinforcement", "Self-paced learning"],
    icon: Target,
    colorFrom: "#60a5fa",
    colorTo: "#4f46e5",
    accentColor: "#60a5fa",
    glowColor: "rgba(96, 165, 250, 0.20)",
  },
  {
    id: "MIXED",
    title: "Mixed Mode",
    tagline: "Real + practice questions blended",
    features: ["Unpredictable like the exam", "Targeted practice built-in", "Best of both worlds"],
    icon: BookOpen,
    colorFrom: "#34d399",
    colorTo: "#0d9488",
    accentColor: "#34d399",
    glowColor: "rgba(52, 211, 153, 0.20)",
  },
  {
    id: "DAILY_CHALLENGE",
    title: "Daily Challenge",
    tagline: "4 questions · 3 minutes · 40 SP",
    features: ["1 attempt per day", "Build consistency", "Climb the leaderboard"],
    icon: Flame,
    colorFrom: "#d946ef",
    colorTo: "#7c3aed",
    accentColor: "#d946ef",
    glowColor: "rgba(217, 70, 239, 0.25)",
  },
];

const AVAILABLE_SUBJECTS: { id: Subject; label: string; icon: React.ElementType; color: string }[] = [
  { id: "English", label: "English", icon: BookA, color: "text-rose-400" },
  { id: "Mathematics", label: "Mathematics", icon: Calculator, color: "text-blue-400" },
  { id: "Physics", label: "Physics", icon: Target, color: "text-purple-400" },
  { id: "Chemistry", label: "Chemistry", icon: FlaskConical, color: "text-emerald-400" },
  { id: "Biology", label: "Biology", icon: Dna, color: "text-green-400" },
];

export function PracticeSetupPage({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const startExamMutation = useStartExamMutation();
  const startDailyChallengeMutation = useStartDailyChallengeMutation();
  
  const eligibilityQuery = useQuery({
    queryKey: ["exam-eligibility"],
    queryFn: getExamEligibility,
  });
  
  // State
  const searchParams = useSearchParams();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedMode, setSelectedMode] = useState<ExamType | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [autoSelectLoaded, setAutoSelectLoaded] = useState(false);

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const modeParam = searchParams.get("mode") as ExamType | null;
    const stepParam = searchParams.get("step");

    if (modeParam && ["REAL_PAST_QUESTION", "PRACTICE", "MIXED", "DAILY_CHALLENGE"].includes(modeParam)) {
      setSelectedMode(modeParam);
    }

    if (stepParam === "2") {
      setStep(2);
    }
  }, [searchParams]);

  // Pre-fetch State
  const [isStartingExam, setIsStartingExam] = useState(false);

  // derived constraints
  const canSelectMoreSubjects = selectedSubjects.length < 4;
  
  // Enforce English constraint naturally
  const isEnglishMandatory = selectedSubjects.length === 3 && !selectedSubjects.includes("English");
  // If they have 3 subjects and none are English, the VERY NEXT click MUST be English.
  
  // Auto-select subjects for Daily Challenge from last exam history
  useEffect(() => {
    if (selectedMode === "DAILY_CHALLENGE" && !autoSelectLoaded) {
      setAutoSelectLoaded(true);
      // Fetch more items to find the most recent 4-subject combination
      getExamHistory({ limit: 10 })
        .then((history) => {
          const lastFourSubjectExam = history?.exams?.find(e => e.subjects.length === 4);
          
          if (lastFourSubjectExam) {
            setSelectedSubjects(lastFourSubjectExam.subjects as Subject[]);
          } else {
            // Default to a valid 4-subject combination so first-time users can start immediately.
            setSelectedSubjects(["English", "Mathematics", "Physics", "Chemistry"]);
          }
        })
        .catch(() => {
          setSelectedSubjects(["English", "Mathematics", "Physics", "Chemistry"]);
        });
    }
  }, [selectedMode, autoSelectLoaded]);

  // Handlers
  const handleSelectMode = (modeId: ExamType) => {
    setSelectedMode(modeId);
    setAutoSelectLoaded(false);
    setSelectedSubjects([]);
    // Smooth scroll or delay advance
    setTimeout(() => {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 300);
  };

  const toggleSubject = (subject: Subject) => {
    setSetupError(null);
    if (selectedSubjects.includes(subject)) {
      // Removing logic
      // Prevent removing English if they have 4 subjects and English is required
      if (selectedSubjects.length === 4 && subject === "English") {
         setSetupError("English is mandatory for full 4-subject exams.");
         return;
      }
      setSelectedSubjects((prev) => prev.filter((s) => s !== subject));
    } else {
      // Adding logic
      if (!canSelectMoreSubjects) return;
      
      // If adding 4th, it must be English if not already present
      if (selectedSubjects.length === 3 && !selectedSubjects.includes("English") && subject !== "English") {
         setSetupError("You must select English to complete a full 4-subject setup.");
         return;
      }

      // If Mixed mode, max is 3 (per schema: mixed only available for 1-3 solo exams)
      if (selectedMode === "MIXED" && selectedSubjects.length === 3) {
         setSetupError("Mixed mode supports a maximum of 3 subjects.");
         return;
      }
      
      setSelectedSubjects((prev) => [...prev, subject]);
    }
  };

  const handleLaunch = () => {
    if (!selectedMode || selectedSubjects.length === 0) return;
    // Daily challenge requires exactly 4 subjects
    if (selectedMode === "DAILY_CHALLENGE" && selectedSubjects.length !== 4) {
      setSetupError("Daily Challenge requires exactly 4 subjects.");
      return;
    }
    setSetupError(null);
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEnterExam = async () => {
    if (isStartingExam) return;
    setIsStartingExam(true);
    setSetupError(null);

    try {
      const response = selectedMode === "DAILY_CHALLENGE"
        ? await startDailyChallengeMutation.mutateAsync({ subjects: selectedSubjects })
        : await startExamMutation.mutateAsync({ examType: selectedMode!, subjects: selectedSubjects });

      // Pre-fetch questions quietly so they are instantly available when routing
      queryClient.prefetchQuery({
        queryKey: ["exam-session", response.examId],
        queryFn: () => getExamQuestions(response.examId)
      }).catch(() => {
        // Prefetch failure shouldn't block routing
      });

      router.push(`/exams/${response.examId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start exam session.";
      setSetupError(errorMessage);
      setIsStartingExam(false);
    }
  };

  const renderModeSelection = () => (
    <div 
      className={cn("space-y-6 transition-all duration-500", step === 1 ? "opacity-100 translate-y-0 relative" : "opacity-0 -translate-y-10 absolute inset-0 pointer-events-none blur-lg")}
    >
      <div className="mb-8 sb-enter" style={{ animationDelay: "100ms" }}>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Configure Session
        </h1>
        <p className="text-white/40 md:text-lg">Select the calibration mode for your practice protocol.</p>
      </div>

      {/* Bento grid: hero card on top, 3 smaller cards below */}
      <div className="sb-mode-grid">
        {EXAM_MODES.map((mode, i) => {
          const isSelected = selectedMode === mode.id;
          const isPremiumMode = mode.id === "PRACTICE" || mode.id === "MIXED";
          const isLocked = isPremiumMode && !profile.isPremium;
          const Icon = mode.icon;
          
          return (
            <button
              key={mode.id}
              onClick={() => !isLocked && handleSelectMode(mode.id)}
              className={cn(
                "sb-enter sb-mode-card group relative overflow-hidden text-left transition-all duration-500",
                mode.highlight && "sb-mode-card--hero",
                isSelected && "sb-mode-card--selected",
                isLocked && "sb-mode-card--locked"
              )}
              style={{ 
                animationDelay: `${200 + i * 100}ms`,
                "--mode-color": mode.accentColor,
                "--mode-glow": mode.glowColor,
                "--mode-from": mode.colorFrom,
                "--mode-to": mode.colorTo,
              } as React.CSSProperties}
            >
              {/* Ambient gradient backdrop */}
              <div 
                className="sb-mode-card__glow"
                style={{
                  background: `radial-gradient(ellipse at 30% 20%, ${mode.glowColor}, transparent 70%)`,
                }}
              />

              {/* Shimmer sweep on selected */}
              {isSelected && (
                <div className="absolute inset-0 z-[1] overflow-hidden rounded-[inherit] pointer-events-none">
                  <div className="sb-mode-card__shimmer" />
                </div>
              )}

              {/* Premium Lock Overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#09090b]/50 backdrop-blur-[3px] transition-all duration-300 group-hover:backdrop-blur-[6px]">
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.12] shadow-2xl backdrop-blur-xl">
                      <Lock className="h-6 w-6 text-yellow-500" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500/80">Upgrade to unlock</span>
                  </div>
                </div>
              )}

              {/* Card content */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Top row: icon + PRO badge */}
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="sb-mode-card__icon"
                    style={{
                      background: `linear-gradient(135deg, ${mode.colorFrom}, ${mode.colorTo})`,
                    }}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>

                  {isPremiumMode && (
                    <span className="sb-mode-card__pro-badge">
                      PRO
                    </span>
                  )}
                </div>

                {/* Title + Tagline */}
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight mb-1.5 transition-colors">
                  {mode.title}
                </h3>
                <p className="text-sm text-white/35 leading-relaxed mb-4 group-hover:text-white/50 transition-colors">
                  {mode.tagline}
                </p>

                {/* Feature bullets */}
                <ul className="space-y-2 mb-6 flex-1">
                  {mode.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-2.5 text-[13px] text-white/45 group-hover:text-white/60 transition-colors">
                      <span 
                        className="flex h-4 w-4 items-center justify-center rounded-full shrink-0"
                        style={{ backgroundColor: `color-mix(in srgb, ${mode.colorFrom} 15%, transparent)` }}
                      >
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none" className="opacity-80">
                          <path d="M1 3L3 5L7 1" stroke={mode.colorFrom} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Select CTA */}
                <div className={cn(
                  "sb-mode-card__cta",
                  isSelected && "sb-mode-card__cta--selected"
                )}>
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Selected</span>
                    </>
                  ) : (
                    <>
                      <span>Select</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderSubjectSelection = () => (
    <div
      className={cn("space-y-6 transition-all duration-500", step === 2 ? "opacity-100 translate-x-0 relative delay-150" : "opacity-0 translate-x-10 absolute inset-0 pointer-events-none blur-lg")}
    >
      <button 
        onClick={() => { setStep(1); setSelectedSubjects([]); setSetupError(null); }}
        className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/30 hover:text-white/60 transition-colors"
      >
        <ArrowRight className="h-3.5 w-3.5 rotate-180" />
        Back to Modes
      </button>

      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
            Select Subjects
          </h2>
          <p className="text-white/40 md:text-lg">
            {selectedMode === "DAILY_CHALLENGE"
              ? "Select exactly 4 subjects. Auto-filled from your last session."
              : `Choose up to ${selectedMode === "MIXED" ? "3" : "4"} disciplines.`}
            <span className="block mt-1 text-[var(--sb-accent)]">
              {selectedSubjects.length === 4 ? "Maximum selected." : isEnglishMandatory ? "English is required to complete 4 subjects." : ""}
            </span>
          </p>

          {selectedMode === "DAILY_CHALLENGE" && (
            <div className="mt-3 flex items-center gap-2 rounded-full border border-fuchsia-500/20 bg-fuchsia-500/10 px-4 py-1.5 w-fit animate-in fade-in zoom-in duration-500">
              <Clock3 className="h-4 w-4 text-fuchsia-400" />
              <span className="text-sm font-medium text-fuchsia-300">3 Minutes • 4 Questions • 40 SP</span>
            </div>
          )}

          {selectedMode === "REAL_PAST_QUESTION" && eligibilityQuery.data && (
            <div className={cn(
              "mt-4 flex items-center gap-2 rounded-full border px-4 py-1.5 w-fit animate-in fade-in zoom-in duration-500",
              profile.isPremium ? "border-[var(--sb-accent)]/20 bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]" : "border-yellow-500/20 bg-yellow-500/10 text-yellow-500"
            )}>
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">
                {eligibilityQuery.data.creditsRemaining} {profile.isPremium ? "Daily" : "Free"} Subject Credit{eligibilityQuery.data.creditsRemaining !== 1 ? 's' : ''} Remaining
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
           {[...Array(selectedMode === "MIXED" ? 3 : 4)].map((_, i) => (
             <div 
               key={i} 
               className={cn(
                 "h-2 w-8 rounded-full transition-all duration-500",
                 i < selectedSubjects.length ? "bg-[var(--sb-accent)] shadow-[0_0_10px_var(--sb-accent-glow)]" : "bg-white/[0.05]"
               )} 
             />
           ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {AVAILABLE_SUBJECTS.map((subject, i) => {
          const isSelected = selectedSubjects.includes(subject.id);
          const usedFreeSubjects = eligibilityQuery.data?.freeSubjectsTaken ?? [];
          const isAlreadyTaken = !profile.isPremium && usedFreeSubjects.some(s => s.toLowerCase() === subject.id.toLowerCase());
          const isOutOfCredits = !profile.isPremium && (eligibilityQuery.data?.creditsRemaining ?? 0) <= 0;
          
          // A subject is "locked" for a free user if they've used it before OR they have no credits left (and it's not selected)
          const isLocked = !isSelected && (isAlreadyTaken || isOutOfCredits);
          const isDisabled = (!isSelected && !canSelectMoreSubjects) || isLocked;
          
          const Icon = subject.icon;

          return (
            <button
              key={subject.id}
              onClick={() => !isLocked && toggleSubject(subject.id)}
              disabled={isDisabled && !isSelected}
              className={cn(
                "sb-enter group relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border p-6 transition-all duration-300",
                isSelected
                  ? "border-[var(--sb-accent)]/40 bg-[var(--sb-accent)]/10 shadow-[0_0_20px_var(--sb-accent-glow)] scale-[1.02]"
                  : isDisabled
                  ? "border-white/[0.02] bg-white/[0.01] opacity-60 grayscale-[0.5]"
                  : "border-white/[0.04] bg-[var(--sb-bg-surface-1)] hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-1"
              )}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Used/Locked Overlay */}
              {isLocked && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#09090b]/60 backdrop-blur-[2px]">
                   <div className="flex flex-col items-center gap-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                         <Lock className="h-4 w-4 text-white/40" />
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-tighter text-white/40">
                        {isAlreadyTaken ? "Already Taken" : "No Credits"}
                      </span>
                   </div>
                </div>
              )}

              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                isSelected ? "bg-[var(--sb-accent)] text-white shadow-lg" : "bg-white/[0.03] text-white/50",
                isLocked && "opacity-20"
              )}>
                <Icon className={cn("h-6 w-6", isSelected ? "" : subject.color)} />
              </div>
              <span className={cn(
                "font-bold tracking-tight text-sm md:text-base transition-colors",
                isSelected ? "text-white" : "text-white/60 group-hover:text-white"
              )}>
                {subject.label}
              </span>

              {isSelected && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--sb-accent)] text-white shadow-md animate-in zoom-in fade-in duration-300">
                   <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                   </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {setupError && (
        <div className="mt-4 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-200">{setupError}</p>
        </div>
      )}

      {/* Massive Launch CTA */}
      {selectedSubjects.length > 0 && (
         <div 
           className="mt-10 pt-6 border-t border-white/[0.05] animate-in slide-in-from-bottom-8 fade-in duration-500"
         >
            <Button
              onClick={handleLaunch}
              disabled={startExamMutation.isPending}
              className={cn(
                "w-full h-16 rounded-[20px] text-lg font-bold text-white shadow-[0_4px_30px_var(--sb-accent-glow)] transition-all md:max-w-md md:mx-auto md:flex",
                selectedMode === "REAL_PAST_QUESTION" 
                  ? "bg-gradient-to-r from-[var(--sb-gold)] via-[var(--sb-accent)] to-[#8b4f1a] border border-[var(--sb-gold)]/40 hover:brightness-110" 
                  : "bg-gradient-to-r from-[var(--sb-accent)] via-[#a06520] to-[#7a4a14] border border-[var(--sb-accent)]/30 hover:brightness-110"
              )}
            >
              {startExamMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="flex items-center gap-2">
                  Initiate Session
                  <Sparkles className="h-5 w-5" />
                </div>
              )}
            </Button>
            <p className="text-center text-[10px] uppercase tracking-widest text-white/20 mt-4 font-semibold">
              {selectedMode} • {selectedSubjects.length} SUBJECTS
            </p>
         </div>
      )}
    </div>
  );

  const renderRulesScreen = () => (
    <div 
      className={cn("space-y-6 transition-all duration-500", step === 3 ? "opacity-100 translate-y-0 relative" : "opacity-0 translate-y-10 absolute inset-0 pointer-events-none blur-lg")}
    >
      <div className="mb-6 sb-enter" style={{ animationDelay: "100ms" }}>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
          Exam Protocol
        </h1>
        <p className="text-white/40 md:text-lg">Please read the rules carefully before proceeding.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 sb-enter" style={{ animationDelay: "200ms" }}>
        <div className="rounded-2xl border border-red-500/10 bg-red-500/5 p-5 md:p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldBan className="h-24 w-24 text-red-500" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <ShieldBan className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Zero Tolerance Anti-Cheat</h3>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-red-400 shrink-0" />
              <span><strong>Tab switching is strictly prohibited.</strong> Leaving the exam will trigger a countdown, and eventually auto-submit your answers.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-red-400 shrink-0" />
              <span><strong>No screenshots allowed.</strong> Taking screenshots, screen recording, or printing will result in an immediate violation and potential lockout.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-red-400 shrink-0" />
              <span>Copying, pasting, and right-clicking are disabled.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--sb-accent)]/10 bg-[var(--sb-accent)]/5 p-5 md:p-6 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <BookOpen className="h-24 w-24 text-[var(--sb-accent)]" />
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sb-accent)]/10 text-[var(--sb-accent)]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Focus & Navigation</h3>
          <ul className="space-y-2 text-sm text-white/60">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--sb-accent)] shrink-0" />
              <span>You can use the <strong>Arrow Keys</strong> or <strong>P / N</strong> to navigate between questions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--sb-accent)] shrink-0" />
              <span>Press <strong>A, B, C, D, or E</strong> on your keyboard to quickly select an option.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--sb-accent)] shrink-0" />
              <span>Use the Question Navigator (grid icon) to jump directly to any question.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center sb-enter" style={{ animationDelay: "300ms" }}>
        {setupError && (
          <div className="mb-4 p-4 rounded-xl border border-red-500/20 bg-red-500/10 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-200">{setupError}</p>
          </div>
        )}

        <Button
          onClick={handleEnterExam}
          disabled={isStartingExam}
          className={cn(
            "w-full h-16 rounded-[20px] text-lg font-bold text-white transition-all md:max-w-md",
            !isStartingExam
              ? "bg-emerald-500 hover:bg-emerald-600 border border-emerald-400 shadow-[0_4px_30px_rgba(16,185,129,0.3)]"
              : "bg-emerald-500/50 border border-emerald-400/50 opacity-70 cursor-not-allowed"
          )}
        >
          {!isStartingExam ? (
            <div className="flex items-center gap-2">
              I Understand — Start Exam
              <ArrowRight className="h-5 w-5" />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white/90">
              <Loader2 className="h-5 w-5 animate-spin" />
              Starting Session...
            </div>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl py-6 md:py-12 px-2 relative min-h-[500px] overflow-hidden">
      {renderModeSelection()}
      {renderSubjectSelection()}
      {renderRulesScreen()}
    </div>
  );
}
