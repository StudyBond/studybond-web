import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

import { HomePreviewArt } from "@/features/landing/home-preview-art";

import { cardFonts } from "../_lib/fonts";

/* The homepage's link preview, and the site's default picture. 1200x630.
   (/api/og stays for pages that print their own title on a picture.) */

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { fonts, families } = await cardFonts();
  return new ImageResponse(<HomePreviewArt u={2} fonts={families} origin={request.nextUrl.origin} />, {
    width: 1200,
    height: 630,
    fonts,
    headers: { "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800" },
  });
}
