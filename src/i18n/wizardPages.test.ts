import { describe, expect, it } from "vitest";
import { messagesFor } from "./messages";
import { HAVE_PICKS, HAVE_PICK_LABELS_ES, havePicksFor } from "@/data/havePicks";

/**
 * Words that are the same in English and Spanish, so a Spanish value may equal the
 * English one. Anything else that matches was probably left untranslated.
 */
const SAME_IN_BOTH = new Set(["No", "OK", "Bay Ready", "ZIP"]);

/** Every string in a messages object, with its path. Functions are called with sample arguments. */
function strings(obj: unknown, path = ""): [string, string][] {
  if (typeof obj === "string") return [[path, obj]];
  if (typeof obj === "function") return [[path, String(obj(2, 2, 2))]];
  if (Array.isArray(obj)) return obj.flatMap((v, i) => strings(v, `${path}[${i}]`));
  if (obj && typeof obj === "object") return Object.entries(obj).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k));
  return [];
}

describe("Spanish wizard and pages", () => {
  const en = messagesFor("en");
  const es = messagesFor("es");

  for (const area of ["wizard", "pages"] as const) {
    it(`has no English left in ${area}`, () => {
      const english = new Map(strings(en[area]));
      const same = strings(es[area])
        .filter(([path, value]) => value !== "" && value === english.get(path) && !SAME_IN_BOTH.has(value))
        // Step titles are formatted the same way in both languages; the title itself is checked on its own.
        .filter(([path]) => path !== "pageTitle")
        .map(([path, value]) => `${path}: ${value}`);
      expect(same).toEqual([]);
    });
  }

  it("has a Spanish label for every 'already have' pick, with the same keys in the same order", () => {
    expect(Object.keys(HAVE_PICK_LABELS_ES).sort()).toEqual(HAVE_PICKS.map((p) => p.key).sort());
    expect(havePicksFor("es").map((p) => p.key)).toEqual(HAVE_PICKS.map((p) => p.key));
    for (const p of havePicksFor("es")) {
      expect(p.label).not.toBe(HAVE_PICKS.find((e) => e.key === p.key)?.label);
    }
  });
});
