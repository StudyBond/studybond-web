import { apiClient } from "@/lib/api/client";
import type { SuccessEnvelope } from "@/lib/api/types";
import type { Subject } from "@/lib/api/exams";

export interface StartStudySessionPayload {
  institutionCode?: string;
  subjects: Subject[];
  mode?: "random" | "topic";
  selectedTopics?: string[];
  limit?: number;
}

export interface SubtopicInfo {
  name: string;
  questionCount: number;
  rawTopics: string[];
}

export interface TopicFamilyInfo {
  topicFamily: string;
  totalQuestions: number;
  subtopics: SubtopicInfo[];
}

export interface SubjectTopicTree {
  subject: string;
  totalQuestions: number;
  topicFamilies: TopicFamilyInfo[];
}

export interface GetStudyTopicsResponse {
  subjects: SubjectTopicTree[];
}

export interface CompleteStudySessionPayload {
  correctCount: number;
  wrongCount: number;
  revealedCount: number;
  skippedCount: number;
  bestStreak: number;
  timeSpentSeconds: number;
  subjectMastery?: {
    subject: string;
    correct: number;
    total: number;
  }[];
}

export interface StudyQuestion {
  id: number;
  questionText: string;
  hasImage: boolean;
  imageUrl: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string | null;
  optionAImageUrl: string | null;
  optionBImageUrl: string | null;
  optionCImageUrl: string | null;
  optionDImageUrl: string | null;
  optionEImageUrl: string | null;
  parentQuestionText: string | null;
  parentQuestionImageUrl: string | null;
  subject: string;
  topic: string | null;
  correctAnswer: string;
  explanation: {
    text: string;
    imageUrl: string | null;
    additionalNotes: string | null;
  } | null;
}

export interface StudySessionData {
  examId: number;
  subjects: string[];
  totalQuestions: number;
  isPremiumSession: boolean;
  questions: StudyQuestion[];
}

export async function startStudySession(payload: StartStudySessionPayload) {
  const response = await apiClient<SuccessEnvelope<StudySessionData>>(
    "/api/study/start",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

export async function completeStudySession(examId: number, payload: CompleteStudySessionPayload) {
  const response = await apiClient<SuccessEnvelope<{ examId: number; status: string }>>(
    `/api/study/${examId}/complete`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
  return response.data;
}

export async function getStudyTopics(subjects?: Subject[], institutionCode?: string) {
  const params = new URLSearchParams();
  if (subjects && subjects.length > 0) {
    params.set("subjects", subjects.join(","));
  }
  if (institutionCode) {
    params.set("institutionCode", institutionCode);
  }
  const queryString = params.toString();
  const url = `/api/study/topics${queryString ? `?${queryString}` : ""}`;
  const response = await apiClient<SuccessEnvelope<GetStudyTopicsResponse>>(url, {
    method: "GET",
  });
  return response.data;
}
