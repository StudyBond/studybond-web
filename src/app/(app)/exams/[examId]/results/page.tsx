import { ResultsPageClient } from "@/features/exam/components/results-page";

export default async function ExamResultsPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId: examIdStr } = await params;
  const examId = Number(examIdStr);
  return <ResultsPageClient examId={examId} />;
}
