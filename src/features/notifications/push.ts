import {
  getPushConfig,
  listAlertDevices,
  registerWebDevice,
  stopThisDevice,
  type AlertDevice,
  type PushPlatform,
} from "./api";

/* Browser alerts on this device: the service worker, the browser's own
   permission, and signing this browser up with the backend.

   Rules (plan sections 4-5):
   - Only "Yes" on our own card calls Notification.requestPermission().
   - A browser that said yes is POSTed again on every open while it is still
     on the student's list, so "last opened" stays fresh (30 days unopened
     stops alerts). One that was stopped, signed out or moved to another
     account is NOT signed back up on its own: it waits for a new yes. */

export type Support =
  /** Alerts can work here. */
  | "ok"
  /** iPhone or iPad in a Safari tab: alerts need the Home Screen first. */
  | "ios-browser"
  /** This browser can't show web alerts at all. */
  | "unsupported"
  /** The server has no alert keys yet: hide every ask, show the inbox only. */
  | "no-key";

export type ThisDevice = {
  support: Support;
  permission: NotificationPermission | "unknown";
  key: string | null;
  /** This browser's entry on the student's list, if it is on it. */
  here: AlertDevice | null;
  devices: AlertDevice[];
};

/* ── What this browser is ── */

function ua() {
  return typeof navigator === "undefined" ? "" : navigator.userAgent;
}

export function isIos() {
  const agent = ua();
  if (/iPhone|iPad|iPod/i.test(agent)) return true;
  // iPadOS asks for the desktop site and says "Macintosh".
  return /Macintosh/i.test(agent) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1;
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia?.("(display-mode: standalone)").matches === true;
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function platformOf(agent = ua()): PushPlatform {
  if (/Android/i.test(agent)) return "android";
  if (/iPhone|iPad|iPod/i.test(agent) || (/Macintosh/i.test(agent) && typeof navigator !== "undefined" && navigator.maxTouchPoints > 1)) return "ios";
  if (/Windows/i.test(agent)) return "windows";
  if (/Macintosh|Mac OS X/i.test(agent)) return "macos";
  if (/Linux|CrOS/i.test(agent)) return "linux";
  return "other";
}

export function browserName(agent = ua()) {
  if (/Edg\//i.test(agent)) return "Edge";
  if (/OPR\/|Opera/i.test(agent)) return "Opera";
  if (/SamsungBrowser/i.test(agent)) return "Samsung Internet";
  if (/Firefox|FxiOS/i.test(agent)) return "Firefox";
  if (/Chrome|CriOS/i.test(agent)) return "Chrome";
  if (/Safari/i.test(agent)) return "Safari";
  return "your browser";
}

const PLATFORM_NAMES: Record<PushPlatform, string> = {
  android: "Android",
  ios: "iPhone",
  windows: "Windows",
  macos: "Mac",
  linux: "Linux",
  other: "this device",
};

/** "Chrome on Windows". */
export function deviceLabel(agent = ua()) {
  const platform = platformOf(agent);
  const ipad = /iPad/i.test(agent) || (/Macintosh/i.test(agent) && platform === "ios");
  const where = platform === "ios" && ipad ? "iPad" : PLATFORM_NAMES[platform];
  if (platform === "ios" && isStandalone()) return `StudyBond on ${where}`;
  return `${browserName(agent)} on ${where}`;
}

/** "phone" or "laptop", for the words on the cards. */
export function deviceWord(platform: string = platformOf()): "phone" | "laptop" | "tablet" {
  if (platform === "ios" && (/iPad/i.test(ua()) || /Macintosh/i.test(ua()))) return "tablet";
  if (platform === "android" || platform === "ios") return "phone";
  return "laptop";
}

/** The word for a device on the list ("phone" for the app). */
export function listedDeviceWord(device: Pick<AlertDevice, "platform" | "channel" | "label">) {
  if (device.channel === "APP") return "phone";
  if (/iPad/i.test(device.label)) return "tablet";
  return device.platform === "android" || device.platform === "ios" ? "phone" : "laptop";
}

/* ── The service worker ── */

let registration: Promise<ServiceWorkerRegistration> | null = null;

export function registerAlertWorker() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.reject(new Error("No service worker here."));
  }
  registration ??= navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
    registration = null;
    throw error;
  });
  return registration;
}

async function currentSubscription() {
  const reg = await registerAlertWorker();
  return reg.pushManager.getSubscription();
}

function keyBytes(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function sameKey(subscription: PushSubscription, key: string) {
  const current = subscription.options?.applicationServerKey;
  if (!current) return true;
  const a = new Uint8Array(current);
  const b = keyBytes(key);
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

/* ── Reading the state ── */

export async function readThisDevice(): Promise<ThisDevice> {
  const devicesFor = (endpoint?: string | null) => listAlertDevices(endpoint).catch(() => [] as AlertDevice[]);

  if (isIos() && !isStandalone()) {
    const [config, devices] = await Promise.all([getPushConfig(), devicesFor()]);
    return { support: config.webPushPublicKey ? "ios-browser" : "no-key", permission: "unknown", key: config.webPushPublicKey, here: null, devices };
  }
  if (!pushSupported()) {
    return { support: "unsupported", permission: "unknown", key: null, here: null, devices: await devicesFor() };
  }

  const config = await getPushConfig();
  const key = config.webPushPublicKey;
  if (!key) return { support: "no-key", permission: Notification.permission, key: null, here: null, devices: await devicesFor() };

  let subscription: PushSubscription | null = null;
  try {
    subscription = await currentSubscription();
  } catch {
    return { support: "unsupported", permission: Notification.permission, key, here: null, devices: await devicesFor() };
  }
  const devices = await devicesFor(subscription?.endpoint);
  const here = Notification.permission === "granted" ? devices.find((device) => device.isThisDevice) ?? null : null;
  return { support: "ok", permission: Notification.permission, key, here, devices };
}

/* ── Turning alerts on and off here ── */

export type TurnOnResult = { ok: true; device: AlertDevice } | { ok: false; reason: "blocked" | "dismissed" | "failed" };

/** "Yes": the browser's own question (only if it hasn't been answered), then sign up. */
export async function turnOnAlerts(key: string): Promise<TurnOnResult> {
  if (!pushSupported()) return { ok: false, reason: "failed" };
  let permission = Notification.permission;
  if (permission === "default") permission = await Notification.requestPermission();
  if (permission === "denied") return { ok: false, reason: "blocked" };
  if (permission !== "granted") return { ok: false, reason: "dismissed" };

  try {
    const reg = await registerAlertWorker();
    let subscription = await reg.pushManager.getSubscription();
    if (subscription && !sameKey(subscription, key)) {
      await subscription.unsubscribe().catch(() => undefined);
      subscription = null;
    }
    subscription ??= await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) });
    const device = await signUp(subscription);
    return { ok: true, device };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

function signUp(subscription: PushSubscription) {
  const json = subscription.toJSON();
  return registerWebDevice({
    endpoint: subscription.endpoint,
    p256dh: json.keys?.p256dh ?? "",
    auth: json.keys?.auth ?? "",
    platform: platformOf(),
    label: deviceLabel(),
  });
}

/** "Not on this device", or turning alerts off here for good. */
export async function stopAlertsHere() {
  const subscription = await currentSubscription().catch(() => null);
  if (!subscription) return;
  await stopThisDevice(subscription.endpoint);
  await subscription.unsubscribe().catch(() => undefined);
}

/** On each open: keep a browser that is still on the list fresh. */
export async function refreshThisDevice(state: ThisDevice) {
  if (state.support !== "ok" || !state.here) return;
  const subscription = await currentSubscription().catch(() => null);
  if (subscription) await signUp(subscription).catch(() => undefined);
}

/* ── Messages to and from the service worker ── */

export type WorkerMessage =
  | { source: "sb-alerts"; type: "note"; note: PushNote }
  | { source: "sb-alerts"; type: "refresh" }
  | { source: "sb-alerts"; type: "open"; url: string };

export type PushNote = {
  v: number;
  type: "show";
  kind: string;
  id: string;
  title: string;
  body: string;
  url: string;
  tag: string;
  target: unknown;
  actions: Array<{ id: string; title: string; url?: string; post?: string }>;
};

/** Close alerts already on screen whose notes are read. `keep` = tags still unread. */
export async function closeReadAlerts(keep: string[] | "none") {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration("/").catch(() => undefined);
  if (!reg) return;
  const shown = await reg.getNotifications().catch(() => [] as Notification[]);
  for (const alert of shown) {
    if (keep === "none" || !keep.includes(alert.tag)) alert.close();
  }
}

/* ── How often we ask (per device) ── */

type AskRecord = { count: number; last: number; never?: boolean };
const ASK_KEY = "sb-alert-ask";
const NEW_DEVICE_KEY = "sb-alert-new-device";
const WEEK = 7 * 86_400_000;
export const MAX_ASKS = 3;

function readRecord(key: string): AskRecord {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? (JSON.parse(raw) as Partial<AskRecord>) : null;
    return { count: Number(parsed?.count) || 0, last: Number(parsed?.last) || 0, never: parsed?.never === true };
  } catch {
    return { count: 0, last: 0 };
  }
}

function writeRecord(key: string, record: AskRecord) {
  try {
    window.localStorage.setItem(key, JSON.stringify(record));
  } catch {
    /* Private window or storage blocked: we just ask again next time. */
  }
}

function canAsk(record: AskRecord, now = Date.now()) {
  return !record.never && record.count < MAX_ASKS && now - record.last >= WEEK;
}

export const askLimits = {
  /** The "want a reminder?" card: 7 days after "Not now", 3 times at most. */
  canAsk: () => canAsk(readRecord(ASK_KEY)),
  noteAsked: () => {
    const record = readRecord(ASK_KEY);
    writeRecord(ASK_KEY, { ...record, count: record.count + 1, last: Date.now() });
  },
  /** "Get alerts here too?", per student on this device. */
  canAskNewDevice: (userId: number) => canAsk(readRecord(`${NEW_DEVICE_KEY}:${userId}`)),
  noteNewDeviceAsked: (userId: number, never = false) => {
    const key = `${NEW_DEVICE_KEY}:${userId}`;
    const record = readRecord(key);
    writeRecord(key, { count: record.count + 1, last: Date.now(), never: never || record.never });
  },
};
