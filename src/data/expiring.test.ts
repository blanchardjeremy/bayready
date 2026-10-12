import { describe, expect, it } from "vitest";
import { EMPTY_ANSWERS, STARTER_ANSWERS, deriveContext } from "@/lib/answers";
import type { Answers } from "@/lib/types";
import { expiringSections } from "./expiring";

const sections = (patch: Partial<Answers>) => expiringSections(deriveContext({ ...STARTER_ANSWERS, ...patch }));
const names = (patch: Partial<Answers>) => sections(patch).map((s) => s.name);

describe("expiringSections", () => {
  it("has only shared supplies without a go bag", () => {
    expect(names({ build: "stay" })).toEqual(["Everyone"]);
    // Power banks live at home then
    expect(sections({ build: "stay" })[0].rows.some((r) => r.item === "Phone power banks")).toBe(true);
  });

  it("calls a single go bag 'Your go bag'", () => {
    expect(names({ build: "both" })).toEqual(["Everyone", "Your go bag"]);
  });

  it("titles each person's section with their name", () => {
    const household = { ...EMPTY_ANSWERS.household, adults: 2, kids: 1 };
    expect(names({ build: "both", household, names: { adults: ["Alex"], kids: ["Riley"] } })).toEqual([
      "Everyone",
      "Alex",
      "Adult 2",
      "Riley",
    ]);
  });

  it("starts shared supplies with food", () => {
    expect(sections({ build: "both" })[0].rows[0].item).toBe("[Example] Canned beans");
  });
});
