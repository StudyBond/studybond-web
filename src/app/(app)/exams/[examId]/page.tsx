"use client";

import { useParams } from "next/navigation";
import { ExamArena } from "@/features/exam/components/exam-arena";

export default function ExamSessionPage() {
  const params = useParams<{ examId: string }>();
  const examId = Number(params.examId);

  if (!examId || isNaN(examId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--sb-bg)]">
        <p className="text-white/40 text-sm">Invalid exam session.</p>
      </div>
    );
  }

  return <ExamArena examId={examId} />;
}
