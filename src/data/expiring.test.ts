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

  it("doesn't give kids rows for adults-only things", () => {
    const household = { ...EMPTY_ANSWERS.household, adults: 1, kids: 1 };
    const [, adult, kid] = sections({ build: "both", household, needs: ["meds", "vision-hearing"] });
    const rows = (s: typeof adult) => s.rows.map((r) => r.item);
    expect(rows(adult)).toEqual(expect.arrayContaining(["Phone power bank", "Prescription medicine"]));
    expect(rows(kid)).not.toContain("Phone power bank");
    expect(rows(kid)).not.toContain("Prescription medicine");
    expect(rows(kid).some((r) => r.startsWith("Contacts"))).toBe(false);
  });

  it("starts shared supplies with food, then places to add your own", () => {
    const rows = sections({ build: "both" })[0].rows.map((r) => r.item);
    expect(rows[0]).toBe("[Example] Canned beans");
    expect(rows.slice(6, 11)).toEqual(Array(5).fill("[Example] Add your food here"));
  });
});
