import type { Category, Container, Shop, Stage } from "@/lib/types";
import type { Lang } from "@/i18n/lang";
import { META_ES } from "@/i18n/es/meta";

export const CONTAINER_META: Record<Container, { name: string; purpose: string; where: string }> = {
  stay: {
    name: "Stay-at-home bin",
    purpose: "Think of it as camping at home: no power, no running water, stores closed, and help may be slow to reach you.",
    where: "Keep it somewhere you can reach after a quake: a closet near the door, not the back of the garage.",
  },
  go: {
    name: "Go bag",
    purpose: "Think of going to a friend's place or a shelter for a few days. One bag per person, ready to grab in minutes.",
    where: "Keep it by the door. You should be able to carry it comfortably, and don't pack anything you don't know how to use.",
  },
  car: {
    name: "Car kit",
    purpose: "For getting stuck on the road or leaving by car.",
    where: "Keep it in the trunk, out of sight. Keep your gas tank at least half full, and don't leave copies of IDs in the car in case of a break-in.",
  },
  home: {
    name: "Plans and to-dos",
    purpose: "One-time tasks and plans. Most are free and take under an hour.",
    where: "",
  },
};

export const CATEGORY_META: Record<Category, string> = {
  kit: "Something to keep it in",
  water: "Water",
  food: "Food",
  "light-power": "Light and power",
  comms: "Alerts and staying in touch",
  "first-aid": "First aid and medicine",
  sanitation: "Toilet and hygiene",
  "docs-money": "Documents and cash",
  "clothing-shelter": "Clothing and warmth",
  tools: "Tools",
  air: "Smoke and air",
  "baby-kids": "Babies and kids",
  pets: "Pets",
  access: "Health and access needs",
  "home-safety": "Make your home safer",
  comfort: "Comfort and calm",
  plan: "Make a plan",
  practice: "Practice",
  community: "Neighbors and community",
  signup: "Sign-ups and paperwork",
};

export const CATEGORY_ORDER: Category[] = [
  "plan",
  "practice",
  "community",
  "signup",
  "home-safety",
  // Supplies, in the order people pack: the bin or bag itself, then water,
  // food, and medicine, then hygiene, then light and power, then the rest.
  "kit",
  "water",
  "food",
  "first-aid",
  "access",
  "sanitation",
  "light-power",
  "comms",
  "air",
  "clothing-shelter",
  "tools",
  "docs-money",
  "comfort",
  "baby-kids",
  "pets",
];

export const SHOP_META: Record<Shop, string> = {
  free: "Gather or make at home",
  grocery: "Grocery store",
  pharmacy: "Pharmacy",
  hardware: "Hardware store",
  outdoor: "Outdoor or camping store",
  online: "Online or big-box store",
};
export const SHOP_ORDER: Shop[] = ["free", "grocery", "pharmacy", "hardware", "outdoor", "online"];

export const STAGE_META: Record<Stage, { name: string; desc: string }> = {
  weekend: { name: "This weekend", desc: "Free quick wins. Most take 5 to 15 minutes each." },
  month: { name: "This month", desc: "Gather what you have, pack it up, and make a shopping trip or two." },
  later: { name: "Later", desc: "Extra days, backups, and gear for when you're ready." },
};

const META_EN = { container: CONTAINER_META, category: CATEGORY_META, shop: SHOP_META, stage: STAGE_META };

/** Labels for kits, categories, stores, and stages in a language. The constants above are the English ones. */
export function metaFor(lang: Lang): typeof META_EN {
  return lang === "es" ? META_ES : META_EN;
}
