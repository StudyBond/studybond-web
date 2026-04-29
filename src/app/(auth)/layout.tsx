import type { Metadata } from "next";
import { SpacetimeGrid } from "@/components/ui/spacetime-grid";
import { Crown, Flame, Medal, Check, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex min-h-screen bg-[#09090b] selection:bg-[#e09040]/30">
      
      {/* ── LEFT PANE: Auth Form ── */}
      <div className="flex w-full flex-col items-center justify-center px-5 py-10 lg:w-1/2 lg:px-12 xl:px-24">
        {/* Ambient glow for the form side on mobile */}
        <div className="pointer-events-none absolute -left-48 -top-48 h-[500px] w-[500px] rounded-full bg-[#e09040]/[0.04] blur-[120px] lg:hidden" />
        
        <div className="relative z-10 w-full flex justify-center">
          {children}
        </div>
      </div>

      {/* ── RIGHT PANE: Showcase (Hidden on mobile) ── */}
      <div className="relative hidden w-1/2 overflow-hidden border-l border-white/[0.04] bg-[#09090b] lg:flex lg:flex-col lg:items-center lg:justify-center">
        <SpacetimeGrid className="opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]" />
        
        {/* 3D Floating Mockups Container */}
        <div className="relative z-10 w-full max-w-[500px] [perspective:1200px]">
          <div className="relative h-[600px] w-full [transform-style:preserve-3d] [transform:rotateX(15deg)_rotateY(-15deg)]">
            
            {/* Card 1: Study Streak */}
            <div className="absolute left-[10%] top-[40%] w-64 rounded-2xl border border-white/[0.08] bg-[#09090b]/80 p-5 backdrop-blur-xl [transform:translateZ(100px)_rotateZ(5deg)] shadow-2xl shadow-black/50">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-sm font-semibold text-white/90">Study Streak</span>
              </div>
              <div className="flex justify-between">
                {[1, 2, 3, 4, 5].map((d) => (
                  <div key={d} className={`h-8 w-8 rounded-lg flex items-center justify-center ${d < 5 ? "bg-gradient-to-t from-orange-500 to-[#e09040] text-[#09090b]" : "bg-white/[0.04] text-white/20"}`}>
                    {d < 5 ? <Check className="h-4 w-4" /> : null}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Leaderboard */}
            <div className="absolute right-[5%] top-[15%] w-72 rounded-2xl border border-[#e09040]/30 bg-gradient-to-br from-[#e09040]/[0.15] to-[#09090b]/90 p-5 backdrop-blur-xl [transform:translateZ(180px)_rotateZ(-4deg)] shadow-[0_0_50px_rgba(224,144,64,0.15)] outline outline-1 outline-white/[0.05]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold text-white">#1 Rank</span>
                <Crown className="h-5 w-5 text-[#e09040]" />
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#e09040]/20 bg-[#e09040]/10 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Challenger" alt="You" className="h-10 w-10 rounded-full border border-white/10" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-white">You</p>
                  <p className="text-[10px] text-white/40">Medicine</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-[#e09040]">16,240</p>
                  <p className="text-[10px] text-[#e09040]/60">SP</p>
                </div>
              </div>
            </div>

            {/* Card 3: Performance */}
            <div className="absolute left-[20%] bottom-[15%] w-56 rounded-2xl border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/[0.08] to-[#09090b]/90 p-5 backdrop-blur-xl [transform:translateZ(50px)_rotateZ(-2deg)] shadow-2xl shadow-emerald-900/20">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-emerald-400" />
                <span className="text-xs font-semibold text-white/90">Readiness Score</span>
              </div>
              <div className="flex justify-center my-2">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-emerald-400/30">
                  <span className="font-mono text-2xl font-bold text-emerald-400">86</span>
                  <span className="absolute -bottom-1 text-[9px] text-emerald-400/60">%</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* Branding Footer */}
        <div className="absolute bottom-10 z-20 text-center mx-auto max-w-sm px-5">
           <p className="text-xs text-white/30 tracking-widest uppercase font-semibold mb-2">StudyBond Platform</p>
           <p className="text-sm text-white/60 font-medium leading-relaxed">
             Join thousands of serious Nigerian students mastering their Post-UTME preparation.
           </p>
        </div>
      </div>
    </main>
  );
}
