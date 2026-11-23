import { Caveat } from "next/font/google";

/* The report card's red-ink remark is handwritten, like a teacher's line on
   a school report. Loaded only where Home uses it, never preloaded. */
export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});
