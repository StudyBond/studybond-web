"use client";

import type { DeviceFingerprintPayload } from "@/lib/api/types";

const INSTALLATION_ID_KEY = "sb.web.installation-id.v1";

function readInstallationId(): string | null {
  try {
    return window.localStorage.getItem(INSTALLATION_ID_KEY);
  } catch {
    return null;
  }
}

function writeInstallationId(value: string): void {
  try {
    window.localStorage.setItem(INSTALLATION_ID_KEY, value);
  } catch {
    // Ignore storage failures and fall back to a transient fingerprint.
  }
}

function getInstallationId(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const existing = readInstallationId();
  if (existing) {
    return existing;
  }

  const generated =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  writeInstallationId(generated);
  return generated;
}

function parseBrowser(userAgent: string): { name?: string; version?: string } {
  const patterns: Array<{ name: string; regex: RegExp }> = [
    { name: "edge", regex: /Edg\/([0-9.]+)/i },
    { name: "chrome", regex: /Chrome\/([0-9.]+)/i },
    { name: "firefox", regex: /Firefox\/([0-9.]+)/i },
    { name: "safari", regex: /Version\/([0-9.]+).*Safari/i },
  ];

  for (const pattern of patterns) {
    const match = userAgent.match(pattern.regex);
    if (match) {
      return { name: pattern.name, version: match[1] };
    }
  }

  return {};
}

function parseOs(userAgent: string): { name?: string; version?: string; model?: string } {
  const iosMatch = userAgent.match(/(iPhone|iPad|iPod).*OS ([0-9_]+)/i);
  if (iosMatch) {
    return {
      name: "ios",
      version: iosMatch[2]?.replace(/_/g, "."),
      model: iosMatch[1]
    };
  }

  const androidMatch = userAgent.match(/Android ([0-9.]+)(?:; ([^)]+?) Build)?/i);
  if (androidMatch) {
    return {
      name: "android",
      version: androidMatch[1],
      model: androidMatch[2]?.split(";").pop()?.trim()
    };
  }

  const windowsMatch = userAgent.match(/Windows NT ([0-9.]+)/i);
  if (windowsMatch) {
    return {
      name: "windows",
      version: windowsMatch[1]
    };
  }

  const macMatch = userAgent.match(/Mac OS X ([0-9_]+)/i);
  if (macMatch) {
    return {
      name: "macos",
      version: macMatch[1]?.replace(/_/g, ".")
    };
  }

  const linuxMatch = userAgent.match(/Linux/i);
  if (linuxMatch) {
    return {
      name: "linux"
    };
  }

  return {};
}

function formatDeviceName(device: {
  browserName?: string;
  osName?: string;
  osVersion?: string;
  model?: string;
}): string {
  const browserName = device.browserName ? device.browserName[0].toUpperCase() + device.browserName.slice(1) : undefined;
  const osLabel = device.osName
    ? `${device.osName[0].toUpperCase() + device.osName.slice(1)}${device.osVersion ? ` ${device.osVersion}` : ""}`
    : undefined;

  if (browserName && device.model) {
    return `${browserName} on ${device.model}`;
  }

  if (browserName && osLabel) {
    return `${browserName} on ${osLabel}`;
  }

  if (device.model) {
    return device.model;
  }

  if (browserName) {
    return `${browserName} Browser`;
  }

  if (osLabel) {
    return osLabel;
  }

  return "Web Browser";
}

export function buildWebDeviceContext(): DeviceFingerprintPayload {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      deviceName: "Web Browser",
      platform: "web"
    };
  }

  const userAgent = navigator.userAgent || "";
  const browser = parseBrowser(userAgent);
  const os = parseOs(userAgent);
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    userAgentData?: { platform?: string };
  };

  const platformVersion =
    typeof navigator.platform === "string" && navigator.platform.trim().length > 0
      ? navigator.platform.trim()
      : nav.userAgentData?.platform;

  const deviceName = formatDeviceName({
    browserName: browser.name,
    osName: os.name,
    osVersion: os.version,
    model: os.model
  });

  return {
    installationId: getInstallationId(),
    deviceName,
    platform: "web",
    platformVersion,
    osName: os.name,
    osVersion: os.version,
    browserName: browser.name,
    browserVersion: browser.version,
    model: os.model,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    vendor: navigator.vendor || undefined,
    userAgent,
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    colorDepth: window.screen?.colorDepth,
    pixelRatio: typeof window.devicePixelRatio === "number" ? window.devicePixelRatio : undefined,
    deviceMemory: typeof nav.deviceMemory === "number" ? nav.deviceMemory : undefined,
    hardwareConcurrency:
      typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : undefined,
    maxTouchPoints:
      typeof navigator.maxTouchPoints === "number" ? navigator.maxTouchPoints : undefined,
  };
}
