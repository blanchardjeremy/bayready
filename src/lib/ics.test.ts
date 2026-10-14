import { describe, expect, it } from "vitest";
import { firstStepDate, googleCalendarUrl, icsText, nextNthWeekday, nthWeekday, twiceYearlyChecks } from "./ics";

const day = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

describe("calendar links", () => {
  it("fills in Google Calendar's new-event page, repeating when asked", () => {
    const url = new URL(
      googleCalendarUrl({
        filename: "x.ics",
        title: "Emergency kit 6-month check",
        description: "Check dates",
        start: new Date(2027, 3, 10, 10, 0),
        minutes: 45,
        repeatMonths: 6,
      }),
    );
    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("action")).toBe("TEMPLATE");
    expect(url.searchParams.get("text")).toBe("Emergency kit 6-month check");
    expect(url.searchParams.get("dates")).toBe("20270410T100000/20270410T104500");
    expect(url.searchParams.get("recur")).toBe("RRULE:FREQ=MONTHLY;INTERVAL=6");
  });

  it("leaves out recur for a one-time event", () => {
    const url = new URL(googleCalendarUrl({ filename: "x.ics", title: "First steps", description: "", start: firstStepDate("weekend") }));
    expect(url.searchParams.has("recur")).toBe(false);
  });
});

describe("reminder dates", () => {
  it("finds the second Sunday of March", () => {
    expect(day(nthWeekday(2026, 2, 0, 2))).toBe("2026-3-8");
    expect(day(nthWeekday(2027, 2, 0, 2))).toBe("2027-3-14");
    // March 1, 2026 is itself a Sunday, so the first one counts.
    expect(day(nthWeekday(2026, 2, 0, 1))).toBe("2026-3-1");
    expect(day(nthWeekday(2030, 2, 0, 2))).toBe("2030-3-10");
  });

  it("finds the third Thursday of October (Great ShakeOut)", () => {
    expect(day(nthWeekday(2026, 9, 4, 3))).toBe("2026-10-15");
    expect(day(nthWeekday(2027, 9, 4, 3))).toBe("2027-10-21");
    expect(day(nthWeekday(2025, 9, 4, 3))).toBe("2025-10-16");
  });

  it("picks this year's date while it's still ahead, otherwise next year's", () => {
    const shakeOut = (now: Date) => day(nextNthWeekday(now, 9, 4, 3, 18));
    expect(shakeOut(new Date(2026, 9, 14, 12))).toBe("2026-10-15");
    // The morning of ShakeOut day still counts; the evening after the reminder doesn't.
    expect(shakeOut(new Date(2026, 9, 15, 9))).toBe("2026-10-15");
    expect(shakeOut(new Date(2026, 9, 15, 19))).toBe("2027-10-21");
    expect(day(nextNthWeekday(new Date(2026, 9, 14), 2, 0, 2, 10))).toBe("2027-3-14");
  });

  it("makes two yearly events that carry the list link", () => {
    const [spring, fall] = twiceYearlyChecks("https://x.test/list/#abc", "Made with Bay Ready", new Date(2026, 9, 14));
    expect(spring.rrule).toBe("FREQ=YEARLY;BYMONTH=3;BYDAY=2SU");
    expect(fall.rrule).toBe("FREQ=YEARLY;BYMONTH=10;BYDAY=3TH");
    expect(day(spring.start)).toBe("2027-3-14");
    expect(day(fall.start)).toBe("2026-10-15");
    for (const e of [spring, fall]) expect(e.description).toContain("Your list: https://x.test/list/#abc");

    const ics = icsText([spring, fall], new Date(2026, 9, 14));
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(2);
    expect(ics).toContain("RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU");
    expect(ics).toContain("RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=3TH");
    expect(ics).toContain("DTSTART:20261015T180000");

    const google = new URL(googleCalendarUrl(fall));
    expect(google.searchParams.get("recur")).toBe("RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=3TH");
  });
});
