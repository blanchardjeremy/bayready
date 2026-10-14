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

describe("the card", () => {
  it("ends with what to do in the days after", () => {
    const card = firstHourCard(ctxFor({ hazards: ["earthquake"], household: { ...EMPTY_ANSWERS.household, kids: 1 } }));
    const after = card[card.length - 1];
    expect(after.title).toBe("In the days after");
    const text = after.lines.join(" ");
    for (const want of [/Green/, /yellow/, /red means unsafe/, /Photograph damage/, /insurer/, /DisasterAssistance\.gov/, /renters/, /contractor/, /water is being handed out/, /1-800-985-5990/, /routines/]) {
      expect(text).toMatch(want);
    }
  });

  it("keeps the days-after section short when nothing is damaged", () => {
    const card = firstHourCard(ctxFor({ hazards: ["smoke"] }));
    expect(card[card.length - 1].lines).toEqual([expect.stringMatching(/Disaster Distress Helpline/)]);
  });

  it("tells families not to rush the school", () => {
    const kids = cardLines({ hazards: ["earthquake"], household: { ...EMPTY_ANSWERS.household, kids: 2 } }).join(" ");
    expect(kids).toMatch(/Don't call or rush the school/);
    expect(cardLines({ hazards: ["earthquake"] }).join(" ")).not.toMatch(/school/);
  });
});

describe("recovery", () => {
  it("puts the financial first aid kit and home video in Basics, for later", () => {
    const list = buildList(ctxFor({ hazards: ["earthquake"] }), ITEMS);
    for (const id of ["effak", "home-inventory"]) {
      const e = list.find((e) => e.item.id === id)!;
      expect(e.level, id).toBe("basics");
      expect(e.item.stage, id).toBe("later");
    }
  });
});

describe("essentials", () => {
  it("only names items that exist", async () => {
    const { ESSENTIAL_KEYS } = await import("./essentials");
    const known = new Set(ITEMS.flatMap((i) => i.containers.map((c) => `${c}:${i.id}`)));
    expect([...ESSENTIAL_KEYS].filter((k) => !known.has(k))).toEqual([]);
  });
});
