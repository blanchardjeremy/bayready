"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface BarSection {
  /** The id of the section's heading, which the tab jumps to. */
  id: string;
  label: string;
  progress?: { done: number; total: number };
}

/**
 * Stays at the top of the list page as you scroll: a row of tabs, one per
 * section, so the whole page is always in view. The tab for the section on
 * screen is highlighted, each shows how far along that section is (a check
 * when it's done), and tapping one jumps there. On the right: whatever actions
 * are passed in (the Save / share menu). Sections whose heading isn't on the
 * page are skipped.
 */
export function StickyBar({
  sections,
  navLabel,
  countLabel,
  status,
  actions,
}: {
  sections: BarSection[];
  /** Names the row of tabs for screen readers, like "Sections". */
  navLabel: string;
  /** Read aloud with each tab's count, like "4 of 14 done". */
  countLabel: (done: number, total: number) => string;
  /** A short message after an action, like "Link copied", shown under the bar for a moment. */
  status?: string | null;
  actions: ReactNode;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [present, setPresent] = useState<string[]>([]);
  const [stuck, setStuck] = useState(false);
  const ids = sections.map((s) => s.id).join(",");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const height = bar.current?.offsetHeight ?? 0;
      setStuck(window.scrollY > (bar.current?.offsetTop ?? 0));
      const onPage = ids.split(",").filter((id) => {
        const el = document.getElementById(id);
        return !!el && el.offsetParent !== null;
      });
      setPresent((prev) => (prev.join(",") === onPage.join(",") ? prev : onPage));
      // The last section whose heading has scrolled up to just under the bar.
      let current: string | null = null;
      let best = -Infinity;
      for (const id of onPage) {
        const top = document.getElementById(id)!.getBoundingClientRect().top;
        if (top <= height + 24 && top > best) {
          best = top;
          current = id;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Sections come and go when the view changes (by kit, shopping list, step by step).
    const watch = new MutationObserver(onScroll);
    watch.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      watch.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  // Keep the current tab in view when the row scrolls sideways on a phone.
  useEffect(() => {
    const list = scroller.current;
    const tab = active ? list?.querySelector<HTMLElement>(`[data-section="${active}"]`) : null;
    if (!list || !tab) return;
    const left = tab.offsetLeft - list.offsetLeft;
    if (left < list.scrollLeft || left + tab.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollTo({ left: Math.max(0, left - 16), behavior: "smooth" });
    }
  }, [active]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const height = bar.current?.offsetHeight ?? 0;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - height - 12, behavior: smooth ? "smooth" : "auto" });
    // Move keyboard and screen reader focus there too, for headings that can take it.
    if (el.hasAttribute("tabindex")) el.focus({ preventScroll: true });
  };

  const shown = sections.filter((s) => present.includes(s.id));

  return (
    <div
      ref={bar}
      className={`no-print sticky top-0 z-30 -mx-4 mb-2 bg-fog/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 ${
        stuck ? "border-b border-line shadow-[0_8px_20px_-16px_rgba(19,41,61,0.5)]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <nav aria-label={navLabel} className="min-w-0 flex-1">
          <ul ref={scroller} className="-my-1 flex gap-1.5 overflow-x-auto py-1 [scrollbar-width:none]">
            {shown.map((s) => {
              const isActive = s.id === active;
              const done = !!s.progress && s.progress.total > 0 && s.progress.done === s.progress.total;
              return (
                <li key={s.id} data-section={s.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => jump(s.id)}
                    aria-current={isActive ? "location" : undefined}
                    className={`inline-flex min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[0.88rem] font-semibold transition-colors ${
                      isActive
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-paper text-ink hover:border-ink"
                    }`}
                  >
                    {done && (
                      <svg
                        viewBox="0 0 16 16"
                        className={`size-3.5 ${isActive ? "text-paper" : "text-eucalyptus"}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="M3 8.5 6.5 12 13 4.5" />
                      </svg>
                    )}
                    {s.label}
                    {s.progress && s.progress.total > 0 && !done && (
                      <span className={`font-normal tabular-nums ${isActive ? "text-paper/80" : "text-ink-soft"}`}>
                        <span aria-hidden="true">
                          {s.progress.done}/{s.progress.total}
                        </span>
                        <span className="sr-only">, {countLabel(s.progress.done, s.progress.total)}</span>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="shrink-0">{actions}</div>
      </div>
      {/* Always on the page, so screen readers announce the message when it appears. */}
      <p role="status" className="pointer-events-none absolute right-4 top-full mt-1 sm:right-6">
        {status && (
          <span className="block rounded-md bg-eucalyptus px-3 py-1.5 text-[0.88rem] font-semibold text-paper">{status}</span>
        )}
      </p>
    </div>
  );
}
