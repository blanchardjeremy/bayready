import type { Answers, Context } from "./types";
import { resolveBuild } from "./answers";
import { hazardFor } from "@/data/hazards";

/**
 * One line about the list, like "A go bag for 2 adults, 1 dog. Ready for earthquake. Basics list."
 * In Spanish: "Una mochila de emergencia para 2 adultos y 1 perro. Para estos riesgos: terremoto. Nivel: Lo básico."
 */
export function listSummary(answers: Answers, ctx: Context): string {
  const es = ctx.lang === "es";
  const build = resolveBuild(answers);
  const h = answers.household;
  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const hazards = [...ctx.hazards].map((id) => hazardFor(id, ctx.lang).name.toLowerCase());

  if (es) {
    const kits = {
      stay: "Una caja para quedarse en casa",
      go: "Una mochila de emergencia",
      both: "Una caja para quedarse en casa y una mochila de emergencia",
    }[build];
    const who = [
      plural(h.adults, "adulto"),
      h.kids && plural(h.kids, "niño"),
      h.babies && plural(h.babies, "bebé"),
      h.dogs && plural(h.dogs, "perro"),
      h.cats && plural(h.cats, "gato"),
      h.otherPets && plural(h.otherPets, "otra mascota", "otras mascotas"),
    ].filter((w): w is string => Boolean(w));
    const and = (list: string[]) => (list.length > 1 ? `${list.slice(0, -1).join(", ")} y ${list[list.length - 1]}` : list.join(""));
    const level = answers.level === "advanced" ? "Avanzado" : "Lo básico";
    return `${kits} para ${and(who)}. Para estos riesgos: ${and(hazards)}. Nivel: ${level}.`;
  }

  const kits = { stay: "A stay-at-home bin", go: "A go bag", both: "A stay-at-home bin and a go bag" }[build];
  const who = [
    plural(h.adults, "adult"),
    h.kids && plural(h.kids, "kid"),
    h.babies && plural(h.babies, "baby", "babies"),
    h.dogs && plural(h.dogs, "dog"),
    h.cats && plural(h.cats, "cat"),
    h.otherPets && plural(h.otherPets, "other pet"),
  ].filter(Boolean);
  const level = answers.level === "advanced" ? "Advanced" : "Basics";
  return `${kits} for ${who.join(", ")}. Ready for ${hazards.join(", ")}. ${level} list.`;
}
