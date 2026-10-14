# Bay Ready: clinical and public health review

Reviewer role: emergency physician (wilderness and disaster medicine) and former county environmental health staff. Read `src/data/items.ts`, `firstHour.ts`, `expiring.ts`, `counties.ts`, `src/lib/answers.ts`, `research/supplies.md`, the three sample lists, and PDF page 6. Checked against current agency guidance on 2026-10-14.

## 1. Verdict

This is better than most prep lists I've reviewed, including some that agencies publish. The water disinfection numbers are exact, it never recommends a generator, the infant-feeding basics are right, and it treats disabled and medically dependent people as part of the main audience instead of an appendix. Its weak spots are where generic prep advice meets a specific body. The app asks whether someone uses oxygen, takes insulin, or has a baby, and then mostly hands back generic text. Sometimes that text is unsafe for the person who answered: an oxygen user gets told to buy a camp stove and a lighter with no fire warning, and someone with a powered device is pointed at "run it from your car" with no carbon monoxide warning. The heat-stroke description teaches a dangerous myth. The "When it happens" card covers quakes well but says nothing about smoke, heat, CO, or medical devices, even though smoke is a default hazard for everyone and half the printed page is blank. None of this is hard to fix. Most of it is text. It does need a clinician to sign off before it goes wider.

## 2. What works

- **Bleach dosing** (`bleach`): 8 drops of 6% or 6 drops of 8.25% per gallon, 30 minutes, double for cloudy water, no scented or splash-less bleach. Matches EPA and EBMUD exactly.
- **No generator item at all.** Power stations are framed as the indoor-safe option. `stove` says outdoors only, "even in a garage", and to check for gas leaks before lighting.
- **Fridge/freezer times** (`fridge-thermo`, `cooler`): 4 hours fridge, 48 hours full freezer, 40°F for 2 hours. Correct per USDA/FoodSafety.gov.
- **Infant feeding** (`formula`, `feeding`): ready-to-feed first, keep breastfeeding, disposable cups when water is short. Matches CDC.
- **Access and functional needs:** Medical Baseline, DDAR, `support-network` ("don't count on just one person, or only on paid help"), `med-info` with a pill-identification cheat sheet, wheelchair "lock, cover, hold on". These are the right tasks.
- **Smoke:** NIOSH N95, an explicit "cloth and surgical masks don't", a clean-air room, Corsi-Rosenthal, "avoid purifiers that make ozone".
- **Sanitation:** "don't flush until you know the sewer is OK", and a separate urine bucket. That is the most important post-quake public health message, and most consumer lists leave it out.
- **Water realism:** sized per person and per pet, with a "start with 3 days" ramp. The research file is honest about agency disagreements, including water-heater water.
- **Heat:** names diuretics, blood pressure drugs, and psychiatric drugs as heat risks, and says to check on neighbors.
- **Psychosocial:** a comfort item for every person, earplugs, and "stress makes it hard to think". Good instincts.

## 3. Top problems, ranked

### 3.1 CRITICAL: Oxygen users get open-flame gear with no fire warning
Persona C (CPAP/oxygen, `cook` power goal) gets `stove`, `stove-fuel`, and `lighter` promoted, plus "If you use oxygen, keep backup tanks" (`device-power`). Nothing anywhere mentions oxygen fire risk. Fire-safety guidance for home oxygen is consistent: keep flames and heat at least 5 to 10 feet away, don't cook while on oxygen, and keep candles and matches out of the home ([NC OSFM/NFPA-based](https://maintenance.ncdoi.com/OSFM/RPD/PT/Documents/QuickDrills/Prevention/Medical%20oxygen%20Safety.pdf), [Michigan Medicine](https://homecare.med.umich.edu/Content/Documents/HomeCare/FirePreventionInfographic.pdf), [Kaiser](https://healthy.kaiserpermanente.org/health-wellness/health-encyclopedia/he.using-oxygen-safely.acv3016)). Burns from oxygen-fed fires are severe and often fatal. The cause is in the wizard: `power-device` lumps CPAP and oxygen together, so the app can't target the warning.
**Fix:** Split `power-device` into CPAP/BiPAP, oxygen, and other (ventilator, suction, pumps). For oxygen, add a Basics task: "Oxygen makes fires spread fast. No candles, smoking, or open flames in the house. Keep tanks at least 10 feet from stoves and flames, upright and secured, out of the sun. Whoever cooks on the camp stove does it outside, away from the oxygen user." Make `lighter`, the candle tips, and `stove` show this warning when oxygen is selected.

### 3.2 CRITICAL: "A DC car cord lets you run some devices from a car" (`device-power`)
There's no CO warning. People do run cars in attached garages to power devices or charge phones during outages, and generator and vehicle exhaust is the classic outage CO killer. CDC says never run any gasoline engine in a garage or enclosed space, "even if the doors or windows are open" ([CDC](https://www.cdc.gov/natural-disasters/psa-toolkit/avoiding-carbon-monoxide-poisoning.html), [CPSC](https://www.cpsc.gov/s3fs-public/468-WhattoKnowGenerators_2022.pdf)).
**Fix:** "A DC car cord can run some devices from a car. Only with the car fully outside, never in a garage, even with the door open, and never while someone sleeps in it."

### 3.3 MAJOR: Heat-stroke signs teach a myth (`cool-place`)
"Hot, red, dry skin" implies that someone who is sweating doesn't have heat stroke. CDC lists "hot, red, dry, or damp skin" ([CDC 2026 sheet](https://cdc.gov/natural-disasters/media/pdfs/2026/09/Heat_Related_Illness-NEWLOGO.pdf)). Exertional heat stroke often presents with sweating. The text also gives no first aid, and cooling fast is what saves the brain.
**Fix:** "Heat stroke: confusion, fainting, or a temperature of 103°F or more, with hot skin that may be dry or sweaty. Call 911, then cool them right away: move them somewhere cool, soak their skin with water, and fan them. Don't give drinks if they're confused." Add the heat exhaustion signs too: heavy sweating, cold clammy skin, nausea, dizziness.

### 3.4 MAJOR: Fan and cooling-towel advice is unqualified for extreme heat (`cooling`, `cooling-towels`)
"Wet skin plus a fan cools you fast." EPA says "Do not direct the flow of fans toward yourself when the room is hotter than 90°F" ([EPA heat and smoke](https://www.epa.gov/wildfires/protect-yourself-heat-and-smoke)). Newer data suggests that fans plus skin wetting can still help, but the benefit is conditional, especially for older adults ([JAMA 2025 via WebMD](https://www.webmd.com/a-to-z-guides/news/20250801/cm/fans-help-high-heat-if-used-right)). Separately, the smoke and heat advice conflict, and nothing reconciles them: "close windows" plus a hot house is dangerous for exactly the older people in Persona C.
**Fix:** "Above about 90°F indoors, a fan alone can make things worse. Keep your skin wet while the fan runs, take cool showers, and go somewhere with AC." In `clean-room`: "If it's hot and smoky at once and you can't stay cool, go to a cooling center or a library. Heat is the bigger short-term danger."

### 3.5 MAJOR: Filters oversold for viruses (`purify-go`, `water-filter`)
`purify-go` says a filter bottle "makes tap or stream water safe to drink". CDC says portable filters "will not remove viruses" and should be followed by chemical disinfection ([CDC](https://www.cdc.gov/water-emergency/about/index.html)). Post-quake tap water with sewage cross-contamination is exactly the norovirus and hepatitis A scenario.
**Fix:** In `water-filter`, add "Filters don't stop viruses. After filtering, add bleach or a tablet, or boil." In `purify-go`, recommend tablets (chlorine dioxide) as the default, with a filter as an add-on. Don't present the two as interchangeable.

### 3.6 MAJOR: Food plan calories are overstated, misattributed, and applied to kids (`food`, `eaters`)
- Ready.gov doesn't say 1,200 to 1,500 calories ([Ready.gov/food](https://www.ready.gov/food)). The "half your usual intake" idea comes from old FEMA/Red Cross material, and that same material says not to ration children or pregnant women ([Southern Nevada HD](https://www.southernnevadahealthdistrict.org/faq-items/can-food-be-rationed-if-supplies-run-low/)). The app then multiplies the rationed plan by 0.7 for kids, which gives a growing child roughly 700 to 1,000 kcal.
- The plan doesn't reliably reach 1,200. Tuna (about 130 kcal), green beans (about 70), two servings of crackers (about 260), a tablespoon or two of peanut butter (about 95 to 190), and a granola bar (about 150) come to about 700 to 800 kcal. Chili, peaches in syrup, and trail mix reach about 1,500.
- The plan is canned-salt heavy and gives no caution for heart failure or kidney patients, who are a likely user group.

**Fix:** Drop the Ready.gov attribution. Count kids at 1.0, or at least don't call the plan sufficient for them. Steer people to calorie-dense picks ("beans, chili, or chicken over tuna; fruit in juice; full-fat"). Add: "On a low-salt or fluid-restricted diet? Pick low-sodium cans and ask your doctor how much to drink in a heat wave."

### 3.7 MAJOR: Insulin guidance stops at storage (`cold-med-pouch`, `rx`)
"Most insulin is fine for up to 28 days at room temperature" is broadly right: 59 to 86°F for 28 days per FDA and the Diabetes Disaster Response Coalition ([DDRC](https://prod.dorg.diabetes.org/sites/default/files/2023-10/ddrc-storing-insulin-2018.pdf), [FDA](https://www.fda.gov/drugs/emergency-preparedness-drugs/information-regarding-insulin-storage-and-switching-between-products-emergency)). What's missing:
- **Hypoglycemia supplies.** Glucose tablets or gel, and glucagon if prescribed. With irregular meals, insulin users have more lows, and lows kill faster than highs.
- **Ice packs freeze insulin.** Say "never let insulin touch an ice pack; wrap it in a cloth."
- **Pump insulin** in the reservoir and tubing goes after 48 hours. Pump users also need backup pens or syringes and long-acting insulin in case the pump fails.
- A **sharps container** (an empty detergent bottle works).
- What to do above 86°F, which is plausible in a Bay Area heat wave with no power.

**Fix:** Add a `diabetes` item under `cold-meds`, or better, a diabetes need, with these five points.

### 3.8 MAJOR: Medical device power plan is unrealistic for oxygen and thin for CPAP (`device-power`, `power-station`)
"Aim for at least 72 hours of runtime" at $100 to $400 can't be done for a home oxygen concentrator (roughly 120 to 600 W). A CPAP can get there only with the humidifier and heated tube off, since those can triple the draw (manufacturer DC-DC documentation; see the summary in the research notes). The plan needs a branch for when the battery runs out.
**Fix:** CPAP: "Turn off the humidifier and heated tube to stretch the battery, and use your maker's DC cable." Oxygen: "A battery can't run a concentrator for days. Keep enough tanks for 72 hours, know your supplier's emergency number, and know where you'd go: a PG&E Community Resource Center, a shelter with power, or a relative outside the outage. A hospital ER is for breathing trouble, not for charging."

### 3.9 MAJOR: The "When it happens" card is quake-only and has gaps (`firstHour.ts`)
Smoke is a default hazard for every household, yet the card has no smoke line. Persona B picked heat, and the card has no heat line. There's no CO line and no medical device line. On the PDF, half of page 6 is empty. In the quake section:
- There's no "Call 911 for life-threatening emergencies only; lines will be jammed."
- The gas line leaves out "don't touch light switches, phones, or flames inside". PG&E says not to use switches, appliances, or phones because sparks can ignite gas, and to call 911 and PG&E from a safe distance ([PG&E](https://www.businesswire.com/news/home/20200128005682/en)).
- There's no "check for fire" and no "stay away from downed power lines".
- There's no "if you're trapped: tap on a pipe or use your whistle, and cover your mouth from dust". The whistle is in the kit but not on the card.
- There's no "don't go back into a damaged building".

**Fix:** Add conditional lines:
- "Smoky: close up, run your filter in the clean-air room, and keep kids and anyone with asthma or heart disease inside."
- "Heat: [stroke signs + cool now + 911]."
- "Headache, dizziness, or nausea in several people at once, especially near a generator, grill, or car? Get everyone outside into fresh air and call 911. It may be carbon monoxide."
- "Medical device: switch to battery, turn off the humidifier, and call your supplier."

### 3.10 MAJOR: The East Bay water default undercuts the app's own source (`water`, `water-ebmud`)
EBMUD says "at least two gallons per person per day for seven days minimum" ([EBMUD](https://www.ebmud.com/waterstorage)). The code flags `ebmud: true` for Alameda and Contra Costa, but the extra gallon is Advanced, staged "later", and collapsed under "level up". The research file planned 2 gal/day as the East Bay default and +50% for heat; neither shipped. HayWired projects East Bay outages of about 6 weeks.
**Fix:** Make 2 gal/day the Basics default for EBMUD households, or at least show the second gallon as a visible Basics row. Add +50% when heat is selected, and add more for pregnant or nursing household members.

### 3.11 MAJOR: Box fan filter is missing EPA's safety conditions (`box-fan-filter`)
EPA says to use only 2012-or-later fans with UL/ETL marks, since older fans "pose known fire risks", and that older fans shouldn't be used unattended or while sleeping ([EPA](https://www.epa.gov/air-research/research-diy-air-cleaners-reduce-wildfire-smoke-indoors)). The builder's own research recorded this, and it was dropped. Meanwhile `clean-room` tells people to sleep in that room.
**Fix:** "Use a box fan made in 2012 or later with a UL or ETL mark. Match the airflow arrow on the filter. Don't use an extension cord."

### 3.12 MAJOR: First aid is too thin for a quake app
- The kit list includes "alcohol wipes", which are fine for skin but are often used on wounds. The first wound step is irrigation with lots of clean water.
- `bleed-kit` is Advanced, staged "later", and in a go bag only. The family in Persona B never sees it.
- CPR and first aid training appears only as a tip under an Advanced CERT item.
- There's no **tetanus** check. Debris punctures and crush wounds are "dirty or major" wounds that need a booster if the last one was 5 or more years ago ([CDC](https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html)).
- Because `first-aid` is `coveredByGo`, a family of five that builds both kits gets one small $15 to $30 go-bag kit as its only home kit.

**Fix:** Add a Basics task, "Take a free Stop the Bleed or CPR class (one adult is enough)". Move the tourniquet to Basics in the stay bin for quake households. Add "Check everyone's tetanus shot is up to date" to `doc-photos` or as its own task. Expand the kit list: irrigation syringe or squeeze bottle, gauze rolls, elastic wrap, triangular bandage, trauma shears, burn dressing, CPR face shield. Keep a full kit at home even when there's a go bag.

### 3.13 MAJOR: "Babies and toddlers (under 2)" get one-size infant feeding (`formula`, `baby-food`, `eaters`)
Newborns are told to have pouches. Toddlers of 12 to 24 months mostly don't use formula, and they are excluded from the food plan entirely. The quantity "7 days for 1 baby" gives a parent nothing to buy against. Opened ready-to-feed bottles and prepared formula need refrigeration or must be thrown out. Without refrigeration, CDC says to prepare fresh for every feed and discard leftovers ([CDC](https://www.cdc.gov/infant-feeding-emergencies-toolkit/php/powdered-infant-formula.html)).
**Fix:** Ask the baby's age band (0–6 months, 6–12, 12–24). Express formula in ounces per day (about 24 to 32 oz). Recommend single-serve ready-to-feed bottles. Add "never water formula down or make homemade formula" (CDC). For toddlers, add shelf-stable whole milk plus their share of the regular food.

### 3.14 MINOR: Sanitation sizing and disposal (`toilet`, `toilet-bags`)
One bucket and 30 bags regardless of household size: for five people over 7 days that's thin. Basics gets one bucket while the tip says to use two. There's no disposal guidance: keep bags sealed in a lidded bin away from living areas, and wait for official instructions ([Wilsonville two-bucket guide](https://www.wilsonvilleoregon.gov/ready/page/two-bucket-toilet-solution), [OSU Extension](https://extension.oregonstate.edu/catalog/pub/em-9334-survival-basics-sanitation-waste-management)). There's no "don't add bleach to the pee bucket", and no handwashing station (a jug with a spigot, soap, and a catch basin).
**Fix:** Scale bags with people and days. Make two buckets Basics when people > 2. Add disposal and handwashing lines.

### 3.15 MINOR: Smaller fact and wording issues
- **Tsunami "a mile inland"** (`tsunami-route`): California guidance commonly says 100 ft or **two** miles inland if no map exists ([Pacifica/state guidance](https://cityofpacifica.org/home/showpublisheddocument/686/637824985021930000); [CGS maps](https://www.conservation.ca.gov/cgs/tsunami/maps)). Lead with "know your mapped zone". For mobility-limited users, "on foot" needs a plan, such as vertical evacuation to the upper floors of a sturdy building if it's designated locally.
- **CO alarms "replace at 5 to 7"**: NFPA 72 says to follow the manufacturer's date or the end-of-life signal. Most current units last 7 to 10 years ([Kidde](https://www.kidde.com/support/carbon-monoxide-alarms/replacement)). Say "by the date on the back, usually 7 to 10 years."
- **The `shutoffs` tip** says closing the main keeps "clean water in your pipes and water heater", while `water-heater` notes that EBMUD says not to drink heater water. Align the two, and add: turn off the heater's gas or power before draining, and let it cool.
- **"Candles are a leading cause of fires after earthquakes"**: this is unsourced. Say "a common cause".
- **N95 counts** include every kid while the tip says N95s aren't made for young kids. Older kids can often fit small adult sizes. The text also gives no seal-check guidance and doesn't mention beards.
- **Road flares** in the car kit for Red Flag counties: they can start fires. Reflective triangles are safer.
- **The outage card line** gives only the freezer time. Add "fridge about 4 hours; when in doubt, throw it out" ([FoodSafety.gov](https://www.foodsafety.gov/food-safety-charts/food-safety-during-power-outage)).
- **`kid-meds`**: add "use the dosing syringe that comes with it; no aspirin for kids; no ibuprofen under 6 months."
- **`otc`**: add oral rehydration salts. Diarrheal illness is the predictable outbreak when sanitation fails.

## 4. What's missing

- **Mental health:** the SAMHSA Disaster Distress Helpline (call or text 1-800-985-5990, [SAMHSA](https://www.samhsa.gov/find-help/helplines/disaster-distress-helpline)) and 988 on the phone-numbers card. A short "psychological first aid" line: keep routines, limit news, kids regress and that's normal, check on people who live alone.
- **Pregnancy:** not asked anywhere. Pregnant people need extra water and food, prenatal meds, their records, and their provider's after-hours number. CDC has a kit list, and the research file planned for it.
- **Dialysis:** not a need option. Dialysis patients need a 3-day emergency diet (low potassium, low fluid), their clinic's backup plan, and the KCER hotline. They're among the highest-mortality groups in disasters.
- **Asthma/COPD and smoke:** an asthma action plan, a spare rescue inhaler, and a spacer, plus "stay in the clean-air room when AQI is above 100 (sensitive groups) or above 150 (everyone)". The research file flagged extra inhalers. No AQI thresholds appear anywhere.
- **Food allergy:** the `diet` need doesn't prompt for epinephrine auto-injectors (two per person) or note that heat degrades them.
- **CO poisoning symptoms:** headache, dizziness, nausea, confusion, several people sick at once, pets affected first.
- **Wildfire ash and post-quake cleanup:** N95, gloves, wet cleanup with no leaf blowers, and kids kept away.
- **Crush injury and spinal injury:** don't move someone with neck pain unless they're in danger. A layperson freeing a limb pinned for hours needs medical help: crush syndrome can kill on release.
- **Burns:** cool running water for 20 minutes, no ice, no butter.
- **Flood water contact:** wash with soap, cover wounds, tetanus.
- **Pets:** a large dog needs about 1 oz of water per pound per day, more than the 0.5 gal used. Pets in heat and smoke too.
- **Cognitive impairment/dementia:** ID bracelet, a recent photo, a wandering plan.
- **Sleep:** the go bag covers it. The stay-at-home side has no "keep a routine" note.

## 5. Fact-check table

| Claim in app (item) | Verdict | Source |
|---|---|---|
| 8 drops 6% / 6 drops 8.25% bleach per gal, 30 min (`bleach`) | Correct | [EPA](https://www.epa.gov/ground-water-and-drinking-water/emergency-disinfection-drinking-water), [EBMUD](https://www.ebmud.com/waterstorage) |
| Cloudy water: settle, cloth-filter, double bleach | Correct | EPA |
| Boil 1 minute | Correct (3 min above 6,500 ft per CDC; 5,000 ft per EPA/EBMUD) | [CDC](https://www.cdc.gov/water-emergency/about/index.html) |
| Replace self-bottled tap water every 6 months | Correct | [CDC](https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html), EBMUD |
| "Tap water needs no treatment if you swap it every 6 months" | Partly: containers must be washed and sanitized first (1 tsp bleach per quart rinse) | CDC |
| 1 gal/person/day | Correct as a national minimum; wrong as the East Bay default | CDC, EBMUD |
| EBMUD says don't drink water-heater water | Correct | EBMUD |
| Filter bottle "makes tap or stream water safe" (`purify-go`) | Wrong: filters don't remove viruses | CDC |
| Ready.gov says 1,200–1,500 kcal is enough | Wrong attribution; rationing excludes kids and pregnancy | [Ready.gov](https://www.ready.gov/food), [SNHD](https://www.southernnevadahealthdistrict.org/faq-items/can-food-be-rationed-if-supplies-run-low/) |
| Fridge 4 h, full freezer 48 h, 40°F/2 h | Correct | [FoodSafety.gov](https://www.foodsafety.gov/food-safety-charts/food-safety-during-power-outage) |
| CDC: RTF formula safest; powder needs safe water | Correct | [CDC](https://www.cdc.gov/infant-feeding-emergencies-toolkit/php/powdered-infant-formula.html) |
| Disposable cups easier to keep clean than bottles | Correct | CDC |
| Insulin OK up to 28 days at room temp; don't freeze | Correct (59–86°F; some products differ) | [DDRC](https://prod.dorg.diabetes.org/sites/default/files/2023-10/ddrc-storing-insulin-2018.pdf), FDA |
| Heat stroke = hot, red, dry skin, >103°F | Partly: skin may be damp; first aid missing | [CDC](https://cdc.gov/natural-disasters/media/pdfs/2026/09/Heat_Related_Illness-NEWLOGO.pdf) |
| "Wet skin plus a fan cools you fast" | Partly: EPA says don't aim fans at yourself above 90°F | [EPA](https://www.epa.gov/wildfires/protect-yourself-heat-and-smoke) |
| Box fan + MERV 13 is a proven cleaner | Correct, but needs 2012+ UL/ETL fan | [EPA](https://www.epa.gov/air-research/research-diy-air-cleaners-reduce-wildfire-smoke-indoors) |
| N95s not made for young kids | Correct | EPA factsheet (research S31) |
| Hand sanitizer ≥60% alcohol; doesn't work on dirty hands | Correct | CDC |
| Never run a generator/grill/stove indoors or in a garage | Correct | [CDC](https://www.cdc.gov/natural-disasters/psa-toolkit/avoiding-carbon-monoxide-poisoning.html) |
| Replace CO alarms at 5–7 years | Partly: follow the manufacturer, usually 7–10 | [Kidde/NFPA 72](https://www.kidde.com/support/carbon-monoxide-alarms/replacement) |
| Replace smoke alarms at 10 years | Correct | NFPA |
| Smell gas: get out, shut off if you can, call from outside | Correct but incomplete (no switches, phones, or flames; call 911) | [PG&E](https://www.businesswire.com/news/home/20200128005682/en) |
| Tsunami: 100 ft or a mile inland | Partly: CA guidance often says 2 miles | [Pacifica/state](https://cityofpacifica.org/home/showpublisheddocument/686/637824985021930000) |
| Drop, cover, hold on; stay in bed; wheelchair lock | Correct | [ShakeOut](https://www.shakeout.org/california/) |
| Six inches of moving water can knock you down; a foot can float a car | Correct | NWS "Turn Around Don't Drown" |
| Tetanus | Not mentioned (gap) | [CDC](https://www.cdc.gov/tetanus/hcp/clinical-guidance/index.html) |

## 6. Bigger-picture suggestions

1. **Get a named clinician to sign off,** and show the review date in the footer. Health text drifts. A clinician pass per release takes about 2 hours.
2. **Add a contraindication check.** Write rules that fail the build when conflicting items appear together: oxygen with an open flame, insulin with ice packs and no wrap warning, kids with a ration-level food plan. The app already has `when`/`promote`, so this is a small addition and it would have caught 3.1.
3. **Ask better health questions.** Split device types. Add pregnancy, dialysis, asthma/COPD, diabetes (insulin or not), cognitive impairment, and baby age band. Each answer should change the card, not only the shopping list.
4. **Make the card hazard-complete.** One line each for smoke, heat, CO, and the medical device, all on the page that gets taped inside the bin lid.
5. **Put training before gear.** Stop the Bleed, CPR, and "know your shutoffs" save more lives than most purchases. Show them as Basics tasks with free local links.
6. **Cite sources in the UI.** Show a small source link on each health claim. It builds trust and makes errors easy to catch.
7. **Test with real users,** including an oxygen user, an insulin user, a parent of an infant, and someone with limited English. Watch where they misread.

## 7. Questions for the builder

1. Who's the intended reviewer of health content, and will there be a dated sign-off?
2. Why is the EBMUD 2-gallon figure Advanced when the research recommended it as the default?
3. Several research items were dropped in implementation: fan safety, formula water, heat +50% water, pregnancy, inhalers. Was that deliberate, for length?
4. Can the wizard ask device type and baby age without adding friction? Would one follow-up screen, shown only to people who tick a box, work?
5. Is the card meant for the first 10 minutes or the first 3 days? That decides what belongs on it.
6. Do you want the food plan to be "survivable" or "adequate"? Pick one and say so, especially for kids.
7. Will you translate this? Spanish and Chinese at minimum for the Bay Area. The health lines are where translation errors hurt most.
8. Is there a way for users to report an error, and who triages health reports?
