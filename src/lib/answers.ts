import type { Answers, Container, Context, HazardId, ItemState, Names, NeedId } from "./types";

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
    home: a.level === "advanced" ? a.home : null,
    car: a.level === "advanced" ? a.car : null,
    power: new Set(a.level === "advanced" ? a.power : []),
  };
}

// ---- Share links -----------------------------------------------------------
// Answers go in the URL fragment so nothing reaches a server.

function toBase64Url(s: string) {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShare(a: Answers, states?: Record<string, ItemState>): string {
  return toBase64Url(JSON.stringify({ v: 1, a, s: states ?? {} }));
}

export function decodeShare(hash: string): { answers: Answers; states: Record<string, ItemState> } | null {
  try {
    const raw = JSON.parse(fromBase64Url(hash.replace(/^#/, "")));
    if (!raw || raw.v !== 1 || typeof raw.a !== "object") return null;
    const answers = normalizeAnswers(raw.a);
    const states: Record<string, ItemState> = {};
    if (raw.s && typeof raw.s === "object") {
      for (const [k, v] of Object.entries(raw.s)) {
        if (v === "need" || v === "have" || v === "skip") states[k] = v;
      }
    }
    return { answers, states };
  } catch {
    return null;
  }
}

/** Merge untrusted input over defaults, keeping only well-typed fields. */
export function normalizeAnswers(input: unknown): Answers {
  const a: Answers = { ...EMPTY_ANSWERS, household: { ...EMPTY_ANSWERS.household }, names: { adults: [], kids: [] } };
  if (!input || typeof input !== "object") return a;
  const i = input as Record<string, unknown>;
  const pick = <T,>(v: unknown, allowed: readonly T[]): T | null =>
    allowed.includes(v as T) ? (v as T) : null;
  const pickArr = <T,>(v: unknown, allowed: readonly T[]): T[] =>
    Array.isArray(v) ? (v.filter((x) => allowed.includes(x as T)) as T[]) : [];

  a.build = pick(i.build, ["stay", "go", "both", "unsure"] as const);
  a.county = pick(i.county, [
    "alameda", "contra-costa", "marin", "napa", "san-francisco", "san-mateo",
    "santa-clara", "santa-cruz", "solano", "sonoma", "other", "private",
  ] as const);
  a.hazards = pickArr(i.hazards, ["earthquake", "outage", "smoke", "wildfire", "heat", "flood", "tsunami", "chemical"] as const);
  if (i.household && typeof i.household === "object") {
    const h = i.household as Record<string, unknown>;
    for (const k of Object.keys(a.household) as (keyof Answers["household"])[]) {
      const n = Number(h[k]);
      if (Number.isFinite(n)) a.household[k] = Math.min(20, Math.max(0, Math.round(n)));
    }
  }
  if (i.names && typeof i.names === "object") {
    const n = i.names as Record<string, unknown>;
    const clean = (v: unknown) =>
      Array.isArray(v) ? v.slice(0, MAX_PEOPLE).map((x) => (typeof x === "string" ? x.trim().slice(0, 30) : "")) : [];
    a.names = { adults: clean(n.adults), kids: clean(n.kids) };
  }
  a.needs =
    i.needs === "private"
      ? "private"
      : Array.isArray(i.needs)
        ? pickArr(i.needs, ["meds", "power-device", "mobility", "vision-hearing", "diet"] as const)
        : null;
  a.have = Array.isArray(i.have) ? i.have.filter((x): x is string => typeof x === "string").slice(0, 50) : [];
  a.level = i.level === "advanced" ? "advanced" : "basics";
  a.start = pick(i.start, ["weekend", "weeks", "month", "unsure"] as const);
  a.budget = pick(i.budget, ["0", "50", "150", "more", "unsure"] as const);
  a.home = pick(i.home, ["house", "apartment-low", "apartment-high", "other"] as const);
  a.days = pick(i.days, [7, 14] as const);
  a.car = pick(i.car, ["yes", "no", "sometimes"] as const);
  a.power = pickArr(i.power, ["cook", "charge", "cold"] as const);
  return a;
}
