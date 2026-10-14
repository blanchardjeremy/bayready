import type { Context, HazardId } from "@/lib/types";

/**
 * A short "what to do when it happens" card, shown on the list and in the
 * spreadsheet so it can be printed and taped inside the bin lid. Lines for
 * other hazards only show when the household picked them.
 * Sources: CDC "Stay safe after an earthquake", ReadySF Earthquake Safety
 * Guide, Earthquake Country Alliance, FCC/FEMA emergency communication tips.
 */
export interface CardSection {
  title: string;
  lines: string[];
}

export function firstHourCard(ctx: Context): CardSection[] {
  const has = (h: HazardId) => ctx.hazards.has(h);
  const go = ctx.kits.includes("go");
  const oxygen = ctx.needs.has("oxygen");
  const device = ctx.needs.has("power-device");
  const mobility = ctx.needs.has("mobility");
  // Agencies ask households like these to leave at the evacuation warning, not wait for the order.
  const needsExtraTime = ctx.kids + ctx.babies > 0 || ctx.pets > 0 || mobility || device || ctx.car === "no";
  const cantWalkFar = mobility ? " Can't walk far? Use your ride plan, or as a last resort go to the third floor or higher of a sturdy building." : "";
  const sections: CardSection[] = [];

  if (has("earthquake")) {
    sections.push({
      title: "Right after a big quake",
      lines: [
        "Drop, cover, and hold on until the shaking stops. In bed, stay there and cover your head with a pillow. Expect aftershocks.",
        // At the coast, the shaking is the warning, so this comes before anything else.
        ...(has("tsunami")
          ? [`Near the coast and felt a long or strong quake? Go to high ground as soon as the shaking stops. Don't wait for an alert.${cantWalkFar}`]
          : []),
        "Put on shoes. Check yourself, then the people around you. Press hard on any bleeding.",
        "Smell gas or hear hissing? Don't touch light switches, phones, or flames. Get everyone out, shut off the gas if you can, and call PG&E or 911 from outside. Otherwise leave the gas on.",
        oxygen
          ? "Use flashlights, never candles, especially near oxygen. Never run a generator, grill, or camp stove indoors."
          : "Use flashlights, not candles. Never run a generator, grill, or camp stove indoors.",
        go
          ? "If the building looks badly damaged, take your go bags and leave. Leave a note saying where you went."
          : "If the building looks badly damaged, grab shoes, your phone, medicine, and ID, and leave. Leave a note saying where you went.",
        "Text, don't call. Send one \"We're OK\" to your out-of-area contact, then save your battery.",
        "Don't flush until you know the sewer is OK. Use the bucket toilet. If pipes broke, close the water main.",
        "Put your OK or HELP sign in the window, and check in with your neighbors.",
        "Listen to a battery radio (KCBS 740 AM or KQED 88.5 FM) and your county alerts. For shelter or help, call 211.",
      ],
    });
  }

  const other = [
    ...(has("wildfire")
      ? [
          needsExtraTime
            ? "Wildfire Evacuation Warning: leave now, since your household needs extra time. Evacuation Order: leave immediately. If you feel unsafe, go."
            : "Wildfire Evacuation Warning: get ready and go if you can. Evacuation Order: leave now. If you feel unsafe, leave without waiting for an order.",
        ]
      : []),
    ...(has("tsunami") && !has("earthquake")
      ? [`Tsunami warning, or the water pulls back at the coast: go to high ground now.${cantWalkFar}`]
      : []),
    ...(has("flood") ? ["Flooding: turn around, don't drown. Six inches of moving water can knock you down."] : []),
    ...(has("chemical")
      ? ["Chemical release: go inside, close windows and doors, turn off fans and AC, and wait for the all-clear."]
      : []),
    ...(has("smoke")
      ? ["Smoky: close windows and doors, run your filter in the clean-air room, and keep kids and anyone with asthma or heart disease inside."]
      : []),
    ...(has("heat")
      ? ["Heat wave: drink water, get somewhere cool, and check on people who live alone. Confused, fainting, or very hot? Call 911 and cool them right away with water and a fan."]
      : []),
    ...(has("outage") ? ["Power out: keep the fridge and freezer shut. The fridge stays cold about 4 hours, a full freezer about 2 days."] : []),
    ...(device
      ? [
          oxygen
            ? "Power out and you use oxygen: switch to your backup tanks now, and call your supplier if they'll run low."
            : "Power out and you use a medical device: switch to backup power now, and call your supplier if it'll run out.",
        ]
      : []),
    ...(has("outage") || has("earthquake")
      ? ["Headache, dizziness, or nausea in several people at once, especially near a grill, stove, or car? Get everyone into fresh air and call 911. It may be carbon monoxide."]
      : []),
  ];
  if (other.length) sections.push({ title: sections.length ? "Other emergencies" : "When it happens", lines: other });

  return sections;
}
