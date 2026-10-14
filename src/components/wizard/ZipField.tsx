"use client";

import { useId, useState } from "react";
import { ZIP_PATTERN } from "@/lib/answers";
import { COUNTY_BY_ID } from "@/data/counties";
import { lookupZip } from "@/data/zips";
import type { CountyId } from "@/lib/types";

/**
 * Optional ZIP code on the county step. A ZIP code we know picks the county for
 * the person (they can still change it). Unfinished input stays here until it's
 * five digits, so the saved answer is always a whole ZIP code or nothing.
 */
export function ZipField({
  zip,
  county,
  onChange,
}: {
  zip: string | null;
  county: CountyId | null;
  onChange: (zip: string | null) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? zip ?? "";
  const done = ZIP_PATTERN.test(value);
  const known = done ? lookupZip(value) : null;

  return (
    <div className="rounded-lg bg-paper px-4 py-4">
      <label htmlFor={`${id}-zip`} className="block font-semibold">
        Your ZIP code <span className="font-normal text-ink-soft">(optional)</span>
      </label>
      <p id={`${id}-why`} className="mt-0.5 text-[0.95rem] text-ink-soft">
        It helps us tell who supplies your water and whether you&apos;re near a tsunami zone. It stays on this device.
      </p>
      <input
        id={`${id}-zip`}
        type="text"
        inputMode="numeric"
        autoComplete="postal-code"
        maxLength={5}
        value={value}
        aria-describedby={`${id}-why ${id}-status`}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
          if (digits.length === 5 || digits.length === 0) {
            setDraft(null);
            onChange(digits || null);
          } else {
            setDraft(digits);
            if (zip !== null) onChange(null);
          }
        }}
        className="mt-2 min-h-11 w-32 rounded-md border-2 border-ink-soft bg-paper px-3 text-lg font-semibold tabular-nums tracking-wider text-ink focus:border-ink focus:outline-none"
      />
      <p id={`${id}-status`} aria-live="polite" className="text-[0.95rem] [&:not(:empty)]:mt-2">
        {known
          ? `That's in ${COUNTY_BY_ID[known.county]?.name} County${known.county === county ? ", so we've picked it below" : ""}.`
          : done
            ? "We don't have that ZIP code in our Bay Area list. That's OK. Just pick your county below."
            : ""}
      </p>
    </div>
  );
}
