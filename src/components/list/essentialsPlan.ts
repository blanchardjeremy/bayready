import type { Budget, ItemState, ListEntry } from "@/lib/types";
import type { Lang } from "@/i18n/lang";
import { messagesFor } from "@/i18n/messages";

/*
 * How the essentials are ordered and priced against the budget answer.
 * Pure, so it's tested on its own (essentialsPlan.test.ts).
 */

/**
 * The order to get the essentials in on a tight budget: medicine and water
 * first, then a toilet plan, food, and light. Ids not listed keep their list
 * order after these.
 */
const BUDGET_ORDER = [
  "rx",
  "oxygen-backup",
  "formula",
  "water",
  "water-go",
  "toilet-bags",
  "toilet",
  "food",
  "food-go",
  "can-opener",
  "flashlights",
  "headlamp-go",
  "pet-food",
  "first-aid",
  "cash-go",
  "docs-copies",
  "radio",
  "device-power",
  "backpack",
  "bin",
];

/**
 * Ways to cover an essential with what's already at home, by item id, for people
 * starting with $0. The words live in src/i18n/{en,es}/list.ts.
 */
export function freeWays(lang: Lang): Record<string, string> {
  return messagesFor(lang).list.essentials.freeWays;
}

/** The English free ways. Its keys say which essentials have one. */
export const FREE_WAYS = freeWays("en");

/** The middle of a rough cost range: what "about $X" means here. */
export const midCost = (e: ListEntry) => (e.cost[0] + e.cost[1]) / 2;

/** The budget as dollars, for the answers that name an amount. */
export function budgetDollars(budget: Budget | null): number | null {
  if (budget === "50") return 50;
  if (budget === "150") return 150;
  return null;
}

const rankOf = (e: ListEntry) => {
  const i = BUDGET_ORDER.indexOf(e.item.id);
  return i < 0 ? BUDGET_ORDER.length : i;
};

/** Essentials in the order to get them on a budget. Stable for ties, so kits keep their order. */
export function budgetOrder(entries: ListEntry[]): ListEntry[] {
  return entries
    .map((e, i) => ({ e, i }))
    .sort((a, b) => rankOf(a.e) - rankOf(b.e) || a.i - b.i)
    .map(({ e }) => e);
}

export interface BudgetPlan {
  /** The essentials in the order to get them. */
  order: ListEntry[];
  /** How many from the top of `order` the budget roughly covers. Things they have count as free. */
  fits: number;
  /** About how much those cost, from the middle of each range. */
  spent: number;
}

/**
 * Walks the essentials in budget order and takes each one that still fits,
 * skipping any that would go over, so one big item (like a lot of water)
 * doesn't block the cheaper ones behind it. The ones that fit come first in
 * `order`; the rest follow in their usual order.
 */
export function budgetPlan(entries: ListEntry[], st: (e: ListEntry) => ItemState, dollars: number): BudgetPlan {
  const fitting: ListEntry[] = [];
  const rest: ListEntry[] = [];
  let spent = 0;
  for (const e of budgetOrder(entries)) {
    const cost = st(e) === "need" ? midCost(e) : 0;
    // Cash has no price on the list, but it's money set aside, not something a small budget covers.
    const isCash = e.item.id.startsWith("cash") && st(e) === "need";
    if (!isCash && spent + cost <= dollars) {
      spent += cost;
      fitting.push(e);
    } else rest.push(e);
  }
  return { order: [...fitting, ...rest], fits: fitting.length, spent };
}

/**
 * For "$0 to start": what's free, has a free way, or is already at home goes
 * first, so the list opens with things they can do today.
 */
export function freeFirst(entries: ListEntry[], st: (e: ListEntry) => ItemState): ListEntry[] {
  const free = (e: ListEntry) => st(e) === "have" || e.cost[1] === 0 || e.item.id in FREE_WAYS;
  return [...entries.filter(free), ...entries.filter((e) => !free(e))];
}
