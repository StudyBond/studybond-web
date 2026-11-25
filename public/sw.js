/* StudyBond alerts. Push and notification clicks only: no caching, no
   offline pages. The backend sends { v:1, type:"show", kind, id, title, body,
   url, tag, target, actions }. Tags are n<noteId> or a<noticeId>. */

const APP_PAGES = /^\/(dashboard|exams)(\/|$)/;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

async function windows() {
  return self.clients.matchAll({ type: "window", includeUncontrolled: true });
}

function isAppPage(client) {
  try {
    return APP_PAGES.test(new URL(client.url).pathname);
  } catch {
    return false;
  }
}

self.addEventListener("push", (event) => {
  let message = null;
  try {
    message = event.data ? event.data.json() : null;
  } catch {
    message = null;
  }
  if (!message || message.type !== "show" || !message.title) return;
  event.waitUntil(show(message));
});

async function show(message) {
  const open = await windows();
  // Already looking at StudyBond: the page shows it and refreshes the inbox.
  const looking = open.find((client) => client.focused && client.visibilityState === "visible" && isAppPage(client));
  if (looking) {
    looking.postMessage({ source: "sb-alerts", type: "note", note: message });
    return;
  }
  for (const client of open) client.postMessage({ source: "sb-alerts", type: "refresh" });

  const actions = Array.isArray(message.actions) ? message.actions : [];
  const max = typeof Notification !== "undefined" && Notification.maxActions ? Notification.maxActions : 2;
  await self.registration.showNotification(message.title, {
    body: message.body || "",
    tag: message.tag || undefined,
    icon: "/icon-192.png",
    badge: "/badge-96.png",
    timestamp: Date.now(),
    data: { url: message.url || "/dashboard/notifications", tag: message.tag || "", actions },
    actions: actions.slice(0, max).map((action) => ({ action: action.id, title: action.title })),
  });
}

/* Opening a note from its alert also marks it read, so it clears on the
   student's other devices. */
function markRead(tag) {
  const id = typeof tag === "string" ? tag.slice(1) : "";
  if (!/^\d+$/.test(id)) return Promise.resolve();
  const path = tag[0] === "a" ? `/api/notifications/notices/${id}/read` : `/api/notifications/notes/${id}/read`;
  return fetch(path, { method: "PATCH", credentials: "include" }).catch(() => undefined);
}

self.addEventListener("notificationclick", (event) => {
  const alert = event.notification;
  const data = alert.data || {};
  alert.close();
  const actions = Array.isArray(data.actions) ? data.actions : [];
  const action = event.action ? actions.find((item) => item.id === event.action) : null;

  // Decline and the like: do it without opening StudyBond.
  if (action && action.post) {
    event.waitUntil(
      Promise.all([
        fetch(action.post, { method: "POST", credentials: "include" }).catch(() => undefined),
        markRead(data.tag),
      ]),
    );
    return;
  }

  const url = (action && action.url) || data.url || "/dashboard/notifications";
  event.waitUntil(Promise.all([openPage(url), markRead(data.tag)]));
});

async function openPage(url) {
  const target = new URL(url, self.location.origin);
  // An outside link (from a notice) always gets its own tab.
  if (target.origin !== self.location.origin) {
    await self.clients.openWindow(target.href);
    return;
  }
  const open = await windows();
  const app = open.find(isAppPage);
  if (app) {
    await app.focus().catch(() => undefined);
    app.postMessage({ source: "sb-alerts", type: "open", url: target.pathname + target.search });
    return;
  }
  const other = open.find((client) => new URL(client.url).origin === self.location.origin);
  if (other && "navigate" in other) {
    try {
      const moved = await other.navigate(target.href);
      if (moved) {
        await moved.focus().catch(() => undefined);
        return;
      }
    } catch {
      /* Not ours to move: open a new tab below. */
    }
  }
  await self.clients.openWindow(target.href);
}

/* The browser replaced our push address: sign the new one up. */
function platformOf(agent) {
  if (/Android/i.test(agent)) return "android";
  if (/iPhone|iPad|iPod/i.test(agent)) return "ios";
  if (/Windows/i.test(agent)) return "windows";
  if (/Macintosh|Mac OS X/i.test(agent)) return "macos";
  if (/Linux|CrOS/i.test(agent)) return "linux";
  return "other";
}

function labelOf(agent) {
  const browser = /Edg\//i.test(agent)
    ? "Edge"
    : /OPR\/|Opera/i.test(agent)
      ? "Opera"
      : /SamsungBrowser/i.test(agent)
        ? "Samsung Internet"
        : /Firefox|FxiOS/i.test(agent)
          ? "Firefox"
          : /Chrome|CriOS/i.test(agent)
            ? "Chrome"
            : /Safari/i.test(agent)
              ? "Safari"
              : "Browser";
  const names = { android: "Android", ios: "iPhone", windows: "Windows", macos: "Mac", linux: "Linux", other: "this device" };
  return `${browser} on ${names[platformOf(agent)]}`;
}

self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const old = event.oldSubscription;
      const key = old && old.options ? old.options.applicationServerKey : null;
      if (!key) return;
      const fresh = event.newSubscription || (await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }));
      const json = fresh.toJSON();
      const agent = self.navigator.userAgent;
      await fetch("/api/notifications/devices", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "WEB",
          endpoint: fresh.endpoint,
          p256dh: json.keys ? json.keys.p256dh : "",
          auth: json.keys ? json.keys.auth : "",
          platform: platformOf(agent),
          label: labelOf(agent),
        }),
      });
      if (old) await stopOld(old.endpoint);
    })().catch(() => undefined),
  );
});

function stopOld(endpoint) {
  return fetch("/api/notifications/devices/stop-this", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint }),
  }).catch(() => undefined);
}
