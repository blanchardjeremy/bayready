"use client";

import { useId } from "react";
import type { Household, Names } from "@/lib/types";
import { useT } from "@/i18n/useLang";

/**
 * Optional names for the adults and kids in the household. Used in the wizard
 * and in the "Edit names" dialog on the list. Empty fields fall back to
 * "Me", "Adult 2", "Kid 1".
 */
export function NamesEditor({
  household,
  names,
  onChange,
}: {
  household: Household;
  names: Names;
  onChange: (names: Names) => void;
}) {
  const id = useId();
  const t = useT().wizard.names;
  const rows = [
    ...Array.from({ length: household.adults }, (_, i) => ({ role: "adults" as const, i })),
    ...Array.from({ length: household.kids }, (_, i) => ({ role: "kids" as const, i })),
  ];

  const set = (role: "adults" | "kids", i: number, value: string) => {
    const list = [...names[role]];
    list[i] = value;
    onChange({ ...names, [role]: list });
  };

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {rows.map(({ role, i }) => {
        const inputId = `${id}-${role}-${i}`;
        const label = role === "adults" ? (i === 0 ? t.you : t.adult(i + 1)) : t.kid(i + 1);
        // What the list calls this person when the field is left blank (defaultName in answers.ts).
        const placeholder = role === "adults" ? (i === 0 ? t.me : t.adult(i + 1)) : t.kid(i + 1);
        return (
          <div key={inputId} className="flex items-center gap-3 rounded-lg bg-paper px-4 py-2.5">
            <label htmlFor={inputId} className="w-16 shrink-0 text-[0.95rem] font-semibold">
              {label}
            </label>
            <input
              id={inputId}
              type="text"
              autoComplete="off"
              maxLength={30}
              placeholder={placeholder}
              value={names[role][i] ?? ""}
              onChange={(e) => set(role, i, e.target.value)}
              className="min-h-10 w-full min-w-0 rounded-md border-2 border-line bg-paper px-3 text-ink placeholder:text-ink-soft/70 focus:border-ink focus:outline-none"
            />
          </div>
        );
      })}
    </div>
  );
}
