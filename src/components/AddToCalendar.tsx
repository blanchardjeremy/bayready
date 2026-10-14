"use client";

import { useEffect, useId, useRef, useState } from "react";
import { downloadIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/ics";
import { buttonClass } from "./controls";
import { CalendarIcon } from "./icons";

/**
 * A button that opens a small menu: Google Calendar first (most people), then an
 * .ics file for Apple Calendar, Outlook, and the rest. Google can only add one
 * event at a time, so with several events it gets one menu item each, while the
 * .ics file holds them all.
 */
export function AddToCalendar({
  event,
  events = event ? [event] : [],
  label = "Add to calendar",
  variant = "secondary",
  align = "right",
  className = "",
}: {
  event?: CalendarEvent;
  events?: CalendarEvent[];
  label?: string;
  variant?: keyof typeof buttonClass;
  /** Which edge of the button the menu lines up with. Use "left" when the button sits at the left of the page. */
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    items.current[0]?.focus();
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = items.current.indexOf(document.activeElement as HTMLAnchorElement | HTMLButtonElement);
    if (e.key === "Escape") close();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const n = items.current.length;
      items.current[(i + (e.key === "ArrowDown" ? 1 : n - 1)) % n]?.focus();
    }
  };

  const item = "block w-full px-4 py-2.5 text-left text-[0.95rem] text-ink hover:bg-fog focus:bg-fog focus:outline-none";
  return (
    <div ref={wrap} className={`relative ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((o) => !o)}
        className={buttonClass[variant]}
      >
        <CalendarIcon />
        {label}
        <svg viewBox="0 0 16 16" className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          className={`absolute ${align === "left" ? "left-0" : "right-0"} z-20 mt-1.5 min-w-56 overflow-hidden rounded-lg border border-line bg-paper py-1 shadow-[0_12px_32px_-12px_rgba(19,41,61,0.35)]`}
        >
          {events.map((ev, i) => (
            <a
              key={ev.title}
              ref={(el) => {
                items.current[i] = el;
              }}
              role="menuitem"
              href={googleCalendarUrl(ev)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className={item}
            >
              Google Calendar
              {events.length > 1 && <span className="text-ink-soft">: {ev.name ?? ev.title}</span>}
            </a>
          ))}
          <button
            ref={(el) => {
              items.current[events.length] = el;
            }}
            role="menuitem"
            type="button"
            onClick={() => {
              downloadIcs(events);
              close();
            }}
            className={item}
          >
            iCal file <span className="text-ink-soft">({events.length > 1 ? "both, for Apple or Outlook" : "Apple, Outlook"})</span>
          </button>
        </div>
      )}
    </div>
  );
}
