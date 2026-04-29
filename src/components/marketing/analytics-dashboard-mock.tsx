import { BarChart3, TrendingUp } from "lucide-react";

export function AnalyticsDashboardMock() {
  return (
    <div className="w-full max-w-[450px] mx-auto lg:mx-0">
      <div className="rounded-3xl border border-white/[0.08] bg-[#09090b] shadow-2xl shadow-[#e09040]/10 overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/[0.04] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[#e09040]/20">
              <BarChart3 className="h-3 w-3 text-[#e09040]" />
            </span>
            <span className="text-xs font-semibold text-white/90">Performance</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            +14% this week
          </div>
        </div>

        <div className="flex flex-1">
          {/* Main Content Area */}
          <div className="flex-1 p-4 flex flex-col">
            
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-3 text-left">
                <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Study Velocity</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xl font-bold text-white">8.5</span>
                  <span className="text-[10px] text-white/30">hrs/wk</span>
                </div>
              </div>
              <div className="rounded-xl border border-[#e09040]/20 bg-gradient-to-br from-[#e09040]/10 to-transparent p-3 text-left relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-[#e09040]/20 blur-xl rounded-full" />
                <p className="text-[10px] text-[#e09040]/60 uppercase tracking-wider mb-1">Target Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-xl font-bold text-[#e09040]">90</span>
                  <span className="text-[10px] text-[#e09040]/50">/ 100</span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="relative flex-1 rounded-xl border border-white/[0.06] bg-[#131316] p-4 pt-3 flex flex-col justify-end overflow-hidden h-[120px]">
              <div className="absolute top-3 left-4 flex items-center justify-between right-4">
                <span className="text-[10px] text-white/40 font-medium">Score Projection</span>
                <span className="text-[10px] font-mono text-blue-400">Top 5%</span>
              </div>
              
              {/* Fake SVG Line Chart */}
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-[60px] mt-auto relative z-10 overflow-visible">
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#e09040" stopOpacity="1" />
                  </linearGradient>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#e09040" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#e09040" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M 0 35 Q 20 30, 40 25 T 70 15 T 100 5 L 100 40 L 0 40 Z" fill="url(#areaGrad)" />
                <path d="M 0 35 Q 20 30, 40 25 T 70 15 T 100 5" fill="none" stroke="url(#lineGrad)" strokeWidth="2" strokeLinecap="round" />
                
                {/* Data Points */}
                <circle cx="70" cy="15" r="2" fill="#09090b" stroke="#8b5cf6" strokeWidth="1" />
                <circle cx="100" cy="5" r="2.5" fill="#09090b" stroke="#e09040" strokeWidth="1.5" />
              </svg>
              
              {/* Grid Lines */}
              <div className="absolute inset-x-0 bottom-0 top-[2.5rem] flex flex-col justify-between pointer-events-none pb-2 z-0">
                <div className="w-full h-px bg-white/[0.03]" />
                <div className="w-full h-px bg-white/[0.03]" />
                <div className="w-full h-px bg-white/[0.03]" />
              </div>
            </div>

          </div>

          {/* Side Bar (Readiness) */}
          <div className="w-[120px] border-l border-white/[0.04] p-4 flex flex-col items-center bg-[#131316]/50">
            <span className="text-[10px] text-white/50 text-center font-medium leading-tight mb-4">Exam Readiness</span>
            
            <div className="relative mb-auto mt-2">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/[0.05]" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="175" strokeDashoffset="40" className="text-emerald-400" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-xl font-bold text-emerald-400">80</span>
              </div>
            </div>

            <p className="text-[9px] text-emerald-400/80 text-center mt-4">Passing zone</p>
          </div>
        </div>
      </div>
    </div>
  );
}
