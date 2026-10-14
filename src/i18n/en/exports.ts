/**
 * Words in the PDF (src/lib/exportPdf.ts) and the spreadsheet (src/lib/exportXlsx.ts).
 * The Spanish file next door must match its shape.
 *
 * In the spreadsheet, the dropdown values (status, done, heads-up, kit) are
 * also what its formulas and colors look for, and the tab names are what its
 * formulas point at. exportXlsx.ts reads both from here, so they always agree.
 */
export const exports = {
  /** "a, b, and c" */
  list: (items: readonly string[]) =>
    items.length > 2 ? `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}` : items.join(" and "),
  /** The fallback name for someone who hasn't been named. */
  person: (n: number) => `Person ${n}`,
  credit: "Made with Bay Ready, a free emergency kit planner for the Bay Area",

  pdf: {
    lang: "en-US",
    dateLocale: "en-US",
    title: "My emergency list",
    titleShort: "My emergency list: short version",
    kicker: "BAY READY",
    kickerShort: "BAY READY  |  SHORT VERSION",
    alerts: (name: string, url: string) => `Emergency alerts: sign up for ${name} at ${url}`,
    made: (date: string) => `Made ${date}. `,
    openOnline: "Open this list online",
    printFrame: "Printable list",
    files: { list: "emergency-list.pdf", short: "emergency-list-short.pdf", refresh: "keep-it-fresh.pdf" },

    knowYourHome: "Know your home",
    knowYourHomeIntro: "Fill in anything that's blank. Keep a copy in your stay-at-home bin and in each go bag.",
    notes: "Notes and reminders",

    whenItHappens: "When it happens",
    places: { fridge: "on the fridge", lid: "inside the lid of your bin", bags: "in each go bag" },
    keepCopy: (where: string) => `Keep a copy ${where}.`,

    walletCards: "Wallet cards",
    walletIntro:
      "One for each person. Cut along the dashed line and fold in half. It fits in a wallet or phone case, and works in a kid's backpack too.",
    card: {
      separated: "IF WE GET SEPARATED",
      name: "Name",
      contact: "Out-of-area contact",
      localContact: "Local backup contact",
      meetOutside: "Meeting spot outside",
      meetNearby: "Meeting spot nearby",
      cells: "OUR CELL NUMBERS",
      text: "Text, don't call.",
      numbers: "911 for emergencies, 211 for shelter and help.",
      alerts: "Alerts:",
    },

    startHere: "Start here",
    startHereIntro: "Free things to do first. No shopping needed.",
    essentials: "The essentials",
    essentialsIntro:
      "Buy these first and put them away. Check them off as you go. Your full list has everything else, for when you're ready for more.",
    essentialTag: "ESSENTIAL",
    essentialsGroup: "ESSENTIALS",

    everyBag: "In every bag",
    everyBagIntro: (names: string) => `One each for ${names}. Tick a name when that bag has it.`,
    /** How the names in "One each for ..." are joined. */
    everyBagNames: (names: readonly string[]) => names.join(", "),
    groupBag: "One for the group",
    groupBagIntro: "You need just one of these. Decide whose bag each goes in.",

    keepItFresh: "Keep it fresh",
    keepItFreshIntro:
      "Check these when the clocks change in spring and fall. Each time, use the next empty box: write today's date and when it's next due. Blank rows are for your own food and anything else that expires.",
    log: {
      item: "ITEM",
      replace: "REPLACE",
      eachCheck: "EACH CHECK",
      on: "On",
      next: "Next",
      every: (months: number) => `Every ${months} months`,
      byDate: "By the date on it",
    },

    page: (n: number, of: number) => `Page ${n} of ${of}`,
  },

  xlsx: {
    file: "emergency-kit.xlsx",
    title: "Our emergency kit",
    /** Tab names. Formulas on other tabs point at these. */
    sheets: {
      overview: "Overview",
      todos: "To-dos",
      supplies: "Supplies",
      expiring: "Expiration dates",
      neighbors: "Neighbors",
      card: "When it happens",
    },
    /** Dropdown values. Formulas and colors compare against these exact words. */
    status: { need: "Need", have: "Have", skip: "Skip", partly: "Partly", todo: "To do", done: "Done" },
    person: { done: "Done", notDone: "Not done" },
    heads: { now: "Due now", soon: "Due soon", good: "Good" },
    yesNo: ["Yes", "No"],
    /** Number formats. Words in quotes are shown as typed. */
    dateFormat: "mmm d, yyyy",
    monthsFormat: '0" months"',
    /** Amounts that follow Days at home: "7 days" plus the item's own suffix. */
    days: "days",

    creditFooter: (url: string) => `&L&8Made with Bay Ready: ${url}&R&8Page &P of &N`,
    extras: "Advanced extras",
    extrasDesc: "Nice to have. Skip these if you're just getting started",

    todos: {
      title: "To-dos",
      subPeople: "Most of these are free and quick. Start with This weekend. Some are for each adult, so mark your own column Done.",
      sub: "Most of these are free and quick. Start with This weekend, and set Status to Done as you go.",
      headers: { status: "Status", task: "Task", who: "Who", link: "Link", why: "Why it matters" },
      whoNote: "Who's doing it. Pick a name from the list on the Overview tab, or type one.",
      eachAdult: "Each adult",
      eachAdultDesc: "Everyone does these on their own phone or accounts",
      stageBlurb: {
        weekend: "Free quick wins, about an hour",
        month: "The rest of the plan, plus a few small buys",
        later: "Extra steps for when you're ready",
      },
    },

    supplies: {
      title: "Supplies",
      subBags: "Mark each person Done as you pack their go bag. For everything else, set Status to Have when you get it.",
      sub: "Set Status to Have when you get something. Track what expires on the Expiration dates tab.",
      groups: { what: "What to get", buy: "Buying" },
      headers: {
        status: "Status",
        item: "Item",
        amount: "Amount",
        who: "Who's buying",
        cost: "Est. cost",
        example: "Example",
        notes: "Notes",
      },
      whoNote: "Who's getting it. Pick a name from the Overview tab, or type one.",
      costNote: "A rough estimate for the whole amount.",
      notesNote:
        "Anything worth remembering. For example, the radio is in Sam's go bag, so you have one even though it's listed under the stay-at-home bin.",
      bag: (n: number) => `Bag ${n}`,
      everyBag: "In every bag",
      everyBagAdults: "Mark Done as you pack each bag. Some are adults only",
      everyBagDesc: "Mark each person Done as you pack their bag",
      groupBag: "One for the group",
      groupBagDesc: "Just one of these. Decide whose bag it goes in",
      essentials: "Essentials",
      essentialsDesc: "Get these first",
      rest: "Everything else",
      restDesc: "When you can",
      total: "Still to buy (rough estimate)",
      blurb: {
        stay: "Amounts follow Days at home on the Overview tab",
        bags: (n: number) => `${n} bags, one for each person who can carry one`,
        go: "Ready to grab in minutes",
        car: "Kept in the trunk",
      },
    },

    expiring: {
      sub: "Add the date you packed each thing, or the date printed on it. Due by and Heads-up fill in on their own.",
      headers: ["Item", "Kit", "Replace every", "Packed on", "Date on package", "Due by", "Heads-up", "Notes"],
      notes: {
        kit: "Where it's kept.",
        every: "A default you can change. Used with Packed on when there's no date on the package.",
        packed: "The day you bought or packed it.",
        date: "The expiration date printed on it, if there is one. This wins over Replace every.",
        due: "Fills in on its own: the date on the package, or Packed on plus Replace every.",
        heads: (now: string, soon: string, good: string) =>
          `Fills in on its own.\n${now}: past due.\n${soon}: due before your next check-up (6 months).\n${good}: nothing to do.`,
      },
      everyError: "Type a number of months, like 6.",
      dateErrorTitle: "That doesn't look like a date",
      dateError: "Try something like 3/1/2027.",
      tip: "Eat the oldest food first and replace it on your next shop. Need more rows? Copy a row down so the formulas come with it.",
    },

    neighbors: {
      sub: "People nearby you've swapped numbers with. Only write down what people say they're OK sharing.",
      headers: [
        "Name",
        "How to reach them",
        "Where (unit or street)",
        "Skills or tools to share",
        "Anything they'd like us to know",
        "OK to share with the block?",
      ],
      skillsNote: "First aid training, a ladder, a power station, a car, a language they speak.",
      knowNote: "For example, if they'd like a check-in after a quake or in a heat wave.",
      meetingSpot: "Our meeting spot:",
    },

    card: { sub: "Print this and tape it inside the lid of your bin." },

    overview: {
      openLink: "Open this list in Bay Ready",
      whereThingsStand: "Where things stand",
      /** "3 of 12" */
      of: " of ",
      todosDone: "To-dos done",
      todosHint: "Start with This weekend on the To-dos tab.",
      suppliesReady: "Supplies ready",
      suppliesHintBags: "Go bag items count once every bag has one.",
      suppliesHint: "Set Status to Have on the Supplies tab as you get things.",
      stillToBuy: "Still to buy",
      stillToBuyHint: "A rough estimate. Most people spread it over a few months.",
      dueNowHint: (sheet: string) => `Past its date or overdue for a check. See the ${sheet} tab.`,
      dueSoon: "Due in the next 6 months",
      dueSoonHint: "Swap or check these at your next check-up.",
      nextCheck: "Next check-up",
      nextCheckHint: "Check your kits when the clocks change in spring and fall.",
      days: "Days at home",
      daysHint: "Stay-at-home bin amounts and costs follow this. Aim for at least 7.",
      daysError: "Type a number of days, like 7 or 14.",
      daysNote: "Type any number of days, like 7 or 14.",
      people: "Your people",
      peopleHintBags: "Change these to real names. They label the person columns and fill the Who dropdowns.",
      peopleHint: "Add names here. They show up in the Who dropdowns on the other tabs.",
      knowYourHome: "Know your home",
      notes: "Notes and reminders",
      howTo: "How to use this",
      steps: {
        who: "Pick who's doing each thing in the Who column.",
        statusBags:
          "Packing a go bag? Set that person's column to Done. For everything else, set Status to Have. Finished a task? Set it to Done.",
        status: "When you get something, set Status to Have. Finished a task? Set it to Done.",
        expiring: (sheet: string) =>
          `On the ${sheet} tab, add the date you packed things or the date printed on them. Heads-up shows what's due.`,
        checkUp: (now: string, soon: string) => `At each check-up, swap or check anything marked ${now} or ${soon}.`,
        neighbors: (sheet: string) => `Use the ${sheet} tab for numbers you swap with people nearby.`,
        card: (sheet: string) => ` Print the ${sheet} tab and tape it inside your bin lid.`,
      },
      alerts: "Emergency alerts",
      signUp: (name: string) => `Sign up for ${name}`,
    },
  },
};
