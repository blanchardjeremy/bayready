import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, deriveContext, normalizeAnswers } from "@/lib/answers";
import { buildList } from "@/lib/buildList";
import { firstHourCard } from "./firstHour";
import { ITEMS } from "./items";
import type { Answers } from "@/lib/types";

// Safety rules from the October 2026 expert review (research/expert-review/README.md).

const ctxFor = (a: Partial<Answers>) => deriveContext(normalizeAnswers({ ...EMPTY_ANSWERS, build: "both", ...a }));
const ids = (a: Partial<Answers>) => buildList(ctxFor(a), ITEMS).map((e) => e.item.id);
const item = (id: string) => ITEMS.find((i) => i.id === id)!;
const cardLines = (a: Partial<Answers>) => firstHourCard(ctxFor(a)).flatMap((s) => s.lines);

describe("safety rules", () => {
  it("gives oxygen users fire safety, backup oxygen, and everything a powered device gets", () => {
    const list = ids({ needs: ["oxygen"], hazards: ["earthquake", "outage"] });
    expect(list).toEqual(expect.arrayContaining(["oxygen-safety", "oxygen-backup", "device-go", "device-power", "medical-baseline"]));
    expect(item("stove").tip).toMatch(/oxygen/);
    expect(cardLines({ needs: ["oxygen"], hazards: ["earthquake"] }).join(" ")).toMatch(/never candles, especially near oxygen/);
  });

  it("never suggests running a device from a car without the carbon monoxide warning", () => {
    expect(item("device-power").tip).toMatch(/never in a garage/);
  });

  it("describes heat stroke skin as dry or sweaty, with first aid", () => {
    expect(item("cool-place").why).toMatch(/dry or sweaty/);
    expect(item("cool-place").why).toMatch(/Call 911/);
  });

  it("doesn't claim filters make water safe on their own", () => {
    expect(item("purify-go").why).not.toMatch(/filter/i);
    expect(item("water-filter").tip).toMatch(/don't stop viruses/);
  });

  it("only tells people to take go bags when they have them", () => {
    expect(cardLines({ build: "stay", hazards: ["earthquake"] }).join(" ")).not.toMatch(/go bag/);
    expect(cardLines({ build: "both", hazards: ["earthquake"] }).join(" ")).toMatch(/take your go bags/);
  });

  it("puts the tsunami step right after drop, cover, and hold on", () => {
    const lines = cardLines({ hazards: ["earthquake", "tsunami"] });
    expect(lines[1]).toMatch(/high ground/);
  });

  it("gives people with mobility needs a way out that isn't only walking", () => {
    expect(ids({ needs: ["mobility"] })).toContain("evac-help");
    expect(cardLines({ needs: ["mobility"], hazards: ["earthquake", "tsunami"] })[1]).toMatch(/ride plan/);
  });

  it("tells households that need extra time to leave at the evacuation warning", () => {
    const family = cardLines({ hazards: ["wildfire"], household: { ...EMPTY_ANSWERS.household, kids: 1 } }).join(" ");
    expect(family).toMatch(/Warning: leave now/);
    const solo = cardLines({ hazards: ["wildfire"], car: "yes" }).join(" ");
    expect(solo).toMatch(/Warning: get ready/);
  });
});
