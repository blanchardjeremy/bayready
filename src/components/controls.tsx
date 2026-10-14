"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * A group of choices, one of which can be picked. The question is a hidden legend,
 * or pass `labelledBy` to use a visible heading instead, so it isn't read twice.
 * `describedBy` points at an error or note that every option should carry.
 */
export function RadioCards<T extends string | number>({
  name,
  legend,
  labelledBy,
  describedBy,
  value,
  options,
  onChange,
}: {
  name: string;
  legend?: string;
  labelledBy?: string;
  describedBy?: string;
  value: T | null;
  options: { value: T; label: string; desc?: ReactNode; badge?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset aria-labelledby={labelledBy}>
      {legend && !labelledBy && <legend className="sr-only">{legend}</legend>}
      <div className="grid gap-2.5">
        {options.map((o) => {
          const checked = value === o.value;
          return (
            <label
              key={String(o.value)}
              className={`group flex cursor-pointer items-start gap-3.5 rounded-lg border-2 bg-paper px-4 py-3.5 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
                checked ? "border-ink" : "border-transparent hover:border-line"
              }`}
            >
              <input
                type="radio"
                name={name}
                className="peer sr-only"
                aria-describedby={describedBy}
                checked={checked}
                onChange={() => onChange(o.value)}
              />
              <span
                aria-hidden="true"
                className={`mt-1 grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                  checked ? "border-ink" : "border-ink-soft"
                }`}
              >
                {checked && <span className="size-2.5 rounded-full bg-ink" />}
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 font-semibold">
                  {o.label}
                  {o.badge && (
                    <span className="rounded bg-orange-wash px-1.5 py-0.5 text-[0.8rem] font-semibold text-orange">
                      {o.badge}
                    </span>
                  )}
                </span>
                {o.desc && <span className="mt-0.5 block text-[0.95rem] text-ink-soft">{o.desc}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

type CheckOption<T> = { value: T; label: string; desc?: ReactNode; group?: string };

/**
 * A group of checkboxes. Options that share a `group` sit under a small subheading,
 * in the order given. Options with no group after a grouped run get a divider.
 */
export function CheckList<T extends string>({
  legend,
  describedBy,
  values,
  options,
  onToggle,
  columns = 1,
}: {
  legend: string;
  describedBy?: string;
  values: T[];
  options: CheckOption<T>[];
  onToggle: (v: T, checked: boolean) => void;
  columns?: 1 | 2;
}) {
  const id = useId();
  // Consecutive options with the same group form one run.
  const runs: { group?: string; options: CheckOption<T>[] }[] = [];
  for (const o of options) {
    const last = runs.at(-1);
    if (last && last.group === o.group) last.options.push(o);
    else runs.push({ group: o.group, options: [o] });
  }
  const grid = `grid gap-2.5 ${columns === 2 ? "sm:grid-cols-2" : ""}`;

  const renderOption = (o: CheckOption<T>) => {
    const checked = values.includes(o.value);
    return (
      <label
        key={o.value}
        className={`flex cursor-pointer items-start gap-3.5 rounded-lg border-2 bg-paper px-4 py-3.5 transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus ${
          checked ? "border-ink" : "border-transparent hover:border-line"
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          aria-describedby={describedBy}
          checked={checked}
          onChange={(e) => onToggle(o.value, e.target.checked)}
        />
        <CheckBox checked={checked} />
        <span className="min-w-0">
          <span className="block font-semibold">{o.label}</span>
          {o.desc && <span className="mt-0.5 block text-[0.95rem] text-ink-soft">{o.desc}</span>}
        </span>
      </label>
    );
  };

  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="grid gap-5">
        {runs.map((run, r) =>
          run.group ? (
            <div key={r} role="group" aria-labelledby={`${id}-g${r}`}>
              <p id={`${id}-g${r}`} className="mb-2 text-[0.95rem] font-semibold text-ink-soft">
                {run.group}
              </p>
              <div className={grid}>{run.options.map(renderOption)}</div>
            </div>
          ) : (
            <div key={r} className={`${grid} ${r > 0 ? "border-t border-line pt-5" : ""}`}>
              {run.options.map(renderOption)}
            </div>
          ),
        )}
      </div>
    </fieldset>
  );
}

export function CheckBox({ checked, tone = "ink" }: { checked: boolean; tone?: "ink" | "eucalyptus" }) {
  const on = tone === "eucalyptus" ? "border-eucalyptus bg-eucalyptus" : "border-ink bg-ink";
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded border-2 ${
        checked ? on : "border-ink-soft"
      }`}
    >
      {checked && (
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="var(--paper)" strokeWidth="2.5">
          <path d="M3 8.5 6.5 12 13 4.5" />
        </svg>
      )}
    </span>
  );
}

export function Stepper({
  label,
  hint,
  value,
  min = 0,
  max = 20,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  const id = `stepper-${label.replace(/\W+/g, "-").toLowerCase()}`;
  // What the +/- buttons just did, read out by screen readers.
  const [said, setSaid] = useState("");
  const step = (n: number) => {
    const next = Math.min(max, Math.max(min, n));
    if (next === value) return;
    onChange(next);
    setSaid(`${label}: ${next}`);
  };
  // aria-disabled rather than disabled, so focus stays put when a button reaches the end.
  const btn =
    "grid size-11 place-items-center rounded-full border-2 border-line bg-paper text-xl font-semibold leading-none hover:border-ink aria-disabled:cursor-default aria-disabled:opacity-35 aria-disabled:hover:border-line";
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-paper px-4 py-3">
      <label htmlFor={id} className="min-w-0">
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-[0.9rem] text-ink-soft">{hint}</span>}
      </label>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          className={btn}
          aria-label={`Remove one: ${label}`}
          aria-disabled={value <= min}
          onClick={() => step(value - 1)}
        >
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
          }}
          className="w-12 rounded-md border-2 border-transparent bg-transparent text-center text-lg font-semibold tabular-nums focus:border-ink [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          className={btn}
          aria-label={`Add one: ${label}`}
          aria-disabled={value >= max}
          onClick={() => step(value + 1)}
        >
          +
        </button>
      </div>
      <span className="sr-only" aria-live="polite">
        {said}
      </span>
    </div>
  );
}

/** A link that opens in a new tab, and says so to screen readers. */
export function ExternalLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

export function GoodToKnow({ children }: { children: ReactNode }) {
  return (
    <aside className="border-l-4 border-orange bg-paper/60 py-3 pl-4 pr-3 text-[0.98rem]">
      <p className="font-semibold">Good to know</p>
      <div className="mt-1 text-ink-soft [&_a]:font-semibold [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </aside>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...rest
}: React.ComponentProps<"button"> & { variant?: "primary" | "secondary" | "quiet" }) {
  const styles = {
    primary: "bg-orange text-orange-ink hover:brightness-110",
    secondary: "border-2 border-ink text-ink hover:bg-paper",
    quiet: "text-ink-soft underline underline-offset-2 hover:text-ink",
  }[variant];
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold ${styles} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export const buttonClass = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-orange px-5 font-semibold text-orange-ink hover:brightness-110",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border-2 border-ink px-5 font-semibold text-ink hover:bg-paper",
  quiet:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 font-semibold text-ink-soft underline underline-offset-2 hover:text-ink",
};
