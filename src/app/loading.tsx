"use client";

import { Logo } from "@/components/ui/logo";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090b]">
      <div className="sb-enter flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo responsiveSize={{ mobile: "xl", tablet: "2xl", desktop: "3xl" }} priority />
        </div>
        <p className="text-xs font-medium text-white/25 tracking-wide">
          Loading...
        </p>
      </div>
    </main>
  );
}
