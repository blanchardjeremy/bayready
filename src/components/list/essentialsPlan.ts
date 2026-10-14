import type { Budget, ItemState, ListEntry } from "@/lib/types";

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

/** Ways to cover an essential with what's already at home, for people starting with $0. */
export const FREE_WAYS: Record<string, string> = {
  water: "Free way: fill clean soda bottles with tap water. Skip milk and juice jugs.",
  "water-go": "Free way: refill a water bottle you already have.",
  food: "Free way: set aside cans from your cupboard and eat the oldest first.",
  "food-go": "Free way: pack granola bars, nuts, or crackers from your cupboard.",
  "can-opener": "Free way: check your kitchen drawer. One you already own is fine.",
  flashlights: "Free way: gather the flashlights you already have and check the batteries.",
  toilet: "Free way: line your own toilet with a heavy trash bag instead of a bucket.",
  "first-aid": "Free way: gather the bandages and medicines you already have into one bag.",
  "docs-copies": "Free way: photograph your IDs and insurance cards on your phone.",
  backpack: "Free way: use any backpack or duffel you already own.",
  bin: "Free way: start with a sturdy box or laundry basket.",
};

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
 * Walks the essentials in budget order, adding up what's still needed, and
 * stops at the first one that would go over. Everything above that point is
 * what the budget roughly covers.
 */
export function budgetPlan(entries: ListEntry[], st: (e: ListEntry) => ItemState, dollars: number): BudgetPlan {
  const order = budgetOrder(entries);
  let spent = 0;
  let fits = 0;
  for (const e of order) {
    const cost = st(e) === "need" ? midCost(e) : 0;
    if (spent + cost > dollars) break;
    spent += cost;
    fits++;
  }
  return { order, fits, spent };
}

/**
 * For "$0 to start": what's free, has a free way, or is already at home goes
 * first, so the list opens with things they can do today.
 */
export function freeFirst(entries: ListEntry[], st: (e: ListEntry) => ItemState): ListEntry[] {
  const free = (e: ListEntry) => st(e) === "have" || e.cost[1] === 0 || e.item.id in FREE_WAYS;
  return [...entries.filter(free), ...entries.filter((e) => !free(e))];
}
