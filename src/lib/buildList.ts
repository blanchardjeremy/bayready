import type { Answers, Container, Context, Item, ItemState, ListEntry, Stage } from "./types";
import { peopleNames } from "./answers";
import { localizeItem } from "@/i18n/items";

/**
 * Who an entry is tracked for separately: each bag in the go bag (or only the
 * adults' bags, for adults-only items), each adult for to-dos. Adults come
 * first in the names, so an adults-only entry's slots line up with the first bags.
 */
export function slotsFor(item: Item, container: Container, ctx: Context): string[] {
  if (!item.perPerson) return [];
  const n = container === "go" ? (item.perPerson === "adults" ? ctx.adults : ctx.carriers) : container === "home" ? ctx.adults : 0;
  return n > 1 ? peopleNames(ctx).slice(0, n) : [];
}

export function buildList(ctx: Context, items: Item[]): ListEntry[] {
  const out: ListEntry[] = [];
  for (const item of items) {
    const hazardTags = item.hazards === "all" ? [] : item.hazards.filter((h) => ctx.hazards.has(h));
    if (item.hazards !== "all" && hazardTags.length === 0) continue;
    if (item.when && !item.when(ctx)) continue;

    const level = item.level === "advanced" && item.promote?.(ctx) ? "basics" : item.level;

    for (const container of item.containers) {
      if (!ctx.kits.includes(container)) continue;
      if (container === "stay" && item.coveredByGo && ctx.kits.includes("go")) continue;
      out.push({
        key: `${container}:${item.id}`,
        item: localizeItem(item, ctx.lang),
        container,
        level,
        qty: item.qty ? item.qty(ctx, container) : null,
        cost: item.cost ? item.cost(ctx, container) : [0, 0],
        hazardTags,
        slots: slotsFor(item, container, ctx),
      });
    }
  }
  return out;
}

/** The user's explicit state wins; otherwise "have" if they ticked it in the quick-pick step. */
function baseState(entry: ListEntry, states: Record<string, ItemState>, answers: Answers): ItemState {
  const s = states[entry.key];
  if (s) return s;
  if (entry.item.haveKey && answers.have.includes(entry.item.haveKey)) return "have";
  return "need";
}

export const slotKey = (entry: ListEntry, i: number) => `${entry.key}@${i}`;

/** Whether one person's part is done. Falls back to the whole entry's state. */
export function slotDone(entry: ListEntry, i: number, states: Record<string, ItemState>, answers: Answers): boolean {
  const own = states[slotKey(entry, i)];
  return (own ?? baseState(entry, states, answers)) === "have";
}

/** An entry tracked per person is "have" once everyone's part is done. */
export function stateOf(entry: ListEntry, states: Record<string, ItemState>, answers: Answers): ItemState {
  const base = baseState(entry, states, answers);
  if (base === "skip" || entry.slots.length === 0) return base;
  return entry.slots.every((_, i) => slotDone(entry, i, states, answers)) ? "have" : "need";
}

/**
 * Where an item lands in the weekend / month / later plan. Budget nudges paid
 * items later; it never removes anything.
 */
export function stageOf(entry: ListEntry, answers: Answers): Stage {
  if (entry.level === "advanced") return "later";
  const paid = entry.cost[1] > 0;
  if (entry.item.stage === "weekend" && paid && answers.budget === "0") return "month";
  if (entry.item.stage === "month" && answers.budget === "more") return "month";
  return entry.item.stage;
}

export function sumCost(entries: ListEntry[]): [number, number] {
  return entries.reduce<[number, number]>((acc, e) => [acc[0] + e.cost[0], acc[1] + e.cost[1]], [0, 0]);
}

export function formatCost([lo, hi]: [number, number]): string {
  if (hi === 0) return "Free";
  const r = (n: number) => (n >= 100 ? Math.round(n / 10) * 10 : Math.round(n)).toLocaleString("en-US");
  if (r(lo) === r(hi)) return `~$${r(hi)}`;
  return `$${r(lo)}–${r(hi)}`;
}

export const CONTAINER_ORDER: Container[] = ["home", "stay", "go", "car"];

/** Up to 6 free, quick wins for the first weekend ("Start here"), highest impact first. */
export function firstSteps(entries: ListEntry[], st: (e: ListEntry) => ItemState, answers: Answers): ListEntry[] {
  const rank = (e: ListEntry) => e.item.startRank ?? Infinity;
  return entries
    .filter((e) => stageOf(e, answers) === "weekend" && e.cost[1] === 0 && st(e) !== "skip")
    .map((e, i) => ({ e, i }))
    .sort((a, b) => rank(a.e) - rank(b.e) || a.i - b.i)
    .slice(0, 6)
    .map(({ e }) => e);
}

/** Plan stage that keeps the first weekend small: only the Start here steps. */
export function planStage(e: ListEntry, firstKeys: Set<string>, answers: Answers): Stage {
  if (firstKeys.has(e.key)) return "weekend";
  const s = stageOf(e, answers);
  return s === "weekend" ? "month" : s;
}
