import type { HazardId } from "@/lib/types";
import type { Lang } from "@/i18n/lang";
import { HAZARDS_ES } from "@/i18n/es/hazards";

export interface Hazard {
  id: HazardId;
  name: string;
  short: string;
  blurb: string;
}

export const HAZARDS: Hazard[] = [
  {
    id: "earthquake",
    name: "Earthquake",
    short: "Quake",
    blurb: "Water, gas, and power can be out for days, and water for weeks in some areas.",
  },
  {
    id: "outage",
    name: "Power outage",
    short: "Outage",
    blurb: "Including planned shutoffs on hot, windy days.",
  },
  {
    id: "smoke",
    name: "Wildfire smoke",
    short: "Smoke",
    blurb: "Bad air can reach every part of the Bay, even far from a fire.",
  },
  {
    id: "wildfire",
    name: "Wildfire evacuation",
    short: "Wildfire",
    blurb: "Leaving fast if a fire is near you.",
  },
  {
    id: "heat",
    name: "Extreme heat",
    short: "Heat",
    blurb: "Hot spells, especially inland and in homes without AC.",
  },
  {
    id: "flood",
    name: "Winter storms & flooding",
    short: "Storm",
    blurb: "Atmospheric rivers, flooding, downed trees, and mudslides.",
  },
  {
    id: "tsunami",
    name: "Tsunami",
    short: "Tsunami",
    blurb: "For homes near the coast or low-lying bay shoreline.",
  },
  {
    id: "chemical",
    name: "Chemical release",
    short: "Chemical",
    blurb: "Sheltering indoors if there's a refinery or industrial accident nearby.",
  },
];

export const HAZARD_BY_ID = Object.fromEntries(HAZARDS.map((h) => [h.id, h])) as Record<HazardId, Hazard>;

/** Hazards in a language, same order as HAZARDS. */
export function hazardsFor(lang: Lang): Hazard[] {
  return lang === "es" ? HAZARDS.map((h) => ({ ...h, ...HAZARDS_ES[h.id] })) : HAZARDS;
}

/** One hazard by id, in a language. */
export function hazardFor(id: HazardId, lang: Lang): Hazard {
  return lang === "es" ? { ...HAZARD_BY_ID[id], ...HAZARDS_ES[id] } : HAZARD_BY_ID[id];
}
