# Expert review of Bay Ready (October 2026)

## How this was done

Six reviewers each took one expert role, read the code and three sample households' lists, looked at screenshots and the PDF, and did their own web research. The roles:

1. A Bay Area **emergency manager** (county OES, CERT/NERT trainer)
2. A **risk communication and preparedness-behavior** researcher
3. An **access, functional needs, and equity** specialist
4. A **disaster public health** clinician
5. A **government UX and service designer**
6. A **household and neighborhood preparedness** educator

**These are AI agents playing experts, not real experts.** Their citations are real links, but a few sources were only checked through secondary copies, and nothing here replaces review by a county OES, a NERT/CERT trainer, a clinician, and real users. Treat this as a well-researched first pass that tells you what to ask real experts about.

The full reports are in this folder (`1-` through `6-`). The sample lists they reviewed are in `sample-lists.txt`:
- **A:** solo SF high-rise renter, Basics
- **B:** Oakland hills family with a baby, two kids, a dog, and a cat, Basics
- **C:** older Santa Cruz couple with oxygen or CPAP, insulin, and a mobility aid, Advanced

## The short version

All six said some version of: **this is better than most prep tools out there, including some agency pages, but it's a shopping list with a plan stapled to the front.**

What they liked was consistent: calm tone, real quantities, local detail, correct water and gas advice, sanitation in Basics, privacy, and access needs treated as normal rather than an appendix.

What they flagged was also consistent. Each item lists the reviewers who raised it, numbered as in the role list above (1 = emergency manager, 2 = risk communication, 3 = access and equity, 4 = public health, 5 = UX, 6 = household and community):

1. **It's too long and nothing is ranked.** A solo renter gets 45 items, a family 91, and the older couple 128. The family's PDF is 11 pages. Water counts the same as wet wipes. *(2, 3, 5, 6)*
2. **The "When it happens" card is the most important thing in the app, and it's thin, buried, and sometimes wrong for the household.** *(all six)*
3. **People, plans, and practice are demoted.** Meeting neighbors, CERT, the work kit, drills, and reunification are Advanced or a single checkbox, while cooling towels are Basics. *(1, 2, 4, 6)*
4. **Medical-device and mobility advice is unsafe in places.** Oxygen users get a camp stove with no fire warning, a battery that can't run a concentrator, and "walk a mile inland." *(1, 2, 3, 4)*
5. **Nothing brings people back, and the data can disappear.** Safari clears localStorage after 7 idle days, and the reminders link to an empty list. *(2, 5, 6)*
6. **English only, and the PDF silently deletes Vietnamese and Chinese characters.** *(all six)*

Below: the safety fixes, the full set of themes, factual corrections, disagreements between reviewers, and a suggested order of work.

---

## Must fix before sharing widely (safety)

These are the items where the app could get someone hurt. Most are text changes.

**Status: all ten fixed on October 14, 2026.** Home oxygen is now its own answer in the health step, and `src/data/safety.test.ts` checks these rules so they don't regress.

| # | Problem | Where | Fix |
|---|---|---|---|
| S1 | Oxygen users get a camp stove, fuel, and a lighter with no fire warning | `stove`, `lighter`, `device-power` | Split the "powered device" need into CPAP, oxygen, and other. For oxygen, add a Basics task: no flames or smoking in the home, tanks 10+ ft from stoves, cook outside away from the oxygen user. |
| S2 | "A DC car cord lets you run some devices from a car" with no carbon monoxide warning | `device-power` | "Only with the car fully outside, never in a garage, even with the door open, and never while someone sleeps in it." |
| S3 | A battery for a medical device is priced at $100–400 to run 72 hours. That's impossible for an oxygen concentrator (250–600 W) | `device-power`, `power-station` | Runtime by device type. Oxygen: backup cylinders, the supplier's number, and where to go to plug in. CPAP: turn off the humidifier and heated tube. Put the device and its charger in the go bag. |
| S4 | The mobility-aid user is told to walk a mile inland for a tsunami. Evacuation assumes walking or driving. | `tsunami-route`, go bag, `routes` | When mobility or no car is picked, add: who helps you out and how; leave at the Warning; vertical evacuation; a wheeled bag. |
| S5 | Heat stroke described as "hot, red, dry skin," with no first aid | `cool-place` | "Skin may be dry or sweaty. Call 911, then cool them right away." Add the fan-above-90°F caveat. |
| S6 | Filter bottles "make tap or stream water safe." Filters don't stop viruses. | `purify-go`, `water-filter` | Default to tablets. "After filtering, add bleach or a tablet, or boil." |
| S7 | Box fan filter is missing EPA's fire-safety conditions, while the app tells people to sleep in that room | `box-fan-filter` | "Box fan from 2012 or later with a UL/ETL mark. Don't use an extension cord." |
| S8 | Insulin guidance stops at storage | `cold-med-pouch`, `rx` | Glucose tablets/glucagon, never let insulin touch ice, the 48-hour pump-tubing limit, backup pens, a sharps container. |
| S9 | Wildfire guidance never explains Evacuation Warning vs. Order | card, `evac-zone`, `red-flag` | A short alert-levels block. "Leave at the Warning" for households with young kids, pets, mobility or medical needs, or no car. |
| S10 | The card says "take your go bags" to households with no go bag. On the coast, tsunami is step 6 instead of step 2. | `firstHour.ts` | Filter lines by kit and hazard. For coastal households, tsunami comes right after Drop, Cover, and Hold On. |

---

## Themes, with what each reviewer said

### 1. Prioritization and overwhelm
- **The problem.** Basics isn't basic. Lists are 45–128 rows of equal weight. The builder's own research targeted a 1–2 page Basics printout, 7–8 wizard questions, and a 3–5 item weekend card, and the shipped version drifted from all three (2, 5).
- **Fix: a "core" tier above Basics,** e.g. *"Ready for 3 days: the 8 things that matter most"*: water, toilet plan, meds, light, radio or power bank, cash, the plan, alerts. Give it its own finish line and make it the default view (2, 5).
- **Fix: within each kit,** show the top ~10 essentials and put "Also useful" behind a disclosure (5).
- **Fix: measure progress in outcomes, not item counts:** "Water: 3 of 7 days" or "You could get through about 3 days without tap water" (2, 5).
- **Fix: the label "Ready for: Quake, outage, wildfire" at 0% done** should say "Planning for" (2).

### 2. Kit vs. plan (actions, people, practice)
- **The problem.** For the Oakland family, roughly 70 of 91 rows are purchases. Advanced or "later" holds `block`, `training` (CERT/NERT), `offer-ride`, `work-kit`, the home video inventory, and the financial first aid kit. Basics holds cooling towels and a comfort item (1, 6).
- **The evidence the reviewers cited.** In Kobe, about 75–80% of people pulled from rubble were rescued by family and neighbors. Aldrich's work finds social ties predict recovery better than damage does. Only 12% of US households plan with neighbors (FEMA 2023). The builder's own research marked neighbor actions as Basics (6).
- **The problem: one checkbox for the whole household plan.** "Make a household plan" bundles five or more decisions into one tick, and the PDF prints only the title (6).
- **The problem: almost no practice.** Drop, Cover, and Hold On is the only drill (1, 2, 6).
- **Fix: three tracks with equal weight,** **Plan**, **People**, and **Supplies**, each with its own progress (1, 2, 6).
- **Fix: move a light "meet 3 neighbors" step into Basics** and tie the OK/HELP sign to it (6).
- **Fix: split the household plan** into 4–5 tasks, with wallet cards and a backpack card for each kid (6).
- **Fix: add a Practice group:** a 10-minute evacuation with pets, a night fire drill, a test text, and a walk to the meeting spot (6).
- **Fix: make Stop the Bleed or CPR a Basics task** for one adult. The bleeding control kit is Advanced but training isn't suggested, which contradicts the app's own "don't pack anything you don't know how to use" (2, 4).

### 3. The "When it happens" card (all six)
- **Missing for quakes:** check for fire; the electrical fire risk when power comes back; no switches, phones, or flames if you smell gas; 911 only for life threats; stairs, not elevators; don't re-enter damaged buildings; if trapped, tap a pipe or use the whistle.
- **Missing for other hazards:** smoke, heat, carbon monoxide symptoms, medical devices, and kids at school ("don't call or rush the school").
- **Missing situations:** being away from home (driving, BART, work), and a fallback if you can't reach anyone.
- **Placement:** it renders after the whole list and on PDF page 6 of 11, with "tape this inside your bin," but you need it when you're *not* at the bin.
- **Fix:** make the card a first-class, one-page artifact organized by time (first minutes / first hour / today / coming days), fill it in from Know your home, link it from the top of the page and the home page ("Happening now?"), and have an EM professional review it (1, 5).

### 4. Health and safety accuracy (4, with 1 and 3)
See the safety table above and the factual corrections below. Beyond those:
- The food plan's calorie claim is wrong in three ways: it's misattributed to Ready.gov, it reaches only about 700–800 kcal with lean picks, and it rations kids at 0.7 of an adult when rationing guidance excludes children and pregnancy.
- Babies 0–24 months get one plan regardless of age.
- First aid is thin: no irrigation, no tetanus check. A family that builds both kits ends up with only the small go-bag kit, because `first-aid` is `coveredByGo`.
- Sanitation doesn't scale: one bucket and 30 bags whether there are 1 or 7 people, with no disposal or handwashing guidance (1, 4).
- Little kids get N95s and phone power banks (1, 4, 5, 6).

### 5. Access, functional needs, and equity (3, with 1 and 4)
- **The health-needs question is too narrow.** It's missing deaf/hard of hearing as a communication need, blind/low vision, speech, dementia and cognitive disability, mental health, dialysis, caregivers, service animals, pregnancy, and methadone/buprenorphine. Needs are household-wide, not per person. "Prefer not to say" silently removes every health item.
- **Fix:** rebuild the question around functions (the federal CMIST framework), let needs be assigned per person, and have "Prefer not to say" add generic health items rather than remove them.
- **Medical Baseline:** it also covers conditions, not just devices, and needs a doctor's signature, so it isn't a "this weekend" task. The app never says to answer PG&E's shutoff calls.
- **DDAR battery eligibility:** requires a high fire-threat district or 2+ planned shutoffs, and supply is limited, but the app shows it to everyone, including SF high-rises.
- **Other utilities:** municipal customers (Alameda, Palo Alto, Santa Clara, Healdsburg) are left out because everything assumes PG&E.
- **Housing types:** SROs, vehicles and RVs, staying with others, board-and-care, and unstable housing are all missing.
- **Communication access:** text-to-911, flashing alerts, and communication cards are missing. The battery radio is presented as the lifeline for news, which doesn't work for deaf users.
- **Medicine refills:** nothing explains *how* to get extra medicine: Medicare Part D refill-too-soon waivers, California plan duties, the pharmacy "vacation override," and controlled substances.
- **Privacy:** there's no "clear my data" button. Share links include names and health needs, but the needs step says "This stays on your device."
- **Missing safety notes:** undocumented families (Red Cross shelters don't ask about status), domestic violence, LGBTQ+ needs (hormones, ID mismatch), mental health (Disaster Distress Helpline 1-800-985-5990, 988).

### 6. Cost and the budget question (2, 3, 5)
- **The problem.** `stageOf()` only reorders items. "Under $50" and "$50–150" produce identical lists, and the "more" branch is a no-op. The solo renter who said $50 sees $285–640 with no acknowledgment. The family sees $745–1,850.
- **Fix: make budget do something.** A "Your first $50" path, a "$0 plan" from your own kitchen, free alternatives next to paid items (refill tap jugs instead of buying water), and free and paid totals shown separately.
- **Fix: a "help paying" section:** DDAR, Medi-Cal/Medicare for medical equipment, CalFresh, food banks, free N95s, Brace + Bolt's income-eligible supplement, 211.
- **Disagreement.** The emergency manager *praised* the budget answer for reordering without hiding anything. Everyone else said the question should either change what's shown first or be cut.

### 7. Onboarding and the wizard (2, 5, 3)
- **Length.** The home page promises "a few quick questions, about 3 minutes." There are actually 10 steps (12 on Advanced), against the builder's own 7–8 target. Two pages ask more than one question.
- **Questions that do little.** The budget question (see above); car only matters on Advanced; "start" only changes a heading.
- **Order.** The first question asks a novice to choose bin vs. bag before they've thought about hazards.
- **Fix: reorder.** County → hazards → household → needs → have, then *suggest* the kit. Move home type, car, level, and power onto the results page as refinements.
- **Fix: replace "This weekend / couple of weeks / this month"** with a real if-then plan: day and time, where the bin will live, who's helping. Echo it back in the calendar event and on page 1 of the PDF (2).
- **Missing questions** (1, 6): "On a weekday, where is everyone?" (home / same city / across a bridge / school), and "Anyone outside your home you'd check on?"
- **Accessibility details:** Continue is disabled with no explanation, the +/− counters don't announce their new value, and "None" silently unchecks other answers (3, 5).

### 8. Results page, visual design, and outputs (5, with 2 and 3)
- **The first phone screen** is answer badges, a Level toggle, three bars at "0 of 23," and five export buttons. "Start here" falls below the fold. Opening on empty bars undoes the head start the "what do you have" step creates.
- **Fix: rebuild around "Your next step":** Start here right under the heading as the only primary action, answers collapsed to one line, and kits shown as collapsed sections with a count and cost.
- **Exports.** There are five export buttons, plus four more print buttons and two calendar menus. **Download spreadsheet is the only orange button**, on a page mostly used on phones (2, 5).
- **Fix:** one "Save or share" menu, and a short default printout (Know your home, When it happens, and a 1–2 page checklist) with the full PDF as an option.
- **Rows are crowded.** A single row can have a checkbox, name chips, a hover-only Edit names link, Skip, Why this, a link, and text fields.
- **"Have" is all-or-nothing.** Ticking "Bottled water" in the wizard marks "Drinking water: 7 gallons" done.
- **Labels:** "Advanced" sounds like a skill level, and "Level up" is game jargon. Suggested renames include "1 week" / "2 weeks + extras" and "Check your kit twice a year."
- **Accessibility:** the PDF has no tags or language setting, and Print now goes through that PDF, so screen readers and browser zoom don't work with it. Text field borders are 1.53:1, below the 3:1 minimum (3, 5).
- **Shopping mode:** the Shopping list view has no checkboxes for use in the store.

### 9. Follow-through, persistence, and maintenance (2, 5, 6)
- **What the evidence says.** Preparedness gains fade by about 3 months without repeated contact. A 2024 meta-analysis found only small effects from one-off interventions (2).
- **Data loss.** Safari clears script storage after 7 days without a visit. The calendar events link to the bare `/list` URL, so a returning iPhone user likely sees "You haven't built a list yet." Their Know your home notes are gone (5).
- **Sharing is broken in small ways.** Share links are snapshots, so two adults immediately drift apart. "Make it my list" overwrites the recipient's list without warning. The PDF's "Open this list online" opens your own list in shared mode (5).
- **The plan lives on one phone.** Know your home is device-only, so the second parent and the teens never see it (6).
- **The refresh log is too much.** About 58 rows for the family is a project, not a check (1, 2).
- **Calendar mismatch.** "When the clocks change" is promised, but the event fires 6 months from today.
- **Fix: a reminder sequence** that carries the full share link: weekend, shopping trip, day 30, twice a year (2, 5).
- **Fix: a "Save your list" prompt** after the first checkmark: copy link, email to myself, or add to home screen, which escapes Safari's cap. Warn before "Make it my list" overwrites anything, and change the empty state to say how to restore a list (5).
- **Fix: a seasonal rhythm** (6):
  - August: school emergency cards
  - June: wildfire evacuation drill
  - October: ShakeOut and plan review
  - Spring time change: supplies
- **Fix: consider an installable web app (PWA)**, which also works offline when the network is down (5).

### 10. Away from home, reunification, and recovery (1, 6)
- **Commutes.** The app assumes everyone is home. After Loma Prieta the Bay Bridge was closed for about a month, and BART holds trains after shaking. The work kit and a get-home plan should be Basics for commuters.
- **Schools.** `school-plan` isn't in Start here even for families. It needs to cover each child, daycare, teens (who may self-release), photo ID, refilling the card every year, and "don't call the school."
- **Recovery is missing.** Nothing on green/yellow/red building tags, photographing damage, loss-of-use coverage, FEMA vs. SBA (renters can get SBA loans), contractor fraud, or Local Assistance Centers.
- **Water after storage runs out.** Nothing explains what happens when stored water is gone during a 6-week outage: distribution points, what's safe for flushing vs. drinking.

### 11. Hazards and local accuracy (1, 6)
- **County is too coarse.**
  - Tsunami is never pre-checked, even for Alameda, the Marina, and downtown SF.
  - Flood is pre-checked in only 3 counties.
  - Liquefaction appears nowhere.
  - Landslide is Advanced, and dam failure isn't covered.
- **Fix:** an optional ZIP or address lookup, kept on the device, would unlock water utility, tsunami zone, liquefaction, and evacuation zone. Even one question would help: "Do you live, work, or go to school near the shoreline?"
- **Wrong local links.**
  - Oakland households are pointed to Alameda County Fire CERT, which doesn't serve Oakland. Oakland has its own program, CORE.
  - Santa Cruz, Sonoma, and Napa need their own local radio stations.

### 12. Trust, credibility, and language (2, 3, 4, 5)
- **No visible authorship.** Nothing says who made it, "not affiliated with any agency," a "last reviewed" date, or how to report an error.
- **A contradiction on the Sources page.** It says "we pick the more careful number," but uses 1 gallon of water a day where EBMUD says 2.
- **No clinician sign-off on health content.** A dated sign-off would take about 2 hours per release.
- **English only.** Start with the card and the one-page plan in Spanish and Chinese. Fix the PDF font first so names survive: embed a Noto subset.
- **Framing.** Delete "few people sign up," a negative norm that makes not signing up seem normal. Retest "camping at home" with non-campers, since it may undersell a weeks-long water outage (2).

---

## Factual corrections

Verify these before changing anything; the reviewers cite their sources in the full reports.

| Claim in the app | What reviewers found | Source in report |
|---|---|---|
| Basics water: 1 gal/person/day for East Bay homes | EBMUD says 2 gal/person/day for at least 7 days. The app's own research recommended 2 as the East Bay default. | 1, 4, 5 |
| "7 days: what SF, EBMUD, and Cal OES recommend at a minimum" | Cal OES says a 72-hour minimum, a week preferred. EBMUD's 7 days are at 2 gal/day. | 1 |
| "1,200–1,500 calories a day… Ready.gov says" | Not on Ready.gov. The older "half your usual intake" guidance excludes kids and pregnancy. | 1, 2, 4 |
| `shutoffs` tip implies water-heater water is clean to drink | EBMUD says not to drink it, and the `water-heater` item already says so. | 1, 4 |
| Gas: "only PG&E can turn it back on, which can take days" | After a regional quake, expect weeks. | 1 |
| PSPS: "usually a day or two ahead" | Sometimes only 1–4 hours. | 1 |
| "PG&E shutoffs averaged about 55 hours in 2019" | That was one late-October event. Others averaged 14–37 hours. Say "two to three days or more." | 3 |
| Tsunami: "100 ft or a mile inland, on foot" | California guidance often says 2 miles. Lead with "know your mapped zone." For the Bay shoreline with a distant tsunami, follow orders. | 1, 4 |
| CO alarms: replace at 5–7 years | Follow the manufacturer's date, usually 7–10 years. | 4 |
| "Candles are a leading cause of fires after earthquakes" | Unsourced. Gas and electrical ignitions dominate. Say "a common cause." | 2, 4 |
| "Local calls fail but long-distance calls get through" | That's landline-era advice. The value of an out-of-area contact is being a relay outside the damage. | 6 |
| OK/HELP sign "tells neighbors and crews" | It's for neighbors. Don't imply responders scan windows. | 6 |
| Alameda County CERT link for Oakland | Oakland has its own program, CORE. | 6 |
| "Spare parts for mobility aids: $10–60" (includes a power-chair battery or backup chair) | Understated by about 10×. | 3 |
| Needs step: "This stays on your device" | Needs are encoded in share links. | 3 |
| `phone-setup`: satellite is for 911 | Newer iPhones can also text contacts by satellite, outdoors only. | 6 |
| Road flares in the car kit for Red Flag areas | Can start fires. Reflective triangles are safer. | 4 |
| Home page example list ("Food you don't have to cook," "Pet food and water," "2 of 5 ready") | Rows that don't exist anymore, and it sets an expectation of about 5 items. | 2, 5 |

---

## Where the reviewers disagree, or where fixes pull against each other

- **Shorter list vs. more coverage.** Every reviewer added things (dialysis, pregnancy, recovery, drills, reunification) *and* most said the list is too long. The way out is structure, not more rows: a short core tier, three tracks, and reference material behind disclosures. New content should mostly land as tasks and card lines, not purchases.
- **A go bag for everyone vs. a stay-at-home emphasis.** The emergency manager says Basics should always include a small per-person grab bag (ReadySF says so too, and HayWired projects 400,000+ displaced). That adds rows. A tiny grab bag inside the core tier would satisfy both.
- **Privacy vs. a shared household plan.** The household educator wants the plan shareable with the other adults and teens. The access reviewer wants *less* in share links (no names or health needs by default). The resolution is an explicit opt-in toggle with a warning, plus a printed one-page plan as the main shared copy.
- **Print = PDF.** You asked for Print and PDF to match, and they now do. The UX and access reviewers point out that the PDF is untagged and can't be zoomed, so Print is now less accessible than the browser's own print. Options: tag the PDF (hard with jsPDF), or make the HTML print stylesheet match the PDF and keep the PDF as a download.
- **Spreadsheet as the primary button.** You asked for this. The UX and behavior reviewers argue the primary action should be the first real step, not an export, since most visitors are on phones. Worth testing.
- **Budget.** As above: the emergency manager liked that it never hides anything, and the others say it has to change what's shown first or be removed.
- **Refresh log.** You asked for it, and it's well designed. Two reviewers think a 5-page log is more upkeep than people will do and suggest a 10-item twice-a-year check on paper, with the detailed log in the spreadsheet.

---

## Suggested order of work

**1. An afternoon of text fixes.** These are mostly `items.ts` and `firstHour.ts`:
- the safety table (S1, S2, S5–S8, and S3's text)
- the factual corrections table
- card lines for smoke, heat, CO, devices, and kids at school, filtered by kit and hazard, with tsunami moved up
- age rules so little kids don't get N95s or power banks
- delete "few people sign up"
- "Ready for" → "Planning for"
- fix the home page example list
- add a "made by / not affiliated / last reviewed / report a problem" line

**2. A week of structural changes:**
- A core tier ("Ready for 3 days") as the default view, with Start here at the top of the page as the main action and exports folded into one menu.
- Move `block`, `training` (or a Stop the Bleed/CPR task), and `work-kit` (for commuters) into Basics. Split the household plan into tasks, and add a Practice group.
- EBMUD households get 2 gallons in Basics. Scale the toilet to the household size.
- Split the health-needs question: CPAP, oxygen, other device, dialysis, diabetes, pregnancy, communication needs, caregiver. Make "Prefer not to say" add generic items. Add mobility and no-car evacuation tasks.
- Make the budget answer do something, or cut it.
- Add a "clear my data" button, a share link without names and health needs, a "Save your list" prompt, and calendar events that carry the full link.
- Embed a font in the PDF so non-Latin names survive.

**3. Bigger bets:**
- A one-page household plan with wallet and backpack cards as the main printed output, and the card reorganized by time.
- A reminder sequence and seasonal rhythm. Consider an installable PWA for offline use and to escape Safari's 7-day storage limit.
- An optional ZIP/address lookup for hazards and the water utility. City-level CERT/CORE links.
- Translation, starting with the card and the plan in Spanish and Chinese.
- A recovery section ("After: the first weeks").
- Real review: a county OES or NERT/CORE coordinator for the card and plan, a clinician for health text, and 8–10 moderated user sessions. Include a renter in a tall building, a parent of young kids, someone 70+, someone who uses a powered medical device, and Spanish and Cantonese speakers. Run one tabletop exercise: "4:40 pm Tuesday, M7.0 Hayward, you're in SF, your partner is in San Jose, the kid is at after-care in Oakland, the dog is home."

## Questions the panel would ask you

1. Who is this for: people starting from zero, or people already halfway there? The answer sets how long Basics should be.
2. What counts as success 90 days after someone builds a list, and how would you know without accounts or tracking?
3. Would you accept a short core view as the default, even though it hides most of what you've built?
4. Would you add an optional ZIP or address (kept on the device) to get hazards and the water utility right?
5. Who reviews health and safety text, and on what schedule?
6. Is there a local partner (NERT, Oakland CORE, a county OES, a library system, an Independent Living Center) who would review, co-sign, or distribute this?
7. Is translation on the roadmap, and which languages first?
8. Have you opened the site on an iPhone after a week away?
