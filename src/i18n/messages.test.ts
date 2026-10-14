import { describe, expect, it } from "vitest";
import { messagesFor } from "./messages";
import { pickLang } from "./lang";
import { META_ES } from "./es/meta";
import { HAZARDS_ES } from "./es/hazards";
import { CATEGORY_META, CONTAINER_META, SHOP_META, STAGE_META } from "@/data/meta";
import { HAZARDS } from "@/data/hazards";

/** Every path to a string or function in a messages object, like "list.essentials.title". */
function leaves(obj: unknown, path = ""): string[] {
  if (typeof obj === "string" || typeof obj === "function") return [path];
  if (Array.isArray(obj)) return obj.flatMap((v, i) => leaves(v, `${path}[${i}]`));
  if (obj && typeof obj === "object") return Object.entries(obj).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k));
  return [];
}

describe("translations", () => {
  const en = messagesFor("en");
  const es = messagesFor("es");

  it("Spanish has every English message, and no extras", () => {
    expect(leaves(es).sort()).toEqual(leaves(en).sort());
  });

  it("no Spanish message is empty", () => {
    const empty = leaves(es).filter((p) => {
      const v = p.split(/\.|\[|\]/).filter(Boolean).reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], es);
      return typeof v === "string" && v.trim() === "";
    });
    expect(empty).toEqual([]);
  });

  it("covers every kit, category, store, stage, and hazard", () => {
    expect(Object.keys(META_ES.container).sort()).toEqual(Object.keys(CONTAINER_META).sort());
    expect(Object.keys(META_ES.category).sort()).toEqual(Object.keys(CATEGORY_META).sort());
    expect(Object.keys(META_ES.shop).sort()).toEqual(Object.keys(SHOP_META).sort());
    expect(Object.keys(META_ES.stage).sort()).toEqual(Object.keys(STAGE_META).sort());
    expect(Object.keys(HAZARDS_ES).sort()).toEqual(HAZARDS.map((h) => h.id).sort());
  });
});

describe("picking a language", () => {
  it("uses a saved choice first", () => {
    expect(pickLang("en", ["es-MX"])).toBe("en");
  });
  it("otherwise follows the browser", () => {
    expect(pickLang(null, ["es-US", "en"])).toBe("es");
    expect(pickLang(null, ["fr-FR", "es"])).toBe("es");
    expect(pickLang(null, ["en-US"])).toBe("en");
  });
  it("falls back to English", () => {
    expect(pickLang("klingon", ["fr"])).toBe("en");
  });
});
