"use client";

import { useEffect, useState } from "react";
import { useStudyStore } from "@/features/study/stores/study-store";
import { StudyHeader } from "./study-header";
import { StudyQuestionCard } from "./study-question-card";
import { StudyTopicDrawer } from "./study-topic-drawer";
import { StudySummary } from "./study-summary";
import { StudyPremiumWall } from "./study-premium-wall";
import { useCompleteStudySession } from "../hooks/use-study-mutations";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function StudyArena() {
  const router = useRouter();
  const sessionActive = useStudyStore((s) => s.sessionActive);
  const examId = useStudyStore((s) => s.examId);
  const questions = useStudyStore((s) => s.questions);
  const currentIndex = useStudyStore((s) => s.currentIndex);
  const isPremiumSession = useStudyStore((s) => s.isPremiumSession);
  const questionStates = useStudyStore((s) => s.questionStates);
  const mastery = useStudyStore((s) => s.mastery);
  
  const completeMutation = useCompleteStudySession();
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  // If a free user moves past the 3rd question, block them
  const showPremiumWall = !isPremiumSession && currentIndex >= 3;

  const currentQuestion = questions[currentIndex];

  async function handleEndSession() {
    if (!examId) return;
    setSaving(true);

    try {
      // Calculate total time spent
      const totalTimeSpent = Object.values(questionStates).reduce(
        (sum, state) => sum + state.timeSpentSeconds, 
        0
      );

      // Map subject mastery
      const subjectsMap = new Map<string, { correct: number; total: number }>();
      questions.forEach((q) => {
        const state = questionStates[q.id];
        if (!state) return;

        if (!subjectsMap.has(q.subject)) {
          subjectsMap.set(q.subject, { correct: 0, total: 0 });
        }
        
        const subStat = subjectsMap.get(q.subject)!;
        subStat.total += 1;
        if (state.isCorrectFirstAttempt) {
          subStat.correct += 1;
        }
      });

      const subjectMastery = Array.from(subjectsMap.entries()).map(([subject, stats]) => ({
        subject,
        correct: stats.correct,
        total: stats.total,
      }));

      // Calculate other metrics
      const correct = mastery.correct;
      const wrong = mastery.wrong;
      const revealed = mastery.revealed;
      const skipped = mastery.skipped;

      await completeMutation.mutateAsync({
        examId,
        payload: {
          correctCount: correct,
          wrongCount: wrong,
          revealedCount: revealed,
          skippedCount: skipped,
          bestStreak: mastery.bestStreak,
          timeSpentSeconds: totalTimeSpent,
          subjectMastery
        }
      });

      setIsCompleted(true);
    } catch (err) {
      console.error("Failed to complete study session:", err);
      // Still show summary so user doesn't lose feedback loop
      setIsCompleted(true);
    } finally {
      setSaving(false);
    }
  }

  function handleBackToDashboard() {
    router.push("/dashboard");
    // Wait a brief moment to reset store to prevent visual jumps during transition
    setTimeout(() => {
      useStudyStore.getState().resetStore();
    }, 200);
  }

  // Handle auto completion when last question is done/revealed
  useEffect(() => {
    if (questions.length > 0 && currentIndex === questions.length - 1) {
      const lastQState = questionStates[questions[currentIndex].id];
      if (lastQState && lastQState.phase !== "attempt") {
        // Wait 1.5 seconds for the explanation to be seen before finishing session
        const timer = setTimeout(() => {
          handleEndSession();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentIndex, questionStates, questions]);

  if (!sessionActive || questions.length === 0) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-study-accent)]" />
        <p className="text-sm text-white/40">Loading study environment...</p>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--sb-study-accent)]" />
        <p className="text-sm text-white/40">Saving your study progress...</p>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <StudySummary
        onRestart={() => {
          setIsCompleted(false);
          // Trigger session selection page again
          useStudyStore.getState().resetStore();
        }}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  if (showPremiumWall) {
    return <StudyPremiumWall onBackToDashboard={handleBackToDashboard} />;
  }

  return (
    <div className="space-y-6">
      <StudyHeader onEndSession={handleEndSession} />

      <div className="flex items-start gap-8">
        {/* Topic navigation on the left */}
        <StudyTopicDrawer />

        {/* Core question work area */}
        <div className="flex-1 min-w-0">
          <StudyQuestionCard
            question={currentQuestion}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
          />
        </div>
      </div>
    </div>
  );
}
