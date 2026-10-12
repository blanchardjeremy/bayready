import type { Answers, Context } from "./types";
import { resolveBuild } from "./answers";
import { HAZARD_BY_ID } from "@/data/hazards";

/** One line about the list, like "A go bag for 2 adults, 1 dog. Ready for earthquake. Basics list." */
export function listSummary(answers: Answers, ctx: Context): string {
  const build = resolveBuild(answers);
  const kits = { stay: "A stay-at-home bin", go: "A go bag", both: "A stay-at-home bin and a go bag" }[build];
  const h = answers.household;
  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const who = [
    plural(h.adults, "adult"),
    h.kids && plural(h.kids, "kid"),
    h.babies && plural(h.babies, "baby", "babies"),
    h.dogs && plural(h.dogs, "dog"),
    h.cats && plural(h.cats, "cat"),
    h.otherPets && plural(h.otherPets, "other pet"),
  ].filter(Boolean);
  const hazards = [...ctx.hazards].map((id) => HAZARD_BY_ID[id].name.toLowerCase());
  const level = answers.level === "advanced" ? "Advanced" : "Basics";
  return `${kits} for ${who.join(", ")}. Ready for ${hazards.join(", ")}. ${level} list.`;
}
