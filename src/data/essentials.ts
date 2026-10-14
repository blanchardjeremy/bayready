import type { ListEntry } from "@/lib/types";

/**
 * The essentials: the short list someone starting from scratch should buy and
 * put away first. The list page leads with these, and the short PDF prints
 * just these. Everything else on the list is for going further.
 *
 * Keys are `container:id`. Some only appear for some households (formula,
 * pet food, medical backups); the rest are on nearly every list.
 */
export const ESSENTIAL_KEYS = new Set([
  // Stay-at-home bin
  "stay:bin",
  "stay:water",
  "stay:food",
  "stay:can-opener",
  "stay:toilet",
  "stay:toilet-bags",
  "stay:flashlights",
  "stay:radio",
  "stay:first-aid",
  "stay:rx",
  "stay:formula",
  "stay:pet-food",
  "stay:device-power",
  "stay:oxygen-backup",
  // Go bag
  "go:backpack",
  "go:water-go",
  "go:food-go",
  "go:headlamp-go",
  "go:rx",
  "go:cash-go",
  "go:docs-copies",
  "go:device-go",
  "go:formula",
  "go:pet-food",
]);

export const isEssential = (e: ListEntry) => ESSENTIAL_KEYS.has(e.key);
