import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, STARTER_ANSWERS, decodeShare, deriveContext, encodeShare, normalizeAnswers, peopleNames } from "./answers";
import { buildList, slotDone, stageOf, stateOf } from "./buildList";
import { ITEMS, stayWaterGallons } from "@/data/items";
import type { Answers } from "./types";

const answers = (patch: Partial<Answers> = {}): Answers => ({ ...STARTER_ANSWERS, ...patch });
const list = (a: Answers) => buildList(deriveContext(a), ITEMS);
const ids = (a: Answers) => new Set(list(a).map((e) => e.key));

describe("item data", () => {
  it("has unique ids", () => {
    const seen = new Set<string>();
    for (const item of ITEMS) {
      expect(seen.has(item.id), item.id).toBe(false);
      seen.add(item.id);
    }
  });

  it("evaluates every item for a maxed-out household without throwing", () => {
    const a = answers({
      build: "both",
      county: "contra-costa",
      hazards: ["earthquake", "outage", "smoke", "wildfire", "heat", "flood", "tsunami", "chemical"],
      household: { adults: 3, kids: 2, babies: 1, dogs: 2, cats: 1, otherPets: 1 },
      needs: ["meds", "power-device", "mobility", "vision-hearing", "diet"],
      level: "advanced",
      home: "house",
      car: "yes",
      power: ["cook", "charge", "cold"],
    });
    const entries = list(a);
    expect(entries.length).toBeGreaterThan(100);
    for (const e of entries) {
      expect(e.cost[0]).toBeLessThanOrEqual(e.cost[1]);
      expect(Number.isFinite(e.cost[1])).toBe(true);
    }
  });
});

describe("buildList", () => {
  it("starter list is a stay bin plus home tasks, no go bag", () => {
    const keys = ids(STARTER_ANSWERS);
    expect(keys.has("stay:water")).toBe(true);
    expect(keys.has("home:alerts")).toBe(true);
    expect(keys.has("go:backpack")).toBe(false);
  });

  it("puts items needed in larger amounts at home in both kits", () => {
    const keys = ids(answers({ build: "both" }));
    expect(keys.has("stay:n95")).toBe(true);
    expect(keys.has("go:n95")).toBe(true);
  });

  it("doesn't duplicate go bag gear in the stay bin when building both", () => {
    expect(ids(answers({ build: "stay" })).has("stay:first-aid")).toBe(true);
    const both = ids(answers({ build: "both" }));
    expect(both.has("go:first-aid")).toBe(true);
    expect(both.has("stay:first-aid")).toBe(false);
  });

  it("skips hazard-specific items for hazards not picked", () => {
    expect(ids(answers({ hazards: ["earthquake"] })).has("stay:box-fan-filter")).toBe(false);
    expect(ids(answers({ hazards: ["smoke"] })).has("stay:box-fan-filter")).toBe(true);
  });

  it("adds baby and pet items only when needed", () => {
    expect(ids(answers()).has("stay:diapers")).toBe(false);
    const keys = ids(answers({ household: { ...EMPTY_ANSWERS.household, babies: 1, cats: 1 } }));
    expect(keys.has("stay:diapers")).toBe(true);
    expect(keys.has("stay:litter")).toBe(true);
  });

  it("promotes power backup to basics for power-dependent devices", () => {
    const plain = list(answers()).find((e) => e.key === "stay:power-station");
    const device = list(answers({ needs: ["power-device"] })).find((e) => e.key === "stay:power-station");
    expect(plain?.level).toBe("advanced");
    expect(device?.level).toBe("basics");
  });

  it("adds a car kit only for advanced users with a car", () => {
    expect(ids(answers({ car: "yes" })).has("car:car-water")).toBe(false);
    expect(ids(answers({ level: "advanced", car: "yes" })).has("car:car-water")).toBe(true);
    expect(ids(answers({ level: "advanced", car: "no" })).has("car:car-water")).toBe(false);
  });
});

describe("quantities", () => {
  it("water is 1 gallon per person per day for 7 days at basics, plus pets", () => {
    const ctx = deriveContext(answers({ household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 1 } }));
    expect(ctx.stayDays).toBe(7);
    expect(stayWaterGallons(ctx)).toBe(21);
    const withDog = deriveContext(answers({ household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 1, dogs: 1 } }));
    expect(stayWaterGallons(withDog)).toBe(25); // 21 + 0.5 × 7, rounded up
  });

  it("advanced defaults to 14 days and honors a 7-day choice", () => {
    expect(deriveContext(answers({ level: "advanced" })).stayDays).toBe(14);
    expect(deriveContext(answers({ level: "advanced", days: 7 })).stayDays).toBe(7);
  });

  it("shows water amount and a starter milestone", () => {
    const water = list(answers()).find((e) => e.key === "stay:water");
    expect(water?.qty?.text).toBe("7 gallons");
    expect(water?.qty?.buy).toContain("start with 3 gallons");
    expect(water?.qty?.buy).toContain("2 jugs of 5 gallons");
  });
});

describe("state and staging", () => {
  it("pre-marks quick-pick items as have, but explicit state wins", () => {
    const a = answers({ have: ["flashlight"] });
    const entry = list(a).find((e) => e.key === "stay:flashlights")!;
    expect(stateOf(entry, {}, a)).toBe("have");
    expect(stateOf(entry, { [entry.key]: "need" }, a)).toBe("need");
  });

  it("budget of $0 pushes paid weekend items to the month stage", () => {
    const entry = list(answers()).find((e) => e.key === "stay:bin")!;
    expect(stageOf(entry, answers())).toBe("weekend");
    expect(stageOf(entry, answers({ budget: "0" }))).toBe("month");
  });

  it("advanced items land in later", () => {
    const entry = list(answers()).find((e) => e.level === "advanced")!;
    expect(stageOf(entry, answers())).toBe("later");
  });
});

describe("share links", () => {
  it("round-trips answers and states", () => {
    const a = answers({ county: "san-francisco", household: { ...EMPTY_ANSWERS.household, adults: 2 } });
    const decoded = decodeShare("#" + encodeShare(a, { "stay:water": "have" }));
    expect(decoded?.answers).toEqual(a);
    expect(decoded?.states).toEqual({ "stay:water": "have" });
  });

  it("rejects garbage and sanitizes bad fields", () => {
    expect(decodeShare("#not-base64!!")).toBeNull();
    const a = normalizeAnswers({ build: "nope", household: { adults: 999, kids: -3 }, hazards: ["earthquake", "alien"] });
    expect(a.build).toBeNull();
    expect(a.household.adults).toBe(20);
    expect(a.household.kids).toBe(0);
    expect(a.hazards).toEqual(["earthquake"]);
  });
});

describe("per-person tracking", () => {
  const family = answers({ build: "both", household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 1 } });
  const find = (a: Answers, key: string) => list(a).find((e) => e.key === key)!;

  it("tracks go bag items per bag and some to-dos per adult", () => {
    expect(find(family, "go:headlamp-go").slots).toEqual(["Me", "Adult 2", "Kid 1"]);
    expect(find(family, "home:alerts").slots).toEqual(["Me", "Adult 2"]);
    expect(find({ ...family, needs: ["meds"] }, "go:med-info").slots).toEqual(["Me", "Adult 2", "Kid 1"]);
    expect(find(family, "go:cable").slots).toEqual(["Me", "Adult 2", "Kid 1"]);
    expect(find(family, "go:docs-copies").slots).toEqual(["Me", "Adult 2", "Kid 1"]);
    for (const key of ["go:cash-go", "go:powerbank"]) expect(find(family, key).slots).toHaveLength(3);
    expect(find({ ...family, needs: ["meds"] }, "go:rx").slots).toHaveLength(3);
    // Stay bin copies aren't tracked per person
    expect(find({ ...family, build: "stay" }, "stay:powerbank").slots).toEqual([]);
    // Work gloves: one pair for the group
    expect(find(family, "go:gloves").slots).toEqual([]);
    expect(find(family, "go:gloves").qty?.text).toBe("1 pair");
    expect(find(family, "go:first-aid").slots).toEqual([]);
    expect(find(family, "home:contact").slots).toEqual([]);
  });

  it("doesn't split things for a one-person household", () => {
    expect(find(answers({ build: "both" }), "go:headlamp-go").slots).toEqual([]);
  });

  it("counts an item as have only once everyone has it", () => {
    const e = find(family, "go:whistle");
    const some = { "go:whistle@0": "have", "go:whistle@1": "have" } as const;
    expect(stateOf(e, some, family)).toBe("need");
    expect(slotDone(e, 1, some, family)).toBe(true);
    expect(slotDone(e, 2, some, family)).toBe(false);
    expect(stateOf(e, { ...some, "go:whistle@2": "have" }, family)).toBe("have");
  });

  it("lets the whole row's state fill in for people not set yet", () => {
    const e = find(family, "go:whistle");
    expect(stateOf(e, { "go:whistle": "have" }, family)).toBe("have");
    expect(stateOf(e, { "go:whistle": "have", "go:whistle@0": "need" }, family)).toBe("need");
    expect(stateOf(e, { "go:whistle": "skip", "go:whistle@0": "have" }, family)).toBe("skip");
  });
});

describe("items that scale with days at home", () => {
  // The spreadsheet recalculates these from scalesWithDays, so it must agree with qty and cost.
  for (const days of [7, 14] as const) {
    it(`matches the app's amounts and costs at ${days} days`, () => {
      const a = answers({
        level: "advanced",
        days,
        county: "alameda",
        household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 1, babies: 1, dogs: 1, cats: 2 },
        needs: ["diet"],
      });
      const ctx = deriveContext(a);
      const entries = list(a).filter((e) => e.container === "stay" && e.item.scalesWithDays);
      expect(entries.length).toBeGreaterThanOrEqual(6);
      for (const e of entries) {
        const s = e.item.scalesWithDays!;
        const [lo, hi] = s.costPerDay(ctx);
        // Counted items are priced per whole unit; the rest per day.
        const units = s.perDay ? Math.ceil(s.perDay(ctx) * days) / s.perDay(ctx) : days;
        expect(lo * units, e.item.id).toBeCloseTo(e.cost[0]);
        expect(hi * units, e.item.id).toBeCloseTo(e.cost[1]);
        if (!e.qty) continue;
        const text = s.perDay ? `${Math.ceil(s.perDay(ctx) * days)} ${s.unit}` : `${days} days${s.suffix?.(ctx) ?? ""}`;
        expect(e.qty.text, e.item.id).toBe(text);
      }
    });
  }
});

describe("names", () => {
  const household = { ...EMPTY_ANSWERS.household, adults: 2, kids: 2 };

  it("uses the names people give, and defaults for the rest", () => {
    const ctx = deriveContext(answers({ household, names: { adults: ["Alex", ""], kids: ["", "Riley"] } }));
    expect(peopleNames(ctx)).toEqual(["Alex", "Adult 2", "Kid 1", "Riley"]);
  });

  it("keeps names with the right role when counts change", () => {
    const names = { adults: ["Alex", "Sam"], kids: ["Riley"] };
    const ctx = deriveContext(answers({ household: { ...household, adults: 1, kids: 1 }, names }));
    expect(peopleNames(ctx)).toEqual(["Alex", "Riley"]);
  });

  it("labels per-person rows with names", () => {
    const a = answers({ build: "both", household, names: { adults: ["Alex", "Sam"], kids: [] } });
    expect(list(a).find((e) => e.key === "go:whistle")!.slots).toEqual(["Alex", "Sam", "Kid 1", "Kid 2"]);
  });

  it("cleans up names from shared links", () => {
    const a = normalizeAnswers({ names: { adults: ["  Alex  ", 5, "x".repeat(50)], kids: "nope" } });
    expect(a.names).toEqual({ adults: ["Alex", "", "x".repeat(30)], kids: [] });
    expect(normalizeAnswers({}).names).toEqual({ adults: [], kids: [] });
  });
});
