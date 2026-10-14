import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, STARTER_ANSWERS, deriveContext } from "@/lib/answers";
import { ITEMS } from "./items";
import { EMPTY_HOME, HOME_FACTS, factFields, hasHomeInfo, homeFacts, normalizeHome, setField } from "./homeFacts";

describe("homeFacts", () => {
  it("attaches every fact to a real item", () => {
    const ids = new Set(ITEMS.map((i) => i.id));
    for (const f of HOME_FACTS) expect(ids.has(f.task), f.id).toBe(true);
  });

  it("only asks what fits the household", () => {
    const solo = homeFacts(deriveContext({ ...STARTER_ANSWERS, build: "stay" })).map((f) => f.id);
    expect(solo).toContain("gas");
    expect(solo).toEqual(expect.arrayContaining(["contact", "localContact", "phones"]));
    expect(solo).not.toContain("goBags");
    expect(solo).not.toContain("kidsPickup");
    expect(solo).not.toContain("pets");
    const family = homeFacts(
      deriveContext({ ...STARTER_ANSWERS, build: "both", household: { ...EMPTY_ANSWERS.household, kids: 1, dogs: 1 } }),
    ).map((f) => f.id);
    expect(family).toEqual(expect.arrayContaining(["goBags", "kidsPickup", "pets"]));
  });

  it("cleans up whatever is in storage", () => {
    expect(normalizeHome(null)).toEqual(EMPTY_HOME);
    expect(normalizeHome({ facts: { gas: "Garage, left wall", bogus: "x", water: 5 }, notes: 7 })).toEqual({
      facts: { gas: "Garage, left wall" },
      bags: [],
      phones: [],
      notes: "",
    });
    expect(
      normalizeHome({ facts: { localContact: "Kim next door", phones: "x" }, phones: ["555-0101", 4, "x".repeat(300)] }),
    ).toEqual({ facts: { localContact: "Kim next door" }, bags: [], phones: ["555-0101", "", "x".repeat(200)], notes: "" });
    expect(normalizeHome({ phones: Array(12).fill("1") }).phones).toHaveLength(8);
  });

  it("moves the old shared go bag answer into the first person's box", () => {
    expect(normalizeHome({ facts: { goBags: "By the front door" } })).toEqual({
      facts: {},
      bags: ["By the front door"],
      phones: [],
      notes: "",
    });
  });

  it("gives each person who carries a bag their own go bag box", () => {
    const ctx = deriveContext({
      ...STARTER_ANSWERS,
      build: "go",
      household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 1 },
      names: { adults: ["", "Riley"], kids: [] },
    });
    const bags = factFields(homeFacts(ctx), ctx, EMPTY_HOME).filter((f) => f.fact.id === "goBags");
    expect(bags.map((f) => f.label)).toEqual(["My go bag is", "Riley's go bag is", "Kid 1's go bag is"]);
    expect(bags.map((f) => f.bag)).toEqual([0, 1, 2]);
    expect(setField(EMPTY_HOME, bags[2], "Hall closet").bags).toEqual(["", "", "Hall closet"]);

    const solo = deriveContext({ ...STARTER_ANSWERS, build: "go" });
    expect(factFields(homeFacts(solo), solo, EMPTY_HOME).find((f) => f.fact.id === "goBags")?.label).toBe("Go bag is");
  });

  it("gives everyone, kids included, a cell number box", () => {
    const ctx = deriveContext({
      ...STARTER_ANSWERS,
      build: "stay",
      household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 1, babies: 1 },
      names: { adults: ["", "Riley"], kids: ["Bea"] },
    });
    const phones = factFields(homeFacts(ctx), ctx, { ...EMPTY_HOME, phones: ["555-0100"] }).filter((f) => f.fact.id === "phones");
    expect(phones.map((f) => f.label)).toEqual(["My cell", "Riley's cell", "Bea's cell"]);
    expect(phones.map((f) => f.value)).toEqual(["555-0100", "", ""]);
    expect(phones.every((f) => f.bag === undefined)).toBe(true);

    const saved = setField(EMPTY_HOME, phones[1], "555-0199");
    expect(saved.phones).toEqual(["", "555-0199"]);
    expect(saved.bags).toEqual([]);
    expect(saved.facts).toEqual({});
    expect(hasHomeInfo(saved)).toBe(true);
    // Saves from before cell numbers existed have no phones list.
    const old = { facts: {}, bags: [], notes: "" };
    expect(setField(old, phones[0], "555-0100").phones).toEqual(["555-0100"]);
    expect(hasHomeInfo(old)).toBe(false);
  });

  it("saves the local backup contact like any other fact", () => {
    const ctx = deriveContext(STARTER_ANSWERS);
    const local = factFields(homeFacts(ctx), ctx, EMPTY_HOME).find((f) => f.fact.id === "localContact")!;
    expect(local.label).toBe("Local backup contact");
    expect(setField(EMPTY_HOME, local, "Kim, 555-0150").facts).toEqual({ localContact: "Kim, 555-0150" });
  });
});
