"use client";

import { useId, type ReactNode } from "react";
import { formatCost } from "@/lib/buildList";
import type { Context, ItemState, ListEntry } from "@/lib/types";
import { HAZARD_BY_ID } from "@/data/hazards";
import { CONTAINER_META } from "@/data/meta";
import { CheckBox } from "@/components/controls";

export function ItemRow({
  entry,
  state,
  ctx,
  onChange,
  showContainer = false,
  readOnly = false,
  slotDone,
  onSlot,
  onEditNames,
  extra,
  essential = false,
  note,
}: {
  entry: ListEntry;
  state: ItemState;
  ctx: Context;
  onChange: (s: ItemState) => void;
  showContainer?: boolean;
  readOnly?: boolean;
  /** For entries tracked per person: whether each person's part is done. */
  slotDone?: (i: number) => boolean;
  onSlot?: (i: number, done: boolean) => void;
  /** Opens the names editor. Its button shows on hover, or always on touch screens. */
  onEditNames?: () => void;
  /** Anything extra under the row, like the "Know your home" fields for this task. */
  extra?: ReactNode;
  /** Shows a small "Essential" tag, for the full list. */
  essential?: boolean;
  /** A short line that shows even once it's checked, like "Check you have the full amount." */
  note?: ReactNode;
}) {
  const id = useId();
  const { item, qty, cost, hazardTags } = entry;
  const have = state === "have";
  const skipped = state === "skip";
  const link = item.link?.(ctx) ?? null;
  const isTask = entry.container === "home";

  const showCost = !isTask && !!item.cost && !have;

  return (
    <li className="print-break-avoid flex items-start gap-3 py-3">
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={have}
        disabled={readOnly || skipped}
        onChange={(e) => onChange(e.target.checked ? "have" : "need")}
      />
      <label htmlFor={id} className="mt-0.5 cursor-pointer rounded peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus">
        <CheckBox checked={have} tone="eucalyptus" />
        <span className="sr-only">{isTask ? "Done" : "Have it"}</span>
      </label>
      <div className="min-w-0 flex-1">
        <label
          htmlFor={id}
          className={`cursor-pointer ${have ? "text-ink-soft line-through decoration-1" : "font-semibold"} ${skipped ? "text-ink-soft" : ""}`}
        >
          {item.name}
        </label>
        {essential && !skipped && (
          <span className="ml-2 inline-block rounded bg-orange-wash px-1.5 align-[0.1em] text-[0.75rem] font-semibold leading-5 text-orange">
            Essential
          </span>
        )}
        {note && !skipped && <p className="mt-1 max-w-[62ch] text-[0.88rem] text-ink">{note}</p>}
        {!have && (showContainer || hazardTags.length > 0 || link) && (
          // One quiet line of context: which kit, which hazards, and a link if there is one.
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[0.82rem] text-ink-soft">
            {[
              showContainer && CONTAINER_META[entry.container].name,
              hazardTags.length > 0 && `For ${hazardTags.map((h) => HAZARD_BY_ID[h].short.toLowerCase()).join(", ")}`,
            ]
              .filter(Boolean)
              .join(" · ")}
            {link && (
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-2">
                {link.label}
              </a>
            )}
          </p>
        )}
        {!have && qty?.buy && <p className="mt-1 max-w-[62ch] text-[0.9rem] leading-snug text-ink-soft">{qty.buy}</p>}
        {!have && !skipped && entry.slots.length > 0 && slotDone && (
          <div role="group" aria-label={`Who's done: ${item.name}`} className="group/names mt-2 flex flex-wrap items-center gap-1.5">
            {entry.slots.map((name, i) => {
              const done = slotDone(i);
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={done}
                  disabled={readOnly}
                  onClick={() => onSlot?.(i, !done)}
                  className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-3 text-[0.85rem] font-semibold ${
                    done
                      ? "border-eucalyptus bg-eucalyptus-wash text-eucalyptus"
                      : "border-line bg-paper text-ink-soft hover:border-ink hover:text-ink"
                  }`}
                >
                  {done && (
                    <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <path d="M3 8.5 6.5 12 13 4.5" />
                    </svg>
                  )}
                  {name}
                </button>
              );
            })}
            {onEditNames && !readOnly && (
              <button
                type="button"
                onClick={onEditNames}
                className="no-print inline-flex min-h-8 items-center px-2 text-[0.85rem] text-ink-soft underline underline-offset-2 opacity-0 transition-opacity hover:text-ink group-hover/names:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
              >
                Edit names
              </button>
            )}
          </div>
        )}
        {!skipped && extra}
        {!have && (
          <details className="group/why mt-1">
            <summary className="no-print inline-flex min-h-8 cursor-pointer list-none items-center gap-1 text-[0.82rem] text-ink-soft hover:text-ink [&::-webkit-details-marker]:hidden">
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="8" cy="8" r="6.25" />
                <path d="M8 7.25v4M8 4.75v.5" strokeLinecap="round" />
              </svg>
              <span className="underline-offset-2 group-open/why:underline">Why this</span>
            </summary>
            <div className="text-[0.93rem]">
              <p className="mt-1 max-w-[62ch]">{item.why}</p>
              {item.tip && <p className="mt-1 max-w-[62ch] text-ink-soft">{item.tip}</p>}
              {item.examples && (
                <p className="mt-1 max-w-[62ch] text-ink-soft">
                  Examples:{" "}
                  {item.examples.map((ex, i) => (
                    <span key={ex.url}>
                      {i > 0 && ", "}
                      <a href={ex.url} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
                        {ex.label}
                      </a>
                    </span>
                  ))}
                  . These are examples, not endorsements.
                </p>
              )}
            </div>
          </details>
        )}
      </div>
      {(qty || showCost) && (
        // The amount gets its own column, with the rough cost under it, so the list scans like a shopping list.
        <div className="w-24 shrink-0 text-right sm:w-28">
          {qty && (
            <p className={`text-[0.95rem] font-semibold leading-snug tabular-nums ${have ? "font-normal text-ink-soft" : ""}`}>
              {qty.text}
            </p>
          )}
          {showCost && <p className="mt-0.5 text-[0.82rem] tabular-nums text-ink-soft">{formatCost(cost)}</p>}
        </div>
      )}
      {!readOnly &&
        (skipped ? (
          <button
            type="button"
            onClick={() => onChange("need")}
            className="no-print -my-2.5 min-h-11 shrink-0 rounded px-2 text-[0.88rem] text-ink-soft underline underline-offset-2 hover:text-ink"
            aria-label={`Bring back ${item.name}`}
          >
            Bring back
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onChange("skip")}
            title="Skip"
            aria-label={`Skip ${item.name}`}
            className="no-print -my-2 -mr-2 grid size-10 shrink-0 place-items-center rounded-full text-ink-soft hover:bg-paper hover:text-ink"
          >
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
              <path d="m4.5 4.5 7 7M11.5 4.5l-7 7" strokeLinecap="round" />
            </svg>
          </button>
        ))}
    </li>
  );
}
