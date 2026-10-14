import type { StartWhen } from "./types";
import type { Lang } from "@/i18n/lang";
import { messagesFor } from "@/i18n/messages";

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

/**
 * The nth weekday of a month, e.g. the 2nd Sunday of March. `month` is 0-based
 * like Date (2 = March); `weekday` is 0 for Sunday through 6 for Saturday.
 */
export function nthWeekday(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1).getDay();
  return new Date(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7);
}

/** The next time that nth weekday comes around at the given hour, today included if it's still ahead. */
export function nextNthWeekday(
  now: Date,
  month: number,
  weekday: number,
  n: number,
  hour: number,
  minute = 0,
): Date {
  for (const year of [now.getFullYear(), now.getFullYear() + 1]) {
    const d = nthWeekday(year, month, weekday, n);
    d.setHours(hour, minute, 0, 0);
    if (d > now) return d;
  }
  throw new Error("unreachable");
}

export interface CalendarEvent {
  /** For the .ics download. */
  filename: string;
  title: string;
  description: string;
  start: Date;
  minutes?: number;
  /** Makes it a repeating event, e.g. 6 for every 6 months. */
  repeatMonths?: number;
  /** A full repeat rule, e.g. "FREQ=YEARLY;BYMONTH=3;BYDAY=2SU". Wins over repeatMonths. */
  rrule?: string;
  /** Short name for a menu that offers more than one event, e.g. "spring check". */
  name?: string;
}

const endOf = (e: CalendarEvent) => new Date(e.start.getTime() + (e.minutes ?? 60) * 60_000);
const rrule = (e: CalendarEvent) =>
  e.rrule ? `RRULE:${e.rrule}` : e.repeatMonths ? `RRULE:FREQ=MONTHLY;INTERVAL=${e.repeatMonths}` : null;

/** The "first steps" reminder: the free steps to do, on the day picked in the wizard, in a language. */
export function firstStepsEvent(steps: string[], listUrl: string, start: Date, lang: Lang = "en"): CalendarEvent {
  const t = messagesFor(lang).list;
  return {
    filename: t.calendar.firstSteps.filename,
    title: t.calendar.firstSteps.title,
    description: `${steps.map((s) => `- ${s}`).join("\n")}\n\n${t.calendar.yourList(listUrl)}\n\n${t.credit}`,
    start,
  };
}

/**
 * Twice a year: when the clocks change in spring (2nd Sunday of March), and on
 * the Great ShakeOut (3rd Thursday of October), each repeating every year.
 */
export function twiceYearlyChecks(listUrl: string, lang: Lang = "en", now = new Date()): CalendarEvent[] {
  const t = messagesFor(lang).list;
  const { filename, spring, shakeOut } = t.calendar.checks;
  const link = `\n\n${t.calendar.yourList(listUrl)}\n\n${t.credit}`;
  return [
    {
      filename,
      name: spring.name,
      title: spring.title,
      description: spring.description + link,
      start: nextNthWeekday(now, 2, 0, 2, 10),
      minutes: 45,
      rrule: "FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
    },
    {
      filename,
      name: shakeOut.name,
      title: shakeOut.title,
      description: shakeOut.description + link,
      start: nextNthWeekday(now, 9, 4, 3, 18),
      minutes: 45,
      rrule: "FREQ=YEARLY;BYMONTH=10;BYDAY=3TH",
    },
  ];
}

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

/** The text of an .ics file holding one or more events. */
export function icsText(events: CalendarEvent[], stamp = new Date()): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bay Ready//EN",
    ...events.flatMap((e, i) => {
      const recur = rrule(e);
      return [
        "BEGIN:VEVENT",
        `UID:${e.start.getTime()}-${i}-${Math.random().toString(36).slice(2)}@bayready`,
        `DTSTAMP:${fmt(stamp)}`,
        `DTSTART:${fmt(e.start)}`,
        `DTEND:${fmt(endOf(e))}`,
        ...(recur ? [recur] : []),
        `SUMMARY:${escapeText(e.title)}`,
        `DESCRIPTION:${escapeText(e.description)}`,
        "END:VEVENT",
      ];
    }),
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Downloads an .ics file, for Apple Calendar, Outlook, and most others. Several events go in one file. */
export function downloadIcs(events: CalendarEvent[]) {
  const url = URL.createObjectURL(new Blob([icsText(events)], { type: "text/calendar;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = events[0].filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
