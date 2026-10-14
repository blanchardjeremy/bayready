"use client";

import type { ReactNode } from "react";

export function RadioCards<T extends string | number>({
  name,
  legend,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  value: T | null;
  options: { value: T; label: string; desc?: ReactNode; badge?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
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

export function CheckList<T extends string>({
  legend,
  values,
  options,
  onToggle,
  columns = 1,
}: {
  legend: string;
  values: T[];
  options: { value: T; label: string; desc?: ReactNode }[];
  onToggle: (v: T, checked: boolean) => void;
  columns?: 1 | 2;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className={`grid gap-2.5 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((o) => {
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
        })}
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
  const btn =
    "grid size-11 place-items-center rounded-full border-2 border-line bg-paper text-xl font-semibold leading-none hover:border-ink disabled:opacity-35 disabled:hover:border-line";
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
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
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
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
      </div>
    </div>
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
