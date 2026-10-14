/**
 * Permanent share-link numbers for items: an item's number is its position here.
 *
 * Append only. New items go at the end. Never remove or reorder entries, even
 * for items that no longer exist, or old share links will point at the wrong
 * things. A test checks that every item in ITEMS is listed.
 */
export const SHARE_IDS: readonly string[] = [
  "alerts", "contact", "neighbor", "doc-photos", "evac-zone", "pge-alerts", "medical-baseline", "ddar",
  "support-network", "shoes-bed", "shutoffs", "smoke-alarms", "clean-room", "cool-place", "garage-door",
  "drains", "defensible", "pet-tags", "secure-furniture", "extinguisher", "water-heater", "retrofit",
  "insurance", "home-inventory", "soft-story", "ember-vents", "work-kit", "freezer-water", "drop-cover",
  "ok-help-sign", "fridge-thermo", "red-flag", "half-tank", "routes", "tsunami-route", "landslide",
  "shelter-steps", "school-plan", "high-rise", "training", "block", "offer-ride", "bin", "water",
  "water-ebmud", "bleach", "water-storage", "water-filter", "dropper", "food", "food-fruit-veg",
  "food-grains", "food-nut-butter", "food-snacks", "special-diet", "can-opener", "dishes", "cups",
  "utensils", "stove", "stove-fuel", "lighter", "cooler", "ice-packs", "cold-med-pouch", "flashlights",
  "lantern", "batteries", "powerbank", "cable", "power-station", "solar", "radio", "contacts-paper",
  "first-aid", "otc", "rx", "med-info", "glasses", "device-power", "mobility-kit", "hygiene-stay", "soap",
  "sanitizer", "wipes", "menstrual", "toilet", "toilet-bags", "toilet-litter", "gloves", "duct-tape", "tarp",
  "blankets", "crowbar", "n95", "box-fan-filter", "air-purifier", "cooling", "cooling-towels", "cash-stay",
  "helmet", "plastic-sheeting", "bleed-kit", "phone-setup", "effak", "calm-kit", "earplugs", "eye-mask",
  "cards", "deck-of-cards", "activities", "splint", "liquid-bandage", "formula", "baby-food", "feeding",
  "diapers", "baby-wipes", "carrier", "kid-meds", "comfort", "pet-food", "pet-carry", "pet-bowl",
  "pet-records", "litter", "litter-box", "backpack", "water-go", "purify-go", "food-go", "headlamp-go",
  "whistle", "cash-go", "docs-copies", "clothes-go", "hygiene-go", "map", "multitool", "cord", "zip-bags",
  "goggles", "radio-go", "bivvy", "car-water", "car-snacks", "car-basics", "car-blanket", "car-charger",
  "car-first-aid", "car-shoes", "car-jumper", "road-flares", "car-n95",
  "oxygen-safety", "evac-help", "diabetes-go", "oxygen-backup", "device-go",
  "tetanus", "first-aid-class", "group-text", "wallet-cards", "practice-text", "practice-meet",
  "practice-leave", "practice-fire", "kids-ready",
];
