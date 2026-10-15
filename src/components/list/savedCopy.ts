import type { ItemState } from "@/lib/types";

/*
 * Whether someone has kept a copy of their list, and how much has changed since.
 * A "copy" is any print, PDF, spreadsheet, or copied link. The app can't know
 * the copy ended up somewhere safe, so the wording says what they did, not that
 * it's safe. Pure, so it's tested on its own.
 */

/** Saved on the device. Starts with "bayready:" so Clear everything removes it. */
export const SAVED_KEY = "bayready:saved:v1";
/** The Start here task that ticks itself when someone saves a copy. */
export const SAVE_TASK_KEY = "home:save-copy";

export interface SavedCopy {
  /** When, as an ISO date. */
  at: string;
  /** Checkmarks at that moment, to count changes since. */
  states: Record<string, ItemState>;
  /** Know your home and notes at that moment, as JSON. */
  home: string;
}

export function normalizeSaved(v: unknown): SavedCopy | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.at !== "string" || Number.isNaN(Date.parse(o.at)) || typeof o.home !== "string") return null;
  const states: Record<string, ItemState> = {};
  if (o.states && typeof o.states === "object")
    for (const [k, s] of Object.entries(o.states)) if (s === "need" || s === "have" || s === "skip") states[k] = s;
  return { at: o.at, states, home: o.home };
}

/** How many checkmarks changed since the copy, plus one if Know your home or the notes did. */
export function changesSince(saved: SavedCopy, states: Record<string, ItemState>, home: string): number {
  const keys = new Set([...Object.keys(saved.states), ...Object.keys(states)]);
  keys.delete(SAVE_TASK_KEY);
  let n = 0;
  for (const k of keys) if ((saved.states[k] ?? "need") !== (states[k] ?? "need")) n++;
  return n + (saved.home === home ? 0 : 1);
}
