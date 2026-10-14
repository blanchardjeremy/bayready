import { describe, expect, it } from "vitest";
import { BASE_HAZARDS, EMPTY_ANSWERS, defaultHazards, deriveContext, normalizeAnswers } from "./answers";

describe("ZIP code answer", () => {
  it("keeps only a five-digit string", () => {
    expect(normalizeAnswers({}).zip).toBeNull();
    expect(normalizeAnswers({ zip: "94501" }).zip).toBe("94501");
    expect(normalizeAnswers({ zip: "02134" }).zip).toBe("02134");
    for (const zip of ["9450", "945011", "94501-1234", " 94501", "abcde", 94501, null, ["94501"]]) {
      expect(normalizeAnswers({ zip }).zip, String(zip)).toBeNull();
    }
  });

  it("sets the water utility from the ZIP code when we know it", () => {
    const ctx = (a: Partial<typeof EMPTY_ANSWERS>) => deriveContext({ ...EMPTY_ANSWERS, ...a });
    // County alone: Alameda and Contra Costa count as EBMUD.
    expect(ctx({ county: "alameda" }).ebmud).toBe(true);
    expect(ctx({ county: "san-francisco" }).ebmud).toBe(false);
    // A known ZIP code wins over the county.
    expect(ctx({ county: "alameda", zip: "94536" }).ebmud).toBe(false); // Fremont
    expect(ctx({ county: "contra-costa", zip: "94520" }).ebmud).toBe(false); // Concord
    expect(ctx({ county: "contra-costa", zip: "94563" }).ebmud).toBe(true); // Orinda
    expect(ctx({ county: null, zip: "94501" }).ebmud).toBe(true); // Alameda
    // An unknown ZIP code changes nothing.
    expect(ctx({ county: "alameda", zip: "10001" }).ebmud).toBe(true);
  });

  it("pre-checks tsunami for a ZIP code with a mapped tsunami area", () => {
    expect(defaultHazards("alameda")).not.toContain("tsunami");
    expect(defaultHazards("alameda", "94501")).toContain("tsunami");
    expect(defaultHazards("alameda", "94705")).not.toContain("tsunami");
    expect(defaultHazards(null, "10001")).toEqual(BASE_HAZARDS);
  });
});
