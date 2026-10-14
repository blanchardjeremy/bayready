# Bay Ready: review from an emergency management practitioner

Reviewer stance: about 20 years in county OES, CERT/NERT lead instructor, ShakeOut and PSPS outreach. I read the wizard (`src/components/wizard/Wizard.tsx`), the item data (`src/data/items.ts`), the card (`src/data/firstHour.ts`), home facts, county and hazard data, the list logic, the builder's research notes, the three sample households, and the PDF export.

## 1. Verdict

This is better than most of the commercial "72-hour kit" sites I see, and better than some agency pages. The water math is honest, the tone is calm, and someone clearly read EBMUD, ReadySF and the CDC. Quake sanitation, PG&E Medical Baseline and DDAR, the clean-air room and the OK/HELP sign are all here, and most consumer tools miss them. But it is still a shopping list with a plan stapled to the front. The homepage says "Build your Bay Area emergency kit list". The Oakland hills family gets 91 rows, and roughly 70 of them are things to buy. The parts that actually decide who lives, who gets out and who recovers are thin, optional, or set to Advanced: what to do in the first ten minutes, evacuation timing, neighbors, and recovery. The two biggest safety gaps are the "When it happens" card, which is short, assumes you're at home, and sits at the bottom of the page and on page 6 of the PDF, and wildfire evacuation guidance that never explains Warning versus Order. Fix those, rebalance toward actions, and this could be a tool I'd hand out at a ShakeOut table.

## 2. What works

- **Honest about water outages.** The hazard blurb ("water for weeks in some areas"), the days step's HayWired hint, and the EBMUD bleach dose all match the sources. SPUR's summary of HayWired: East Bay water service out about six weeks on average, some areas up to six months ([SPUR](https://www.spur.org/news/2018-04-23/haywired-earthquake-scenario-how-we-can-outsmart-disaster)).
- **Sanitation is in Basics.** The bucket, bags, litter, and "Don't flush until you know the sewer is OK" are right. Most kit lists skip this, and after a big quake it is a major public health problem.
- **Gas guidance is correct.** "Only turn off the gas if you smell gas or hear hissing" and "only PG&E can turn it back on" match PG&E ([PG&E gas outages](https://pge.com/en/outages-and-safety/outage-preparedness-and-support/understanding-gas-outages.html)). Too many lists still say "shut off your gas after a quake."
- **Good free first steps.** The "Start here" picks (`firstSteps` in `buildList.ts`) are alerts, a plan, evacuation zone, shoes, flashlight and whistle by the bed, and Drop/Cover/Hold On. They are free and lead with the right thing. Putting alerts first is correct.
- **Access and functional needs basics are covered.** Medical Baseline, DDAR, "Line up a few people who'd check on you" (with the warning not to rely on paid caregivers alone), written medical info, the 28-day insulin note, and ready-to-feed formula per CDC ([CDC](https://cdc.gov/infant-feeding-emergencies-toolkit/php/special-considerations.html)).
- **Local detail.** County alert links, Genasys zone lookup, CGS tsunami maps, soft-story and Brace + Bolt, OK/HELP signs, school pickup cards, and "if you're stuck across the Bay." These are Bay Area realities.
- **Budget handling.** Budget only reorders items and never hides them, and there's a "start with 3 days" fallback for water. That's the right instinct for low-income households.
- **Privacy.** Data stays on the device. That will matter for undocumented and medically vulnerable residents.

## 3. Top problems, ranked

### 3.1 CRITICAL: The "When it happens" card is thin, assumes you're home, and is hard to find

**What's wrong.** `firstHour.ts` has 9 or 10 quake lines and one line each for the other hazards. It is missing:
- **Fire.** No line on checking for fire, or on electrical ignition when power comes back. Japanese fire agencies attribute roughly 60% of quake fires to electrical causes ([Yokohama Fire Bureau](https://en.city.yokohama.lg.jp/bousai-kyukyu-bohan/shobo/oshirase/tsudenkasai-sonae.html)). HayWired models hundreds of ignitions with broken water mains ([SPUR](https://www.spur.org/news/2018-04-23/haywired-earthquake-scenario-how-we-can-outsmart-disaster)). The "Breaker box" home fact exists, but nothing says when to use it.
- **Gas leaks.** Nothing about avoiding switches, phones or flames near a gas smell.
- **911.** Nothing on "911 only for life threats." The FCC/FEMA tip sheet says exactly this ([FCC/FEMA](https://www.fcc.gov/sites/default/files/fcc-fema_tips_for_communicating_during_an_emergency.pdf)).
- **Buildings.** No "use stairs, not elevators" (HayWired: 22,000+ elevator entrapments). No "don't go back into a damaged or red-tagged building." No "if you're trapped, tap and whistle."
- **Away from home.** Nothing for when you're driving, on BART ([BART holds trains in the Tube and tunnels](https://www.bart.gov/node/44666)), or at work.
- **Reunification.** Nothing like "don't drive to school. They'll hold your kids, and the roads are for responders."
- **Tsunami.** Nothing on staying away for hours because waves keep coming.

Persona A (SF high-rise, no go bag) is told "take your go bags and leave," and the `high-rise` item says "Keep your go bag by the door." That household has no go bag.

**Where it lives.** It renders after the full list in `ListView.tsx`, line ~307, and on PDF page 6 of 11, with "Tape this inside the lid of your bin." You need this card when you are *not* at the bin.

**Fix.** Make it a first-class, one-page card. Put it first in the PDF, with a wallet or fridge version. Organize it by time: the first minutes, the first hour, today, and the coming days. Add an "If you're not home" section, with lines for driving, transit and work. Add fire and electrical lines ("check for fire; if you see sparks or smell burning, turn off the main breaker; before power returns, unplug heaters and switch off the stove"). Add "911 for life threats only, text if calls fail," "stairs, not elevators," and "don't re-enter damaged buildings." Have an EM professional review it, because this is the part people will actually read in the moment.

### 3.2 CRITICAL: Wildfire evacuation doesn't explain the alert levels or when to leave

**What's wrong.** For wildfire the card has one line ("if you feel unsafe, leave"). The plan item (`red-flag`) gives two routes and the six P's. Nowhere does the app define **Evacuation Warning** versus **Order** versus **Shelter in Place**, the statewide terms counties use. Solano's own definition: under a Warning, "people needing extra time or with pets and livestock should leave," and an Order is a legal order to leave now. Not every Order starts with a Warning ([Solano Know Your Zone](https://admin.solanocounty.com/depts/oes/evacuation_zones.asp)).

Persona B (Oakland hills, baby, two kids, two pets) and Persona C (older couple with oxygen and a mobility aid) are exactly the households that should leave at the Warning. Neither is told so. There's also no "Set" stage from CAL FIRE's Ready, Set, Go: kit in the car, back in, close windows and doors, lights on, pets confined ([CAL FIRE Go brochure](https://www.monocounty.ca.gov/sites/default/files/fileattachments/board_of_supervisors/page/29199/calfire_go_brochure_linoweb.pdf)). There's no "where will you go." And the car kit (water, N95s, charger) only exists in Advanced (`deriveContext`, line 76), even for wildfire households with cars.

**Fix.**
- Add a short "Alert levels" block to the card and the evacuation-zone task.
- Add a rule: if the household has kids under 5, pets, mobility or medical needs, or no car, the list says "Leave at the Warning. Don't wait for an Order."
- Add a "where we'd go" fact (a friend or hotel outside the area).
- Move a minimal car kit into Basics whenever the household has a car and has wildfire, tsunami, or flood selected.

### 3.3 MAJOR: Most households get no go bag

**What's wrong.** "Not sure" resolves to a stay-at-home bin only unless wildfire or tsunami is picked (`suggestBuild`). The wizard says "most Bay Area households will stay home." That's true as a policy goal, but it's not a reason to skip a bag. ReadySF says to pack a Go Bag for every member of the family *and* a Stay Box ([ReadySF supplies](https://www.sf.gov/gather-supplies-pack-what-youll-need-for-an-emergency-in-san-francisco)). HayWired projects more than 400,000 people displaced. Add red-tagged soft-story buildings, fire following the quake, gas leaks and aftershocks, and plenty of people will have to leave a home they planned to stay in.

**Fix.** Basics should always include a small "grab bag" per person: meds, glasses, ID copies, charger, cash, water bottle, N95, and a copy of the plan. "Both" should be the default, not just the recommended option.

### 3.4 MAJOR: Basics ignores the East Bay water utility's own number

**What's wrong.** EBMUD's guidance is **2 gallons per person per day, at least 7 days** ([EBMUD water storage](https://www.ebmud.com/waterstorage), [EBMUD Pipeline](https://www.ebmud.com/customers/pipeline/2019/10/storing-emergency-water)). Basics uses 1 gallon. The 2-gallon top-up (`water-ebmud`) is Advanced and shows as "level up" for the Oakland family.

This contradicts the About page ("When agencies disagree... we pick the more careful number") and the builder's own `research/supplies.md` §1, which recommended 2 gallons as the EBMUD default. `isEastBay` is also crude. It treats all of Contra Costa as EBMUD, but much of it is served by CCWD and others, and it misses non-EBMUD Alameda County (ACWD, Zone 7).

The bigger issue: 7 or even 14 days won't cover a six-week outage. There's no plan for *after* the stored water runs out: where water distribution points will be, rationing, which water is OK for flushing versus drinking, and when to treat it.

**Fix.** Make 2 gallons the Basics default for EBMUD customers, and ideally identify the water utility by ZIP code. Add a "When your stored water runs out" task: listen for distribution points, bring containers, treat questionable water, and use water-heater or pool water only for flushing (EBMUD says don't drink it).

### 3.5 MAJOR: Too much buying, not enough doing

**What's wrong.** Persona B's list has about 22 tasks and about 70 purchases. Several of the highest-value actions are in Advanced: **Take a free CERT class**, **Get your block or building together**, **Keep a small kit at work or school**, **Take a video walk-through of your home**, and **Fill out FEMA's financial first aid kit**. Meanwhile **Cooling towels** and **A comfort item** are Basics.

Neighbors are the real first responders. Cal OES built a whole AFN program around preparing neighborhoods ([Cal OES](https://www.caloes.ca.gov/wp-content/uploads/AFN/Documents/General/Preparing-Neighborhoods-for-Disasters.pdf)), and the app's own About page cites Kobe. ECA's Seven Steps put "Secure your space" and "Plan to be safe" ahead of supplies, and "Minimize financial hardship" is a step of its own ([ECA](https://www.earthquakecountry.org/sevensteps/)).

There are also no drills beyond Drop/Cover/Hold On: no practice evacuation, no walking the tsunami route with a timer, no "practice opening the garage door" day.

**Fix.** Move the work kit (for commuters), Map Your Neighborhood or block meetings, and the home inventory into Basics. Show a "plan and skills" progress bar next to the supply bars. Rename the product framing from "kit list" to "plan."

### 3.6 MAJOR: Hazard picks are too coarse for the Bay Area's geography

**What's wrong.** Hazards are pre-checked by county only (`counties.ts`), but Bay Area risk varies street by street.
- **Tsunami** is never pre-checked, even for coastal counties. It's only an unchecked option. Yet CGS maps put Alameda, West Oakland, downtown SF, North Beach and the Marina in hazard areas ([CGS Alameda/San Mateo](https://www.conservation.ca.gov/index/Pages/News/New-Tsunami-Hazard-Maps-Alameda-Monterey-San-Mateo.aspx), [CGS SF/Contra Costa/Santa Clara](https://www.conservation.ca.gov/index/Pages/News/CGS-Issues-New-Tsunami-Hazard-Maps-for-San-Francisco-Contra-Costa-Santa-Clara-Counties.aspx)).
- **Flood** is pre-checked in only three counties.
- **Liquefaction** (Marina, Mission Bay, Bay fill, Alameda, Foster City) is never mentioned anywhere in the source ([USGS liquefaction maps](https://www.usgs.gov/programs/earthquake-hazards/science/san-francisco-bay-area-liquefaction-hazard-maps), [ABAG hazard data](https://abag.ca.gov/tools-resources/data-tools/resilience-open-data-portal)).
- **Landslide** is Advanced and only appears under floods.
- **Dam inundation** isn't covered.

**Fix.** Add a "Look up your home's hazards" task in Basics. Link the ABAG Hazard Viewer or MyHazards, CGS tsunami maps and Genasys, and record the results as home facts. Ask one question: "Do you live, work, or go to school near the ocean or Bay shoreline?" If yes, pre-check tsunami.

### 3.7 MAJOR: The toilet setup doesn't scale with household size

**What's wrong.** Basics gives one bucket and "30+ bags" whether it's one person or seven (`toilet`, `toilet-bags`). The twin-bucket method, which keeps urine and feces separate, is now standard in Portland and Christchurch guidance. It cuts volume and smell, and diluted urine can be disposed of on soil ([KUOW on PBEM's guidance](https://www.kuow.org/stories/have-you-planned-for-number-2-after-the-big-one)). In this app it's a tip and only Advanced gets two buckets. Nothing covers where to store sealed waste bags when pickup stops, or setting up a handwashing station. Sewer repairs can lag water repairs.

**Fix.** Two buckets in Basics. Scale bags to roughly 1 per person per day. Add storage and disposal guidance and a handwashing station.

### 3.8 MAJOR: Recovery is almost missing

**What's wrong.** There's no guidance on building safety placards (green, yellow, red). There's nothing on photographing damage before cleanup, Additional Living Expense coverage, FEMA (DisasterAssistance.gov) or SBA loans (FEMA doesn't give renters repair grants; SBA lends to renters, [CRS R45238](https://www.everycrsreport.com/reports/R45238.html)), contractor fraud, or Local Assistance Centers. Mental health after a disaster and childcare/school closures go unmentioned.

For SF renters, displacement is the most likely outcome after a big quake and the hardest one to recover from. The insurance review is in Basics, which is good, and the CEA's "$35 a year" figure checks out ([CEA](https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters)).

**Fix.** Add an "After: the first weeks" card. Move the financial first aid kit to Basics for renters and owners.

### 3.9 MAJOR: AFN and household realism

- **Tsunami versus mobility.** Persona C has a mobility aid and is told to "walk to high ground." They need a vehicle or helper plan and should rehearse it, because a near-source tsunami on the Santa Cruz coast leaves very little time.
- **Missing groups.** Nothing for dialysis (a 3-day emergency diet and an alternate clinic), dementia or cognitive impairment, service animals, or caregivers.
- **Kids' go bags.** Kids aged 2 to 12 each get a power bank, phone cable, cash and **2 N95s**, while the N95 tip says "N95s aren't made for young kids." Persona B is quoted $60–140 in power banks for children.
- **Language.** The site is English-only (`<html lang="en">`). The Bay Area is multilingual, and Listos California exists precisely because preparedness messages don't reach people with limited English.

**Fix.** Use age bands. Add a dialysis/home-health need. Translate the card first.

### 3.10 MINOR: Upkeep is too heavy

The PDF is 11 pages, 5 of which are refresh log. Nobody I've trained maintains that. Anchor it to two dates a year (ShakeOut in October, and the spring time change) with a 10-item check, and keep the detailed log in the spreadsheet only.

### 3.11 MINOR: The list is organized by container, not by phase

People think in phases: before, the first minutes, the first 72 hours, the first weeks, recovery. A "Plan" view exists. Make phases the backbone of the card and the PDF.

## 4. What's missing

- **Away-from-home planning.** A get-home plan for commuters (bridges and BART), a work kit in Basics, and what to do while driving.
- **Reunification.** Concrete reunification and communications steps: texting order, social check-ins (Safe and Well), the school emergency card, and kids memorizing a number (partly there). The rule "don't go get the kids if the school is holding them" is missing.
- **Post-quake electrical safety** (breakers, power restoration).
- **Smoke and heat cards.** Smoke: when to close up (AirNow thresholds), when to leave. Heat: cooling center hours, checking on others, and Medical Baseline for heat-sensitive conditions.
- **PSPS specifics.** Notice can be as short as 1 to 4 hours ([PG&E PSPS notifications](https://www.pge.com/assets/pge/docs/outages-and-safety/outage-preparedness-and-support/07-15-2026-psps-event-notifications.pdf)). Gates, garage doors, well pumps, phone landlines, internet, refrigerated meds, and Community Resource Centers.
- **Generator safety.** Only "never indoors." No 20-foot distance, no transfer switch or backfeed warning.
- **Chemical shelter in place.** "Learn how to shelter in place" is there, but the card doesn't say what the Contra Costa sirens mean.
- **Practice.** Evacuation drills, timed tsunami walks, a practice night "camping at home."
- **Volunteering and spontaneous helpers.** Where to report, and not self-deploying.
- **Seismic gas shutoff valves.** If a home has one, residents should know how it works and that PG&E or a plumber resets it.
- **Information hygiene.** Trust official channels, and expect rumors.

## 5. Factually wrong or questionable content

1. **Days step: "7 days — What San Francisco, EBMUD, and Cal OES recommend at a minimum."** Overstated. Cal OES's tip sheet says a 72-hour minimum with a week preferable (per the builder's own notes, `research/supplies.md` §1). EBMUD's 7-day minimum is at **2 gallons per day** ([EBMUD](https://www.ebmud.com/waterstorage)). SF Fire says 3 days minimum, a week preferred ([SSF/SF Fire water tips](https://www.ssfca.gov/Departments/Fire-Department/Emergency-Preparedness/Be-Prepared/Water-Tips) summarizes the same standard).
2. **About page: "pick the more careful number."** Not true for water in Basics (see 3.4).
3. **Food row: "1,200 to 1,500 calories a day... Ready.gov says healthy people can get by on that."** I could not find that figure on Ready.gov. The FEMA-derived wording is "half their usual food intake" if activity is reduced ([Southern Nevada Health District](https://southernnevadahealthdistrict.org/?p=8950)). Rephrase, and exclude kids and pregnant or nursing people, which the sources do.
4. **`shutoffs` tip: "close the water main to keep the clean water in your pipes and water heater."** For EBMUD customers this implies water-heater water is drinkable. EBMUD says don't drink it or use it for hygiene; use it only for flushing ([EBMUD](https://www.ebmud.com/waterstorage)). The `water-heater` item gets this right, so the two items contradict each other.
5. **"Once [gas] is off, only PG&E can turn it back on, which can take days."** After a regional quake with mass shutoffs, expect weeks. Also, PG&E recommends a 12- to 15-inch adjustable wrench, and fixed-opening "earthquake wrenches" may not fit ([PG&E](https://pge.com/en/outages-and-safety/outage-preparedness-and-support/understanding-gas-outages.html)).
6. **PSPS: "usually a day or two ahead."** PG&E aims for 2-day and 1-day notice *when possible*, but its Warning comes 1 to 4 hours before shutoff ([PG&E](https://www.pge.com/assets/pge/docs/outages-and-safety/outage-preparedness-and-support/07-15-2026-psps-event-notifications.pdf)). Say "sometimes only hours."
7. **Tsunami: "100 feet above sea level or a mile inland."** That's fine for the open coast with a local quake. For the Bay shoreline and for distant tsunamis, the guidance is to get out of the mapped zone and follow official orders, since there are hours of warning. "A mile inland on foot" from Alameda's shoreline is unnecessary and could put people on the bridges.
8. **N95s are given to young kids** while the tip says they aren't made for young kids (Persona B go bag).
9. **Radio: KCBS 740 / KQED 88.5 everywhere.** These are right for the core Bay. ReadySF also lists KALW 91.7 ([ReadySF](https://www.sf.gov/gather-supplies-pack-what-youll-need-for-an-emergency-in-san-francisco)). Santa Cruz, Sonoma and Napa should list their local stations. The NOAA frequency should be checked for each area rather than hard-coded.
10. **Genasys link for every county.** Correct for most counties ([Genasys 13-county contract](https://genasys.com/press-releases/genasys-inc-announces-zonehaven-evacuation-software-services-contracts-with-13-california-counties-2/), Solano joined in 2023). San Francisco doesn't use wildfire zones the same way, so SF users who pick tsunami or flood are sent to a map that may not help them.

## 6. Bigger-picture suggestions

1. **Reframe from a kit to a plan.** Lead with a household plan that has actual decisions in it: where we'll meet, who gets the kids, when we leave, where we'll go. Then home safety (secure furniture and the water heater). Then supplies. The data model already supports this; the homepage and PDF order are what need to change.
2. **Make the card the product.** One page, organized by phase, localized, and reviewed by your county OES. Ask a county OES or NERT coordinator to review it. Most will say yes to a free tool that matches their messaging.
3. **Address over county.** One optional address or ZIP lookup, kept on the device, would unlock water utility, tsunami zone, liquefaction, WUI status and evacuation zone. That's the single biggest accuracy gain.
4. **Community as a core track.** Map Your Neighborhood, NERT/CERT and the Listos block party are evidence-based and cheap. Put them in Basics, framed as "one hour with your neighbors."
5. **Test with real people,** especially renters, older adults, Spanish and Chinese speakers, and people without cars. Watch whether they reach the card, whether the Advanced/Basics split makes sense to them, and whether the item count makes them give up. Track completion of free steps, not purchases.
6. **Version and date the guidance.** Show "Reviewed [date] against [sources]" on the card and the PDF. Guidance changes (PSPS notice rules, Genasys coverage, CEA pricing).

## 7. Questions for the builder

1. Your own research recommended 2 gallons a day as the EBMUD default. Why did that become Advanced?
2. Who is the primary user: someone starting from zero, or someone who already has a kit? The 91-row list suggests the second; the "Start here" box suggests the first.
3. Have you shown the "When it happens" card to anyone, and could they find it without scrolling past the list?
4. Would you accept an optional ZIP or address field if it stays on the device?
5. What should happen for a household that can't afford Basics ($240–490 for one person)? Is there a "$0 plan" path that finishes?
6. Have you contacted SF DEM, Alameda County OES or EBMUD? They may endorse or link to this, and they'll catch errors.
7. How will you keep links and facts current (Genasys coverage, PG&E program names, Brace + Bolt windows)?
8. Is translation on the roadmap? Which languages first?
9. Why are CERT and the block meeting "Advanced"? What made cooling towels more basic than meeting your neighbors?
10. What do you want people to *do* differently after using this, and how would you know?
