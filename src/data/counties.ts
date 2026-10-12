import type { CountyId, HazardId } from "@/lib/types";

export interface County {
  id: CountyId;
  name: string;
  alert: { name: string; url: string };
  /** Hazards pre-checked in addition to the base set (see research/supplies.md §2). */
  hazards: HazardId[];
  /** Has coastline or bay shoreline with mapped tsunami hazard areas. */
  tsunami: boolean;
  /** Served (mostly or partly) by EBMUD, which recommends 2 gallons per person per day. */
  ebmud?: boolean;
}

// Alert links checked 2026-10-11. Several counties redirect their short domains
// to pages on the county site; we link the landing page directly.
export const COUNTIES: County[] = [
  {
    id: "alameda",
    name: "Alameda",
    alert: { name: "AC Alert", url: "https://acalert.org" },
    hazards: ["heat"],
    tsunami: true,
    ebmud: true,
  },
  {
    id: "contra-costa",
    name: "Contra Costa",
    alert: { name: "Community Warning System", url: "https://cwsalerts.com" },
    hazards: ["heat", "wildfire", "chemical"],
    tsunami: true,
    ebmud: true,
  },
  {
    id: "marin",
    name: "Marin",
    alert: { name: "Alert Marin", url: "https://emergency.marincounty.gov/pages/alertmarin" },
    hazards: ["wildfire", "flood"],
    tsunami: true,
  },
  {
    id: "napa",
    name: "Napa",
    alert: { name: "Ready Napa County alerts", url: "https://www.readynapacounty.gov" },
    hazards: ["wildfire", "heat"],
    tsunami: false,
  },
  {
    id: "san-francisco",
    name: "San Francisco",
    alert: { name: "AlertSF", url: "https://www.alertsf.org" },
    hazards: [],
    tsunami: true,
  },
  {
    id: "san-mateo",
    name: "San Mateo",
    alert: { name: "SMC Alert", url: "https://www.smcgov.org/dem/smc-alert" },
    hazards: ["wildfire"],
    tsunami: true,
  },
  {
    id: "santa-clara",
    name: "Santa Clara",
    alert: { name: "AlertSCC", url: "https://oem.santaclaracounty.gov/sign-up-for-alerts" },
    hazards: ["heat"],
    tsunami: true,
  },
  {
    id: "santa-cruz",
    name: "Santa Cruz",
    alert: { name: "CruzAware", url: "https://cruzaware.org" },
    hazards: ["wildfire", "flood"],
    tsunami: true,
  },
  {
    id: "solano",
    name: "Solano",
    alert: { name: "Alert Solano", url: "https://www.solanocounty.gov/government/office-emergency-services" },
    hazards: ["heat", "wildfire", "chemical"],
    tsunami: true,
  },
  {
    id: "sonoma",
    name: "Sonoma",
    alert: { name: "SoCoAlert", url: "https://socoemergency.org" },
    hazards: ["wildfire", "flood", "heat"],
    tsunami: true,
  },
];

export const COUNTY_BY_ID = Object.fromEntries(COUNTIES.map((c) => [c.id, c])) as Partial<Record<CountyId, County>>;
