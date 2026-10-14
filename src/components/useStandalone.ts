"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(display-mode: standalone)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** Whether the site is running as an app opened from the Home Screen, not in a browser tab. */
export function useStandalone(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches || (navigator as Navigator & { standalone?: boolean }).standalone === true,
    () => false,
  );
}
