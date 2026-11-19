"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { retakeExam } from "@/lib/api/exams";
import { toast } from "sonner";
import { cn } from "@/lib/utils/cn";

type RetakeButtonProps = {
  examId: number;
  retakesRemaining?: number | null; // From API or Summary
  className?: string;
};

/** Starts a retake of this exam and opens it. Shared by every retake button. */
export function useRetake(examId: number) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const retake = async () => {
    setIsLoading(true);
    try {
      const session = await retakeExam(examId);
      toast.success("Retake session initiated.");
      router.push(`/exams/${session.examId}`);
    } catch (err: unknown) {
      toast.error((err instanceof Error && err.message) || "Failed to initiate retake session.");
    } finally {
      setIsLoading(false);
    }
  };

  return { retake, isLoading };
}

export function RetakeButton({ examId, retakesRemaining, className }: RetakeButtonProps) {
  const { retake: handleRetake, isLoading } = useRetake(examId);

  // If we know there are no retakes, do not render or render disabled
  if (retakesRemaining === 0) {
    return null;
  }

  return (
    <Button 
      onClick={handleRetake} 
      isLoading={isLoading} 
      variant="secondary" 
      size="md"
      className={cn("border-[var(--sb-accent)]/30 text-[var(--sb-accent)] hover:bg-[var(--sb-accent)]/10 hover:border-[var(--sb-accent)]/50", className)}
    >
      <RotateCcw className="h-4 w-4" />
      Take Again
      {retakesRemaining && <span className="ml-1 opacity-50">({retakesRemaining} left)</span>}
    </Button>
  );
}
