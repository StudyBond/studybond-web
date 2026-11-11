import "server-only";

import type { CardFonts } from "@/features/duel/share/card/share-card";

/* Fonts for the share images (next/og).

   next/og can't read woff2, and Satoshi's files must never sit in this
   public repo (licence), so the images fetch the fonts at run time from the
   foundries' own services: Fontshare for Satoshi, Google Fonts for Outfit and
   Plus Jakarta Sans (asked for with a plain user agent, which gets TTF).
   Each file is fetched once per server instance and kept in memory.

   Fallback: any font that fails is left out. Outfit falls back to Plus
   Jakarta Sans, Satoshi too; if everything fails, next/og's built-in font
   draws the card, so an image is always made. */

type Weight = 400 | 500 | 600 | 700 | 800;
type LoadedFont = { name: string; data: ArrayBuffer; weight: Weight; style: "normal" };

const SOURCES: Array<{ name: string; css: string }> = [
  { name: "Outfit", css: "https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700;800" },
  { name: "Satoshi", css: "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" },
  { name: "Jakarta", css: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800" },
];

const TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // A bare user agent: Google then serves TrueType, which next/og can read.
    return await fetch(url, { signal: controller.signal, headers: { "user-agent": "StudyBond-cards/1.0" } });
  } finally {
    clearTimeout(timer);
  }
}

/** Pull (weight, url) pairs a renderer can read (ttf, otf or woff) out of a font CSS file. */
function readFaces(css: string): Array<{ weight: Weight; url: string }> {
  const out: Array<{ weight: Weight; url: string }> = [];
  for (const block of css.split("@font-face").slice(1)) {
    if (/font-style:\s*italic/.test(block)) continue;
    const weight = Number(block.match(/font-weight:\s*(\d+)/)?.[1] ?? 400) as Weight;
    const urls = [...block.matchAll(/url\(([^)]+)\)\s*format\(['"]?([a-z0-9-]+)['"]?\)/gi)].map((m) => ({
      url: m[1].replace(/^['"]|['"]$/g, ""),
      format: m[2].toLowerCase(),
    }));
    const plain = [...block.matchAll(/url\(([^)]+)\)/gi)].map((m) => m[1].replace(/^['"]|['"]$/g, ""));
    const pick =
      urls.find((u) => u.format === "truetype" || u.format === "opentype")?.url ??
      urls.find((u) => u.format === "woff")?.url ??
      plain.find((u) => /\.(ttf|otf|woff)(\?|$)/i.test(u));
    if (pick) out.push({ weight, url: pick.startsWith("//") ? `https:${pick}` : pick });
  }
  return out;
}

async function loadFamily(name: string, cssUrl: string): Promise<LoadedFont[]> {
  try {
    const response = await fetchWithTimeout(cssUrl);
    if (!response.ok) return [];
    const faces = readFaces(await response.text());
    const loaded = await Promise.all(
      faces.map(async ({ weight, url }) => {
        try {
          const file = await fetchWithTimeout(url);
          if (!file.ok) return null;
          return { name, data: await file.arrayBuffer(), weight, style: "normal" as const };
        } catch {
          return null;
        }
      }),
    );
    return loaded.filter((font): font is LoadedFont => Boolean(font));
  } catch {
    return [];
  }
}

let cached: Promise<LoadedFont[]> | null = null;

export async function cardFonts(): Promise<{ fonts: LoadedFont[]; families: CardFonts }> {
  if (!cached) {
    cached = Promise.all(SOURCES.map((s) => loadFamily(s.name, s.css))).then((lists) => lists.flat());
  }
  let fonts = await cached;
  // Nothing at all: try again next time rather than keep a bad cache.
  if (!fonts.length) cached = null;
  const has = (name: string) => fonts.some((font) => font.name === name);
  fonts = fonts.filter(Boolean);
  const head = [has("Outfit") ? "Outfit" : null, has("Jakarta") ? "Jakarta" : null].filter(Boolean).join(", ") || "sans-serif";
  const body = [has("Satoshi") ? "Satoshi" : null, has("Jakarta") ? "Jakarta" : null].filter(Boolean).join(", ") || "sans-serif";
  return { fonts, families: { head, body } };
}
