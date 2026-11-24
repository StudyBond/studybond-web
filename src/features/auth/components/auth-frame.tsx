import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/* The frame every auth page shares: logo and one link on top, the page's
   content in a narrow column, and a panel on the right on laptops. The
   panel holds the homepage headline unless a page gives its own (sign-up
   shows the candidate slip). Styles: features/auth/auth.css. */

export function AuthFrame({
  topQuestion,
  topLabel,
  topHref,
  side,
  sideLabel,
  children,
}: {
  topQuestion?: string;
  topLabel: string;
  topHref: string;
  side?: ReactNode;
  /* Read out for a side that carries information; a decorative side is hidden. */
  sideLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="au-shell">
      <div className="au-main">
        <header className="au-top">
          <Link className="au-logo" href="/" aria-label="StudyBond home">
            <Image src="/studybond-logo.png" alt="" width={28} height={28} priority />
            <span>
              Study<b>Bond</b>
            </span>
          </Link>
          <p className="au-top-link">
            {topQuestion ? <span className="au-top-q">{topQuestion}</span> : null}
            <Link href={topHref as Route}>{topLabel}</Link>
          </p>
        </header>
        <div className="au-body">{children}</div>
      </div>
      <aside className="au-side" aria-label={sideLabel} aria-hidden={sideLabel ? undefined : true}>
        {side ?? <AuthClaim />}
      </aside>
    </div>
  );
}

export function AuthClaim() {
  return (
    <div className="au-side-in au-claim">
      <h2>
        Outsmart <span>the Exam.</span>
        <br />
        Outrank the Rest.
      </h2>
      <p>Real past questions and timed CBT practice, each exam kept on its own.</p>
    </div>
  );
}

/* The same headline, small, at the top of a phone screen. */
export function PhoneClaim() {
  return (
    <p className="au-mclaim" aria-hidden="true">
      Outsmart <span>the Exam.</span>
      <br />
      Outrank the Rest.
    </p>
  );
}

export function AuthHead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="au-head">
      <h1>{title}</h1>
      {children}
    </div>
  );
}
