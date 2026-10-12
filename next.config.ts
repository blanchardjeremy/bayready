import type { NextConfig } from "next";

// GitHub Pages serves a static copy of the site from a sub-path
// (https://<user>.github.io/<repo>/). The deploy workflow sets PAGES_BASE_PATH;
// local dev and `npm run build` without it work as a normal Next.js app.
const basePath = process.env.PAGES_BASE_PATH ?? "";
const pages = basePath !== "";

const nextConfig: NextConfig = {
  ...(pages ? { output: "export", basePath, trailingSlash: true } : {}),
  env: {
    // Read by the few places that build full URLs by hand (share links, calendar files).
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
