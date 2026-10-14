import type { Translation } from "../types";
import type { pages as en } from "../en/pages";

export const pages: Translation<typeof en> = {
  home: {
    title: "Bay Ready: haga su lista de emergencia",
    heading: "Haga su lista de emergencia para el Área de la Bahía",
    intro:
      "Conteste unas preguntas cortas y reciba una lista a la medida de su hogar: una caja en casa, una mochila junto a la puerta, o las dos. Empieza con lo esencial y con lo que ya tiene.",
    footnote:
      "Unos 10 pasos cortos, cada uno con una respuesta sugerida. No tiene que registrarse. Sus respuestas se quedan en este dispositivo.",
    howItWorks: "Cómo funciona",
    points: {
      here: {
        title: "Hecha para aquí",
        body: "Terremotos, humo, cortes de luz planeados, calor, tormentas. Elija los que importan donde usted vive.",
      },
      basics: {
        title: "Primero lo básico",
        body: "Empiece con lo esencial y agua y comida para una semana, como recomiendan las agencias del Área de la Bahía. Cuando esté listo, puede ir más allá: dos semanas y equipo extra.",
      },
      amounts: {
        title: "Cantidades reales",
        body: "Agua, comida y cosas para sus mascotas, calculadas para su hogar, con costos aproximados y los pasos gratis primero.",
      },
    },
    example: {
      label: "Ejemplo de una lista terminada",
      tag: "Lo esencial",
      who: "2 adultos, 1 perro. Lo primero que hay que conseguir para la caja para quedarse en casa.",
      rows: {
        water: { name: "Agua potable", qty: "18 galones" },
        protein: { name: "Proteína enlatada: frijoles, atún, pollo o chili", qty: "14 latas" },
        opener: { name: "Abrelatas manual", qty: "1 abrelatas" },
        light: { name: "Linterna o lámpara de cabeza", qty: "2 linternas" },
        bucket: { name: "Cubeta con tapa, para un baño de emergencia", qty: "1 cubeta" },
        petFood: { name: "Comida para mascotas", qty: "7 días para 1 mascota" },
      },
      more: "y 4 cosas esenciales más",
      progress: "Lleva 2 de 10 cosas esenciales",
      then: "Después, su lista completa, poco a poco.",
      caption:
        "Una lista de ejemplo: lo esencial primero, con cantidades para el hogar y lo que ya tiene marcado.",
    },
    actions: {
      openList: "Abrir mi lista",
      changeAnswers: "Cambiar mis respuestas",
      happeningNow: "¿Está pasando ahora? Vea qué hacer primero",
      start: "Empezar",
      starter: "Saltar las preguntas y ver una lista básica",
    },
  },

  about: {
    title: "Fuentes – Bay Ready",
    heading: "De dónde sale esto",
    intro:
      "Las listas se basan en consejos públicos de los condados del Área de la Bahía, las compañías de agua, el Estado de California, FEMA y los CDC. Cuando las agencias no están de acuerdo, lo decimos y usamos el número más prudente. Por ejemplo, las agencias del Área de la Bahía recomiendan provisiones para una semana en casa, y FEMA dice por lo menos 3 días. Nosotros usamos una semana. Casi todas las agencias dicen 1 galón de agua por persona al día, pero EBMUD les pide 2 a los hogares del Este de la Bahía, así que las listas del Este de la Bahía usan 2.",
    neighborsLead: "Por qué los vecinos están en la lista.",
    neighbors:
      "Después del terremoto de Kobe en 1995, a la mayoría de las personas que sacaron de los escombros las rescataron sus familias y vecinos, no los equipos de rescate. En la ola de calor de Chicago de 1995, los barrios donde la gente se conocía tuvieron muchas menos muertes. Las provisiones importan. La gente a su alrededor, también.",
    privacy:
      "Los precios son cálculos aproximados para ayudarle a planear, no cotizaciones. Nada de lo que escribe sale de su navegador. Sus respuestas se guardan en este dispositivo, y los enlaces para compartir las llevan dentro del mismo enlace.",
    sourcesLanguage: "La mayoría de estas fuentes están en inglés. Listos California y Ready.gov también tienen páginas en español.",
    groups: {
      bayArea: "Consejos del Área de la Bahía",
      state: "Estatales y nacionales",
      community: "Vecinos y comunidad",
      power: "Electricidad y necesidades de acceso",
    },
    sources: {
      readysf: "Las listas oficiales de San Francisco. Provisiones para una semana en casa, más o menos.",
      ebmud: "Recomienda 2 galones por persona al día durante por lo menos 7 días, y cuánto cloro usar para tratar el agua.",
      sfpuc: "1 galón por persona al día, y cómo tratar el agua.",
      haywired: "Un modelo de un terremoto de magnitud 7.0 en la falla de Hayward, con cortes de agua en el Este de la Bahía de unas 6 semanas en promedio.",
      genasys: "Busque su zona de evacuación.",
      tsunamiMaps: "Vea si su casa, trabajo o escuela está en una zona de tsunami.",
      readyKit: "La lista básica de provisiones para desastres de FEMA.",
      listos: "Guías de preparación de Cal OES en muchos idiomas, incluido el español.",
      cdcWater: "Cómo guardar y tratar el agua.",
      airnow: "Cuartos con aire limpio, mascarillas N95 y purificadores de aire hechos en casa.",
      eca: "Los siete pasos para la seguridad en terremotos y los kits para junto a la cama.",
      braceBolt: "Ayuda económica para reforzar casas antiguas contra terremotos.",
      nert: "Capacitación gratis de San Francisco para responder a emergencias en su vecindario.",
      core: "Clases gratis de Oakland para prepararse y responder a emergencias.",
      mapYourNeighborhood: "Una guía corta para preparar su cuadra entre todos.",
      cert: "Capacitación gratis para responder a emergencias en su comunidad, en todo el Área de la Bahía.",
      blockParty: "Un kit para conocer a sus vecinos y planear juntos.",
      klinenberg: "Los barrios donde la gente se conocía tuvieron muchas menos muertes.",
      pgeAlerts: "Reciba avisos antes de los cortes de luz planeados. No necesita cuenta de PG&E.",
      medicalBaseline: "Para personas que dependen de aparatos médicos eléctricos.",
      ddar: "Baterías de respaldo y apoyo para personas con discapacidades durante los cortes de luz.",
      readyDisability: "Cómo planear para necesidades de acceso y funcionales.",
      readyPets: "Kits y planes para animales.",
    },
  },

  sign: {
    title: "Letrero de OK / HELP para la ventana – Bay Ready",
    heading: "Letrero de OK / HELP para la ventana",
    intro: [
      "Este letrero es para sus vecinos. Después de un terremoto fuerte, la gente de su cuadra muchas veces es la primera ayuda que llega. Un letrero en una ventana que da a la calle les dice quién necesita ayuda primero, para que puedan pasar de largo las casas donde todos están bien.",
      "Funciona mejor si se pusieron de acuerdo antes en que alguien recorrerá la cuadra después de un terremoto. Muéstrele este letrero a los vecinos que conoce, para que todos sepan buscarlo.",
      "Imprima esta página, córtela o dóblela por la mitad y guárdela junto a la puerta de entrada con un poco de cinta adhesiva. Ponga HELP (ayuda) aunque no pueda llegar a la puerta.",
    ],
    printNote: "Se imprime en una sola página. No hay nada que llenar.",
    ok: "Estamos bien. No necesitamos ayuda.",
    help: "Necesitamos ayuda.",
  },
};
