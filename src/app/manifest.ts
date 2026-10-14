import type { MetadataRoute } from "next";
import { sitePath } from "@/lib/urls";

// Written to a file at build time, including the GitHub Pages export.
export const dynamic = "force-static";

/**
 * Lets people add Bay Ready to their Home Screen as an app. On iPhone that
 * also keeps the list safe from Safari clearing saved data after a week away.
 * Paths include the GitHub Pages sub-path when there is one.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bay Ready: your emergency kit list",
    short_name: "Bay Ready",
    description: "A Bay Area emergency kit list sized for your household. Works offline.",
    id: sitePath("/"),
    start_url: sitePath("/list"),
    scope: sitePath("/"),
    display: "standalone",
    background_color: "#e9eef0",
    theme_color: "#e9eef0",
    icons: [
      { src: `${sitePath("/")}icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${sitePath("/")}icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${sitePath("/")}icons/maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
