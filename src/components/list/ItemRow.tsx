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
}) {
  const id = useId();
  const { item, qty, cost, hazardTags } = entry;
  const have = state === "have";
  const skipped = state === "skip";
  const link = item.link?.(ctx) ?? null;
  const isTask = entry.container === "home";

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
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
          <label
            htmlFor={id}
            className={`cursor-pointer ${have ? "text-ink-soft line-through decoration-1" : "font-semibold"} ${skipped ? "text-ink-soft" : ""}`}
          >
            {item.name}
          </label>
          {qty && (
            <span className={`text-[0.95rem] tabular-nums ${have ? "text-ink-soft" : ""}`}>{qty.text}</span>
          )}
        </div>
        {!have && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.88rem] text-ink-soft">
            {qty?.buy && <span>{qty.buy}</span>}
            {showContainer && <span>{CONTAINER_META[entry.container].name}</span>}
            {hazardTags.length > 0 && (
              <span>For {hazardTags.map((h) => HAZARD_BY_ID[h].short.toLowerCase()).join(", ")}</span>
            )}
            {!isTask && item.cost && <span>{formatCost(cost)}</span>}
            {link && (
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-2">
                {link.label}
              </a>
            )}
          </div>
        )}
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
          <details className="group mt-1 text-[0.93rem]">
            <summary className="no-print cursor-pointer text-ink-soft hover:text-ink">Why this</summary>
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
          </details>
        )}
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange(skipped ? "need" : "skip")}
          className="no-print shrink-0 rounded px-2 py-1 text-[0.88rem] text-ink-soft underline-offset-2 hover:text-ink hover:underline"
          aria-label={skipped ? `Bring back ${item.name}` : `Skip ${item.name}`}
        >
          {skipped ? "Bring back" : "Skip"}
        </button>
      )}
    </li>
  );
}
