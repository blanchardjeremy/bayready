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

/** The card's words in English. The Spanish below has the same keys. */
const EN = {
  quakeTitle: "Right after a big quake",
  otherTitle: "Other emergencies",
  whenTitle: "When it happens",
  afterTitle: "In the days after",
  kidsAtSchool:
    "Kids at school or daycare stay there until an adult on their emergency card picks them up. Don't call or rush the school. Go when it's safe, and bring ID.",
  cantWalkFar: " Can't walk far? Use your ride plan, or as a last resort go to the third floor or higher of a sturdy building.",
  dropCover: "Drop, cover, and hold on until the shaking stops. In bed, stay there and cover your head with a pillow. Expect aftershocks.",
  coastQuake: "Near the coast and felt a long or strong quake? Go to high ground as soon as the shaking stops. Don't wait for an alert.",
  shoes: "Put on shoes. Check yourself, then the people around you. Press hard on any bleeding.",
  gas: "Smell gas or hear hissing? Don't touch light switches, phones, or flames. Get everyone out, shut off the gas if you can, and call PG&E or 911 from outside. Otherwise leave the gas on.",
  lightsOxygen: "Use flashlights, never candles, especially near oxygen. Never run a generator, grill, or camp stove indoors.",
  lights: "Use flashlights, not candles. Never run a generator, grill, or camp stove indoors.",
  leaveGo: "If the building looks badly damaged, take your go bags and leave. Leave a note saying where you went.",
  leave: "If the building looks badly damaged, grab shoes, your phone, medicine, and ID, and leave. Leave a note saying where you went.",
  text: "Text, don't call. Send one \"We're OK\" to your out-of-area contact, then save your battery.",
  flush: "Don't flush until you know the sewer is OK. Use the bucket toilet. If pipes broke, close the water main.",
  sign: "Put your OK or HELP sign in the window. Once your home is safe, check on your neighbors, and walk the block if that's what you agreed.",
  radio: "Listen to a battery radio (KCBS 740 AM or KQED 88.5 FM) and your county alerts. For shelter or help, call 211.",
  wildfireExtraTime:
    "Wildfire Evacuation Warning: leave now, since your household needs extra time. Evacuation Order: leave immediately. If you feel unsafe, go.",
  wildfire:
    "Wildfire Evacuation Warning: get ready and go if you can. Evacuation Order: leave now. If you feel unsafe, leave without waiting for an order.",
  tsunami: "Tsunami warning, or the water pulls back at the coast: go to high ground now.",
  flood: "Flooding: turn around, don't drown. Six inches of moving water can knock you down.",
  chemical: "Chemical release: go inside, close windows and doors, turn off fans and AC, and wait for the all-clear.",
  smoke: "Smoky: close windows and doors, run your filter in the clean-air room, and keep kids and anyone with asthma or heart disease inside.",
  heat: "Heat wave: drink water, get somewhere cool, and check on people who live alone. Confused, fainting, or very hot? Call 911 and cool them right away with water and a fan.",
  outage: "Power out: keep the fridge and freezer shut. The fridge stays cold about 4 hours, a full freezer about 2 days.",
  oxygenOut: "Power out and you use oxygen: switch to your backup tanks now, and call your supplier if they'll run low.",
  deviceOut: "Power out and you use a medical device: switch to backup power now, and call your supplier if it'll run out.",
  co: "Headache, dizziness, or nausea in several people at once, especially near a grill, stove, or car? Get everyone into fresh air and call 911. It may be carbon monoxide.",
  placards: "Inspectors may post a colored sign on your building. Green means OK to use, yellow means limited entry, and red means unsafe, so stay out.",
  waterOut: "Stored water running low? Listen for where water is being handed out, and bring clean containers with lids. Water-heater and pool water are for flushing, not drinking.",
  photos: "Photograph damage before you clean up, then call your insurer. Keep receipts for anything you spend while you can't live at home.",
  aid: "Once a disaster is declared, apply for help at DisasterAssistance.gov. SBA disaster loans cover renters too, for things you lost.",
  scams: "Watch for contractor scams. Check the license at cslb.ca.gov, get the price in writing, and don't pay much up front.",
  routines: "Keep kids' routines as normal as you can, and limit news on TV and phones.",
  distress: "Feeling overwhelmed? Call or text the Disaster Distress Helpline at 1-800-985-5990, any time.",
};

const ES: typeof EN = {
  quakeTitle: "Justo después de un terremoto fuerte",
  otherTitle: "Otras emergencias",
  whenTitle: "Cuando ocurra",
  afterTitle: "En los días después",
  kidsAtSchool:
    "Los niños que están en la escuela o la guardería se quedan ahí hasta que los recoge un adulto que esté en su tarjeta de emergencia. No llame ni corra a la escuela. Vaya cuando sea seguro, y lleve su identificación.",
  cantWalkFar:
    " ¿No puede caminar lejos? Use su plan para que lo lleven, o como último recurso suba al tercer piso o más alto de un edificio firme.",
  dropCover:
    "Agáchese, cúbrase y sujétese hasta que pare el temblor. Si está en la cama, quédese ahí y cúbrase la cabeza con una almohada. Espere réplicas.",
  coastQuake:
    "¿Está cerca de la costa y sintió un terremoto largo o fuerte? Vaya a terreno alto en cuanto pare el temblor. No espere una alerta.",
  shoes: "Póngase zapatos. Revísese usted y luego a quienes estén cerca. Apriete fuerte sobre cualquier sangrado.",
  gas: "¿Huele a gas o escucha un silbido? No toque los apagadores, los teléfonos ni nada con llama. Saque a todos, cierre el gas si puede y llame a PG&E o al 911 desde afuera. Si no, deje el gas abierto.",
  lightsOxygen:
    "Use linternas, nunca velas, sobre todo cerca del oxígeno. Nunca use un generador, un asador ni una estufa de campamento adentro.",
  lights: "Use linternas, no velas. Nunca use un generador, un asador ni una estufa de campamento adentro.",
  leaveGo:
    "Si el edificio se ve muy dañado, tome sus mochilas de emergencia y salga. Deje una nota que diga adónde se fueron.",
  leave:
    "Si el edificio se ve muy dañado, tome zapatos, su celular, sus medicinas y su identificación, y salga. Deje una nota que diga adónde se fueron.",
  text: "Mande mensajes de texto, no llame. Mande un solo \"Estamos bien\" a su contacto fuera del área, y luego ahorre batería.",
  flush:
    "No le jale al escusado hasta saber que el drenaje está bien. Use el baño de cubeta. Si se rompieron las tuberías, cierre la llave de paso principal del agua.",
  sign: "Ponga su letrero de OK o AYUDA en la ventana. Cuando su casa esté segura, vea cómo están sus vecinos, y recorra la cuadra si eso acordaron.",
  radio:
    "Escuche una radio de baterías (KCBS 740 AM o KQED 88.5 FM) y las alertas de su condado. Para un refugio o ayuda, llame al 211.",
  wildfireExtraTime:
    "Advertencia de evacuación por incendio: salga ya, porque su familia necesita más tiempo. Orden de evacuación: salga de inmediato. Si no se siente seguro, váyase.",
  wildfire:
    "Advertencia de evacuación por incendio: prepárese y salga si puede. Orden de evacuación: salga ya. Si no se siente seguro, váyase sin esperar una orden.",
  tsunami: "Alerta de tsunami, o el agua se retira en la costa: vaya ya a terreno alto.",
  flood: "Inundación: dé la vuelta, no se ahogue. Seis pulgadas de agua en movimiento lo pueden tumbar.",
  chemical:
    "Fuga química: entre a la casa, cierre ventanas y puertas, apague los ventiladores y el aire acondicionado, y espere el aviso de que ya pasó el peligro.",
  smoke:
    "Humo: cierre ventanas y puertas, prenda el filtro en el cuarto de aire limpio, y mantenga adentro a los niños y a quien tenga asma o una enfermedad del corazón.",
  heat: "Ola de calor: tome agua, vaya a un lugar fresco y vea cómo están las personas que viven solas. ¿Alguien está confundido, se desmaya o está muy caliente? Llame al 911 y enfríelo de inmediato con agua y un ventilador.",
  outage:
    "Sin luz: mantenga cerrados el refrigerador y el congelador. El refrigerador se mantiene frío unas 4 horas, y un congelador lleno unos 2 días.",
  oxygenOut:
    "Sin luz y usa oxígeno: cambie ya a sus tanques de respaldo, y llame a su proveedor si se le van a acabar.",
  deviceOut:
    "Sin luz y usa un aparato médico: cambie ya a la electricidad de respaldo, y llame a su proveedor si se le va a acabar.",
  co: "¿Varias personas con dolor de cabeza, mareo o náuseas al mismo tiempo, sobre todo cerca de un asador, una estufa o un carro? Saque a todos al aire fresco y llame al 911. Puede ser monóxido de carbono.",
  placards:
    "Los inspectores pueden poner un letrero de color en su edificio. Verde quiere decir que se puede usar, amarillo que la entrada es limitada, y rojo que no es seguro, así que no entre.",
  waterOut:
    "¿Se le está acabando el agua guardada? Esté atento a dónde están repartiendo agua, y lleve recipientes limpios con tapa. El agua del calentador y de la alberca es para el escusado, no para tomar.",
  photos:
    "Tómele fotos a los daños antes de limpiar, y luego llame a su compañía de seguros. Guarde los recibos de todo lo que gaste mientras no pueda vivir en su casa.",
  aid: "Cuando se declare un desastre, pida ayuda en DisasterAssistance.gov. Los préstamos por desastre de la SBA también cubren a los inquilinos, para las cosas que perdieron.",
  scams:
    "Cuidado con los fraudes de contratistas. Revise la licencia en cslb.ca.gov, pida el precio por escrito y no pague mucho por adelantado.",
  routines: "Mantenga las rutinas de los niños lo más normales que pueda, y limite las noticias en la tele y el celular.",
  distress:
    "¿Se siente abrumado? Llame o mande un texto a la Línea de Ayuda para los Afectados por Catástrofes al 1-800-985-5990 (oprima 2 para español), a cualquier hora.",
};

export function firstHourCard(ctx: Context): CardSection[] {
  const t = ctx.lang === "es" ? ES : EN;
  const has = (h: HazardId) => ctx.hazards.has(h);
  const go = ctx.kits.includes("go");
  const oxygen = ctx.needs.has("oxygen");
  const device = ctx.needs.has("power-device");
  const mobility = ctx.needs.has("mobility");
  // Agencies ask households like these to leave at the evacuation warning, not wait for the order.
  const needsExtraTime = ctx.kids + ctx.babies > 0 || ctx.pets > 0 || mobility || device || ctx.car === "no";
  const cantWalkFar = mobility ? t.cantWalkFar : "";
  const hasKids = ctx.kids + ctx.babies > 0;
  const sections: CardSection[] = [];

  if (has("earthquake")) {
    sections.push({
      title: t.quakeTitle,
      lines: [
        t.dropCover,
        // At the coast, the shaking is the warning, so this comes before anything else.
        ...(has("tsunami") ? [`${t.coastQuake}${cantWalkFar}`] : []),
        t.shoes,
        t.gas,
        oxygen ? t.lightsOxygen : t.lights,
        go ? t.leaveGo : t.leave,
        t.text,
        ...(hasKids && has("earthquake") ? [t.kidsAtSchool] : []),
        t.flush,
        t.sign,
        t.radio,
      ],
    });
  }

  const other = [
    ...(hasKids && !has("earthquake") ? [t.kidsAtSchool] : []),
    ...(has("wildfire") ? [needsExtraTime ? t.wildfireExtraTime : t.wildfire] : []),
    ...(has("tsunami") && !has("earthquake") ? [`${t.tsunami}${cantWalkFar}`] : []),
    ...(has("flood") ? [t.flood] : []),
    ...(has("chemical") ? [t.chemical] : []),
    ...(has("smoke") ? [t.smoke] : []),
    ...(has("heat") ? [t.heat] : []),
    ...(has("outage") ? [t.outage] : []),
    ...(device ? [oxygen ? t.oxygenOut : t.deviceOut] : []),
    ...(has("outage") || has("earthquake") ? [t.co] : []),
  ];
  if (other.length) sections.push({ title: sections.length ? t.otherTitle : t.whenTitle, lines: other });

  // Recovery: what to do once the danger has passed. Sources: ATC-20 building
  // placards, DisasterAssistance.gov, SBA disaster loans, CSLB, SAMHSA.
  const damage = has("earthquake") || has("wildfire") || has("flood");
  sections.push({
    title: t.afterTitle,
    lines: [
      ...(has("earthquake") ? [t.placards, t.waterOut] : []),
      ...(damage ? [t.photos, t.aid, t.scams] : []),
      ...(hasKids ? [t.routines] : []),
      t.distress,
    ],
  });

  return sections;
}
