import { peopleNames } from "@/lib/answers";
import type { Context } from "@/lib/types";

/**
 * Starter rows for the spreadsheet's Expiration dates tab: things in a kit
 * that expire, go stale, or need a regular check. Grouped by whose they are:
 * one section for shared supplies, then one per person for their own go bag.
 * "every" is a default in months people can change; leave it out when the
 * date printed on the package is what matters.
 */
export interface ExpiringRow {
  item: string;
  kit: "Stay-at-home bin" | "Go bag" | "Car kit" | "Around the house";
  every?: number;
  note: string;
}

export interface ExpiringSection {
  name: string;
  desc: string;
  rows: ExpiringRow[];
  /** Empty rows to leave for people's own entries. */
  blanks: number;
}

export function expiringSections(ctx: Context): ExpiringSection[] {
  const go = ctx.kits.includes("go");
  const car = ctx.kits.includes("car");
  const kids = ctx.kids + ctx.babies > 0;
  const when = <T,>(cond: boolean, rows: T[]) => (cond ? rows : []);

  // Shared supplies, food first because it needs replacing most often.
  const everyone: ExpiringRow[] = [
    { item: "[Example] Canned beans", kit: "Stay-at-home bin", every: 24, note: "Most canned food lasts 2 to 5 years. The date on the can wins." },
    { item: "[Example] Canned tuna or chicken", kit: "Stay-at-home bin", every: 24, note: "Pull-tab cans save needing an opener." },
    { item: "[Example] Peanut butter", kit: "Stay-at-home bin", every: 12, note: "" },
    { item: "[Example] Crackers", kit: "Stay-at-home bin", every: 6, note: "Go stale fast once opened." },
    { item: "[Example] Cereal or granola", kit: "Stay-at-home bin", every: 6, note: "" },
    { item: "[Example] Dried fruit and nuts", kit: "Stay-at-home bin", every: 6, note: "Nuts go rancid in heat." },
    // Placeholder rows so there's an obvious spot to write down your own food.
    ...Array.from({ length: 5 }, () => ({ item: "[Example] Add your food here", kit: "Stay-at-home bin" as const, note: "" })),
    ...when(ctx.babies > 0, [{ item: "Formula and baby food", kit: "Stay-at-home bin" as const, note: "Use the date on the package." }]),
    ...when(ctx.pets > 0, [{ item: "Pet food", kit: "Stay-at-home bin" as const, every: 6, note: "Dry food goes stale once the bag is open." }]),
    ...when(car, [{ item: "Snacks in the car", kit: "Car kit" as const, every: 6, note: "Car heat shortens shelf life." }]),

    { item: "Water you bottled from the tap", kit: "Stay-at-home bin", every: 6, note: "Tap water needs no treatment if you swap it every 6 months." },
    { item: "Store-bought bottled water", kit: "Stay-at-home bin", every: 24, note: "Use the date on the case, usually about 2 years." },
    ...when(car, [{ item: "Water in the car", kit: "Car kit" as const, every: 6, note: "Heat breaks down plastic bottles." }]),
    ...when(go, [{ item: "Water purification tablets", kit: "Go bag" as const, note: "Use the date on the package." }]),
    { item: "Unscented bleach", kit: "Stay-at-home bin", every: 12, note: "Loses strength after about a year." },

    { item: "Everyday medicines", kit: "Stay-at-home bin", note: "Pain, allergy, and stomach medicine. Use the dates on the packages." },
    ...when(kids, [{ item: "Kids' fever medicine", kit: "Stay-at-home bin" as const, note: "Check the dose for their current weight too." }]),
    { item: "First aid kit", kit: "Stay-at-home bin", every: 12, note: "Ointments and wipes dry out. Restock what you've used." },
    ...when(go, [{ item: "Go bag first aid kit", kit: "Go bag" as const, every: 12, note: "" }]),
    ...when(ctx.pets > 0, [{ item: "Pet medicine", kit: "Go bag" as const, note: "Use the date on the package." }]),
    { item: "Hand sanitizer", kit: "Stay-at-home bin", note: "Use the date on the bottle." },

    { item: "Spare batteries", kit: "Stay-at-home bin", every: 12, note: "Check the dates. Store them outside the devices." },
    { item: "Flashlights and radio", kit: "Stay-at-home bin", every: 6, note: "Test them and swap in fresh batteries if they're weak." },
    ...when(!go, [{ item: "Phone power banks", kit: "Stay-at-home bin" as const, every: 3, note: "Recharge every few months. They slowly drain." }]),
    ...when(ctx.power.has("charge") || ctx.needs.has("power-device"), [
      { item: "Portable power station", kit: "Stay-at-home bin" as const, every: 3, note: "Recharge every 3 months." },
    ]),
    ...when(ctx.needs.has("power-device"), [
      { item: "Medical device backup battery", kit: "Stay-at-home bin" as const, every: 3, note: "Charge it and test it with the device." },
    ]),

    { item: "N95 masks", kit: "Stay-at-home bin", note: "Use the date on the box. The straps weaken over time." },
    { item: "Smoke and carbon monoxide alarms", kit: "Around the house", every: 12, note: "Press test. Most newer alarms have sealed batteries: replace smoke alarms at 10 years, and CO alarms by the date on the back, usually 7 to 10 years." },
    { item: "Household plan and phone numbers", kit: "Around the house", every: 12, note: "Go over it together. A good time is the Great ShakeOut drill, the third Thursday in October." },
    { item: "Fire extinguisher", kit: "Around the house", every: 12, note: "Check the gauge is in the green." },
    ...when(ctx.babies > 0, [{ item: "Diapers and baby clothes", kit: "Go bag" as const, every: 6, note: "Check the sizes." }]),
    ...when(car, [{ item: "Car kit", kit: "Car kit" as const, every: 6, note: "Heat is hard on everything in a car." }]),
  ];

  const sections: ExpiringSection[] = [
    { name: "Everyone", desc: "Shared supplies, mostly in the stay-at-home bin. Food is first because it needs replacing most often", rows: everyone, blanks: 8 },
  ];
  if (!go) return sections;

  // Each person's own go bag.
  const names = peopleNames(ctx).slice(0, ctx.carriers);
  names.forEach((name, i) => {
    const isKid = i >= ctx.adults;
    sections.push({
      name: names.length > 1 ? name : "Your go bag",
      desc: names.length === 1 ? "Things in your go bag that expire or need a check" : name === "Me" ? "Your go bag" : `${name}'s go bag`,
      blanks: 2,
      rows: [
        { item: "Go bag food", kit: "Go bag", every: 12, note: "Bars or ration packs. Eat them and replace them before they go stale." },
        { item: "Go bag water", kit: "Go bag", every: 6, note: "" },
        { item: "Phone power bank", kit: "Go bag", every: 3, note: "Recharge every few months. They slowly drain." },
        { item: "Phone numbers and ID copies", kit: "Go bag", every: 12, note: "Update numbers, IDs, and insurance." },
        ...when(ctx.needs.has("meds"), [
          { item: "Prescription medicine", kit: "Go bag" as const, every: 6, note: "Rotate the backup into daily use so it never expires. Skip if none." },
        ]),
        ...when(ctx.needs.has("vision-hearing"), [
          { item: "Contacts, solution, or hearing aid batteries", kit: "Go bag" as const, note: "Use the date on the package. Skip if none." },
        ]),
        isKid
          ? { item: "Clothes and shoes", kit: "Go bag", every: 6, note: "Check they still fit." }
          : { item: "Change of clothes", kit: "Go bag", every: 12, note: "Swap for the season." },
      ],
    });
  });
  return sections;
}
