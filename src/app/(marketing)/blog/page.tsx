import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, BookOpen } from "lucide-react";
import { blogArticles } from "@/lib/seo/blog-content";
import { getPublicAppUrl } from "@/lib/env/server";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { breadcrumbJsonLd } from "@/lib/seo/json-ld";

export async function generateMetadata(): Promise<Metadata> {
  const appUrl = getPublicAppUrl();
  return {
    title: "UI Post-UTME Preparation Guides & Articles — StudyBond",
    description:
      "Access our complete library of University of Ibadan Post-UTME preparation guides, department cut-off marks, score calculation tutorials, and registration checklists.",
    alternates: { canonical: `${appUrl}/blog` },
    openGraph: {
      title: "UI Post-UTME Preparation Guides & Articles — StudyBond",
      description:
        "Access our complete library of University of Ibadan Post-UTME preparation guides, department cut-off marks, score calculation tutorials, and registration checklists.",
      url: `${appUrl}/blog`,
    },
  };
}

export default function BlogIndexPage() {
  const appUrl = getPublicAppUrl();
  const articles = Object.values(blogArticles);

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Structured Data */}
      <JsonLdScript
        data={breadcrumbJsonLd([
          { name: "Home", url: appUrl },
          { name: "Blog", url: `${appUrl}/blog` },
        ])}
      />

      <div className="mx-auto max-w-6xl px-5 py-10 md:py-16">
        {/* Header */}
        <header className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e09040]/20 bg-[#e09040]/5 px-3 py-1 text-xs font-medium text-[#e09040] mb-4">
            <BookOpen className="h-3.5 w-3.5" /> Prep Library
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            StudyBond{" "}
            <span className="bg-gradient-to-r from-[#e09040] to-[#78420d] bg-clip-text text-transparent">
              Guides & Insights
            </span>
          </h1>
          <p className="text-sm md:text-base text-white/50 leading-relaxed">
            Everything you need to know about the University of Ibadan Post-UTME screening, registration procedures, department cut-off marks, and study plans to secure your admission.
          </p>
        </header>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            // Calculate word count & read time dynamically
            const totalWords = article.sections.reduce((sum, s) => sum + s.content.split(/\s+/).length, 0);
            const readTime = Math.max(3, Math.ceil(totalWords / 200));

            return (
              <article
                key={article.slug}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/6 bg-white/2 p-6 hover:border-[#e09040]/25 hover:bg-[#e09040]/3 transition-all duration-300"
              >
                <div>
                  {/* Meta metadata info */}
                  <div className="flex items-center gap-3 mb-4 text-xs text-white/40">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(article.dateModified).toLocaleDateString("en-NG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {readTime} min read
                    </span>
                  </div>

                  <h2 className="text-lg font-bold tracking-tight text-white mb-2 group-hover:text-[#e09040] transition-colors line-clamp-2">
                    <Link href={`/blog/${article.slug}`}>
                      {article.title}
                    </Link>
                  </h2>
                  <p className="text-xs md:text-sm text-white/40 leading-relaxed line-clamp-3 mb-6">
                    {article.metaDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/6">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[#e09040] group-hover:translate-x-1 transition-transform"
                  >
                    Read full guide <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* CTA section */}
        <section className="mt-16 rounded-2xl border border-[#e09040]/20 bg-gradient-to-br from-[#e09040]/8 to-transparent p-8 md:p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            Practice with Real UI Post-UTME Past Questions
          </h2>
          <p className="text-sm text-white/40 mb-6 max-w-xl mx-auto">
            Reading guides is good, but practicing in an actual timed CBT environment is how you score 80%+. Start your first full exam for free.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-[#e09040] px-6 py-3 text-sm font-semibold text-[#09090b] hover:bg-[#e09040]/90 transition-colors"
            >
              Practice free exam <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/ui-post-utme"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/70 hover:bg-white/10 transition-colors"
            >
              Explore subjects
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
