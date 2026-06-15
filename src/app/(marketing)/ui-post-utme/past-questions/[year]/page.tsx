import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicAppUrl } from "@/lib/env/server";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";

/* ── Valid years ── */
const validYears = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;
type ValidYear = (typeof validYears)[number];

const currentYear = 2026;

/* ── Year-specific content ── */
function getYearContent(year: number) {
  const isCurrent = year >= currentYear;
  if (year === 2026) {
    return {
      intro: `The University of Ibadan (UI) Post-UTME 2026/2027 registration form is officially OUT! The admissions portal opens on Monday, 22 June 2026 and closes on Sunday, 19 July 2026. The CBT screening exams will take place from Monday, 27 July 2026 to Wednesday, 29 July, 2026. UI Registrar G. O. Saliu has stated there will be no extension of the registration period. Start preparing immediately by practicing with real UI past questions. StudyBond's exact CBT simulation (100 questions, 90 minutes) is designed to help you score high and secure admission.`,
      faq: [
        {
          question: "Is the UI Post-UTME 2026 registration form out?",
          answer: "Yes! The University of Ibadan has officially released the Post-UTME form for the 2026/2027 academic session. Registration starts Monday, June 22, 2026, and closes Sunday, July 19, 2026. Register only on admissions.ui.edu.ng before the deadline.",
        },
        {
          question: "When is the UI Post-UTME 2026 exam date?",
          answer: "The computer-based (CBT) screening exam is scheduled to run from Monday, July 27, 2026, to Wednesday, July 29, 2026. Start practicing now with [StudyBond's timed exams](/signup) to build speed and accuracy.",
        },
        {
          question: "What is the registration deadline for UI Post-UTME 2026?",
          answer: "The registration portal closes on Sunday, July 19, 2026. The Registrar has confirmed that there will be no extensions to this registration period.",
        },
      ],
    };
  }

  return {
    intro: isCurrent
      ? `The University of Ibadan Post-UTME ${year} screening exam is ${year === currentYear ? "expected later this year" : "upcoming"}. Start preparing now with real past questions from previous years on StudyBond. Our CBT simulation mirrors the exact format — 100 questions, 90 minutes, 4 subjects. Students who practice consistently on StudyBond score significantly higher.`
      : `Practice with real UI Post-UTME ${year} past questions on StudyBond. These are verified questions from the ${year} University of Ibadan screening exam, presented in timed CBT format. Use these to understand the exam pattern, identify frequently tested topics, and benchmark your performance against the actual difficulty level of that year's exam.`,
    faq: [
      {
        question: `Where can I find UI Post-UTME ${year} past questions?`,
        answer: `StudyBond provides real UI Post-UTME ${year} past questions in CBT simulation format. Practice with timed exams, get instant scoring, and track your performance by subject. Your first exam is free.`,
      },
      {
        question: `How many questions were in the UI Post-UTME ${year}?`,
        answer: `The UI Post-UTME ${year} consisted of 100 multiple-choice questions across 4 subjects (English, Chemistry, Physics, Biology) to be completed in 90 minutes. StudyBond simulates this exact format.`,
      },
      {
        question: `What was the UI Post-UTME ${year} cut-off mark?`,
        answer: `Cut-off marks vary by course. Competitive courses like Medicine and Law typically require higher aggregate scores. Check our cut-off marks guide for department-specific details.`,
      },
    ],
  };
}

/* ── Static Params ── */
export function generateStaticParams() {
  return validYears.map((year) => ({ year: String(year) }));
}

/* ── Metadata ── */
type YearPageProps = { params: Promise<{ year: string }> };

export async function generateMetadata({ params }: YearPageProps): Promise<Metadata> {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!validYears.includes(year as ValidYear)) return {};

  const appUrl = getPublicAppUrl();
  const title = `UI Post-UTME ${year} Past Questions`;
  const description = `Practice with real University of Ibadan Post-UTME ${year} past questions on StudyBond. Free timed CBT simulation with 100 questions in 90 minutes. English, Chemistry, Physics, Biology.`;
  const ogUrl = `${appUrl}/api/og?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    alternates: { canonical: `${appUrl}/ui-post-utme/past-questions/${year}` },
    keywords: [
      `UI post utme ${year}`,
      `UI post utme ${year} past questions`,
      `university of ibadan post utme ${year}`,
      `UI past questions ${year}`,
      ...(year === 2026 ? [
        "ui 2026 post utme date",
        "ui post utme 2026 date",
        "ui post utme exam date 2026",
        "is ui post utme form out 2026",
        "ui post utme 2026 registration date",
        "ui post utme registration deadline 2026",
        "ui post utme registration portal 2026",
        "university of ibadan post utme 2026/2027 form",
        "ui post utme form 2026",
      ] : []),
    ],
    openGraph: {
      title: `${title} — StudyBond`,
      description: `Real UI Post-UTME ${year} past questions in CBT format. Practice free on StudyBond.`,
      url: `${appUrl}/ui-post-utme/past-questions/${year}`,
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — StudyBond`,
      description: `Real UI Post-UTME ${year} past questions in CBT format. Practice free on StudyBond.`,
      images: [ogUrl],
    },
  };
}

/* ── Page ── */
export default async function YearPage({ params }: YearPageProps) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!validYears.includes(year as ValidYear)) notFound();

  const appUrl = getPublicAppUrl();
  const content = getYearContent(year);
  const adjacentYears = validYears.filter((y) => y !== year);
  const isCurrent = year >= currentYear;

  return (
    <article>
      {/* Structured Data */}
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: appUrl },
          { name: "UI Post-UTME", url: `${appUrl}/ui-post-utme` },
          { name: `${year} Past Questions`, url: `${appUrl}/ui-post-utme/past-questions/${year}` },
        ])}
      />
      <JsonLdScript data={faqJsonLd(content.faq)} />

      {/* Hero */}
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e09040]/20 bg-[#e09040]/5 px-3 py-1 text-xs font-medium text-[#e09040] mb-4">
          <Calendar className="h-3.5 w-3.5" /> {year} Exam
        </div>

        {/* Banner for old years pointing to current */}
        {!isCurrent && (
          <div className="mb-4 rounded-lg border border-[#e09040]/15 bg-[#e09040]/5 px-4 py-3 text-sm text-white/60">
            Looking for the latest? →{" "}
            <Link href={`/ui-post-utme/past-questions/${currentYear}`} className="font-medium text-[#e09040] hover:underline">
              UI Post-UTME {currentYear} Past Questions
            </Link>
          </div>
        )}

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
          UI Post-UTME {year} Past Questions
        </h1>
        <p className="text-sm md:text-base text-white/50 leading-relaxed max-w-3xl">
          {content.intro}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e09040] px-6 py-3 text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
          >
            Practice {year} questions free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/ui-post-utme"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
          >
            ← All past questions
          </Link>
        </div>
      </header>

      {/* 2026 Official Schedule Info Box */}
      {year === 2026 && (
        <section className="mb-10 rounded-2xl border border-[#e09040]/30 bg-[#e09040]/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-lg font-bold text-white/95">Official UI Post-UTME 2026/2027 Timeline & Schedule</h2>
          </div>
          <p className="text-sm text-white/50 leading-relaxed mb-4">
            The University of Ibadan has officially announced the registration schedule and exam dates for the 2026/2027 academic session, signed by Registrar <strong>G. O. Saliu</strong>:
          </p>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
              <span className="text-white/40">Registration Opens</span>
              <span className="font-semibold text-white/80">Monday, 22 June 2026</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
              <span className="text-white/40">Registration Closes (Deadline)</span>
              <span className="font-bold text-[#e09040]">Sunday, 19 July 2026 (No Extension)</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-2 text-sm">
              <span className="text-white/40">Post-UTME Exam Date (CBT)</span>
              <span className="font-semibold text-white/80">Monday, 27 July – Wednesday, 29 July 2026</span>
            </div>
            <div className="flex justify-between pb-2 text-sm">
              <span className="text-white/40">Registration Portal</span>
              <span className="font-semibold text-white/80">
                <a href="https://admissions.ui.edu.ng" target="_blank" rel="noopener noreferrer" className="text-[#e09040] hover:underline font-semibold">
                  admissions.ui.edu.ng
                </a>
              </span>
            </div>
          </div>
        </section>
      )}

      {/* What to Expect */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          UI Post-UTME {year} Exam Format
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Questions", value: "100" },
            { label: "Duration", value: "90 min" },
            { label: "Format", value: "CBT" },
            { label: "Subjects", value: "4" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-white/6 bg-white/2 p-4 text-center">
              <span className="block font-mono text-xl font-bold text-[#e09040]">{item.value}</span>
              <span className="text-xs text-white/30">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Subjects */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          Subjects in the {year} UI Post-UTME
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "English Language", slug: "english", note: "Compulsory for all candidates" },
            { name: "Chemistry", slug: "chemistry", note: "Required for science courses" },
            { name: "Physics", slug: "physics", note: "Required for engineering & sciences" },
            { name: "Biology", slug: "biology", note: "Required for medical & life sciences" },
          ].map((subj) => (
            <Link
              key={subj.slug}
              href={`/ui-post-utme/${subj.slug}`}
              className="group rounded-xl border border-white/6 bg-white/2 p-4 hover:border-[#e09040]/20 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-4 w-4 text-[#e09040]/60" />
                <span className="text-sm font-semibold text-white/80 group-hover:text-[#e09040] transition-colors">{subj.name}</span>
              </div>
              <p className="text-xs text-white/35">{subj.note}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Preparation Tips for This Year */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          How to Prepare with {year} Past Questions
        </h2>
        <div className="space-y-3 text-sm text-white/50 leading-relaxed">
          <p>
            Practicing with <strong className="text-white/70">UI Post-UTME {year} past questions</strong> helps you understand the exact difficulty level, question patterns, and topic distribution of that year&apos;s exam. Here&apos;s how to use them effectively:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2">
            <li><strong className="text-white/70">Take a full timed exam first</strong> — Don&apos;t cherry-pick questions. Simulate real conditions with 100 questions in 90 minutes.</li>
            <li><strong className="text-white/70">Review your score by subject</strong> — StudyBond breaks down your performance so you know exactly where to focus.</li>
            <li><strong className="text-white/70">Retake to improve</strong> — Your first attempt sets a baseline. Aim to improve by 10-15% on retakes.</li>
            <li><strong className="text-white/70">Practice across multiple years</strong> — Don&apos;t rely on a single year. Each year has different emphasis areas.</li>
            <li><strong className="text-white/70">Focus on weak subjects</strong> — Use subject-specific practice (premium) to drill into your problem areas.</li>
          </ol>
        </div>
      </section>

      {/* Other Years */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          Other Years
        </h2>
        <div className="flex flex-wrap gap-2">
          {adjacentYears.map((y) => (
            <Link
              key={y}
              href={`/ui-post-utme/past-questions/${y}`}
              className="rounded-lg border border-white/8 bg-white/3 px-4 py-2 text-sm font-medium text-white/60 hover:border-[#e09040]/20 hover:text-[#e09040] transition-colors"
            >
              {y}
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-10">
        <h2 className="text-xl font-bold tracking-tight mb-4">
          UI Post-UTME {year} FAQ
        </h2>
        <div className="divide-y divide-white/6">
          {content.faq.map((item) => (
            <details key={item.question} className="group">
              <summary className="flex cursor-pointer items-center justify-between py-4 text-sm font-medium text-white/80 select-none list-none [&::-webkit-details-marker]:hidden">
                {item.question}
                <ArrowRight className="h-4 w-4 shrink-0 text-white/20 transition-transform duration-200 group-open:rotate-90" />
              </summary>
              <div className="pb-4 text-sm leading-relaxed text-white/50">{item.answer}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-[#e09040]/20 bg-gradient-to-br from-[#e09040]/8 to-transparent p-8 text-center">
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Start practicing UI Post-UTME {year} questions
        </h2>
        <p className="text-sm text-white/40 mb-5">
          Free first exam. Real past questions. Timed CBT. Instant scoring.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-xl bg-[#e09040] px-6 py-3 text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
        >
          Create free account <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </article>
  );
}
