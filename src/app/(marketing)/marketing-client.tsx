"use client";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import {
  Zap, ArrowRight, Check, X, Shield, Users, BarChart3, HelpCircle, FileText,
  Trophy, Flame, Timer, ChevronDown, Swords, Sparkles, Star, Crown, Clock
} from "lucide-react";

type MarketingClientProps = {
  leaderboardCard: React.ReactNode;
  streakCard: React.ReactNode;
  scoreCard: React.ReactNode;
  duelCard: React.ReactNode;
  features: { icon: React.ReactNode; title: string; description: string }[];
  faq: { question: string; answer: string }[];
  pricingFree: string[];
  pricingPremium: string[];
};

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <div id={id} className={`mx-auto max-w-6xl px-5 ${className}`}>{children}</div>;
}

import { SpacetimeGrid } from "@/components/ui/spacetime-grid";

const heroHeadingClassName = "sb-display mt-7 text-4xl font-bold tracking-tight leading-[0.98] sm:text-5xl md:text-6xl lg:text-7xl";
const sectionHeadingClassName = "sb-display text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl";
const cardHeadingClassName = "sb-display text-base font-bold tracking-tight";
const featureHeadingClassName = "sb-display mt-4 text-sm font-semibold tracking-tight text-white/90";
const planHeadingClassName = "sb-display text-lg font-bold tracking-tight";
const stepHeadingClassName = "sb-display mt-3 text-sm font-semibold tracking-tight text-white/90";

export function MarketingClient({
  leaderboardCard,
  streakCard,
  scoreCard,
  duelCard,
  features,
  faq,
  pricingFree,
  pricingPremium,
}: MarketingClientProps) {
  return (
    <div className="sb-marketing-copy">
      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden pt-16 md:pt-20 lg:pt-24">
        <SpacetimeGrid />
        <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] rounded-full bg-[#e09040]/8 blur-[120px] z-0" />
        <div className="pointer-events-none absolute -right-40 top-20 h-100 w-100 rounded-full bg-[#c06830]/6 blur-[120px] z-0" />
        <div className="relative z-10 mx-auto max-w-6xl px-5 py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal delay={0} duration={800}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs font-medium text-white/60">
                <Zap className="h-3.5 w-3.5 text-[#e09040]" /> Now live for UI Post-UTME
              </div>
            </Reveal>
            <Reveal delay={150} duration={900}>
              <h1 className={heroHeadingClassName}>
                Outsmart the Exam.<br />
                <span className="bg-linear-to-r from-[#e09040] to-[#78420d] bg-clip-text text-transparent">Outrank the Rest.</span>
              </h1>
            </Reveal>
            <Reveal delay={300} duration={800}>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/45 md:text-lg">
                Most students <i>study</i>. The ones who get in <i>practice</i>. StudyBond puts you through real Post-UTME question patterns, tracks your weak spots, and shows you exactly where you stand.
              </p>
            </Reveal>
            <Reveal delay={450} duration={700}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button asChild size="lg" href="/signup">Start practicing — it&apos;s free <ArrowRight className="h-4 w-4 ml-1" /></Button>
                <Button asChild variant="secondary" size="lg" href="/login">I have an account</Button>
              </div>
            </Reveal>
            <Reveal delay={600} duration={600}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-white/25">
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400/60" /> Free to start</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400/60" /> Real past questions</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-400/60" /> 90-min CBT simulation</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ STATS BAR ══ */}
      <Reveal direction="none" blur={false} duration={600}>
        <div className="border-y border-white/6 bg-white/2">
          <div className="mx-auto grid max-w-4xl grid-cols-2 divide-x divide-white/6 md:grid-cols-4">
            {[
              { value: "100", label: "Questions per exam" },
              { value: "90m", label: "Timed sessions" },
              { value: "4", label: "Subjects covered" },
              { value: "Free", label: "First exam" },
            ].map((stat) => (
              <div className="flex flex-col items-center gap-1 px-4 py-6 text-center" key={stat.label}>
                <span className="font-mono text-2xl font-bold text-[#e09040]">{stat.value}</span>
                <span className="text-xs text-white/25">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ══ LEADERBOARD ══ */}
      <section className="py-20 md:py-28">
        <Section>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            <div className="flex-1 text-center lg:text-left">
              <Reveal direction="left">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs font-medium text-white/50 mb-5">
                  <Trophy className="h-3.5 w-3.5 text-[#e09040]" /> Weekly Competition
                </div>
                <h2 className={sectionHeadingClassName}>
                  Rise to the top. <span className="bg-linear-to-r from-[#f5c890] to-[#e09040] bg-clip-text text-transparent">Claim your spot.</span>
                </h2>
                <p className="mt-4 text-sm text-white/40 md:text-base leading-relaxed">
                  The StudyBond Leaderboard ranks the top 50 students by Study Points (SP) every week. It shows you exactly where you stand. That&apos;s how admissions are won. It resets every Sunday night — giving everyone a fresh chance to compete and earn rewards.
                </p>
                <div className="flex items-center gap-3 text-xs text-white/30 mt-6 justify-center lg:justify-start">
                  <div className="flex items-center gap-1.5 rounded-xl border border-white/6 bg-white/2 px-3 py-2">
                    <Timer className="h-3.5 w-3.5 text-[#e09040]" /><span>Resets every Sunday, 11:59 PM</span>
                  </div>
                </div>
              </Reveal>
            </div>
            <Reveal direction="right" delay={200}>
              {leaderboardCard}
            </Reveal>
          </div>
        </Section>
      </section>

      {/* ══ STREAKS ══ */}
      <section className="py-20 md:py-28 border-y border-white/6 bg-white/1.5">
        <Section>
          <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-16 items-center">
            <div className="flex-1 text-center lg:text-left">
              <Reveal direction="right">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs font-medium text-white/50 mb-5">
                  <Flame className="h-3.5 w-3.5 text-orange-400" /> Discipline Tracker
                </div>
                <h2 className={sectionHeadingClassName}>
                  Build the habit. <span className="bg-linear-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent">Stay consistent.</span>
                </h2>
                <p className="mt-4 text-sm text-white/40 md:text-base leading-relaxed">
                  Every exam you complete advances your streak. Hit 3, 7, 14, and 30-day milestones to earn streak freezers and bonus rewards. Study daily, build momentum, ace your exam.
                </p>
              </Reveal>
            </div>
            <Reveal direction="left" delay={200}>
              {streakCard}
            </Reveal>
          </div>
        </Section>
      </section>

      {/* ══ SCORE ANALYTICS ══ */}
      <section className="py-20 md:py-28">
        <Section>
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            <div className="flex-1 text-center lg:text-left">
              <Reveal direction="left">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs font-medium text-white/50 mb-5">
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-400" /> Performance Analytics
                </div>
                <h2 className={sectionHeadingClassName}>
                  Know exactly <span className="bg-linear-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">where you stand.</span>
                </h2>
                <p className="mt-4 text-sm text-white/40 md:text-base leading-relaxed">
                  After every exam, see your score breakdown by subject. Track what you&apos;re strong in, what needs work, and watch yourself improve over time.
                </p>
              </Reveal>
            </div>
            <Reveal direction="right" delay={200}>
              {scoreCard}
            </Reveal>
          </div>
        </Section>
      </section>

      {/* ══ 1v1 DUEL ══ */}
      <section className="py-20 md:py-28 border-y border-white/6 bg-linear-to-b from-red-500/2 via-[#09090b] to-blue-500/2">
        <Section>
          <div className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-16 items-center">
            <div className="flex-1 text-center lg:text-left">
              <Reveal direction="right">
                <div className="inline-flex items-center gap-2 rounded-full border border-red-400/15 bg-red-400/5 px-3.5 py-1.5 text-xs font-medium text-red-400/70 mb-5">
                  <Swords className="h-3.5 w-3.5" /> 1v1 Battles
                </div>
                <h2 className={sectionHeadingClassName}>
                  Challenge. Battle. <span className="bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Dominate.</span>
                </h2>
                <p className="mt-4 text-sm text-white/40 md:text-base leading-relaxed">
                  Go head-to-head with other students in real-time exam duels. Pick your subject, set the stakes, and prove you&apos;re the best. Winners earn bonus Study Points (SP) and bragging rights.
                </p>
                <div className="flex items-center gap-4 text-xs text-white/25 mt-6 justify-center lg:justify-start flex-wrap">
                  <span className="flex items-center gap-1.5"><Zap className="h-3 w-3 text-[#e09040]" /> Real-time</span>
                  <span className="flex items-center gap-1.5"><Star className="h-3 w-3 text-[#e09040]" /> Earn bonus SP</span>
                  <span className="flex items-center gap-1.5"><Crown className="h-3 w-3 text-[#e09040]" /> Premium feature</span>
                </div>
              </Reveal>
            </div>
            <Reveal direction="left" delay={200}>
              {duelCard}
            </Reveal>
          </div>
        </Section>
      </section>

      {/* ══ OLD WAY vs STUDYBOND ══ */}
      <section className="py-20 md:py-28">
        <Section>
          <Reveal>
            <div className="text-center mb-14">
              <h2 className={sectionHeadingClassName}>
                Don&apos;t study hard. <span className="text-[#e09040]">Study smart.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <Reveal direction="left" delay={100}>
              <div className="rounded-2xl border border-white/6 bg-white/2 p-7 h-full">
                <h3 className={`${cardHeadingClassName} text-white/40 mb-6 flex items-center gap-2`}><X className="h-4 w-4 text-red-400/60" /> The Old Way</h3>
                <ul className="space-y-5">
                  <li className="flex gap-3.5 items-start"><FileText className="text-white/15 mt-0.5 shrink-0" size={18} /><div><strong className="block text-sm text-white/40">Sketchy PDF files</strong><p className="text-xs text-white/20 mt-0.5">Outdated, unverified, no way to track progress</p></div></li>
                  <li className="flex gap-3.5 items-start"><Users className="text-white/15 mt-0.5 shrink-0" size={18} /><div><strong className="block text-sm text-white/40">Studying alone</strong><p className="text-xs text-white/20 mt-0.5">No accountability, no motivation, no fun</p></div></li>
                  <li className="flex gap-3.5 items-start"><HelpCircle className="text-white/15 mt-0.5 shrink-0" size={18} /><div><strong className="block text-sm text-white/40">Guessing game</strong><p className="text-xs text-white/20 mt-0.5">No idea where you stand until the real exam</p></div></li>
                </ul>
              </div>
            </Reveal>
            <Reveal direction="right" delay={200}>
              <div className="rounded-2xl border border-[#e09040]/15 bg-linear-to-br from-[#e09040]/6 to-transparent p-7 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#e09040]/4 rounded-full blur-3xl -mr-10 -mt-10" />
                <h3 className={`${cardHeadingClassName} text-[#e09040] mb-6 flex items-center gap-2 relative z-10`}><Check className="h-4 w-4" /> The StudyBond Way</h3>
                <ul className="space-y-5 relative z-10">
                  <li className="flex gap-3.5 items-start"><Shield className="text-[#e09040]/60 mt-0.5 shrink-0" size={18} /><div><strong className="block text-sm text-white/80">Verified CBT practice</strong><p className="text-xs text-white/35 mt-0.5">Real past questions, timed sessions, accurate scoring</p></div></li>
                  <li className="flex gap-3.5 items-start"><Users className="text-[#e09040]/60 mt-0.5 shrink-0" size={18} /><div><strong className="block text-sm text-white/80">Compete & collaborate</strong><p className="text-xs text-white/35 mt-0.5">Leaderboards, 1v1 duels, streaks for accountability</p></div></li>
                  <li className="flex gap-3.5 items-start"><BarChart3 className="text-[#e09040]/60 mt-0.5 shrink-0" size={18} /><div><strong className="block text-sm text-white/80">Performance analytics</strong><p className="text-xs text-white/35 mt-0.5">Know your strengths, fix weaknesses before exam day</p></div></li>
                </ul>
              </div>
            </Reveal>
          </div>
        </Section>
      </section>

      {/* ══ FEATURES GRID ══ */}
      <section className="py-20 md:py-28 border-y border-white/6 bg-white/1.5">
        <Section>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs font-medium text-white/50 mb-5">
                <Sparkles className="h-3.5 w-3.5 text-[#e09040]" /> Everything included
              </div>
              <h2 className={sectionHeadingClassName}>Built for students who mean business</h2>
              <p className="mt-4 text-sm text-white/40 md:text-base">Every tool you need — in one platform.</p>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 80} direction="up">
                <div className="group rounded-2xl border border-white/6hite/[0.02] p-6 transition-all duration-200 hover:border-white/12 hover:bg-white/4 hover:-translate-y-0.5 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e09040]/10 text-[#e09040]">{feature.icon}</div>
                  <h3 className={featureHeadingClassName}>{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/35">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </section>

      {/* ══ PRICING ══ */}
      <section className="py-20 md:py-28">
        <Section>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs font-medium text-white/50 mb-5">
                <Sparkles className="h-3.5 w-3.5 text-[#e09040]" /> Simple pricing
              </div>
              <h2 className={sectionHeadingClassName}>Start free. Go premium when ready.</h2>
              <p className="mt-4 text-sm text-white/40 md:text-base">No hidden fees. No subscriptions traps. Upgrade only if you want more.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Tier */}
            <Reveal direction="left" delay={100}>
              <div className="rounded-2xl border border-white/6 bg-white/2 p-7 h-full flex flex-col">
                <div>
                  <h3 className={`${planHeadingClassName} text-white/80`}>Free</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-bold text-white">₦0</span>
                    <span className="text-sm text-white/25">forever</span>
                  </div>
                  <p className="mt-3 text-xs text-white/30">Everything you need to get started.</p>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {pricingFree.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-white/50">
                      <Check className="h-3.5 w-3.5 text-white/20 shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="secondary" size="md" href="/signup" className="mt-7 w-full">
                  Get started free
                </Button>
              </div>
            </Reveal>

            {/* Premium Tier */}
            <Reveal direction="right" delay={200}>
              <div className="rounded-2xl border border-[#e09040]/20 bg-linear-to-br from-[#e09040]/6 to-transparent p-7 relative overflow-hidden h-full flex flex-col">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#e09040]/5ded-full blur-3xl -mr-10 -mt-10" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <h3 className={`${planHeadingClassName} text-[#e09040]`}>Premium</h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#e09040]/10 border border-[#e09040]/15 px-2.5 py-0.5 text-[0.6rem] font-bold text-[#e09040] uppercase tracking-wider">
                      <Star className="h-3 w-3" /> Popular
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-bold text-white">₦5,000</span>
                    <span className="text-sm text-white/25">/ 5-months</span>
                  </div>
                  <p className="mt-3 text-xs text-white/30">Unlimited practice. Full power.</p>
                </div>
                <ul className="mt-6 space-y-3 flex-1 relative z-10">
                  {pricingPremium.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-white/70">
                      <Check className="h-3.5 w-3.5 text-[#e09040] shrink-0" /> {item}
                    </li>
                  ))}
                </ul>
                <Button asChild size="md" href="/signup" className="mt-7 w-full relative z-10">
                  Go premium
                </Button>
              </div>
            </Reveal>
          </div>
        </Section>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="border-y border-white/6 bg-white/1.5 py-20 md:py-28">
        <Section>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs font-medium text-white/50 mb-5">
                <ArrowRight className="h-3.5 w-3.5 text-[#e09040]" /> 4 steps
              </div>
              <h2 className={sectionHeadingClassName}>Get started in minutes</h2>
              <p className="mt-4 text-sm text-white/40 md:text-base">No complicated setup. No credit card. Just sign up and go.</p>
            </div>
          </Reveal>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              { step: "01", title: "Create account", desc: "Sign up in seconds. Your first full exam is free." },
              { step: "02", title: "Start practicing", desc: "Take timed exams with real UI Post-UTME past questions." },
              { step: "03", title: "Track progress", desc: "Watch scores improve, maintain streaks, earn SP." },
              { step: "04", title: "Crush your exam", desc: "Walk in confident, prepared, and ahead of the pack." },
            ].map((step, i) => (
              <Reveal key={step.step} delay={i * 120} direction="up">
                <div className="relative">
                  <span className="font-mono text-3xl font-bold text-[#e09040]/20">{step.step}</span>
                  <h3 className={stepHeadingClassName}>{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/35">{step.desc}</p>
                  {i < 3 ? <div className="absolute right-0 top-4 hidden h-px w-8 bg-white/6 lg:block" /> : null}
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      </section>

      {/* ══ FAQ ══ */}
      <section className="py-20 md:py-28">
        <Section>
          <div className="mx-auto max-w-2xl">
            <Reveal>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 px-3.5 py-1.5 text-xs font-medium text-white/50 mb-5">
                  <HelpCircle className="h-3.5 w-3.5 text-[#e09040]" /> FAQ
                </div>
                <h2 className={sectionHeadingClassName}>Common questions</h2>
                <p className="mt-4 text-sm text-white/40">Everything you need to know before getting started.</p>
              </div>
            </Reveal>
            <div>
              {faq.map((item, i) => (
                <Reveal key={item.question} delay={i * 60}>
                  <details className="group border-b border-white/6 last:border-b-0">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-sm font-medium text-white/80 select-none list-none [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <ChevronDown className="h-4 w-4 shrink-0 text-white/20 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="pb-5 text-sm leading-relaxed text-white/40">{item.answer}</div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </Section>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="border-t border-white/6 py-20 md:py-28 relative overflow-hidden">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#e09040]/4 blur-[100px]" />
        <div className="pointer-events-none absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-[#c06830]/4 blur-[100px]" />
        <Section>
          <Reveal duration={900}>
            <div className="relative overflow-hidden rounded-3xl border border-[#e09040]/25 bg-linear-to-br from-[#e09040]/12 via-[#09090b] to-[#c06830]/8 p-10 md:p-20">
              <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-[#e09040]/8 blur-3xl" />
              <div className="pointer-events-none absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-[#e09040]/6 blur-3xl" />
              
              <div className="relative z-10 max-w-3xl mx-auto">
                {/* Badge */}
                <div className="flex justify-center mb-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#e09040]/30 bg-[#e09040]/10 px-4 py-2 text-xs font-semibold text-[#e09040] uppercase tracking-wider">
                    <Zap className="h-4 w-4" /> Limited free spots this week
                  </div>
                </div>

                {/* Main Heading */}
                <Reveal delay={100} duration={800}>
                  <h2 className={`${sectionHeadingClassName} text-center`}>
                    Don&apos;t leave your exam to chance.
                  </h2>
                </Reveal>

                {/* Subheading with social proof */}
                <Reveal delay={200} duration={800}>
                  <p className="mx-auto mt-5 max-w-2xl text-center text-base text-white/50 md:text-lg leading-relaxed">
                    <span className="text-white/70 font-medium">15,000+ students</span> are already preparing with StudyBond. Join them, get your free exam today, and walk in confident on exam day.
                  </p>
                </Reveal>

                {/* Three-column benefits */}
                <Reveal delay={300} duration={800}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 mb-10">
                    <div className="rounded-xl border border-white/8 bg-white/2 p-5 text-center hover:bg-white/3 transition-colors">
                      <div className="flex justify-center mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e09040]/10 text-[#e09040]">
                          <Check className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white/80">Free full exam</p>
                      <p className="text-xs text-white/30 mt-1">No credit card needed</p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/2 p-5 text-center hover:bg-white/3 transition-colors">
                      <div className="flex justify-center mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e09040]/10 text-[#e09040]">
                          <Clock className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white/80">Start in seconds</p>
                      <p className="text-xs text-white/30 mt-1">Sign up takes 2 minutes</p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-white/2 p-5 text-center hover:bg-white/3 transition-colors">
                      <div className="flex justify-center mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e09040]/10 text-[#e09040]">
                          <Trophy className="h-5 w-5" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-white/80">Track progress</p>
                      <p className="text-xs text-white/30 mt-1">See scores improve instantly</p>
                    </div>
                  </div>
                </Reveal>

                {/* Primary CTA */}
                <Reveal delay={400} duration={800}>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <Button asChild size="lg" href="/signup" className="w-full sm:w-auto px-10 h-14 text-base font-semibold group">
                      <span className="flex items-center gap-2">
                        Create free account
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                    <Button asChild variant="ghost" size="lg" href="/login" className="w-full sm:w-auto px-8 h-14 text-base font-semibold">
                      Already have an account?
                    </Button>
                  </div>
                </Reveal>

                {/* Trust indicators */}
                <Reveal delay={500} duration={800}>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-white/30 border-t border-white/6 pt-8">
                    <div className="flex items-center gap-2">
                      <Shield className="h-3.5 w-3.5 text-[#e09040]" />
                      <span>Your data is encrypted</span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>No spam emails — ever</span>
                    </div>
                    <div className="hidden sm:block w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#e09040]" />
                      <span>Read our privacy policy</span>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </Section>
      </section>
    </div>
  );
}
