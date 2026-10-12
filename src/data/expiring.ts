import type { Context } from "@/lib/types";

/**
 * Starter rows for the spreadsheet's Expiration dates tab: things in a kit
 * that expire, go stale, or need a regular check. "every" is a default in
 * months that people can change; leave it out when the date printed on the
 * package is what matters.
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

  return [
    {
      name: "Food",
      desc: "Examples to get you started. Change them to what you actually have",
      blanks: 10,
      rows: [
        { item: "Canned beans", kit: "Stay-at-home bin", every: 24, note: "Most canned food lasts 2 to 5 years. The date on the can wins." },
        { item: "Canned tuna or chicken", kit: "Stay-at-home bin", every: 24, note: "Pull-tab cans save needing an opener." },
        { item: "Peanut butter", kit: "Stay-at-home bin", every: 12, note: "" },
        { item: "Crackers", kit: "Stay-at-home bin", every: 6, note: "Go stale fast once opened." },
        { item: "Cereal or granola", kit: "Stay-at-home bin", every: 6, note: "" },
        { item: "Dried fruit and nuts", kit: "Stay-at-home bin", every: 6, note: "Nuts go rancid in heat." },
        ...when(go, [
          { item: "Protein or energy bars", kit: "Go bag" as const, every: 12, note: "Pick ones you like. You'll actually eat them." },
          { item: "Emergency ration bars", kit: "Go bag" as const, every: 60, note: "Usually good for 5 years." },
        ]),
        ...when(ctx.babies > 0, [
          { item: "Formula and baby food", kit: "Stay-at-home bin" as const, note: "Use the date on the package." },
        ]),
        ...when(ctx.pets > 0, [
          { item: "Pet food", kit: "Stay-at-home bin" as const, every: 6, note: "Dry food goes stale once the bag is open." },
        ]),
        ...when(car, [
          { item: "Snacks in the car", kit: "Car kit" as const, every: 6, note: "Car heat shortens shelf life." },
        ]),
      ],
    },
    {
      name: "Water",
      desc: "Stored water goes flat and plastic breaks down, so swap it on a schedule",
      blanks: 2,
      rows: [
        { item: "Water you bottled from the tap", kit: "Stay-at-home bin", every: 6, note: "Tap water needs no treatment if you swap it every 6 months." },
        { item: "Store-bought bottled water", kit: "Stay-at-home bin", every: 24, note: "Use the date on the case, usually about 2 years." },
        ...when(go, [{ item: "Go bag water bottles", kit: "Go bag" as const, every: 6, note: "" }]),
        ...when(car, [{ item: "Water in the car", kit: "Car kit" as const, every: 6, note: "Heat breaks down plastic bottles." }]),
        ...when(go, [
          { item: "Water purification tablets", kit: "Go bag" as const, note: "Use the date on the package." },
        ]),
        { item: "Unscented bleach", kit: "Stay-at-home bin", every: 12, note: "Loses strength after about a year." },
      ],
    },
    {
      name: "Medicine and first aid",
      desc: "Pharmacies may be closed, so keep backups in date",
      blanks: 2,
      rows: [
        ...when(ctx.needs.has("meds"), [
          { item: "Backup prescription medicine", kit: "Go bag" as const, every: 6, note: "Rotate it into daily use so it never expires." },
        ]),
        { item: "Everyday medicines", kit: "Stay-at-home bin", note: "Pain, allergy, and stomach medicine. Use the dates on the packages." },
        ...when(kids, [{ item: "Kids' fever medicine", kit: "Stay-at-home bin" as const, note: "Check the dose for their current weight too." }]),
        { item: "First aid kit", kit: "Stay-at-home bin", every: 12, note: "Ointments and wipes dry out. Restock what you've used." },
        ...when(go, [{ item: "Go bag first aid kit", kit: "Go bag" as const, every: 12, note: "" }]),
        ...when(ctx.needs.has("vision-hearing"), [
          { item: "Contact lens solution and spare contacts", kit: "Go bag" as const, note: "Use the date on the package." },
        ]),
        ...when(ctx.pets > 0, [{ item: "Pet medicine", kit: "Go bag" as const, note: "Use the date on the package." }]),
        { item: "Hand sanitizer", kit: "Stay-at-home bin", note: "Use the date on the bottle." },
      ],
    },
    {
      name: "Batteries and power",
      desc: "Charge and test these so they work when the power's out",
      blanks: 1,
      rows: [
        { item: "Spare batteries", kit: "Stay-at-home bin", every: 12, note: "Check the dates. Store them outside the devices." },
        { item: "Flashlights and radio", kit: "Stay-at-home bin", every: 6, note: "Test them and swap in fresh batteries if they're weak." },
        { item: "Phone power banks", kit: go ? "Go bag" : "Stay-at-home bin", every: 3, note: "Recharge every few months. They slowly drain." },
        ...when(ctx.power.has("charge") || ctx.needs.has("power-device"), [
          { item: "Portable power station", kit: "Stay-at-home bin" as const, every: 3, note: "Recharge every 3 months." },
        ]),
        ...when(ctx.needs.has("power-device"), [
          { item: "Medical device backup battery", kit: "Stay-at-home bin" as const, every: 3, note: "Charge it and test it with the device." },
        ]),
      ],
    },
    {
      name: "Everything else",
      desc: "Quick checks that keep the rest of your kit ready",
      blanks: 1,
      rows: [
        { item: "N95 masks", kit: "Stay-at-home bin", note: "Use the date on the box. The straps weaken over time." },
        { item: "Smoke and carbon monoxide alarms", kit: "Around the house", every: 12, note: "Test them and change the batteries." },
        { item: "Fire extinguisher", kit: "Around the house", every: 12, note: "Check the gauge is in the green." },
        ...when(go, [{ item: "Phone numbers and document copies", kit: "Go bag" as const, every: 12, note: "Update numbers, IDs, and insurance." }]),
        ...when(go && kids, [{ item: "Kids' clothes and shoes", kit: "Go bag" as const, every: 6, note: "Check they still fit." }]),
        ...when(ctx.babies > 0, [{ item: "Diapers", kit: "Go bag" as const, every: 6, note: "Check the size." }]),
        ...when(car, [{ item: "Car kit", kit: "Car kit" as const, every: 6, note: "Heat is hard on everything in a car." }]),
      ],
    },
  ];
}
