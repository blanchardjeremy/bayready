"use client";

import { useSyncExternalStore } from "react";
import { LANG_KEY, pickLang, type Lang } from "./lang";
import { messagesFor, type Messages } from "./messages";

// The language lives in localStorage like the rest of the app's state, so it
// survives reloads, and a share link opens in the viewer's language, not the sender's.

const listeners = new Set<() => void>();
// Used when storage is blocked, so switching still works for this visit.
let chosen: Lang | null = null;

function saved(): string | null {
  try {
    return window.localStorage.getItem(LANG_KEY) ?? chosen;
  } catch {
    return chosen;
  }
}

function current(): Lang {
  return pickLang(saved(), navigator.languages?.length ? navigator.languages : [navigator.language]);
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  window.addEventListener("languagechange", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
    window.removeEventListener("languagechange", cb);
  };
}

/** The language to show. English during the server render and first paint, then the visitor's. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribe, current, () => "en");
}

export function setLang(lang: Lang) {
  chosen = lang;
  try {
    window.localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Not saved, but it still switches for this visit.
  }
  document.documentElement.lang = lang;
  listeners.forEach((l) => l());
}

/** All of the app's words in the current language. */
export function useT(): Messages {
  return messagesFor(useLang());
}
