"use client";

export function ExamLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--sb-bg)] px-4">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[300px] w-[400px] rounded-full bg-[var(--sb-accent)]/[0.04] blur-[120px]" />

      <div className="relative flex flex-col items-center text-center">
        {/* Loading spinner */}
        <div className="relative mb-8">
          <div className="h-16 w-16 rounded-full border-2 border-white/[0.06]" />
          <div className="absolute inset-0 h-16 w-16 rounded-full border-2 border-transparent border-t-[var(--sb-accent)] animate-spin" />
        </div>

        <h2 className="text-xl font-bold text-white/80 mb-2">
          Preparing your exam
        </h2>
        <p className="text-sm text-white/30 max-w-xs">
          Loading questions and calibrating your session...
        </p>

        {/* Skeleton preview */}
        <div className="mt-10 w-full max-w-md space-y-3">
          <div className="h-3 w-3/4 mx-auto rounded-full sb-shimmer" />
          <div className="h-3 w-1/2 mx-auto rounded-full sb-shimmer" style={{ animationDelay: "200ms" }} />
          <div className="mt-6 space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 rounded-2xl sb-shimmer"
                style={{ animationDelay: `${300 + i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
