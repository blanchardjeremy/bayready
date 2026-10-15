/**
 * The wizard's words: questions, hints, options, tips, and buttons. The Spanish file
 * next door must match its shape. Sentences with a link in the middle are split into
 * `before` and `after`, with the link text on its own.
 */
export const wizard = {
  /** Each step's question. Also the static page title (see steps.ts) and the heading. */
  titles: {
    county: "Which county do you live in?",
    hazards: "Which of these do you want to be ready for?",
    household: "Who are you prepping for?",
    needs: "Does anyone rely on any of these?",
    have: "Tap anything you already have at home",
    kit: "What would you like to put together?",
    home: "What kind of home do you live in?",
    car: "Do you usually have a car?",
    level: "How much do you want to take on right now?",
    days: "How many days do you want to cover at home?",
    power: "If the power is out for days, what matters most?",
    start: "When could you take your first step?",
  },
  pageTitle: (title: string) => `${title} – Bay Ready`,

  stepOf: (n: number, total: number) => `Step ${n} of ${total}`,
  advancedOf: (n: number, total: number) => `Advanced question ${n} of ${total}`,
  optional: "(optional)",
  whyWeAsk: "Why we ask",
  back: "Back",
  backToList: "Back to my list",
  skip: "Skip",
  continue: "Continue",

  county: {
    hint: "We use this to suggest likely hazards and your local alert system.",
    other: "Somewhere else, or not sure",
    private: "Prefer not to say",
    alertTip: {
      before: (county: string) => `${county} sends free emergency texts and calls through `,
      after: ". Signing up takes two minutes and is one of the most useful free steps. You can do it now or later from your list.",
    },
    noAlertTip:
      "Every Bay Area county has a free emergency alert system. We'll link yours on your list if you pick a county.",
  },

  zip: {
    label: "Your ZIP code",
    why: "It helps us tell who supplies your water and whether you're near a tsunami zone. It stays on this device.",
    inCounty: (county: string, picked: boolean) =>
      `That's in ${county} County${picked ? ", so we've picked it below" : ""}.`,
    unknown: "We don't have that ZIP code in our Bay Area list. That's OK. Just pick your county below.",
  },

  hazards: {
    hintCustom: "These are your picks. Change anything you like.",
    hintCounty: (county: string) => `We've picked the common ones for ${county} County. Change anything you like.`,
    hintBayArea: "We've picked the common ones for the Bay Area. Change anything you like.",
    keepOne: "Keep at least one picked. Earthquake is a good place to start.",
    zipTsunami: "Part of your ZIP code is in a mapped tsunami hazard area.",
    reset: "Not sure? Go back to our suggestions",
    tip: {
      before:
        "One good kit covers most of these. Getting ready for an earthquake does most of the work for everything else. To check your exact address for flood, fire, tsunami, and quake risks, look it up on ",
      after: " from Cal OES.",
    },
  },

  household: {
    hint: "Count anyone you'd look after in an emergency: housemates, family, someone who often stays over.",
    why: "So we can work out how much water and food you need. We don't ask for ages, names are optional, and nothing leaves this device.",
    adults: "Adults and teens",
    kids: "Kids",
    kidsHint: "Ages 2 to 12",
    babies: "Babies and toddlers",
    babiesHint: "Under 2",
    dogs: "Dogs",
    cats: "Cats",
    otherPets: "Other pets",
    names: "Names",
    namesNote:
      "Handy if you're packing a go bag for each person, or splitting tasks with housemates. Names stay on this device, and are included if you share your list.",
  },

  names: {
    you: "You",
    adult: (n: number) => `Adult ${n}`,
    kid: (n: number) => `Kid ${n}`,
    /** The placeholder: what the list calls this person if left blank. */
    me: "Me",
  },

  needs: {
    hint: "Pick any that apply.",
    why: "So your list includes the right backups, like spare glasses or a battery for a CPAP. It's saved on this device, and only goes elsewhere if you share your list.",
    groups: {
      health: "Health and medicine",
      getAround: "Getting around and communicating",
      other: "Other",
    },
    options: {
      meds: { label: "Daily prescription medicine" },
      "cold-meds": { label: "Medicine that has to stay cold", desc: "Like insulin" },
      "power-device": { label: "A medical device that needs power", desc: "CPAP, a power wheelchair, or a pump" },
      oxygen: { label: "Home oxygen", desc: "A concentrator or tanks" },
      dialysis: { label: "Dialysis" },
      pregnancy: { label: "Pregnancy" },
      diet: { label: "A special diet, food allergy, or baby formula" },
      "vision-hearing": { label: "Glasses, contacts, or hearing aids" },
      mobility: { label: "A mobility aid, or trouble with stairs" },
      communication: {
        label: "Trouble hearing or seeing alerts, or speaking",
        desc: "Deaf, hard of hearing, blind, low vision, or a speech disability",
      },
      cognitive: {
        label: "Trouble understanding or remembering in a crisis",
        desc: "Like dementia, autism, or a brain injury",
      },
      caregiver: { label: "Someone who needs help with daily care", desc: "From family or a home health aide" },
      "service-animal": { label: "A service animal" },
    },
    none: "None of these",
    noneDesc: "Clears the picks above",
    private: "Prefer not to say",
    privateDesc: "Clears the picks above. Your list will include general health items.",
    /** Said when an exclusive answer clears the other picks. */
    clearedOthers: (count: number, choice: string) =>
      `We unchecked your other ${count === 1 ? "pick" : "picks"}, since you chose “${choice}”.`,
    clearedOne: (choice: string) => `We unchecked “${choice}”.`,
    medicalBaseline: {
      before: "If you rely on powered medical equipment, ask PG&E about its ",
      link: "Medical Baseline program",
      url: "https://www.pge.com/en/account/billing-and-assistance/financial-assistance/medical-baseline-program.html",
      after: ". It can lower your bill and gets you extra notice before planned shutoffs.",
    },
  },

  have: {
    hint: "It doesn't need to be packed yet. We'll count it so you don't buy it twice.",
    tip: "You're already off to a good start. Most of a kit is everyday stuff.",
  },

  kit: {
    hint: "You can do both, and you can change this later.",
    error: "Pick one to continue. If you're not sure, pick “Not sure yet”.",
    options: {
      stay: { label: "Stay-at-home bin", desc: "Supplies to get through days at home without power or running water." },
      go: { label: "Go bag", desc: "A grab-and-go bag in case you need to leave fast." },
      both: { label: "Both", desc: "We'll list each one separately so you can do them one at a time." },
      unsure: { label: "Not sure yet", desc: "We'll suggest one based on what you've told us." },
    },
    recommended: "Recommended",
    suggestion: {
      both: "Our suggestion: a stay-at-home bin and a go bag",
      stay: "Our suggestion: start with a stay-at-home bin",
    },
    suggestionWhy: {
      both: "You picked a hazard where people may need to leave quickly, so a go bag is worth having too.",
      stay: "For earthquakes and outages you'll most likely stay home. You can add a go bag later.",
    },
    soundsGood: "Sounds good",
    justStay: "Just a stay-at-home bin",
    wantBoth: "I want both",
    tip: "After a big earthquake, most Bay Area households will stay home. Wildfires and tsunami warnings are when people need to leave quickly.",
  },

  home: {
    hint: "Renting or owning doesn't matter here. Where something is usually the landlord's job, your list will say so.",
    why: "It changes which home fixes show up on your list, and whether stairs matter when elevators stop.",
    options: {
      house: "House or townhouse",
      "apartment-low": "Apartment or condo, up to 4 floors",
      "apartment-high": "Apartment or condo, 5 floors or more",
      other: "Something else, or it varies",
    },
  },

  car: {
    why: "It changes how you'd get out if you need to leave fast. Without a car, we'll help you plan another way. With one, Advanced adds a small car kit.",
    options: { yes: "Yes", sometimes: "Sometimes", no: "No" },
  },

  level: {
    hint: "You can switch any time without losing your progress.",
    basics: "Basics",
    startHere: "Start here",
    basicsDesc:
      "The essentials that cover most situations, with a week of water and food at home, as Bay Area agencies recommend.",
    basicsFree: "Your first steps are free. The rest is a few shopping trips, spread out however suits you.",
    advanced: "Advanced",
    advancedDesc: (questions: number) =>
      `Two weeks of supplies, backups, and extra gear. Adds ${questions} short questions.`,
    stats: (things: number, tasks: number, cost: string) =>
      `About ${things} things to gather or buy and ${tasks} plans and to-dos, roughly ${cost}`,
  },

  days: {
    hint: "After a major Hayward Fault quake, the USGS estimates many East Bay homes could be without tap water for about 6 weeks.",
    seven: "7 days",
    sevenDesc: "What San Francisco and EBMUD recommend at a minimum. Cal OES says at least 3 days, and a week is better.",
    fourteen: "14 days",
    fourteenDesc: "What the CDC and Red Cross suggest for home. Worth it if you have the space.",
  },

  power: {
    hint: "Pick any. We'll add gear for each.",
    options: {
      cook: { label: "Cooking without power", desc: "A camp stove you can use outdoors." },
      charge: { label: "Keeping phones and devices charged", desc: "A portable power station or solar panel." },
      cold: { label: "Keeping food or medicine cold", desc: "Coolers, ice packs, and a plan." },
    },
  },

  start: {
    continue: "Show my list",
    why: "We use this to order your list. It never removes anything.",
    options: {
      weekend: "This weekend",
      weeks: "In the next couple of weeks",
      month: "This month",
      unsure: "Not sure yet",
    },
    budgetHeading: "Roughly what do you want to spend to start?",
    budget: {
      "0": { label: "Use what I have first", desc: "Free steps go to the top." },
      "50": { label: "Under $50" },
      "150": { label: "$50 to $150" },
      more: { label: "More than $150" },
      unsure: { label: "Not sure" },
    },
  },

  /** Shared form pieces in controls.tsx. */
  controls: {
    goodToKnow: "Good to know",
    opensInNewTab: "(opens in a new tab)",
    removeOne: (label: string) => `Remove one: ${label}`,
    addOne: (label: string) => `Add one: ${label}`,
  },
};
