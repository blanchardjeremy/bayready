import type { CountyId } from "@/lib/types";

/*
 * ZIP codes in the ten Bay Area counties, with the county, water utility, and
 * tsunami flags the wizard uses.
 */

export type BayCountyId = Exclude<CountyId, "other" | "private">;

export interface ZipInfo {
  zip: string;
  county: BayCountyId;
  /** EBMUD serves most of this ZIP code. */
  ebmud: boolean;
  /** Part of this ZIP code is in a mapped tsunami hazard area. */
  tsunami: boolean;
}

// Each ZIP code, then its flags: "e" = EBMUD serves most of it, "t" = part of it is
// in a mapped tsunami hazard area. Kept as text so the table stays small.
const ZIPS: Record<BayCountyId, string> = {
  alameda: "",
  "contra-costa": "",
  marin: "",
  napa: "",
  "san-francisco": "",
  "san-mateo": "",
  "santa-clara": "",
  "santa-cruz": "",
  solano: "",
  sonoma: "",
};

let table: Map<string, ZipInfo> | null = null;

/** Every ZIP code we know, parsed once on first use. */
export function allZips(): Map<string, ZipInfo> {
  if (!table) {
    table = new Map();
    for (const [county, list] of Object.entries(ZIPS) as [BayCountyId, string][]) {
      for (const entry of list.split(/\s+/).filter(Boolean)) {
        const zip = entry.slice(0, 5);
        const flags = entry.slice(5);
        table.set(zip, { zip, county, ebmud: flags.includes("e"), tsunami: flags.includes("t") });
      }
    }
  }
  return table;
}

/** What we know about a ZIP code, or null if it isn't one of ours. */
export function lookupZip(zip: string | null | undefined): ZipInfo | null {
  return zip ? (allZips().get(zip) ?? null) : null;
}

/** Raw entries, for the data tests. */
export const ZIP_SOURCE = ZIPS;
