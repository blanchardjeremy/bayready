"use client";

import { useEffect, useId, useRef } from "react";
import type { FactField, HomeInfo } from "@/data/homeFacts";
import { Button } from "@/components/controls";
import { PrinterIcon } from "@/components/icons";
import { useT } from "@/i18n/useLang";

/** The card's id, so tasks can send people to it and print mode can single it out. */
export const HOME_CARD_ID = "know-your-home";

/** One "Know your home" answer: a label, a text field, and a short hint under it. */
export function FactInput({ field, onChange }: { field: FactField; onChange: (value: string) => void }) {
  const id = useId();
  // Per-person boxes (go bags, cell numbers) share one hint, so only the first shows it.
  const hint = field.person ? null : field.fact.hint;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[0.85rem] font-semibold text-ink-soft">
        {field.label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete="off"
        maxLength={200}
        value={field.value}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 min-h-10 w-full rounded-md border border-field-line bg-paper px-3 text-[0.95rem] text-ink focus:border-ink"
      />
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[0.8rem] leading-snug text-ink-soft">
          {hint}
        </p>
      )}
    </div>
  );
}

/** The fields that belong to one task, shown right on its row. */
export function TaskFacts({
  fields,
  onChange,
  onShowPrint,
}: {
  fields: FactField[];
  onChange: (field: FactField, value: string) => void;
  /** Takes people to the card's print button. */
  onShowPrint: () => void;
}) {
  const t = useT().list.home;
  if (fields.length === 0) return null;
  return (
    <div className="no-print mt-3 max-w-md">
      <div className="grid gap-3">
        {fields.map((f) => (
          <FactInput key={f.key} field={f} onChange={(v) => onChange(f, v)} />
        ))}
      </div>
      <button
        type="button"
        onClick={onShowPrint}
        className="mt-2 inline-flex min-h-8 items-center gap-1.5 text-[0.88rem] text-ink-soft underline underline-offset-2 hover:text-ink"
      >
        <PrinterIcon className="size-3.5" />
        {t.printThese}
      </button>
    </div>
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
  fields,
  home,
  onField,
  onNotes,
  pulse,
}: {
  fields: FactField[];
  home: HomeInfo;
  onField: (field: FactField, value: string) => void;
  onNotes: (notes: string) => void;
  /** Goes up each time a task sends someone here; the print button flashes to show where it is. */
  pulse: number;
}) {
  const t = useT().list.home;
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
    <section id={HOME_CARD_ID} className="print-break-avoid mt-6 scroll-mt-4 border-t border-line pt-10 print:-order-1 print:mb-8 print:border-0 print:pt-0" aria-labelledby={`${HOME_CARD_ID}-title`}>
      <div className="no-print">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 id={`${HOME_CARD_ID}-title`} className="text-2xl font-extrabold tracking-tight">
            {t.title}
          </h2>
          <Button
            ref={printRef}
            type="button"
            variant="secondary"
            onClick={printHomeInfo}
            onAnimationEnd={(e) => e.currentTarget.classList.remove("flash-attention")}
          >
            <PrinterIcon />
            {t.print}
          </Button>
        </div>
        <p className="mt-2 max-w-[64ch] text-ink-soft">{t.intro}</p>
        <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map((f) => (
            <FactInput key={f.key} field={f} onChange={(v) => onField(f, v)} />
          ))}
        </div>
        <div className="mt-6 max-w-3xl">
          <label htmlFor={notesId} className="block font-semibold">
            {t.notes}
          </label>
          <textarea
            id={notesId}
            rows={4}
            maxLength={4000}
            value={home.notes}
            onChange={(e) => onNotes(e.target.value)}
            placeholder={t.notesPlaceholder}
            className="mt-1 w-full rounded-md border border-field-line bg-paper px-3 py-2 text-[0.95rem] text-ink placeholder:text-ink-soft focus:border-ink"
          />
        </div>
      </div>
      <PrintedSheet fields={fields} notes={home.notes} />
    </section>
  );
}

/**
 * What goes on paper: a box for every answer, tall enough to fill in by hand,
 * so a half-finished card still prints as a usable form.
 */
function PrintedSheet({ fields, notes }: { fields: FactField[]; notes: string }) {
  const t = useT().list.home;
  return (
    <div className="hidden print:block">
      <h2 className="text-2xl font-extrabold">{t.title}</h2>
      <p className="mt-1 text-sm">{t.printedIntro}</p>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {fields.map((f) => (
          <div key={f.key} className="print-break-avoid min-h-[2.2cm] rounded border border-black px-2.5 py-1.5">
            <p className="text-[9pt] font-semibold uppercase tracking-wide">{f.label}</p>
            <p className="mt-0.5 whitespace-pre-wrap">{f.value.trim()}</p>
          </div>
        ))}
      </div>
      <div className="print-break-avoid mt-2.5 min-h-[6.5cm] rounded border border-black px-2.5 py-1.5">
        <p className="text-[9pt] font-semibold uppercase tracking-wide">{t.notes}</p>
        <p className="mt-0.5 whitespace-pre-wrap">{notes.trim()}</p>
      </div>
      <p className="mt-4 text-[9pt]">{t.madeWith}</p>
    </div>
  );
}
