"use client";

import { useEffect } from "react";

/**
 * Registers public/sw.js, which keeps a copy of the pages for offline use.
 * Production builds only, so it never caches a dev server's pages. On GitHub
 * Pages the worker lives under the sub-path and only controls that sub-path.
 */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    // The Pages build gives every page a trailing slash; the worker needs to know which form to cache.
    const slash = base ? "1" : "0";
    navigator.serviceWorker.register(`${base}/sw.js?slash=${slash}`, { scope: `${base}/` }).catch(() => {
      // Offline copies are a bonus. The site works the same without them.
    });
  }, []);
  return null;
}
