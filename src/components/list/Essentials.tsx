"use client";

import type { ComponentProps } from "react";
import { CONTAINER_ORDER, formatCost, sumCost } from "@/lib/buildList";
import type { Budget, ItemState, ListEntry } from "@/lib/types";
import { metaFor } from "@/data/meta";
import { useLang, useT } from "@/i18n/useLang";
import { ItemRow } from "./ItemRow";
import { Reveal } from "./Reveal";
import { budgetDollars, budgetPlan, freeFirst, freeWays } from "./essentialsPlan";

type RowProps = (e: ListEntry) => ComponentProps<typeof ItemRow>;

/**
 * The short list to get and put away first, right under Start here. Rows are
 * the same as in the full list, so checking one here checks it there too.
 * The budget answer decides the order: free ways first for $0, and a line
 * where the money roughly runs out for $50 and $150.
 */
export function Essentials({
  entries,
  st,
  row,
  budget,
}: {
  /** The essentials on this list, at the list's current level. */
  entries: ListEntry[];
  st: (e: ListEntry) => ItemState;
  row: RowProps;
  budget: Budget | null;
}) {
  const t = useT().list.essentials;
  const active = entries.filter((e) => st(e) !== "skip");
  if (active.length === 0) return null;
  // Every row here is an essential, so the tag the full list uses would only repeat itself.
  const plainRow: RowProps = (e) => ({ ...row(e), essential: false });
  const done = active.filter((e) => st(e) === "have").length;
  const allDone = done === active.length;
  const pct = Math.round((done / active.length) * 100);

  return (
    <section id="essentials" className="no-print mt-10 scroll-mt-4" aria-labelledby="essentials-title">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div>
          <h2 id="essentials-title" className="text-2xl font-extrabold tracking-tight">
            {allDone ? t.doneTitle : t.title}
          </h2>
          {!allDone && <p className="mt-1 max-w-[64ch] text-ink-soft">{t.intro}</p>}
        </div>
        <p className="font-semibold tabular-nums">
          {t.count(done, active.length)}
          <span className="font-normal text-ink-soft"> {allDone ? t.done : t.soFar}</span>
        </p>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label={t.progressLabel}
        aria-valuetext={t.count(done, active.length)}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-eucalyptus" style={{ width: `${pct}%` }} />
      </div>

      {allDone ? (
        <div className="mt-5 rounded-xl border-2 border-eucalyptus bg-eucalyptus-wash p-5">
          <p className="text-lg font-extrabold">{t.doneHeadline}</p>
          <p className="mt-1 max-w-[64ch]">{t.doneBody}</p>
          <Reveal quiet className="mt-2" label={t.seeThem}>
            <ByKit entries={active} row={plainRow} />
          </Reveal>
        </div>
      ) : (
        <Body entries={active} st={st} row={plainRow} budget={budget} />
      )}
    </section>
  );
}

function Body({ entries, st, row, budget }: { entries: ListEntry[]; st: (e: ListEntry) => ItemState; row: RowProps; budget: Budget | null }) {
  const lang = useLang();
  const t = useT().list.essentials;
  const ways = freeWays(lang);
  const need = entries.filter((e) => st(e) === "need");
  const dollars = budgetDollars(budget);

  if (dollars !== null) {
    const { order, fits, spent } = budgetPlan(entries, st, dollars);
    const rest = order.slice(fits).filter((e) => st(e) === "need");
    const line = (
      <li key="budget-line" className="py-3">
        <p className="flex items-center gap-3 text-[0.95rem] font-semibold text-orange">
          <span aria-hidden="true" className="h-0.5 w-6 shrink-0 bg-orange" />
          {fits === 0 ? t.overBudget(dollars) : t.runsOut(dollars, Math.round(spent))}
          <span aria-hidden="true" className="h-0.5 min-w-6 flex-1 bg-orange" />
        </p>
      </li>
    );
    return (
      <>
        <p className="mt-4 max-w-[64ch]">
          {t.budgetIntro(dollars)} {rest.length === 0 ? t.coversAll(dollars) : t.coversAbove(dollars)}
        </p>
        <ul className="mt-2 max-w-3xl divide-y divide-line">
          {order.flatMap((e, i) => {
            // Below the line, point out a free way to start, like filling jugs from the tap.
            const free = i >= fits && st(e) === "need" ? ways[e.item.id] : undefined;
            const item = <ItemRow key={e.key} {...(free ? { ...row(e), note: free } : row(e))} showContainer />;
            return i === fits && rest.length > 0 ? [line, item] : [item];
          })}
        </ul>
        {rest.length > 0 && <p className="mt-2 text-[0.95rem] text-ink-soft">{t.rest(formatCost(sumCost(rest)))}</p>}
      </>
    );
  }

  if (budget === "0") {
    return (
      <>
        <p className="mt-4 max-w-[64ch]">{t.zeroIntro}</p>
        <ByKit
          entries={freeFirst(entries, st)}
          row={(e) => {
            const props = row(e);
            const free = st(e) === "need" ? ways[e.item.id] : undefined;
            return free ? { ...props, note: free } : props;
          }}
        />
      </>
    );
  }

  return (
    <>
      <ByKit entries={entries} row={row} />
      {need.length > 0 && <p className="mt-2 text-[0.95rem] text-ink-soft">{t.stillToGet(formatCost(sumCost(need)))}</p>}
    </>
  );
}

function ByKit({ entries, row }: { entries: ListEntry[]; row: RowProps }) {
  const meta = metaFor(useLang());
  const kits = CONTAINER_ORDER.filter((c) => entries.some((e) => e.container === c));
  return (
    <div className="mt-4 grid gap-x-12 gap-y-6 lg:grid-cols-2">
      {kits.map((c) => (
        <div key={c}>
          {kits.length > 1 && (
            <h3 className="border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">{meta.container[c].name}</h3>
          )}
          <ul className="divide-y divide-line">
            {entries
              .filter((e) => e.container === c)
              .map((e) => (
                <ItemRow key={e.key} {...row(e)} />
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
