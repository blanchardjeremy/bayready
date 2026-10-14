"use client";

import { downloadIcs, googleCalendarUrl, type CalendarEvent } from "@/lib/ics";
import type { buttonClass } from "./controls";
import { CalendarIcon } from "./icons";
import { MenuButton } from "./MenuButton";
import { useT } from "@/i18n/useLang";

/**
 * A button that opens a small menu: Google Calendar first (most people), then an
 * .ics file for Apple Calendar, Outlook, and the rest. Google can only add one
 * event at a time, so with several events it gets one menu item each, while the
 * .ics file holds them all.
 */
export function AddToCalendar({
  event,
  events = event ? [event] : [],
  label,
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
  const t = useT().list.calendar;
  return (
    <MenuButton
      label={label ?? t.add}
      icon={<CalendarIcon />}
      variant={variant}
      align={align}
      className={className}
      items={[
        ...events.map((ev) => ({
          key: `google-${ev.title}`,
          href: googleCalendarUrl(ev),
          label: (
            <>
              {t.google}
              {events.length > 1 && <span className="text-ink-soft">: {ev.name ?? ev.title}</span>}
            </>
          ),
        })),
        {
          key: "ics",
          onSelect: () => downloadIcs(events),
          label: (
            <>
              {t.ical} <span className="text-ink-soft">{events.length > 1 ? t.icalBoth : t.icalOne}</span>
            </>
          ),
        },
      ]}
    />
  );
}
