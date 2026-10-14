import type { Lang } from "@/i18n/lang";

/**
 * Everyday things most homes already have. Ticking one pre-marks matching list items as "have".
 * Share links store these by position, so only ever add to the end.
 */
export const HAVE_PICKS: { key: string; label: string }[] = [
  { key: "flashlight", label: "Flashlight or headlamp" },
  { key: "batteries", label: "Spare batteries" },
  { key: "powerbank", label: "Phone power bank" },
  { key: "firstaid", label: "First aid kit" },
  { key: "water", label: "Bottled water or jugs" },
  { key: "food", label: "Canned or dry food" },
  { key: "canopener", label: "Manual can opener" },
  { key: "n95", label: "N95 masks" },
  { key: "backpack", label: "Backpack or duffel" },
  { key: "bin", label: "Plastic storage bin" },
  { key: "cash", label: "Cash in small bills" },
  { key: "radio", label: "Battery or crank radio" },
  { key: "whistle", label: "Whistle" },
];

/** Spanish labels, by key. A test checks there's one for every pick. */
export const HAVE_PICK_LABELS_ES: Record<string, string> = {
  flashlight: "Linterna o lámpara de cabeza",
  batteries: "Pilas de repuesto",
  powerbank: "Batería portátil para el celular",
  firstaid: "Botiquín de primeros auxilios",
  water: "Agua embotellada o en garrafones",
  food: "Comida enlatada o seca",
  canopener: "Abrelatas manual",
  n95: "Mascarillas N95",
  backpack: "Mochila o maleta de lona",
  bin: "Caja de plástico con tapa",
  cash: "Efectivo en billetes chicos",
  radio: "Radio de pilas o de manivela",
  whistle: "Silbato",
};

/** The picks in a language, same keys and order as HAVE_PICKS. */
export function havePicksFor(lang: Lang): { key: string; label: string }[] {
  return lang === "es" ? HAVE_PICKS.map((p) => ({ ...p, label: HAVE_PICK_LABELS_ES[p.key] ?? p.label })) : HAVE_PICKS;
}
