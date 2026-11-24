import type { MetadataRoute } from "next";

/* Needed for alerts on iPhone: Safari only sends web alerts to sites added
   to the Home Screen, and it reads this file to make the icon and open
   StudyBond as its own app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/dashboard",
    name: "StudyBond",
    short_name: "StudyBond",
    description: "Real JAMB UTME and UI Post-UTME past questions, timed like the exam.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
