"use client";

import { create } from "zustand";
import { parseTopicString } from "@/lib/utils/topics";

export type OptionKey = "A" | "B" | "C" | "D" | "E";
export type StudyPhase = "attempt" | "revealed" | "skipped";

export type StudyQuestionState = {
  phase: StudyPhase;
  selectedAnswer: OptionKey | null;
  isCorrectFirstAttempt: boolean | null; // null = not attempted, true = correct on first try, false = incorrect on first try
  revealedWithoutAttempt: boolean;
  timeSpentSeconds: number;
  enteredAt: number | null;
};

export type StudyMastery = {
  correct: number;
  wrong: number;
  revealed: number;
  skipped: number;
  currentStreak: number;
  bestStreak: number;
};

export type StudyTopicGroup = {
  topic: string;
  subject: string;
  subtopics: string[];
  questionIndices: number[];
  completedCount: number;
  correctCount: number;
};

type StudyStoreState = {
  examId: number | null;
  questions: any[];
  currentIndex: number;
  questionStates: Record<number, StudyQuestionState>;
  mastery: StudyMastery;
  topicGroups: StudyTopicGroup[];
  isPremiumSession: boolean;
  sessionActive: boolean;
};

type StudyStoreActions = {
  initSession: (examId: number, questions: any[], isPremium: boolean) => void;
  selectOption: (questionId: number, option: OptionKey) => void;
  checkAnswer: (questionId: number) => void;
  showAnswer: (questionId: number) => void;
  skipQuestion: (questionId: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  goToQuestion: (index: number) => void;
  updateTimeSpent: (questionId: number, seconds: number) => void;
  resetStore: () => void;
};

const initialMastery: StudyMastery = {
  correct: 0,
  wrong: 0,
  revealed: 0,
  skipped: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export const useStudyStore = create<StudyStoreState & StudyStoreActions>((set, get) => ({
  examId: null,
  questions: [],
  currentIndex: 0,
  questionStates: {},
  mastery: { ...initialMastery },
  topicGroups: [],
  isPremiumSession: false,
  sessionActive: false,

  initSession: (examId, questions, isPremium) => {
    const states: Record<number, StudyQuestionState> = {};
    const now = Date.now();

    questions.forEach((q, idx) => {
      states[q.id] = {
        phase: "attempt",
        selectedAnswer: null,
        isCorrectFirstAttempt: null,
        revealedWithoutAttempt: false,
        timeSpentSeconds: 0,
        enteredAt: idx === 0 ? now : null,
      };
    });

    // Group questions by topic family + subject
    const groupsMap = new Map<string, StudyTopicGroup>();
    questions.forEach((q, index) => {
      const parsed = parseTopicString(q.topic);
      const topicFamily = parsed.topicFamily;
      const subjectName = q.subject;
      const key = `${subjectName}:${topicFamily}`;

      if (!groupsMap.has(key)) {
        groupsMap.set(key, {
          topic: topicFamily,
          subject: subjectName,
          subtopics: [],
          questionIndices: [],
          completedCount: 0,
          correctCount: 0,
        });
      }
      const group = groupsMap.get(key)!;
      group.questionIndices.push(index);
      if (parsed.subtopic && !group.subtopics.includes(parsed.subtopic)) {
        group.subtopics.push(parsed.subtopic);
      }
    });

    set({
      examId,
      questions,
      currentIndex: 0,
      questionStates: states,
      mastery: { ...initialMastery },
      topicGroups: Array.from(groupsMap.values()),
      isPremiumSession: isPremium,
      sessionActive: true,
    });
  },

  selectOption: (questionId, option) => {
    const { questionStates } = get();
    const current = questionStates[questionId];
    if (!current || current.phase !== "attempt") return;

    set({
      questionStates: {
        ...questionStates,
        [questionId]: {
          ...current,
          selectedAnswer: option,
        },
      },
    });
  },

  checkAnswer: (questionId) => {
    const { questionStates, questions, mastery, topicGroups } = get();
    const current = questionStates[questionId];
    const question = questions.find((q) => q.id === questionId);

    if (!current || !question || current.phase !== "attempt" || !current.selectedAnswer) return;

    const isCorrect = current.selectedAnswer === question.correctAnswer;
    const nextPhase: StudyPhase = "revealed";

    // Calculate updated mastery
    const newMastery = { ...mastery };
    if (isCorrect) {
      newMastery.correct += 1;
      newMastery.currentStreak += 1;
      newMastery.bestStreak = Math.max(newMastery.bestStreak, newMastery.currentStreak);
    } else {
      newMastery.wrong += 1;
      newMastery.currentStreak = 0; // Streak broken
    }

    // Update topic groups
    const updatedTopicGroups = topicGroups.map((group) => {
      const qIndex = questions.findIndex((q) => q.id === questionId);
      if (group.questionIndices.includes(qIndex)) {
        return {
          ...group,
          completedCount: group.completedCount + 1,
          correctCount: isCorrect ? group.correctCount + 1 : group.correctCount,
        };
      }
      return group;
    });

    set({
      questionStates: {
        ...questionStates,
        [questionId]: {
          ...current,
          phase: nextPhase,
          isCorrectFirstAttempt: isCorrect,
        },
      },
      mastery: newMastery,
      topicGroups: updatedTopicGroups,
    });
  },

  showAnswer: (questionId) => {
    const { questionStates, questions, mastery, topicGroups } = get();
    const current = questionStates[questionId];
    const question = questions.find((q) => q.id === questionId);

    if (!current || !question || current.phase !== "attempt") return;

    // Direct reveal without attempt
    const newMastery = {
      ...mastery,
      revealed: mastery.revealed + 1,
      currentStreak: 0, // Direct reveal breaks streak
    };

    const updatedTopicGroups = topicGroups.map((group) => {
      const qIndex = questions.findIndex((q) => q.id === questionId);
      if (group.questionIndices.includes(qIndex)) {
        return {
          ...group,
          completedCount: group.completedCount + 1,
        };
      }
      return group;
    });

    set({
      questionStates: {
        ...questionStates,
        [questionId]: {
          ...current,
          phase: "revealed",
          selectedAnswer: question.correctAnswer, // Auto fill option
          isCorrectFirstAttempt: false,
          revealedWithoutAttempt: true,
        },
      },
      mastery: newMastery,
      topicGroups: updatedTopicGroups,
    });
  },

  skipQuestion: (questionId) => {
    const { questionStates, questions, mastery, topicGroups } = get();
    const current = questionStates[questionId];

    if (!current || current.phase !== "attempt") return;

    const newMastery = {
      ...mastery,
      skipped: mastery.skipped + 1,
      currentStreak: 0,
    };

    const updatedTopicGroups = topicGroups.map((group) => {
      const qIndex = questions.findIndex((q) => q.id === questionId);
      if (group.questionIndices.includes(qIndex)) {
        return {
          ...group,
          completedCount: group.completedCount + 1,
        };
      }
      return group;
    });

    set({
      questionStates: {
        ...questionStates,
        [questionId]: {
          ...current,
          phase: "skipped",
          isCorrectFirstAttempt: false,
        },
      },
      mastery: newMastery,
      topicGroups: updatedTopicGroups,
    });
    get().nextQuestion();
  },

  nextQuestion: () => {
    const { currentIndex, questions, questionStates } = get();
    if (currentIndex >= questions.length - 1) return;

    const prevId = questions[currentIndex].id;
    const nextId = questions[currentIndex + 1].id;
    const now = Date.now();

    const updatedStates = { ...questionStates };
    if (updatedStates[prevId]) {
      const duration = Math.round((now - (updatedStates[prevId].enteredAt || now)) / 1000);
      updatedStates[prevId].timeSpentSeconds += duration;
      updatedStates[prevId].enteredAt = null;
    }
    if (updatedStates[nextId]) {
      updatedStates[nextId].enteredAt = now;
    }

    set({
      currentIndex: currentIndex + 1,
      questionStates: updatedStates,
    });
  },

  prevQuestion: () => {
    const { currentIndex, questions, questionStates } = get();
    if (currentIndex <= 0) return;

    const prevId = questions[currentIndex].id;
    const nextId = questions[currentIndex - 1].id;
    const now = Date.now();

    const updatedStates = { ...questionStates };
    if (updatedStates[prevId]) {
      const duration = Math.round((now - (updatedStates[prevId].enteredAt || now)) / 1000);
      updatedStates[prevId].timeSpentSeconds += duration;
      updatedStates[prevId].enteredAt = null;
    }
    if (updatedStates[nextId]) {
      updatedStates[nextId].enteredAt = now;
    }

    set({
      currentIndex: currentIndex - 1,
      questionStates: updatedStates,
    });
  },

  goToQuestion: (index) => {
    const { currentIndex, questions, questionStates } = get();
    if (index < 0 || index >= questions.length || index === currentIndex) return;

    const prevId = questions[currentIndex].id;
    const nextId = questions[index].id;
    const now = Date.now();

    const updatedStates = { ...questionStates };
    if (updatedStates[prevId]) {
      const duration = Math.round((now - (updatedStates[prevId].enteredAt || now)) / 1000);
      updatedStates[prevId].timeSpentSeconds += duration;
      updatedStates[prevId].enteredAt = null;
    }
    if (updatedStates[nextId]) {
      updatedStates[nextId].enteredAt = now;
    }

    set({
      currentIndex: index,
      questionStates: updatedStates,
    });
  },

  updateTimeSpent: (questionId, seconds) => {
    const { questionStates } = get();
    if (!questionStates[questionId]) return;

    set({
      questionStates: {
        ...questionStates,
        [questionId]: {
          ...questionStates[questionId],
          timeSpentSeconds: questionStates[questionId].timeSpentSeconds + seconds,
        },
      },
    });
  },

  resetStore: () => {
    set({
      examId: null,
      questions: [],
      currentIndex: 0,
      questionStates: {},
      mastery: { ...initialMastery },
      topicGroups: [],
      isPremiumSession: false,
      sessionActive: false,
    });
  },
}));
