import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, STARTER_ANSWERS, deriveContext, normalizeAnswers, peopleNames } from "./answers";
import { buildList, firstSteps, formatCost, slotDone, stageOf, stateOf } from "./buildList";
import { ITEMS, nextShakeOut, stayWaterGallons } from "@/data/items";
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
  it("starter list is a stay-at-home bin plus home tasks, no go bag", () => {
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

  it("doesn't duplicate go bag gear in the stay-at-home bin when building both", () => {
    expect(ids(answers({ build: "stay" })).has("stay:flashlights")).toBe(true);
    const both = ids(answers({ build: "both" }));
    expect(both.has("go:headlamp-go")).toBe(true);
    expect(both.has("stay:flashlights")).toBe(false);
  });

  it("keeps a full first aid kit at home even with a go bag", () => {
    const both = ids(answers({ build: "both" }));
    expect(both.has("go:first-aid")).toBe(true);
    expect(both.has("stay:first-aid")).toBe(true);
    expect(ITEMS.find((i) => i.id === "first-aid")!.tip).toMatch(/rinsing wounds/);
  });

  it("asks about tetanus shots and a first aid class in Basics", () => {
    const basics = list(answers()).filter((e) => e.level === "basics").map((e) => e.key);
    expect(basics).toEqual(expect.arrayContaining(["home:tetanus", "home:first-aid-class"]));
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

  it("uses home type and car answers in Basics too", () => {
    const apt = ids(answers({ home: "apartment-high" }));
    expect(apt.has("home:high-rise")).toBe(true);
    expect(apt.has("home:garage-door")).toBe(false);
    expect(apt.has("home:water-heater")).toBe(false);
    expect(ids(answers({ home: "house" })).has("home:water-heater")).toBe(true);
    expect(ids(answers({ hazards: ["wildfire"], car: "no" })).has("home:routes")).toBe(true);
    expect(ids(answers({ hazards: ["wildfire"], car: "yes" })).has("home:half-tank")).toBe(true);
    expect(ids(answers({ hazards: ["wildfire"], car: "no" })).has("home:half-tank")).toBe(false);
  });

  it("puts the person with an access need in charge of their own check-ins", () => {
    expect(ids(answers()).has("home:support-network")).toBe(false);
    expect(ids(answers({ needs: ["mobility"] })).has("home:support-network")).toBe(true);
    expect(ids(answers({ needs: ["vision-hearing"] })).has("home:support-network")).toBe(false);
    expect(ids(answers({ needs: ["diet"] })).has("home:support-network")).toBe(false);
    expect(ids(answers({ needs: ["dialysis"] })).has("home:support-network")).toBe(true);
  });

  it("gives \"Prefer not to say\" the general health items instead of nothing", () => {
    const keys = ids(answers({ build: "both", needs: "private" }));
    for (const key of ["home:health-general", "home:support-network", "go:med-info"]) expect(keys.has(key), key).toBe(true);
    // ...but nothing for a specific need
    expect(keys.has("home:dialysis-plan")).toBe(false);
    expect(ids(answers({ needs: [] })).has("home:health-general")).toBe(false);
  });

  it("adds a task for each new kind of need", () => {
    const tasks = {
      communication: "comm-access",
      cognitive: "cognitive-plan",
      caregiver: "caregiver-plan",
      dialysis: "dialysis-plan",
      pregnancy: "pregnancy-plan",
      "service-animal": "service-animal",
    } as const;
    for (const [need, id] of Object.entries(tasks)) {
      const entries = list(answers({ needs: [need as keyof typeof tasks] }));
      const e = entries.find((e) => e.item.id === id);
      expect(e?.level, need).toBe("basics");
      expect(e?.cost[1], need).toBe(0);
      // Each need's task only shows for that need
      expect(list(answers({ needs: [] })).some((e) => e.item.id === id), id).toBe(false);
    }
    expect(list(answers({ needs: ["communication"] })).find((e) => e.key === "stay:lantern")?.level).toBe("basics");
    expect(ITEMS.find((i) => i.id === "dialysis-plan")!.tip).toMatch(/866-901-3773/);
  });

  it("offers a ride only to households with a car, and asks one person to take CERT", () => {
    const adv = { level: "advanced" as const, hazards: ["earthquake" as const, "wildfire" as const] };
    expect(ids(answers({ ...adv, car: "yes" })).has("home:offer-ride")).toBe(true);
    expect(ids(answers({ ...adv, car: "no" })).has("home:offer-ride")).toBe(false);
    const two = answers({ ...adv, household: { ...EMPTY_ANSWERS.household, adults: 2 } });
    expect(list(two).find((e) => e.key === "home:training")?.slots).toEqual([]);
  });

  it("puts meeting the neighbors in Basics, after the first weekend", () => {
    const block = list(answers()).find((e) => e.key === "home:block")!;
    expect(block.level).toBe("basics");
    expect(stageOf(block, answers())).toBe("month");
    expect(block.item.why).toMatch(/walk the block/);
    const link = (county: Answers["county"]) => block.item.link!(deriveContext(answers({ county })))?.url;
    expect(link("san-francisco")).toContain("map-your-neighborhood");
    for (const county of ["marin", "alameda", null] as const) expect(link(county)).toContain("listoscalifornia.org/blockparty");
  });

  it("splits the household plan into separate tasks", () => {
    const solo = ids(answers());
    expect(solo.has("home:contact")).toBe(true);
    expect(solo.has("home:wallet-cards")).toBe(true);
    expect(solo.has("home:group-text")).toBe(false);
    expect(ids(answers({ household: { ...EMPTY_ANSWERS.household, adults: 2 } })).has("home:group-text")).toBe(true);
  });

  it("adds free practice drills, mostly after the first weekend", () => {
    const practice = list(answers({ build: "both" })).filter((e) => e.item.category === "practice");
    expect(practice.map((e) => e.item.id)).toEqual(
      expect.arrayContaining(["drop-cover", "practice-text", "practice-meet", "practice-leave", "practice-fire"]),
    );
    for (const e of practice) {
      expect(e.cost[1], e.item.id).toBe(0);
      expect(e.level, e.item.id).toBe("basics");
    }
    expect(practice.filter((e) => e.item.stage === "weekend").map((e) => e.item.id)).toEqual(["drop-cover"]);
    // Only households that might leave practice leaving
    expect(ids(answers({ build: "stay", hazards: ["earthquake"] })).has("home:practice-leave")).toBe(false);
    expect(ids(answers({ build: "stay", hazards: ["wildfire"] })).has("home:practice-leave")).toBe(true);
  });

  it("gives the date of the next Great ShakeOut", () => {
    expect(nextShakeOut(new Date(2026, 9, 14)).toDateString()).toBe(new Date(2026, 9, 15).toDateString());
    expect(nextShakeOut(new Date(2026, 9, 15)).toDateString()).toBe(new Date(2026, 9, 15).toDateString());
    expect(nextShakeOut(new Date(2026, 9, 16)).toDateString()).toBe(new Date(2027, 9, 21).toDateString());
    expect(nextShakeOut(new Date(2025, 0, 1)).toDateString()).toBe(new Date(2025, 9, 16).toDateString());
    const link = ITEMS.find((i) => i.id === "drop-cover")!.link!(deriveContext(answers()));
    expect(link?.label).toMatch(/^Great ShakeOut: Thursday, October \d+$/);
  });

  it("links CERT and neighborhood programs for the county, with fallbacks", () => {
    const sf = list(answers({ level: "advanced", county: "san-francisco" }));
    expect(sf.find((e) => e.key === "home:training")!.item.link!(deriveContext(answers({ county: "san-francisco" })))?.url).toContain("sf-fire.org/nert");
    const block = sf.find((e) => e.key === "home:block")!.item;
    expect(block.link!(deriveContext(answers({ county: "solano" })))?.url).toContain("listoscalifornia.org");
  });

  it("gives a go-bag-only household a radio", () => {
    expect(list(answers({ build: "go" })).find((e) => e.key === "go:radio-go")?.level).toBe("basics");
    expect(list(answers({ build: "both" })).find((e) => e.key === "go:radio-go")?.level).toBe("advanced");
  });

  it("asks kids to carry less cash than adults", () => {
    const fam = answers({ build: "go", household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 1 } });
    expect(list(fam).find((e) => e.key === "go:cash-go")?.qty?.text).toContain("$20 per kid");
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

  it("water is 2 gallons per person per day in Basics for EBMUD households", () => {
    const ebmud = answers({ county: "alameda", household: { ...EMPTY_ANSWERS.household, adults: 2, dogs: 1 } });
    expect(deriveContext(ebmud).ebmud).toBe(true);
    expect(stayWaterGallons(deriveContext(ebmud))).toBe(32); // 2 × 2 × 7, plus 0.5 × 7 for the dog
    const water = list(ebmud).find((e) => e.key === "stay:water")!;
    expect(water.level).toBe("basics");
    expect(water.qty?.text).toBe("32 gallons");
    expect(water.qty?.buy).toContain("EBMUD");
    expect(list(answers({ county: "san-francisco" })).find((e) => e.key === "stay:water")?.qty?.buy).not.toContain("EBMUD");
    // No separate "extra water" row any more
    expect(list({ ...ebmud, level: "advanced" }).some((e) => e.item.id === "water-ebmud")).toBe(false);
  });

  it("counts kids as a whole person in the food plan", () => {
    const fam = answers({ household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 2 } });
    expect(list(fam).find((e) => e.key === "stay:food")?.qty?.text).toBe("28 cans");
    const food = ITEMS.find((i) => i.id === "food")!;
    expect(`${food.why} ${food.tip}`).not.toMatch(/Ready\.gov/);
    expect(food.tip).toMatch(/low-sodium/);
  });

  it("scales the toilet to the household", () => {
    const qty = (a: Answers, key: string) => list(a).find((e) => e.key === key)?.qty?.text;
    expect(qty(answers(), "stay:toilet")).toBe("1 bucket");
    expect(qty(answers(), "stay:toilet-bags")).toBe("7 bags");
    const five = answers({ household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 2, babies: 1 } });
    expect(qty(five, "stay:toilet")).toBe("2 buckets");
    expect(qty(five, "stay:toilet-bags")).toBe("35 bags");
    expect(ITEMS.find((i) => i.id === "toilet")!.tip).toMatch(/lid/);
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

  it("puts the school plan in Start here for households with kids", () => {
    const a = answers({ household: { ...EMPTY_ANSWERS.household, kids: 1 } });
    const entries = list(a).filter((e) => e.level === "basics");
    expect(firstSteps(entries, (e) => stateOf(e, {}, a), a).map((e) => e.item.id).slice(0, 3)).toEqual(["alerts", "school-plan", "contact"]);
    expect(ids(answers({ household: { ...EMPTY_ANSWERS.household, babies: 1 } })).has("home:school-plan")).toBe(true);
    expect(ids(a).has("home:kids-ready")).toBe(true);
    expect(ids(answers()).has("home:school-plan")).toBe(false);
  });

  it("Start here picks the highest-impact free steps, not the first in the list", () => {
    const a = answers({ hazards: ["earthquake", "outage", "smoke", "wildfire"] });
    const entries = list(a).filter((e) => e.level === "basics");
    const firsts = firstSteps(entries, (e) => stateOf(e, {}, a), a).map((e) => e.item.id);
    expect(firsts).toHaveLength(6);
    expect(firsts.slice(0, 3)).toEqual(["alerts", "evac-zone", "contact"]);
    expect(firsts).toContain("shoes-bed");
    expect(firsts).toContain("drop-cover");
  });

  it("advanced items land in later", () => {
    const entry = list(answers()).find((e) => e.level === "advanced")!;
    expect(stageOf(entry, answers())).toBe("later");
  });
});

describe("normalizeAnswers", () => {
  it("sanitizes bad fields", () => {
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
    expect(find(family, "go:water-go").slots).toEqual(["Me", "Adult 2", "Kid 1"]);
    expect(find(family, "go:docs-copies").slots).toEqual(["Me", "Adult 2", "Kid 1"]);
    expect(find(family, "go:cash-go").slots).toHaveLength(3);
    expect(find({ ...family, needs: ["meds"] }, "go:rx").slots).toHaveLength(3);
    // Stay-at-home bin copies aren't tracked per person
    expect(find({ ...family, build: "stay" }, "stay:powerbank").slots).toEqual([]);
    // Work gloves: one pair for the group
    expect(find(family, "go:gloves").slots).toEqual([]);
    expect(find(family, "go:gloves").qty?.text).toBe("1 pair");
    expect(find(family, "go:first-aid").slots).toEqual([]);
    expect(find(family, "home:contact").slots).toEqual([]);
  });

  it("doesn't give kids N95s, power banks, or charging cables", () => {
    for (const key of ["go:n95", "go:powerbank", "go:cable"]) {
      const e = find(family, key);
      expect(e.slots, key).toEqual(["Me", "Adult 2"]);
      expect(e.qty?.text, key).toMatch(/per adult or teen/);
    }
    expect(find(family, "go:n95").cost).toEqual([4, 6]); // 2 masks for each of 2 adults
    expect(find({ ...family, build: "stay" }, "stay:n95").qty?.text).toBe("10 masks");
    // One adult with a kid: just one, for the group
    const solo = answers({ build: "both", household: { ...EMPTY_ANSWERS.household, adults: 1, kids: 2 } });
    expect(find(solo, "go:powerbank").slots).toEqual([]);
    expect(find(solo, "go:powerbank").qty?.text).toBe("1 per adult or teen");
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
        const n = s.perDay ? Math.ceil(s.perDay(ctx) * days) : 0;
        const text = s.perDay ? `${n} ${n === 1 && s.unitOne ? s.unitOne : s.unit}` : `${days} days${s.suffix?.(ctx) ?? ""}`;
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

describe("formatCost", () => {
  it("writes costs, and free in either language", () => {
    expect(formatCost([20, 40])).toBe("$20–40");
    expect(formatCost([15, 15])).toBe("~$15");
    expect(formatCost([0, 0])).toBe("Free");
    expect(formatCost([0, 0], "es")).toBe("Gratis");
    expect(formatCost([120, 1500], "es")).toBe("$120–1,500");
  });
});

describe("cooler", () => {
  const level = (a: Answers) => list(a).find((e) => e.key === "stay:cooler")?.level;

  it("is an Advanced item for outages, not something daily medicine adds", () => {
    expect(level(answers({ needs: ["meds"] }))).toBe("advanced");
    expect(list(answers({ build: "both", needs: ["meds"] })).some((e) => e.item.id === "cold-med-pouch")).toBe(false);
  });

  it("moves into Basics for medicine that has to stay cold", () => {
    const a = answers({ build: "both", needs: ["cold-meds"] });
    expect(level(a)).toBe("basics");
    expect(list(a).some((e) => e.key === "go:cold-med-pouch")).toBe(true);
  });

  it("isn't added by a powered medical device on its own", () => {
    expect(level(answers({ needs: ["power-device"] }))).toBe("advanced");
  });
});
