import type { Answers } from "@/lib/types";

/*
 * Small rules for sharing and keeping a list. Pure, so they're tested on their
 * own (sharing.test.ts).
 */

/** Every key the app saves starts with this, so "Clear everything" can find them all. */
export const STORAGE_PREFIX = "bayready:";

/** Ids on the list page that a link can jump to. A hash that isn't one of these is a shared list. */
export const LIST_ANCHORS = new Set(["first-hour", "essentials", "full-list", "know-your-home", "keep-copy-title"]);

/** Whether the share link would carry names or health needs. */
export function hasPersonalInfo(answers: Answers): boolean {
  const named = [...answers.names.adults, ...answers.names.kids].some((n) => n.trim() !== "");
  return named || (Array.isArray(answers.needs) && answers.needs.length > 0);
}

/** The same answers with names and health needs taken out, for a link to share more widely. */
export function withoutPersonalInfo(answers: Answers): Answers {
  return { ...answers, names: { adults: [], kids: [] }, needs: null };
}

/**
 * The share code from whatever someone pastes: a full link, or just the part
 * after the #. Returns null for an empty paste or a link with no list in it.
 */
export function shareCodeFrom(pasted: string): string | null {
  const text = pasted.trim();
  if (!text) return null;
  const hash = text.includes("#") ? text.slice(text.lastIndexOf("#") + 1) : /^https?:/i.test(text) ? "" : text;
  if (!hash || LIST_ANCHORS.has(hash) || !/^[A-Za-z0-9_-]+$/.test(hash)) return null;
  return hash;
}
