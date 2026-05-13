import { ChevronRight } from "lucide-react";
import Link from "next/link";

const subjects = [
  { slug: "english", label: "English" },
  { slug: "mathematics", label: "Mathematics" },
  { slug: "chemistry", label: "Chemistry" },
  { slug: "physics", label: "Physics" },
  { slug: "biology", label: "Biology" },
] as const;

const years = [2025, 2024, 2023, 2022, 2021, 2020, 2019] as const;

const guides = [
  { slug: "how-to-pass-ui-post-utme", label: "How to Pass UI Post-UTME" },
  { slug: "ui-post-utme-cut-off-mark", label: "Cut-Off Marks" },
  { slug: "ui-post-utme-exam-format", label: "Exam Format" },
  { slug: "ui-post-utme-score-calculator", label: "Score Calculator" },
  { slug: "best-ui-post-utme-practice", label: "Best Practice Sites" },
  { slug: "ui-post-utme-registration", label: "Registration Guide" },
  { slug: "ui-mbbs-post-utme", label: "MBBS Guide" },
  { slug: "ui-engineering-post-utme", label: "Engineering Guide" },
] as const;

/**
 * Shared layout for all /ui-post-utme/* pages.
 * Provides breadcrumb navigation and sidebar with internal link mesh.
 */
export default function UIPostUtmeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="mx-auto max-w-6xl px-5 pt-6 pb-2"
      >
        <ol className="flex items-center gap-1.5 text-xs text-white/40">
          <li>
            <Link href="/" className="hover:text-[#e09040] transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="h-3 w-3" />
          </li>
          <li>
            <Link
              href="/ui-post-utme"
              className="hover:text-[#e09040] transition-colors"
            >
              UI Post-UTME
            </Link>
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-6xl px-5 py-8 lg:flex lg:gap-12">
        {/* Main content */}
        <main className="flex-1 min-w-0">{children}</main>

        {/* Sidebar — internal link mesh for topical authority */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="sticky top-8 space-y-8">
            {/* Subject links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
                Practice by Subject
              </h3>
              <ul className="space-y-1.5">
                {subjects.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/ui-post-utme/${s.slug}`}
                      className="block rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-[#e09040] transition-colors"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Year links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
                Past Questions by Year
              </h3>
              <ul className="space-y-1.5">
                {years.map((y) => (
                  <li key={y}>
                    <Link
                      href={`/ui-post-utme/past-questions/${y}`}
                      className="block rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-[#e09040] transition-colors"
                    >
                      {y} Past Questions
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Guide links */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-white/60 mb-3">
                Guides & Resources
              </h3>
              <ul className="space-y-1.5">
                {guides.map((g) => (
                  <li key={g.slug}>
                    <Link
                      href={`/blog/${g.slug}`}
                      className="block rounded-lg px-3 py-2 text-sm text-white/50 hover:bg-white/5 hover:text-[#e09040] transition-colors"
                    >
                      {g.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <div className="rounded-xl border border-[#e09040]/20 bg-[#e09040]/5 p-5">
              <p className="text-sm font-semibold text-white/80 mb-2">
                Ready to practice?
              </p>
              <p className="text-xs text-white/40 mb-4">
                Your first full UI Post-UTME exam is completely free.
              </p>
              <Link
                href="/signup"
                className="block w-full rounded-lg bg-[#e09040] py-2.5 text-center text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
              >
                Start practicing free →
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
