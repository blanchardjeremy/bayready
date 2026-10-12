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

- **Wizard** (`/build/[step]`): one question per screen, 9 steps for Basics (10 when a hazard like
  wildfire means people may need to leave, which adds the car question), plus 2 or 3 more for Advanced. Every step has a default, so pressing Continue all the way through still gives a
  good list. Each step is its own URL, so the browser Back button and page titles work.
- **List** (`/list`): grouped by kit (around the house, stay-at-home bin, go bag, car), with a "Start here"
  card of free first steps, a shopping view, and a weekend / month / later plan. Items can be marked
  "have it" or skipped. Advanced items sit in a collapsed "Level up" group for Basics users. Start
  here takes up to 6 free first-weekend steps, highest `startRank` first. A "When it happens" card
  (`src/data/firstHour.ts`) has its own Print button and is also a spreadsheet tab.
- **OK / HELP sign** (`/sign`): a printable window sign, linked from the list.
- **Privacy:** answers live in `localStorage`. Share links carry the answers in the URL fragment,
  so nothing is sent to a server.

## Spreadsheet export

"Download spreadsheet" on the list page builds an `.xlsx` in the browser (`src/lib/exportXlsx.ts`,
using ExcelJS, loaded only on click). It opens in Google Sheets, Excel, or Numbers.

- **Overview:** progress at a glance (to-dos done, supplies ready, still to buy, food and water to
  replace), the next check-up date, days at home, and a "Your people" list that names the
  per-person columns and feeds the Who dropdowns.
- **To-dos:** grouped into This weekend, This month, and Later, with Status (To do, Done, Skip),
  Who, and links.
- **Supplies:** grouped by kit, with Status (Need, Have, Skip), who's buying, rough cost, and where
  to get it. Stay-at-home bin amounts follow **Days at home** on the Overview tab.
- **Expiration dates:** things that expire or need a regular check, grouped by whose they are: an
  **Everyone** section for shared supplies (food first), then one section per person for their
  own go bag. Rows are pre-filled for the household
  (`src/data/expiring.ts`) with a default **Replace every**, plus blank rows. Enter **Packed on**
  or the **Date on package**, and **Due by** and **Heads-up** (Due now, Due soon, Good) fill in on
  their own. The Overview counts these. In Apple Numbers, only Date on package calculates.
- **Neighbors:** a blank sheet for numbers swapped with people nearby. Neighbors' details are never
  stored in the app or put in a share link, so this is the only place they go.
- **When it happens:** the first-hour card, sized to print on one page.
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
| `src/lib/answers.ts` | Answer defaults, household math (`deriveContext`), share-link encoding |
| `src/lib/buildList.ts` | Turns answers + items into the list. Pure and tested |
| `src/components/wizard/` | Wizard steps and step titles |
| `src/components/list/` | Results page |
| `research/` | Source research: `supplies.md` (items, numbers, sources) and `ux.md` (question flow, presentation) |

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
