import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, STARTER_ANSWERS, deriveContext } from "@/lib/answers";
import { buildList } from "@/lib/buildList";
import { listSummary } from "@/lib/summary";
import { ITEMS } from "@/data/items";
import { firstHourCard } from "@/data/firstHour";
import { EMPTY_HOME, factFields, homeFacts } from "@/data/homeFacts";
import { EXAMPLE_PREFIX, expiringSections, withoutExamplePrefix } from "@/data/expiring";
import type { Answers, HazardId } from "@/lib/types";
import { ITEMS_ES } from "./es/items";

const ALL_HAZARDS: HazardId[] = ["earthquake", "outage", "smoke", "wildfire", "heat", "flood", "tsunami", "chemical"];

/** A household that turns on nearly every item and every kind of built text. */
const everything: Answers = {
  ...STARTER_ANSWERS,
  build: "both",
  county: "alameda",
  hazards: ALL_HAZARDS,
  household: { adults: 2, kids: 1, babies: 1, dogs: 1, cats: 1, otherPets: 1 },
  needs: ["meds", "cold-meds", "power-device", "mobility", "vision-hearing", "diet", "oxygen", "communication", "cognitive", "caregiver", "dialysis", "pregnancy", "service-animal"],
  level: "advanced",
  home: "house",
  car: "yes",
  power: ["cook", "charge", "cold"],
};
const es = (a: Answers) => deriveContext(a, "es");
const en = (a: Answers) => deriveContext(a, "en");

describe("Spanish item text", () => {
  it("has a name and why for every item, and a tip and example labels where English has them", () => {
    for (const item of ITEMS) {
      const t = ITEMS_ES[item.id];
      expect(t, item.id).toBeDefined();
      expect(t.name.trim(), item.id).not.toBe("");
      expect(t.why.trim(), item.id).not.toBe("");
      if (item.tip) expect(t.tip?.trim(), item.id).toBeTruthy();
      else expect(t.tip, item.id).toBeUndefined();
      expect(t.examples?.length ?? 0, item.id).toBe(item.examples?.length ?? 0);
    }
  });

  it("has nothing for items that don't exist", () => {
    const ids = new Set(ITEMS.map((i) => i.id));
    expect(Object.keys(ITEMS_ES).filter((id) => !ids.has(id))).toEqual([]);
  });
});

describe("a Spanish household's list", () => {
  const ctx = es(everything);
  const list = buildList(ctx, ITEMS);
  const find = (key: string) => list.find((e) => e.key === key)!;

  it("has the same rows as in English, with Spanish names", () => {
    expect(list.map((e) => e.key)).toEqual(buildList(en(everything), ITEMS).map((e) => e.key));
    expect(find("stay:water").item.name).toBe("Agua para tomar");
    expect(find("go:backpack").item.name).toBe("Mochila");
    expect(find("home:drop-cover").item.name).toBe("Practique Agáchese, cúbrase y sujétese");
  });

  it("writes amounts in Spanish", () => {
    const english = /\b(gallons?|each|bags?|days?|for|per|adults?|kids?|teen|or more|cans?|box(es)?|jars?|snacks?|lights?|masks?|pairs?|diapers?|packs?|pets?|bab(y|ies)|That's)\b/;
    const texts = list.flatMap((e) => (e.qty ? [e.qty.text, e.qty.buy ?? ""] : []));
    expect(texts.length).toBeGreaterThan(20);
    for (const t of texts) expect(t).not.toMatch(english);
    expect(find("stay:water").qty!.text).toMatch(/^\d+ galones$/);
    expect(find("stay:water").qty!.buy).toMatch(/garrafones de 5 galones/);
    expect(find("stay:water").qty!.buy).toMatch(/como pide EBMUD/);
    expect(find("go:whistle").qty).toEqual({ text: "1 por persona", buy: "para 3 mochilas" });
    expect(find("go:n95").qty!.text).toBe("2 por adulto o adolescente");
    expect(find("stay:formula").qty!.text).toBe("14 días para 1 bebé");
    expect(find("go:pet-food").qty!.text).toBe("3 días para 3 mascotas");
    expect(find("go:cash-go").qty!.text).toBe("$100 o más por adulto, unos $20 por niño");
  });

  it("gives the spreadsheet Spanish units to scale with", () => {
    expect(find("stay:water").item.scalesWithDays!.unit).toBe("galones");
    expect(find("stay:toilet-bags").item.scalesWithDays).toMatchObject({ unit: "bolsas", unitOne: "bolsa" });
    expect(find("stay:food").item.scalesWithDays).toMatchObject({ unit: "latas", unitOne: "lata" });
    expect(find("stay:diapers").item.scalesWithDays!.unit).toBe("pañales");
    expect(find("stay:formula").item.scalesWithDays!.suffix!(ctx)).toBe(" para 1 bebé");
    // English units stay English.
    const english = buildList(en(everything), ITEMS).find((e) => e.key === "stay:food")!;
    expect(english.item.scalesWithDays).toMatchObject({ unit: "cans", unitOne: "can" });
  });

  it("labels links and examples in Spanish, with names left as they are", () => {
    expect(find("home:alerts").item.link!(ctx)!.label).toBe("Inscríbase en AC Alert");
    expect(find("home:drop-cover").item.link!(ctx)!.label).toMatch(/^Gran ShakeOut: jueves, \d+ de octubre$/);
    expect(find("home:training").item.link!(ctx)!.label).toBe("Clases de CERT (Bomberos del Condado de Alameda)");
    expect(find("home:block").item.link!(ctx)!.label).toBe("Kit de Listos California para una reunión de cuadra");
    expect(find("home:retrofit").item.link!(ctx)!.label).toBe("Earthquake Brace + Bolt");
    expect(find("stay:radio").item.examples).toEqual([
      { label: "Radio de manivela Midland ER210", url: "https://midlandusa.com/products/er210-portable-emergency-crank-weather-radio" },
    ]);
  });

  it("keeps English links in English", () => {
    const c = en(everything);
    const alerts = buildList(c, ITEMS).find((e) => e.key === "home:alerts")!;
    expect(alerts.item.link!(c)!.label).toBe("Sign up for AC Alert");
    expect(buildList(c, ITEMS).find((e) => e.key === "home:drop-cover")!.item.link!(c)!.label).toMatch(/^Great ShakeOut: Thursday, October \d+$/);
  });
});

describe("the Spanish card", () => {
  const households: Partial<Answers>[] = [
    { hazards: ["earthquake"] },
    { hazards: ["smoke"], build: "stay" },
    { hazards: ALL_HAZARDS, household: { ...EMPTY_ANSWERS.household, kids: 1, dogs: 1 }, needs: ["oxygen", "mobility"] },
    { hazards: ["wildfire", "tsunami", "outage"], needs: ["power-device"], car: "no" },
  ];

  it("follows the same rules as the English card", () => {
    for (const h of households) {
      const a = { ...STARTER_ANSWERS, build: "both" as const, ...h };
      const shape = (c: ReturnType<typeof firstHourCard>) => c.map((s) => s.lines.length);
      expect(shape(firstHourCard(es(a)))).toEqual(shape(firstHourCard(en(a))));
    }
  });

  it("is written in Spanish", () => {
    const card = firstHourCard(es({ ...STARTER_ANSWERS, build: "both", hazards: ["earthquake", "tsunami", "wildfire"] }));
    expect(card.map((s) => s.title)).toEqual(["Justo después de un terremoto fuerte", "Otras emergencias", "En los días después"]);
    const text = card.flatMap((s) => s.lines).join(" ");
    expect(text).toMatch(/Agáchese, cúbrase y sujétese/);
    expect(text).toMatch(/Advertencia de evacuación/);
    expect(text).toMatch(/tome sus mochilas de emergencia/);
    expect(text).not.toMatch(/\b(the|and|your)\b/);
    expect(firstHourCard(es({ ...STARTER_ANSWERS, hazards: ["smoke"] }))[0].title).toBe("Cuando ocurra");
  });
});

describe("Spanish Know your home", () => {
  it("labels facts and each person's boxes in Spanish", () => {
    const ctx = es({
      ...STARTER_ANSWERS,
      build: "both",
      household: { ...EMPTY_ANSWERS.household, adults: 2, kids: 1 },
      names: { adults: ["", "Riley"], kids: ["Bea"] },
    });
    const fields = factFields(homeFacts(ctx), ctx, EMPTY_HOME);
    const label = (id: string) => fields.find((f) => f.fact.id === id)!.label;
    expect(label("gas")).toBe("Llave de paso del gas");
    expect(label("contact")).toBe("Contacto fuera del área");
    expect(fields.find((f) => f.fact.id === "gas")!.fact.hint).toMatch(/huele a gas/);
    expect(fields.filter((f) => f.fact.id === "goBags").map((f) => f.label)).toEqual([
      "Mi mochila de emergencia está en",
      "La mochila de Riley está en",
      "La mochila de Bea está en",
    ]);
    expect(fields.filter((f) => f.fact.id === "phones").map((f) => f.label)).toEqual(["Mi celular", "Celular de Riley", "Celular de Bea"]);
  });
});

describe("Spanish expiration dates", () => {
  it("has the same rows as English, in Spanish", () => {
    const a = { ...STARTER_ANSWERS, build: "both" as const, car: "yes" as const, level: "advanced" as const, household: { ...EMPTY_ANSWERS.household, babies: 1, dogs: 1 } };
    const spanish = expiringSections(es(a));
    const english = expiringSections(en(a));
    expect(spanish.map((s) => s.rows.length)).toEqual(english.map((s) => s.rows.length));
    expect(spanish.map((s) => s.name)).toEqual(["Todos", "Su mochila de emergencia"]);
    const rows = spanish[0].rows;
    expect(rows[0]).toMatchObject({ item: "[Ejemplo] Frijoles en lata", kit: "Caja para quedarse en casa", container: "stay", every: 24, example: true });
    expect(rows.slice(6, 11).every((r) => r.item === "[Ejemplo] Agregue aquí su comida" && r.placeholder)).toBe(true);
    expect(rows.some((r) => r.kit === "Kit para el carro")).toBe(true);
    expect(rows.some((r) => r.kit === "Planes y pendientes")).toBe(true);
    // Every row's kit and flags match the English row.
    english.forEach((s, i) =>
      s.rows.forEach((r, j) => {
        const r2 = spanish[i].rows[j];
        expect([r2.container, r2.every, r2.example, r2.placeholder]).toEqual([r.container, r.every, r.example, r.placeholder]);
        expect(r2.item.startsWith(EXAMPLE_PREFIX.es)).toBe(r.item.startsWith(EXAMPLE_PREFIX.en));
      }),
    );
  });

  it("strips the example prefix in either language", () => {
    expect(withoutExamplePrefix("[Example] Canned beans")).toBe("Canned beans");
    expect(withoutExamplePrefix("[Ejemplo] Frijoles en lata")).toBe("Frijoles en lata");
    expect(withoutExamplePrefix("Pet food")).toBe("Pet food");
  });
});

describe("the Spanish summary", () => {
  it("describes the household in Spanish", () => {
    const a = { ...STARTER_ANSWERS, build: "go" as const, hazards: ["earthquake", "outage"] as HazardId[], household: { ...EMPTY_ANSWERS.household, adults: 2, dogs: 1 } };
    expect(listSummary(a, es(a))).toBe("Una mochila de emergencia para 2 adultos y 1 perro. Para estos riesgos: terremoto y apagón. Nivel: Lo básico.");
    expect(listSummary(a, en(a))).toBe("A go bag for 2 adults, 1 dog. Ready for earthquake, power outage. Basics list.");
  });
});
