import type { StartWhen } from "./types";

function fmt(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`;
}

function escapeText(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/[,;]/g, (m) => `\\${m}`);
}

/** Next Saturday at 10am, or a later date for "weeks" / "month". */
export function firstStepDate(start: StartWhen | null, now = new Date()): Date {
  const d = new Date(now);
  d.setHours(10, 0, 0, 0);
  if (start === "weeks") d.setDate(d.getDate() + 10);
  else if (start === "month") d.setDate(d.getDate() + 21);
  else if (start === "unsure") d.setDate(d.getDate() + 7);
  const toSat = (6 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + (start === "weekend" || start === null ? toSat : 0));
  return d;
}

export interface CalendarEvent {
  /** For the .ics download. */
  filename: string;
  title: string;
  description: string;
  start: Date;
  minutes?: number;
  /** Makes it a repeating event, e.g. 6 for a twice-a-year check. */
  repeatMonths?: number;
}

const endOf = (e: CalendarEvent) => new Date(e.start.getTime() + (e.minutes ?? 60) * 60_000);
const rrule = (e: CalendarEvent) => (e.repeatMonths ? `RRULE:FREQ=MONTHLY;INTERVAL=${e.repeatMonths}` : null);

/**
 * Opens Google Calendar's "new event" page, filled in. Times have no time zone,
 * so Google uses the person's own, same as the .ics file.
 */
export function googleCalendarUrl(e: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${fmt(e.start)}/${fmt(endOf(e))}`,
    details: e.description,
  });
  const recur = rrule(e);
  if (recur) params.set("recur", recur);
  return `https://calendar.google.com/calendar/render?${params}`;
}

/** Downloads an .ics file, for Apple Calendar, Outlook, and most others. */
export function downloadIcs(e: CalendarEvent) {
  const recur = rrule(e);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bay Ready//EN",
    "BEGIN:VEVENT",
    `UID:${e.start.getTime()}-${Math.random().toString(36).slice(2)}@bayready`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(e.start)}`,
    `DTEND:${fmt(endOf(e))}`,
    ...(recur ? [recur] : []),
    `SUMMARY:${escapeText(e.title)}`,
    `DESCRIPTION:${escapeText(e.description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = e.filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
