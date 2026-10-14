import { describe, expect, it } from "vitest";
import { firstStepDate, googleCalendarUrl } from "./ics";

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
