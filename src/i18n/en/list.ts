import { BAY_READY_URL, CREDIT } from "@/lib/urls";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** The list page: everything on /list, plus the text it puts in calendar files and copied lists. */
export const list = {
  pageTitle: "Your emergency list – Bay Ready",
  /** For formatting dates. */
  locale: "en-US",
  /** One-line credit for copied text, calendar files, and the printed page. */
  credit: CREDIT,

  shared: {
    title: "You're looking at a list from a link.",
    note: "Changes here aren't saved until you make it yours.",
    makeMine: "Make it my list",
    buildOwn: "Build my own",
  },

  header: {
    title: "Your emergency list",
    planningFor: "Planning for",
    yourAnswers: "Your answers",
    changeAnswers: "Change answers",
    happeningNow: "Happening now? See what to do first",
    /** Screen-reader label for an answer badge that links to its wizard step. */
    badge: (label: string, value: string) => `${label}: ${value}. Change`,
    labels: { building: "Building", for: "For", hazards: "Hazards", days: "Days", county: "County" },
    adults: (n: number) => plural(n, "adult", "adults"),
    kids: (n: number) => plural(n, "kid", "kids"),
    babies: (n: number) => plural(n, "baby", "babies"),
    dogs: (n: number) => plural(n, "dog", "dogs"),
    cats: (n: number) => plural(n, "cat", "cats"),
    otherPets: (n: number) => plural(n, "other pet", "other pets"),
    daysAtHome: (n: number) => `${n} days at home`,
    county: (name: string) => `${name} County`,
  },

  level: {
    legend: "List size",
    basics: "Basics",
    advanced: "Advanced",
    core: "The core",
    plusExtras: "Plus extras",
    oneWeek: "1 week",
    withExtras: (weeks: number) => `${weeks === 1 ? "1 week" : `${weeks} weeks`} + extras`,
  },

  progress: {
    count: (done: number, total: number, tasks: boolean) => `${done} of ${total} ${tasks ? "done" : "ready"}`,
    label: (kit: string) => `${kit} progress`,
    already: (have: number, total: number) => `You already have ${have} of ${total} things on this list.`,
  },

  startHere: {
    allDone: "Free steps done. Nice work.",
    weekend: "Start here this weekend",
    title: "Start here",
    desc: "These are free. Most take 5 to 15 minutes each.",
  },

  essentials: {
    title: "The essentials",
    doneTitle: "You have the essentials",
    intro:
      "Get these first and keep them together. They matter most in the first days after a quake, when stores are closed and the water may be off.",
    count: (done: number, total: number) => `${done} of ${total}`,
    soFar: "so far",
    done: "done",
    progressLabel: "Essentials",
    doneHeadline: "Nice work. That's the most important part done.",
    doneBody:
      "Keep it all together somewhere you can reach after a quake, like a closet near the door, not the back of the garage. Then work through the rest of your list a bit at a time.",
    seeThem: "See the essentials",
    overBudget: (dollars: number) =>
      `Each of these is more than about $${dollars}. Start with what you have and add these as you can.`,
    runsOut: (dollars: number, spent: number) =>
      `Your $${dollars} runs out about here. That's around $${spent} so far. Some below have free ways to start.`,
    budgetIntro: (dollars: number) => `You said about $${dollars} to start, so here they are in the order we'd get them.`,
    coversAll: (dollars: number) => `About $${dollars} should cover all of these.`,
    coversAbove: (dollars: number) => `About $${dollars} covers the ones above the line.`,
    rest: (cost: string) => `The rest of the essentials: roughly ${cost} more, when you can.`,
    zeroIntro:
      "You said you'd rather not spend anything yet. That's fine. Start with what's free or already in your home. Free ways to cover some of these are marked.",
    stillToGet: (cost: string) => `Still to get: roughly ${cost}.`,
    /** Ways to cover an essential with what's already at home, by item id, for people starting with $0. */
    freeWays: {
      water: "Free way: fill clean soda bottles with tap water. Skip milk and juice jugs.",
      "water-go": "Free way: refill a water bottle you already have.",
      food: "Free way: set aside cans from your cupboard and eat the oldest first.",
      "food-go": "Free way: pack granola bars, nuts, or crackers from your cupboard.",
      "can-opener": "Free way: check your kitchen drawer. One you already own is fine.",
      flashlights: "Free way: gather the flashlights you already have and check the batteries.",
      toilet: "Free way: line your own toilet with a heavy trash bag instead of a bucket.",
      "first-aid": "Free way: gather the bandages and medicines you already have into one bag.",
      "docs-copies": "Free way: photograph your IDs and insurance cards on your phone.",
      backpack: "Free way: use any backpack or duffel you already own.",
      bin: "Free way: start with a sturdy box or laundry basket.",
    },
  },

  /** The row of export buttons and their menus. */
  exports: {
    copyLink: "Copy share link",
    linkCopied: "Link copied",
    copyText: "Copy as text",
    print: "Print",
    preparing: "Getting it ready…",
    pdf: "Download PDF",
    makingPdf: "Making PDF…",
    xlsx: "Download spreadsheet",
    makingXlsx: "Making spreadsheet…",
    short: "Short version",
    shortDetail: "(your plan, the card, and the essentials)",
    everything: "Everything",
    everythingDetail: "(the full list and refresh log)",
  },

  /** Short messages after a button does its thing. */
  flash: {
    copyFailed: "Couldn't copy. Your browser blocked it.",
    failed: "Something went wrong. Try again.",
    linkCopied: "Link copied. Anyone with it can see this list.",
    textCopied: "List copied as text.",
    pdfDone: "PDF downloaded.",
    xlsxDone: "Spreadsheet downloaded. It opens in Google Sheets, Excel, or Numbers.",
    shopCopied: "Shopping list copied.",
  },

  together: {
    lead: "You don't have to do this alone.",
    body: "Neighbors who know each other get through disasters better, and sharing costs less than buying everything yourself. Start by swapping numbers with one neighbor, and send them your list.",
  },

  fullList: {
    title: "Your full list",
    count: (n: number) => `· ${plural(n, "thing", "things")}`,
    intro:
      "Everything for your household, with the essentials marked. There's no rush: work through it a bit at a time, and skip anything that doesn't fit your life.",
    more: (n: number) => `When you're ready, ${n} more ideas wait at the end of each kit.`,
    viewsLabel: "How to show your list",
    views: { kits: "By kit", shop: "Shopping list", plan: "Step by step" },
  },

  kit: {
    stillToGet: (cost: string) => `Still to get: ${cost}`,
    packBags: (n: number) => `Pack ${n} bags, one for each person who can carry one.`,
    babies: "Babies' things ride in a grown-up's bag.",
    shownAbove: (n: number) => `Plus the ${plural(n, "free step", "free steps")} in Start here above.`,
    stayWithGo:
      "Your go bags live at home too, so this bin only adds what they don't cover: more water, food, and supplies for a longer stay.",
    secondBag: "If you spend a lot of time at work or a loved one's home, a second small bag there is worth it.",
    mobility: "Keep the bag light and right by the exit you'd use. A small rolling bag can be easier than a backpack.",
    everyBag: "In every bag",
    everyBagDesc: (names: string) => `One each for ${names}. Tap a name when that bag has it.`,
    oneForGroup: "One for the group",
    oneForGroupDesc: "You need just one of these. Decide whose bag each goes in.",
    essentials: "Essentials",
    moreReady: (n: number) => `${n} more for when you're ready`,
    moreDetail: (cost: string) => `More days of supplies, backups, and extra gear. Roughly ${cost}.`,
    switchAdvanced: "Switch to Advanced",
    switchRest: "to make them part of your main list.",
    showSkipped: (n: number) => `Show ${n} skipped`,
    skippedNote: "Tucked away here. Bring any back whenever you like.",
    /** "Sam, Alex and Jo". */
    join: (names: string[]) =>
      names.length <= 1 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`,
  },

  shop: {
    nothing: "Nothing left to buy. Everything on your list is marked as have or skipped.",
    allBought: "All bought. Nice work.",
    toBuy: (n: number) => `${plural(n, "thing", "things")} to buy,`,
    roughly: (cost: string) => `roughly ${cost} in all.`,
    copy: "Copy shopping list",
    hint: "Check things off as you shop. They're marked as have on your list.",
    gotIt: "Got it",
  },

  plan: {
    step: (n: number) => `Step ${n}`,
    allDone: "All done",
    toGo: (n: number, cost: string) => `${n} to go · ${cost}`,
    free: "Do or gather, free",
    buy: "To buy",
  },

  firstHour: {
    title: "When it happens",
    desc: "Print this card and tape it inside the lid of your bin.",
    print: "Print this card",
  },

  fresh: {
    title: "Keep it fresh",
    body: "Food, water, medicine, and batteries all go bad eventually. Check your kits twice a year, when the clocks change in spring, and at ShakeOut in October: look at dates, swap stored water, test flashlights and radios, refill prescriptions, and update clothes for kids who've grown. An easy habit is to eat the oldest food from your bin and replace it on your next shop.",
    paper:
      "Keep track on paper, in your bin. The refresh log lists what to check for your household. Each time, write the date and when it's next due in the next empty box, so there's nothing to cross out.",
    print: "Print the refresh log",
    reminders: "Add the twice-a-year reminders",
    /** A made-up, filled-in refresh log. The dates are written in the page's language. */
    example: {
      badge: "Example",
      label: "Example: a printed refresh log with dates written in by hand",
      title: "Keep it fresh",
      item: "Item",
      replace: "Replace",
      eachCheck: "Each check",
      on: "On",
      next: "Next",
      beans: "Canned beans",
      every24: "Every 24 months",
      tapWater: "Water from the tap",
      every6: "Every 6 months",
      lights: "Flashlights and radio",
      meds: "Everyday medicines",
      byDate: "By the date on it",
      /** A row someone added by hand. */
      granola: "Granola bars",
      caption: "A made-up example. Yours lists what's in your kits, with blank rows for your own food.",
    },
  },

  clear: {
    prompt: "On a shared phone or computer?",
    button: "Clear everything on this device",
    title: "Clear everything on this device?",
    confirm: "Clear everything",
    cancel: "Cancel",
    body: "This deletes your answers, checkmarks, and Know your home info from this browser. It can't be undone.",
    keep: "To keep your list, copy its link first. Know your home info isn't in the link.",
    copyLink: "Copy my list link",
  },

  replace: {
    title: "Replace your list?",
    confirm: "Replace my list",
    cancel: "Keep my list",
    body: "This device already has a list. Making this one yours replaces it, along with its checkmarks. Your Know your home info stays.",
    copyLink: "Copy the link to my current list first",
  },

  copyLink: {
    copied: "Link copied",
    failed: "Your browser didn't let us copy it.",
  },

  names: {
    title: "Names",
    desc: "Shown on your list and in the spreadsheet. Leave one blank to use Me, Adult 2, and so on.",
    done: "Done",
  },

  empty: {
    cleared: "Everything on this device is cleared.",
    titleApp: "Bring your list here",
    title: "You haven't built a list yet",
    introApp: "This Home Screen app starts empty. Paste the link to your list below, or build a new one.",
    intro:
      "Answer some short questions to get one sized for your household, or start from a simple one-person list and change it later.",
    before:
      "Made a list before? Some browsers clear saved lists after a while. Open the link you saved to bring it back, or paste it below.",
    start: "Start the questions",
    starter: "Show a starter list",
    pasteLabel: "Paste your list link",
    open: "Open it",
    error: "That doesn't look like a Bay Ready list link. It should end with a # and a long code.",
  },

  /** "Copy as text". */
  text: {
    title: "My emergency list (Bay Ready)",
    alerts: (name: string, url: string) => `Emergency alerts: ${name} ${url}`,
  },

  /** One item on the list. */
  row: {
    haveIt: "Have it",
    done: "Done",
    essential: "Essential",
    forHazards: (hazards: string) => `For ${hazards}`,
    whoDone: (item: string) => `Who's done: ${item}`,
    editNames: "Edit names",
    why: "Why this",
    examples: "Examples:",
    notEndorsements: ". These are examples, not endorsements.",
    bringBack: "Bring back",
    bringBackLabel: (item: string) => `Bring back ${item}`,
    skip: "Skip",
    skipLabel: (item: string) => `Skip ${item}`,
    waterNote: "You said you have some. Check you have the full amount.",
  },

  reveal: { show: "Show", hide: "Hide" },

  save: {
    title: "Keep your own copy",
    hide: "Hide this",
    body: "Don't count on this website to hold on to your list. It's saved only in this browser, and it can disappear without warning: when you clear your history, switch phones, or, on iPhone, after about a week away. Keep a copy somewhere else.",
    printTitle: "Print it or save the PDF",
    printBody: "Keeps everything, including your Know your home info and notes. Put a printed copy in your bin.",
    print: "Print",
    pdf: "Download PDF",
    linkTitle: "Copy the link",
    linkBody: "Brings back your answers and checkmarks on any phone or computer. It doesn't include Know your home or your notes.",
    copy: "Copy link",
    copied: "Link copied",
    email: "Email it to myself",
    failed: "Your browser didn't let us copy it. Try the email option.",
    iphoneTitle: "On iPhone: you can also add it to your Home Screen",
    iphoneBody:
      "In Safari, tap the Share button, then Add to Home Screen. The Home Screen app keeps your list and works without a connection. It starts empty, so copy your link first, then paste it in when you open the app.",
    privacy: "The link has your answers and checkmarks, including any names and health needs, so keep it to yourself.",
    mailSubject: "My emergency list",
    mailBody: (url: string) =>
      `Here's the link to my Bay Ready emergency list. Open it to bring the list back on any phone or computer:\n\n${url}\n`,
  },

  shareDialog: {
    copyThis: "Copy this link",
    copiedPrivate: "Copied, without names or health info",
    copied: "Link copied",
    failedNote: "Your browser didn't let us copy it, so copy it from here.",
    privateBody: "Anyone with this link can see the list and what's checked off. Names and health needs aren't in it.",
    personalBody:
      "Anyone with the link can see this list and what's checked off, including the names and health needs you entered.",
    plainBody: "Anyone with the link can see this list and what's checked off.",
    inputLabel: "Share link",
    leftOut:
      "Know your home info and notes stay on this device. To share them, print them or download the PDF or spreadsheet.",
    copyPrivate: "Copy without names or health info",
    done: "Done",
  },

  /** The Know your home card and the fields on its tasks. */
  home: {
    printThese: "Print these for your kit",
    title: "Know your home",
    print: "Print this info",
    intro:
      "The things you'll want to know without thinking on the day it happens. Fill them in as you do the to-dos above, then print a copy for your bin and each go bag. They're saved on this device and go into your spreadsheet, but never into share links.",
    notes: "Notes and reminders",
    notesPlaceholder:
      "Anything else worth remembering, like the radio is in Sam's go bag, or which neighbor has a generator.",
    printedIntro: "Fill in anything that's blank. Keep a copy in your stay-at-home bin and in each go bag.",
    madeWith: `Made with Bay Ready: ${BAY_READY_URL}`,
  },

  /** Calendar buttons and the events they add. */
  calendar: {
    add: "Add to calendar",
    google: "Google Calendar",
    ical: "iCal file",
    icalOne: "(Apple, Outlook)",
    icalBoth: "(both, for Apple or Outlook)",
    /** Read by screen readers after a menu link. */
    newTab: "(opens in a new tab)",
    yourList: (url: string) => `Your list: ${url}`,
    firstSteps: {
      filename: "emergency-prep-first-step.ics",
      title: "Emergency prep: first steps",
    },
    checks: {
      filename: "emergency-kit-checks.ics",
      spring: {
        name: "Spring check",
        title: "Emergency kit check (clocks changed)",
        description:
          "The clocks changed, so it's time for your spring kit check. Look at dates on food, water, and medicine. Swap stored tap water. Test flashlights and radios and change batteries. Update clothes for kids who've grown.",
      },
      shakeOut: {
        name: "ShakeOut check",
        title: "Great ShakeOut: drill and kit check",
        description:
          "Today is the Great ShakeOut. Practice Drop, Cover, and Hold On with everyone at home, then check your kit: dates on food, water, and medicine, batteries, and your household plan.",
      },
    },
  },
};
