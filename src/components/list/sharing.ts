import type { Answers, ItemState } from "@/lib/types";

/*
 * Small rules for sharing and keeping a list. Pure, so they're tested on their
 * own (sharing.test.ts).
 */

/** Every key the app saves starts with this, so "Clear everything" can find them all. */
export const STORAGE_PREFIX = "bayready:";

/** Set once someone hides the "Save your list" card. */
export const SAVE_PROMPT_KEY = "bayready:savePrompt:v1";

/** Ids on the list page that a link can jump to. A hash that isn't one of these is a shared list. */
export const LIST_ANCHORS = new Set(["first-hour", "essentials", "full-list", "know-your-home"]);

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
 * "Save your list" shows on someone's own list once they've checked something
 * off themselves (not just the wizard's "have" picks), until they hide it.
 */
export function shouldOfferSave({
  shared,
  dismissed,
  states,
}: {
  shared: boolean;
  dismissed: boolean;
  states: Record<string, ItemState>;
}): boolean {
  if (shared || dismissed) return false;
  return Object.values(states).includes("have");
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
