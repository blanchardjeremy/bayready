import type { Item } from "@/lib/types";
import type { Lang } from "./lang";
import { ITEMS_ES } from "./es/items";

/** An item with its name, why, and tip in a language. Falls back to English if a translation is missing. */
export function localizeItem(item: Item, lang: Lang): Item {
  if (lang === "en") return item;
  const t = ITEMS_ES[item.id];
  return t ? { ...item, name: t.name, why: t.why, tip: t.tip ?? item.tip } : item;
}
