import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Trophy, Swords, BarChart3, Flame, CheckCircle2, Users } from "lucide-react";
import { getPublicAppUrl } from "@/lib/env/server";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { courseJsonLd, faqJsonLd, breadcrumbJsonLd, quizJsonLd, aggregateRatingJsonLd } from "@/lib/seo/json-ld";

const parseMarkdown = (s: string) => {
  let html = s;
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong class='text-white/70 font-semibold'>$1</strong>");
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, (match, text, url) => {
    const isInternal = url.startsWith("/");
    const targetAttr = isInternal ? "" : "target='_blank' rel='noopener noreferrer'";
    return `<a href="${url}" class="text-[#e09040] hover:underline" ${targetAttr}>${text}</a>`;
  });
  html = html.replace(/\*(.+?)\*/g, "<em class='text-white/40 italic font-medium'>$1</em>");
  html = html.replace(/\n/g, "<br />");
  return html;
};

/* ── Metadata ── */
export async function generateMetadata(): Promise<Metadata> {
  const appUrl = getPublicAppUrl();
  const ogUrl = `${appUrl}/api/og?title=${encodeURIComponent("UI Post-UTME Past Questions & CBT")}&desc=${encodeURIComponent("Practice with real past questions in a timed CBT simulation. 100 questions in 90 minutes. Start free today.")}`;
  
  return {
    title: "UI Post-UTME Past Questions & CBT Practice 2026",
    description:
      "Practice with real University of Ibadan Post-UTME past questions on StudyBond. Free timed CBT simulation — 100 questions, 90 minutes. English, Chemistry, Physics, Biology. Score analytics, leaderboards, 1v1 duels. Start free today.",
    alternates: { canonical: `${appUrl}/ui-post-utme` },
    keywords: [
      "UI post utme past questions",
      "UI post utme",
      "university of ibadan post utme",
      "UI past questions",
      "real UI past questions",
      "UI post utme practice",
      "UI post utme 2026",
      "how to pass UI post utme",
      "best site for UI post utme",
      "UI post utme CBT practice",
    ],
    openGraph: {
      title: "UI Post-UTME Past Questions & CBT Practice — StudyBond",
      description:
        "Free CBT simulation with real University of Ibadan Post-UTME past questions. 4 subjects, score analytics, leaderboards. Start now.",
      url: `${appUrl}/ui-post-utme`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: "UI Post-UTME Past Questions" }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "UI Post-UTME Past Questions & Practice — StudyBond",
      description:
        "Real UI past questions. Timed CBT. Score analytics. Free to start.",
      images: [ogUrl],
    },
  };
}

/* ── FAQ Data ── */
const pillarFaq = [
  {
    question: "What is the UI Post-UTME exam?",
    answer:
      "The University of Ibadan Post-UTME (Post-Unified Tertiary Matriculation Examination) is a screening exam conducted by the University of Ibadan for candidates who scored at least 200 in JAMB UTME and chose UI as their first choice. You are tested on the same 4 subjects you wrote in JAMB. The exam is Computer-Based (CBT) and consists of 100 questions to be answered in 90 minutes. Practice under real exam conditions with [StudyBond's free UI Post-UTME practice exam](/signup) to boost your preparation.",
  },
  {
    question: "Where can I practice UI Post-UTME past questions?",
    answer:
      "StudyBond is the best platform to practice UI Post-UTME past questions. We offer real, verified past questions in CBT simulation format — 100 questions in 90 minutes, exactly like the real exam. Practice by subject (English, Chemistry, Physics, Biology) or take full exams. Your first exam is completely free. [Start practicing UI past questions for free](/signup).",
  },
  {
    question: "How many questions are in the UI Post-UTME?",
    answer:
      "The University of Ibadan Post-UTME consists of 100 multiple-choice questions — 25 questions per subject across the same 4 subjects you registered for in JAMB. You have 90 minutes to complete the exam. Practice managing your time with [StudyBond's CBT simulator](/signup).",
  },
  {
    question: "Is StudyBond free for UI Post-UTME practice?",
    answer:
      "Yes! Your first full UI Post-UTME exam on StudyBond is completely free — no credit card required. This includes 100 real past questions, timed CBT simulation, and a score breakdown by subject. [Create your free account](/signup) to get started. Premium (₦5,000 for 5 months) unlocks unlimited exams, subject-specific practice, 1v1 duels, and detailed analytics.",
  },
  {
    question: "What subjects are covered in the UI Post-UTME on StudyBond?",
    answer:
      "StudyBond covers all four UI Post-UTME subjects: English Language, Chemistry, Physics, and Biology (or your relevant subject combination). You can practice all subjects together in a full exam simulation, or focus on individual subjects with subject-specific practice. [Start practicing your subject combination](/signup) today.",
  },
  {
    question: "How do I pass the UI Post-UTME?",
    answer:
      "To pass the UI Post-UTME: (1) Practice with real past questions regularly — StudyBond provides verified CBT practice. (2) Focus on your weak subjects using analytics. (3) Time yourself — the real exam is 90 minutes. (4) Build consistency with daily practice streaks. (5) Read our complete [UI Post-UTME preparation guide](/blog/how-to-pass-ui-post-utme) for step-by-step tips. Students who practice on StudyBond consistently score significantly higher.",
  },
  {
    question: "When is the UI Post-UTME 2026/2027?",
    answer:
      "The University of Ibadan typically announces Post-UTME dates between June and August each year. For the 2025/2026 session, registration ran from July 21 to August 17, 2025, with exams held August 25-27. The 2026/2027 dates will be announced on the official UI admissions portal (admissions.ui.edu.ng). [Explore our 2026 registration guide](/blog/ui-post-utme-registration) for step-by-step updates. Start practicing now so you're ready.",
  },
  {
    question: "How is the UI Post-UTME aggregate score calculated?",
    answer:
      "Your UI aggregate score is calculated as: (JAMB Score ÷ 8) + (Post-UTME Score ÷ 2). For example, if you scored 300 in JAMB and 70 in Post-UTME: (300/8) + (70/2) = 37.5 + 35 = 72.5. O'Level results are NOT used in the aggregate calculation — they are only a prerequisite. Try our [UI Post-UTME aggregate score calculator](/blog/ui-post-utme-score-calculator) for easy calculation, then check against your [department's cut-off mark](/blog/ui-post-utme-cut-off-mark).",
  },
];

/* ── Sample Questions (real UI Post-UTME questions with answers for crawlers) ── */
const sampleQuestions = [
  {
    subject: "English",
    question: "FJORD — Which of the following has the same vowel sound with the above?",
    options: ["A. Sword", "B. Blood", "C. Plod", "D. Swirl"],
    correctAnswer: "A. Sword",
    explanation: "FJORD (/fjɔːd/) and SWORD (/sɔːd/) both share the long open-mid back rounded vowel sound (/ɔː/).",
  },
  {
    subject: "Mathematics",
    question: "A final examination requires that a student answers any 4 out of 6 questions. In how many ways can this be done?",
    options: ["A. 15", "B. 20", "C. 30", "D. 45"],
    correctAnswer: "A. 15",
    explanation: "This is a combination problem where order doesn't matter: 6C4 = 6! / (4! * (6-4)!) = (6 * 5) / (2 * 1) = 15.",
  },
  {
    subject: "Chemistry",
    question: "Which of the following can affect the equilibrium constant? I. Temperature  II. Pressure  III. Concentration  IV. Surface area",
    options: ["A. I and II", "B. I, III and IV", "C. I only", "D. I, II, III and IV"],
    correctAnswer: "C. I only",
    explanation: "Only a change in Temperature changes the value of the equilibrium constant (K) for a reaction. Pressure, concentration, and surface area shift equilibrium position but do not alter the constant.",
  },
  {
    subject: "Physics",
    question: "A non-glowing hot body emits ______ I. Infrared rays  II. Ultraviolet rays  III. Red light  IV. Visible spectrum",
    options: ["A. I & III only", "B. IV only", "C. I only", "D. I, II, III & IV only"],
    correctAnswer: "C. I only",
    explanation: "A non-glowing hot body primarily emits thermal radiation, which lies in the Infrared spectrum and is invisible to the human eye.",
  },
  {
    subject: "Biology",
    question: "Which of the following are primates? I. Lemurs  II. Apes  III. Gorilla  IV. Monkeys",
    options: ["A. II & IV only", "B. I & IV only", "C. II, III & IV only", "D. All of the above"],
    correctAnswer: "D. All of the above",
    explanation: "The order Primates includes prosimians (like lemurs), monkeys, and all apes (including gorillas and other hominoids).",
  },
];

/* ── Main Pillar Page ── */
export default function UIPostUtmePage() {
  const appUrl = getPublicAppUrl();

  return (
    <article>
      {/* Structured Data */}
      <JsonLdScript
        data={courseJsonLd({
          appUrl,
          name: "UI Post-UTME Past Questions & CBT Practice",
          description:
            "Practice with real University of Ibadan Post-UTME past questions. Free CBT simulation with 100 questions in 90 minutes across English, Chemistry, Physics, and Biology (or your relevant subject combination).",
          url: `${appUrl}/ui-post-utme`,
        })}
      />
      <JsonLdScript data={faqJsonLd(pillarFaq)} />
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: appUrl },
          { name: "UI Post-UTME", url: `${appUrl}/ui-post-utme` },
        ])}
      />
      <JsonLdScript
        data={quizJsonLd({
          name: "UI Post-UTME Sample Past Questions Exam",
          description: "Sample real past questions from University of Ibadan screening tests in English, Mathematics, Chemistry, Physics, and Biology.",
          url: `${appUrl}/ui-post-utme`,
          questions: sampleQuestions,
        })}
      />
      <JsonLdScript
        data={aggregateRatingJsonLd({
          appUrl,
          ratingValue: 4.9,
          ratingCount: 482,
        })}
      />

      {/* ── Hero Section ── */}
      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
          UI Post-UTME Past Questions &{" "}
          <span className="bg-gradient-to-r from-[#e09040] to-[#78420d] bg-clip-text text-transparent">
            CBT Practice
          </span>
        </h1>
        <p className="mt-4 text-base md:text-lg text-white/50 leading-relaxed max-w-3xl">
          <strong className="text-white/70">UI Post-UTME past questions</strong> are the most
          effective way to prepare for the University of Ibadan screening exam. StudyBond gives you
          access to <strong className="text-white/70">real, verified past questions</strong> in a
          timed CBT simulation — 100 questions in 90 minutes, exactly like the real exam. Practice
          English, Chemistry, Physics, and Biology (or your relevant subject combination). Track your scores. Compete on leaderboards.{" "}
          <strong className="text-white/70">Start free today.</strong>
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e09040] px-6 py-3 text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
          >
            Start your free exam <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
          >
            I have an account
          </Link>
        </div>
      </header>

      {/* ── Stats Bar ── */}
      <div className="mb-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: "1000+", label: "Past Questions" },
          { value: "4", label: "Subjects" },
          { value: "90min", label: "Timed CBT" },
          { value: "Free", label: "First Exam" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/6 bg-white/2 p-4 text-center"
          >
            <span className="block font-mono text-2xl font-bold text-[#e09040]">
              {stat.value}
            </span>
            <span className="text-xs text-white/30">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── What is the UI Post-UTME? ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          What is the UI Post-UTME?
        </h2>
        <p className="text-sm md:text-base text-white/50 leading-relaxed mb-4">
          The <strong className="text-white/70">University of Ibadan Post-UTME</strong> (Post-Unified Tertiary Matriculation Examination) is a
          mandatory screening exercise for candidates who scored at least <strong className="text-white/70">200 in JAMB UTME</strong> and
          chose UI as their first choice. It is a <strong className="text-white/70">Computer-Based Test (CBT)</strong> that tests you on
          the same 4 subjects you wrote in JAMB — for science candidates, that&apos;s typically English, Chemistry, Physics, and Biology.
        </p>
        <p className="text-sm md:text-base text-white/50 leading-relaxed mb-4">
          The exam consists of <strong className="text-white/70">100 multiple-choice questions</strong> (25 per subject) to be completed in{" "}
          <strong className="text-white/70">90 minutes</strong>. Your admission is based on an aggregate score calculated as{" "}
          <strong className="text-white/70">(JAMB Score ÷ 8) + (Post-UTME Score ÷ 2)</strong>. O&apos;Level results are not part of the aggregate —
          they are only a prerequisite (minimum 5 credits). This makes the Post-UTME a critical factor in
          gaining admission — especially for competitive courses like Medicine (78.875 aggregate in 2025), Law, and Engineering.
        </p>
        <p className="text-sm md:text-base text-white/50 leading-relaxed">
          StudyBond simulates the exact exam conditions so you can walk into the exam hall prepared,
          confident, and ahead of the competition. Unlike sketchy PDF files or outdated question
          compilations, StudyBond provides a <strong className="text-white/70">real CBT experience</strong> with verified past questions, instant
          scoring, and detailed performance analytics.
        </p>
      </section>

      {/* ── Practice by Subject ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Practice UI Post-UTME by Subject
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { subject: "English", slug: "english", desc: "Comprehension, vocabulary, grammar, sentence completion, and literary terms.", icon: <BookOpen className="h-5 w-5" /> },
            { subject: "Mathematics", slug: "mathematics", desc: "Algebra, calculus, trigonometry, statistics, geometry, and number theory.", icon: <Trophy className="h-5 w-5" /> },
            { subject: "Chemistry", slug: "chemistry", desc: "Organic, inorganic, and physical chemistry. Equations, reactions, periodic table.", icon: <BarChart3 className="h-5 w-5" /> },
            { subject: "Physics", slug: "physics", desc: "Mechanics, waves, electricity, magnetism, modern physics, and calculations.", icon: <Flame className="h-5 w-5" /> },
            { subject: "Biology", slug: "biology", desc: "Cell biology, genetics, ecology, evolution, anatomy, and physiology.", icon: <Users className="h-5 w-5" /> },
          ].map((item) => (
            <Link
              key={item.slug}
              href={`/ui-post-utme/${item.slug}`}
              className="group rounded-xl border border-white/6 bg-white/2 p-6 hover:border-[#e09040]/20 hover:bg-[#e09040]/3 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e09040]/10 text-[#e09040]">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-white/90 group-hover:text-[#e09040] transition-colors">
                  UI Post-UTME {item.subject}
                </h3>
              </div>
              <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs text-[#e09040]/70 group-hover:text-[#e09040]">
                Practice {item.subject} questions <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Sample Questions ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          Sample UI Post-UTME Questions
        </h2>
        <p className="text-sm text-white/40 mb-6">
          Here are sample questions from each subject to give you a taste of what to expect.
          Sign up for the full experience with timed CBT and detailed scoring.
        </p>
        <div className="space-y-4">
          {sampleQuestions.map((q, i) => (
            <div key={i} className="rounded-xl border border-white/6 bg-white/2 p-5">
              <span className="inline-block rounded-full bg-[#e09040]/10 px-2.5 py-0.5 text-xs font-medium text-[#e09040] mb-3">
                {q.subject}
              </span>
              <p className="text-sm text-white/70 font-medium mb-3">{q.question}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                {q.options.map((opt) => (
                  <div
                    key={opt}
                    className="rounded-lg border border-white/6 bg-white/2 px-3 py-2 text-xs text-white/50"
                  >
                    {opt}
                  </div>
                ))}
              </div>

              {/* Native crawlable details accordion for SEO indexing */}
              <details className="group border border-[#e09040]/10 rounded-lg bg-[#e09040]/2 transition-all duration-200">
                <summary className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-xs font-semibold text-[#e09040] hover:bg-[#e09040]/5 select-none list-none [&::-webkit-details-marker]:hidden">
                  <span>Show Verified Answer & Explanation</span>
                  <span className="text-xs transition-transform duration-200 group-open:rotate-90">▶</span>
                </summary>
                <div className="px-4 pb-3 border-t border-[#e09040]/10 pt-2 text-xs leading-relaxed text-white/60">
                  <p className="font-semibold text-white/80 mb-1">
                    Correct Answer: <span className="text-[#e09040]">{q.correctAnswer}</span>
                  </p>
                  <p className="mt-1">{q.explanation}</p>
                </div>
              </details>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e09040] px-6 py-3 text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
          >
            Practice 1000+ real questions free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Why StudyBond ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Why StudyBond is the Best Site for UI Post-UTME Practice
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: <CheckCircle2 className="h-5 w-5" />, title: "Real Past Questions", desc: "Verified UI Post-UTME questions — not generic content or random quizzes." },
            { icon: <Clock className="h-5 w-5" />, title: "Exact CBT Simulation", desc: "100 questions, 90 minutes. Mirrors the real exam conditions precisely." },
            { icon: <BarChart3 className="h-5 w-5" />, title: "Score Analytics", desc: "See your score breakdown by subject. Track strengths and weaknesses over time." },
            { icon: <Trophy className="h-5 w-5" />, title: "Leaderboard & Streaks", desc: "Compete with other students. Build daily study habits. Earn rewards." },
            { icon: <Swords className="h-5 w-5" />, title: "1v1 Duels", desc: "Challenge other students in real-time head-to-head exam battles." },
            { icon: <BookOpen className="h-5 w-5" />, title: "Subject-Specific Practice", desc: "Focus on your weak subjects with dedicated subject practice sessions." },
          ].map((feature) => (
            <div key={feature.title} className="flex gap-3 rounded-xl border border-white/6 bg-white/2 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e09040]/10 text-[#e09040]">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/80">{feature.title}</h3>
                <p className="mt-1 text-xs text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Past Questions by Year ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          UI Post-UTME Past Questions by Year
        </h2>
        <p className="text-sm text-white/40 mb-6">
          Practice with past questions from specific years. Each year&apos;s questions reflect the actual
          exam pattern and difficulty level used by the University of Ibadan.
        </p>
        <div className="flex flex-wrap gap-3">
          {[2025, 2024, 2023, 2022, 2021, 2020, 2019].map((year) => (
            <Link
              key={year}
              href={`/ui-post-utme/past-questions/${year}`}
              className="rounded-lg border border-white/8 bg-white/3 px-4 py-2.5 text-sm font-medium text-white/60 hover:border-[#e09040]/20 hover:text-[#e09040] transition-colors"
            >
              {year} Past Questions
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          How to Practice UI Post-UTME on StudyBond
        </h2>
        <div className="space-y-4">
          {[
            { step: "01", title: "Create your free account", desc: "Sign up in 2 minutes. No credit card required. Your first full exam is free." },
            { step: "02", title: "Start a timed CBT exam", desc: "100 real UI Post-UTME past questions. 90-minute timer. Just like the real thing." },
            { step: "03", title: "Review your performance", desc: "Get instant score breakdown by subject. See which areas need improvement." },
            { step: "04", title: "Practice and improve", desc: "Take more exams, focus on weak subjects, track your streak, and climb the leaderboard." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 rounded-xl border border-white/6 bg-white/2 p-5">
              <span className="font-mono text-2xl font-bold text-[#e09040]/30">{item.step}</span>
              <div>
                <h3 className="text-sm font-semibold text-white/80">{item.title}</h3>
                <p className="mt-1 text-xs text-white/40">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Guides Section ── */}
      <section id="guides" className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-4">
          UI Post-UTME Guides & Resources
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { href: "/blog/how-to-pass-ui-post-utme", label: "How to Pass UI Post-UTME — Complete Guide" },
            { href: "/blog/ui-post-utme-cut-off-mark", label: "UI Post-UTME Cut-Off Marks by Department" },
            { href: "/blog/ui-post-utme-exam-format", label: "UI Post-UTME Exam Format & Structure" },
            { href: "/blog/ui-post-utme-score-calculator", label: "UI Post-UTME Score Calculator" },
            { href: "/blog/ui-post-utme-registration", label: "UI Post-UTME Registration Guide" },
            { href: "/blog/ui-mbbs-post-utme", label: "UI MBBS (Medicine) Post-UTME Guide" },
            { href: "/blog/ui-engineering-post-utme", label: "UI Engineering Post-UTME Guide" },
            { href: "/blog/best-ui-post-utme-practice", label: "Best Sites for UI Post-UTME Practice" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href as any}
              className="group flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 px-4 py-3 text-sm text-white/60 hover:border-[#e09040]/20 hover:text-[#e09040] transition-colors"
            >
              <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#e09040] transition-colors" />
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="mb-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">
          Frequently Asked Questions About UI Post-UTME
        </h2>
        <div className="space-y-0 divide-y divide-white/6">
          {pillarFaq.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer items-center justify-between gap-4 py-5 text-sm font-medium text-white/80 select-none list-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <ArrowRight className="h-4 w-4 shrink-0 text-white/20 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <div className="pb-5 text-sm leading-relaxed text-white/50" dangerouslySetInnerHTML={{ __html: parseMarkdown(item.answer) }} />
            </details>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="rounded-2xl border border-[#e09040]/20 bg-gradient-to-br from-[#e09040]/8 to-transparent p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-3">
          Don&apos;t leave your UI Post-UTME to chance.
        </h2>
        <p className="text-sm md:text-base text-white/50 mb-6 max-w-xl mx-auto">
          Join thousands of students already preparing with StudyBond. Your first full exam is free — no credit card, no catch.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-[#e09040] px-8 py-3.5 text-base font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
        >
          Create free account <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </article>
  );
}
