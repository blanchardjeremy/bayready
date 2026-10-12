import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, deriveContext, normalizeAnswers } from "./answers";
import { buildList, slotDone, slotKey, stateOf } from "./buildList";
import { decodeShare, encodeShare } from "./share";
import type { Answers, ItemState } from "./types";
import { ITEMS } from "@/data/items";
import { SHARE_IDS } from "@/data/shareIds";

const family: Answers = {
  ...EMPTY_ANSWERS,
  build: "both",
  county: "alameda",
  hazards: ["earthquake", "outage", "wildfire"],
  household: { adults: 2, kids: 1, babies: 0, dogs: 1, cats: 0, otherPets: 0 },
  have: ["flashlight", "water"],
};

/** What every row and person chip shows, so links can be compared by what people see. */
function shown(a: Answers, states: Record<string, ItemState>) {
  const out: Record<string, string> = {};
  for (const e of buildList(deriveContext(a), ITEMS)) {
    out[e.key] = stateOf(e, states, a);
    e.slots.forEach((_, i) => (out[slotKey(e, i)] = String(slotDone(e, i, states, a))));
  }
  return out;
}

const roundTrip = (a: Answers, s: Record<string, ItemState> = {}) => decodeShare("#" + encodeShare(a, s));

describe("share links", () => {
  it("round-trips every kind of answer", () => {
    const a: Answers = {
      ...family,
      names: { adults: ["Sam", "José"], kids: ["", "Bea 🐝"] },
      household: { ...family.household, kids: 2, cats: 7 },
      needs: ["meds", "diet"],
      level: "advanced",
      start: "weeks",
      budget: "150",
      home: "apartment-high",
      days: 14,
      car: "sometimes",
      power: ["charge", "cold"],
    };
    expect(roundTrip(a)?.answers).toEqual(a);
    expect(roundTrip({ ...family, needs: "private" })?.answers.needs).toBe("private");
  });

  it("drops trailing blank names, which mean the same as none", () => {
    const a = { ...family, names: { adults: ["Sam", ""], kids: [""] } };
    expect(roundTrip(a)?.answers.names).toEqual({ adults: ["Sam"], kids: [] });
  });

  it("round-trips a few marks, including people and unticked have-picks", () => {
    const states: Record<string, ItemState> = {
      "stay:water": "need", // pre-ticked by the "have" pick, then unticked
      "home:shutoffs": "have",
      "stay:radio": "skip",
      "home:alerts@1": "have",
    };
    const decoded = roundTrip(family, states)!;
    expect(shown(family, decoded.states)).toEqual(shown(family, states));
    expect(decoded.states).toEqual(states);
  });

  it("round-trips a mostly-ticked list", () => {
    const states: Record<string, ItemState> = {};
    buildList(deriveContext(family), ITEMS).forEach((e, i) => (states[e.key] = i % 7 === 0 ? "skip" : "have"));
    expect(shown(family, roundTrip(family, states)!.states)).toEqual(shown(family, states));
  });

  it("keeps links short", () => {
    const states: Record<string, ItemState> = {};
    buildList(deriveContext(family), ITEMS)
      .slice(0, 15)
      .forEach((e) => (states[e.key] = "have"));
    expect(encodeShare(family, states).length).toBeLessThan(40);
    expect(encodeShare(family).length).toBeLessThan(12);
  });

  it("still opens a link made in October 2026", () => {
    // Links people already sent have to keep working as items and options are added.
    // If this fails, an append-only list was reordered or the format changed.
    const decoded = decodeShare("#SIuyIIlgBmaK_L1F0ETMPMg")!;
    expect(decoded.answers).toEqual({ ...family, names: { adults: ["Sam"], kids: [] } });
    expect(decoded.states).toEqual({
      "home:alerts@1": "have",
      "home:shutoffs": "have",
      "stay:water": "need",
      "stay:radio": "skip",
    });
  });

  it("gives every item a permanent number", () => {
    const missing = ITEMS.map((i) => i.id).filter((id) => !SHARE_IDS.includes(id));
    expect(missing, "Add these to the end of SHARE_IDS in src/data/shareIds.ts").toEqual([]);
    expect(new Set(SHARE_IDS).size).toBe(SHARE_IDS.length);
  });

  it("rejects garbage", () => {
    expect(decodeShare("#not-base64!!")).toBeNull();
    expect(decodeShare("#")).toBeNull();
    expect(decodeShare("#____")).toBeNull();
  });

  it("matches normalized answers", () => {
    const a = normalizeAnswers({ ...family, household: { adults: 30 } });
    expect(roundTrip(a)?.answers).toEqual(a);
  });
});
