import type { Category, Container, Context, ItemState, ListEntry, Shop } from "@/lib/types";
import type { Lang } from "@/i18n/lang";
import { messagesFor } from "@/i18n/messages";
import { CATEGORY_ORDER, metaFor } from "@/data/meta";
import { COUNTY_BY_ID } from "@/data/counties";

/*
 * Plain text the list page hands out: "Copy as text", the copied shopping
 * list, and the dates on the example refresh log. Pure, so it's tested on its
 * own (listText.test.ts), in both languages.
 */

/** Entries grouped by category, in CATEGORY_ORDER, leaving out empty ones. */
export function groupByCategory(entries: ListEntry[]): (readonly [Category, ListEntry[]])[] {
  return CATEGORY_ORDER.map((cat) => [cat, entries.filter((e) => e.item.category === cat)] as const).filter(
    ([, list]) => list.length > 0,
  );
}

/** The whole list as a checklist, by kit and category, in ctx's language. */
export function asText(kits: Container[], main: ListEntry[], st: (e: ListEntry) => ItemState, ctx: Context): string {
  const t = messagesFor(ctx.lang).list;
  const meta = metaFor(ctx.lang);
  const county = ctx.answers.county ? COUNTY_BY_ID[ctx.answers.county] : undefined;
  const lines: string[] = [t.text.title, ""];
  for (const c of kits) {
    lines.push(meta.container[c].name.toUpperCase());
    for (const [cat, list] of groupByCategory(main.filter((e) => e.container === c && st(e) !== "skip"))) {
      lines.push(`  ${meta.category[cat]}`);
      for (const e of list) {
        lines.push(`  [${st(e) === "have" ? "x" : " "}] ${e.item.name}${e.qty ? ` (${e.qty.text})` : ""}`);
      }
    }
    lines.push("");
  }
  if (county?.alert) lines.push(t.text.alerts(county.alert.name, county.alert.url), "");
  lines.push(t.credit);
  return lines.join("\n");
}

/**
 * What's still to buy, by store, one line per item (with each kit's amount),
 * for pasting into a notes app.
 */
export function shoppingText(
  groups: readonly (readonly [Shop, ListEntry[][]])[],
  st: (e: ListEntry) => ItemState,
  lang: Lang,
): string {
  const meta = metaFor(lang);
  return groups
    .map(([shop, lists]) => {
      const open = lists.map((l) => l.filter((e) => st(e) === "need")).filter((l) => l.length > 0);
      if (open.length === 0) return null;
      return [
        meta.shop[shop],
        ...open.map(
          (l) =>
            `[ ] ${l[0].item.name}${l.map((e) => (e.qty ? ` (${meta.container[e.container].name}: ${e.qty.text})` : "")).join("")}`,
        ),
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n\n")
    .concat(`\n\n${messagesFor(lang).list.credit}`);
}

/**
 * A short date the way someone would write it on paper: "Mar 8" or "8 mar"
 * with a day, "Mar" or "mar" without. `month` is 1-based.
 */
export function handDate(locale: string, month: number, day?: number): string {
  const d = new Date(2026, month - 1, day ?? 1);
  const opts: Intl.DateTimeFormatOptions = day ? { month: "short", day: "numeric" } : { month: "short" };
  // Some locales add a period to short months ("mar."); a hand-written log wouldn't.
  return d.toLocaleDateString(locale, opts).replace(/\./g, "");
}
