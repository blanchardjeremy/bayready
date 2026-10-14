import type { Context, HazardId } from "@/lib/types";
import { MAX_PEOPLE, peopleNames } from "@/lib/answers";

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
  | "localContact"
  | "meetOutside"
  | "meetNearby"
  | "phones"
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
  { id: "localContact", label: "Local backup contact", hint: "Someone close by who can help if you can't get home. Name and number.", task: "contact", show: () => true },
  { id: "meetOutside", label: "Meeting spot outside", hint: "Right outside, if you have to leave the house fast.", task: "contact", show: () => true },
  { id: "meetNearby", label: "Meeting spot nearby", hint: "Outside the neighborhood, if you can't get home.", task: "contact", show: () => true },
  { id: "phones", label: "Cell numbers", hint: "On paper, in case a phone dies.", task: "contact", show: () => true },
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
  /** Where each person's go bag is, in the same order as their names. */
  bags: string[];
  /** Each person's cell number, in the same order as their names. Older saves don't have it. */
  phones?: string[];
  notes: string;
}

export const HOME_KEY = "bayready:home:v1";
export const EMPTY_HOME: HomeInfo = { facts: {}, bags: [], phones: [], notes: "" };

/** Facts with a box for each person, and where in HomeInfo those answers live. */
const PER_PERSON = { goBags: "bags", phones: "phones" } as const;
type PerPersonId = keyof typeof PER_PERSON;
const isPerPerson = (id: HomeFactId): id is PerPersonId => id in PER_PERSON;

/** One box to fill in. Most facts are one box; go bags and cell numbers are one per person. */
export interface FactField {
  key: string;
  fact: HomeFact;
  label: string;
  value: string;
  /** Whose box, for facts with one box per person: an index into peopleNames. */
  person?: number;
  /** Whose go bag. The same as `person`, but only set on go bag boxes. */
  bag?: number;
}

/** Who gets a box: everyone who carries a go bag, or everyone for cell numbers. */
function peopleFor(id: PerPersonId, ctx: Context): string[] {
  const names = peopleNames(ctx);
  return id === "goBags" ? names.slice(0, ctx.carriers) : names;
}

function personLabel(id: PerPersonId, name: string, solo: boolean): string {
  if (id === "goBags") return solo ? "Go bag is" : name === "Me" ? "My go bag is" : `${name}'s go bag is`;
  return name === "Me" ? "My cell" : `${name}'s cell`;
}

export function factFields(facts: HomeFact[], ctx: Context, home: HomeInfo): FactField[] {
  return facts.flatMap((fact): FactField[] => {
    const id = fact.id;
    if (!isPerPerson(id)) return [{ key: id, fact, label: fact.label, value: home.facts[id] ?? "" }];
    const names = peopleFor(id, ctx);
    const values = home[PER_PERSON[id]] ?? [];
    return names.map((name, i) => ({
      key: `${id === "goBags" ? "bag" : "phone"}-${i}`,
      fact,
      label: personLabel(id, name, names.length === 1),
      value: values[i] ?? "",
      person: i,
      ...(id === "goBags" ? { bag: i } : {}),
    }));
  });
}

/** Saves one box's new value. */
export function setField(home: HomeInfo, field: FactField, value: string): HomeInfo {
  const id = field.fact.id;
  if (!isPerPerson(id) || field.person === undefined) return { ...home, facts: { ...home.facts, [id]: value } };
  const list = [...(home[PER_PERSON[id]] ?? [])];
  while (list.length < field.person) list.push("");
  list[field.person] = value;
  return { ...home, [PER_PERSON[id]]: list };
}

export function hasHomeInfo(home: HomeInfo) {
  return [home.notes, ...home.bags, ...(home.phones ?? []), ...Object.values(home.facts)].some((v) => v?.trim());
}

/** Clean up whatever is in storage, so an old or odd value can't break the page. */
export function normalizeHome(input: unknown): HomeInfo {
  const out: HomeInfo = { facts: {}, bags: [], phones: [], notes: "" };
  if (!input || typeof input !== "object") return out;
  const i = input as Record<string, unknown>;
  if (i.facts && typeof i.facts === "object") {
    for (const f of HOME_FACTS) {
      if (isPerPerson(f.id) && f.id !== "goBags") continue;
      const v = (i.facts as Record<string, unknown>)[f.id];
      if (typeof v === "string") out.facts[f.id] = v.slice(0, 200);
    }
  }
  const perPerson = (v: unknown) =>
    Array.isArray(v) ? v.slice(0, MAX_PEOPLE).map((s) => (typeof s === "string" ? s.slice(0, 200) : "")) : [];
  out.bags = perPerson(i.bags);
  out.phones = perPerson(i.phones);
  // Before go bags had a box per person, there was one shared box.
  if (out.facts.goBags && !out.bags.some(Boolean)) out.bags = [out.facts.goBags];
  delete out.facts.goBags;
  if (typeof i.notes === "string") out.notes = i.notes.slice(0, 4000);
  return out;
}
