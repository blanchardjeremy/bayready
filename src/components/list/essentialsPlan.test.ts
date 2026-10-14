import { describe, expect, it } from "vitest";
import type { Item, ItemState, ListEntry } from "@/lib/types";
import { deriveContext, STARTER_ANSWERS } from "@/lib/answers";
import { buildList } from "@/lib/buildList";
import { ITEMS } from "@/data/items";
import { isEssential } from "@/data/essentials";
import { FREE_WAYS, budgetDollars, budgetOrder, budgetPlan, freeFirst } from "./essentialsPlan";

/** Just enough of an entry for the budget math. */
function entry(id: string, cost: [number, number], container: "stay" | "go" = "stay"): ListEntry {
  return {
    key: `${container}:${id}`,
    item: { id, name: id } as Item,
    container,
    level: "basics",
    qty: null,
    cost,
    hazardTags: [],
    slots: [],
  };
}

const allNeed = () => "need" as ItemState;

describe("budget answer", () => {
  it("only names an amount for $50 and $150", () => {
    expect(budgetDollars("50")).toBe(50);
    expect(budgetDollars("150")).toBe(150);
    for (const b of ["0", "more", "unsure", null] as const) expect(budgetDollars(b)).toBeNull();
  });
});

describe("budget order", () => {
  it("puts water and the toilet plan ahead of the bin, and keeps unknown ids in list order after", () => {
    const list = [entry("bin", [15, 30]), entry("mystery-a", [1, 1]), entry("water", [7, 14]), entry("mystery-b", [1, 1]), entry("toilet-bags", [10, 20])];
    expect(budgetOrder(list).map((e) => e.item.id)).toEqual(["water", "toilet-bags", "bin", "mystery-a", "mystery-b"]);
  });
});

describe("budget cutoff", () => {
  const list = [
    entry("bin", [15, 30]), // 22.5
    entry("water", [7, 14]), // 10.5
    entry("food", [10, 20]), // 15
    entry("toilet-bags", [10, 20]), // 15
    entry("flashlights", [8, 16]), // 12
  ];

  it("takes what fits in priority order, using the middle of each range", () => {
    // water 10.5 + bags 15 + food 15 = 40.5; flashlights (12) would go over $50, and so would the bin.
    const plan = budgetPlan(list, allNeed, 50);
    expect(plan.order.map((e) => e.item.id)).toEqual(["water", "toilet-bags", "food", "flashlights", "bin"]);
    expect(plan.fits).toBe(3);
    expect(plan.spent).toBeCloseTo(40.5);
  });

  it("counts things they already have as free, so the budget reaches further", () => {
    const st = (e: ListEntry): ItemState => (e.item.id === "water" || e.item.id === "food" ? "have" : "need");
    const plan = budgetPlan(list, st, 50);
    // bags 15 + flashlights 12 = 27; + bin 22.5 = 49.5 still fits.
    expect(plan.fits).toBe(5);
    expect(plan.spent).toBeCloseTo(49.5);
  });

  it("skips one big item so cheaper ones behind it still fit", () => {
    const plan = budgetPlan([entry("water", [60, 80]), entry("toilet-bags", [1, 2])], allNeed, 50);
    expect(plan.order.map((e) => e.item.id)).toEqual(["toilet-bags", "water"]);
    expect(plan.fits).toBe(1);
    expect(plan.spent).toBe(1.5);
  });

  it("leaves cash below the line, since it's money set aside", () => {
    const plan = budgetPlan([entry("cash-go", [0, 0], "go"), entry("toilet-bags", [1, 2])], allNeed, 50);
    expect(plan.order.map((e) => e.item.id)).toEqual(["toilet-bags", "cash-go"]);
    expect(plan.fits).toBe(1);
  });

  it("fits everything when the budget is big enough", () => {
    expect(budgetPlan(list, allNeed, 150).fits).toBe(list.length);
  });

  it("works on a real starter list", () => {
    const ctx = deriveContext(STARTER_ANSWERS);
    const essentials = buildList(ctx, ITEMS).filter((e) => e.level === "basics" && isEssential(e));
    expect(essentials.length).toBeGreaterThan(3);
    const plan = budgetPlan(essentials, allNeed, 50);
    expect(plan.fits).toBeGreaterThan(0);
    expect(plan.fits).toBeLessThan(essentials.length);
    expect(plan.spent).toBeLessThanOrEqual(50);
  });
});

describe("$0 to start", () => {
  it("leads with what's free, has a free way, or is already at home", () => {
    const list = [entry("radio", [25, 45]), entry("bin", [15, 30]), entry("cash-go", [0, 0], "go"), entry("first-aid", [25, 50]), entry("headlamp-go", [24, 45], "go")];
    const st = (e: ListEntry): ItemState => (e.item.id === "headlamp-go" ? "have" : "need");
    expect(freeFirst(list, st).map((e) => e.item.id)).toEqual(["bin", "cash-go", "first-aid", "headlamp-go", "radio"]);
  });

  it("only has free ways for real essentials", async () => {
    const { ESSENTIAL_KEYS } = await import("@/data/essentials");
    const ids = new Set([...ESSENTIAL_KEYS].map((k) => k.split(":")[1]));
    for (const id of Object.keys(FREE_WAYS)) expect(ids.has(id), id).toBe(true);
  });
});
