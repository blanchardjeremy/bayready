import { describe, expect, it } from "vitest";
import { messagesFor } from "../messages";

/** Every string in a messages object, by path, like "essentials.title". Functions are left out. */
function strings(obj: unknown, path = ""): [string, string][] {
  if (typeof obj === "string") return [[path, obj]];
  if (Array.isArray(obj)) return obj.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (obj && typeof obj === "object")
    return Object.entries(obj).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}

/** Strings that read the same in both languages: product names and the like. */
const SAME_IN_BOTH = new Set(["calendar.google", "calendar.icalOne"]);

describe("the list page in Spanish", () => {
  const en = messagesFor("en").list;
  const es = messagesFor("es").list;

  it("translates every string, apart from a few names", () => {
    const enByPath = new Map(strings(en));
    const untranslated = strings(es)
      .filter(([path, text]) => text === enByPath.get(path) && !SAME_IN_BOTH.has(path))
      .map(([path]) => path);
    expect(untranslated).toEqual([]);
  });

  it("uses the glossary's words for the main sections", () => {
    expect(es.startHere.title).toBe("Empiece aquí");
    expect(es.essentials.title).toBe("Lo esencial");
    expect(es.fullList.title).toBe("Su lista completa");
    expect(es.home.title).toBe("Conozca su casa");
    expect(es.firstHour.title).toBe("Cuando ocurra");
    expect(es.fresh.title).toBe("Manténgalo al día");
    expect(es.row.why).toBe("Por qué");
    expect(es.row.skip).toBe("Omitir");
    expect(es.row.bringBack).toBe("Recuperar");
    expect(es.level.basics).toBe("Lo básico");
    expect(es.level.advanced).toBe("Avanzado");
    expect(es.shareDialog.inputLabel).toBe("Enlace para compartir");
  });

  it("counts and lists in Spanish", () => {
    expect(es.header.adults(1)).toBe("1 adulto");
    expect(es.header.kids(2)).toBe("2 niños");
    expect(es.header.otherPets(3)).toBe("3 otras mascotas");
    expect(es.header.county("Alameda")).toBe("Condado de Alameda");
    expect(es.kit.join(["Ana", "Luis", "Sam"])).toBe("Ana, Luis y Sam");
    expect(es.kit.join(["Ana"])).toBe("Ana");
    expect(es.fullList.count(1)).toBe("· 1 cosa");
    expect(es.essentials.runsOut(50, 42)).toContain("$50");
    expect(en.kit.join(["Ana", "Luis"])).toBe("Ana and Luis");
    expect(en.shop.toBuy(1)).toBe("1 thing to buy,");
  });

  it("formats dates for Spanish speakers in the US", () => {
    expect(es.locale).toBe("es-US");
    expect(en.locale).toBe("en-US");
  });
});
