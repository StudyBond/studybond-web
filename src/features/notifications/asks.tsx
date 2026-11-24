"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";

import { notificationKeys } from "./api";
import { useThisDevice } from "./hooks";
import { AddSquareIcon, DeviceIcon, InfoIcon, ShareIcon } from "./icons";
import { askLimits, browserName, deviceWord, listedDeviceWord, platformOf, turnOnAlerts, type ThisDevice } from "./push";
import s from "./notifications.module.css";

/* Asking for alerts (plan section 5, boards 2 and 3).
   - Our own card first. Only "Yes" calls the browser's question, so a
     reflex "no" lands here and not on Block.
   - After the first finished paper, and after sending or accepting a duel.
     Never on a first visit, at sign-up or during a paper.
   - "Not now" waits 7 days; 3 asks at most (per device).
   - One ask per visit, whichever comes first. */

const VISIT_KEY = "sb-alert-asked-this-visit";

function askedThisVisit() {
  try {
    return window.sessionStorage.getItem(VISIT_KEY) === "1";
  } catch {
    return false;
  }
}

function markAskedThisVisit() {
  try {
    window.sessionStorage.setItem(VISIT_KEY, "1");
  } catch {
    /* ignore */
  }
}

/* The challenged student's name, carried from "Send challenge" to the slip. */
const NAME_KEY = "sb-challenge-name:";

export function rememberChallengeName(code: string, name: string) {
  try {
    window.sessionStorage.setItem(`${NAME_KEY}${code.toUpperCase()}`, name);
  } catch {
    /* ignore */
  }
}

function challengeName(code: string) {
  try {
    return window.sessionStorage.getItem(`${NAME_KEY}${code.toUpperCase()}`);
  } catch {
    return null;
  }
}

function firstWord(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** Can this device be asked to turn alerts on? */
function canTurnOn(state: ThisDevice) {
  if (state.support === "ios-browser") return true;
  return state.support === "ok" && !state.here && state.permission !== "denied";
}

/* ── The sheet ── */

function Sheet({ label, onDismiss, children }: { label: string; onDismiss: () => void; children: ReactNode }) {
  const box = useRef<HTMLElement>(null);
  useEffect(() => {
    box.current?.querySelector<HTMLElement>("h2")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onDismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);
  return (
    <div className="sb-ui">
      <button type="button" className={s.shade} aria-label="Not now" tabIndex={-1} onClick={onDismiss} />
      <section ref={box} className={s.sheet} role="dialog" aria-modal="true" aria-label={label}>
        <div className={s.grab} aria-hidden="true" />
        {children}
      </section>
    </div>
  );
}

function ExampleAlert({ title, text, time, actions }: { title: string; text: string; time: string; actions: string[] }) {
  return (
    <figure className={s.alert} aria-label={`Example alert: ${title}`}>
      <span className={s.aApp}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" />
      </span>
      <div>
        <div className={s.aTop}>StudyBond · <span className={s.num}>{time}</span></div>
        <div className={s.aTitle}>{title}</div>
        <div className={s.aText}>{text}</div>
        <div className={s.aActs}>{actions.map((action) => <span key={action}>{action}</span>)}</div>
      </div>
    </figure>
  );
}

export function IphoneSteps() {
  return (
    <ol className={s.steps}>
      <li><span className={s.stepN}>1</span><span>Tap <b>Share</b> at the bottom of Safari</span><ShareIcon /></li>
      <li><span className={s.stepN}>2</span><span>Tap <b>Add to Home Screen</b></span><AddSquareIcon /></li>
      <li>
        <span className={s.stepN}>3</span>
        <span>Open StudyBond from the new icon</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" />
      </li>
    </ol>
  );
}

function iosWord() {
  return deviceWord() === "tablet" ? "iPad" : "iPhone";
}

function useTurnOn(state: ThisDevice | undefined, onDone: () => void) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function run() {
    if (!state?.key) return;
    setBusy(true);
    const result = await turnOnAlerts(state.key);
    setBusy(false);
    void client.invalidateQueries({ queryKey: notificationKeys.device });
    if (result.ok) toast.success(`Alerts are on for this ${deviceWord()}`);
    else if (result.reason === "blocked") toast.error(`${browserName()} blocked alerts`, { description: "You can allow them again in Me › Notifications." });
    else if (result.reason === "failed") toast.error("We couldn't turn on alerts", { description: "Try again from Me › Notifications." });
    onDone();
  }
  return { busy, run };
}

/* ── Board 2: after a paper or a duel ── */

export type AskMoment =
  | { kind: "paper"; streak: number; finishedAt: string | null }
  | { kind: "duel-sent"; code: string }
  | { kind: "duel-accepted"; rivalName: string };

export function AlertAsk({ moment, enabled = true }: { moment: AskMoment; enabled?: boolean }) {
  const device = useThisDevice(enabled);
  const state = device.data;
  const [open, setOpen] = useState(false);
  const decided = useRef(false);
  const finishedAt = moment.kind === "paper" ? moment.finishedAt : null;

  useEffect(() => {
    if (!enabled || decided.current || !state) return;
    // Only right after a paper, not when an old result is opened again.
    const fresh = moment.kind !== "paper" || (finishedAt !== null && Date.now() - Date.parse(finishedAt) < 30 * 60_000);
    if (!fresh || !canTurnOn(state) || !askLimits.canAsk() || askedThisVisit()) {
      decided.current = true;
      return;
    }
    const timer = setTimeout(() => {
      decided.current = true;
      askLimits.noteAsked();
      markAskedThisVisit();
      setOpen(true);
    }, 900);
    return () => clearTimeout(timer);
  }, [enabled, state, moment.kind, finishedAt]);

  const close = useCallback(() => setOpen(false), []);
  const turnOn = useTurnOn(state, close);
  if (!open || !state) return null;

  if (state.support === "ios-browser") {
    return (
      <Sheet label="Alerts on iPhone" onDismiss={close}>
        <h2 tabIndex={-1}>On {iosWord()}, alerts need one step first</h2>
        <p className={s.lead}>{iosWord()} only sends alerts from websites on your Home Screen. Add StudyBond there once, open it from the new icon, and we&apos;ll ask you again.</p>
        <IphoneSteps />
        <div className={s.stack}>
          <button type="button" className={cn(s.btn, s.wide)} onClick={close}>Got it</button>
          <button type="button" className={cn(s.ghost, s.wide)} onClick={close}>Not now</button>
        </div>
        <p className={s.fine}>We&apos;ll ask again when you open StudyBond from your Home Screen.</p>
      </Sheet>
    );
  }

  const fine = state.permission === "default"
    ? `${browserName()} asks next. ${deviceWord() === "laptop" ? "Click" : "Tap"} Allow. If you ${deviceWord() === "laptop" ? "click" : "tap"} Block, we can't ask again.`
    : null;
  const buttons = (yes: string) => (
    <>
      <div className={s.stack}>
        <button type="button" className={cn(s.btn, s.wide)} onClick={() => void turnOn.run()} disabled={turnOn.busy}>{turnOn.busy ? "Turning on" : yes}</button>
        <button type="button" className={cn(s.ghost, s.wide)} onClick={close} disabled={turnOn.busy}>Not now</button>
      </div>
      {fine ? <p className={s.fine}>{fine}</p> : null}
    </>
  );

  if (moment.kind === "paper") {
    const days = Math.max(1, moment.streak);
    return (
      <Sheet label="Turn on alerts" onDismiss={close}>
        <h2 tabIndex={-1}>Want a reminder at 9 pm?</h2>
        <p className={s.lead}>
          {days === 1 ? "Your streak starts today." : `Your streak is at ${days} days.`} If a day is nearly over and you haven&apos;t studied, we&apos;ll remind you once at 9 pm. You&apos;ll also hear when someone challenges you to a duel.
        </p>
        <p className={s.cap}>This is what you&apos;d get</p>
        <ExampleAlert
          time="9:00 pm"
          title={`Your ${days}-day streak ends at midnight`}
          text="One quick paper keeps it. Today's challenge takes 3 minutes."
          actions={["Start today's challenge"]}
        />
        {buttons("Yes, remind me")}
      </Sheet>
    );
  }

  if (moment.kind === "duel-sent") {
    const name = challengeName(moment.code);
    const first = name ? firstWord(name) : null;
    return (
      <Sheet label="Turn on alerts" onDismiss={close}>
        <h2 tabIndex={-1}>{first ? `We'll tell you when ${first} answers` : "We'll tell you when they answer"}</h2>
        <p className={s.lead}>
          Turn on alerts and you&apos;ll know the moment {first ?? "they"} {first ? "takes" : "take"} your challenge, even with StudyBond closed. You&apos;ll also get your streak reminder at 9 pm.
        </p>
        <p className={s.cap}>This is what you&apos;d get</p>
        <ExampleAlert
          time="now"
          title={`${name ?? "Your friend"} took your challenge`}
          text="They're at the face-off. Tap to start."
          actions={["Open the face-off"]}
        />
        {buttons("Turn on alerts")}
      </Sheet>
    );
  }

  const first = firstWord(moment.rivalName);
  return (
    <Sheet label="Turn on alerts" onDismiss={close}>
      <h2 tabIndex={-1}>Hear when {first} wants a rematch</h2>
      <p className={s.lead}>
        Turn on alerts and you&apos;ll know the moment {first} or anyone else challenges you, even with StudyBond closed. You&apos;ll also get your streak reminder at 9 pm.
      </p>
      <p className={s.cap}>This is what you&apos;d get</p>
      <ExampleAlert
        time="now"
        title={`${moment.rivalName} wants a rematch`}
        text="Same subject as your last duel. You have 30 minutes to answer."
        actions={["Accept", "Decline"]}
      />
      {buttons("Turn on alerts")}
    </Sheet>
  );
}

/* ── Board 3: a new device, when alerts are on somewhere else ── */

const NEW_DEVICE_VISIT = "sb-alert-new-device-visit";

export function NewDeviceAsk({ userId, isPremium }: { userId: number | null; isPremium: boolean }) {
  const device = useThisDevice(Boolean(userId));
  const state = device.data;
  const [open, setOpen] = useState(false);
  const decided = useRef(false);

  const others = state?.devices.filter((d) => !d.isThisDevice && d.enabled) ?? [];

  useEffect(() => {
    if (!userId || decided.current || !state) return;
    const visited = (() => {
      try {
        return window.sessionStorage.getItem(NEW_DEVICE_VISIT) === "1";
      } catch {
        return false;
      }
    })();
    if (state.support !== "ok" || !canTurnOn(state) || others.length === 0 || visited || askedThisVisit() || !askLimits.canAskNewDevice(userId)) {
      decided.current = true;
      return;
    }
    const timer = setTimeout(() => {
      decided.current = true;
      try {
        window.sessionStorage.setItem(NEW_DEVICE_VISIT, "1");
      } catch {
        /* ignore */
      }
      askLimits.noteNewDeviceAsked(userId);
      markAskedThisVisit();
      setOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [userId, state, others.length]);

  const close = useCallback(() => setOpen(false), []);
  const turnOn = useTurnOn(state, close);
  if (!open || !state || !userId || others.length === 0) return null;

  const here = deviceWord();
  const other = others[0];
  const otherWord = listedDeviceWord(other);
  const sameKind = otherWord === here;
  const otherName = sameKind ? `other ${otherWord}` : otherWord;

  return (
    <Sheet label={`Alerts on this ${here}`} onDismiss={close}>
      <div className={s.pair}>
        <div className={s.tile}>
          <span className={s.tileIc}><DeviceIcon word={otherWord} /></span>
          <b>Your {otherName}</b>
          <span className={cn(s.pill, s.pillOk)}>Alerts on</span>
        </div>
        <svg viewBox="0 0 54 12" aria-hidden="true">
          <path d="M2 6h44" stroke="rgba(245,200,144,.6)" strokeWidth="2" strokeDasharray="3 4" fill="none" />
          <path d="m44 1 6 5-6 5" stroke="#f5c890" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className={cn(s.tile, s.tileHere)}>
          <span className={s.tileIc}><DeviceIcon word={platformOf() === "android" || platformOf() === "ios" ? "phone" : "laptop"} /></span>
          <b>This {here}</b>
          <span className={cn(s.pill, s.pillGo)}>Your call</span>
        </div>
      </div>

      <h2 tabIndex={-1}>Get alerts on this {here} too?</h2>
      <p className={s.lead}>
        {others.length === 1
          ? <>Your {otherName} ({other.label}) already gets StudyBond alerts.</>
          : <>{others.length} of your devices already get StudyBond alerts.</>}{" "}
        Say yes and both get them. Open one and it clears on the other.
      </p>

      {isPremium ? (
        <div className={s.note2}>
          <InfoIcon />
          <span>
            Signing in here signed you out on the {otherName}, because premium allows one sign-in at a time.{" "}
            <b>The {otherName} keeps your alerts anyway.</b> It&apos;s one of your 2 approved devices.
          </span>
        </div>
      ) : null}

      <div className={s.stack}>
        <button type="button" className={cn(s.btn, s.wide)} onClick={() => void turnOn.run()} disabled={turnOn.busy}>
          {turnOn.busy ? "Turning on" : `Yes, this ${here} too`}
        </button>
        <button
          type="button"
          className={cn(s.ghost, s.wide)}
          onClick={() => {
            askLimits.noteNewDeviceAsked(userId, true);
            close();
          }}
          disabled={turnOn.busy}
        >
          Not on this {here}
        </button>
      </div>
      <p className={s.fine}>Change it any time in Me › Notifications.</p>
    </Sheet>
  );
}
