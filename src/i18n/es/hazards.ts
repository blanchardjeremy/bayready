import type { HazardId } from "@/lib/types";

/** Spanish names and blurbs for hazards. Same ids as src/data/hazards.ts. */
export const HAZARDS_ES: Record<HazardId, { name: string; short: string; blurb: string }> = {
  earthquake: {
    name: "Terremoto",
    short: "Terremoto",
    blurb: "El agua, el gas y la luz pueden faltar por días, y el agua por semanas en algunas zonas.",
  },
  outage: {
    name: "Apagón",
    short: "Apagón",
    blurb: "Incluye los cortes planeados en días de calor y viento.",
  },
  smoke: {
    name: "Humo de incendios",
    short: "Humo",
    blurb: "El aire malo puede llegar a toda la Bahía, aun lejos del fuego.",
  },
  wildfire: {
    name: "Evacuación por incendio",
    short: "Incendio",
    blurb: "Salir rápido si hay un incendio cerca.",
  },
  heat: {
    name: "Calor extremo",
    short: "Calor",
    blurb: "Olas de calor, sobre todo tierra adentro y en casas sin aire acondicionado.",
  },
  flood: {
    name: "Tormentas e inundaciones",
    short: "Tormenta",
    blurb: "Ríos atmosféricos, inundaciones, árboles caídos y deslaves.",
  },
  tsunami: {
    name: "Tsunami",
    short: "Tsunami",
    blurb: "Para casas cerca de la costa o en partes bajas junto a la bahía.",
  },
  chemical: {
    name: "Fuga química",
    short: "Química",
    blurb: "Resguardarse adentro si hay un accidente en una refinería o industria cercana.",
  },
};
