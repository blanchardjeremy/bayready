import type { CountyId } from "@/lib/types";

/*
 * ZIP codes in the ten Bay Area counties, with the county, water utility, and
 * tsunami flags the wizard uses. Built in October 2026.
 *
 * These are ZIP-level approximations. Water districts and tsunami zones follow
 * streets and parcels, not ZIP codes, so the wizard always points people to
 * MyHazards to check their own address.
 *
 * - County: the 2020 Census ZCTA-to-county relationship file. A ZIP that spans
 *   counties goes to the one with the most land, except where nearly everyone
 *   lives in the other one (94303, 94515, 94708, 94952, 95033; noted below).
 *   ZIPs mostly outside these ten counties are left out (for example 95391
 *   Mountain House, 95023, 95219, 95377, 95612, 95616, 95618, 95690, 95694),
 *   as is 95025, whose county sources disagree on.
 *   https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt
 * - PO box and single-business ZIPs, which have no census shape: GeoNames US
 *   postal codes, cross-checked against zip-codes.com's county lists. They copy
 *   the flags of the ZIP holding their town's main post office. San Francisco's
 *   PO box ZIPs have neither flag.
 *   https://download.geonames.org/export/zip/US.zip, https://www.zip-codes.com/county/ca-alameda.asp
 * - EBMUD ("e"): most of the ZIP's populated area is inside EBMUD's service area
 *   in the State Water Board's water system boundary layer (self-reported in 2019,
 *   so it may lag annexations), checked against EBMUD's list of communities and
 *   the Contra Costa LAFCO review of CCWD. Partial ZIPs are noted below.
 *   https://gispublic.waterboards.ca.gov/portalserver/rest/services/Drinking_Water/California_Drinking_Water_System_Area_Boundaries/FeatureServer/0
 *   https://www.ebmud.com/about-us/who-we-are/service-area
 *   https://www.contracostalafco.org/municipal_service_reviews/central_county_water_wastewater/4.0%20CCWD%20Water%20Wastewater%20Final.pdf
 * - Tsunami ("t"): the California Geological Survey's statewide Tsunami Hazard
 *   Area layer, which covers the coast and the Bay shoreline, overlapping at least
 *   2 hectares or 2% of the ZIP's land (2020 Census ZCTA shapes, shoreline-clipped).
 *   In most flagged ZIPs only a shoreline strip is in the zone. Suisun Bay east of
 *   Martinez, Fairfield, and Suisun City aren't mapped, so they aren't flagged.
 *   https://services2.arcgis.com/zr3KAIbsRSUyARHG/arcgis/rest/services/CA_Tsunami_Hazard_Area/FeatureServer/0
 *   https://www.conservation.ca.gov/cgs/tsunami/maps
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
  // 94541: partial EBMUD: Cherryland/Fairview (unincorporated) are EBMUD; Hayward city addresses
  //   get Hayward municipal water (SFPUC supply)
  // 94542: partial EBMUD: Fairview is EBMUD; Hayward hills/CSUEB get Hayward municipal water
  // 94550: spans counties: Alameda 61% of land, Santa Clara 39% of land
  // 94551: spans counties: Alameda 63% of land, Contra Costa 37% of land
  // 94552: partial EBMUD: Five Canyons/Castro Valley side EBMUD; eastern rural parts not served
  // 94588: spans counties: Alameda 51% of land, Contra Costa 49% of land
  // 94611: spans counties: Alameda 95% of land, Contra Costa 5% of land
  // 94707: spans counties: Alameda 65% of land, Contra Costa 35% of land
  // 94708: county by population: Berkeley hills homes are in Alameda; the Contra Costa part is
  //   mostly Tilden Park/Kensington edge; spans counties: Contra Costa 58% of land, Alameda 42% of
  //   land
  alameda:
    "94501et 94502et 94536 94537 94538t 94539 94540 94541e 94542 94543 94544t 94545t 94546e 94550 " +
    "94551 94552e 94555t 94557 94560t 94566 94568 94577et 94578e 94579et 94580et 94586 94587t 94588 " +
    "94601et 94602e 94603et 94604et 94605e 94606et 94607et 94608et 94609e 94610e 94611e 94612et " +
    "94613e 94614et 94615et 94617et 94618e 94619e 94620e 94621et 94622et 94623et 94624et 94649et " +
    "94659et 94660et 94661et 94662et 94666et 94701e 94702e 94703e 94704e 94705e 94706et 94707e 94708e " +
    "94709e 94710et 94712e 94720e",
  // 94505: spans counties: Contra Costa 96% of land, Alameda 4% of land, San Joaquin 0% of land
  // 94506: EBMUD (Blackhawk/Danville); eastern rural parts outside
  // 94514: spans counties: Contra Costa 82% of land, Alameda 18% of land
  // 94516: uncertain: Canyon is inside EBMUD lands but homes may rely on private supply
  // 94523: partial EBMUD: mostly Contra Costa Water District (some City of Martinez); small part
  //   EBMUD
  // 94553: partial EBMUD: Martinez city water/CCWD; some outlying hill areas inside EBMUD
  //   boundary
  // 94572: EBMUD (Rodeo)
  // 94582: EBMUD (Dougherty Valley); sewer is DSRSD
  // 94596: mostly EBMUD; small Contra Costa Water District part
  // 94597: partial EBMUD: most of this Walnut Creek ZIP is EBMUD; northern edge is Contra Costa
  //   Water District
  // 94598: partial EBMUD: mostly Contra Costa Water District; small southwestern part EBMUD
  "contra-costa":
    "94505 94506e 94507e 94509 94511 94513 94514 94516 94517 94518 94519 94520 94521 94522 94523 " +
    "94524 94525et 94526e 94527 94528e 94529 94530et 94531 94547et 94548 94549e 94553t 94556e 94561 " +
    "94563e 94564et 94565 94569t 94570e 94572et 94575e 94582e 94583e 94595e 94596e 94597e 94598 " +
    "94801et 94802et 94803e 94804et 94805e 94806et 94807et 94808et 94820e 94850et",
  marin:
    "94901t 94903t 94904t 94912t 94913t 94914t 94915t 94920t 94924t 94925t 94929t 94930 94933 94937t " +
    "94938 94939t 94940t 94941t 94942t 94945t 94946 94947 94948 94949t 94950 94956t 94957 94960 94963 " +
    "94964t 94965t 94966t 94970t 94971t 94973 94974t 94976t 94977t 94978 94979 94998",
  // 94503: spans counties: Napa 66% of land, Solano 34% of land
  // 94515: county by population: Calistoga (Napa) holds the population; Sonoma part is rural;
  //   spans counties: Sonoma 51% of land, Napa 49% of land
  napa:
    "94503t 94508 94515 94558t 94559t 94562 94567 94573 94574 94576 94581t 94599",
  "san-francisco":
    "94102 94103 94104t 94105t 94107t 94108 94109t 94110 94111t 94112 94114 94115 94116t 94117 94118 " +
    "94119 94120 94121t 94122t 94123t 94124t 94125 94126 94127 94129t 94130t 94131 94132t 94133t " +
    "94134 94137 94139 94140 94141 94142 94143 94144 94145 94146 94147 94151 94158t 94159 94160 94161 " +
    "94163 94164 94172 94177 94188t",
  // 94028: spans counties: San Mateo 81% of land, Santa Clara 19% of land
  // 94303: county by population: most residents are in East Palo Alto (San Mateo); land area is
  //   larger in Palo Alto (Santa Clara); spans counties: Santa Clara 67% of land, San Mateo 33% of
  //   land
  "san-mateo":
    "94002t 94005t 94010t 94011t 94014 94015t 94016t 94017t 94018t 94019t 94020 94021 94025t 94026t " +
    "94027 94028 94030t 94037t 94038t 94044t 94060t 94061 94062 94063t 94064t 94065t 94066 94070t " +
    "94074t 94080t 94083t 94128t 94303t 94401t 94402 94403 94404t 94497",
  // 95033: county by population: USPS city Los Gatos (Santa Clara); Santa Cruz Mountains part is
  //   about half the land; spans counties: Santa Cruz 53% of land, Santa Clara 47% of land
  "santa-clara":
    "94022 94023 94024 94035t 94039 94040 94041 94042 94043t 94085 94086 94087 94088 94089t 94301 " +
    "94302 94304 94305 94306 94309 95002t 95008 95009 95011 95013 95014 95015 95020 95021 95026 95030 " +
    "95031 95032 95033 95035t 95036t 95037 95038 95042 95044 95046 95050 95051 95052 95053 95054t " +
    "95055 95056 95070 95071 95101 95103 95106 95108 95109 95110 95111 95112 95113 95115 95116 95117 " +
    "95118 95119 95120 95121 95122 95123 95124 95125 95126 95127 95128 95129 95130 95131 95132 95133 " +
    "95134t 95135 95136 95138 95139 95140 95141 95148 95150 95151 95152 95153 95154 95155 95156 95157 " +
    "95158 95159 95160 95161 95164 95170 95172 95173 95190 95191 95192 95193 95194 95196",
  // 95076: spans counties: Santa Cruz 74% of land, Monterey 23% of land, Santa Clara 3% of land
  "santa-cruz":
    "95001t 95003t 95005 95006 95007 95010t 95017t 95018 95019 95041 95060t 95061t 95062t 95063t " +
    "95064 95065 95066 95067 95073t 95076t 95077t",
  // 94571: spans counties: Solano 82% of land, Sacramento 18% of land
  // 94591: spans counties: Solano 97% of land, Napa 3% of land
  // 95620: spans counties: Solano 76% of land, Yolo 24% of land
  solano:
    "94510t 94512 94533 94534 94535 94571 94585 94589t 94590t 94591t 94592t 95620 95625 95687 95688 " +
    "95696",
  // 94952: county by population: Petaluma (Sonoma) holds the population; Marin part is rural;
  //   spans counties: Marin 52% of land, Sonoma 48% of land
  // 95425: spans counties: Sonoma 68% of land, Mendocino 32% of land
  // 95476: spans counties: Sonoma 98% of land, Napa 2% of land
  sonoma:
    "94922 94923t 94926 94927 94928 94931 94951 94952t 94953t 94954t 94955t 94972t 94975t 94999t " +
    "95401 95402 95403 95404 95405 95406 95407 95409 95412t 95416t 95419 95421t 95425 95430t 95431 " +
    "95433t 95436 95439 95441 95442 95444 95446t 95448 95450t 95452 95462t 95465t 95471 95472 95473 " +
    "95476t 95480 95486 95487t 95492 95497t",
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
