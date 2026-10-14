# Developing Bay Ready

A "build your own emergency kit list" web app for the San Francisco Bay Area. People answer a few
questions about their household and get a list of supplies to buy and pack, sized for them, for a
stay-at-home bin (sheltering at home), a go bag (leaving fast), or both.

## Run it

```bash
npm install
npm run dev       # http://localhost:3000
npm test          # list-engine tests (vitest)
npm run build     # production build
```

## How it works

- **Wizard** (`/build/[step]`): one question per screen, 10 steps for Basics, plus 2 more for
  Advanced (days at home and power). Every step has a default, so pressing Continue all the way through still gives a
  good list. Each step is its own URL, so the browser Back button and page titles work.
- **List** (`/list`), top to bottom:
  1. The heading, a one-line "Planning for" summary (answer badges that link to their wizard step), and
     a "Happening now?" link to the When it happens card.
  2. **Start here:** up to 6 free first-weekend steps, highest `startRank` first.
  3. **The essentials** (`Essentials.tsx`, keys in `src/data/essentials.ts`): the short list to get
     and put away first, with "x of N" progress and a finish state. Rows are the same rows as the full
     list, so checkmarks are shared. The budget answer sets the order (`essentialsPlan.ts`): for $0,
     free ways and things already at home come first; for $50 and $150, a line marks where the money
     roughly runs out (middle of each cost range, in `BUDGET_ORDER`); anything else is grouped by kit.
  4. **Save your list** (after the first checkmark), then the export row.
  5. **Your full list:** the size toggle (Basics, 1 week / Advanced, 2 weeks + extras), kit progress
     bars (only once something is checked), and three views: by kit, a shopping list with checkboxes,
     and a weekend / month / later plan. Long plan steps split into "Do or gather, free" and "To buy"
     (sorted by store). Around-the-house tasks are grouped into Make a plan, Neighbors and community,
     Sign-ups and paperwork, and Make your home safer. Items can be marked "have it" or skipped, and
     essentials get a small tag. Advanced items sit in a collapsed "When you're ready" group for
     Basics users.
  6. **When it happens** (`src/data/firstHour.ts`), with its own Print button. Also a spreadsheet tab.
  7. **Know your home**, **Keep it fresh**, and "Clear everything on this device".
- **OK / HELP sign** (`/sign`): a printable window sign, linked from the list.
- **Privacy:** answers live in `localStorage`. Share links carry the answers in the URL fragment,
  so nothing is sent to a server. See "Saving, offline, and the Home Screen app" below.

## Spreadsheet export

"Download spreadsheet" on the list page builds an `.xlsx` in the browser (`src/lib/exportXlsx.ts`,
using ExcelJS, loaded only on click). It opens in Google Sheets, Excel, or Numbers.

- **Overview:** progress at a glance (to-dos done, supplies ready, still to buy, food and water to
  replace), the next check-up date, days at home, a "Your people" list that names the
  per-person columns and feeds the Who dropdowns, a "Know your home" section with blanks for what
  the to-dos ask people to find out (shutoffs, breaker box, meeting spots, spare key), and free
  "Notes and reminders" rows.
- **To-dos:** grouped into This weekend, This month, and Later, with Status (To do, Done, Skip),
  Who, and links.
- **Supplies:** grouped by kit, with Status (Need, Have, Skip), who's buying, rough cost, an
  example product, and a Notes column (e.g. "the radio is in Sam's go bag"). Stay-at-home bin amounts follow **Days at home** on the Overview tab.
- **Expiration dates:** things that expire or need a regular check, grouped by whose they are: an
  **Everyone** section for shared supplies (food first), then one section per person for their
  own go bag. Rows are pre-filled for the household
  (`src/data/expiring.ts`) with a default **Replace every**, plus blank rows. Enter **Packed on**
  or the **Date on package**, and **Due by** and **Heads-up** (Due now, Due soon, Good) fill in on
  their own. The Overview counts these. In Apple Numbers, only Date on package calculates.
- **Neighbors:** a blank sheet for numbers swapped with people nearby. Neighbors' details are never
  stored in the app or put in a share link, so this is the only place they go.
- **When it happens:** the first-hour card, sized to print on one page.
- **Know your home** (`src/data/homeFacts.ts`): shutoffs, meeting spots, where the bins are, and
  so on. Fields show on the task they belong to and in a card on the list, plus a notes box. They
  stay on the device and go into the spreadsheet's Overview, but never into share links.
- **Per-person checkboxes:** items marked `perPerson` in `items.ts` are tracked for each person, in
  the app (a toggle per name) and in the spreadsheet (a Done / Not done column per name from "Your
  people" on the Overview tab). In the go bag that's every bag (backpack, water, headlamp, and so
  on). For to-dos it's every adult (alerts, phone setup, IDs). Status works itself out: Need,
  Partly, or Have. Household items (radio, first aid kit, cash, documents) stay as one each, and
  their person cells are greyed out.

Per-person columns are a Done / Not done dropdown (yellow until done, then green). Plain text
values behave the same in Google Sheets, Excel, and Numbers, which real checkboxes don't: Google
Sheets doesn't keep checkboxes from an .xlsx file.

Fonts are Lexend and Roboto, both in Google Sheets' default font list. Colors carry meaning:
green for done, amber for soon, orange only for "replace now". Everything else is navy and grey.

## Where things live

| Path | What |
|---|---|
| `src/data/items.ts` | Every item and task: which kit, Basics or Advanced, which hazards, quantities, costs, tips, example products |
| `src/data/counties.ts` | County alert systems, CERT and neighborhood program links, default hazards |
| `src/data/firstHour.ts` | The "When it happens" card |
| `src/data/hazards.ts`, `meta.ts`, `havePicks.ts` | Labels and groupings |
| `src/lib/answers.ts` | Answer defaults, allowed values, household math (`deriveContext`) |
| `src/lib/exportPdf.ts` | The PDF download. The Print button prints this same PDF, so the two always match |
| `src/lib/share.ts` | Share links, packed bit by bit (see the comment at the top) |
| `src/lib/buildList.ts` | Turns answers + items into the list. Pure and tested |
| `src/components/wizard/` | Wizard steps and step titles |
| `src/components/list/` | Results page. `essentialsPlan.ts` (budget order and cutoff) and `sharing.ts` (save prompt, private links, pasted links) are pure and tested |
| `src/lib/ics.ts` | Calendar events and the twice-yearly reminder dates. Tested |
| `src/lib/storage.ts` | The `localStorage` store behind `useStored`, and "Clear everything" |
| `src/app/manifest.ts`, `public/sw.js`, `public/icons/` | The installable app and its offline copy |
| `research/` | Source research: `supplies.md` (items, numbers, sources) and `ux.md` (question flow, presentation) |

### Saving, offline, and the Home Screen app

Everything is saved in the browser, so the main risk is losing it. Safari on iPhone deletes a site's
saved data after about 7 days of use without a visit. The defenses, in order:

- **The link is the backup.** Calendar events (Start here and the twice-yearly reminders) carry the
  full share link as "Your list". After the first checkmark, a "Save your list" card offers Copy
  link, Email it to myself (`mailto:`, no server), and Add to Home Screen steps. Hiding it sets
  `bayready:savePrompt:v1`.
- **Opening your own link** (one that matches what's saved on this device) just shows your list.
  Opening a different list shows the "list from a link" banner, and "Make it my list" asks before
  replacing a list already saved here.
- **The empty state** says lists can be cleared and takes a pasted link. That's also how the Home
  Screen app on iPhone gets a list: it has its own storage, separate from Safari, and starts empty.
- **Home Screen apps** aren't subject to Safari's 7-day rule, and they work offline.
- **Clear everything on this device** removes every `localStorage` and `sessionStorage` key starting
  with `bayready:`. Give any new saved key that prefix so it's cleared too.
- Hashes on `/list` are either a share code or a jump to a section. The sections links can jump to
  are in `LIST_ANCHORS` (`sharing.ts`); add new ones there, or the hash is read as a list.

The Home Screen app: `src/app/manifest.ts` becomes `manifest.webmanifest`, with `start_url` (the
list), `scope`, and icon paths built with `sitePath`, so they include `/bayready` on GitHub Pages.
The icons in `public/icons/` are drawn from the same tag as `src/app/icon.svg`.

The offline copy: `public/sw.js`, registered by `src/components/ServiceWorker.tsx` in production
builds only (`npm run dev` never registers it). Pages are network first, so a deploy shows up on the
next online visit; files under `/_next/static`, icons, and fonts are cache first, since their names
change when their contents do. On install it saves the home page, the list, the sign, and Sources,
plus every built file they use. It reads its own scope, so it works at `/` and at `/bayready/`.
Bump `VERSION` at the top of `sw.js` to throw away every saved copy. To try it, build with
`PAGES_BASE_PATH=/bayready npm run build`, serve `out/` under `/bayready/`, open the list once, then
go offline in dev tools and reload.

Reminders (`twiceYearlyChecks` in `src/lib/ics.ts`) repeat every year on the second Sunday of March
(the spring time change, 10am) and the third Thursday of October (the Great ShakeOut, 6pm). The
.ics file holds both. Google Calendar can only add one at a time, so the menu has one item for each.

### Share links

Links hold the answers and checkmarks, never Know your home or notes. Answers include names and
health needs, so when there are any, the share dialog says so and offers a link without them
(`withoutPersonalInfo` in `sharing.ts`: names cleared, needs unanswered). They're packed bit by bit
(see the comment at the top of `src/lib/share.ts`) and built so links people already sent keep
working as the app grows:

- **New item:** add its id to the end of `SHARE_IDS` in `src/data/shareIds.ts`. A test fails until
  you do. Never remove or reorder entries there, even for items you delete.
- **New answer option:** add it to the end of its list in `answers.ts` or `havePicks.ts`. Never
  remove or reorder.
- **New question:** add it at the very end of the link, behind a 1-bit "present" flag.
- A test decodes a link made in October 2026. If it fails, something above was broken.

### Adding or changing an item

Add an entry to `ITEMS` in `src/data/items.ts`. The main fields:

- `containers`: `stay`, `go`, `car`, or `home` (a one-time task)
- `level`: `basics` or `advanced`. Use `promote` to move an advanced item into Basics for some
  households (for example, a power station for people with powered medical devices)
- `hazards`: `"all"` or a list. The item shows if any listed hazard is picked
- `when`: any other condition (pets, babies, home type, and so on)
- `coveredByGo`: when someone builds both kits, skip the stay-at-home bin copy because the go bag is at home
- `examples`: product links shown as examples, not endorsements

Then run `npm test`. The data tests check that ids are unique and that every item evaluates
cleanly for a household that triggers everything.

## Key decisions (see `research/` for sources)

- **Basics = 7 days at home, Advanced = 14.** Bay Area agencies (ReadySF, EBMUD, Cal OES) recommend
  about a week, and the CDC and Red Cross say two weeks. The water line suggests starting with 3 days.
- **Go bag water is about 1 liter per person plus purification.** Three days of water (about 25 lb)
  is too heavy to carry, so the car kit holds the rest.
- **The stay-at-home bin doesn't duplicate go bag gear** when someone builds both.
- **Chemical release** is pre-checked in Contra Costa and Solano (refinery areas).
- **Keep Basics short.** Lists ran 1.8 to 3 times the ~20-item target in `research/ux.md`, so new
  Basics rows should replace or merge with an existing one. Prefer adding to a `tip`.
- **Neighbors, not just supplies.** Check-ins are framed as offers ("ask if they'd like a
  check-in"), and the person with an access need lines up their own support network. Nothing asks
  people to list who they think is vulnerable.
- **Renting and owning aren't inferred from home type.** Rows where the job is usually the
  landlord's say so in the copy.

## Before launch

- Prices are rough estimates (`cost` in `items.ts`). Spot-check them against real stores.
- County alert, CERT, and neighborhood links were checked on 2026-10-11. Recheck them periodically.
- The OK / HELP sign's translations (Spanish, Chinese, Filipino, Vietnamese) deserve a native
  speaker's read.
- Items marked "unverified" in `research/supplies.md` (CAL FIRE wording, landslide signs, and
  others) deserve a human read.

## ZIP code lookup

The county step has an optional ZIP code field. `src/data/zips.ts` maps every ZIP code in the ten
counties (457, including PO box ZIPs) to its county and two flags:

- **EBMUD:** EBMUD serves most of the ZIP code. When the ZIP is known, it sets `ctx.ebmud` instead
  of the county guess (Alameda and Contra Costa), so Fremont, Pleasanton, and Concord no longer get
  EBMUD's 2-gallon advice, and Orinda and Danville still do.
- **Tsunami:** part of the ZIP code is in the California Geological Survey's mapped tsunami hazard
  area. It pre-checks tsunami on the hazards step, with a note saying why.

A known ZIP also picks the county, and the person can still change it. An unknown ZIP gets a short
note and changes nothing. "Prefer not to say" for the county clears the ZIP. The ZIP is
`answers.zip` (five digits or null) and rides at the end of share links.

Limits, all noted in the header of `zips.ts` with sources:

- It's ZIP-level. Water districts and tsunami zones follow streets, and most flagged ZIPs have only a
  shoreline strip in the zone. The hazards step links to MyHazards for an address-level check.
- Split ZIPs go to the county with the most land, except a few where nearly everyone lives in the
  other county (Petaluma 94952, East Palo Alto 94303, Calistoga 94515, Berkeley hills 94708, Los
  Gatos 95033). ZIPs mostly outside the ten counties (Mountain House 95391 and a few on the Yolo,
  Sacramento, San Joaquin, and San Benito lines) aren't listed.
- Partial EBMUD ZIPs (Hayward 94541 and 94542, Castro Valley 94552, Walnut Creek, Pleasant Hill,
  Martinez, Canyon) are marked by majority and noted in the file. The water board's boundaries are
  self-reported from 2019.
- The CGS layer includes the Napa River and Petaluma River shores, so some Napa ZIPs are flagged
  even though `counties.ts` lists Napa without a tsunami area.
- Recheck it when USPS adds ZIPs or CGS updates its maps.
