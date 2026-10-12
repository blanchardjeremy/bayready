"use client";

import { useSyncExternalStore } from "react";

// When someone jumps from their list into one wizard step to change an answer,
// the wizard offers a way straight back instead of walking every step again.
const KEY = "bayready:returnToList";

export function markReturnToList() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Storage blocked: the wizard just won't show the shortcut.
  }
}

export function clearReturnToList() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

const noop = () => () => {};

export function useReturnToList(): boolean {
  return useSyncExternalStore(
    noop,
    () => {
      try {
        return sessionStorage.getItem(KEY) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
}
