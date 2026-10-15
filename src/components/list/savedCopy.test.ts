import { describe, expect, it } from "vitest";
import { SAVE_TASK_KEY, changesSince, normalizeSaved } from "./savedCopy";

describe("save status", () => {
  const saved = { at: "2026-10-14T10:00:00.000Z", states: { "stay:water": "have" as const }, home: "{}" };

  it("counts nothing when nothing changed", () => {
    expect(changesSince(saved, { "stay:water": "have" }, "{}")).toBe(0);
  });

  it("counts each checkmark that changed, and Know your home once", () => {
    expect(changesSince(saved, { "stay:water": "need", "go:headlamp-go": "have" }, '{"notes":"x"}')).toBe(3);
  });

  it("ignores the save task itself", () => {
    expect(changesSince(saved, { "stay:water": "have", [SAVE_TASK_KEY]: "have" }, "{}")).toBe(0);
  });

  it("treats unset and need as the same", () => {
    expect(changesSince({ ...saved, states: { "stay:radio": "need" } }, {}, "{}")).toBe(0);
  });

  it("rejects junk from storage", () => {
    expect(normalizeSaved(null)).toBeNull();
    expect(normalizeSaved({ at: "not a date", home: "{}" })).toBeNull();
    expect(normalizeSaved({ ...saved, states: { a: "maybe" } })?.states).toEqual({});
  });
});
