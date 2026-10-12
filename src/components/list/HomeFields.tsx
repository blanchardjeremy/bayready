"use client";

import { useEffect, useId, useRef } from "react";
import type { HomeFact, HomeFactId, HomeInfo } from "@/data/homeFacts";
import { BAY_READY_URL } from "@/lib/urls";
import { Button } from "@/components/controls";

/** The card's id, so tasks can send people to it and print mode can single it out. */
export const HOME_CARD_ID = "know-your-home";

/** One "Know your home" answer: a label, a text field, and a short hint under it. */
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
        aria-describedby={`${id}-hint`}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-10 w-full rounded-md border border-line bg-paper px-3 text-[0.95rem] text-ink focus:border-ink focus:outline-none"
      />
      <p id={`${id}-hint`} className="mt-1 text-[0.8rem] leading-snug text-ink-soft">
        {fact.hint}
      </p>
    </div>
  );
}

/** The fields that belong to one task, shown right on its row. */
export function TaskFacts({
  facts,
  home,
  onChange,
  onShowPrint,
}: {
  facts: HomeFact[];
  home: HomeInfo;
  onChange: (id: HomeFactId, value: string) => void;
  /** Takes people to the card's print button. */
  onShowPrint: () => void;
}) {
  if (facts.length === 0) return null;
  return (
    <div className="no-print mt-3 max-w-md">
      <div className="grid gap-3">
        {facts.map((f) => (
          <FactInput key={f.id} fact={f} value={home.facts[f.id] ?? ""} onChange={(v) => onChange(f.id, v)} />
        ))}
      </div>
      <button
        type="button"
        onClick={onShowPrint}
        className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-[0.88rem] text-ink-soft underline underline-offset-2 hover:text-ink"
      >
        <PrinterIcon />
        Print these for your kit
      </button>
    </div>
  );
}

function PrinterIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 6V2h8v4M4 12H2.5V7.5a1.5 1.5 0 0 1 1.5-1.5h8a1.5 1.5 0 0 1 1.5 1.5V12H12M4 9.5h8V14H4z" />
    </svg>
  );
}

/** Prints only this card, as a sheet to keep in the bin and each go bag. */
function printHomeInfo() {
  document.body.dataset.print = "home";
  window.addEventListener("afterprint", () => delete document.body.dataset.print, { once: true });
  window.print();
}

/** Every answer in one place, plus free-form notes: the cheat sheet for the day it happens. */
export function KnowYourHome({
  facts,
  home,
  onFact,
  onNotes,
  pulse,
}: {
  facts: HomeFact[];
  home: HomeInfo;
  onFact: (id: HomeFactId, value: string) => void;
  onNotes: (notes: string) => void;
  /** Goes up each time a task sends someone here; the print button flashes to show where it is. */
  pulse: number;
}) {
  const notesId = useId();
  const printRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pulse === 0) return;
    const button = printRef.current;
    if (!button) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Bring the whole card into view, heading first, so the fields are right there too.
    button.closest("section")?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    button.focus({ preventScroll: true });
    // Restart the flash even if it's still running from the last click.
    button.classList.remove("flash-attention");
    void button.offsetWidth;
    button.classList.add("flash-attention");
  }, [pulse]);

  return (
    <section id={HOME_CARD_ID} className="print-break-avoid mt-6 scroll-mt-4 border-t border-line pt-10" aria-labelledby={`${HOME_CARD_ID}-title`}>
      <div className="no-print">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 id={`${HOME_CARD_ID}-title`} className="text-2xl font-extrabold tracking-tight">
            Know your home
          </h2>
          <Button
            ref={printRef}
            type="button"
            variant="secondary"
            onClick={printHomeInfo}
            onAnimationEnd={(e) => e.currentTarget.classList.remove("flash-attention")}
          >
            <PrinterIcon />
            Print this info
          </Button>
        </div>
        <p className="mt-2 max-w-[64ch] text-ink-soft">
          The things you&apos;ll want to know without thinking on the day it happens. Fill them in as you do the to-dos
          above, then print a copy for your bin and each go bag. They&apos;re saved on this device and go into your
          spreadsheet, but never into share links.
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
      </div>
      <PrintedSheet facts={facts} home={home} />
    </section>
  );
}

/**
 * What goes on paper: a box for every answer, tall enough to fill in by hand,
 * so a half-finished card still prints as a usable form.
 */
function PrintedSheet({ facts, home }: { facts: HomeFact[]; home: HomeInfo }) {
  return (
    <div className="hidden print:block">
      <h2 className="text-2xl font-extrabold">Know your home</h2>
      <p className="mt-1 text-sm">Fill in anything that&apos;s blank. Keep a copy in your stay-at-home bin and in each go bag.</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {facts.map((f) => (
          <div key={f.id} className="print-break-avoid min-h-[2.2cm] rounded border border-black px-2.5 py-1.5">
            <p className="text-[9pt] font-semibold uppercase tracking-wide">{f.label}</p>
            <p className="mt-0.5 whitespace-pre-wrap">{home.facts[f.id]?.trim()}</p>
          </div>
        ))}
      </div>
      <div className="print-break-avoid mt-2.5 min-h-[6.5cm] rounded border border-black px-2.5 py-1.5">
        <p className="text-[9pt] font-semibold uppercase tracking-wide">Notes and reminders</p>
        <p className="mt-0.5 whitespace-pre-wrap">{home.notes.trim()}</p>
      </div>
      <p className="mt-4 text-[9pt]">Made with Bay Ready: {BAY_READY_URL}</p>
    </div>
  );
}
