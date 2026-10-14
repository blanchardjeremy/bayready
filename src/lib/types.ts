import type { Lang } from "@/i18n/lang";
export type HazardId = "earthquake" | "outage" | "smoke" | "wildfire" | "heat" | "flood" | "tsunami" | "chemical";

export type CountyId =
  | "alameda"
  | "contra-costa"
  | "marin"
  | "napa"
  | "san-francisco"
  | "san-mateo"
  | "santa-clara"
  | "santa-cruz"
  | "solano"
  | "sonoma"
  | "other"
  | "private";

export type BuildChoice = "stay" | "go" | "both" | "unsure";
export type Level = "basics" | "advanced";

export type NeedId =
  | "meds"
  | "cold-meds"
  | "power-device"
  | "mobility"
  | "vision-hearing"
  | "diet"
  | "oxygen"
  | "communication"
  | "cognitive"
  | "caregiver"
  | "dialysis"
  | "pregnancy"
  | "service-animal";

export type HomeType = "house" | "apartment-low" | "apartment-high" | "other";
export type CarAccess = "yes" | "no" | "sometimes";
export type PowerGoal = "cook" | "charge" | "cold";
export type StartWhen = "weekend" | "weeks" | "month" | "unsure";
export type Budget = "0" | "50" | "150" | "more" | "unsure";

export interface Household {
  adults: number;
  kids: number;
  babies: number;
  dogs: number;
  cats: number;
  otherPets: number;
}

/** Optional names, by role, so changing the counts doesn't shuffle them. */
export interface Names {
  adults: string[];
  kids: string[];
}

export interface Answers {
  build: BuildChoice | null;
  county: CountyId | null;
  /** Optional 5-digit ZIP code. Refines the water utility and tsunami default. Never sent anywhere but a share link. */
  zip: string | null;
  hazards: HazardId[];
  household: Household;
  names: Names;
  /** null = skipped / not answered; [] = "none of these"; "private" = prefer not to say */
  needs: NeedId[] | "private" | null;
  /** ids of "already have" quick-pick items */
  have: string[];
  level: Level;
  start: StartWhen | null;
  budget: Budget | null;
  // Advanced-only
  home: HomeType | null;
  days: 7 | 14 | null;
  car: CarAccess | null;
  power: PowerGoal[];
}

/** Which physical kit an item goes in. "home" = a one-time task around the house, not a thing to pack. */
export type Container = "stay" | "go" | "car" | "home";

export type Category =
  | "kit"
  | "water"
  | "food"
  | "light-power"
  | "comms"
  | "first-aid"
  | "sanitation"
  | "docs-money"
  | "clothing-shelter"
  | "tools"
  | "air"
  | "baby-kids"
  | "pets"
  | "access"
  | "home-safety"
  | "comfort"
  | "plan"
  | "practice"
  | "community"
  | "signup";

export type Stage = "weekend" | "month" | "later";
export type Shop = "grocery" | "hardware" | "pharmacy" | "outdoor" | "free" | "online";

/** Facts about the household used to evaluate items. Derived from Answers. */
export interface Context {
  answers: Answers;
  /** The language to write quantities and other built text in. Item names and notes are swapped in by buildList. */
  lang: Lang;
  kits: Container[];
  hazards: Set<HazardId>;
  level: Level;
  people: number;
  names: Names;
  /** People who carry their own go bag: adults and kids. Babies' things ride in a grown-up's bag. */
  carriers: number;
  adults: number;
  kids: number;
  babies: number;
  dogs: number;
  cats: number;
  otherPets: number;
  pets: number;
  needs: Set<NeedId>;
  /** Picked "Prefer not to say" for health needs. Gets general health items instead of none. */
  needsPrivate: boolean;
  /** Served by EBMUD, which asks for 2 gallons per person per day. From the ZIP code when we know it, else the county. */
  ebmud: boolean;
  /** days of supplies for the stay-at-home bin */
  stayDays: number;
  /** days of supplies for the go bag */
  goDays: number;
  home: HomeType | null;
  car: CarAccess | null;
  power: Set<PowerGoal>;
}

export interface Quantity {
  /** Short display string, e.g. "21 gallons" */
  text: string;
  /** Optional purchase-unit hint, e.g. "about 4 × 5-gallon jugs" */
  buy?: string;
}

export interface Item {
  id: string;
  name: string;
  category: Category;
  containers: Container[];
  level: Level;
  /** Hazards this item is for. "all" = universal core item. */
  hazards: HazardId[] | "all";
  /** Extra condition beyond hazards/level/containers. */
  when?: (ctx: Context) => boolean;
  /** Promote an advanced item into basics for this household (e.g. CPAP battery). */
  promote?: (ctx: Context) => boolean;
  qty?: (ctx: Context, container: Container) => Quantity | null;
  why: string;
  tip?: string;
  /** Rough cost in USD for the whole household quantity, [low, high]. 0 = free. */
  cost?: (ctx: Context, container: Container) => [number, number];
  stage: Stage;
  shop: Shop;
  /** Optional link shown on the row, e.g. the county alert sign-up. */
  link?: (ctx: Context) => { label: string; url: string } | null;
  /** Example products or places to get it. Shown as examples, not endorsements. */
  examples?: { label: string; url: string }[];
  /**
   * When someone builds both kits, the go bag lives at home too, so the stay-at-home bin
   * doesn't need its own copy of this item.
   */
  coveredByGo?: boolean;
  /**
   * Stay-at-home bin items whose amount scales with days at home, so the spreadsheet
   * can recalculate them when someone changes the number of days.
   */
  scalesWithDays?: {
    /** Amount per day for the household, shown as a rounded-up count with this unit (e.g. gallons). */
    perDay?: (ctx: Context) => number;
    unit?: string;
    /** Singular form, used when the rounded-up count is 1 ("1 jar"). */
    unitOne?: string;
    /** Without perDay, the amount reads "7 days" plus this, e.g. " for 3". */
    suffix?: (ctx: Context) => string;
    /** Rough cost per day for the whole household, [low, high]. */
    costPerDay: (ctx: Context) => [number, number];
  };
  /**
   * Done per person rather than once for the household. In the go bag: every
   * bag gets one. For to-dos: every adult does it (their own phone, accounts, IDs).
   * "adults": only adults' and teens' bags get one (N95s and phone power banks
   * aren't for kids under 13).
   */
  perPerson?: boolean | "adults";
  /**
   * Rank among the free first-weekend steps for "Start here" (lower comes first).
   * Unranked steps follow in list order.
   */
  startRank?: number;
  /** id in the "what do you already have" quick-pick list */
  haveKey?: string;
}

export type ItemState = "need" | "have" | "skip";

export interface ListEntry {
  key: string; // `${container}:${item.id}`
  item: Item;
  container: Container;
  level: Level; // effective level after promotion
  qty: Quantity | null;
  cost: [number, number];
  hazardTags: HazardId[];
  /**
   * People this entry is tracked for separately (e.g. ["Me", "Adult 2", "Kid 1"]).
   * Empty when it's done once for the household.
   */
  slots: string[];
}
