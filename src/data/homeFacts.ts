import type { Context, HazardId } from "@/lib/types";

/**
 * "Know your home": the things the to-dos ask people to find out, written
 * down in one place. Shown as a card on the list, as small fields on the task
 * each one belongs to, and on the spreadsheet's Overview tab.
 *
 * These stay on the device. They're in the spreadsheet export, but never in
 * share links, since some (like where the spare key is) are private.
 */
export type HomeFactId =
  | "gas"
  | "water"
  | "breaker"
  | "contact"
  | "meetOutside"
  | "meetNearby"
  | "stayBin"
  | "goBags"
  | "spareKey"
  | "evacZone"
  | "kidsPickup"
  | "pets";

export interface HomeFact {
  id: HomeFactId;
  label: string;
  hint: string;
  /** The list item whose row shows this field. */
  task: string;
  show: (ctx: Context) => boolean;
}

const leaving = (ctx: Context) => (["wildfire", "flood", "tsunami"] as HazardId[]).some((h) => ctx.hazards.has(h));

export const HOME_FACTS: HomeFact[] = [
  { id: "gas", label: "Gas shutoff", hint: "Where the meter and valve are, and where the wrench is. Only shut it off if you smell gas or hear hissing.", task: "shutoffs", show: () => true },
  { id: "water", label: "Water shutoff", hint: "Close it if pipes break after a quake.", task: "shutoffs", show: () => true },
  { id: "breaker", label: "Breaker box", hint: "Where it is, and which switch is the main.", task: "shutoffs", show: () => true },
  { id: "contact", label: "Out-of-area contact", hint: "Name and number everyone texts after a disaster.", task: "contact", show: () => true },
  { id: "meetOutside", label: "Meeting spot outside", hint: "Right outside, if you have to leave the house fast.", task: "contact", show: () => true },
  { id: "meetNearby", label: "Meeting spot nearby", hint: "Outside the neighborhood, if you can't get home.", task: "contact", show: () => true },
  { id: "stayBin", label: "Stay-at-home bin is", hint: "Somewhere you can reach after a quake.", task: "bin", show: (ctx) => ctx.kits.includes("stay") },
  { id: "goBags", label: "Go bags are", hint: "By the door you'd use.", task: "backpack", show: (ctx) => ctx.kits.includes("go") },
  { id: "spareKey", label: "Spare key is with", hint: "A neighbor, friend, or lockbox.", task: "neighbor", show: () => true },
  { id: "evacZone", label: "Evacuation zone", hint: "Alerts name the zone, so you'll know right away when it's yours.", task: "evac-zone", show: leaving },
  { id: "kidsPickup", label: "Picks up the kids", hint: "If you can't get to school. Make sure they're on the school's emergency card.", task: "school-plan", show: (ctx) => ctx.kids + ctx.babies > 0 },
  { id: "pets", label: "Grabs the pets", hint: "A neighbor who can get them if you're not home.", task: "pet-tags", show: (ctx) => ctx.pets > 0 },
];

export function homeFacts(ctx: Context): HomeFact[] {
  return HOME_FACTS.filter((f) => f.show(ctx));
}

/** What people have written down. Saved on the device only. */
export interface HomeInfo {
  facts: Partial<Record<HomeFactId, string>>;
  notes: string;
}

export const HOME_KEY = "bayready:home:v1";
export const EMPTY_HOME: HomeInfo = { facts: {}, notes: "" };

/** Clean up whatever is in storage, so an old or odd value can't break the page. */
export function normalizeHome(input: unknown): HomeInfo {
  const out: HomeInfo = { facts: {}, notes: "" };
  if (!input || typeof input !== "object") return out;
  const i = input as Record<string, unknown>;
  if (i.facts && typeof i.facts === "object") {
    for (const f of HOME_FACTS) {
      const v = (i.facts as Record<string, unknown>)[f.id];
      if (typeof v === "string") out.facts[f.id] = v.slice(0, 200);
    }
  }
  if (typeof i.notes === "string") out.notes = i.notes.slice(0, 4000);
  return out;
}
