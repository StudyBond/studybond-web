import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";

/* GET /api/dashboard/home (backend src/modules/dashboard). Written by hand,
   like the words types: syncing the generated file would pull in unrelated
   backend work that isn't committed. Keep in step with dashboard.openapi.ts. */

export type SubjectRef = { name: string; code: string; iconName: string; colorToken: string };

export type NextUpKind = "RESCUE" | "BROKEN" | "PREMIUM_ENDED" | "FIRST_PAPER" | "WEAKEST";

export type MonthDays = {
  month: string;
  today: string;
  studied: string[];
  frozen: string[];
  hasEarlier: boolean;
  hasLater: boolean;
};

export type ReportSubject = SubjectRef & {
  papers: number;
  average: number | null;
  grade: string | null;
  trend: number | null;
  lastFive: number[];
  paperQuestions: number;
  paperMinutes: number;
};

export type RecentPaper = {
  examId: number;
  examType: string;
  subjects: string[];
  score: number;
  total: number;
  percentage: number;
  completedAt: string;
  marks: string;
  duel: { opponentName: string; result: "W" | "L" | "D" | null; myScore: number; opponentScore: number | null } | null;
};

export type DashboardHome = {
  serverNow: string;
  clock: { date: string; hour: number; dayEndsAt: string; rescueFrom: string; nextChangeAt: string };
  student: { fullName: string; firstName: string; weeklySp: number };
  board: { code: string; name: string; examName: string; maxSubjects: number };
  plan: {
    isPremium: boolean;
    endsAt: string | null;
    daysLeft: number | null;
    endingSoon: boolean;
    endedAt: string | null;
    priceNaira: number;
    durationMonths: number;
    freeSubjectsTotal: number;
    freeSubjectsLeft: number | null;
  };
  streak: {
    count: number;
    longest: number;
    status: "INACTIVE" | "ACTIVE" | "AT_RISK" | "BROKEN";
    studiedToday: boolean;
    freezes: number;
    freezeMissedDate: string | null;
    rescue: boolean;
  };
  broken: {
    length: number;
    lastStudiedDate: string;
    missedDates: string[];
    days: Array<{ date: string; kind: "STUDIED" | "FREEZE" }>;
  } | null;
  nextUp: {
    kind: NextUpKind;
    weakest: (SubjectRef & {
      average: number;
      grade: string;
      papers: number;
      paperQuestions: number;
      paperMinutes: number;
    }) | null;
  };
  challenge: {
    state: "OPEN" | "IN_PROGRESS" | "DONE" | "CLOSED";
    right: number | null;
    total: number | null;
    spEarned: number | null;
    subjects: SubjectRef[];
  };
  report: { waecGrades: boolean; subjects: ReportSubject[]; emptySubjects: SubjectRef[]; remark: string | null };
  examDate: { year: number | null; startsOn: string | null; endsOn: string | null; note: string | null };
  recentPapers: RecentPaper[];
  month: MonthDays;
  vault: { saved: number };
};

export async function getDashboardHome() {
  const response = await apiClient<SuccessEnvelope<DashboardHome>>("/api/dashboard/home");
  return response.data;
}

export async function getMonthDays(month: string) {
  const response = await apiClient<SuccessEnvelope<MonthDays>>(`/api/dashboard/month?month=${encodeURIComponent(month)}`);
  return response.data;
}

/** Move the account to another board, like signing into another account. */
export async function switchBoard(institutionCode: string) {
  const response = await apiClient<SuccessEnvelope<unknown>>("/api/institutions/active", {
    method: "PUT",
    body: JSON.stringify({ institutionCode }),
  });
  return response.data;
}

export const homeKeys = {
  home: ["home", "dashboard"] as const,
  month: (month: string) => ["home", "month", month] as const,
};
