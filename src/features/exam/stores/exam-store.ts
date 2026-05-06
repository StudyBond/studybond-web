"use client";

import { create } from "zustand";

// ─── Types ───

export type OptionKey = "A" | "B" | "C" | "D" | "E";

export type SubjectRange = {
  subject: string;
  startIndex: number;
  endIndex: number; // inclusive
  count: number;
};

export type QuestionState = {
  /** Selected option key, or null if unanswered */
  answer: OptionKey | null;
  /** Whether the student flagged this question for review */
  flagged: boolean;
  /** Timestamp (ms) when the student first opened this question */
  enteredAt: number | null;
  /** Accumulated time spent on this question in seconds */
  timeSpentSeconds: number;
};

type ExamStoreState = {
  /* ─── Session identity ─── */
  examId: number | null;
  totalQuestions: number;

  /* ─── Navigation ─── */
  currentIndex: number;

  /* ─── Per-question state ─── */
  questionStates: Map<number, QuestionState>;

  /* ─── Timer ─── */
  /** Remaining seconds on the countdown */
  remainingSeconds: number;
  /** Whether the timer is actively counting down */
  timerRunning: boolean;
  /** Timer warning tier: 'normal' | 'warning' | 'critical' | 'final' | 'expired' */
  timerTier: "normal" | "warning" | "critical" | "final" | "expired";

  /* ─── UI state ─── */
  navigatorOpen: boolean;
  submitDialogOpen: boolean;
  abandonDialogOpen: boolean;
  timeExpiredModalOpen: boolean;

  /* ─── Subject navigation ─── */
  subjectRanges: SubjectRange[];

  /* ─── Derived convenience getters via actions ─── */
};

type ExamStoreActions = {
  /** Initialize the store for a new exam session */
  initSession: (examId: number, questionIds: number[], timeAllowedSeconds: number, startedAt: string, questionSubjects?: string[]) => void;

  /** Set the answer for a question */
  setAnswer: (questionId: number, answer: OptionKey | null) => void;

  /** Toggle the flagged state of a question */
  toggleFlag: (questionId: number) => void;

  /** Navigate to a specific question index */
  goToQuestion: (index: number) => void;

  /** Navigate to next question */
  nextQuestion: () => void;

  /** Navigate to previous question */
  prevQuestion: () => void;

  /** Record time spent when leaving a question */
  recordTimeSpent: (questionId: number) => void;

  /** Mark question as entered (for time tracking) */
  markEntered: (questionId: number) => void;

  /** Timer tick — decrease remaining seconds by 1 */
  tick: () => void;

  /** Start/stop the timer */
  setTimerRunning: (running: boolean) => void;

  /** Toggle navigator drawer */
  toggleNavigator: () => void;
  setNavigatorOpen: (open: boolean) => void;

  /** Toggle submit/abandon/time-expired dialogs */
  setSubmitDialogOpen: (open: boolean) => void;
  setAbandonDialogOpen: (open: boolean) => void;
  setTimeExpiredModalOpen: (open: boolean) => void;

  /** Computed: count of answered questions */
  getAnsweredCount: () => number;

  /** Computed: count of flagged questions */
  getFlaggedCount: () => number;

  /** Computed: count of unanswered questions */
  getUnansweredCount: () => number;

  /** Build the final submission payload */
  buildSubmitPayload: () => { questionId: number; answer: string | null; timeSpentSeconds: number; isFlagged: boolean }[];

  /** Navigate to the first question of a subject */
  goToSubject: (subject: string) => void;

  /** Get the subject for the current question index */
  getCurrentSubject: () => string | null;

  /** Get the subject for any question index */
  getSubjectForIndex: (index: number) => string | null;

  /** Get the per-subject question index (0-based) for a given global index */
  getSubjectQuestionIndex: (index: number) => number;

  /** Full reset */
  reset: () => void;
};

const TIMER_WARNING_THRESHOLD = 300; // 5 minutes
const TIMER_CRITICAL_THRESHOLD = 120; // 2 minutes
const TIMER_FINAL_THRESHOLD = 10; // 10 seconds

function computeTimerTier(remaining: number): ExamStoreState["timerTier"] {
  if (remaining <= 0) return "expired";
  if (remaining <= TIMER_FINAL_THRESHOLD) return "final";
  if (remaining <= TIMER_CRITICAL_THRESHOLD) return "critical";
  if (remaining <= TIMER_WARNING_THRESHOLD) return "warning";
  return "normal";
}

const initialState: ExamStoreState = {
  examId: null,
  totalQuestions: 0,
  currentIndex: 0,
  questionStates: new Map(),
  subjectRanges: [],
  remainingSeconds: 0,
  timerRunning: false,
  timerTier: "normal",
  navigatorOpen: false,
  submitDialogOpen: false,
  abandonDialogOpen: false,
  timeExpiredModalOpen: false,
};

export const useExamStore = create<ExamStoreState & ExamStoreActions>()((set, get) => ({
  ...initialState,

  initSession: (examId, questionIds, timeAllowedSeconds, startedAt, questionSubjects) => {
    // Calculate remaining time based on when the exam actually started
    const elapsedSeconds = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    const remaining = Math.max(0, timeAllowedSeconds - elapsedSeconds);

    const states = new Map<number, QuestionState>();
    for (const qId of questionIds) {
      states.set(qId, {
        answer: null,
        flagged: false,
        enteredAt: null,
        timeSpentSeconds: 0,
      });
    }

    // Build subject ranges from the ordered question subjects
    const ranges: SubjectRange[] = [];
    if (questionSubjects && questionSubjects.length === questionIds.length) {
      let currentSubject = questionSubjects[0];
      let rangeStart = 0;

      for (let i = 1; i <= questionSubjects.length; i++) {
        if (i === questionSubjects.length || questionSubjects[i] !== currentSubject) {
          ranges.push({
            subject: currentSubject,
            startIndex: rangeStart,
            endIndex: i - 1,
            count: i - rangeStart,
          });
          if (i < questionSubjects.length) {
            currentSubject = questionSubjects[i];
            rangeStart = i;
          }
        }
      }
    }

    set({
      examId,
      totalQuestions: questionIds.length,
      currentIndex: 0,
      questionStates: states,
      subjectRanges: ranges,
      remainingSeconds: remaining,
      timerRunning: true,
      timerTier: computeTimerTier(remaining),
      navigatorOpen: false,
      submitDialogOpen: false,
      abandonDialogOpen: false,
      timeExpiredModalOpen: false,
    });
  },

  setAnswer: (questionId, answer) => {
    set((state) => {
      const next = new Map(state.questionStates);
      const current = next.get(questionId);
      if (current) {
        next.set(questionId, { ...current, answer });
      }
      return { questionStates: next };
    });
  },

  toggleFlag: (questionId) => {
    set((state) => {
      const next = new Map(state.questionStates);
      const current = next.get(questionId);
      if (current) {
        next.set(questionId, { ...current, flagged: !current.flagged });
      }
      return { questionStates: next };
    });
  },

  goToQuestion: (index) => {
    const { totalQuestions } = get();
    if (index >= 0 && index < totalQuestions) {
      set({ currentIndex: index });
    }
  },

  nextQuestion: () => {
    const { currentIndex, totalQuestions } = get();
    if (currentIndex < totalQuestions - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  markEntered: (questionId) => {
    set((state) => {
      const next = new Map(state.questionStates);
      const current = next.get(questionId);
      if (current && current.enteredAt === null) {
        next.set(questionId, { ...current, enteredAt: Date.now() });
      }
      return { questionStates: next };
    });
  },

  recordTimeSpent: (questionId) => {
    set((state) => {
      const next = new Map(state.questionStates);
      const current = next.get(questionId);
      if (current && current.enteredAt !== null) {
        const elapsed = Math.floor((Date.now() - current.enteredAt) / 1000);
        next.set(questionId, {
          ...current,
          timeSpentSeconds: current.timeSpentSeconds + elapsed,
          enteredAt: null,
        });
      }
      return { questionStates: next };
    });
  },

  tick: () => {
    set((state) => {
      const next = Math.max(0, state.remainingSeconds - 1);
      const tier = computeTimerTier(next);
      const updates: Partial<ExamStoreState> = {
        remainingSeconds: next,
        timerTier: tier,
      };

      // Auto-trigger time expired modal
      if (next <= 0 && state.timerRunning) {
        updates.timerRunning = false;
        updates.timeExpiredModalOpen = true;
      }

      return updates;
    });
  },

  setTimerRunning: (running) => set({ timerRunning: running }),

  toggleNavigator: () => set((s) => ({ navigatorOpen: !s.navigatorOpen })),
  setNavigatorOpen: (open) => set({ navigatorOpen: open }),

  setSubmitDialogOpen: (open) => set({ submitDialogOpen: open }),
  setAbandonDialogOpen: (open) => set({ abandonDialogOpen: open }),
  setTimeExpiredModalOpen: (open) => set({ timeExpiredModalOpen: open }),

  getAnsweredCount: () => {
    const { questionStates } = get();
    let count = 0;
    questionStates.forEach((q) => { if (q.answer !== null) count++; });
    return count;
  },

  getFlaggedCount: () => {
    const { questionStates } = get();
    let count = 0;
    questionStates.forEach((q) => { if (q.flagged) count++; });
    return count;
  },

  getUnansweredCount: () => {
    const { questionStates } = get();
    let count = 0;
    questionStates.forEach((q) => { if (q.answer === null) count++; });
    return count;
  },

  buildSubmitPayload: () => {
    const { questionStates } = get();
    const payload: { questionId: number; answer: string | null; timeSpentSeconds: number; isFlagged: boolean }[] = [];

    questionStates.forEach((state, questionId) => {
      payload.push({
        questionId,
        answer: state.answer,
        timeSpentSeconds: state.timeSpentSeconds,
        isFlagged: state.flagged,
      });
    });

    return payload;
  },

  goToSubject: (subject) => {
    const { subjectRanges } = get();
    const range = subjectRanges.find((r) => r.subject === subject);
    if (range) {
      set({ currentIndex: range.startIndex });
    }
  },

  getCurrentSubject: () => {
    const { currentIndex, subjectRanges } = get();
    for (const range of subjectRanges) {
      if (currentIndex >= range.startIndex && currentIndex <= range.endIndex) {
        return range.subject;
      }
    }
    return null;
  },

  getSubjectForIndex: (index) => {
    const { subjectRanges } = get();
    for (const range of subjectRanges) {
      if (index >= range.startIndex && index <= range.endIndex) {
        return range.subject;
      }
    }
    return null;
  },

  getSubjectQuestionIndex: (index) => {
    const { subjectRanges } = get();
    for (const range of subjectRanges) {
      if (index >= range.startIndex && index <= range.endIndex) {
        return index - range.startIndex;
      }
    }
    return index;
  },

  reset: () => set(initialState),
}));
