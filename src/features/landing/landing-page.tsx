import type { BoardPremiumPlan } from "@/lib/premium/plans";
import { caveat } from "@/features/home/home-fonts";
import { SpacetimeField } from "./spacetime-field";
import { RotatingExamWord } from "./rotating-exam-word";
import { DemoQuestion } from "./demo-question";
import { LandingSections } from "./landing-sections";
import { LandingPricing } from "./landing-pricing";
import { LANDING_FAQ } from "./faq";

/* The homepage. Everything is rendered on the server; only the hero's grid,
   the changing exam word and the demo question run in the browser. The nav
   and footer come from the (marketing) layout. */

function ArrowIcon() {
  return (
    <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function LandingPage({ plans }: { plans: BoardPremiumPlan[] }) {
  return (
    <main className={`lp ${caveat.variable}`}>
      <section className="hero hero-left" id="top">
        <SpacetimeField />
        <div className="wrap">
          <div className="hero-in">
            <h1 className="g-word g-line">
              <span className="hl">
                <span className="l1">
                  Outsmart <RotatingExamWord />
                </span>{" "}
                <span className="l2">Outrank the Rest.</span>
              </span>
            </h1>
            <p className="hero-sub">
              Real past questions and timed CBT practice for <b>JAMB UTME</b> and the{" "}
              <b>University of Ibadan Post-UTME</b>. Each exam is kept on its own, so you only ever practise questions
              from the exam you&apos;re writing.
            </p>
            <div className="hero-cta">
              <a className="btn btn-p" href="/signup">
                Start free
                <ArrowIcon />
              </a>
              <a className="btn btn-s" href="#demo">
                Try a real question
              </a>
            </div>
            <p className="hero-note">
              <b>2,000+</b> students already on StudyBond
            </p>
          </div>
        </div>
      </section>

      <DemoQuestion />
      <LandingSections />
      <LandingPricing plans={plans} />

      <section className="sec" id="faq">
        <div className="wrap">
          <div className="sec-h">
            <h2>Questions students ask us.</h2>
          </div>
          <div className="faq">
            {LANDING_FAQ.map((item, i) => (
              <details key={item.question} open={i === 0}>
                <summary>
                  {item.question}
                  <svg className="ic" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p>
                  {item.lead ? <b>{item.lead} </b> : null}
                  {item.answer}
                  {item.tail ? <b> {item.tail}</b> : null}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="close">
        <div className="wrap">
          <div className="close-in">
            <div>
              <h2>
                Most students study.
                <br />
                <span>The ones who get in practise.</span>
              </h2>
              <p>Join 2,000+ students already on StudyBond.</p>
            </div>
            <a className="btn btn-p" href="/signup">
              Start free
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
