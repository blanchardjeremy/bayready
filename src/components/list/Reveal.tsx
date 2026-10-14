"use client";

import type { ReactNode } from "react";
import { useT } from "@/i18n/useLang";

/**
 * A section people can open to see more. It's built on <details>, so it works
 * with the keyboard and screen readers out of the box, and it's styled so it
 * doesn't read as another checklist row: a dashed outline, a round chevron that
 * flips when open, and a Show / Hide label.
 *
 * "quiet" is a lighter version for things most people won't need, like skipped items.
 */
export function Reveal({
  label,
  detail,
  children,
  quiet = false,
  className = "",
}: {
  label: ReactNode;
  /** A second line under the label, like what's inside and roughly what it costs. */
  detail?: ReactNode;
  children: ReactNode;
  quiet?: boolean;
  className?: string;
}) {
  const t = useT().list.reveal;
  const chevron = (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full transition-transform group-open:rotate-180 motion-reduce:transition-none ${
        quiet ? "size-5 text-ink-soft" : "size-7 bg-ink text-paper"
      }`}
    >
      <svg viewBox="0 0 16 16" className={quiet ? "size-4" : "size-3.5"} fill="none" stroke="currentColor" strokeWidth="2.2">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </span>
  );

  return (
    <details className={`group no-print ${className}`}>
      <summary
        className={`flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden ${
          quiet
            ? "min-h-11 text-[0.95rem] text-ink-soft hover:text-ink"
            : "min-h-14 rounded-lg border-2 border-dashed border-ink-soft px-4 py-2.5 hover:border-ink hover:bg-paper group-open:rounded-b-none group-open:border-solid group-open:border-b-line"
        }`}
      >
        {chevron}
        <span className="min-w-0 flex-1">
          <span className={quiet ? "" : "font-semibold"}>{label}</span>
          {detail && <span className="mt-0.5 block text-[0.9rem] text-ink-soft">{detail}</span>}
        </span>
        {!quiet && (
          <span className="shrink-0 text-[0.9rem] font-semibold underline underline-offset-2">
            <span className="group-open:hidden">{t.show}</span>
            <span className="hidden group-open:inline">{t.hide}</span>
          </span>
        )}
      </summary>
      <div className={quiet ? "mt-1" : "rounded-b-lg border-2 border-t-0 border-ink-soft bg-paper-2 px-4 pb-3 pt-2"}>
        {children}
      </div>
    </details>
  );
}
