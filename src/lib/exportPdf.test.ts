import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";
import { writeFileSync } from "node:fs";
import { deriveContext, normalizeAnswers } from "./answers";
import { buildList, slotDone, stateOf } from "./buildList";
import { buildPdf, buildRefreshPdf } from "./exportPdf";
import { ITEMS } from "@/data/items";
import type { ItemState } from "./types";
import type { HomeInfo } from "@/data/homeFacts";

function makeInput(home?: HomeInfo) {
  const answers = normalizeAnswers({
    build: "both",
    county: "alameda",
    hazards: ["earthquake", "outage", "wildfire"],
    household: { adults: 2, kids: 1, dogs: 1 },
    names: { adults: ["Sam", "José"], kids: ["Bea 🐝"] },
    have: ["flashlight"],
  });
  const ctx = deriveContext(answers);
  const entries = buildList(ctx, ITEMS).filter((e) => e.level === "basics");
  const states: Record<string, ItemState> = { "home:shutoffs": "have", "go:water-go@1": "have", "stay:radio": "skip" };
  return {
    answers,
    ctx,
    entries,
    stateOf: (e: (typeof entries)[number]) => stateOf(e, states, answers),
    slotDone: (e: (typeof entries)[number], i: number) => slotDone(e, i, states, answers),
    shareUrl: "https://example.test/list#abc",
    today: new Date(2026, 9, 11),
    home,
  };
}

function render(input: ReturnType<typeof makeInput>) {
  const doc = buildPdf(jsPDF, input);
  if (process.env.PDF_OUT) writeFileSync(process.env.PDF_OUT, Buffer.from(doc.output("arraybuffer")));
  return doc;
}

describe("PDF export", () => {
  it("lays out the list, the card, and Know your home", () => {
    const doc = render(
      makeInput({
        facts: { gas: "Left side of the house, wrench on a hook — by the meter", contact: "Aunt Ro, 555-0100" },
        bags: ["Hall closet", "", "Under Bea's bed"],
        notes: "Radio is in Sam’s go bag.",
      }),
    );
    expect(doc.getNumberOfPages()).toBeGreaterThan(3);
    const text = doc.output();
    expect(text).toContain("When it happens");
    expect(text).toContain("Know your home");
    expect(text).toContain("Aunt Ro, 555-0100");
    expect(text).toContain("JOS\u00c9'S GO BAG IS");
    expect(text).toContain("Under Bea's bed");
  });

  it("prints the refresh log on its own, with food starters and no [Example] tags", () => {
    const doc = buildRefreshPdf(jsPDF, makeInput());
    const text = doc.output();
    expect(text).toContain("Keep it fresh");
    expect(text).toContain("Canned beans");
    expect(text).not.toContain("[Example]");
    expect(text).not.toContain("Add your food here");
    expect(doc.internal.pageSize.getWidth()).toBeGreaterThan(doc.internal.pageSize.getHeight());
  });

  it("leaves out Know your home on a shared list", () => {
    expect(render(makeInput()).output()).not.toContain("Know your home");
  });
});
