import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Calendar, Clock } from "lucide-react";
import { notFound } from "next/navigation";
import { getPublicAppUrl } from "@/lib/env/server";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { articleJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { getArticle, getAllSlugs } from "@/lib/seo/blog-content";

/* ── Static Params ── */
export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

/* ── Metadata ── */
type BlogPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  const appUrl = getPublicAppUrl();
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `${appUrl}/blog/${slug}` },
    keywords: article.keywords,
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url: `${appUrl}/blog/${slug}`,
      type: "article",
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      authors: ["StudyBond"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
    },
  };
}

/* ── Page ── */
export default async function BlogPage({ params }: BlogPageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const appUrl = getPublicAppUrl();

  // Calculate estimated read time
  const totalWords = article.sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0);
  const readTime = Math.max(3, Math.ceil(totalWords / 200));

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Structured Data */}
      <JsonLdScript
        data={articleJsonLd({
          title: article.title,
          description: article.metaDescription,
          url: `${appUrl}/blog/${slug}`,
          datePublished: article.datePublished,
          dateModified: article.dateModified,
          appUrl,
        })}
      />
      <JsonLdScript data={faqJsonLd(article.faq)} />
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: appUrl },
          { name: "Blog", url: `${appUrl}/blog` },
          { name: article.title, url: `${appUrl}/blog/${slug}` },
        ])}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mx-auto max-w-3xl px-5 pt-6 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-white/40 flex-wrap">
          <li><Link href="/" className="hover:text-[#e09040] transition-colors">Home</Link></li>
          <li><ArrowRight className="h-3 w-3" /></li>
          <li><Link href={"/ui-post-utme" as any} className="hover:text-[#e09040] transition-colors">UI Post-UTME</Link></li>
          <li><ArrowRight className="h-3 w-3" /></li>
          <li className="text-white/60 truncate max-w-48">{article.title}</li>
        </ol>
      </nav>

      <article className="mx-auto max-w-3xl px-5 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4 text-xs text-white/40">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Updated {new Date(article.dateModified).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {readTime} min read
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-base text-white/50 leading-relaxed">
            {article.metaDescription}
          </p>
        </header>

        {/* Table of Contents */}
        <nav className="mb-10 rounded-xl border border-white/6 bg-white/2 p-5">
          <h2 className="text-sm font-semibold text-white/70 mb-3">In this guide:</h2>
          <ol className="space-y-1.5">
            {article.sections.map((section, i) => (
              <li key={i}>
                <a
                  href={`#section-${i}`}
                  className="text-sm text-white/50 hover:text-[#e09040] transition-colors"
                >
                  {i + 1}. {section.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* Article Sections */}
        <div className="space-y-10">
          {article.sections.map((section, i) => (
            <section key={i} id={`section-${i}`}>
              <h2 className="text-xl font-bold tracking-tight mb-4">{section.heading}</h2>
              <div className="prose-custom text-sm md:text-base text-white/55 leading-relaxed">
                {section.content.split("\n\n").map((block, bi) => {
                  const bold = (s: string) =>
                    s.replace(/\*\*(.+?)\*\*/g, "<strong class='text-white/70 font-semibold'>$1</strong>");

                  const lines = block.split("\n");

                  // Pure dash list (every line starts with "- ")
                  const allDash = lines.every((l) => l.startsWith("- ") || l.trim() === "");
                  if (allDash) {
                    return (
                      <ul key={bi} className="mb-4 space-y-1.5 list-none">
                        {lines.filter((l) => l.startsWith("- ")).map((line, li) => (
                          <li key={li} className="flex items-start gap-2 text-white/50">
                            <span className="text-[#e09040]/60 mt-0.5 shrink-0">•</span>
                            <span dangerouslySetInnerHTML={{ __html: bold(line.slice(2)) }} />
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  // Mixed: header line(s) followed by dash list items
                  const dashStart = lines.findIndex((l) => l.startsWith("- "));
                  if (dashStart > 0 && lines.slice(dashStart).every((l) => l.startsWith("- ") || l.trim() === "")) {
                    const header = lines.slice(0, dashStart).join(" ");
                    const items = lines.slice(dashStart).filter((l) => l.startsWith("- "));
                    return (
                      <div key={bi} className="mb-4">
                        <p className="mb-2" dangerouslySetInnerHTML={{ __html: bold(header) }} />
                        <ul className="space-y-1.5 list-none">
                          {items.map((line, li) => (
                            <li key={li} className="flex items-start gap-2 text-white/50">
                              <span className="text-[#e09040]/60 mt-0.5 shrink-0">•</span>
                              <span dangerouslySetInnerHTML={{ __html: bold(line.slice(2)) }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  }

                  // Numbered list (lines starting with "1. ", "2. ", etc.)
                  const isNumbered = lines.every((l) => /^\d+\.\s/.test(l) || l.trim() === "");
                  if (isNumbered) {
                    return (
                      <ol key={bi} className="mb-4 space-y-2 list-none">
                        {lines.filter((l) => /^\d+\.\s/.test(l)).map((line, li) => (
                          <li key={li} className="flex items-start gap-2.5 text-white/50">
                            <span className="font-mono text-xs text-[#e09040]/50 mt-0.5 shrink-0 min-w-[1.25rem]">{li + 1}.</span>
                            <span dangerouslySetInnerHTML={{ __html: bold(line.replace(/^\d+\.\s*/, "")) }} />
                          </li>
                        ))}
                      </ol>
                    );
                  }

                  // Regular paragraph
                  return (
                    <p key={bi} className="mb-4" dangerouslySetInnerHTML={{ __html: bold(block) }} />
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Mid-article CTA */}
        <div className="my-10 rounded-xl border border-[#e09040]/20 bg-[#e09040]/5 p-6">
          <p className="text-sm font-semibold text-white/80 mb-2">
            Ready to start practicing?
          </p>
          <p className="text-xs text-white/40 mb-4">
            Your first full UI Post-UTME exam is free — 100 real questions, 90-minute CBT, instant scoring.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-[#e09040] px-5 py-2.5 text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
          >
            Start practicing free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* FAQ */}
        {article.faq.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
            <div className="divide-y divide-white/6">
              {article.faq.map((item) => (
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
        )}

        {/* Related Links */}
        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4">Related Resources</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href={"/ui-post-utme" as any} className="group flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 px-4 py-3 text-sm text-white/60 hover:border-[#e09040]/20 hover:text-[#e09040] transition-colors">
              <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#e09040]" /> UI Post-UTME Past Questions
            </Link>
            <Link href={"/ui-post-utme/english" as any} className="group flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 px-4 py-3 text-sm text-white/60 hover:border-[#e09040]/20 hover:text-[#e09040] transition-colors">
              <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#e09040]" /> English Past Questions
            </Link>
            <Link href={"/ui-post-utme/chemistry" as any} className="group flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 px-4 py-3 text-sm text-white/60 hover:border-[#e09040]/20 hover:text-[#e09040] transition-colors">
              <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#e09040]" /> Chemistry Past Questions
            </Link>
            <Link href={"/blog/how-to-pass-ui-post-utme" as any} className="group flex items-center gap-2 rounded-lg border border-white/6 bg-white/2 px-4 py-3 text-sm text-white/60 hover:border-[#e09040]/20 hover:text-[#e09040] transition-colors">
              <ArrowRight className="h-3.5 w-3.5 text-white/20 group-hover:text-[#e09040]" /> How to Pass UI Post-UTME
            </Link>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-2xl border border-[#e09040]/20 bg-gradient-to-br from-[#e09040]/8 to-transparent p-8 text-center">
          <h2 className="text-xl font-bold tracking-tight mb-2">
            Practice makes admission.
          </h2>
          <p className="text-sm text-white/40 mb-5">
            Join thousands of students preparing for UI Post-UTME on StudyBond. Free to start.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-[#e09040] px-6 py-3 text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
          >
            Create free account <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Back link */}
        <div className="mt-8">
          <Link href={"/ui-post-utme" as any} className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-[#e09040] transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to UI Post-UTME
          </Link>
        </div>
      </article>
    </div>
  );
}
