/**
 * The home page, Sources, and the OK / HELP sign. The Spanish file next door must
 * match its shape. Page titles here are for the browser tab; the static metadata in
 * each page file is the English one.
 */
export const pages = {
  home: {
    title: "Bay Ready: build your emergency kit list",
    heading: "Build your Bay Area emergency kit list",
    intro:
      "Answer some short questions and get a list sized for your household, for a bin at home, a bag by the door, or both. It starts with the essentials and what you already have.",
    footnote: "About 10 short steps, each with a sensible default. No sign-up. Your answers stay on this device.",
    howItWorks: "How it works",
    points: {
      here: {
        title: "Made for here",
        body: "Earthquakes, smoke, planned power shutoffs, heat, storms. Pick the ones that matter where you live.",
      },
      basics: {
        title: "Basics first",
        body: "Start with the essentials and a week of water and food, as Bay Area agencies recommend. Go further, to two weeks and extra gear, when you're ready.",
      },
      amounts: {
        title: "Real amounts",
        body: "Water, food, and pet supplies worked out for your household, with rough costs and free steps at the top.",
      },
    },
    /** The sample list beside the heading: the essentials for 2 adults and a dog. */
    example: {
      label: "Example of a finished list",
      tag: "The essentials",
      who: "2 adults, 1 dog. What to get first for the stay-at-home bin.",
      rows: {
        water: { name: "Drinking water", qty: "18 gallons" },
        protein: { name: "Canned protein: beans, tuna, chicken, or chili", qty: "14 cans" },
        opener: { name: "Manual can opener", qty: "1 opener" },
        light: { name: "Flashlight or headlamp", qty: "2 lights" },
        bucket: { name: "Bucket with a lid, for an emergency toilet", qty: "1 bucket" },
        petFood: { name: "Pet food", qty: "7 days for 1 pet" },
      },
      more: "and 4 more essentials",
      progress: "2 of 10 essentials so far",
      then: "Then your full list, a bit at a time.",
      caption:
        "An example list: the essentials first, with amounts sized for the household and what you already have checked off.",
    },
    /** The buttons under the intro. */
    actions: {
      openList: "Open my list",
      changeAnswers: "Change my answers",
      start: "Start",
      starter: "Skip the questions and show a starter list",
    },
  },

  about: {
    title: "Sources – Bay Ready",
    heading: "Where this comes from",
    intro:
      "The lists here are built from public guidance by Bay Area counties, water utilities, the State of California, FEMA, and the CDC. When agencies disagree, we say so and pick the more careful number. For example, Bay Area agencies recommend about a week of supplies at home, while FEMA says at least 3 days. We use a week. Most agencies say 1 gallon of water per person per day, but EBMUD asks East Bay households for 2, so East Bay lists use 2.",
    neighborsLead: "Why neighbors are on the list.",
    neighbors:
      "After the 1995 Kobe earthquake, most people pulled from the rubble were saved by family and neighbors, not rescue crews. In Chicago's 1995 heat wave, neighborhoods where people knew each other had far fewer deaths. Supplies matter. So do the people around you.",
    privacy:
      "Prices are rough estimates to help you plan, not quotes. Nothing you enter leaves your browser. Your answers are saved on this device, and share links carry them in the link itself.",
    /** Only in the Spanish version: a note that the sources are mostly in English. */
    sourcesLanguage: "",
    groups: {
      bayArea: "Bay Area guidance",
      state: "State and national",
      community: "Neighbors and community",
      power: "Power and access needs",
    },
    /** What each source is, by id. Source names stay as their publishers wrote them. */
    sources: {
      readysf: "San Francisco's official kit lists. About a week of supplies at home.",
      ebmud: "Recommends 2 gallons per person per day for at least 7 days, plus bleach doses for treating water.",
      sfpuc: "1 gallon per person per day, and how to treat water.",
      haywired: "A modeled M7.0 Hayward Fault quake, with East Bay water outages averaging about 6 weeks.",
      genasys: "Look up your evacuation zone.",
      tsunamiMaps: "Check whether your home, work, or school is in a tsunami zone.",
      readyKit: "FEMA's basic disaster supplies list.",
      listos: "Cal OES preparedness guides in many languages.",
      cdcWater: "Storing and treating water.",
      airnow: "Clean-air rooms, N95s, and DIY air cleaners.",
      eca: "The Seven Steps to Earthquake Safety and bedside kits.",
      braceBolt: "Retrofit grants for older houses.",
      nert: "San Francisco's free neighborhood emergency response training.",
      core: "Oakland's free emergency preparedness and response classes.",
      mapYourNeighborhood: "A short guide to getting your block ready together.",
      cert: "Free community emergency response training, offered across the Bay Area.",
      blockParty: "A kit for getting to know your neighbors and planning together.",
      klinenberg: "Neighborhoods where people knew each other had far fewer deaths.",
      resilientPeeps: "Gear picks for go bags, home kits, and cars. Many of the example products on your list come from here.",
      pgeAlerts: "Get warnings before planned shutoffs. No PG&E account needed.",
      medicalBaseline: "For people who rely on powered medical devices.",
      ddar: "Backup batteries and support for people with disabilities during shutoffs.",
      readyDisability: "Planning for access and functional needs.",
      readyPets: "Kits and plans for animals.",
    },
  },

  sign: {
    title: "OK / HELP window sign – Bay Ready",
    heading: "OK / HELP window sign",
    intro: [
      "This sign is for your neighbors. After a big earthquake, the people on your block are often the first help anyone gets. A sign in a window facing the street tells them who needs help first, so they can skip homes that are fine.",
      "It works best if you've agreed ahead of time that one of you will walk the block after a quake. Show this sign to the neighbors you've met, so everyone knows to look for it.",
      "Print this page, cut or fold it in half, and keep it by your front door with some tape. Put up HELP even if you can't get to the door.",
    ],
    printNote: "It prints on one page. Nothing to fill in.",
    /** The big line under OK and HELP, in the visitor's language. The other languages follow. */
    ok: "We're OK. No help needed.",
    help: "We need help.",
  },
};
