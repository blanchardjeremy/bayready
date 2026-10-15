import type { Translation } from "../types";
import type { wizard as en } from "../en/wizard";

export const wizard: Translation<typeof en> = {
  titles: {
    county: "¿En qué condado vive?",
    hazards: "¿Para cuáles de estas emergencias quiere prepararse?",
    household: "¿Para quiénes se está preparando?",
    needs: "¿Alguien depende de alguna de estas cosas?",
    have: "Toque lo que ya tiene en casa",
    kit: "¿Qué le gustaría preparar?",
    home: "¿En qué tipo de vivienda vive?",
    car: "¿Normalmente tiene carro?",
    level: "¿Cuánto quiere hacer por ahora?",
    days: "¿Para cuántos días en casa quiere tener provisiones?",
    power: "Si se va la luz por varios días, ¿qué es lo más importante?",
    start: "¿Cuándo podría dar su primer paso?",
  },
  pageTitle: (title) => `${title} – Bay Ready`,

  stepOf: (n, total) => `Paso ${n} de ${total}`,
  advancedOf: (n, total) => `Pregunta avanzada ${n} de ${total}`,
  optional: "(opcional)",
  whyWeAsk: "Por qué preguntamos",
  back: "Atrás",
  backToList: "Volver a mi lista",
  skip: "Omitir",
  continue: "Continuar",

  county: {
    hint: "Lo usamos para sugerir los riesgos más probables y el sistema de alertas de su zona.",
    other: "En otro lugar, o no sé",
    private: "Prefiero no decirlo",
    alertTip: {
      before: (county) => `El condado de ${county} envía mensajes de texto y llamadas de emergencia gratis por medio de `,
      after: ". Inscribirse toma dos minutos y es uno de los pasos gratis más útiles. Puede hacerlo ahora o después desde su lista.",
    },
    noAlertTip:
      "Todos los condados del Área de la Bahía tienen un sistema gratis de alertas de emergencia. Si elige su condado, le ponemos el enlace en su lista.",
  },

  zip: {
    label: "Su código postal (ZIP)",
    why: "Nos ayuda a saber qué compañía le da el agua y si está cerca de una zona de tsunami. Se queda en este dispositivo.",
    inCounty: (county, picked) => `Está en el condado de ${county}${picked ? ", así que lo marcamos abajo" : ""}.`,
    unknown: "Ese código postal no está en nuestra lista del Área de la Bahía. No pasa nada. Solo elija su condado abajo.",
  },

  hazards: {
    hintCustom: "Estas son sus opciones. Cambie lo que quiera.",
    hintCounty: (county) => `Marcamos las más comunes en el condado de ${county}. Cambie lo que quiera.`,
    hintBayArea: "Marcamos las más comunes en el Área de la Bahía. Cambie lo que quiera.",
    keepOne: "Deje por lo menos una marcada. Terremoto es un buen punto de partida.",
    zipTsunami: "Parte de su código postal está en una zona de riesgo de tsunami señalada en los mapas.",
    reset: "¿Tiene dudas? Vuelva a nuestras sugerencias",
    tip: {
      before:
        "Un buen kit sirve para casi todo esto. Prepararse para un terremoto ya hace la mayor parte del trabajo para lo demás. Para revisar los riesgos de inundación, incendio, tsunami y terremoto en su dirección exacta, búsquela en ",
      after: " de Cal OES.",
    },
  },

  household: {
    hint: "Cuente a todas las personas que cuidaría en una emergencia: con quienes vive, su familia, alguien que se queda seguido.",
    why: "Así calculamos cuánta agua y comida necesita. No preguntamos edades, los nombres son opcionales y nada sale de este dispositivo.",
    adults: "Adultos y adolescentes",
    kids: "Niños",
    kidsHint: "De 2 a 12 años",
    babies: "Bebés y niños pequeños",
    babiesHint: "Menores de 2 años",
    dogs: "Perros",
    cats: "Gatos",
    otherPets: "Otras mascotas",
    names: "Nombres",
    namesNote:
      "Útil si va a preparar una mochila de emergencia para cada persona, o a repartir tareas con quienes vive. Los nombres se quedan en este dispositivo, y se incluyen si comparte su lista.",
  },

  names: {
    you: "Usted",
    adult: (n) => `Adulto ${n}`,
    kid: (n) => `Niño ${n}`,
    me: "Yo",
  },

  needs: {
    hint: "Marque todas las que apliquen.",
    why: "Así su lista incluye los repuestos correctos, como lentes de repuesto o una batería para un CPAP. Se guarda en este dispositivo, y solo sale de aquí si comparte su lista.",
    groups: {
      health: "Salud y medicinas",
      getAround: "Movilidad y comunicación",
      other: "Otro",
    },
    options: {
      meds: { label: "Medicinas recetadas de todos los días" },
      "cold-meds": { label: "Medicinas que deben mantenerse frías", desc: "Como la insulina" },
      "power-device": {
        label: "Un aparato médico que necesita electricidad",
        desc: "Un CPAP, una silla de ruedas eléctrica o una bomba",
      },
      oxygen: { label: "Oxígeno en casa", desc: "Un concentrador o tanques" },
      dialysis: { label: "Diálisis" },
      pregnancy: { label: "Embarazo" },
      diet: { label: "Una dieta especial, alergia a alimentos o fórmula para bebé" },
      "vision-hearing": { label: "Lentes, lentes de contacto o aparatos auditivos" },
      mobility: { label: "Una ayuda para caminar o moverse, o dificultad con las escaleras" },
      communication: {
        label: "Dificultad para oír o ver las alertas, o para hablar",
        desc: "Personas sordas, con pérdida auditiva, ciegas, con baja visión o con una discapacidad del habla",
      },
      cognitive: {
        label: "Dificultad para entender o recordar en una crisis",
        desc: "Como demencia, autismo o una lesión cerebral",
      },
      caregiver: {
        label: "Alguien que necesita ayuda con su cuidado diario",
        desc: "De la familia o de un asistente de salud en el hogar",
      },
      "service-animal": { label: "Un animal de servicio" },
    },
    none: "Ninguna de estas",
    noneDesc: "Quita las opciones de arriba",
    private: "Prefiero no decirlo",
    privateDesc: "Quita las opciones de arriba. Su lista incluirá artículos de salud generales.",
    clearedOthers: (count, choice) =>
      `Desmarcamos ${count === 1 ? "su otra opción" : "sus otras opciones"}, porque eligió “${choice}”.`,
    clearedOne: (choice) => `Desmarcamos “${choice}”.`,
    medicalBaseline: {
      before: "Si depende de equipo médico eléctrico, pregúntele a PG&E por su ",
      link: "programa Medical Baseline",
      url: "https://www.pge.com/es/account/billing-and-assistance/financial-assistance/medical-baseline-program.html",
      after: ". Puede bajar su factura y le avisan con más tiempo antes de los cortes de luz planeados.",
    },
  },

  have: {
    hint: "No tiene que estar empacado todavía. Lo contamos para que no lo compre dos veces.",
    tip: "Ya va por buen camino. Casi todo un kit son cosas de todos los días.",
  },

  kit: {
    hint: "Puede hacer las dos, y puede cambiar esto después.",
    error: "Elija una opción para continuar. Si tiene dudas, elija “Todavía no sé”.",
    options: {
      stay: {
        label: "Caja para quedarse en casa",
        desc: "Provisiones para pasar varios días en casa sin luz ni agua de la llave.",
      },
      go: { label: "Mochila de emergencia", desc: "Una mochila lista para agarrar si tiene que salir rápido." },
      both: { label: "Las dos", desc: "Las ponemos por separado en su lista para que pueda hacer una a la vez." },
      unsure: { label: "Todavía no sé", desc: "Le sugerimos una según lo que nos ha contado." },
    },
    recommended: "Recomendado",
    suggestion: {
      both: "Nuestra sugerencia: una caja para quedarse en casa y una mochila de emergencia",
      stay: "Nuestra sugerencia: empiece con una caja para quedarse en casa",
    },
    suggestionWhy: {
      both: "Eligió un riesgo en el que quizás tenga que salir rápido, así que también vale la pena tener una mochila de emergencia.",
      stay: "Con terremotos y apagones, lo más probable es que se quede en casa. Puede agregar una mochila de emergencia después.",
    },
    soundsGood: "Me parece bien",
    justStay: "Solo la caja para quedarse en casa",
    wantBoth: "Quiero las dos",
    tip: "Después de un terremoto fuerte, la mayoría de los hogares del Área de la Bahía se quedarán en casa. Con incendios forestales y alertas de tsunami es cuando la gente tiene que salir rápido.",
  },

  home: {
    hint: "No importa si renta o si la vivienda es suya. Cuando algo normalmente le toca al dueño de la vivienda, su lista lo dirá.",
    why: "Cambia qué arreglos de la casa aparecen en su lista, y si importan las escaleras cuando los elevadores no funcionan.",
    options: {
      house: "Casa o townhouse",
      "apartment-low": "Apartamento o condominio, hasta 4 pisos",
      "apartment-high": "Apartamento o condominio, 5 pisos o más",
      other: "Otro tipo, o depende",
    },
  },

  car: {
    why: "Cambia cómo saldría si tiene que irse rápido. Sin carro, le ayudamos a planear otra forma. Con carro, el nivel Avanzado agrega un kit pequeño para el carro.",
    options: { yes: "Sí", sometimes: "A veces", no: "No" },
  },

  level: {
    hint: "Puede cambiar cuando quiera sin perder su progreso.",
    basics: "Lo básico",
    startHere: "Empiece aquí",
    basicsDesc:
      "Lo esencial para la mayoría de las situaciones, con agua y comida para una semana en casa, como recomiendan las agencias del Área de la Bahía.",
    basicsFree: "Sus primeros pasos son gratis. Lo demás son unas cuantas compras, repartidas como le convenga.",
    advanced: "Avanzado",
    advancedDesc: (questions) =>
      `Provisiones para dos semanas, repuestos y equipo extra. Agrega ${questions} preguntas cortas.`,
    stats: (things, tasks, cost) =>
      `Unas ${things} cosas para juntar o comprar y ${tasks} planes y pendientes, más o menos ${cost}`,
  },

  days: {
    hint: "Después de un terremoto fuerte en la falla de Hayward, el USGS calcula que muchas casas del Este de la Bahía podrían quedarse sin agua de la llave unas 6 semanas.",
    seven: "7 días",
    sevenDesc: "Lo mínimo que recomiendan San Francisco y EBMUD. Cal OES dice por lo menos 3 días, y una semana es mejor.",
    fourteen: "14 días",
    fourteenDesc: "Lo que sugieren los CDC y la Cruz Roja para la casa. Vale la pena si tiene espacio.",
  },

  power: {
    hint: "Elija las que quiera. Agregaremos equipo para cada una.",
    options: {
      cook: { label: "Cocinar sin luz", desc: "Una estufa de campamento para usar afuera." },
      charge: {
        label: "Mantener cargados los celulares y aparatos",
        desc: "Una estación de energía portátil o un panel solar.",
      },
      cold: { label: "Mantener fríos los alimentos o las medicinas", desc: "Hieleras, bolsas de hielo y un plan." },
    },
  },

  start: {
    continue: "Ver mi lista",
    why: "Lo usamos para ordenar su lista. Nunca quita nada.",
    options: {
      weekend: "Este fin de semana",
      weeks: "En un par de semanas",
      month: "Este mes",
      unsure: "Todavía no sé",
    },
    budgetHeading: "Más o menos, ¿cuánto quiere gastar para empezar?",
    budget: {
      "0": { label: "Usar primero lo que tengo", desc: "Los pasos gratis van primero." },
      "50": { label: "Menos de $50" },
      "150": { label: "De $50 a $150" },
      more: { label: "Más de $150" },
      unsure: { label: "No sé" },
    },
  },

  controls: {
    goodToKnow: "Dato útil",
    opensInNewTab: "(se abre en una pestaña nueva)",
    removeOne: (label) => `Quitar uno: ${label}`,
    addOne: (label) => `Agregar uno: ${label}`,
  },
};
