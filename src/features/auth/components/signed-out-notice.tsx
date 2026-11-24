"use client";

import { SIGNED_OUT_EVENT } from "@/lib/auth/signed-out";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import "../signed-out-notice.css";

/* Shown over the page the student was using when their account logs in on
   another device (see lib/auth/signed-out.ts). The session is already gone,
   so there is no close button: they log in here again, or change their
   password if it wasn't them. Plain links, so the next page loads fresh. */

export function SignedOutNotice() {
  const [open, setOpen] = useState(false);
  const [returnTo, setReturnTo] = useState("/dashboard");
  const card = useRef<HTMLElement>(null);

  useEffect(() => {
    const onSignedOut = () => {
      const { pathname, search } = window.location;
      setReturnTo(pathname.startsWith("/login") ? "/dashboard" : `${pathname}${search}`);
      setOpen(true);
    };
    window.addEventListener(SIGNED_OUT_EVENT, onSignedOut);
    return () => window.removeEventListener(SIGNED_OUT_EVENT, onSignedOut);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    card.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  /* Keep Tab inside the notice: the page behind it no longer works. */
  const keepFocusInside = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Tab" || !card.current) return;
    const links = Array.from(card.current.querySelectorAll<HTMLElement>("a"));
    if (links.length === 0) return;
    const first = links[0];
    const last = links[links.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const loginHref = `/login?reason=replaced&next=${encodeURIComponent(returnTo)}`;

  return (
    <div className="sbo-scrim">
      <section
        ref={card}
        className="sbo-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="sbo-title"
        aria-describedby="sbo-body"
        onKeyDown={keepFocusInside}
      >
        <div className="sbo-band">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="m16 17 5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          <span>Signed out just now</span>
        </div>
        <div className="sbo-main">
          <h2 id="sbo-title">You were signed out here</h2>
          <p id="sbo-body">
            Your account was just opened on another device, so we closed it on this one. Premium works on one device at
            a time.
          </p>
          <a className="sbo-btn" href={loginHref}>
            Log in here again
          </a>
          <p className="sbo-small">Logging in here signs you out on the other device.</p>
          <a className="sbo-link" href="/forgot-password">
            Wasn&apos;t you? Change your password
          </a>
        </div>
      </section>
    </div>
  );
}
