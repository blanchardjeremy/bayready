import { describe, expect, it } from "vitest";
import { COUNTIES } from "./counties";
import { ZIP_SOURCE, allZips, lookupZip } from "./zips";

const entries = Object.values(ZIP_SOURCE).flatMap((list) => list.split(/\s+/).filter(Boolean));

describe("ZIP code table", () => {
  it("has well-formed entries: five digits, then only known flags", () => {
    const bad = entries.filter((e) => !/^\d{5}[et]*$/.test(e));
    expect(bad).toEqual([]);
  });

  it("lists each ZIP code once", () => {
    const zips = entries.map((e) => e.slice(0, 5));
    const dupes = zips.filter((z, i) => zips.indexOf(z) !== i);
    expect(dupes).toEqual([]);
    expect(allZips().size).toBe(zips.length);
  });

  it("covers every county, and only Bay Area ZIP codes", () => {
    for (const c of COUNTIES) {
      expect(ZIP_SOURCE[c.id as keyof typeof ZIP_SOURCE].trim().length, c.name).toBeGreaterThan(0);
    }
    for (const zip of allZips().keys()) expect(zip.startsWith("94") || zip.startsWith("95"), zip).toBe(true);
  });

  it("only flags EBMUD in Alameda and Contra Costa", () => {
    const elsewhere = [...allZips().values()].filter((z) => z.ebmud && z.county !== "alameda" && z.county !== "contra-costa");
    expect(elsewhere).toEqual([]);
  });

  it("doesn't flag tsunami far from the water", () => {
    for (const zip of ["94574", "94588", "95008", "94513", "95404"]) expect(lookupZip(zip)?.tsunami, zip).toBe(false);
  });

  it("knows some well-known places", () => {
    expect(lookupZip("94501")).toMatchObject({ county: "alameda", ebmud: true, tsunami: true }); // Alameda
    expect(lookupZip("94705")).toMatchObject({ county: "alameda", ebmud: true, tsunami: false }); // Berkeley hills
    expect(lookupZip("94536")).toMatchObject({ county: "alameda", ebmud: false }); // Fremont
    expect(lookupZip("94520")).toMatchObject({ county: "contra-costa", ebmud: false }); // Concord
    expect(lookupZip("94563")).toMatchObject({ county: "contra-costa", ebmud: true, tsunami: false }); // Orinda
    expect(lookupZip("94123")).toMatchObject({ county: "san-francisco", tsunami: true }); // Marina
    expect(lookupZip("94558")).toMatchObject({ county: "napa", tsunami: true }); // Napa River shoreline
    expect(lookupZip("94952")).toMatchObject({ county: "sonoma" }); // Petaluma, though most of its land is in Marin
    expect(lookupZip("95060")).toMatchObject({ county: "santa-cruz", tsunami: true });
  });

  it("returns null for anything else", () => {
    expect(lookupZip("10001")).toBeNull();
    expect(lookupZip("")).toBeNull();
    expect(lookupZip(null)).toBeNull();
    expect(lookupZip("9450")).toBeNull();
  });
});
