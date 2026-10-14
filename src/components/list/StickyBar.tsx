"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface BarSection {
  /** The id of the section's heading. Its text becomes the bar's title while that section is on screen. */
  id: string;
  progress?: { done: number; total: number };
}

/**
 * Stays at the top of the list page as you scroll. On the left: the section
 * you're in and how far along it is. On the right: whatever actions are
 * passed in (the Save / share menu). Sections whose heading isn't on the page,
 * like kits in the shopping view, are skipped.
 */
export function StickyBar({
  title,
  progress,
  sections,
  countText,
  progressLabel,
  status,
  actions,
}: {
  /** Shown before any section has scrolled up to the bar. */
  title: string;
  progress?: { done: number; total: number };
  sections: BarSection[];
  countText: (done: number, total: number) => string;
  progressLabel: (title: string) => string;
  /** A short message after an action, like "Link copied", shown in place of the progress for a moment. */
  status?: string | null;
  actions: ReactNode;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<{ id: string; title: string } | null>(null);
  const [stuck, setStuck] = useState(false);
  const ids = sections.map((s) => s.id).join(",");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = bar.current?.offsetHeight ?? 0;
      setStuck((bar.current?.getBoundingClientRect().top ?? 1) <= 0 && window.scrollY > 0);
      // The last section whose heading has scrolled up to just under the bar.
      let current: { id: string; title: string } | null = null;
      for (const id of ids.split(",")) {
        const el = document.getElementById(id);
        if (!el || el.offsetParent === null) continue;
        if (el.getBoundingClientRect().top <= height + 16) {
          // Headings like "Your full list · 74 things" read better as just the name in the bar.
          const text = (el.textContent ?? "").split("·")[0].trim();
          if (!current || el.getBoundingClientRect().top >= (document.getElementById(current.id)?.getBoundingClientRect().top ?? -Infinity))
            current = { id, title: text };
        }
      }
      setActive((prev) => (prev?.id === current?.id && prev?.title === current?.title ? prev : current));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  const section = active ? sections.find((s) => s.id === active.id) : undefined;
  const shownTitle = active?.title || title;
  const shown = active ? section?.progress : progress;
  const pct = shown && shown.total ? Math.round((shown.done / shown.total) * 100) : 0;

  return (
    <div
      ref={bar}
      className={`no-print sticky top-0 z-30 -mx-4 mb-2 flex min-h-14 items-center gap-3 bg-fog/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 ${
        stuck ? "border-b border-line shadow-[0_8px_20px_-16px_rgba(19,41,61,0.5)]" : ""
      }`}
    >
      <div className="min-w-0 flex-1" aria-live="off">
        <p className="truncate font-semibold leading-tight">{shownTitle}</p>
        {status ? (
          <p className="mt-0.5 truncate text-[0.85rem] font-semibold text-eucalyptus">{status}</p>
        ) : shown && shown.total > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <div
              className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-line sm:w-32"
              role="progressbar"
              aria-label={progressLabel(shownTitle)}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-eucalyptus transition-[width]" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[0.82rem] tabular-nums text-ink-soft">{countText(shown.done, shown.total)}</span>
          </div>
        )}
      </div>
      <div className="shrink-0">{actions}</div>
    </div>
  );
}
