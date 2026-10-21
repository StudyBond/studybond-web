import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";

/**
 * One subject as a given institution uses it.
 *
 * Mirrors the backend's exam-profile payload. Note that `name` is a plain
 * string, not a fixed union: which subjects exist depends on the institution,
 * so a school can offer Economics or Literature without a code change here.
 */
export interface ExamProfileSubject {
  name: string;
  /** Short code, e.g. "ENG". Shown when we have no icon for the subject. */
  code: string;
  aliases: string[];
  /** Backend icon key, e.g. "flask-conical". Unknown keys fall back to a code badge. */
  iconName: string;
  /** Palette token, e.g. "emerald". Unknown tokens fall back to a neutral colour. */
  colorToken: string;
  questionCount: number;
  freeQuestionCount: number;
  soloDurationSeconds: number;
  isCompulsory: boolean;
  displayOrder: number;
}

/**
 * Everything a screen needs to render exam setup for one institution: the
 * subjects, and the rules that used to be hardcoded (how many subjects make a
 * full exam, which are compulsory, how long a full exam runs).
 */
export interface ExamProfile {
  institution: {
    code: string;
    name: string;
    slug: string;
  };
  /** How many subjects a full exam covers. Replaces the hardcoded 4. */
  maxSubjects: number;
  fullExamQuestions: number;
  fullExamDurationSeconds: number;
  collaborationDurationSeconds: number;
  allowMixedPartialExams: boolean;
  allowMixedFullExams: boolean;
  studyModeEnabled: boolean;
  /** What the exam is called, e.g. "Post-UTME" or "UTME". */
  trackName: string;
  /** What the exam is scored out of: UI Post-UTME 100, JAMB 400. */
  targetScoreMax: number;
  /** Optional until every backend sends it. */
  signupAsksDepartment?: boolean;
  /** Already in display order. */
  subjects: ExamProfileSubject[];
}

/**
 * One board a student can see in signup or the board switcher. Admins set
 * the status, so a board moves from coming-soon to open without a release.
 * Hidden boards never appear here.
 */
export interface StudentBoard {
  code: string;
  name: string;
  slug: string;
  /** COMING_SOON boards are shown but cannot be chosen. */
  status: "OPEN" | "COMING_SOON";
  /*
   * Optional because a backend deployed before these existed leaves them
   * out. Signup falls back to the board name, out of 100, and the course.
   */
  /** What the board's exam is called, e.g. "Post-UTME" or "UTME". */
  examName?: string;
  /** What the exam is scored out of: UI Post-UTME 100, JAMB 400. */
  targetScoreMax?: number;
  /** Ask Science, Art or Commercial instead of the course. */
  signupAsksDepartment?: boolean;
}

/** Public, so signup can call it before anyone has an account. */
export async function listStudentBoards() {
  const response = await apiClient<SuccessEnvelope<{ boards: StudentBoard[] }>>(
    "/api/institutions",
  );

  return response.data.boards;
}

/** Defaults to the signed-in student's own institution. */
export async function getExamProfile(institutionCode?: string) {
  const query = institutionCode
    ? `?institutionCode=${encodeURIComponent(institutionCode)}`
    : "";

  const response = await apiClient<SuccessEnvelope<ExamProfile>>(
    `/api/institutions/exam-profile${query}`,
  );

  return response.data;
}
