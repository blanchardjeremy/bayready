import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, STARTER_ANSWERS, deriveContext } from "@/lib/answers";
import { ITEMS } from "./items";
import { EMPTY_HOME, HOME_FACTS, factFields, homeFacts, normalizeHome, setField } from "./homeFacts";

describe("homeFacts", () => {
  it("attaches every fact to a real item", () => {
    const ids = new Set(ITEMS.map((i) => i.id));
    for (const f of HOME_FACTS) expect(ids.has(f.task), f.id).toBe(true);
  });

  it("only asks what fits the household", () => {
    const solo = homeFacts(deriveContext({ ...STARTER_ANSWERS, build: "stay" })).map((f) => f.id);
    expect(solo).toContain("gas");
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
      notes: "",
    });
  });

  it("moves the old shared go bag answer into the first person's box", () => {
    expect(normalizeHome({ facts: { goBags: "By the front door" } })).toEqual({
      facts: {},
      bags: ["By the front door"],
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
    expect(setField(EMPTY_HOME, bags[2], "Hall closet").bags).toEqual(["", "", "Hall closet"]);

    const solo = deriveContext({ ...STARTER_ANSWERS, build: "go" });
    expect(factFields(homeFacts(solo), solo, EMPTY_HOME).find((f) => f.fact.id === "goBags")?.label).toBe("Go bag is");
  });
});
