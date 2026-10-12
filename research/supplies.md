# Bay Area Emergency Prep: Supplies Research

Research compiled 2026-10-11 for the "build your own emergency prep list" wizard. This file is meant to be turned into structured item data. Citations like **[S6]** point to the numbered source list at the bottom.

---

## 0. Conventions used in this file

**Containers** (as specified for the app):

| value | meaning |
|---|---|
| `go-bag` | Carried when you evacuate on foot or by car. One per person. Should be liftable. |
| `stay-bin` | Home supplies for sheltering in place about 1 to 2 weeks with no utilities. |
| `both` | Belongs in both. A household may want two of it (for example a flashlight in each). |
| `home-prep-action` | A one-time thing you do or install at home, not something you pack. |
| `car` | Kept in the vehicle. |
| `bedside` *(suggested extra value)* | Earthquake Country Alliance recommends a small bag tied to each bed [S13]. Map it to `stay-bin` if you don't want a 6th value. |
| `work` *(suggested extra value)* | Office or "get-home" kit for commuters. Map it to `car` if you don't want a 7th value. |

**Tiers:** `basics` means what most official checklists treat as essential. `advanced` means longer duration, higher cost, or more specialized.

**Evidence labels:** Anything not traced to an authoritative page is marked **(unverified)**. Rules of thumb I'm proposing for the app, with no single source behind them, are marked **(app suggestion)**.

**Item IDs** (`core.water.stay`) are proposed slugs for the data model.

---

## 1. Key numbers (pin these in the app)

| Number | Recommended app value | What the sources actually say |
|---|---|---|
| **Water per person per day** | **1 gal/person/day** by default. Offer **2 gal/day** as "advanced" and as the default for EBMUD customers (East Bay). | FEMA/Ready.gov: 1 gal/person/day "for several days" [S9]. CDC: at least 1 gal/person/day for 3 days, and "try to store a 2-week supply if possible" [S10]. ReadySF Stay Box: "at least one gallon, per person, per day" [S1]. SFPUC: 1 gal/person/day, covering drinking, limited cooking and hygiene [S8]. **EBMUD: "at least two gallons per person per day" for "seven days minimum"** [S6]. |
| **Water days at home (stay bin)** | **Basics: 7 days. Advanced: 14 days.** | ReadySF: "Be prepared for about a week without water or electricity" [S1]. Cal OES tip sheet: 72 hours minimum, "a week's supply of water is preferable" [S12]. EBMUD: 7 days minimum, and "recovery of the public water system after an emergency may take much longer than a week" [S6]. SFPUC: 3 to 5 days [S8] (the most conservative Bay Area figure). Red Cross: 2-week supply for home [S11]. CDC: 2 weeks if possible [S10]. Earthquake Country Alliance: at least 3 days, ideally 2 weeks [S13]. |
| **Water in go bag** | **About 1 to 2 L carried per person, plus purification.** Put the full 3 gal/person in the **car**. | Red Cross: 3-day supply for evacuation [S11]. CAL FIRE go bag checklist: 3 gallons per person [S23] (indexed text; the site blocks automated fetch). ReadySF's Go Bag lists **water purifying tablets**, not bottled water [S2]. Three gallons weigh about 25 lb, which is unrealistic on foot, so the app should split it between the bag and the car **(app suggestion)**. |
| **Food days** | **Go bag: 3 days. Stay bin basics: 7 days. Advanced: 14 days.** | Ready.gov: "several-day supply" [S9]. Red Cross/CDC legacy checklist: 3 days evacuation, 2 weeks home [S11][S10]. ReadySF: about a week, no-cook, high-protein [S1]. CAL FIRE: 3-day supply of non-perishable food [S23]. |
| **Prescription meds** | **Basics: 7 days in go bag. Advanced: 14+ days.** | CDC (people with disabilities): at least 1 week's supply [S59]. CDC (pregnant women, infants, children): at least a 2-week supply [S57]. CDC (children with special healthcare needs): 2 weeks [S67]. In California, pharmacists may dispense emergency supplies during a declared emergency (Bus. & Prof. Code 4062/4064) [S60]. |
| **Cash** | **Basics: $100 to $200 in small bills per household. Advanced: about 1 week of essential spending.** **(app suggestion; unverified)** | **No official agency gives a dollar figure.** ReadySF: "Cash, in small bills" because "credit cards might not work" [S1][S2]. Ready.gov lists cash with no amount [S9]. The only numbers I found ($50 to $500) came from commercial finance blogs, which I'm not citing. |
| **N95s** | **Basics: 2 per person in go bag, 5 per person in stay bin. Advanced: 10+ per person for a smoke season. (app suggestion)** | ReadySF lists N95s in both kits [S1][S2]. NIOSH: buy NIOSH-approved N95 or P100 with "NIOSH" printed on it. Cloth and surgical masks and bandanas don't seal or filter smoke particles. A fitted respirator cuts exposure at least 10x [S28]. Quantities are my proposal. |
| **How long water could be out after a big quake** | Say "**weeks, possibly months**" in the East Bay. | USGS HayWired scenario (M7.0 Hayward Fault): the **average East Bay resident could lose water service for about 6 weeks, some for as long as 6 months**, with about 9,400 water main repairs needed [S14][S16]. SFPUC: "might be unavailable for 72 hours or more" [S8]. EBMUD: "much longer than a week" [S6]. |
| **Earthquake odds** | "About **3 in 4** chance of a M6.7+ in the Bay Area within 30 years." | USGS UCERF3 (2014): **72%** chance of M6.7+ by 2043. Hayward-Rodgers Creek has the highest single-fault probability, about 33% [S17]. **A Sept 3, 2026 ABC7 report says a new USGS study raised the regional figure to 74% and Hayward-Rodgers Creek to 34.3%**, with San Andreas up 3.6 points [S18]. **I could not find the USGS primary document for the 2026 update, so treat 74% as unverified until you link the USGS release.** "About 3 in 4" is accurate under either number. |
| **PSPS duration** | "Typically 1 to 3 days." | PG&E's own filing for the October 2019 events: average customer outage about **55 hours** [S34]. CPUC rules call for 24 to 48 hours advance notice to customers "where possible" [S36]. PG&E warns the first alert may come the same day [S33]. |
| **Fridge / freezer during outage** | 4 h fridge, 48 h full freezer, 24 h half-full freezer | FoodSafety.gov/USDA [S38]. Ready.gov: throw out food at 40°F or above [S37]. |
| **Insulin without refrigeration** | Up to 28 days at 59 to 86°F (vials/cartridges), per label | FDA emergency guidance [S39]. |
| **Generator distance** | 20+ ft from doors, windows, vents. Never in a garage or carport. | CDC [S40], Ready.gov [S37]. |
| **Flood water** | "6 inches of moving water can knock you down. 1 foot can sweep your vehicle away." | Ready.gov [S45]. |

---

## 2. Which hazards to include, and why

| Hazard | Include? | Rationale |
|---|---|---|
| **Earthquake** | **Yes. Default on, flagship.** | Highest-consequence regional hazard. About 72 to 74% odds of M6.7+ in 30 years [S17][S18]. The HayWired scenario projects about 800 deaths and 18,000 injuries, 400,000+ people displaced, and weeks to months without water [S14]. Drives the long water and food targets. |
| **Wildfire (evacuation)** | **Yes.** Default on for WUI/hill ZIPs, otherwise opt-in. | 1991 Oakland Hills (Tunnel) Fire: 25 deaths, about 2,843 single-family homes plus 437 apartment/condo units destroyed [S27]. 2017 Tubbs Fire: 22 deaths in Sonoma, about 5,600 structures [S27]. 2020 LNU Lightning Complex: 363,220 acres across Napa/Solano/Sonoma and nearby counties [S27]. |
| **Wildfire smoke** | **Yes. Default on for everyone.** | Affects the whole region even far from flames. During the 2018 Camp Fire, Bay Area air was among the worst on record (BAAQMD data back to 1999) for about two weeks, with AQI above 200 on five days [S32]. Cheap, high-value items (N95s, box-fan filter). |
| **Power outage incl. PSPS** | **Yes. Default on for everyone.** | PSPS hits hill and North Bay areas repeatedly. October 2019 events averaged about 55 h per customer [S34]. Every other hazard also knocks out power. Critical for the medical-device modifier. |
| **Extreme heat** | **Yes.** Opt-in, default on for inland ZIPs (East Bay inland, South Bay, North Bay valleys). | Sept 2022: all-time records of 116°F in Livermore, 115°F Santa Rosa, 114°F Napa, 109°F San Jose [S43]. Only about 47% of SF-Oakland metro households had AC (2020 Census figure, via SF Public Press) [S44]. Low AC rates make heat unusually dangerous here. |
| **Winter storms / atmospheric rivers / flood / landslide** | **Yes.** Opt-in, default on for everyone (storm outage overlap). | Dec 2022 to Jan 2023 atmospheric rivers brought flooding, 100+ mph gusts and landslides to the region (NWS Bay Area) [S46]. At least 20 storm deaths statewide by mid-January 2023 (CNN, via search; final official total unverified). Overlaps heavily with power-outage items. |
| **Tsunami** | **Yes, gated.** Only if the user says they live, work or commute in a coastal or bayshore hazard zone. | CGS published Tsunami Hazard Area maps for all Bay Area coastal counties (2021 to 2022). Downtown SF/Market St, North Beach, Port of Richmond and Half Moon Bay were notable expansions [S48]. A Dec 5, 2024 M7.0 offshore quake triggered a warning to about 5 million people including SF; it was cancelled after about 1 hour [S50]. Supplies are just the go bag. The value is mostly in actions (know your zone, walk the route). |
| **Hazmat / chemical shelter-in-place** | **Yes, small module.** Default on for Contra Costa and Solano (refinery corridor), opt-in elsewhere. | 2012 Chevron Richmond refinery fire: shelter-in-place order, and an estimated 15,000 residents sought medical care (KQED; an earlier county count said 9,000+) [S53]. Contra Costa runs a siren-based Community Warning System [S62]. Only a few unique items (plastic sheeting, tape, towels). |
| **Pandemic / disease** | **Don't make it a separate hazard.** Fold it into core as a few advanced items. | Ready.gov pandemic guidance is generic: "several days or weeks" of supplies, cleaning supplies, prescriptions, food, water [S54]. Everything it needs is already covered by the 2-week stay bin plus masks. A separate toggle would add questions but almost no unique items. Add thermometer, extra OTC cold/fever meds and cleaning supplies to core advanced. |

---

## 3. CORE items (universal)

These apply to every user regardless of hazard choices. Quantities are per person unless noted.

### 3.1 Water

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| core.water.stay | Stored drinking water | stay-bin | basics | 1 gal/person/day × **7 days** = 7 gal/person [S1][S12] | Pipes break in quakes. You need water before help arrives. | Sealed store-bought cases or food-grade jugs. Keep in a cool, dark place, off concrete if possible **(unverified)**. Replace every 6 months or by expiration date [S1][S6][S8]. |
| core.water.stay.adv | Extended water storage | stay-bin | advanced | Bring total to **14 days** (14 gal/person). In EBMUD area, 2 gal/day × 7 days minimum [S6][S10] | East Bay water could be out for weeks [S14]. | Stackable 5 to 7 gal food-grade containers. Avoid used milk jugs **(unverified, common guidance)**. EBMUD says use BPA-free plastic made for storage [S6]. |
| core.water.tank | Large water storage tank or drum | stay-bin | advanced | 30 to 55 gal per household | Cheapest per gallon for long outages. | ReadySF suggests "consider investing in water storage tanks" [S1]. Needs a siphon/pump and a spot that can take the weight (about 460 lb for 55 gal). |
| core.water.go | Water bottle(s) for the bag | go-bag | basics | About 1 to 2 L per person **(app suggestion)** | Drink while you get to safety. | Refillable bottle so you can use found water plus purification. |
| core.water.car | Water in car | car | basics | 3 gal/person **(CAL FIRE)** [S23], or at least 1 gal/person | The car carries the 3-day evacuation water a backpack can't. | Swap every 6 months. Heat in parked cars degrades plastic **(unverified)**. |
| core.water.purify | Water purification tablets or a portable filter | go-bag | basics | Enough to treat about 3 days of water | Lets you make found water safe. | ReadySF go bag item [S2]. Check expiration. A filter does not remove viruses unless it's rated as a purifier **(unverified, general)**. |
| core.water.bleach | Unscented regular household bleach + eyedropper | stay-bin | basics | 1 small bottle | Disinfects water if your stored supply runs out. | EBMUD: **8 drops of 6% or 6 drops of 8.25%** bleach per gallon, wait 30 min [S6]. Plain, unscented, no "splash-less" **(unverified, common CDC/EPA guidance)**. Bleach loses strength over time, so replace yearly **(unverified)**. |
| core.water.pet | Extra water for pets | stay-bin | basics | Up to 1 gal/pet/day (SFPUC) [S8]. See Pets modifier. | Pets need water too. | Included in pet modifier. |

### 3.2 Food and cooking

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| core.food.stay | No-cook, non-perishable food | stay-bin | basics | **7 days** per person [S1] | Stores may close or empty after a disaster. | Food you actually eat. High-protein canned fish, beans, vegetables, protein bars [S1]. Pull-tab cans. Check dates every 6 to 12 months. |
| core.food.stay.adv | Extended food supply | stay-bin | advanced | Bring to **14 days** [S11][S13] | Long recovery after a big quake. | Rotate into normal meals ("store what you eat, eat what you store") **(unverified, common practice)**. |
| core.food.go | Portable high-calorie food | go-bag | basics | **3 days** per person [S23] | Calories while evacuating. | Granola/protein bars [S2]. Pick ones that survive heat in a car. |
| core.food.opener | Manual can opener | both | basics | 1 per kit | Electric openers won't work. | ReadySF: pull-tops or pack an opener [S1]. |
| core.food.messkit | Plates, cups, utensils, paper towels | stay-bin | basics | 2 weeks' worth | Saves water you'd use for dishes. | ReadySF "useful" item [S1]. |
| core.food.stove | Camp stove + fuel + lighter/matches | stay-bin | advanced | 1 stove, fuel for about 1 hot meal/day for 7 to 14 days **(app suggestion)** | Hot food and boiling water when gas or power is off. | **Outdoors only, never indoors (carbon monoxide)** [S37][S40]. ECA lists a charcoal or gas grill [S13]. |
| core.food.matches | Waterproof matches or lighter | both | basics | 1 | For stove or light. | Ready.gov additional item [S9]. |

### 3.3 Light, power, communication

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| core.light.headlamp | Headlamp or flashlight | both | basics | 1 per person per kit | Outages are dark. A headlamp frees your hands [S1]. | Headlamp preferred [S1][S2]. Same battery size across devices simplifies spares **(app suggestion)**. |
| core.light.batteries | Spare batteries | both | basics | 1 full set per device | Devices are useless without them. | Check expiration dates. Store them outside the devices **(unverified, common guidance)**. |
| core.light.lantern | Battery lantern | stay-bin | advanced | 1 per household | Lights a room, and is safer than candles. | LED. Avoid candles (fire risk after quakes) **(unverified, common guidance)**. |
| core.comm.radio | Battery or hand-crank radio (AM/FM + NOAA) | both | basics | 1 per kit | Gets official updates if phones and internet are down. | SF stations: **KCBS 740 AM / 106.9 FM, KQED 88.5 FM, KALW 91.7 FM, NOAA Weather Radio 162.400 MHz** [S1][S3]. NOAA tone alert is a plus [S9]. |
| core.comm.powerbank | Portable phone battery + cable | go-bag | basics | 1 per person (≥10,000 mAh **app suggestion**) | Keeps your phone alive for alerts and contact. | ReadySF go bag [S2]. Top up monthly **(app suggestion)**. |
| core.comm.carcharger | Car phone charger | car | basics | 1 | Recharge while evacuating. | Ready.gov car kit [S61]. |
| core.comm.powerstation | Portable power station / large battery bank | stay-bin | advanced | 1 per household (size to needs) | Runs phones, lights, a CPAP or a small fridge in outages. | Indoor-safe, unlike generators. Pair with a solar panel for multi-day outages **(unverified)**. |
| core.comm.whistle | Whistle | go-bag | basics | 1 per person | Signals rescuers if you're trapped. | ECA, Ready.gov [S9][S13]. |
| core.comm.contacts | Printed contact list + household plan | go-bag | basics | 1 per person | You won't remember numbers if your phone dies. | ReadySF go bag item. Template at sf.gov/ReadySF [S2]. Include an out-of-area contact. |
| core.comm.map | Local paper map with routes marked | go-bag | basics | 1 per kit | GPS and data may fail. | CAL FIRE: mark at least 2 evacuation routes [S23]. |

### 3.4 Health, first aid, hygiene

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| core.med.firstaid | First aid kit | both | basics | 1 per kit | Treat injuries when 911 is overwhelmed. | Bandages, antiseptic wipes, gauze, gloves, pain relievers [S1]. |
| core.med.bleed | Bleeding-control kit (tourniquet, pressure bandage) | go-bag | advanced | 1 per household | Severe bleeding kills in minutes. Quakes cause glass and debris injuries. | ReadySF lists "first-aid/bleed control kit" [S2]. Get a recognized tourniquet type and take a free Stop the Bleed class **(unverified class availability)**. |
| core.med.rx | Prescription medications | both | basics | **7 days** in go bag [S59]. **14 days** advanced [S57]. | Pharmacies may close. | Ask your doctor or insurer about an early refill or 90-day supply. Rotate so it doesn't expire. |
| core.med.rxlist | Medication list (name, dose, prescriber, pharmacy, allergies) | go-bag | basics | 1 per person | Lets any pharmacist or medic help you. | Ready.gov disability page [S56]. |
| core.med.otc | Non-prescription meds (pain/fever, antidiarrheal, antacid, antihistamine) | both | basics | Small supply | Common problems when stressed and eating differently. | Ready.gov list [S9]. |
| core.med.eyes | Spare glasses/contacts + solution | go-bag | basics | 1 set per person who needs them | You can't evacuate safely if you can't see. | ReadySF [S2], ECA [S13]. |
| core.med.n95 | NIOSH-approved N95 respirators | both | basics | 2/person go bag, 5/person stay bin **(app suggestion)** | Filters smoke, dust from collapsed buildings, and ash. | Must say **"NIOSH" and "N95"** on the mask. Surgical or cloth masks don't seal [S28]. Not sized for small children [S31]. |
| core.hyg.sanitizer | Hand sanitizer (≥60% alcohol) + bar soap | both | basics | 1 of each per kit | Prevents illness when water is scarce. | ReadySF [S1]. CDC cites ≥60% alcohol [S58]. |
| core.hyg.gloves | Disposable nitrile gloves | both | basics | 1 box per household | Hygiene and first aid. | Non-latex [S13]. |
| core.hyg.toiletries | Toothbrush, toothpaste, deodorant, travel toiletries | go-bag | basics | 1 set per person | Basic hygiene in a shelter. | ReadySF [S2]. |
| core.hyg.feminine | Menstrual supplies | both | basics | 1 cycle's worth per person who needs them | Easy to forget, hard to find after. | ReadySF [S1]. |
| core.hyg.wipes | Wet wipes / moist towelettes | both | basics | 1 pack per kit | Washing without water. | Ready.gov [S9]. |
| core.illness.thermometer | Thermometer | stay-bin | advanced | 1 per household | Track illness at home (pandemic or post-disaster). | Pandemic coverage folded in here [S54]. |
| core.illness.cleaning | Disinfecting supplies (wipes, spray) | stay-bin | advanced | 2 weeks' worth | Pandemic and post-disaster hygiene. | Ready.gov pandemic list [S54][S9]. |

### 3.5 Sanitation (critical for Bay Area quakes: sewers break too)

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| core.san.bags | Heavy-duty trash bags | stay-bin | basics | 1 box (≥30) per household | Toilet liners and waste containment if sewers fail. | ReadySF: bags "can be used with a bucket as a toilet if water/sewer service is impacted" [S1]. Contractor-grade. |
| core.san.bucket | 5-gal bucket with tight lid | stay-bin | basics | 1 per household | Emergency toilet. | Toilet-seat lids for buckets are cheap add-ons. |
| core.san.tp | Toilet paper | stay-bin | basics | 2 weeks' worth | Self-explanatory. | ReadySF [S1]. |
| core.san.twobucket | Second bucket + dry cover material (sawdust, shredded paper, or wood pellets) for a two-bucket (urine/feces) toilet | stay-bin | advanced | 1 extra bucket + 1 bag of material | Separating urine cuts odor and volume a lot, which matters for multi-week outages. | Method from Oregon State Extension / Pacific NW guidance [S66]. **Not an official Bay Area recommendation (unverified locally).** Avoid clay cat litter for the feces bucket [S66]. |
| core.san.ties | Zip ties / twist ties | stay-bin | basics | 1 pack | Seal waste bags. | Ready.gov "plastic ties" [S9]. |

### 3.6 Documents and money

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| core.doc.copies | Copies of IDs, insurance cards, Medicare/Medicaid cards, proof of address, birth/marriage certs, credit/ATM card copies | go-bag | basics | 1 set per household (or per adult) | Proving identity and address is needed for aid and re-entry. | ReadySF list [S2]. Waterproof pouch or zip bag. |
| core.doc.digital | Encrypted digital copies (cloud + USB) | home-prep-action | basics | n/a | Paper can burn or flood. | Ready.gov recommends password-protected digital copies [S45][S54]. |
| core.doc.leases | Leases, titles, deeds, insurance policies | stay-bin | advanced | 1 set | Insurance claims and housing aid. | ReadySF [S1]. Fire-resistant document bag is a nice upgrade. |
| core.cash | Cash in small bills | go-bag | basics | $100 to $200 per household **(app suggestion)** | Card readers and ATMs fail without power. | Small bills [S1][S2]. Keep in a waterproof bag. |
| core.keys | Spare house and car keys | go-bag | basics | 1 set | Locked out after evacuation, or driver gets separated. | CAL FIRE checklist [S23]. CDC [S57]. |

### 3.7 Clothing, shelter, tools

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| core.cloth.shoes | Sturdy closed-toe shoes | go-bag | basics | 1 pair per person | Broken glass and debris. | ReadySF [S2]. |
| core.cloth.change | Change of warm clothing, incl. socks and underwear | go-bag | basics | 1 set per person | Bay Area nights are cold even in summer. | ReadySF "change of warm clothing" [S2]. |
| core.cloth.rain | Rain poncho or shell | go-bag | basics | 1 per person | Storms, and evacuating in rain. | Poncho doubles as a ground sheet. |
| core.shelter.blanket | Emergency mylar blanket | go-bag | basics | 1 to 2 per person | Light, cheap warmth. | |
| core.shelter.sleep | Sleeping bag or warm blankets | stay-bin | basics | 1 per person | No heat without gas or power. | ReadySF "useful" [S1]. Ready.gov [S9]. |
| core.shelter.tent | Tent or tarp | stay-bin | advanced | 1 per household | If the home is unsafe to sleep in after a quake. | ECA "possibly a tent" [S13]. |
| core.tool.gloves | Work gloves | both | basics | 1 pair per adult | Handling glass and debris. | ECA under-bed and household kits [S13]. |
| core.tool.wrench | Wrench for gas/water shutoff | home-prep-action | basics | 1, stored at the meter | Shut off gas **only if you smell or hear a leak** [S3]. | SF guide: "Keep a wrench next to the shutoff valve" [S3]. PG&E: 12 to 15 inch adjustable wrench [S22]. |
| core.tool.duct | Duct tape | stay-bin | basics | 1 roll | Repairs, sealing windows or rooms. | ReadySF tools list [S1]. |
| core.tool.multitool | Multi-tool or pliers + scissors | both | basics | 1 per kit | General repairs. | Ready.gov [S9]. |
| core.tool.hammer | Hammer + nails | stay-bin | advanced | 1 | Board broken windows. | ReadySF tools [S1]. |
| core.tool.extinguisher | Fire extinguisher (ABC-rated) | stay-bin | basics | 1 per floor **(app suggestion)** | Post-quake fires are common, and 911 may be slow. | ReadySF essentials [S1]. Check the gauge monthly **(unverified, common NFPA-style guidance)**. |
| core.tool.sheeting | Plastic sheeting | stay-bin | advanced | 1 roll | Broken windows, chemical shelter-in-place. | Ready.gov [S9][S51]. |
| core.comfort | Comfort items (book, cards, games, kids' toys) | both | basics | 1 per person | Reduces stress, especially for kids. | ReadySF "Entertainment" [S1]. |
| core.notebook | Notepad + pencil | go-bag | basics | 1 | Leave notes ("we're safe, went to X"), track info. | ReadySF says "leave a trail" [S3]. |

### 3.8 Core non-item actions

| id | action | tier | why / detail |
|---|---|---|---|
| act.alerts.county | **Sign up for your county alert system** (see table in §8) | basics | Official evacuation and shelter orders. Most are opt-in, and enrollment is low (SMC Alert was about 10.6% in 2019) [S62]. |
| act.alerts.wea | Keep Wireless Emergency Alerts and government alerts **on** in phone settings | basics | WEA carried the Dec 2024 tsunami warning [S50]. |
| act.plan | Make a household plan: meeting place, out-of-area contact, who picks up kids/pets | basics | ReadySF "Make a Plan" sheet [S3]. |
| act.gas.locate | Find your gas shutoff and keep a wrench there. Renters: ask the landlord where the building shutoff is. | basics | **Only shut off if you smell or hear gas, see a broken line, or suspect a leak.** Only PG&E or a qualified pro can turn it back on, and that can take days to weeks [S3][S22]. |
| act.water.locate | Find your main water shutoff | basics | Keeps contaminated water out and saves water already in your pipes **(unverified, common guidance)**. |
| act.alarms | Test smoke and CO alarms. Battery or battery-backup CO alarm near sleeping areas. | basics | CO risk rises in outages (generators, grills) [S40]. |
| act.insurance | Review renters/homeowners policy. Consider earthquake insurance (CEA) and flood insurance. | advanced | Standard policies exclude quake and flood. CEA renters policies are "as low as $35 a year" [S21]. Flood policies typically take up to 30 days to start [S45]. |
| act.training | Take CERT (SF calls it NERT) or first aid/CPR training | advanced | Neighbors are the first responders in a regional disaster. |
| act.neighbors | Know 2 or 3 neighbors, especially older or disabled ones | basics | ReadySF "get connected" [S4]. The CDC heat "buddy system" applies too [S42]. |

---

## 4. Hazard modules

### 4.1 Earthquake

**Bay Area context.** USGS puts the chance of at least one M6.7+ quake in the Bay Area at about 72% by 2043 (UCERF3), and the Hayward-Rodgers Creek fault has the highest single-fault odds, about 1 in 3 [S17]. News coverage of a 2026 USGS update says 74% (primary unverified) [S18]. The USGS HayWired scenario (M7.0 on the Hayward Fault) projects about 800 deaths, 18,000 injuries, 400,000+ people displaced, and East Bay water outages averaging about 6 weeks, some up to 6 months [S14][S16]. That's why Bay Area water agencies push for a week or more of water rather than FEMA's "several days."

**Items** (on top of core)

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| eq.bedside.shoes | Shoes + socks by the bed | bedside | basics | 1 pair per person | Quakes at night mean broken glass on the floor. | ECA under-bed bag [S13]. Tie it to the bed leg so it doesn't slide away. |
| eq.bedside.light | Flashlight/headlamp by the bed | bedside | basics | 1 per person | Power goes out instantly. | ECA [S13]. CAL FIRE also advises shoes and a flashlight by the bed [S25]. |
| eq.bedside.whistle | Whistle by the bed | bedside | basics | 1 per person | Signal if trapped. | ECA [S13]. |
| eq.bedside.glasses | Spare glasses by the bed | bedside | basics | 1 if needed | Glasses get lost in shaking. | ECA [S13]. |
| eq.bedside.gloves | Work gloves + dust mask by the bed | bedside | advanced | 1 per adult | Clearing debris to get out. | ECA [S13]. |
| eq.helmet | Hard hat or helmet | stay-bin | advanced | 1 per adult | Aftershocks and falling debris. | ECA optional under-bed item [S13]. A bike helmet works as a cheap substitute **(app suggestion)**. |
| eq.prybar | Pry bar / small crowbar | stay-bin | advanced | 1 per household | Free jammed doors, which are common after quakes. | ECA optional [S13]. |
| eq.goggles | Safety goggles | stay-bin | advanced | 1 per adult | Dust and debris cleanup. | ECA household kit [S13]. |
| eq.tarp | Heavy tarp | stay-bin | advanced | 1 to 2 per household | Cover broken windows and roof damage, or shelter outside. | ECA "heavy-duty plastic bags (tarps)" [S13]. |
| eq.strap.heater | Water heater strapping kit | home-prep-action | basics | 2 straps (upper and lower third) | Required by California law. A toppled heater can break gas lines and start fires. Its tank is also an emergency water reserve. | Cal. Health & Safety Code §19211, two straps per Plumbing Code [S19]. Renters: landlords are responsible. |
| eq.strap.furniture | Furniture/TV anchor straps | home-prep-action | basics | 1 per tall item | Falling bookcases and TVs injure people. | ReadySF: secure TVs, bookcases, cabinets, mirrors [S3]. Renter-friendly versions use small screw holes. |
| eq.latch | Cabinet latches | home-prep-action | advanced | 1 per kitchen cabinet | Keeps glass and heavy items in. | |
| eq.putty | Museum putty/gel for objects | home-prep-action | advanced | 1 pack | Keeps breakables on shelves. | |
| eq.firstaid.trauma | Extra trauma supplies (large dressings, splint, burn gel) | stay-bin | advanced | 1 add-on kit | Quake injuries are mostly cuts, fractures and burns. | **(unverified, general)** |

**Earthquake actions**

| id | action | tier | detail |
|---|---|---|---|
| eq.act.dch | Learn and practice **Drop, Cover, Hold On** | basics | Drop to hands and knees, cover head and neck under sturdy furniture or against an interior wall, hold on until shaking stops (typically 10 to 30 s) [S3][S69]. |
| eq.act.myshake | Install **MyShake** (California's earthquake early warning app) and keep phone alerts on | basics | Gives seconds of warning before shaking [S12-adjacent Cal OES coverage; see S68]. |
| eq.act.hazards | Move heavy furniture away from beds and couches. Put heavy items on low shelves. | basics | ReadySF [S3]. |
| eq.act.gas | Know gas shutoff. Only shut off if you smell or hear gas. | basics | [S3][S22]. |
| eq.act.water | Learn the bleach and boil methods for treating water | basics | EBMUD: rolling boil 1 min. Bleach doses above [S6]. SFPUC says boil 3 to 5 min (a conflict, see §10) [S8]. |
| eq.act.retrofit | Check if your house needs a seismic retrofit. Apply to **Earthquake Brace + Bolt** (up to $3,000, plus up to $7,000 more for income-eligible households). | advanced | Pre-1980 wood-frame houses with raised foundations. 2025 window was Aug 20 to Oct 1. Rentals newly eligible [S20]. Check the 2026 window **(unverified)**. |
| eq.act.softstory | Apartment dwellers: ask whether your building is a soft-story building and whether it was retrofitted | advanced | SF and other cities run mandatory soft-story programs **(unverified, details not researched)**. |
| eq.act.insurance | Consider CEA earthquake insurance (homeowner, condo or renter) | advanced | Renter policies cover belongings and "loss of use," with no deductible on loss of use [S21]. |
| eq.act.aftershock | Plan for aftershocks and tsunami if coastal | basics | ReadySF [S3]. |

### 4.2 Wildfire (evacuation)

**Bay Area context.** The region's hills (Oakland/Berkeley hills, Marin, Santa Cruz Mountains, the North Bay) are wildland-urban interface. The 1991 Oakland Hills fire killed 25 people and destroyed about 2,843 single-family homes plus 437 apartment/condo units [S27]. The 2017 Tubbs Fire killed 22 and destroyed about 5,600 structures in Santa Rosa and surrounding areas [S27]. Wind-driven fires give little warning, so the go bag must be ready and the car fueled before Red Flag days.

**Items**

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| wf.map | Paper map with ≥2 evacuation routes marked | go-bag + car | basics | 1 per kit | Roads close and GPS reroutes into traffic. | CAL FIRE: "at least 2 evacuation routes" [S23]. |
| wf.keys | Extra car keys | go-bag | basics | 1 set | Avoid hunting for keys under pressure. | CAL FIRE [S23]. |
| wf.water.car | 3 gal water per person | car | basics | 3 gal/person | CAL FIRE go bag standard [S23]. | See core.water.car. |
| wf.n95 | NIOSH N95s in go bag and car | go-bag + car | basics | 2 per person per kit | Driving through smoke and ash. | NIOSH-labeled [S28]. |
| wf.cloth | Long sleeves/pants in natural fiber (cotton/wool) | go-bag | advanced | 1 set per person | Synthetics can melt near heat. | **(unverified; common CAL FIRE-style guidance, couldn't fetch the CAL FIRE page)** |
| wf.goggles | Goggles (non-vented) | go-bag | advanced | 1 per person | Ash and embers in eyes. | **(unverified)** |
| wf.backup | Backup drive / cloud backup of photos and files | home-prep-action | basics | n/a | "Six P's": People, Papers, Prescriptions, Pictures, Personal computer, Plastic (cards/cash) [S24]. | |
| wf.sixps | Pre-written "grab list" of irreplaceables taped inside a closet | home-prep-action | basics | 1 | You won't think clearly in an evacuation. | Six P's framework [S24]. |
| wf.petcarrier | Pet carriers staged, not buried | home-prep-action | basics | 1 per pet | Pets hide in emergencies [S55]. | See Pets modifier. |
| wf.hose | Garden hoses long enough to reach around the house | home-prep-action | advanced | n/a | Firefighters may use them. CAL FIRE pre-evac list mentions connecting hoses. | **(unverified exact wording)** |
| wf.docbag | Fire-resistant document bag | go-bag | advanced | 1 per household | Protects originals if you can't evacuate them. | |

**Wildfire actions**

| id | action | tier | detail |
|---|---|---|---|
| wf.act.zone | **Look up your evacuation zone** on Genasys Protect (formerly Zonehaven), app or protect.genasys.com | basics | Used by Alameda, Contra Costa, Marin, Napa, San Mateo, Santa Clara, Santa Cruz and Sonoma counties (2021 list) [S26]. Orders are issued by zone name. Genasys supplements but doesn't replace your county alert system [S26]. |
| wf.act.alerts | Sign up for county alerts (§8) | basics | |
| wf.act.redflag | On Red Flag Warning days: load go bag in car, keep tank at least half full, charge phones | basics | CAL FIRE 2025 campaign: keep at least half a tank of gas [S25]. |
| wf.act.preevac | Learn the pre-evacuation checklist, **if time allows**: shut windows and doors but leave them **unlocked**. Leave inside and outside lights on. Back car into the driveway, loaded. Shut off gas at the meter and turn off pilot lights. Turn off propane. Bring flammable patio furniture, doormats and toys inside. Turn off AC. | basics | CAL FIRE "Go" brochure [S24]. Gas shutoff here is a CAL FIRE wildfire step and is different from the earthquake rule. |
| wf.act.dontwait | **Don't wait for an order if you feel threatened.** Leave early. | basics | CAL FIRE [S24]. |
| wf.act.garage | Learn the manual release on an electric garage door | basics | PSPS and fire cut power. **(unverified exact CAL FIRE wording)** |
| wf.act.defensible | Defensible space: keep 0 to 5 ft around the house ember-resistant, and maintain 100 ft defensible space (state law in high-hazard areas) | advanced | CA Public Resources Code 4291 sets 100 ft **(unverified; well established, but the CAL FIRE site blocked fetch)**. Zone 0 ember-resistant regulations were being finalized by the Board of Forestry. Check status **(unverified)**. |
| wf.act.practice | Drive your evacuation routes once, and practice a family evacuation with pets | advanced | |

### 4.3 Wildfire smoke

**Bay Area context.** Smoke reaches the whole region even from distant fires. During the 2018 Camp Fire, BAAQMD recorded some of the worst air quality since its records began in 1999, with unhealthy air for nearly two weeks and AQI above 200 on five days [S32]. Smoke events can last days to weeks, and N95s and air purifiers sell out once smoke arrives, so buy ahead [S30].

**Items**

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| sm.n95.stock | NIOSH-approved N95 or P100 respirators | stay-bin | basics | 5 per person basics, 10+ per person advanced **(app suggestion)** | Fine smoke particles harm lungs and hearts. | "NIOSH" + "N95"/"P100" printed on the mask. Cloth, surgical and bandana masks don't work for smoke [S28]. Do a seal check each wear. Facial hair breaks the seal [S28]. |
| sm.diyfilter | DIY box-fan air cleaner: 20" box fan + MERV 13 (or higher) filter | stay-bin | basics | 1 per household (for the clean room) | Cheap way to clean one room's air. | **Fan made 2012 or later with UL/ETL mark.** A cardboard shroud raises output about 40%. Four-filter "Corsi-Rosenthal" cube works best [S29]. Don't run unattended or on an extension cord [S29]. |
| sm.hepa | Portable HEPA air cleaner sized for the room | stay-bin | advanced | 1 per bedroom/clean room | Higher, quieter filtration than a DIY fan. | Size to the room (check CADR). **No ozone generators** [S30]. Run on high continuously during smoke [S30]. CARB keeps a list of certified air cleaners **(unverified link)**. |
| sm.filters.spare | Spare MERV 13 filters / HEPA replacement filters | stay-bin | advanced | 2 to 4 | Dirty filters make DIY units "almost completely ineffective" [S29]. | Replace when dark gray or brown or smelling of smoke [S29]. |
| sm.hvac | MERV 13+ filter for central HVAC (if your system can handle it) | home-prep-action | advanced | 1 + spares | Whole-house filtration. | AirNow: only if the system can safely take it. Change more often in smoke [S30]. |
| sm.seal | Weatherstripping / painter's tape for the clean room | stay-bin | advanced | 1 roll | Smoke leaks in around doors and windows. | BAAQMD staff advise weatherizing before fire season (via news report) [S32-adjacent; unverified primary]. |
| sm.aqmonitor | Indoor air-quality (PM2.5) monitor | stay-bin | advanced | 1 | Shows whether your clean room is working. | **(unverified; not in official checklists)** |
| sm.meds | Extra asthma/COPD/heart meds and inhalers | stay-bin | basics (if condition) | 2+ weeks | Smoke triggers flare-ups. | **(unverified; general CDC/EPA advice for sensitive groups)** |
| sm.food | Extra food so you don't need to go out | stay-bin | basics | Covered by core 7-day food | Limits outdoor exposure. | |

**Smoke actions**

| id | action | tier | detail |
|---|---|---|---|
| sm.act.room | Pick a **clean air room** (bedroom, few windows) | basics | AirNow [S30]. EPA: one room may be enough [S29]. |
| sm.act.monitor | Bookmark the AirNow Fire and Smoke Map. Get BAAQMD Spare the Air alerts. | basics | [S30]. |
| sm.act.cool | Plan to stay cool **without** opening windows | basics | AirNow [S30]. Overlaps with heat. |
| sm.act.indoorpollution | During smoke: don't burn candles, fry or broil food, or vacuum without HEPA | basics | **(unverified; general EPA/air district guidance)** |
| sm.act.car | In the car, use recirculate mode | basics | **(unverified, common guidance)** |
| sm.act.kids | Kids: prioritize the clean room. N95s aren't sized for small children. | basics | EPA: "respirators are not sized for children" [S31]. UCSF PEHSU: kids ~7+ may fit small adult sizes. A mask with small gaps still beats a surgical mask [S31]. |

### 4.4 Power outage (incl. PG&E PSPS)

**Bay Area context.** PG&E de-energizes lines in high fire-threat areas during dry offshore winds (PSPS). The October 2019 events averaged about 55 hours per affected customer [S34], and PG&E warns the first notice may come the same day [S33]. Every other hazard (quake, storm, heat) can also knock out power, so this module helps everyone.

**Items**

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| pw.cooler | Cooler + ice packs | stay-bin | basics | 1 per household | Keeps food and meds cold past the fridge's 4-hour limit. | Ready.gov/FoodSafety [S37][S38]. Freeze water bottles ahead (they double as drinking water) **(app suggestion)**. |
| pw.thermo | Fridge and freezer thermometers | home-prep-action | basics | 1 each | Tells you what food to throw out (at or above 40°F) [S37]. | Cheap appliance thermometers. |
| pw.co | Battery or battery-backup CO alarm | home-prep-action | basics | 1 per sleeping area + each level | Generators, grills and heaters cause CO poisoning in outages. | CDC/Ready.gov [S37][S40]. Replace alarms every 5 to 7 years (NFPA, via search) [S40-adjacent]. |
| pw.station | Portable power station (battery) | stay-bin | advanced | 1 per household | Indoor-safe power for phones, CPAP, lights, router. | Size watt-hours to your devices. Pair with a solar panel for multi-day PSPS. |
| pw.solar | Solar panel or solar charger | stay-bin | advanced | 1 | Recharges batteries when the outage lasts days. | **(unverified, general)** |
| pw.generator | Portable generator + fuel + heavy outdoor extension cord | home-prep-action | advanced | 1 per household | Runs a fridge or medical device for days. | **Outdoors, at least 20 ft from windows, doors and vents. Never in a garage or carport, even with the door open** [S40]. Store fuel safely. Rotate gas with stabilizer **(unverified)**. |
| pw.surge | Surge protectors | home-prep-action | advanced | Key electronics | Power returns with spikes [S37]. | |
| pw.batteries | Extra batteries sized for all lights and radios | stay-bin | basics | 2 sets | | |
| pw.landlight | Battery lanterns / tap lights in every room | stay-bin | basics | 1 per room **(app suggestion)** | Safer than candles. | |
| pw.cash | Cash | go-bag | basics | (core) | Card readers fail. | |

**Power / PSPS actions**

| id | action | tier | detail |
|---|---|---|---|
| pw.act.contact | Keep PG&E contact info current. Add Address Alerts for parents, school, rentals. | basics | Alerts go only to contacts on file [S33][S36]. |
| pw.act.forecast | Check PG&E's 7-day PSPS forecast during wind events | basics | [S33]. |
| pw.act.medbaseline | If anyone depends on powered medical equipment: **enroll in PG&E Medical Baseline**, or self-certify for Vulnerable Customer Status | basics (for those users) | Medical Baseline customers get extra alerts, including door knocks [S33][S36]. **Acknowledge alerts** by answering the call or replying to the text [S36]. |
| pw.act.ddar | Check eligibility for the **Disability Disaster Access & Resources (DDAR)** program (backup batteries, accessible transport, hotel stays, food replacement) | advanced | PG&E + California Foundation for Independent Living Centers. Eligibility is high fire-threat district or 2+ PSPS events since 2020, plus device use or disability. Income not considered. No doctor note required [S35]. |
| pw.act.crc | Know that PG&E opens **Community Resource Centers** (charging, water, Wi-Fi, restrooms) during PSPS | basics | Locations announced per event. Not shelters or cooling centers [S36]. |
| pw.act.ev | Fully charge EVs and devices before a forecast PSPS | basics | PG&E [S33]. |
| pw.act.inventory | List everything you rely on that needs electricity (garage door, well pump, medical devices, fridge meds) | basics | Ready.gov [S37]. |
| pw.act.nogasheat | Never heat the home with a gas stove or oven | basics | Ready.gov [S37]. |

### 4.5 Extreme heat

**Bay Area context.** In Sept 2022 Livermore hit 116°F, an all-time Bay Area record, with records in San Jose (109°F), Santa Rosa (115°F) and Napa (114°F) [S43]. Only about 47% of SF-Oakland metro households had AC (2020 figure), and San Francisco reportedly has the lowest AC rate of any U.S. city [S44]. Buildings here are designed for mild weather, so modest heat waves are dangerous, especially for older adults, infants and people with chronic illness.

**Items**

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| ht.electrolytes | Electrolyte packets / sports drinks | stay-bin | basics | 1 to 2 per person per hot day, for 3 days **(app suggestion)** | Replace salts lost to sweat. | Ready.gov mentions water and sports drinks [S41]. |
| ht.water | Extra water for hot days | stay-bin | basics | +50% over the core amount on heat days **(app suggestion)** | CDC: store more water in hot climates [S10]. | |
| ht.cooltowel | Cooling towels, spray bottle, ice packs | stay-bin | basics | 1 per person | Cool skin fast. Also first aid for heat illness [S41]. | |
| ht.fan | Battery or USB fan | stay-bin | basics | 1 per household | Comfort only. **Fans don't prevent heat illness in extreme heat** [S41][S42]. | Cheap. Pair with cool showers. |
| ht.shades | Blackout curtains / reflective window film | home-prep-action | advanced | Sun-facing windows | Keeps heat out [S41]. | |
| ht.ac | Portable or window AC unit (insulated around it) | home-prep-action | advanced | 1 cool room | One cool room protects vulnerable people. | Ready.gov [S41]. Renters: check lease rules. |
| ht.thermometer | Indoor thermometer | stay-bin | basics | 1 | Know when your home is dangerously hot. | **(app suggestion)** |
| ht.hat | Wide-brim hat, light loose clothing | go-bag | basics | 1 per person | Shade while outdoors or evacuating. | Ready.gov [S41]. |

**Heat actions**

| id | action | tier | detail |
|---|---|---|---|
| ht.act.cooling | Know your nearest cooling center (library, senior or community center). Check your county site per event. | basics | Hours and locations vary per event [S42]. |
| ht.act.heatrisk | Check the CDC/NWS **HeatRisk** forecast for your ZIP | basics | [S42]. |
| ht.act.buddy | Buddy system: check on older neighbors twice a day in heat waves | basics | CDC [S42]. |
| ht.act.signs | Learn heat exhaustion vs. **heat stroke (call 911)**: red, hot, dry skin, temperature above 103°F, confusion | basics | Ready.gov [S41]. |
| ht.act.meds | Ask your doctor whether your meds affect heat tolerance or need special storage | advanced | **(unverified, general CDC advice)** |
| ht.act.liheap | Ask LIHEAP for help with cooling bills | advanced | [S41][S42]. |
| ht.act.car | Never leave kids or pets in a parked car | basics | **(general)** |

### 4.6 Winter storms, atmospheric rivers, flooding and landslides

**Bay Area context.** Atmospheric rivers bring most of the region's yearly rain in a few storms. The Dec 2022 to Jan 2023 series caused widespread flooding, gusts over 100 mph, landslides and long power outages across the Bay Area [S46]. Flooding hits low-lying creekside and bayshore areas, while hillside homes face mudslides, especially near burn scars [S47].

**Items**

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| st.raingear | Waterproof jacket + boots | go-bag | basics | 1 per person | Evacuating in storms. | |
| st.drybag | Waterproof document pouch / dry bag | go-bag | basics | 1 per household | Floods ruin papers [S45]. | |
| st.sandbags | Sandbags (filled) | home-prep-action | advanced | Enough for doorways, often 10+ | Divert shallow water. | Many Bay Area cities give them out free. **Fill only half full and stack in a staggered brick pattern** [S47]. Not effective against deep or fast water [S47]. |
| st.tarp | Tarps + bungee cords | stay-bin | advanced | 2 | Roof leaks, downed-tree damage. | |
| st.sump | Battery-backup sump pump | home-prep-action | advanced | 1 (if basement) | Ready.gov suggests it [S45]. | |
| st.backflow | Check valves / backflow preventers | home-prep-action | advanced | n/a | Ready.gov [S45]. | |
| st.ice | n/a | | | | | (Bay Area lowlands rarely get snow or ice. Skip snow gear.) |

**Storm actions**

| id | action | tier | detail |
|---|---|---|---|
| st.act.floodmap | Check FEMA flood map for your address, but remember "flooding doesn't follow map lines" | basics | [S45]. |
| st.act.floodins | Consider flood insurance. It **usually takes up to 30 days to start**, so buy before the rainy season. | advanced | [S45]. Homeowner and renter policies exclude flood. |
| st.act.drains | Clear gutters and storm drains near your home before the rainy season | basics | [S45]. |
| st.act.turnaround | **Turn around, don't drown.** 6 in of moving water can knock you down. 1 ft can sweep a car away. | basics | [S45]. |
| st.act.landslide | Learn landslide warning signs: new cracks in ground or pavement, tilting trees or poles, sudden muddy creek water, doors that start sticking. Evacuate early if on a steep slope or near a burn scar. | advanced | **(unverified for the list of signs; general USGS guidance not fetched)** |
| st.act.valuables | Move valuables and electronics up off floors before big storms | basics | [S45][S47]. |
| st.act.trees | Have large trees near the house checked | advanced | A falling redwood killed a toddler in Sonoma County in the Jan 2023 storms (news report) **(unverified detail)** [S46]. |

### 4.7 Tsunami (gated: coastal / bayshore)

**Bay Area context.** CGS mapped Tsunami Hazard Areas for every Bay Area coastal county (2021 to 2022). Notable areas include SF's North Beach and downtown/Market St, the Port of Richmond, and Half Moon Bay north of Arroyo Leon. A distant Aleutian quake would send first surges here in about 5 hours [S48]. Local Hayward or San Andreas quakes are unlikely to cause a big tsunami [S50]. Warnings are real and confusing, though. The Dec 2024 warning reached about 5 million people and was cancelled after about 70 minutes [S50], and the July 2025 Kamchatka quake produced 2 to 2.5 ft tidal swings in SF (news report).

**Items:** The go bag is the kit. There are no unique supplies beyond:

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| ts.gobag.door | Go bag staged by the door (not in a closet or garage) | home-prep-action | basics | n/a | You may have minutes, and should leave on foot. | ReadySF Go Bag is "for fire or tsunami" [S2]. |
| ts.shoes | Walking shoes in or by the go bag | go-bag | basics | 1 pair | Evacuate on foot. Roads jam. | |
| ts.map | Paper map of route to high ground | go-bag | basics | 1 | | |

**Tsunami actions**

| id | action | tier | detail |
|---|---|---|---|
| ts.act.zone | Look up your home, work and school on the **CGS Tsunami Hazard Area map** (tsunami.ca.gov) | basics | [S48]. |
| ts.act.route | Plan and **walk** a route to high ground: 100+ ft above sea level or 1+ mile inland | basics | Ready.gov [S49]. |
| ts.act.natural | **Natural warning = go now**: strong or long shaking at the coast, ocean roar, water receding. Don't wait for an official alert. | basics | Ready.gov [S49]. ReadySF: after shaking, coastal people should go to high ground [S3]. |
| ts.act.stayaway | Stay away until officials give the all-clear. Surges can continue for 8+ hours. | basics | [S49]-adjacent (county guide via search). |
| ts.act.dch | If you feel a quake, **Drop/Cover/Hold first, then evacuate** | basics | Ready.gov [S49]. |

### 4.8 Hazardous materials / chemical shelter-in-place

**Bay Area context.** The northern Contra Costa and Solano shoreline (Richmond, Martinez, Rodeo, Benicia) hosts several refineries. The 2012 Chevron Richmond fire triggered a shelter-in-place order, and about 15,000 residents later sought medical care (KQED). An earlier county count said 9,000+ [S53]. Contra Costa uses sirens plus its Community Warning System. A shelter-in-place order means going inside, sealing up, and turning off ventilation [S52].

**Items**

| id | item | container | tier | quantity | why | buying tip |
|---|---|---|---|---|---|---|
| hz.sheeting | Plastic sheeting, **pre-cut** to fit your shelter room's windows and vents | stay-bin | basics (CoCo/Solano), advanced elsewhere | Enough for 1 room | Keeps outside air out. | Ready.gov [S51]. Label each piece. |
| hz.tape | Duct tape + scissors | stay-bin | basics | 1 roll | Seal sheeting and door gaps [S51]. | |
| hz.towels | Old towels (to wet and block door gaps) | stay-bin | basics | 2 to 4 | Contra Costa: cover cracks with tape or damp towels [S52]. | |
| hz.radio | Battery radio in the shelter room | stay-bin | basics | (core) | Instructions come by radio and alerts [S51]. | |

**Hazmat actions**

| id | action | tier | detail |
|---|---|---|---|
| hz.act.cws | Contra Costa: register at **CWSAlerts.com** and learn what the sirens mean | basics | [S62]. |
| hz.act.room | Choose an interior room with few windows to shelter in | basics | Ready.gov [S51]. |
| hz.act.sip | Learn shelter-in-place steps: go inside, close and lock windows and doors, turn off HVAC, fans and heaters, close fireplace dampers, seal cracks, stay off phone unless life-threatening, wait for all-clear | basics | Contra Costa [S52]. Ready.gov [S51]. |
| hz.act.n95note | **N95s don't filter chemical gases.** Sheltering is the protection. | basics | **(general NIOSH principle; N95 = particulate only)** |

---

## 5. Modifiers

Each modifier adds items, changes quantities, or changes container placement. Tiers apply as in the core.

### 5.1 Infants and toddlers (0 to 3)

| id | change | container | tier | detail / source |
|---|---|---|---|---|
| mod.inf.formula | **Ready-to-feed (RTF) formula** if formula-fed. 3 days in go bag, 7 to 14 in stay bin. | both | basics | CDC: RTF is the safest option in emergencies. Powdered formula needs safe water [S58]. |
| mod.inf.formula.water | Extra bottled water for mixing powdered formula | stay-bin | basics | Use bottled water until authorities say tap is safe [S58]. |
| mod.inf.bottles | Bottles, nipples, cleaning basin, brush, dish soap | both | basics | CDC [S57]. Disposable cups are an option when you can't sterilize [S58]. |
| mod.inf.pump | Manual or battery breast pump, small cooler | both | basics (if pumping) | CDC [S57]. |
| mod.inf.diapers | Diapers, wipes, rash cream | both | basics | 3 days in go bag, 2 weeks in stay bin **(app suggestion based on CDC 2-week framing)** [S57]. |
| mod.inf.meds | Infant pain reliever, thermometer, electrolytes | both | basics | CDC [S57]. |
| mod.inf.sleep | Portable crib/play yard, baby blankets, extra clothes | stay-bin | advanced | CDC [S57]. |
| mod.inf.carrier | Baby carrier (sling or soft carrier) | go-bag | basics | Hands free for evacuating on foot [S57]. |
| mod.inf.records | Vaccination records | go-bag | basics | CDC [S57]. |
| mod.inf.water | Increase stored water for nursing parents | stay-bin | basics | CDC: store more if pregnant or lactating [S57][S10]. |
| mod.preg | If pregnant: prenatal vitamins, meds, snacks, maternity clothes, **emergency birth supplies** (clean towels, sharp scissors, bulb syringe, gloves, 2 white shoelaces, sanitary pads), plan with provider | both | advanced | CDC [S57]. |

### 5.2 Kids (4 to 17)

| id | change | container | tier | detail |
|---|---|---|---|---|
| mod.kid.gobag | Own small go bag (weight they can carry) with snacks, water bottle, comfort item | go-bag | basics | ReadySF: one bag per family member [S2]. |
| mod.kid.id | ID card or wristband with name + parent contact. Help them memorize a number. | go-bag | basics | CDC [S57]. |
| mod.kid.activities | Activities (coloring, cards, book) | both | basics | CDC [S57], ReadySF [S1]. |
| mod.kid.school | Know the school's reunification plan. Update emergency release forms. | home-prep-action | basics | **(unverified, general)** |
| mod.kid.clothes | Check clothes and shoe sizes every 6 months | maintenance | basics | **(app suggestion)** |
| mod.kid.n95 | Small-size N95s for older kids. Clean room for younger kids. | stay-bin | basics | See §4.3 [S31]. |

### 5.3 Older adults

| id | change | container | tier | detail |
|---|---|---|---|---|
| mod.old.meds | 14 days of meds, list of meds and doses, copies of Medicare/insurance cards | both | basics | Ready.gov older adults [S64]. CDC [S59]. |
| mod.old.aids | Spare glasses, hearing aid + extra batteries, denture supplies | go-bag | basics | Ready.gov disability/older adults [S56][S64]. |
| mod.old.mobility | Plan to keep cane/walker with you. Spare if possible. | go-bag | basics | [S56]. |
| mod.old.heat | Heat module defaults on (higher risk) | n/a | basics | [S42]. |
| mod.old.network | Name 2 or more people who check on you and know how to use your equipment | home-prep-action | basics | Ready.gov older adults [S64]. |
| mod.old.lightweight | Wheeled go bag instead of a backpack | go-bag | basics | ReadySF allows "small suitcase" [S2]. |

### 5.4 People with disabilities / mobility needs

| id | change | container | tier | detail |
|---|---|---|---|---|
| mod.dis.mobility | Spare manual wheelchair (if power chair user), cane or walker, tire patch kit, portable pump, spare seat cushion | stay-bin | advanced | Ready.gov [S56]. |
| mod.dis.battery | Extra charged battery for power wheelchair / scooter | stay-bin | basics | Ready.gov [S56]. |
| mod.dis.comm | Communication cards (laminated phrases or pictograms), pen and paper, battery lantern for sign/lip reading in the dark, weather radio with text display / flashing alert | go-bag | basics | Ready.gov [S56]. |
| mod.dis.devices | List of device models and serial numbers | go-bag | basics | Ready.gov [S56]. |
| mod.dis.service | Service animal supplies (food, water, ID, records) | go-bag | basics | Ready.gov [S56]. |
| mod.dis.labels | Braille or large-print labels on supplies | stay-bin | advanced | Ready.gov [S56]. |
| mod.dis.ddar | Check DDAR program eligibility | action | basics | [S35]. |
| mod.dis.evac | Plan an evacuation helper. Register with any city/county access & functional needs registry if offered. | action | basics | **(unverified; varies by county)** |

### 5.5 Power-dependent medical equipment & refrigerated meds

| id | change | container | tier | detail |
|---|---|---|---|---|
| mod.pwr.medbaseline | Enroll in PG&E Medical Baseline (or self-certify Vulnerable Customer Status) | action | basics | [S33]. |
| mod.pwr.ddar | Apply for DDAR backup battery program | action | basics | [S35]. |
| mod.pwr.station | Battery power station sized to run the device for **72+ hours** **(app suggestion)** | stay-bin | basics for this group | CPAP/oxygen concentrator users. Ready.gov: ask your doctor how to power equipment during outages [S56]. ReadySF: plan battery or generator alternatives [S1]. |
| mod.pwr.oxygen | Backup oxygen supply (tanks), if on oxygen | stay-bin | basics | Ready.gov [S56]. |
| mod.pwr.cpap.dc | DC (car) power cord for CPAP or other devices | car | advanced | Lets you run the device from a car. **(unverified; check manufacturer)** |
| mod.pwr.cooler | Insulated cooler + chemical/gel ice packs for meds | both | basics | Ready.gov disability [S56]. |
| mod.pwr.insulin | Insulin: vials/cartridges OK up to **28 days at 59 to 86°F**. Don't freeze it. Keep out of sun. Insulin in pump tubing: discard after 48 h. | both | basics | FDA [S39]. Check each product's label. |
| mod.pwr.supplies | 2 weeks of testing strips, pump supplies, needles | both | basics | CDC [S57][S67]. |
| mod.pwr.provider | Ask your power provider about priority restoration. Tell your durable equipment supplier your backup plan. | action | basics | Ready.gov [S56]. |
| mod.pwr.crc | Know PG&E Community Resource Centers offer medical-equipment charging | action | basics | [S36]. |

### 5.6 Prescription medications (any user on daily meds)

| id | change | container | tier | detail |
|---|---|---|---|---|
| mod.rx.week | 7 days of each med in go bag | go-bag | basics | CDC [S59]. |
| mod.rx.twoweeks | 14+ days at home | stay-bin | advanced | CDC [S57][S67]. |
| mod.rx.list | Med list + prescriber + pharmacy | go-bag | basics | [S56]. |
| mod.rx.refill | Ask about 90-day fills or mail order. Know that CA pharmacists can give emergency supplies in declared emergencies. | action | basics | [S60]. |
| mod.rx.rotate | Rotate the emergency stash into daily use so it never expires | maintenance | basics | **(app suggestion)** |

### 5.7 Pets

**Dogs and cats**

| id | change | container | tier | quantity | detail |
|---|---|---|---|---|---|
| mod.pet.food | Pet food in airtight, waterproof container | both | basics | 3 days go bag, 7 to 14 days stay bin **(app suggestion)** | Ready.gov says "several days" [S55]. LA County suggests 7 to 10 days (via search). |
| mod.pet.water | Water + collapsible bowl | both | basics | SFPUC: up to 1 gal/pet/day [S8]. A common rule of thumb is ~1 oz per lb of body weight per day **(unverified)**. | |
| mod.pet.meds | Pet medications + vet records + vaccination records | go-bag | basics | | Ready.gov [S55]. Shelters often require proof of rabies vaccination **(unverified)**. |
| mod.pet.restraint | Collar with ID + rabies tag, leash/harness, backup leash and tag | go-bag | basics | 1 set per pet + backup | Ready.gov [S55]. |
| mod.pet.carrier | Sturdy carrier/crate (one per pet) | go-bag | basics | 1 per pet | Big enough to stand, turn, lie down [S55]. |
| mod.pet.sanitation | Litter + litter pan (cats), poop bags, paper towels, bleach | both | basics | | Ready.gov [S55]. |
| mod.pet.photo | Photo of you with your pet | go-bag | basics | | Proves ownership [S55]. |
| mod.pet.comfort | Familiar toy/blanket/treats | go-bag | basics | | [S55]. |
| mod.pet.firstaid | Pet first aid kit (ask your vet) | stay-bin | advanced | | [S55]. |

**Pet actions:** microchip with current info (basics) [S55]. Find pet-friendly evacuation options, since many shelters and hotels don't accept pets (basics) [S55]. Buddy system with a neighbor to grab pets if you're at work (basics) [S55]. Practice carrier training (advanced) [S55]. Bring pets inside at the first sign of disaster (basics) [S55].

**Other pets (birds, reptiles, small mammals, fish):** carrier/travel cage, species-specific food, heat source plan for reptiles (battery hand warmers or heat packs), battery aerator for fish, bedding. **(unverified; Ready.gov pets page doesn't break these out. Recommend a generic "species-specific food, housing and heat/air" item with a note to ask your vet.)**

**Large animals / livestock:** out of scope for an urban-focused app. Link to county animal services **(app suggestion)**.

### 5.8 No car / transit-dependent

- Go bag must be **carryable on foot**: keep water to about 2 L and add purification. Wheeled bag OK [S2].
- Drop `car` container items. Move car-kit items (paper map, N95s, extra water) into go bag or stay bin.
- **Action (basics):** plan walking routes to 2 destinations (friend's house and a shelter or high ground). Know which transit stops are on evacuation routes. **Register as needing transport** if your county offers it **(unverified; varies)**.
- **Action (basics):** arrange a ride buddy with a neighbor who has a car.
- Leave earlier: transit-dependent people should evacuate at the first warning, not the order **(app suggestion; consistent with CAL FIRE "don't wait")** [S24].
- BART may stop transbay service after quakes or tsunami warnings (it stopped the Transbay Tube during the Dec 2024 warning) [S50].

### 5.9 Apartment / high-rise vs. house

| situation | change |
|---|---|
| **Apartment (any)** | Space is limited: water as stackable cases under beds or in closets [S1]. Two-bucket toilet is especially valuable because sewer lines in multi-unit buildings can back up **(unverified)**. Know the building's gas and water shutoffs (ask the landlord) [S3]. Ask about soft-story retrofit status (advanced). |
| **High-rise (4+ floors)** | Elevators are out after quakes and in outages, so **keep go bag by the door** and plan a stair descent. Store water and supplies so you don't need to haul them upstairs after a disaster **(app suggestion)**. In very tall buildings, climbing stairs can take up to 2 hours (SF fire marshal, via news) **(unverified)**. Learn the building's emergency plan and assembly point. People with mobility needs: plan evacuation help in advance [S56]. |
| **House** | Strap water heater (legal requirement) [S19]. Check the foundation for retrofit (Brace + Bolt) [S20]. Gas meter wrench. More room for 2-week water storage, tent, generator (outdoors). Defensible space if in WUI. |

### 5.10 Renters

- Water heater strapping is the **landlord's legal duty**. Ask, and report if missing [S19].
- Ask the landlord: where are the gas and water shutoffs? Is the building soft-story/retrofitted? [S3]
- **Renters insurance + CEA earthquake renters policy** (covers belongings and "loss of use" for temporary housing). Some CEA policies are as low as $35/yr [S21]. **Landlord's insurance does not cover your belongings** [S21].
- Use renter-friendly anchors (straps with small screw holes, museum putty).
- Keep a copy of the lease in documents [S1].

### 5.11 Limited budget (cheap substitutes)

| instead of | use | source / note |
|---|---|---|
| Bought water storage tanks | Clean food-grade containers refilled from the tap. Rotate every 6 months. No treatment needed when filled from a municipal tap. | SFPUC [S8]. Avoid milk jugs **(unverified)**. |
| HEPA air purifier | Box fan (2012+) + MERV 13 filter + cardboard shroud | EPA [S29]. |
| Portable power station | Extra phone power bank + car charger | |
| Camping toilet | Bucket + heavy trash bags | ReadySF [S1]. |
| Commercial "72-hour kit" | Assemble from what you own. Most items are household items. | ReadySF: "Most of what you'll need... are everyday household items you already have" [S4]. |
| Emergency food bars | Pantry staples you already eat (canned beans, peanut butter, crackers) | ReadySF [S1]. |
| Hard hat | Bike helmet | **(app suggestion)** |
| Purchase everything now | "Gather supplies a little at a time" | ReadySF [S1]. |
| Free stuff | City sandbags [S47]. PG&E CRCs [S36]. DDAR batteries (eligible people) [S35]. Brace + Bolt grants [S20]. LIHEAP cooling help [S41]. Free county alerts. | |

### 5.12 Long commute / office worker (car or work kit)

Ready.gov: keep kits at home, work and in the car, and **be ready to shelter at work for at least 24 hours** [S9]. Large quakes can strand commuters on the far side of the Bay (bridges, BART Transbay Tube closures [S50]).

| id | item | container | tier | detail |
|---|---|---|---|---|
| mod.com.shoes | Walking shoes + socks | work / car | basics | You may need to walk miles home. |
| mod.com.water | Water: 1 to 2 L at desk, 1+ gal in car | work / car | basics | [S61]. |
| mod.com.food | High-calorie snacks, 24 to 72 h | work / car | basics | Ready.gov 24 h at work [S9]. |
| mod.com.meds | 1 to 3 days of meds | work / car | basics | |
| mod.com.light | Headlamp | work / car | basics | |
| mod.com.charger | Power bank + cable | work / car | basics | |
| mod.com.n95 | N95s | work / car | basics | |
| mod.com.layers | Warm layer, rain shell | work / car | basics | |
| mod.com.map | Paper map of walking route home | work | basics | |
| mod.com.cash | Small cash | work / car | basics | |
| mod.com.firstaid | Small first aid kit | work / car | basics | |
| mod.com.car | Car kit: jumper cables, flares/reflective triangle, blanket, car charger, map | car | basics | Ready.gov car [S61]. Skip ice scraper and kitty litter for the Bay Area lowlands. |
| mod.com.plan | Plan who picks up kids if you're stuck across the Bay | action | basics | |

### 5.13 Wildland-urban interface (WUI) residents

- Turn on the wildfire evacuation module by default, and promote `wf.*` advanced items to basics.
- Go bag **in the car** during Red Flag Warnings. Half tank of gas minimum [S25].
- Defensible space and ember-resistant zone (see `wf.act.defensible`).
- PSPS is more likely, so power module defaults on, medical device users enroll in Medical Baseline [S33].
- Know your Genasys Protect zone and ≥2 routes out [S26][S23].
- Smoke module on (both for own fires and distant ones).

### 5.14 Tsunami-zone residents (coastal or bayshore)

- Turn on tsunami module. The go bag is staged **by the door** and is walkable [S2].
- Know whether **work or school** is in a zone too (SF downtown/Market St, North Beach, Richmond port, Alameda shoreline, Half Moon Bay, Pacifica, Stinson/Bolinas) [S48].
- Natural warnings mean leave immediately, on foot [S49].
- Car evacuation can jam. Plan to walk to high ground [S49].

---

## 6. "Start this weekend" minimal set (about 1 to 2 hours, mostly free or cheap)

Order matters. Highest value per minute first.

1. **Sign up for your county alerts** (text your ZIP to 888-777 for Nixle/AlertSF in many counties) and check that phone emergency alerts are on [S1][S62]. Free.
2. **Look up your evacuation zone** (Genasys Protect) and **tsunami zone** (if coastal) [S26][S48]. Free.
3. **Buy water**: at least 1 case of bottled water per person plus 1 gal/person jugs, a start toward 7 gal/person [S1].
4. **Shoes + flashlight by every bed** [S13].
5. **Grab-and-go basics in one backpack**: phone battery + cable, copies of IDs and insurance cards in a zip bag, $100 in small bills, 3 days of snacks, N95s, spare meds, a whistle [S2].
6. **Heavy trash bags + a bucket** (instant emergency toilet) [S1].
7. **Write a contact card** (out-of-area contact + meeting place) and put one in every bag [S3].
8. **Find your gas shutoff** and put a wrench there. Learn "only if you smell gas" [S3].
9. **Strap the tallest bookcase and the TV** [S3].
10. **Put "check kit" reminders** in your calendar for 6 and 12 months (see §7).

---

## 7. Budget tiers (rough cost)

**No authoritative source gives a dollar total for a kit.** These are **my rough 2026 retail estimates (unverified)**, for the app to show as ranges. Validate against real prices before displaying.

| tier | scope | est. cost | notes |
|---|---|---|---|
| **Starter / $0 to $50** | Alerts, plan, zone lookups, shoes and flashlight by bed, bucket + bags, a case of water, copied documents | $0 to $50 | ReadySF: most items are things you already own [S4]. |
| **Basic household (2 people)** | Core basics: 14 gal water, 7 days food, go bags, first aid, radio, headlamps, N95s, cash | ~$150 to $350 (+ cash) **(unverified)** | Spread over months: "gather supplies a little at a time" [S1]. |
| **Advanced household (2 people)** | 2 weeks water/food, power station, HEPA purifier, camp stove, tarps, bleed kit, extra filters | ~$600 to $1,500+ **(unverified)** | Power station and HEPA are most of the cost. |
| **Add-ons** | Generator ($500+), portable AC ($300+), Brace + Bolt retrofit (often offset by $3,000 grant [S20]), CEA renters policy (from ~$35/yr [S21]) | varies | |

---

## 8. Bay Area alert systems (for the "sign up for alerts" action)

| county | system | how to sign up (verify before shipping) |
|---|---|---|
| San Francisco | **AlertSF** | Text ZIP to 888-777 or alertsf.org [S1][S3] |
| Alameda | **AC Alert** | acalert.org / Everbridge app [S62] **(verify domain)** |
| Contra Costa | **Community Warning System (CWS)** (+ sirens near industry) | cwsalerts.com [S62] |
| San Mateo | **SMC Alert** | smcalert.info **(unverified domain)** [S62] |
| Santa Clara | **AlertSCC** | alertscc.org **(unverified domain)** [S62] |
| Marin | **Alert Marin** | alertmarin.org **(unverified domain)** [S62] |
| Sonoma | **SoCoAlert** | socoemergency.org **(unverified domain)** [S62] |
| Napa | **Napa County alerts** (ReadyNapaCounty) | readynapacounty.org [S62] **(system name unverified)** |
| Solano | **Alert Solano** | Everbridge registration via county site [S62] |
| All | **Nixle** (many local agencies) | Text ZIP to 888777 [S62] |
| All | **Genasys Protect** zone info (not an alert system) | protect.genasys.com [S26] |
| All | **MyShake** earthquake early warning | App stores [S68] |
| All | **PG&E PSPS alerts** | pge.com, update contact info and Address Alerts [S33] |

Sign-up URLs for several counties came from secondary sources dated 2019 to 2023. **Re-verify each link before shipping.**

---

## 9. Maintenance / rotation schedule

| when | what | source |
|---|---|---|
| **Every 6 months** (suggest pegging to DST changes in March and November **(app suggestion)**) | Replace self-stored tap water. Check bottled water dates. Check food dates. Kids' clothes and shoe sizes. Car water. | Water every 6 months: ReadySF, EBMUD, SFPUC [S1][S6][S8]. Food: Red Cross 6-month check (via search) [S11]. |
| **Every year** (ReadySF suggests your birthday for the go bag) | Full kit refresh. Meds and their dates. Batteries. Documents and contact list. Cash. N95 expiry dates. Bleach. First aid kit restock. Re-check alert sign-ups and PG&E contact info. | ReadySF Stay Box and Go Bag: refresh once a year [S1][S2]. ECA: replace perishables yearly [S13]. Ready.gov: reassess every year [S9]. |
| **Monthly** | Test smoke/CO alarms. Check fire extinguisher gauge. Top up power banks/power station. | **(unverified, common guidance)** |
| **Before fire season** (May to June) | Buy N95s and MERV 13 filters. Clear defensible space and gutters. Review evacuation routes. | AirNow: buy before smoke arrives [S30]. |
| **Before rainy season** (Oct to Nov) | Clear drains and gutters. Get sandbags. Flood insurance (30-day wait). | [S45][S47]. |
| **Every 5 to 7 years** | Replace CO alarms | NFPA (via search) [S40-adjacent]. |
| **When household changes** | New baby, new pet, new meds, new medical device, moving | Ready.gov [S9]. |

---

## 10. Conflicts, surprises and caveats

1. **SF72.org is gone.** `sf72.org/supplies` now 301-redirects to **sf.gov/readysf**. SF's current branding is **ReadySF**, with a "Stay Box" (home) and "Go Bag" [S5][S1][S2]. The app should link to ReadySF, not SF72.
2. **Water per day conflicts.** Most agencies say **1 gal**. **EBMUD says 2 gal/person/day for 7 days minimum** [S6]. Older EBMUD material said 1 to 2 gal [S7]. Recommend: 1 gal as default with an EBMUD-area override or a "comfort (2 gal)" option.
3. **Water days conflict** from **3 to 5 (SFPUC)** to **7 (ReadySF, EBMUD, Cal OES "preferable")** to **14 (CDC, Red Cross, ECA)** [S8][S1][S6][S12][S10][S11][S13]. HayWired's 6-week East Bay average outage [S14] says even 14 days is a floor, not a ceiling. Recommend 7 as basics, 14 as advanced, and copy that says distribution points will appear [S7] but may take time.
4. **Water heater as a drinking source conflicts.** SFPUC says water heater water can be treated and used for drinking [S8]. **EBMUD says don't drink it** (it may contain metals) and use it only for things like flushing [S6]. Recommend: "non-drinking use, or drink only after treatment as a last resort, and follow your water utility's guidance."
5. **Boiling time conflicts.** EBMUD: rolling boil 1 minute (3 min above 5,000 ft) [S6]. SFPUC: 3 to 5 minutes [S8]. Recommend: "at least 1 minute at a rolling boil," and cite EBMUD/CDC.
6. **Bleach dose:** SFPUC gives 8 drops of 5.25% bleach per gallon [S8]. EBMUD gives 8 drops of 6% or 6 drops of 8.25% [S6]. Modern store bleach is usually 6% or 8.25%, so use EBMUD's figures.
7. **Go bag water is unrealistic as written.** CAL FIRE's 3 gal/person [S23] is about 25 lb. ReadySF's go bag lists purification tablets instead [S2]. The app should split water between the bag and the car.
8. **Earthquake probability:** the "72% / 33%" figures are UCERF3 (2014). A Sept 2026 news report cites a new USGS study (74% / 34.3%) [S18], but **I couldn't find the USGS primary release**. Use "about 3 in 4" until verified.
9. **No official cash amount** from any agency. The figure is an app suggestion.
10. **CAL FIRE's readyforwildfire.org returns 403** to automated fetches. CAL FIRE content here came from search-indexed text of their PDF and from reprints of their "Go" brochure by other agencies [S23][S24]. Have a human verify the CAL FIRE checklist wording.
11. **Red Cross (redcross.org) also returned 403.** The "3-day evacuation / 2-week home" figure is consistent across Red Cross factsheet reprints and a legacy CDC checklist [S11][S10].
12. **N95s and kids:** N95s aren't sized for small children (EPA) [S31]. Push clean-room/HEPA for families with young kids rather than masks.
13. **Pandemic** is not a separate hazard (see §2). **Hazmat** is a small module weighted to Contra Costa and Solano.
14. **Tsunami:** a local Hayward/San Andreas quake is unlikely to generate a damaging tsunami [S50]. The main threat is distant (Alaska/Aleutians, about 5 h) [S48], plus local offshore quakes north of Cape Mendocino. Warnings can be broad and over-inclusive [S50]. Copy should say "know your zone" rather than "all coastal residents evacuate."
15. **Statistics with soft sourcing** (fine for context, not for prominent claims): Tubbs and Oakland Hills fire numbers (Wikipedia/news) [S27]. Chevron 2012 "15,000" (KQED settlement report vs. county 9,000+) [S53]. SF metro "47% AC" (2020 Census figure via SF Public Press) [S44].

### Items/claims marked unverified (summary)
- Cash amounts. N95 quantities. Power-station runtime target. Pet "1 oz/lb/day" rule. Two-bucket toilet (not Bay Area official). Natural-fiber clothing and goggles for wildfire. Garage door manual release and hose wording (CAL FIRE). Defensible-space / Zone 0 status. Landslide warning-sign list. Soft-story program details. Budget cost estimates. Several county alert URLs. 2026 USGS probability update primary source. 2026 Brace + Bolt window.

---

## 11. Sources

**San Francisco (ReadySF / SFPUC)**
- [S1] ReadySF Stay Box checklist (PDF): https://media.api.sf.gov/documents/ReadySF_-_Stay_Box_checklist_-_English.pdf
- [S2] ReadySF Go Bag checklist (PDF): https://media.api.sf.gov/documents/ReadySF_-_Go_Bag_checklist_-_English.pdf
- [S3] ReadySF Earthquake Safety Guide (PDF): https://media.api.sf.gov/documents/ReadySF_-_Earthquake_safety_guide.pdf
- [S4] sf.gov, Get ready / Gather supplies: https://www.sf.gov/how-to-get-ready-for-emergencies-in-san-francisco and https://www.sf.gov/gather-supplies-pack-what-youll-need-for-an-emergency-in-san-francisco
- [S5] SF72 redirect target (ReadySF): https://www.sf.gov/readysf (from https://www.sf72.org/supplies, HTTP 301)
- [S8] SFPUC, Storing and Treating Water: https://www.sfpuc.gov/learning/emergency-preparedness/storing-and-treating-water

**Water utilities / earthquake science**
- [S6] EBMUD, Emergency water storage: https://www.ebmud.com/waterstorage
- [S7] EBMUD, Building resilience in earthquake country (2024): https://www.ebmud.com/customers/pipeline/2024/09/building-resilience-earthquake-country
- [S14] SPUR, The HayWired Earthquake Scenario (2018): https://www.spur.org/news/2018-04-23/haywired-earthquake-scenario-how-we-can-outsmart-disaster
- [S15] USGS HayWired fact sheet 2018-3016: https://pubs.usgs.gov/fs/2018/3016/fs20183016_.pdf (retrieved but text not machine-readable; context only)
- [S16] HayWired Water Planning & Preparedness Discussion Guide: https://www.earthquakecountry.org/library/Water-HWFT-Docs-PlanningPreparedness.pdf (figures via search summary; PDF not machine-readable)
- [S17] USGS FAQ, earthquake probability SF Bay Area: https://www.usgs.gov/faqs/what-probability-earthquake-will-occur-los-angeles-area-san-francisco-bay-area
- [S18] ABC7, "Odds of major earthquake striking Bay Area in next 30 years increasing" (Sept 3, 2026): https://abc7news.com/post/odds-major-earthquake-striking-san-francisco-bay-area-30-years-increasing-usgs-experts-say/19782727/
- [S13] Earthquake Country Alliance, Step 3: Organize disaster supplies: https://www.earthquakecountry.org/step3/
- [S19] Cal. Health & Safety Code §19211 (water heater strapping): https://california.public.law/codes/health_and_safety_code_section_19211
- [S20] CA Dept. of Insurance, Earthquake Brace + Bolt 2025: https://www.insurance.ca.gov/0400-news/0102-alerts/2025/Earthquake-Brace-Bolt-Grant-Program-Op.cfm
- [S21] California Earthquake Authority, Renters coverages & deductibles: https://www.earthquakeauthority.com/California-Earthquake-Insurance-Policies/Renters/Coverages-and-Deductibles
- [S22] PG&E earthquake gas-shutoff guidance (CPUC-posted PG&E documents): https://files.cpuc.ca.gov/PG&E20150130ResponseToA1312012Ruling/2014/08/SB_GT&S_0672221.pdf; also [S3]
- [S68] Cal OES, Have a Go Bag Ready / MyShake coverage: https://www.news.caloes.ca.gov/have-a-go-bag-ready-when-disaster-strikes
- [S69] Ready.gov Earthquakes: https://www.ready.gov/earthquakes

**Federal / national**
- [S9] Ready.gov Build a Kit: https://www.ready.gov/kit
- [S10] CDC, How to Create an Emergency Water Supply: https://www.cdc.gov/water-emergency/about/how-to-create-and-store-an-emergency-water-supply.html
- [S11] American Red Cross, Survival kit supplies: https://www.redcross.org/get-help/how-to-prepare-for-emergencies/survival-kit-supplies.html (403 to automated fetch; figures via reprints, e.g. https://www.redcross.org/content/dam/redcross/National/BE%20RED%20CROSS%20READY.pdf)
- [S37] Ready.gov Power Outages: https://www.ready.gov/power-outages
- [S38] FoodSafety.gov, Three ways to keep food safe when you lose power: https://www.foodsafety.gov/blog/three-ways-keep-food-safe-when-you-lose-power
- [S39] FDA, Insulin storage and switching in an emergency: https://www.fda.gov/drugs/emergencypreparedness/ucm085213.htm
- [S40] CDC, Use a generator safely / avoid CO poisoning: https://www.cdc.gov/natural-disasters/psa-toolkit/use-a-generator-safely.html
- [S41] Ready.gov Extreme Heat: https://www.ready.gov/heat
- [S42] CDC, Heat and people without air conditioning: https://www.cdc.gov/heat-health/risk-factors/heat-and-low-income.html
- [S45] Ready.gov Floods: https://www.ready.gov/floods
- [S49] Ready.gov Tsunamis: https://www.ready.gov/tsunamis
- [S51] Ready.gov Chemical Emergencies: https://www.ready.gov/chemical
- [S54] Ready.gov Pandemic: https://www.ready.gov/pandemic
- [S55] Ready.gov Pets: https://www.ready.gov/pets
- [S56] Ready.gov Disability: https://www.ready.gov/disability
- [S64] Ready.gov Older Adults: https://www.ready.gov/older-adults
- [S57] CDC, Emergency kit checklist, pregnant women, infants, children: https://www.cdc.gov/children-and-school-preparedness/resources/emergency-kit-checklist-pregnant-women-infants-and-children.html
- [S58] CDC, Prepare and store powdered infant formula in an emergency: https://www.cdc.gov/infant-feeding-emergencies-toolkit/php/powdered-infant-formula.html
- [S59] CDC, Building an emergency kit (people with disabilities): https://www.cdc.gov/disability-emergency-preparedness/people-with-disabilities/build-a-kit.html
- [S67] CDC, Emergency medical kit, children with special healthcare needs: https://www.cdc.gov/children-and-school-preparedness/special-healthcare-needs/emergency-medical-kit.html
- [S61] Ready.gov Car safety / kit: https://www.ready.gov/car

**Wildfire and smoke**
- [S23] CAL FIRE Go Bag Checklist (PDF; 403 to automated fetch, contents via search index): https://readyforwildfire.org/wp-content/uploads/2025/09/CALFIRE_Go-Bag-Checklist.pdf
- [S24] CAL FIRE "Go!" brochure (reprint, Mono County): https://www.monocounty.ca.gov/sites/default/files/fileattachments/board_of_supervisors/page/29199/calfire_go_brochure_linoweb.pdf; Six P's via City of Goleta: https://www.cityofgoleta.org/your-city/neighborhood-services/emergency-preparedness/fire-preparedness-resources/pre-evacuation
- [S25] Piedmont Exedra, CAL FIRE 2025 go-bag campaign: https://piedmontexedra.com/2025/09/new-cal-fire-campaign-urges-californians-to-prepare-go-bags-make-evacuation-plan
- [S26] San Mateo County, Genasys/Zonehaven: https://www.smcgov.org/node/388760/genasys-zonehaven; Genasys county contracts: https://genasys.com/press-releases/genasys-inc-announces-zonehaven-evacuation-software-services-contracts-with-13-california-counties-2/
- [S27] Wildfire history (secondary): https://en.wikipedia.org/wiki/Oakland_firestorm_of_1991, https://en.wikipedia.org/wiki/Tubbs_Fire, CAL FIRE LNU incident: https://www.fire.ca.gov/incidents/2020/8/17/lnu-lightning-complex
- [S28] CDC/NIOSH, Wildfire smoke and respirators: https://www.cdc.gov/niosh/bulletin/2025/wildfire-smoke.html
- [S29] EPA, Research on DIY air cleaners for wildfire smoke: https://www.epa.gov/air-research/research-diy-air-cleaners-reduce-wildfire-smoke-indoors
- [S30] AirNow, Be Smoke Ready: https://www.airnow.gov/wildfires/be-smoke-ready/
- [S31] EPA Protect Your Lungs factsheet: https://www.epa.gov/system/files/documents/2026-06/protect-your-lungs-factsheet.pdf; UCSF Western States PEHSU mask guidance for pregnancy/young children: https://wspehsu.ucsf.edu/wp-content/uploads/2025/02/mask-or-respirator-use-during-pregnancy-and-early-child-years-in-wildfire-smoke-events_2_5_25.pdf
- [S32] KQED, Camp Fire caused nearly two straight weeks of the Bay Area's worst air quality: https://www.kqed.org/news/11712211/the-camp-fire-caused-nearly-two-straight-weeks-of-the-bay-areas-worst-air-quality-on-record; BAAQMD staff tips (ABC7): https://abc7news.com/air-quality-in-bay-area-best-purifiers-for-home-wildfire-smoke-how-long-will-last/6416714/

**Power / PSPS**
- [S33] PG&E Public Safety Power Shutoffs: https://www.pge.com/en/outages-and-safety/safety/community-wildfire-safety-program/public-safety-power-shutoffs.html
- [S34] PG&E PSPS report letter, Oct 2019 events: https://www.pge.com/assets/pge/docs/outages-and-safety/safety/PSPS-Report-Letter-10.26.19-amend.pdf
- [S35] PG&E DDAR program: https://www.pge.com/ddar (fact sheet: https://pge.com/assets/pge/docs/outages-and-safety/outage-preparedness-and-support/ddar-fact-sheet.pdf)
- [S36] City of Petaluma PSPS FAQ: https://cityofpetaluma.org/power-shutoff-faqs; CA LAO PSPS background: https://www.lao.ca.gov/handouts/resources/2019/Background-on-Public-Safety-PowerShutoffs-111819.pdf

**Heat**
- [S43] ABC7, 2022 Bay Area heat records: https://abc7news.com/post/record-heat-bay-area-wave-hottest-temperatures-breaking/12204813/
- [S44] SF Public Press, Cool SF could get walloped by next heat wave: https://www.sfpublicpress.org/cool-sf-could-get-walloped-by-next-heat-wave-but-city-says-its-ready/

**Storms / flood**
- [S46] NWS Bay Area, Atmospheric Rivers Dec 2022 to Jan 2023: https://www.weather.gov/mtr/AtmosphericRivers_12_2022-01_2023
- [S47] San Mateo County DEM, Winter weather preparedness: https://www.smcgov.org/dem/winter-weather-preparedness; KTVU sandbag guidance: https://ktvu.com/news/sandbags-in-short-supply-as-bay-area-prepares-for-next-round-of-storms-and-flooding

**Tsunami**
- [S48] California Geological Survey tsunami map releases: https://www.conservation.ca.gov/index/Pages/News/CGS-Issues-New-Tsunami-Hazard-Maps-for-San-Francisco-Contra-Costa-Santa-Clara-Counties.aspx, https://www.conservation.ca.gov/index/Pages/News/New-Tsunami-Hazard-Maps-Alameda-Monterey-San-Mateo.aspx, https://conservation.ca.gov/index/Pages/News/California-Completes-Coastal-Mapping-Tsunami-Risk-Addition-Seven-Counties-.aspx
- [S50] Temblor, Anatomy of a tsunami warning (Dec 2024): https://temblor.net/earthquake-insights/anatomy-of-a-tsunami-warning-16684/

**Hazmat**
- [S52] Contra Costa County, Shelter in Place for Crockett and Rodeo (2019 release): https://www.contracosta.ca.gov/DocumentCenter/View/61454/Shelter-in-Place-for-Crockett-and-Rodeo-due-to-Refinery-Fire-News-Release-101519
- [S53] BAAQMD, Chevron refinery fire: https://www.baaqmd.gov/about-air-quality/incidents-and-advisories/chevron-refinery-fire; KQED settlement report: https://www.kqed.org/news/11665999/chevron-richmond-move-to-settle-lawsuit-over-2012-refinery-fire-that-sickened-thousands; CBS (9,000+): https://cbsnews.com/sanfrancisco/news/more-than-9000-sought-treatment-after-richmond-chevron-refinery-fire

**Alerts, pharmacy, misc.**
- [S12] Cal OES earthquake tip sheet (reproduced by San Benito County): https://sanbenitocountyca.gov/home/showpublisheddocument/14/637193578801070000
- [S60] California State Board of Pharmacy, emergency dispensing: https://www.pharmacy.ca.gov/about/news_release/emergency.pdf
- [S62] KTVU, How to sign up for emergency alerts in Northern California counties: https://ktvu.com/news/how-to-sign-up-for-emergency-alerts-in-12-northern-california-counties; ABC7: https://abc7news.com/camp-fire-bay-area-emergency-alerts-nixle-disaster-alert/2624916/; 211 Bay Area: https://211bayarea.org/disaster-information/disaster-information-san-francisco-county/
- [S66] Oregon State University Extension, Survival Basics: Sanitation and Waste Management (two-bucket toilet): https://extension.oregonstate.edu/catalog/pub/em9334-s
