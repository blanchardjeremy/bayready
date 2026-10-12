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
  /** Free neighbor-response training (CERT, NERT). Falls back to FEMA's CERT page. */
  cert?: { label: string; url: string };
  /** A neighborhood organizing program. Falls back to Listos California's block party kit. */
  block?: { label: string; url: string };
}

// Alert, CERT, and neighborhood links checked 2026-10-11. Several counties redirect
// their short domains to pages on the county site; we link the landing page directly.
// Santa Clara and Solano have no countywide CERT program, so they use FEMA's CERT page.
export const COUNTIES: County[] = [
  {
    id: "alameda",
    name: "Alameda",
    alert: { name: "AC Alert", url: "https://acalert.org" },
    hazards: ["heat"],
    tsunami: true,
    ebmud: true,
    cert: { label: "CERT classes (Alameda County Fire)", url: "https://fire.acgov.org/emergency-preparedness" },
  },
  {
    id: "contra-costa",
    name: "Contra Costa",
    alert: { name: "Community Warning System", url: "https://cwsalerts.com" },
    hazards: ["heat", "wildfire", "chemical"],
    tsunami: true,
    ebmud: true,
    cert: { label: "CERT programs in Contra Costa", url: "https://www.cocosheriff.org/disaster-preparedness/links" },
  },
  {
    id: "marin",
    name: "Marin",
    alert: { name: "Alert Marin", url: "https://emergency.marincounty.gov/pages/alertmarin" },
    hazards: ["wildfire", "flood"],
    tsunami: true,
    cert: { label: "Ready Marin classes", url: "https://readymarin.marincounty.gov" },
    block: { label: "Ready Marin neighborhood groups", url: "https://readymarin.marincounty.gov" },
  },
  {
    id: "napa",
    name: "Napa",
    alert: { name: "Ready Napa County alerts", url: "https://www.readynapacounty.gov" },
    hazards: ["wildfire", "heat"],
    tsunami: false,
    cert: { label: "Napa Valley CERT", url: "https://www.napacounty.gov/362/Community-Emergency-Response-Team-CERT" },
  },
  {
    id: "san-francisco",
    name: "San Francisco",
    alert: { name: "AlertSF", url: "https://www.alertsf.org" },
    hazards: [],
    tsunami: true,
    cert: { label: "Sign up for NERT", url: "https://sf-fire.org/nert" },
    block: { label: "Map Your Neighborhood (SF NERT)", url: "https://sf-fire.org/nert/map-your-neighborhood" },
  },
  {
    id: "san-mateo",
    name: "San Mateo",
    alert: { name: "SMC Alert", url: "https://www.smcgov.org/dem/smc-alert" },
    hazards: ["wildfire"],
    tsunami: true,
    cert: { label: "Free Get Ready and CERT classes", url: "https://smcgov.org/ceo/emergency-training-options" },
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
    cert: { label: "Santa Cruz County CERT", url: "https://santacruzcountycert.org" },
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
    cert: { label: "Sonoma County CERT", url: "https://sonomacounty.gov/administrative-support-and-fiscal-services/emergency-management/programs/community-emergency-response-team" },
  },
];

export const COUNTY_BY_ID = Object.fromEntries(COUNTIES.map((c) => [c.id, c])) as Partial<Record<CountyId, County>>;
