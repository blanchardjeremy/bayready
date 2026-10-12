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

export function downloadIcs(filename: string, title: string, description: string, start: Date, minutes = 60) {
  const end = new Date(start.getTime() + minutes * 60_000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bay Ready//EN",
    "BEGIN:VEVENT",
    `UID:${start.getTime()}-${Math.random().toString(36).slice(2)}@bayready`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${escapeText(title)}`,
    `DESCRIPTION:${escapeText(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
