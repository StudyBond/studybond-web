import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

/* The nav and footer every public page shares (the (marketing) layout).
   Styles are in landing.css under .lp. The nav sits in the page flow; the
   homepage hero slides up under it so the grid runs to the top edge. */

function Logo() {
  return (
    <Link className="logo" href="/" aria-label="StudyBond home">
      <Image src="/studybond-logo.png" alt="" width={28} height={28} priority />
      <span>
        Study<b>Bond</b>
      </span>
    </Link>
  );
}

export function SiteNav() {
  return (
    <div className="lp lp-bar">
      <header className="wrap top">
        <nav className="nav" aria-label="Main">
          <Logo />
          <div className="nav-links">
            <Link href="/#exams">JAMB</Link>
            <Link href="/ui-post-utme">UI Post-UTME</Link>
            <Link href="/#duel">Duel</Link>
            <Link href="/#pricing">Pricing</Link>
            <Link href="/blog">Guides</Link>
          </div>
          <div className="nav-end">
            <Link className="nav-login" href="/login">
              Log in
            </Link>
            <Link className="btn btn-p btn-sm" href="/signup">
              Start free
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
}

export function SiteFooter() {
  return (
    <div className="lp">
      <footer className="wrap">
        <div className="foot">
          <div className="foot-top">
            <div className="foot-about">
              <Logo />
              <p>
                Real past questions and CBT practice for JAMB UTME and the UI Post-UTME. One exam at a time, never
                mixed.
              </p>
            </div>
            <div className="foot-cols">
              <div className="foot-col">
                <h3>Exams</h3>
                <Link href="/#exams">JAMB UTME</Link>
                <Link href="/ui-post-utme">UI Post-UTME</Link>
                <Link href="/blog/ui-post-utme-cut-off-mark">UI cut-off marks</Link>
              </div>
              <div className="foot-col">
                <h3>StudyBond</h3>
                <Link href="/#duel">Duel</Link>
                <Link href="/#pricing">Pricing</Link>
                <Link href="/blog">Guides</Link>
                <Link href={"/word-of-the-day" as Route}>Word of the day</Link>
                <Link href="/login">Log in</Link>
                <Link href="/signup">Start free</Link>
              </div>
            </div>
          </div>
          <p className="foot-b">© {new Date().getFullYear()} StudyBond</p>
        </div>
      </footer>
    </div>
  );
}
