import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, STARTER_ANSWERS, deriveContext } from "@/lib/answers";
import { ITEMS } from "./items";
import { HOME_FACTS, homeFacts, normalizeHome } from "./homeFacts";

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
    expect(normalizeHome(null)).toEqual({ facts: {}, notes: "" });
    expect(normalizeHome({ facts: { gas: "Garage, left wall", bogus: "x", water: 5 }, notes: 7 })).toEqual({
      facts: { gas: "Garage, left wall" },
      notes: "",
    });
  });
});
