import type { Translation } from "../types";
import type { exports as en } from "../en/exports";

export const exports: Translation<typeof en> = {
  /** "a, b y c" */
  list: (items) => (items.length > 1 ? `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}` : items.join("")),
  person: (n) => `Persona ${n}`,
  credit: "Hecho con Bay Ready, un planificador gratis de kits de emergencia para el Área de la Bahía",

  pdf: {
    lang: "es",
    dateLocale: "es-US",
    title: "Mi lista de emergencia",
    titleShort: "Mi lista de emergencia: versión corta",
    kicker: "BAY READY",
    kickerShort: "BAY READY  |  VERSIÓN CORTA",
    alerts: (name, url) => `Alertas de emergencia: inscríbase a ${name} en ${url}`,
    made: (date) => `Hecha el ${date}. `,
    openOnline: "Ver esta lista en línea",
    printFrame: "Lista para imprimir",
    files: { list: "lista-de-emergencia.pdf", short: "lista-de-emergencia-corta.pdf", refresh: "mantengalo-al-dia.pdf" },

    knowYourHome: "Conozca su casa",
    knowYourHomeIntro:
      "Llene lo que esté en blanco. Guarde una copia en su caja para quedarse en casa y en cada mochila de emergencia.",
    notes: "Notas y recordatorios",

    whenItHappens: "Cuando ocurra",
    places: { fridge: "en el refrigerador", lid: "dentro de la tapa de su caja", bags: "en cada mochila de emergencia" },
    keepCopy: (where) => `Tenga una copia ${where}.`,

    walletCards: "Tarjetas para la cartera",
    walletIntro:
      "Una para cada persona. Corte por la línea punteada y dóblela a la mitad. Cabe en una cartera o en la funda del celular, y también en la mochila de un niño.",
    card: {
      separated: "SI NOS SEPARAMOS",
      name: "Nombre",
      contact: "Contacto fuera del área",
      localContact: "Contacto local de respaldo",
      meetOutside: "Punto de encuentro afuera",
      meetNearby: "Punto de encuentro cercano",
      cells: "NUESTROS CELULARES",
      text: "Mande mensajes de texto, no llame.",
      numbers: "911 para emergencias, 211 para refugio y ayuda.",
      alerts: "Alertas:",
    },

    startHere: "Empiece aquí",
    startHereIntro: "Cosas gratis para hacer primero. No tiene que comprar nada.",
    essentials: "Lo esencial",
    essentialsIntro:
      "Compre esto primero y guárdelo. Márquelo a medida que avance. Su lista completa tiene todo lo demás, para cuando quiera hacer más.",
    essentialTag: "ESENCIAL",
    essentialsGroup: "LO ESENCIAL",

    everyBag: "En cada mochila",
    everyBagIntro: (names) => `Uno para cada quien: ${names}. Marque el nombre cuando esa mochila ya lo tenga.`,
    everyBagNames: (names) => (names.length > 1 ? `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}` : names.join("")),
    groupBag: "Uno para todo el grupo",
    groupBagIntro: "Solo necesitan uno de estos. Decidan en qué mochila va cada uno.",

    keepItFresh: "Manténgalo al día",
    keepItFreshIntro:
      "Revise estas cosas cuando cambie la hora en primavera y en otoño. Cada vez, use el siguiente cuadro vacío: escriba la fecha de hoy y cuándo toca la próxima vez. Las filas en blanco son para su propia comida y cualquier otra cosa que venza.",
    log: {
      item: "ARTÍCULO",
      replace: "CAMBIAR",
      eachCheck: "CADA REVISIÓN",
      on: "Fecha",
      next: "Próxima",
      every: (months) => (months === 1 ? "Cada mes" : `Cada ${months} meses`),
      byDate: "Según la fecha que trae",
    },

    page: (n, of) => `Página ${n} de ${of}`,
  },

  xlsx: {
    file: "kit-de-emergencia.xlsx",
    title: "Nuestro kit de emergencia",
    sheets: {
      overview: "Resumen",
      todos: "Tareas",
      supplies: "Suministros",
      expiring: "Fechas de vencimiento",
      neighbors: "Vecinos",
      card: "Cuando ocurra",
    },
    status: { need: "Falta", have: "Lo tengo", skip: "Omitir", partly: "En parte", todo: "Pendiente", done: "Hecho" },
    person: { done: "Hecho", notDone: "Pendiente" },
    heads: { now: "Vence ya", soon: "Vence pronto", good: "Al día" },
    yesNo: ["Sí", "No"],
    // Day first, with the month as a word, so 3/1 can't be misread as March or January.
    dateFormat: "d mmm yyyy",
    monthsFormat: '0" meses"',
    days: "días",

    creditFooter: (url) => `&L&8Hecho con Bay Ready: ${url}&R&8Página &P de &N`,
    extras: "Extras avanzados",
    extrasDesc: "Buenos de tener. Déjelos para después si apenas va empezando",

    todos: {
      title: "Tareas",
      subPeople:
        "Casi todas son gratis y rápidas. Empiece con Este fin de semana. Algunas son para cada adulto, así que marque Hecho en su propia columna.",
      sub: "Casi todas son gratis y rápidas. Empiece con Este fin de semana y cambie el Estado a Hecho a medida que avance.",
      headers: { status: "Estado", task: "Tarea", who: "Quién", link: "Enlace", why: "Por qué importa" },
      whoNote: "Quién lo hace. Escoja un nombre de la lista en la pestaña Resumen, o escriba uno.",
      eachAdult: "Cada adulto",
      eachAdultDesc: "Cada quien las hace en su propio celular o en sus cuentas",
      stageBlurb: {
        weekend: "Pasos rápidos y gratis, como una hora",
        month: "El resto del plan, y unas compras pequeñas",
        later: "Pasos extra para cuando esté listo",
      },
    },

    supplies: {
      title: "Suministros",
      subBags:
        "Marque Hecho para cada persona cuando empaque su mochila. Para todo lo demás, cambie el Estado a Lo tengo cuando lo consiga.",
      sub: "Cambie el Estado a Lo tengo cuando consiga algo. Anote lo que vence en la pestaña Fechas de vencimiento.",
      groups: { what: "Qué conseguir", buy: "Compras" },
      headers: {
        status: "Estado",
        item: "Artículo",
        amount: "Cantidad",
        who: "Quién compra",
        cost: "Costo aprox.",
        example: "Ejemplo",
        notes: "Notas",
      },
      whoNote: "Quién lo consigue. Escoja un nombre de la pestaña Resumen, o escriba uno.",
      costNote: "Un cálculo aproximado por la cantidad completa.",
      notesNote:
        "Lo que quiera recordar. Por ejemplo, el radio está en la mochila de Sam, así que ya tiene uno aunque aparezca en la caja para quedarse en casa.",
      bag: (n) => `Mochila ${n}`,
      everyBag: "En cada mochila",
      everyBagAdults: "Marque Hecho al empacar cada mochila. Algunas cosas son solo para adultos",
      everyBagDesc: "Marque Hecho para cada persona al empacar su mochila",
      groupBag: "Uno para todo el grupo",
      groupBagDesc: "Solo uno de estos. Decidan en qué mochila va",
      essentials: "Lo esencial",
      essentialsDesc: "Consiga esto primero",
      rest: "Todo lo demás",
      restDesc: "Cuando pueda",
      total: "Falta comprar (cálculo aproximado)",
      blurb: {
        stay: "Las cantidades siguen los Días en casa de la pestaña Resumen",
        bags: (n) => `${n} mochilas, una para cada persona que pueda cargar una`,
        go: "Lista para tomar en minutos",
        car: "Se guarda en la cajuela",
      },
    },

    expiring: {
      sub: "Escriba la fecha en que empacó cada cosa, o la fecha impresa en el paquete. Vence el y Aviso se llenan solos.",
      headers: ["Artículo", "Dónde", "Cambiar cada", "Empacado el", "Fecha del paquete", "Vence el", "Aviso", "Notas"],
      notes: {
        kit: "Dónde se guarda.",
        every: "Un valor que puede cambiar. Se usa con Empacado el cuando el paquete no trae fecha.",
        packed: "El día que lo compró o lo empacó.",
        date: "La fecha de vencimiento impresa, si trae una. Esta fecha cuenta más que Cambiar cada.",
        due: "Se llena solo: la fecha del paquete, o Empacado el más Cambiar cada.",
        heads: (now, soon, good) =>
          `Se llena solo.\n${now}: ya pasó la fecha.\n${soon}: vence antes de su próxima revisión (6 meses).\n${good}: no hay nada que hacer.`,
      },
      everyError: "Escriba un número de meses, como 6.",
      dateErrorTitle: "Eso no parece una fecha",
      dateError: "Pruebe algo como 3/1/2027 (mes/día/año).",
      tip: "Coma primero la comida más vieja y repóngala en su próxima compra. ¿Necesita más filas? Copie una fila hacia abajo para que también se copien las fórmulas.",
    },

    neighbors: {
      sub: "Gente cercana con quien intercambió números. Anote solo lo que cada persona diga que está bien compartir.",
      headers: [
        "Nombre",
        "Cómo comunicarse",
        "Dónde (unidad o calle)",
        "Habilidades o herramientas para compartir",
        "Algo que quieran que sepamos",
        "¿Se puede compartir con la cuadra?",
      ],
      skillsNote: "Primeros auxilios, una escalera, una estación de energía portátil, un carro, un idioma que hablen.",
      knowNote: "Por ejemplo, si quieren que alguien pase a verlos después de un terremoto o en una ola de calor.",
      meetingSpot: "Nuestro punto de encuentro:",
    },

    card: { sub: "Imprima esto y péguelo dentro de la tapa de su caja." },

    overview: {
      openLink: "Abrir esta lista en Bay Ready",
      whereThingsStand: "Cómo vamos",
      of: " de ",
      todosDone: "Tareas hechas",
      todosHint: "Empiece con Este fin de semana en la pestaña Tareas.",
      suppliesReady: "Suministros listos",
      suppliesHintBags: "Las cosas de la mochila cuentan cuando ya están en todas las mochilas.",
      suppliesHint: "Cambie el Estado a Lo tengo en la pestaña Suministros a medida que consiga cosas.",
      stillToBuy: "Falta comprar",
      stillToBuyHint: "Un cálculo aproximado. Casi todos lo reparten en unos meses.",
      dueNowHint: (sheet) => `Ya pasó su fecha o ya toca revisarlo. Vea la pestaña ${sheet}.`,
      dueSoon: "Vence en los próximos 6 meses",
      dueSoonHint: "Cámbielos o revíselos en su próxima revisión.",
      nextCheck: "Próxima revisión",
      nextCheckHint: "Revise sus kits cuando cambie la hora en primavera y en otoño.",
      days: "Días en casa",
      daysHint: "Las cantidades y los costos de la caja para quedarse en casa siguen este número. Trate de tener al menos 7.",
      daysError: "Escriba un número de días, como 7 o 14.",
      daysNote: "Escriba cualquier número de días, como 7 o 14.",
      people: "Su gente",
      peopleHintBags: "Cámbielos por los nombres reales. Dan nombre a las columnas de cada persona y llenan las listas de Quién.",
      peopleHint: "Agregue nombres aquí. Aparecen en las listas de Quién en las otras pestañas.",
      knowYourHome: "Conozca su casa",
      notes: "Notas y recordatorios",
      howTo: "Cómo usar esta hoja",
      steps: {
        who: "Escoja quién hace cada cosa en la columna Quién.",
        statusBags:
          "¿Está empacando una mochila? Cambie la columna de esa persona a Hecho. Para todo lo demás, cambie el Estado a Lo tengo. ¿Terminó una tarea? Cámbiela a Hecho.",
        status: "Cuando consiga algo, cambie el Estado a Lo tengo. ¿Terminó una tarea? Cámbiela a Hecho.",
        expiring: (sheet) =>
          `En la pestaña ${sheet}, escriba la fecha en que empacó las cosas o la fecha impresa en ellas. Aviso le muestra lo que toca.`,
        checkUp: (now, soon) => `En cada revisión, cambie o revise todo lo que diga ${now} o ${soon}.`,
        neighbors: (sheet) => `Use la pestaña ${sheet} para los números que intercambie con gente cercana.`,
        card: (sheet) => ` Imprima la pestaña ${sheet} y péguela dentro de la tapa de su caja.`,
      },
      alerts: "Alertas de emergencia",
      signUp: (name) => `Inscríbase a ${name}`,
    },
  },
};
