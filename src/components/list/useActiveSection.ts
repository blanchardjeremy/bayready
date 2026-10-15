"use client";

import { useEffect, useState } from "react";

/**
 * Which of these headings are on the page, and which section you're reading:
 * the last heading that has scrolled into the top third of the screen. Sections
 * come and go when the view changes, so it rechecks when the page changes too.
 */
export function useActiveSection(ids: string[]): { active: string | null; present: string[] } {
  const [active, setActive] = useState<string | null>(null);
  const [present, setPresent] = useState<string[]>([]);
  const key = ids.join(",");

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const onPage = key.split(",").filter((id) => {
        const el = document.getElementById(id);
        return !!el && el.offsetParent !== null;
      });
      setPresent((prev) => (prev.join(",") === onPage.join(",") ? prev : onPage));
      const line = window.innerHeight / 3;
      let current: string | null = null;
      let best = -Infinity;
      for (const id of onPage) {
        const top = document.getElementById(id)!.getBoundingClientRect().top;
        if (top <= line && top > best) {
          best = top;
          current = id;
        }
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const watch = new MutationObserver(schedule);
    watch.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      watch.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  return { active, present };
}

/** Scrolls a heading to the top of the screen, and moves focus there if it can take it. */
export function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: smooth ? "smooth" : "auto" });
  if (el.hasAttribute("tabindex")) el.focus({ preventScroll: true });
}
