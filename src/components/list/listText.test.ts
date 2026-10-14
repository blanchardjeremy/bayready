import { describe, expect, it } from "vitest";
import type { Answers, ListEntry, Shop } from "@/lib/types";
import { deriveContext, STARTER_ANSWERS } from "@/lib/answers";
import { buildList } from "@/lib/buildList";
import { ITEMS } from "@/data/items";
import { SHOP_ORDER } from "@/data/meta";
import { asText, handDate, shoppingText } from "./listText";

const answers: Answers = { ...STARTER_ANSWERS, county: "alameda" };
const need = () => "need" as const;

function textFor(lang: "en" | "es") {
  const ctx = deriveContext(answers, lang);
  const main = buildList(ctx, ITEMS).filter((e) => e.level === "basics");
  return asText(["stay"], main, need, ctx);
}

/** Every stay-at-home item still to buy, grouped by store like the shopping view. */
function shopGroups(lang: "en" | "es"): [Shop, ListEntry[][]][] {
  const entries = buildList(deriveContext(answers, lang), ITEMS).filter((e) => e.container === "stay" && e.cost[1] > 0);
  return SHOP_ORDER.map((shop) => [shop, entries.filter((e) => e.item.shop === shop).map((e) => [e])] as [Shop, ListEntry[][]]).filter(
    ([, l]) => l.length > 0,
  );
}

describe("Copy as text", () => {
  it("writes the headings, county alerts, and credit in English", () => {
    const text = textFor("en");
    expect(text.startsWith("My emergency list (Bay Ready)\n\nSTAY-AT-HOME BIN\n")).toBe(true);
    expect(text).toContain("\n  Water\n");
    expect(text).toContain("Emergency alerts: AC Alert https://acalert.org");
    expect(text.endsWith("Made with Bay Ready, a free emergency kit planner for the Bay Area: https://blanchardjeremy.github.io/bayready/")).toBe(true);
  });

  it("writes them in Spanish for a Spanish list", () => {
    const text = textFor("es");
    expect(text.startsWith("Mi lista de emergencia (Bay Ready)\n\nCAJA PARA QUEDARSE EN CASA\n")).toBe(true);
    expect(text).toContain("\n  Agua\n");
    expect(text).toContain("Alertas de emergencia: AC Alert https://acalert.org");
    expect(text).toContain("Hecho con Bay Ready");
    expect(text).not.toContain("Made with");
    expect(text).not.toContain("Emergency alerts");
  });
});

describe("the copied shopping list", () => {
  it("names stores and kits in the list's language", () => {
    const en = shoppingText(shopGroups("en"), need, "en");
    expect(en).toContain("Grocery store\n[ ] ");
    expect(en).toContain("(Stay-at-home bin: ");
    expect(en).toContain("Made with Bay Ready");

    const es = shoppingText(shopGroups("es"), need, "es");
    expect(es).toContain("Supermercado\n[ ] ");
    expect(es).toContain("(Caja para quedarse en casa: ");
    expect(es).toContain("Hecho con Bay Ready");
    expect(es).not.toContain("Grocery store");
  });

  it("leaves out stores with nothing left to buy", () => {
    const text = shoppingText(shopGroups("en"), () => "have", "en");
    expect(text.trim()).toBe("Made with Bay Ready, a free emergency kit planner for the Bay Area: https://blanchardjeremy.github.io/bayready/");
  });
});

describe("hand-written dates on the example log", () => {
  it("writes dates the way each language does", () => {
    expect(handDate("en-US", 3, 8)).toBe("Mar 8");
    expect(handDate("en-US", 10)).toBe("Oct");
    expect(handDate("es-US", 3, 8)).toBe("8 mar");
    expect(handDate("es-US", 10)).toBe("oct");
  });
});
