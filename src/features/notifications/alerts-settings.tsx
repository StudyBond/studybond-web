"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils/cn";

import { notificationKeys, setDeviceEnabled, stopDevice, type AlertDevice, type AlertSwitches } from "./api";
import { IphoneSteps } from "./asks";
import { daysAgo } from "./format";
import { useAlertSwitches, useSetAlertSwitch, useThisDevice } from "./hooks";
import { CardIcon, DeviceIcon, InfoIcon, PinIcon, SwordsIcon, TickIcon } from "./icons";
import { browserName, deviceLabel, deviceWord, listedDeviceWord, turnOnAlerts, type ThisDevice } from "./push";
import s from "./notifications.module.css";

/* Me › Notifications (board 4): this device, the devices getting alerts,
   and the five switches. The switches only stop the buzzing; the inbox
   keeps every note. */

function errorText(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function Switch({ on, label, onChange, disabled }: { on: boolean; label: string; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn(s.sw, on && s.swOn)}
      onClick={onChange}
      disabled={disabled}
    />
  );
}

function openedLine(device: AlertDevice) {
  const gap = daysAgo(device.lastOpenedAt);
  const when = gap <= 0 ? "opened today" : gap === 1 ? "opened yesterday" : `opened ${gap} days ago`;
  return `${device.channel === "APP" ? "StudyBond app" : device.label} · ${device.enabled ? when : "paused"}`;
}

export function AlertsSettings() {
  const device = useThisDevice();
  const state = device.data;
  const word = deviceWord();

  return (
    <div className="sb-ui">
      {device.isLoading ? null : state ? <ThisDeviceSection state={state} word={word} /> : null}
      <DevicesSection state={state} loading={device.isLoading} />
      <SwitchesSection />
      <div className={s.note2}>
        <InfoIcon />
        <span>These switches only stop the buzzing. <b>Every note still lands in your inbox</b> and stays there for 90 days.</span>
      </div>
    </div>
  );
}

/* ── This device ── */

function ThisDeviceSection({ state, word }: { state: ThisDevice; word: string }) {
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const pause = useMutation({
    mutationFn: (enabled: boolean) => setDeviceEnabled(state.here!.id, enabled),
    onSuccess: () => void client.invalidateQueries({ queryKey: notificationKeys.device }),
    onError: (error) => toast.error(errorText(error, "Could not change alerts on this device.")),
  });

  if (state.support === "no-key") return null;

  async function turnOn() {
    if (!state.key) return;
    setBusy(true);
    const result = await turnOnAlerts(state.key);
    setBusy(false);
    void client.invalidateQueries({ queryKey: notificationKeys.device });
    if (result.ok) toast.success(`Alerts are on for this ${word}`);
    else if (result.reason === "failed") toast.error("We couldn't turn on alerts", { description: "Check your internet and try again." });
  }

  let body: ReactNode;
  if (state.support === "unsupported") {
    body = (
      <section className={cn(s.list, s.box)}>
        <b>This browser can&apos;t show alerts</b>
        <p>Everything still lands in your inbox. For alerts, open StudyBond in Chrome, Edge or Firefox.</p>
      </section>
    );
  } else if (state.support === "ios-browser") {
    const ipad = word === "tablet";
    body = (
      <section className={cn(s.list, s.box)}>
        <b>On {ipad ? "iPad" : "iPhone"}, alerts need one step first</b>
        <p>{ipad ? "iPad" : "iPhone"} only sends alerts from websites on your Home Screen. Add StudyBond there once, then open it from the new icon and turn alerts on here.</p>
        <IphoneSteps />
      </section>
    );
  } else if (state.permission === "denied") {
    const browser = browserName();
    const laptop = word === "laptop";
    body = (
      <section className={cn(s.list, s.box, s.boxBad)}>
        <b>{browser} is blocking alerts from StudyBond</b>
        <p>Someone {laptop ? "clicked" : "tapped"} Block when {browser} asked. Only you can undo it, in {browser}:</p>
        <ol className={s.fix}>
          {laptop ? (
            <>
              <li><b>1</b><span>Click the icon to the left of the address</span></li>
              <li><b>2</b><span>Find <b>Notifications</b> and choose <b>Allow</b></span></li>
              <li><b>3</b><span>Reload this page</span></li>
            </>
          ) : (
            <>
              <li><b>1</b><span>Tap the icon to the left of the address</span></li>
              <li><b>2</b><span>Tap <b>Permissions</b>, then <b>Notifications</b></span></li>
              <li><b>3</b><span>Choose <b>Allow</b> and come back here</span></li>
            </>
          )}
        </ol>
      </section>
    );
  } else if (state.here) {
    const on = state.here.enabled;
    body = (
      <section className={cn(s.list, s.thisRow)}>
        <span className={cn(s.nIc, s.icAmber)}><DeviceIcon word={word === "laptop" ? "laptop" : "phone"} /></span>
        <span className={s.rowT}>
          <b>{on ? "Alerts are on" : "Alerts are paused here"}</b>
          <small>{state.here.label}</small>
        </span>
        <Switch on={on} label={`Alerts on this ${word}`} onChange={() => pause.mutate(!on)} disabled={pause.isPending} />
      </section>
    );
  } else {
    body = (
      <section className={cn(s.list, s.box)}>
        <b>Alerts are off on this {word}</b>
        <p>Turn them on to hear about duel challenges and your streak, even with StudyBond closed.</p>
        <button type="button" className={cn(s.btn, s.wide)} onClick={() => void turnOn()} disabled={busy}>
          {busy ? "Turning on" : "Turn on alerts"}
        </button>
        {state.permission === "default" ? (
          <p className={s.fine}>{browserName()} asks next. {word === "laptop" ? "Click" : "Tap"} Allow.</p>
        ) : null}
      </section>
    );
  }

  return (
    <>
      <div className={s.sec} style={{ marginTop: 8 }}>This {word}</div>
      {body}
    </>
  );
}

/* ── Devices getting alerts ── */

function DevicesSection({ state, loading }: { state: ThisDevice | undefined; loading: boolean }) {
  const client = useQueryClient();
  const stop = useMutation({
    mutationFn: (id: string) => stopDevice(id),
    onSuccess: () => void client.invalidateQueries({ queryKey: notificationKeys.device }),
    onError: (error) => toast.error(errorText(error, "Could not stop alerts on that device.")),
  });
  const devices = state?.devices ?? [];
  const hereLabel = deviceLabel();

  return (
    <>
      <div className={s.sec}>Devices getting alerts</div>
      <ul className={s.list}>
        {loading ? <li className={cn(s.dev, s.devNone)}>Loading your devices</li> : null}
        {!loading && devices.length === 0 ? (
          <li className={cn(s.dev, s.devNone)}>No device gets alerts right now. You still see every note in your inbox.</li>
        ) : null}
        {devices.map((device) => {
          const word = listedDeviceWord(device);
          return (
            <li key={device.id} className={s.dev}>
              <span className={s.devIc}><DeviceIcon word={word} /></span>
              <span className={s.rowT}>
                <b style={{ fontSize: 14.5 }}>{device.isThisDevice ? `This ${word}` : word.charAt(0).toUpperCase() + word.slice(1)}</b>
                <small>{device.isThisDevice ? `${hereLabel}${device.enabled ? "" : " · paused"}` : openedLine(device)}</small>
              </span>
              {device.isThisDevice ? (
                <span className={cn(s.pill, s.pillGo)}>You&apos;re here</span>
              ) : (
                <button type="button" className={s.ghost} onClick={() => stop.mutate(device.id)} disabled={stop.isPending && stop.variables === device.id}>
                  Stop
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className={s.help}>A device stops getting alerts when you sign out on it, or when you haven&apos;t opened StudyBond there for 30 days.</p>
    </>
  );
}

/* ── What to alert me about ── */

const GROUPS: Array<{ key: keyof AlertSwitches; title: string; when: string; example: string; icon: ReactNode; tone?: string; label: string }> = [
  { key: "streaks", title: "My streak", when: "9 pm, only on days you haven't studied.", example: "Your 12-day streak ends at midnight", icon: <span className={s.ringOpen} />, tone: s.icAmber, label: "Streak alerts" },
  { key: "duel", title: "Duels", when: "Challenges, rematches, results.", example: "Amaka O. challenged you", icon: <SwordsIcon />, tone: s.icRival, label: "Duel alerts" },
  { key: "subscription", title: "My premium", when: "7 days and 1 day before it ends.", example: "Your JAMB premium ends in 7 days", icon: <CardIcon />, label: "Premium alerts" },
  { key: "reports", title: "My reports", when: "When we check a question you reported.", example: "We've checked the question you reported", icon: <TickIcon />, tone: s.icRed, label: "Report reply alerts" },
  { key: "announcements", title: "News from StudyBond", when: "Only the notices we mark as important.", example: "JAMB UTME is now on StudyBond", icon: <PinIcon />, tone: s.icAmber, label: "Announcement alerts" },
];

function SwitchesSection() {
  const switches = useAlertSwitches();
  const set = useSetAlertSwitch();
  const values = switches.data;

  return (
    <>
      <div className={s.sec}>Alert me about</div>
      <ul className={s.list}>
        {GROUPS.map((group) => (
          <li key={group.key} className={s.grpRow}>
            <span className={cn(s.nIc, group.tone)}>{group.icon}</span>
            <span>
              <b>{group.title}</b>
              <span className={s.eg}>{group.when} <i>&ldquo;{group.example}&rdquo;</i></span>
            </span>
            <Switch
              on={values?.[group.key] ?? true}
              label={group.label}
              disabled={!values}
              onChange={() => {
                if (!values) return;
                set.mutate(
                  { [group.key]: !values[group.key] },
                  { onError: (error) => toast.error(errorText(error, "Could not save that. Try again.")) },
                );
              }}
            />
          </li>
        ))}
      </ul>
      {switches.isError ? <p className={s.help}>We couldn&apos;t load your switches. Check your internet and try again.</p> : null}
    </>
  );
}
