"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b] p-6">
      <ErrorState
        title="Something went wrong"
        description="StudyBond ran into an unexpected error. Please try again."
        actionLabel="Try again"
        onAction={reset}
      />
    </main>
  );
}
