"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";

import { BackIcon } from "../ui/icons";
import { playDuelSound } from "../ui/sfx";
import { shareResult, updateShareSettings } from "./api";
import { ResultPreviewArt } from "./card/link-preview";
import { ShareCardArt, type CardFonts } from "./card/share-card";
import { SHARE_HOST, type OwnerShare, type ShareSettings, type ShareShape } from "./types";
import s from "./share.module.css";

/* Share your result (mockup 11a). The preview is the real card drawn in the
   page; the buttons fetch the same card as a full-size image from
   /api/og/result/<number>, which always follows the saved switches. So every
   switch is saved at once (PATCH), and what you see is what others see. */

const PAGE_FONTS: CardFonts = { head: "var(--ui-head)", body: "var(--ui-body)" };

const SHAPES: Array<{ id: ShareShape; label: string; w: number; h: number; scale: number; px: string }> = [
  { id: "status", label: "Status", w: 360, h: 640, scale: 0.56, px: "1080 × 1920" },
  { id: "square", label: "Square", w: 360, h: 360, scale: 0.86, px: "1080 × 1080" },
  { id: "link", label: "Link preview", w: 600, h: 315, scale: 0.56, px: "1200 × 630" },
];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M12 3a9 9 0 0 1 9 9" strokeDasharray="3 3" />
      <path d="M21 12a9 9 0 1 1-9-9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 18.8Z" />
    </svg>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 20h14" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span className={cn(s.switch, on && s.switchOn)} aria-hidden="true">
      <i />
    </span>
  );
}

async function loadImage(url: string, name: string): Promise<File> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("image");
  const blob = await response.blob();
  return new File([blob], name, { type: "image/png" });
}

function download(file: File) {
  const href = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = href;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 4000);
}

export type ShareSheetProps = {
  examId: number;
  open: boolean;
  onClose: () => void;
  /** The rival's first name, for the switch label ("Show Tobi's name and face"). Duels only. */
  rivalFirstName?: string | null;
};

export function ShareSheet({ examId, open, onClose, rivalFirstName }: ShareSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [owner, setOwner] = useState<OwnerShare | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [shape, setShape] = useState<ShareShape>("status");
  const [busy, setBusy] = useState<string | null>(null);
  const [stamp, setStamp] = useState(0);
  const saving = useRef(0);
  const pending = useRef<Promise<unknown>>(Promise.resolve());
  const images = useRef(new Map<string, Promise<File>>());

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open || owner) return;
    let alive = true;
    setFailed(null);
    shareResult(examId)
      .then((data) => {
        if (!alive) return;
        setOwner(data);
        setStamp(Date.now());
      })
      .catch((error: { message?: string }) => {
        if (alive) setFailed(error?.message || "We couldn't make your card. Try again.");
      });
    return () => {
      alive = false;
    };
  }, [open, owner, examId]);

  // Escape closes; the page behind doesn't scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Make the Status image in the background once the card is saved.
  const number = owner?.card.number ?? null;
  useEffect(() => {
    if (!open || !number || !stamp) return;
    const timer = setTimeout(() => {
      const url = `/api/og/result/${number}?shape=status&v=${stamp}`;
      if (!images.current.has(url)) {
        const job = loadImage(url, `studybond-${number}.png`);
        job.catch(() => images.current.delete(url));
        images.current.set(url, job);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [open, number, stamp]);

  if (!open || !mounted) return null;

  const card = owner?.card ?? null;
  const settings = owner?.settings ?? null;
  const isDuel = card?.kind === "DUEL";
  const dims = SHAPES.find((x) => x.id === shape)!;
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const resultUrl = card ? `${origin}/r/${card.number}` : "";
  const printedLink = card?.challengeName ? `${SHARE_HOST}/c/${card.challengeName}` : card ? `${SHARE_HOST}/r/${card.number}` : "";
  const rivalLabel = rivalFirstName || card?.duel?.rival?.firstName || "your rival";

  function change(next: Partial<ShareSettings>) {
    if (!owner) return;
    playDuelSound("tap");
    const ticket = ++saving.current;
    // Show it at once; the server's card replaces it when it lands.
    setOwner({ ...owner, settings: { ...owner.settings, ...next } });
    const request = updateShareSettings(owner.card.number, next);
    pending.current = request.catch(() => undefined);
    request
      .then((data) => {
        if (ticket !== saving.current) return;
        setOwner(data);
        setStamp(Date.now());
      })
      .catch(() => {
        if (ticket !== saving.current) return;
        setOwner(owner);
        toast.error("That didn't save. Check your connection and try again.");
      });
  }

  function imageUrl(which: ShareShape) {
    return `/api/og/result/${card!.number}?shape=${which}&v=${stamp}`;
  }

  async function run(name: string, task: () => Promise<void>) {
    if (!card || busy) return;
    playDuelSound("tap");
    setBusy(name);
    try {
      // A switch that is still saving lands first, so the image matches.
      await pending.current;
      await task();
    } catch (error) {
      if ((error as { name?: string })?.name !== "AbortError") toast.error("Something went wrong. Try again.");
    } finally {
      setBusy(null);
    }
  }

  /** Images are made once per saved state, and the Status one ahead of time:
      a phone only opens the share menu for a few seconds after a tap. */
  function fetchImage(url: string, name: string): Promise<File> {
    let job = images.current.get(url);
    if (!job) {
      job = loadImage(url, name);
      job.catch(() => images.current.delete(url));
      images.current.set(url, job);
    }
    return job;
  }

  const shareStatus = () =>
    run("status", async () => {
      const file = await fetchImage(imageUrl("status"), `studybond-${card!.number}.png`);
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${card!.cta} ${printedLink}` });
      } else {
        download(file);
        toast.success("Saved. Post it to your WhatsApp Status from your gallery.");
      }
    });

  const shareChat = () =>
    run("chat", async () => {
      const text = `${card!.previewTitle}. Check it: ${resultUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    });

  const saveImage = () =>
    run("save", async () => {
      const file = await fetchImage(imageUrl(shape), `studybond-${card!.number}-${shape}.png`);
      download(file);
      toast.success(`Saved at full size, ${dims.px}.`);
    });

  const copyLink = () =>
    run("copy", async () => {
      await navigator.clipboard.writeText(resultUrl);
      toast.success(`Link copied: ${SHARE_HOST}/r/${card!.number}`);
    });

  const sheet = (
    <div className={cn("sb-ui", s.backdrop)} role="presentation" onClick={onClose}>
      <div className={s.sheet} role="dialog" aria-modal="true" aria-labelledby="share-title" onClick={(event) => event.stopPropagation()}>
        <header className={s.top}>
          <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Back to the result">
            <BackIcon />
          </button>
          <h1 id="share-title">Share your result</h1>
        </header>

        <div className={s.scroll}>
          <div className={s.stage} aria-label="Preview of the image">
            {card && settings ? (
              <div className={s.prevBox} style={{ width: Math.round(dims.w * dims.scale), height: Math.round(dims.h * dims.scale) }}>
                <div style={{ width: dims.w, height: dims.h, transform: `scale(${dims.scale})`, transformOrigin: "top left" }}>
                  {shape === "link" ? (
                    <ResultPreviewArt card={{ ...card, look: settings.look }} u={1} fonts={PAGE_FONTS} origin="" link={`${SHARE_HOST}/r/${card.number}`} />
                  ) : (
                    <ShareCardArt card={{ ...card, look: settings.look }} shape={shape} u={1} fonts={PAGE_FONTS} origin="" link={printedLink} />
                  )}
                </div>
              </div>
            ) : failed ? (
              <p className={s.failed}>{failed}</p>
            ) : (
              <p className={s.loading}>Making your card</p>
            )}
          </div>

          <p className={s.label}>Shape</p>
          <div className={cn(s.seg, s.three)} role="group" aria-label="Shape">
            {SHAPES.map((x) => (
              <button
                key={x.id}
                type="button"
                className={cn(s.segBtn, shape === x.id && s.on)}
                aria-pressed={shape === x.id}
                onClick={() => {
                  playDuelSound("tap");
                  setShape(x.id);
                }}
              >
                {x.label}
              </button>
            ))}
          </div>

          <p className={s.label}>Look</p>
          <div className={cn(s.seg, s.two)} role="group" aria-label="Look">
            {(["AMBER", "MIDNIGHT"] as const).map((look) => (
              <button
                key={look}
                type="button"
                className={cn(s.segBtn, settings?.look === look && s.on)}
                aria-pressed={settings?.look === look}
                disabled={!settings}
                onClick={() => change({ look })}
              >
                {look === "AMBER" ? "Amber paper" : "Midnight"}
              </button>
            ))}
          </div>

          <div className={s.toggles}>
            <button
              type="button"
              className={s.trow}
              role="switch"
              aria-checked={settings?.showScore ?? true}
              disabled={!settings}
              onClick={() => change({ showScore: !settings!.showScore })}
            >
              <span>
                <b>Show the scores</b>
                <small>{settings?.showScore === false ? "Only how it went, no numbers" : isDuel ? "Both scores and the subject table" : "Your score and the subject strips"}</small>
              </span>
              <Switch on={settings?.showScore ?? true} />
            </button>
            {isDuel ? (
              <button
                type="button"
                className={s.trow}
                role="switch"
                aria-checked={settings?.showRival ?? true}
                disabled={!settings}
                onClick={() => change({ showRival: !settings!.showRival })}
              >
                <span>
                  <b>Show {rivalLabel}&apos;s name and face</b>
                  <small>{settings?.showRival ? `${rivalLabel} is shown as ${card?.duel?.rival?.shortName ?? rivalLabel}` : "Shown as “a challenger”"}</small>
                </span>
                <Switch on={settings?.showRival ?? true} />
              </button>
            ) : null}
          </div>

          {card ? (
            <div className={s.trust}>
              <ShieldIcon />
              <span>
                Every card carries a result number, <b>{card.printedNumber}</b>. Anyone can check it at {SHARE_HOST}/r/{card.number}, so nobody can fake a score.
              </span>
            </div>
          ) : null}
        </div>

        <div className={s.dock}>
          <div className={s.acts}>
            <button type="button" className={cn(s.act, s.st)} onClick={shareStatus} disabled={!card || !!busy}>
              <span className={s.ic}><StatusIcon /></span>
              {busy === "status" ? "Making it" : "WhatsApp Status"}
            </button>
            <button type="button" className={cn(s.act, s.wa)} onClick={shareChat} disabled={!card || !!busy}>
              <span className={s.ic}><ChatIcon /></span>
              Send in a chat
            </button>
            <button type="button" className={s.act} onClick={saveImage} disabled={!card || !!busy}>
              <span className={s.ic}><SaveIcon /></span>
              {busy === "save" ? "Saving" : "Save image"}
            </button>
            <button type="button" className={s.act} onClick={copyLink} disabled={!card || !!busy}>
              <span className={s.ic}><LinkIcon /></span>
              Copy link
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(sheet, document.body);
}
