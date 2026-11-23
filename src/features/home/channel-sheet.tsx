"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils/cn";

import {
  dismissForSession,
  hasJoinedChannel,
  setJoinedChannel,
  useCommunity,
  wasDismissedThisSession,
} from "./community";
import { boardLabel } from "./format";
import s from "./home.module.css";

export function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.7.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.49-8.41" />
    </svg>
  );
}

/**
 * The WhatsApp channel sheet, rebuilt for the new design (user, 2026-11-23).
 * It asks once per board: each board has its own channel, set in admin.
 * "Not now" holds for the session. There is no floating button any more;
 * the channel stays in Me > Community.
 */
export function ChannelPrompt() {
  const community = useCommunity();
  const [due, setDue] = useState(false);
  const [closed, setClosed] = useState(false);

  /* Wait a moment so the page loads first. */
  useEffect(() => {
    const timer = window.setTimeout(() => setDue(true), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  const c = community.data;
  if (!due || closed || !c?.channelUrl) return null;
  if (hasJoinedChannel(c.boardCode) || wasDismissedThisSession()) return null;

  const label = boardLabel({ code: c.boardCode, examName: c.examName });
  const close = () => setClosed(true);
  const join = () => {
    setJoinedChannel(c.boardCode, true);
    window.open(c.channelUrl!, "_blank", "noopener");
    close();
  };

  return createPortal(
    <div className={cn("sb-ui", s.scrim)} onClick={() => { dismissForSession(); close(); }}>
      <div className={s.sheet} role="dialog" aria-modal="true" aria-labelledby="channel-sheet-title" onClick={(event) => event.stopPropagation()}>
        <span className={s.waTile}><WhatsAppGlyph /></span>
        <h2 id="channel-sheet-title" style={{ marginTop: 14 }}>Join the {label} channel on WhatsApp</h2>
        <p>
          StudyBond posts tips, paper reminders and news there. It&rsquo;s a channel, so only StudyBond posts, and your number stays private.
          {c.isPremium && c.hasGroup ? " You also have the premium group. It's in Me, under Community." : ""}
        </p>
        <button type="button" className={s.btn} style={{ width: "100%" }} onClick={join}>Join the channel</button>
        <button type="button" className={s.sheetClose} onClick={() => { dismissForSession(); close(); }}>Not now</button>
        <button type="button" className={s.skip} style={{ display: "block", margin: "10px auto 0" }} onClick={() => { setJoinedChannel(c.boardCode, true); close(); }}>
          I&rsquo;ve already joined
        </button>
      </div>
    </div>,
    document.body,
  );
}
