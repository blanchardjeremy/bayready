import type { Answers, Container, Context, HazardId, Names, NeedId } from "./types";

export const ANSWERS_KEY = "bayready:answers:v1";
export const STATES_KEY = "bayready:items:v1";

/** Hazards picked for everyone unless they change them. */
export const BASE_HAZARDS: HazardId[] = ["earthquake", "outage", "smoke"];

export const EMPTY_ANSWERS: Answers = {
  build: null,
  county: null,
  hazards: [],
  household: { adults: 1, kids: 0, babies: 0, dogs: 0, cats: 0, otherPets: 0 },
  names: { adults: [], kids: [] },
  needs: null,
  have: [],
  level: "basics",
  start: null,
  budget: null,
  home: null,
  days: null,
  car: null,
  power: [],
};

/** Used by "skip the questions": a sensible one-person starter list. */
export const STARTER_ANSWERS: Answers = {
  ...EMPTY_ANSWERS,
  build: "stay",
  hazards: [...BASE_HAZARDS],
};

/**
 * Days of supplies at home. Bay Area agencies (ReadySF, EBMUD, Cal OES) say about
 * a week; CDC and Red Cross say two weeks. See research/supplies.md §1.
 */
export const BASICS_STAY_DAYS = 7;
export const DEFAULT_ADVANCED_STAY_DAYS = 14;
/** A go bag is sized for about 3 days on the move. */
export const GO_DAYS = 3;

/** Most people the app tracks separately (go bags, per-adult to-dos). */
export const MAX_PEOPLE = 8;

/** The default label for a person when they haven't been named. */
export function defaultName(role: "adults" | "kids", i: number): string {
  if (role === "adults") return i === 0 ? "Me" : `Adult ${i + 1}`;
  return `Kid ${i + 1}`;
}

/** Everyone who can carry a bag, adults first: the names people gave, or "Me", "Adult 2", "Kid 1". */
export function peopleNames(ctx: Pick<Context, "adults" | "kids"> & { names?: Names }): string[] {
  const pick = (role: "adults" | "kids", i: number) => ctx.names?.[role][i]?.trim() || defaultName(role, i);
  const names = [
    ...Array.from({ length: ctx.adults }, (_, i) => pick("adults", i)),
    ...Array.from({ length: ctx.kids }, (_, i) => pick("kids", i)),
  ];
  return names.slice(0, MAX_PEOPLE);
}

export function resolveBuild(a: Answers): "stay" | "go" | "both" {
  if (a.build === "stay" || a.build === "go" || a.build === "both") return a.build;
  return suggestBuild(a);
}

/** For "not sure": leaving is likely with wildfire or tsunami, so suggest both. */
export function suggestBuild(a: Answers): "stay" | "both" {
  return a.hazards.includes("wildfire") || a.hazards.includes("tsunami") ? "both" : "stay";
}

export function deriveContext(a: Answers): Context {
  const build = resolveBuild(a);
  const kits: Container[] = [];
  if (build === "stay" || build === "both") kits.push("stay");
  if (build === "go" || build === "both") kits.push("go");
  if (a.level === "advanced" && (a.car === "yes" || a.car === "sometimes")) kits.push("car");
  kits.push("home");

  const h = a.household;
  const adults = Math.max(0, h.adults);
  const people = Math.max(1, adults + h.kids + h.babies);
  const needs = new Set<NeedId>(Array.isArray(a.needs) ? a.needs : []);
  // Home oxygen runs on power too, so it gets everything a powered device does, plus its own fire and backup steps.
  if (needs.has("oxygen")) needs.add("power-device");
  const hazards = new Set<HazardId>(a.hazards.length ? a.hazards : BASE_HAZARDS);

  return {
    answers: a,
    kits,
    hazards,
    level: a.level,
    people,
    names: a.names ?? EMPTY_ANSWERS.names,
    carriers: Math.max(1, adults + h.kids),
    adults: Math.max(1, adults),
    kids: h.kids,
    babies: h.babies,
    dogs: h.dogs,
    cats: h.cats,
    otherPets: h.otherPets,
    pets: h.dogs + h.cats + h.otherPets,
    needs,
    stayDays: a.level === "advanced" ? (a.days ?? DEFAULT_ADVANCED_STAY_DAYS) : BASICS_STAY_DAYS,
    goDays: GO_DAYS,
    home: a.home,
    car: a.car,
    power: new Set(a.level === "advanced" ? a.power : []),
  };
}

// Every allowed value, in a fixed order. Share links store positions in these
// lists, so only ever add to the end, and never remove or reorder.
export const BUILDS = ["stay", "go", "both", "unsure"] as const;
export const COUNTY_IDS = [
  "alameda", "contra-costa", "marin", "napa", "san-francisco", "san-mateo",
  "santa-clara", "santa-cruz", "solano", "sonoma", "other", "private",
] as const;
export const HAZARD_IDS = ["earthquake", "outage", "smoke", "wildfire", "heat", "flood", "tsunami", "chemical"] as const;
export const NEED_IDS = ["meds", "cold-meds", "power-device", "mobility", "vision-hearing", "diet", "oxygen"] as const;
export const STARTS = ["weekend", "weeks", "month", "unsure"] as const;
export const BUDGETS = ["0", "50", "150", "more", "unsure"] as const;
export const HOMES = ["house", "apartment-low", "apartment-high", "other"] as const;
export const DAYS = [7, 14] as const;
export const CARS = ["yes", "no", "sometimes"] as const;
export const POWERS = ["cook", "charge", "cold"] as const;
export const LEVELS = ["basics", "advanced"] as const;
/** Most people (or pets) of one kind in a household. */
export const MAX_COUNT = 20;
/** Longest name, in characters. */
export const MAX_NAME = 30;

/** Merge untrusted input over defaults, keeping only well-typed fields. */
export function normalizeAnswers(input: unknown): Answers {
  const a: Answers = { ...EMPTY_ANSWERS, household: { ...EMPTY_ANSWERS.household }, names: { adults: [], kids: [] } };
  if (!input || typeof input !== "object") return a;
  const i = input as Record<string, unknown>;
  const pick = <T,>(v: unknown, allowed: readonly T[]): T | null =>
    allowed.includes(v as T) ? (v as T) : null;
  const pickArr = <T,>(v: unknown, allowed: readonly T[]): T[] =>
    Array.isArray(v) ? (v.filter((x) => allowed.includes(x as T)) as T[]) : [];

  a.build = pick(i.build, BUILDS);
  a.county = pick(i.county, COUNTY_IDS);
  a.hazards = pickArr(i.hazards, HAZARD_IDS);
  if (i.household && typeof i.household === "object") {
    const h = i.household as Record<string, unknown>;
    for (const k of Object.keys(a.household) as (keyof Answers["household"])[]) {
      const n = Number(h[k]);
      if (Number.isFinite(n)) a.household[k] = Math.min(MAX_COUNT, Math.max(0, Math.round(n)));
    }
  }
  if (i.names && typeof i.names === "object") {
    const n = i.names as Record<string, unknown>;
    const clean = (v: unknown) =>
      Array.isArray(v) ? v.slice(0, MAX_PEOPLE).map((x) => (typeof x === "string" ? x.trim().slice(0, MAX_NAME) : "")) : [];
    a.names = { adults: clean(n.adults), kids: clean(n.kids) };
  }
  a.needs =
    i.needs === "private"
      ? "private"
      : Array.isArray(i.needs)
        ? pickArr(i.needs, NEED_IDS)
        : null;
  a.have = Array.isArray(i.have) ? i.have.filter((x): x is string => typeof x === "string").slice(0, 50) : [];
  a.level = i.level === "advanced" ? "advanced" : "basics";
  a.start = pick(i.start, STARTS);
  a.budget = pick(i.budget, BUDGETS);
  a.home = pick(i.home, HOMES);
  a.days = pick(i.days, DAYS);
  a.car = pick(i.car, CARS);
  a.power = pickArr(i.power, POWERS);
  return a;
}
