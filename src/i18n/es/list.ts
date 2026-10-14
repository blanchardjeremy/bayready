import type { Translation } from "../types";
import type { list as en } from "../en/list";
import { BAY_READY_URL } from "@/lib/urls";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const list: Translation<typeof en> = {
  pageTitle: "Su lista de emergencia – Bay Ready",
  locale: "es-US",
  credit: `Hecho con Bay Ready, un planificador gratis de kits de emergencia para el Área de la Bahía: ${BAY_READY_URL}`,

  shared: {
    title: "Está viendo una lista que se abrió desde un enlace.",
    note: "Los cambios no se guardan hasta que la haga su lista.",
    makeMine: "Hacerla mi lista",
    buildOwn: "Hacer mi propia lista",
  },

  header: {
    title: "Su lista de emergencia",
    planningFor: "Plan para",
    yourAnswers: "Sus respuestas",
    changeAnswers: "Cambiar respuestas",
    happeningNow: "¿Está pasando ahora? Vea qué hacer primero",
    badge: (label, value) => `${label}: ${value}. Cambiar`,
    labels: { building: "Kits", for: "Para", hazards: "Riesgos", days: "Días", county: "Condado" },
    adults: (n) => plural(n, "adulto", "adultos"),
    kids: (n) => plural(n, "niño", "niños"),
    babies: (n) => plural(n, "bebé", "bebés"),
    dogs: (n) => plural(n, "perro", "perros"),
    cats: (n) => plural(n, "gato", "gatos"),
    otherPets: (n) => plural(n, "otra mascota", "otras mascotas"),
    daysAtHome: (n) => `${n} días en casa`,
    county: (name) => `Condado de ${name}`,
  },

  level: {
    legend: "Tamaño de la lista",
    basics: "Lo básico",
    advanced: "Avanzado",
    core: "Lo principal",
    plusExtras: "Con extras",
    oneWeek: "1 semana",
    withExtras: (weeks) => `${weeks === 1 ? "1 semana" : `${weeks} semanas`} + extras`,
  },

  progress: {
    count: (done, total, tasks) => `${done} de ${total} ${tasks ? "hechas" : "listas"}`,
    label: (kit) => `Avance: ${kit}`,
    already: (have, total) => `Ya tiene ${have} de las ${total} cosas de esta lista.`,
  },

  startHere: {
    allDone: "Ya hizo los pasos gratis. ¡Buen trabajo!",
    weekend: "Empiece aquí este fin de semana",
    title: "Empiece aquí",
    desc: "Son gratis. La mayoría toman de 5 a 15 minutos.",
  },

  essentials: {
    title: "Lo esencial",
    doneTitle: "Ya tiene lo esencial",
    intro:
      "Consiga esto primero y guárdelo todo junto. Es lo más importante en los primeros días después de un terremoto, cuando las tiendas están cerradas y puede faltar el agua.",
    count: (done, total) => `${done} de ${total}`,
    soFar: "hasta ahora",
    done: "listas",
    progressLabel: "Lo esencial",
    doneHeadline: "Buen trabajo. Ya tiene lo más importante.",
    doneBody:
      "Guárdelo todo junto donde pueda alcanzarlo después de un terremoto, como un clóset cerca de la puerta, no al fondo del garaje. Luego siga con el resto de su lista, poco a poco.",
    seeThem: "Ver lo esencial",
    overBudget: (dollars) =>
      `Cada una de estas cosas cuesta más de unos $${dollars}. Empiece con lo que tiene y agréguelas cuando pueda.`,
    runsOut: (dollars, spent) =>
      `Sus $${dollars} se acaban más o menos aquí. Hasta aquí son unos $${spent}. Algunas de abajo tienen formas gratis de empezar.`,
    budgetIntro: (dollars) =>
      `Dijo que tiene unos $${dollars} para empezar, así que aquí están en el orden en que nosotros las conseguiríamos.`,
    coversAll: (dollars) => `Con unos $${dollars} le debe alcanzar para todas.`,
    coversAbove: (dollars) => `Con unos $${dollars} le alcanza para las que están arriba de la línea.`,
    rest: (cost) => `El resto de lo esencial: unos ${cost} más, cuando pueda.`,
    zeroIntro:
      "Dijo que por ahora prefiere no gastar nada. Está bien. Empiece con lo que es gratis o lo que ya tiene en casa. Le marcamos formas gratis de cubrir algunas de estas cosas.",
    stillToGet: (cost) => `Falta conseguir: unos ${cost}.`,
    freeWays: {
      water: "Forma gratis: llene botellas limpias de refresco con agua de la llave. No use galones de leche ni de jugo.",
      "water-go": "Forma gratis: vuelva a llenar una botella de agua que ya tenga.",
      food: "Forma gratis: aparte unas latas de su alacena y coma primero las más viejas.",
      "food-go": "Forma gratis: empaque barras de granola, nueces o galletas saladas de su alacena.",
      "can-opener": "Forma gratis: busque en el cajón de la cocina. El abrelatas que ya tiene sirve.",
      flashlights: "Forma gratis: junte las linternas que ya tiene y revise las pilas.",
      toilet: "Forma gratis: ponga una bolsa de basura gruesa en su propio inodoro en vez de usar una cubeta.",
      "first-aid": "Forma gratis: junte en una bolsa las curitas y medicinas que ya tiene.",
      "docs-copies": "Forma gratis: tómeles fotos con su celular a sus identificaciones y tarjetas de seguro.",
      backpack: "Forma gratis: use cualquier mochila o maleta que ya tenga.",
      bin: "Forma gratis: empiece con una caja resistente o un cesto de ropa.",
    },
  },

  exports: {
    copyLink: "Copiar enlace para compartir",
    linkCopied: "Enlace copiado",
    copyText: "Copiar como texto",
    print: "Imprimir",
    preparing: "Preparándolo…",
    pdf: "Descargar PDF",
    makingPdf: "Haciendo el PDF…",
    xlsx: "Descargar hoja de cálculo",
    makingXlsx: "Haciendo la hoja de cálculo…",
    short: "Versión corta",
    shortDetail: "(su plan, la tarjeta y lo esencial)",
    everything: "Todo",
    everythingDetail: "(la lista completa y el registro de revisiones)",
  },

  flash: {
    copyFailed: "No se pudo copiar. Su navegador lo bloqueó.",
    failed: "Algo salió mal. Intente de nuevo.",
    linkCopied: "Enlace copiado. Cualquier persona que lo tenga puede ver esta lista.",
    textCopied: "Lista copiada como texto.",
    pdfDone: "PDF descargado.",
    xlsxDone: "Hoja de cálculo descargada. Se abre en Google Sheets, Excel o Numbers.",
    shopCopied: "Lista de compras copiada.",
  },

  together: {
    lead: "No tiene que hacer esto sin ayuda.",
    body: "Los vecinos que se conocen salen adelante mejor en un desastre, y compartir cuesta menos que comprarlo todo por su cuenta. Empiece por intercambiar números con un vecino, y mándele su lista.",
  },

  fullList: {
    title: "Su lista completa",
    count: (n) => `· ${plural(n, "cosa", "cosas")}`,
    intro:
      "Todo para su hogar, con lo esencial marcado. No hay prisa: avance poco a poco y omita lo que no vaya con su vida.",
    more: (n) => `Cuando quiera, hay ${n} ideas más al final de cada kit.`,
    viewsLabel: "Cómo ver su lista",
    views: { kits: "Por kit", shop: "Lista de compras", plan: "Paso a paso" },
  },

  kit: {
    stillToGet: (cost) => `Falta conseguir: ${cost}`,
    packBags: (n) => `Prepare ${n} mochilas, una para cada persona que pueda cargar una.`,
    babies: "Las cosas de los bebés van en la mochila de un adulto.",
    shownAbove: (n) =>
      n === 1 ? "Más el paso gratis de Empiece aquí, arriba." : `Más los ${n} pasos gratis de Empiece aquí, arriba.`,
    stayWithGo:
      "Sus mochilas de emergencia también están en casa, así que esta caja solo agrega lo que ellas no cubren: más agua, comida y cosas para una estadía más larga.",
    secondBag:
      "Si pasa mucho tiempo en el trabajo o en casa de un ser querido, vale la pena tener ahí una segunda mochila pequeña.",
    mobility:
      "Que la mochila sea ligera y esté junto a la salida que usaría. Una maleta pequeña con ruedas puede ser más fácil que una mochila.",
    everyBag: "En cada mochila",
    everyBagDesc: (names) => `Una para cada quien: ${names}. Toque un nombre cuando esa mochila ya lo tenga.`,
    oneForGroup: "Una para todo el grupo",
    oneForGroupDesc: "Solo necesitan una de estas cosas. Decidan en qué mochila va cada una.",
    essentials: "Lo esencial",
    moreReady: (n) => `${n} más para cuando pueda`,
    moreDetail: (cost) => `Más días de provisiones, cosas de respaldo y equipo extra. Unos ${cost}.`,
    switchAdvanced: "Cambie a Avanzado",
    switchRest: "para agregarlas a su lista principal.",
    showSkipped: (n) => `Ver ${n} ${n === 1 ? "omitida" : "omitidas"}`,
    skippedNote: "Aquí quedan guardadas. Recupere cualquiera cuando quiera.",
    join: (names) =>
      names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`,
  },

  shop: {
    nothing: "No falta nada por comprar. Todo en su lista está marcado como que ya lo tiene, u omitido.",
    allBought: "Ya compró todo. ¡Buen trabajo!",
    toBuy: (n) => `${plural(n, "cosa", "cosas")} por comprar,`,
    roughly: (cost) => `unos ${cost} en total.`,
    copy: "Copiar lista de compras",
    hint: "Márquelas mientras compra. En su lista quedan marcadas como que ya las tiene.",
    gotIt: "Ya lo tengo",
  },

  plan: {
    step: (n) => `Paso ${n}`,
    allDone: "Todo hecho",
    toGo: (n, cost) => `Faltan ${n} · ${cost}`,
    free: "Para hacer o juntar, gratis",
    buy: "Para comprar",
  },

  firstHour: {
    title: "Cuando ocurra",
    desc: "Imprima esta tarjeta y péguela con cinta por dentro de la tapa de su caja.",
    print: "Imprimir esta tarjeta",
  },

  fresh: {
    title: "Manténgalo al día",
    body: "La comida, el agua, las medicinas y las pilas se echan a perder con el tiempo. Revise sus kits dos veces al año, cuando se cambia la hora en primavera y en el ShakeOut de octubre: vea las fechas, cambie el agua guardada, pruebe las linternas y el radio, surta sus recetas y cambie la ropa de los niños que ya crecieron. Un hábito fácil: coma la comida más vieja de su caja y reemplácela en su próxima compra.",
    paper:
      "Lleve la cuenta en papel, dentro de su caja. El registro de revisiones dice qué revisar en su hogar. Cada vez, escriba la fecha y cuándo toca la próxima en el siguiente cuadro vacío, así no hay nada que tachar.",
    print: "Imprimir el registro de revisiones",
    reminders: "Agregar los recordatorios de dos veces al año",
    example: {
      badge: "Ejemplo",
      label: "Ejemplo: un registro de revisiones impreso, con fechas escritas a mano",
      title: "Manténgalo al día",
      item: "Artículo",
      replace: "Cambiar",
      eachCheck: "Cada revisión",
      on: "Día",
      next: "Próx.",
      beans: "Frijoles en lata",
      every24: "Cada 24 meses",
      tapWater: "Agua de la llave",
      every6: "Cada 6 meses",
      lights: "Linternas y radio",
      meds: "Medicinas de diario",
      byDate: "Según la fecha",
      granola: "Barras de granola",
      caption:
        "Un ejemplo inventado. El suyo muestra lo que hay en sus kits, con renglones en blanco para su propia comida.",
    },
  },

  clear: {
    prompt: "¿Usa un celular o una computadora compartida?",
    button: "Borrar todo en este dispositivo",
    title: "¿Borrar todo en este dispositivo?",
    confirm: "Borrar todo",
    cancel: "Cancelar",
    body: "Esto borra de este navegador sus respuestas, sus marcas y la información de Conozca su casa. No se puede deshacer.",
    keep: "Para guardar su lista, primero copie su enlace. La información de Conozca su casa no va en el enlace.",
    copyLink: "Copiar el enlace de mi lista",
  },

  replace: {
    title: "¿Reemplazar su lista?",
    confirm: "Reemplazar mi lista",
    cancel: "Quedarme con mi lista",
    body: "Este dispositivo ya tiene una lista. Si hace suya esta lista, reemplaza la otra y sus marcas. Su información de Conozca su casa se queda.",
    copyLink: "Copiar primero el enlace de mi lista actual",
  },

  copyLink: {
    copied: "Enlace copiado",
    failed: "Su navegador no nos dejó copiarlo.",
  },

  names: {
    title: "Nombres",
    desc: "Se muestran en su lista y en la hoja de cálculo. Si deja uno en blanco, usamos Yo, Adulto 2, etc.",
    done: "Listo",
  },

  empty: {
    cleared: "Se borró todo en este dispositivo.",
    titleApp: "Traiga su lista aquí",
    title: "Todavía no ha hecho una lista",
    introApp: "Esta app de la pantalla de inicio empieza vacía. Pegue abajo el enlace de su lista, o haga una nueva.",
    intro:
      "Conteste unas preguntas cortas para tener una lista a la medida de su hogar, o empiece con una lista sencilla para una persona y cámbiela después.",
    before:
      "¿Ya hizo una lista antes? Algunos navegadores borran las listas guardadas después de un tiempo. Abra el enlace que guardó para recuperarla, o péguelo abajo.",
    start: "Empezar las preguntas",
    starter: "Ver una lista para empezar",
    pasteLabel: "Pegue el enlace de su lista",
    open: "Abrirla",
    error: "Eso no parece un enlace de una lista de Bay Ready. Debe terminar con un # y un código largo.",
  },

  text: {
    title: "Mi lista de emergencia (Bay Ready)",
    alerts: (name, url) => `Alertas de emergencia: ${name} ${url}`,
  },

  row: {
    haveIt: "Lo tengo",
    done: "Hecho",
    essential: "Esencial",
    forHazards: (hazards) => `Para ${hazards}`,
    whoDone: (item) => `Quién ya lo hizo: ${item}`,
    editNames: "Editar nombres",
    why: "Por qué",
    examples: "Ejemplos:",
    notEndorsements: ". Son solo ejemplos, no recomendaciones.",
    bringBack: "Recuperar",
    bringBackLabel: (item) => `Recuperar ${item}`,
    skip: "Omitir",
    skipTooltip: "Omitir por ahora",
    skipLabel: (item) => `Omitir ${item} por ahora`,
    waterNote: "Dijo que tiene algo de agua. Revise que tenga la cantidad completa.",
  },

  reveal: { show: "Ver", hide: "Ocultar" },

  save: {
    title: "Guarde su propia copia",
    hide: "Ocultar esto",
    body: "No confíe en este sitio para guardar su lista. Solo se guarda en este navegador, y puede borrarse sin aviso: si borra su historial, cambia de celular o, en iPhone, si no entra en más o menos una semana. Guarde una copia en otro lugar.",
    printTitle: "Imprímala o guarde el PDF",
    printBody: "Guarda todo, incluida la información de Conozca su casa y sus notas. Ponga una copia impresa en su caja.",
    print: "Imprimir",
    pdf: "Descargar PDF",
    linkTitle: "Copie el enlace",
    linkBody: "Recupera sus respuestas y marcas en cualquier celular o computadora. No incluye Conozca su casa ni sus notas.",
    copy: "Copiar enlace",
    copied: "Enlace copiado",
    email: "Mandármelo por correo",
    failed: "Su navegador no nos dejó copiarlo. Pruebe la opción de correo.",
    iphoneTitle: "En iPhone: también puede agregarla a su pantalla de inicio",
    iphoneBody:
      "En Safari, toque el botón Compartir y luego Agregar a inicio. La app de la pantalla de inicio guarda su lista y funciona sin conexión. Empieza vacía, así que primero copie su enlace y péguelo cuando abra la app.",
    privacy:
      "El enlace tiene sus respuestas y marcas, incluidos los nombres y las necesidades de salud que haya puesto, así que no lo comparta.",
    mailSubject: "Mi lista de emergencia",
    mailBody: (url) =>
      `Este es el enlace a mi lista de emergencia de Bay Ready. Ábralo para recuperar la lista en cualquier celular o computadora:\n\n${url}\n`,
  },

  shareDialog: {
    copyThis: "Copie este enlace",
    copiedPrivate: "Copiado, sin nombres ni información de salud",
    copied: "Enlace copiado",
    failedNote: "Su navegador no nos dejó copiarlo, así que cópielo de aquí.",
    privateBody:
      "Cualquier persona con este enlace puede ver la lista y lo que está marcado. No incluye nombres ni necesidades de salud.",
    personalBody:
      "Cualquier persona con el enlace puede ver esta lista y lo que está marcado, incluidos los nombres y las necesidades de salud que puso.",
    plainBody: "Cualquier persona con el enlace puede ver esta lista y lo que está marcado.",
    inputLabel: "Enlace para compartir",
    leftOut:
      "La información de Conozca su casa y sus notas se quedan en este dispositivo. Para compartirlas, imprímalas o descargue el PDF o la hoja de cálculo.",
    copyPrivate: "Copiar sin nombres ni información de salud",
    done: "Listo",
  },

  home: {
    printThese: "Imprimir esto para su kit",
    title: "Conozca su casa",
    print: "Imprimir esta información",
    intro:
      "Lo que querrá saber sin tener que pensarlo el día que ocurra. Llénelo mientras hace las tareas de arriba, y luego imprima una copia para su caja y cada mochila. Se guarda en este dispositivo y va en su hoja de cálculo, pero nunca en los enlaces para compartir.",
    notes: "Notas y recordatorios",
    notesPlaceholder:
      "Cualquier otra cosa que valga la pena recordar, como que el radio está en la mochila de Sam, o qué vecino tiene generador.",
    printedIntro:
      "Llene lo que esté en blanco. Guarde una copia en su caja para quedarse en casa y en cada mochila de emergencia.",
    madeWith: `Hecho con Bay Ready: ${BAY_READY_URL}`,
  },

  calendar: {
    add: "Agregar al calendario",
    google: "Google Calendar",
    ical: "Archivo iCal",
    icalOne: "(Apple, Outlook)",
    icalBoth: "(los dos, para Apple u Outlook)",
    newTab: "(se abre en otra pestaña)",
    yourList: (url) => `Su lista: ${url}`,
    firstSteps: {
      filename: "preparacion-emergencias-primeros-pasos.ics",
      title: "Preparación para emergencias: primeros pasos",
    },
    checks: {
      filename: "revisiones-kit-de-emergencia.ics",
      spring: {
        name: "Revisión de primavera",
        title: "Revisión del kit de emergencia (cambio de hora)",
        description:
          "Se cambió la hora, así que toca la revisión de primavera de su kit. Vea las fechas de la comida, el agua y las medicinas. Cambie el agua de la llave que tiene guardada. Pruebe las linternas y el radio, y cambie las pilas. Cambie la ropa de los niños que ya crecieron.",
      },
      shakeOut: {
        name: "Revisión del ShakeOut",
        title: "Great ShakeOut: simulacro y revisión del kit",
        description:
          "Hoy es el Great ShakeOut. Practique Agáchese, cúbrase y sujétese con todos en casa. Luego revise su kit: las fechas de la comida, el agua y las medicinas, las pilas y su plan familiar.",
      },
    },
  },
};
