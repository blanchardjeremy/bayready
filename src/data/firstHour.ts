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
  const sections: CardSection[] = [];

  if (has("earthquake")) {
    sections.push({
      title: "Right after a big quake",
      lines: [
        "Drop, cover, and hold on until the shaking stops. In bed, stay there and cover your head with a pillow. Expect aftershocks.",
        "Put on shoes. Check yourself, then the people around you. Press hard on any bleeding.",
        "Smell gas or hear hissing? Get everyone out, shut off the gas if you can, and call PG&E from outside. Otherwise leave the gas on.",
        "Use flashlights, not candles. Never run a generator, grill, or camp stove indoors.",
        "If the building looks badly damaged, take your go bags and leave. Leave a note saying where you went.",
        ...(has("tsunami")
          ? ["Near the coast and felt a long or strong quake? Walk to high ground now. Don't wait for an alert."]
          : []),
        "Text, don't call. Send one \"We're OK\" to your out-of-area contact, then save your battery.",
        "Don't flush until you know the sewer is OK. Use the bucket toilet. If pipes broke, close the water main.",
        "Put your OK or HELP sign in the window, and check in with your neighbors.",
        "Listen to a battery radio (KCBS 740 AM or KQED 88.5 FM) and your county alerts. For shelter or help, call 211.",
      ],
    });
  }

  const other = [
    ...(has("wildfire") ? ["Fire near you: if you feel unsafe, leave. Don't wait for an evacuation order."] : []),
    ...(has("tsunami") && !has("earthquake")
      ? ["Tsunami warning, or the water pulls back at the coast: walk to high ground now."]
      : []),
    ...(has("flood") ? ["Flooding: turn around, don't drown. Six inches of moving water can knock you down."] : []),
    ...(has("chemical")
      ? ["Chemical release: go inside, close windows and doors, turn off fans and AC, and wait for the all-clear."]
      : []),
    ...(has("outage") ? ["Power out: keep the fridge and freezer shut. A full freezer stays cold about 2 days."] : []),
  ];
  if (other.length) sections.push({ title: sections.length ? "Other emergencies" : "When it happens", lines: other });

  return sections;
}
