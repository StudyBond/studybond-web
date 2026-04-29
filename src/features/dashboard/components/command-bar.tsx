"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { SubscriptionRing } from "@/features/dashboard/components/subscription-ring";
import type { StreakSummary, SubscriptionStatus, UserProfile, UserStats } from "@/lib/api/types";
import { cn } from "@/lib/utils/cn";
import { useMemo } from "react";
import { Zap, Flame, Target, Crown } from "lucide-react";
import type { Route } from "next";

type CommandBarProps = {
  profile: UserProfile;
  stats: UserStats;
  streak: StreakSummary;
  subscription?: SubscriptionStatus | null;
};

function getGreetingPool(): string[] {
  const hour = new Date().getHours();

  const greetings = {
    /** 00:00 – 05:59 */
    night: [
      "Still grinding?",
      "The night belongs to the serious",
      "Burning the midnight oil",
      "Not everyone's up right now — respect",
      "Dark outside, bright future",
      "Silence is your study partner tonight",
      "Some dreams are built in the dark",
      "The quiet hours hit different",
      "Up when the world's asleep",
      "Late night = no distractions",
      "The UI campus is quiet right now, but your future there is getting loud",
      "Midnight focus is unmatched",
      "While others dream about admission, you're working for it",
      "These are the hours that put you on the leaderboard",
      "Just you, the screen, and the goal",
      "A late night now means an easier time in the exam hall later",
      "You're outworking the competition while they sleep",
      "The dedication is showing",
      "Night owl mode activated",
      "Making the stars jealous with this kind of shine",
      "Sleep comes for everyone, the admission letter doesn't",
      "Sleep doesn't come for those with goals as heavy as yours",
      "Every hour you steal from sleep is another hour closer to your dreams",
      "These late-night hours? They're your secret weapon",
      "The sacrifices you're making now will be the stories you tell later",
      "Sleep is temporary, your admission is forever",
      "The silence of the night is the sound of your ambition",
      "While the world sleeps, your future is being written"
    ],

    /** 06:00 – 11:59 */
    morning: [
      "Good morning",
      "The early ones always win",
      "Morning energy, let's go",
      "You're already ahead — it's morning",
      "Rise and start something",
      "Fresh day, fresh attempt",
      "Another morning, another shot at greatness",
      "The day's still yours to own",
      "Sun's up, game's on",
      "Mornings like this build champions",
      "First one up, last one to stop",
      "Coffee can wait, let's move",
      "Early mornings are for those who refuse to let others define their future",
      "The calm before the chaos of the exam hall – use it",
      "Another day, another opportunity to get closer to your admission",
      "While some are hitting snooze, you're already making moves",
      "This morning energy? It's the sound of your future self thanking you",
      "That admission letter? It's written in moments like this",
      "The early bird gets the admission. Go get yours",
      "The calm before the day's storm. Use it wisely",
      "Every correct answer today is a 'thank you' from future you",
    ],

    /** 12:00 – 16:59 */
    afternoon: [
      "Good afternoon",
      "Midday check-in — how's it going?",
      "Afternoon energy hits different",
      "Half the day left, use it well",
      "Peak focus hours — don't waste them",
      "Sun's at its highest, so is your potential",
      "Afternoon grind is underrated",
      "Lunchtime laziness? Not you",
      "Keep the momentum from this morning",
      "Midday motivation loading…",
      "The afternoon shift belongs to the dedicated",
      "In 4 months you'll thank yourself for this",
      "Today's afternoon is someone else's missed opportunity",
      "You're not just passing time — you're building your future",
      "That admission letter doesn't write itself — let's work",
      "The difference between good and unforgettable is made in these hours",
      "Let's make 2026 the year of your admission",
      "Let's make this moment count",
      "Your uni journey starts here",
      "The path to your uni is built with these hours",
      "One exam at a time is how we get there",
      "Every correct answer is a step closer to your admission",
    ],

    /** 17:00 – 20:59 */
    evening: [
      "Good evening",
      "Evening — the second wind is real",
      "The day's not done yet",
      "Evening mode, still locked in",
      "Wind down? Not yet",
      "Golden hour study session",
      "One more push before the night",
      "Evening prep beats morning panic",
      "Post-work hours, pre-exam edge",
      "Some people rest early, but you? You review",
      "Evening dedication separates the best",
      "The day's not over until you say it is",
      "Let's make this evening count",
      "Don't let your energy fade — finish strong",
      "The best version of you is being forged right now",
      "This is your time to outwork the competition",
      "Every minute you spend now is a minute you save later",
      "Consistency beats intensity every single time",
      "The admission committee sees what you do when no one's watching",
      "These quiet hours are louder than any lecture",
      "Every exam you take builds the story they'll remember",
      "Success isn't a destination — it's the habit you're building",
      "The exam hall is just the final stage — the real work is happening right here",
      
    ],
  };

  if (hour < 6) return greetings.night;
  if (hour < 12) return greetings.morning;
  if (hour < 17) return greetings.afternoon;
  if (hour < 21) return greetings.evening;
  return greetings.night;
}

/** Returns time-of-day ambient orb colors for the command bar */
function getTimeOfDayAmbience() {
  const hour = new Date().getHours();
  if (hour < 6)
    return { orb1: "bg-indigo-500/[0.06]", orb2: "bg-purple-500/[0.04]", orb3: "bg-blue-500/[0.03]" };
  if (hour < 12)
    return { orb1: "bg-[#8b4f1a]/[0.12]", orb2: "bg-amber-700/[0.06]", orb3: "bg-rose-800/[0.03]" };
  if (hour < 17)
    return { orb1: "bg-[#8b4f1a]/[0.12]", orb2: "bg-emerald-700/[0.05]", orb3: "bg-amber-700/[0.03]" };
  if (hour < 21)
    return { orb1: "bg-purple-700/[0.08]", orb2: "bg-[#8b4f1a]/[0.06]", orb3: "bg-blue-800/[0.03]" };
  return { orb1: "bg-indigo-600/[0.06]", orb2: "bg-purple-600/[0.04]", orb3: "bg-blue-600/[0.03]" };
}

function getMicroCopyPool(stats: UserStats, streak: StreakSummary): string[] {
  const exams = stats.completedExams;
  const currentStreak = streak.currentStreak;
  const sp = streak.today.spEarnedToday;
  const examsTakenToday = streak.today.examsTaken;
  const studiedToday = streak.studiedToday;

  if (exams === 0) {
    return [
      "Every top candidate started right here. Your first exam sets the baseline — take it.",
      "Zero exams, unlimited potential. Let's find out where you really stand.",
      "The hardest part is starting. Everything after that? Just momentum.",
      "Your first attempt won't be perfect — it'll be honest. That's more valuable.",
      "Somewhere in this platform is the score that gets you into Medicine. It starts with one exam.",
      "No data yet. No streak yet. But right now? You have something better — a clean slate.",
      "The admission committee doesn't see your doubts — they see your decisions. Let's show them who you really are.",
      "The time for 'maybe tomorrow' is over. Today is here. Use it.",
      "That first exam is the anchor that holds your entire study strategy in place",
      "The best students don't have a secret — they just show up",
      "Let's make your first exam count. Then we'll make the next one count too",
      "You haven't failed yet. You just haven't started.",
      "The most important question is the one you haven't answered yet. Let's get to it",
    ];
  }

  if (studiedToday) {
    if (examsTakenToday >= 3) {
      return [
        `${examsTakenToday} exams in today. That's not studying — that's dominance. Keep the streak alive.`,
        `You've taken ${examsTakenToday} exams already today and earned ${sp} SP. Most people haven't opened a book. You know what you're doing.`,
        `${examsTakenToday} exams today, ${sp} SP banked. The gap between you and the average candidate is growing.`,
        `${examsTakenToday} exams down. You're not just preparing — you're lapping the competition.`,
      ];
    }

    if (sp >= 100) {
      return [
        `${sp} SP earned today — that's a serious session. The streak continues.`,
        `Today's session: ${sp} SP, ${examsTakenToday} exam${examsTakenToday > 1 ? "s" : ""}. Log off knowing you gave it real effort.`,
        `${sp} SP in one day. Not everyone has that kind of focus. You clearly do.`,
        `Strong session — ${sp} SP today. Come back tomorrow and do it again.`,
      ];
    }

    return [
      `You've studied today — ${sp} SP earned. One session closer to the score you're chasing.`,
      `Already locked in today. ${sp} SP and counting. Don't stop now.`,
      `Today's session is live — ${sp} SP earned so far. Finish strong.`,
      `${examsTakenToday} exam${examsTakenToday > 1 ? "s" : ""} today, ${sp} SP on the board. You're building something real.`,
      `Good progress today. ${sp} SP in, streak intact. Keep it going.`,
    ];
  }

  if (currentStreak >= 14) {
    return [
      `${currentStreak} days straight. That's elite-level discipline. Don't let today be the day you break it.`,
      `A ${currentStreak}-day streak means you've studied every single day for over two weeks. Come back and protect that.`,
      `${currentStreak} consecutive days. You've crossed a threshold most never do — keep going.`,
      `${exams} exams, ${currentStreak} days without missing once. Today's session is waiting.`,
    ];
  }

  if (currentStreak >= 7) {
    return [
      `${currentStreak}-day streak and ${exams} exams under your belt. You're in rhythm — don't lose it today.`,
      `Seven-plus days running. That kind of consistency is exactly what separates good from great candidates.`,
      `${currentStreak} days in a row. You've made this a habit. Habits win exams.`,
      `Your ${currentStreak}-day run says a lot about your commitment. Today adds one more.`,
    ];
  }

  if (currentStreak >= 3) {
    return [
      `${currentStreak} days and building. Come back and make it ${currentStreak + 1}.`,
      `${exams} exams done, ${currentStreak}-day streak on the line. Don't let today break it.`,
      `You've been consistent for ${currentStreak} days. That's the hardest part — keep it going.`,
      `${currentStreak}-day streak is worth protecting. Your next exam is one tap away.`,
    ];
  }

  if (exams >= 50) {
    return [
      `${exams} exams completed. You've put in the reps — now string together a streak to sharpen your edge.`,
      `${exams} exams is no joke. Start a new streak today and turn experience into consistency.`,
      `Experience: ${exams} exams. Discipline: waiting for a streak. Today's the reset.`,
      `With ${exams} exams behind you, a fresh streak is the next challenge. Start it now.`,
    ];
  }

  if (exams >= 20) {
    return [
      `${exams} exams completed. You're not a beginner anymore — now build the consistency to match.`,
      `${exams} exams in. Start a streak today and turn good progress into a real pattern.`,
      `You've done ${exams} exams. The next step is showing up every day. Start that streak right now.`,
    ];
  }

  return [
    `${exams} exams down. The candidates who make it aren't smarter — they just keep showing up. Your turn.`,
    `${exams} exams completed. Each one is data. Take another and watch the pattern emerge.`,
    `You've started — that already puts you ahead of the ones who haven't. Keep the momentum.`,
    `${exams} exam${exams > 1 ? "s" : ""} done, many more to conquer. Every rep makes the real thing easier.`,
    `Progress is progress. ${exams} exams logged. Let's add one more today.`,
  ];
}

function pickOnce(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

export function CommandBar({ profile, stats, streak, subscription }: CommandBarProps) {
  const firstName = profile.fullName.split(" ")[0];
  const ambience = getTimeOfDayAmbience();
  const isPremium = profile.isPremium;

  const greeting = useMemo(() => pickOnce(getGreetingPool()), []);
  const microCopy = useMemo(() => pickOnce(getMicroCopyPool(stats, streak)), [stats, streak]);

  return (
    <section className="sb-enter relative w-full overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[var(--sb-bg-surface-1)] via-[#09090b] to-[#12100d]">
      {/* Time-of-day ambient orbs */}
      <div
        className={`pointer-events-none absolute -left-10 top-0 h-[280px] w-[280px] rounded-full ${ambience.orb1} blur-[100px]`}
      />
      <div
        className={`pointer-events-none absolute -right-16 -top-16 h-[350px] w-[350px] rounded-full ${ambience.orb2} blur-[120px]`}
      />
      <div
        className={`pointer-events-none absolute bottom-0 left-1/2 h-[200px] w-[600px] -translate-x-1/2 rounded-full ${ambience.orb3} blur-[80px]`}
      />

      <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-6 lg:p-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Greeting & Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Badge tone="accent" dot>
              {isPremium ? "Elite Member" : "Explorer"}
            </Badge>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/20 truncate">
              {stats.institution.name}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-1 sm:mb-2">
            {greeting}{greeting.endsWith("?") ? " " : ", "}
            <span className={isPremium ? "sb-gradient-text-gold" : "text-[var(--sb-accent)]"}>
              {firstName}
            </span>
          </h1>

          <p className="max-w-lg text-xs sm:text-sm text-white/40 leading-relaxed">
            {microCopy}
          </p>

          {/* Today's Micro-Stats */}
          <div className="mt-3 sm:mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-white/[0.04] px-2 sm:px-3 py-1 sm:py-1.5 border border-white/[0.04]">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--sb-accent)]" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/50">
                <AnimatedCounter
                  value={streak.today.spEarnedToday}
                  className="font-mono text-white/80"
                  duration={800}
                />{" "}
                SP today
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-white/[0.04] px-2 sm:px-3 py-1 sm:py-1.5 border border-white/[0.04]">
              <Flame className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[var(--sb-streak)]" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/50">
                <AnimatedCounter
                  value={streak.currentStreak}
                  className="font-mono text-white/80"
                  duration={800}
                />{" "}
                day streak
              </span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-white/[0.04] px-2 sm:px-3 py-1 sm:py-1.5 border border-white/[0.04]">
              <Target className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
              <span className="text-[10px] sm:text-xs font-semibold text-white/50">
                <AnimatedCounter
                  value={streak.today.examsTaken}
                  className="font-mono text-white/80"
                  duration={800}
                />{" "}
                exams today
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-4 sm:mt-6 flex items-center gap-2 sm:gap-3">
            <Button
              asChild
              size="sm"
              className={cn(
                "rounded-xl border-t text-xs sm:text-base flex-1 sm:flex-none sm:px-6 sm:py-3",
                isPremium
                  ? "shadow-[0_2px_20px_var(--sb-gold-glow)] border-[var(--sb-gold)]/30 bg-gradient-to-r from-[var(--sb-gold)] via-[var(--sb-accent)] to-[#8b4f1a]"
                  : "shadow-[0_2px_20px_var(--sb-accent-glow)] border-[var(--sb-accent)]/30 bg-gradient-to-r from-[var(--sb-accent)] via-[#a06520] to-[#7a4a14]",
              )}
              href={"/exams/new" as Route}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 font-semibold text-white">
                Start Exam
                <Zap className="h-3 w-3 sm:h-4 sm:w-4 fill-current shrink-0" />
              </div>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="sm"
              className="rounded-xl flex flex-1 sm:flex-none sm:px-4 sm:py-3"
              href={"/dashboard/history" as Route}
            >
              View History
            </Button>
          </div>
        </div>

        {/* Right: Subscription Ring (Premium only) */}
        {subscription?.currentSubscription ? (
          <div className="hidden lg:flex shrink-0">
            <div className="rounded-2xl border border-white/[0.05] bg-gradient-to-b from-[var(--sb-bg-surface-2)] to-[var(--sb-bg-surface-1)] p-6 shadow-inner">
              <SubscriptionRing subscription={subscription} variant="full" />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}