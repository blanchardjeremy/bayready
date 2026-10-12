"use client";

import { useId } from "react";
import type { HomeFact, HomeFactId, HomeInfo } from "@/data/homeFacts";

/** One "Know your home" answer: a small label over a text field. */
export function FactInput({
  fact,
  value,
  onChange,
}: {
  fact: HomeFact;
  value: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[0.85rem] font-semibold text-ink-soft">
        {fact.label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        maxLength={200}
        value={value}
        placeholder={fact.hint}
        title={fact.hint}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-10 w-full rounded-md border border-line bg-paper px-3 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none print:border-0 print:px-0"
      />
    </div>
  );
}

/** The fields that belong to one task, shown right on its row. */
export function TaskFacts({
  facts,
  home,
  onChange,
}: {
  facts: HomeFact[];
  home: HomeInfo;
  onChange: (id: HomeFactId, value: string) => void;
}) {
  if (facts.length === 0) return null;
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {facts.map((f) => (
        <FactInput key={f.id} fact={f} value={home.facts[f.id] ?? ""} onChange={(v) => onChange(f.id, v)} />
      ))}
    </div>
  );
}

/** Every answer in one place, plus free-form notes: the cheat sheet for the day it happens. */
export function KnowYourHome({
  facts,
  home,
  onFact,
  onNotes,
}: {
  facts: HomeFact[];
  home: HomeInfo;
  onFact: (id: HomeFactId, value: string) => void;
  onNotes: (notes: string) => void;
}) {
  const notesId = useId();
  return (
    <section className="print-break-avoid mt-6 border-t border-line pt-10" aria-labelledby="know-your-home">
      <h2 id="know-your-home" className="text-2xl font-extrabold tracking-tight">
        Know your home
      </h2>
      <p className="mt-2 max-w-[64ch] text-ink-soft">
        The things you&apos;ll want to know without thinking on the day it happens. Fill them in as you do the to-dos
        above. They&apos;re saved on this device and go into your spreadsheet, but never into share links.
      </p>
      <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map((f) => (
          <FactInput key={f.id} fact={f} value={home.facts[f.id] ?? ""} onChange={(v) => onFact(f.id, v)} />
        ))}
      </div>
      <div className="mt-6 max-w-3xl">
        <label htmlFor={notesId} className="block font-semibold">
          Notes and reminders
        </label>
        <textarea
          id={notesId}
          rows={4}
          maxLength={4000}
          value={home.notes}
          onChange={(e) => onNotes(e.target.value)}
          placeholder="Anything else worth remembering, like the radio is in Sam's go bag, or which neighbor has a generator."
          className="mt-1 w-full rounded-md border border-line bg-paper px-3 py-2 text-[0.95rem] text-ink placeholder:text-ink-soft/60 focus:border-ink focus:outline-none"
        />
      </div>
    </section>
  );
}
