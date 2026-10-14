import { peopleNames } from "@/lib/answers";
import type { Container, Context } from "@/lib/types";
import type { Lang } from "@/i18n/lang";
import { metaFor } from "./meta";

/**
 * Starter rows for the spreadsheet's Expiration dates tab: things in a kit
 * that expire, go stale, or need a regular check. Grouped by whose they are:
 * one section for shared supplies, then one per person for their own go bag.
 * "every" is a default in months people can change; leave it out when the
 * date printed on the package is what matters.
 */
export interface ExpiringRow {
  item: string;
  /** The kit's name in the household's language, e.g. "Stay-at-home bin" or "Caja para quedarse en casa". */
  kit: string;
  container: Container;
  every?: number;
  note: string;
  /**
   * A food example, written with EXAMPLE_PREFIX in front of the item ("[Example] Canned beans").
   * `placeholder` marks the "[Example] Add your food here" rows, which are blanks to fill in.
   */
  example?: boolean;
  placeholder?: boolean;
}

export interface ExpiringSection {
  name: string;
  desc: string;
  rows: ExpiringRow[];
  /** Empty rows to leave for people's own entries. */
  blanks: number;
}

/** What starts the item on example rows, by language. */
export const EXAMPLE_PREFIX: Record<Lang, string> = { en: "[Example] ", es: "[Ejemplo] " };

/** An example row's item without its prefix, in either language: "Canned beans". */
export const withoutExamplePrefix = (item: string) => item.replace(/^\[(Example|Ejemplo)\] /, "");

export function expiringSections(ctx: Context): ExpiringSection[] {
  const es = ctx.lang === "es";
  const go = ctx.kits.includes("go");
  const car = ctx.kits.includes("car");
  const kids = ctx.kids + ctx.babies > 0;
  const when = <T,>(cond: boolean, rows: T[]) => (cond ? rows : []);
  const kits = metaFor(ctx.lang).container;

  /** One row: the item and note in English and Spanish, the kit, and the months between checks. */
  const row = (container: Container, every: number | undefined, item: [string, string], note: [string, string] = ["", ""]): ExpiringRow => ({
    item: es ? item[1] : item[0],
    kit: kits[container].name,
    container,
    ...(every ? { every } : {}),
    note: es ? note[1] : note[0],
  });
  const example = (every: number | undefined, item: [string, string], note?: [string, string]): ExpiringRow => {
    const r = row("stay", every, item, note);
    return { ...r, item: EXAMPLE_PREFIX[ctx.lang] + r.item, example: true };
  };
  const onPackage: [string, string] = ["Use the date on the package.", "Use la fecha del paquete."];
  const rechargeBank: [string, string] = ["Recharge every few months. They slowly drain.", "Recárguelas cada pocos meses. Se descargan poco a poco."];

  // Shared supplies, food first because it needs replacing most often.
  const everyone: ExpiringRow[] = [
    example(24, ["Canned beans", "Frijoles en lata"], ["Most canned food lasts 2 to 5 years. The date on the can wins.", "La mayoría de la comida en lata dura de 2 a 5 años. Lo que diga la lata es lo que cuenta."]),
    example(24, ["Canned tuna or chicken", "Atún o pollo en lata"], ["Pull-tab cans save needing an opener.", "Las latas con abre fácil le ahorran el abrelatas."]),
    example(12, ["Peanut butter", "Crema de cacahuate"]),
    example(6, ["Crackers", "Galletas saladas"], ["Go stale fast once opened.", "Se ponen viejas rápido una vez abiertas."]),
    example(6, ["Cereal or granola", "Cereal o granola"]),
    example(6, ["Dried fruit and nuts", "Fruta seca y nueces"], ["Nuts go rancid in heat.", "Las nueces se ponen rancias con el calor."]),
    // Placeholder rows so there's an obvious spot to write down your own food.
    ...Array.from({ length: 5 }, () => ({ ...example(undefined, ["Add your food here", "Agregue aquí su comida"]), placeholder: true })),
    ...when(ctx.babies > 0, [row("stay", undefined, ["Formula and baby food", "Fórmula y comida para bebé"], onPackage)]),
    ...when(ctx.pets > 0, [row("stay", 6, ["Pet food", "Comida para mascotas"], ["Dry food goes stale once the bag is open.", "Las croquetas se ponen viejas una vez abierta la bolsa."])]),
    ...when(car, [row("car", 6, ["Snacks in the car", "Botanas en el carro"], ["Car heat shortens shelf life.", "El calor del carro hace que duren menos."])]),

    row("stay", 6, ["Water you bottled from the tap", "Agua de la llave que usted embotelló"], ["Tap water needs no treatment if you swap it every 6 months.", "El agua de la llave no necesita tratamiento si la cambia cada 6 meses."]),
    row("stay", 24, ["Store-bought bottled water", "Agua embotellada comprada"], ["Use the date on the case, usually about 2 years.", "Use la fecha del paquete, por lo general unos 2 años."]),
    ...when(car, [row("car", 6, ["Water in the car", "Agua en el carro"], ["Heat breaks down plastic bottles.", "El calor daña las botellas de plástico."])]),
    ...when(go, [row("go", undefined, ["Water purification tablets", "Pastillas para purificar el agua"], onPackage)]),
    row("stay", 12, ["Unscented bleach", "Cloro sin olor"], ["Loses strength after about a year.", "Pierde fuerza después de más o menos un año."]),

    row("stay", undefined, ["Everyday medicines", "Medicinas de uso diario"], ["Pain, allergy, and stomach medicine. Use the dates on the packages.", "Medicinas para el dolor, la alergia y el estómago. Use las fechas de los paquetes."]),
    ...when(kids, [row("stay", undefined, ["Kids' fever medicine", "Medicina para la fiebre para niños"], ["Check the dose for their current weight too.", "Revise también la dosis para el peso que tienen ahora."])]),
    row("stay", 12, ["First aid kit", "Botiquín de primeros auxilios"], ["Ointments and wipes dry out. Restock what you've used.", "Las pomadas y toallitas se secan. Reponga lo que haya usado."]),
    ...when(go, [row("go", 12, ["Go bag first aid kit", "Botiquín de la mochila de emergencia"])]),
    ...when(ctx.pets > 0, [row("go", undefined, ["Pet medicine", "Medicinas de la mascota"], onPackage)]),
    row("stay", undefined, ["Hand sanitizer", "Gel antibacterial"], ["Use the date on the bottle.", "Use la fecha de la botella."]),

    row("stay", 12, ["Spare batteries", "Baterías de repuesto"], ["Check the dates. Store them outside the devices.", "Revise las fechas. Guárdelas fuera de los aparatos."]),
    row("stay", 6, ["Flashlights and radio", "Linternas y radio"], ["Test them and swap in fresh batteries if they're weak.", "Pruébelos y póngales baterías nuevas si están débiles."]),
    ...when(!go, [row("stay", 3, ["Phone power banks", "Baterías portátiles para el celular"], rechargeBank)]),
    ...when(ctx.power.has("charge") || ctx.needs.has("power-device"), [
      row("stay", 3, ["Portable power station", "Estación de energía portátil"], ["Recharge every 3 months.", "Recárguela cada 3 meses."]),
    ]),
    ...when(ctx.needs.has("power-device"), [
      row("stay", 3, ["Medical device backup battery", "Batería de respaldo del aparato médico"], ["Charge it and test it with the device.", "Cárguela y pruébela con el aparato."]),
    ]),

    row("stay", undefined, ["N95 masks", "Mascarillas N95"], ["Use the date on the box. The straps weaken over time.", "Use la fecha de la caja. Las ligas se aflojan con el tiempo."]),
    row("home", 12, ["Smoke and carbon monoxide alarms", "Alarmas de humo y de monóxido de carbono"], [
      "Press test. Most newer alarms have sealed batteries: replace smoke alarms at 10 years, and CO alarms by the date on the back, usually 7 to 10 years.",
      "Apriete el botón de prueba. Casi todas las alarmas nuevas tienen baterías selladas: cambie las alarmas de humo a los 10 años, y las de monóxido de carbono (CO) para la fecha que dice atrás, por lo general de 7 a 10 años.",
    ]),
    row("home", 12, ["Household plan and phone numbers", "Plan de la casa y números de teléfono"], [
      "Go over it together. A good time is the Great ShakeOut drill, the third Thursday in October.",
      "Repásenlo juntos. Un buen momento es el simulacro del Gran ShakeOut, el tercer jueves de octubre.",
    ]),
    row("home", 12, ["Fire extinguisher", "Extintor de incendios"], ["Check the gauge is in the green.", "Revise que el indicador esté en lo verde."]),
    ...when(ctx.babies > 0, [row("go", 6, ["Diapers and baby clothes", "Pañales y ropa de bebé"], ["Check the sizes.", "Revise las tallas."])]),
    ...when(car, [row("car", 6, ["Car kit", "Kit para el carro"], ["Heat is hard on everything in a car.", "El calor daña todo lo que está en un carro."])]),
  ];

  const sections: ExpiringSection[] = [
    {
      name: es ? "Todos" : "Everyone",
      desc: es
        ? "Provisiones de todos, casi todas en la caja para quedarse en casa. La comida va primero porque hay que cambiarla más seguido"
        : "Shared supplies, mostly in the stay-at-home bin. Food is first because it needs replacing most often",
      rows: everyone,
      blanks: 8,
    },
  ];
  if (!go) return sections;

  // Each person's own go bag.
  const names = peopleNames(ctx).slice(0, ctx.carriers);
  names.forEach((name, i) => {
    const isKid = i >= ctx.adults;
    // The first adult, when they haven't given a name ("Me").
    const me = name === "Me" || (i === 0 && !ctx.names.adults[0]?.trim());
    const desc =
      names.length === 1
        ? es ? "Lo que hay en su mochila de emergencia que caduca o hay que revisar" : "Things in your go bag that expire or need a check"
        : me
          ? es ? "Su mochila de emergencia" : "Your go bag"
          : es ? `La mochila de ${name}` : `${name}'s go bag`;
    sections.push({
      name: names.length > 1 ? name : es ? "Su mochila de emergencia" : "Your go bag",
      desc,
      blanks: 2,
      rows: [
        row("go", 12, ["Go bag food", "Comida de la mochila"], ["Bars or ration packs. Eat them and replace them before they go stale.", "Barras o raciones. Cómalas y repóngalas antes de que se pongan viejas."]),
        row("go", 6, ["Go bag water", "Agua de la mochila"]),
        // Kids under 13 skip things a grown-up handles for them: power banks, prescriptions, and contacts.
        ...when(!isKid, [row("go", 3, ["Phone power bank", "Batería portátil para el celular"], [rechargeBank[0], "Recárguela cada pocos meses. Se descarga poco a poco."])]),
        row("go", 12, ["Phone numbers and ID copies", "Números de teléfono y copias de identificaciones"], ["Update numbers, IDs, and insurance.", "Actualice los números, las identificaciones y los seguros."]),
        ...when(!isKid && ctx.needs.has("meds"), [
          row("go", 6, ["Prescription medicine", "Medicinas recetadas"], [
            "Rotate the backup into daily use so it never expires. Skip if none.",
            "Vaya usando las de reserva en su día a día para que nunca caduquen. Omita esto si no toma ninguna.",
          ]),
        ]),
        ...when(!isKid && ctx.needs.has("vision-hearing"), [
          row("go", undefined, ["Contacts, solution, or hearing aid batteries", "Lentes de contacto, solución o baterías para aparatos auditivos"], [
            "Use the date on the package. Skip if none.",
            "Use la fecha del paquete. Omita esto si no usa.",
          ]),
        ]),
        isKid
          ? row("go", 6, ["Clothes and shoes", "Ropa y zapatos"], ["Check they still fit.", "Revise que todavía les queden."])
          : row("go", 12, ["Change of clothes", "Muda de ropa"], ["Swap for the season.", "Cámbiela según la temporada."]),
      ],
    });
  });
  return sections;
}
