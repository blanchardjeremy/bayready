"use client";

export interface OutlineSection {
  /** The id of the section's heading, which the link jumps to. */
  id: string;
  label: string;
  progress?: { done: number; total: number };
}

/**
 * Every section of the list, in order, with how far along each is (a check
 * when done) and the one you're reading highlighted. Used in the sidebar on
 * wide screens and in the Contents sheet on phones.
 */
export function ListOutline({
  sections,
  active,
  label,
  countLabel,
  onJump,
}: {
  sections: OutlineSection[];
  active: string | null;
  /** Names the outline for screen readers, like "Sections". */
  label: string;
  /** Read aloud with each count, like "4 of 14 done". */
  countLabel: (done: number, total: number) => string;
  onJump: (id: string) => void;
}) {
  return (
    <nav aria-label={label}>
      <ol className="grid gap-0.5">
        {sections.map((s) => {
          const isActive = s.id === active;
          const p = s.progress;
          const done = !!p && p.total > 0 && p.done === p.total;
          const pct = p && p.total ? Math.round((p.done / p.total) * 100) : 0;
          return (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => onJump(s.id)}
                aria-current={isActive ? "location" : undefined}
                className={`-ml-3 block w-[calc(100%+0.75rem)] rounded-r-md border-l-4 py-2 pl-3 pr-2 text-left hover:bg-paper ${
                  isActive ? "border-ink bg-paper font-semibold text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="flex items-center gap-1.5">
                    {done && (
                      <svg viewBox="0 0 16 16" className="size-3.5 shrink-0 text-eucalyptus" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <path d="M3 8.5 6.5 12 13 4.5" />
                      </svg>
                    )}
                    {s.label}
                  </span>
                  {p && p.total > 0 && (
                    <span className="shrink-0 text-[0.82rem] font-normal tabular-nums text-ink-soft">
                      <span aria-hidden="true">
                        {p.done}/{p.total}
                      </span>
                      <span className="sr-only">, {countLabel(p.done, p.total)}</span>
                    </span>
                  )}
                </span>
                {p && p.total > 0 && !done && (
                  <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <span className="block h-full rounded-full bg-eucalyptus" style={{ width: `${pct}%` }} />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
