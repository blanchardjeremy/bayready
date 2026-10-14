# Bay Ready: access, functional needs, and equity review

Reviewer lens: disaster access and functional needs (AFN) and equity. Based on the source in `/Users/jeremy/dev/bay-emergency-prep`, the three sample lists, the PDF renders, and outside research (cited inline). Reviewed October 2026.

---

## 1. Verdict

This is better than most kit tools I've reviewed. It's warm, it reads at about a 5th-grade level (I measured roughly 11 words per sentence and a Flesch-Kincaid grade of 4.5 across the item text), and the web UI is more accessible than many government sites. But it's built around a household that is already fairly well off and able-bodied: someone with a home, some storage, a few hundred dollars, a car or legs that work, English, and a printer. Once you leave that profile, the list stays confident while the advice gets thin, and sometimes it's unsafe. The weakest spot is also where the stakes are highest. For someone on home oxygen or using a power chair, the app gives one line item with a battery price and runtime that can't physically work, and no plan for getting out. In Persona C (an older Santa Cruz couple with oxygen, insulin, and a mobility aid), the tsunami advice is to walk a mile inland. My recommendation: fix the critical items before promoting this to AFN audiences, then test it with an Independent Living Center and a multilingual community-based organization (CBO) before calling it "for the Bay Area."

---

## 2. What works

- **Tone and reading level.** Short sentences, plain words, and nothing fear-based. The "Start here this weekend" box of six free steps is the right way to lower the barrier for people who feel they can't prepare.
- **Neighbors over gear.** "Swap numbers with a neighbor," "Line up a few people who'd check on you" (with "Don't count on just one person, or only on paid help"), the OK/HELP window sign ("Put up HELP even if you can't get to the door"), and "Offer a neighbor a ride out" (`items.ts` ~line 627). Social connection is what actually saves people, and the app knows that.
- **Some AFN instincts are already right.** Drop, Cover, Hold On includes wheelchair users. "Written medical info" is one sheet per person, kept private to each bag. Earplugs are framed as being for sensory overload. The comfort item suggests "a fidget, a favorite scent". Heat-risk medicines are named in the cooling item. The breastfeeding guidance is good, and ready-to-feed formula is listed.
- **Renter awareness.** The water heater item says strapping is the landlord's job. PG&E address alerts are flagged as not needing an account. The California Earthquake Authority (CEA) renters policy is mentioned. The home step doesn't care whether you rent or own.
- **Mostly good web accessibility.** Native inputs inside fieldsets. Focus moves to the step `<h1>` on each step change (`Wizard.tsx` line 66). `prefers-reduced-motion` is respected. Buttons are at least 44px (`min-h-11`). The Atkinson Hyperlegible font is a great choice for low vision. Text contrast is strong: ink-soft is 7.1:1 on white and 6.1:1 on the fog background, and the white-on-orange button is 5.7:1.
- **Privacy by design.** Everything stays on the device, and share links live in the URL fragment, which the browser never sends to a server. The needs step offers "Prefer not to say".

---

## 3. Top problems (ranked)

### 1. CRITICAL: Power-dependent users get advice that can't work
- **What's wrong:** The `device-power` item (`items.ts` ~line 1158) treats every powered device the same way: "Backup battery for your medical device, $100–400… Aim for at least 72 hours of runtime." The `power-station` item says $250–700 "can run a CPAP… for hours."
- **Evidence:** Home oxygen concentrators draw about 250–600 W ([The Senior List](https://www.theseniorlist.com/portable-oxygen-concentrator/home/); check the device manual). Running one for 72 hours takes roughly 18–43 kWh. A $250–700 power station holds about 0.3–1 kWh, which is 1–4 hours on a concentrator. The only oxygen-specific advice is the tip "keep backup tanks."
- **More gaps:** Nothing for the device goes in the go bag. If Persona C evacuates, the CPAP, the concentrator, the power-chair charger, and their power sources aren't on the go-bag list at all. The DDAR "free battery" item sits in the same "month" stage as the $100–400 purchase, so people may pay before they check eligibility. Oxygen plus the camp stove, lighter, and candle warnings appear on the same list with no fire-safety note.
- **Why it matters:** For these users, a long outage is a matter of survival, not comfort.
- **Fix:**
  - Add a follow-up question: CPAP/BiPAP, oxygen concentrator, ventilator/suction/feeding pump, home dialysis, power chair/scooter, or other.
  - Show runtime math by device type, for example "CPAP without the humidifier, about 30–60 W."
  - For oxygen: "a battery won't get you through 72 hours. Ask your supplier for backup cylinders, and know where you'd go to plug in (hospital, PG&E Community Resource Center, a friend outside the outage)."
  - Add the device, charger, DC cord, and extension cord to the go bag. Put "check DDAR first" before "buy a battery." Add an oxygen fire-safety line.

### 2. CRITICAL: Evacuation assumes you can walk out or drive
- **What's wrong:** The tsunami item says "100 feet above sea level or a mile inland, on foot." Persona C, who has a mobility aid, gets that plus "Walking shoes… you might have to walk home" and "Keep a small kit at work or school." The go bag says "You should be able to carry it comfortably," and the default container is a backpack. "Mobility" adds only "Spare parts for mobility aids," which lands in the *stay-at-home* bin. The no-car plan (`routes`, line 520) only appears for wildfire, tsunami, or flood, so a car-free SF renter with mobility needs and quake/outage hazards gets no transport planning at all. The only "can't do stairs" advice is a tip under the high-rise item.
- **Evidence:** In the 2017 North Bay fires and the 2018 Camp Fire, about three-quarters of those who died were over 65 ([KRCB](https://krcb.org/2020091850791/north-bay-report/millions-of-older-californians-live-where-wildfire-threatens-mostly-they-re-on-their-own); [California Healthline](https://californiahealthline.org/Mjk5MjY5)). Ready.gov tells people to "arrange neighbors who can help you evacuate" and "plan accessible transportation" ([ready.gov/disability](https://www.ready.gov/disability)). The research doc already planned "keep go bag light / near exit" and a wheeled bag (`research/ux.md`, `research/supplies.md` §5.3–5.8). They weren't built.
- **Fix:** When mobility or no-car is selected, add:
  - A free basics task: "Name who helps you get out, and how. Practice once."
  - "Leave at the Evacuation *Warning*, not the Order."
  - For tsunami: a "can't walk a mile" branch covering vertical evacuation, leaving at the first natural warning, and a pre-arranged driver.
  - A go-bag rule: a wheeled bag or a bag that hangs on the chair, and the mobility aid itself on the grab list.
  - Drop the commuter items for people who don't commute.

### 3. MAJOR: The needs question is too narrow, and "prefer not to say" turns everything off
- **What's wrong:** There are six options (`Wizard.tsx` lines 366–375). Missing:
  - Deaf/hard of hearing as a *communication* need. Hearing aids are lumped in with glasses.
  - Blind/low vision beyond glasses.
  - Speech or communication disability.
  - Dementia, intellectual, or developmental disability, and autism.
  - Mental health conditions.
  - Dialysis.
  - Needing a caregiver or attendant.
  - Service animals.
  - Pregnancy.
  - Substance-use treatment (methadone or buprenorphine).

  Needs are also household-wide, so every go bag gets "Extra prescription medicine… 7 days each (for 4 bags)" with "If you don't take any, tick your name." Picking "Prefer not to say" sets needs to an empty set (`answers.ts` line 82), which silently removes the support-network task, the medical info sheet, and all prescription items.
- **Evidence:** The federal AFN planning framework, CMIST (Communication, Maintaining health, Independence, Support and safety, Transportation), deliberately sorts people by function rather than diagnosis ([ASPR AFN guidance](https://aspr.hhs.gov/at-risk/Pages/afn_guidance.aspx)). Ready.gov has specific steps for deaf, blind, speech, cognitive, and service-animal users ([ready.gov/disability](https://www.ready.gov/disability)).
- **Fix:**
  - Rebuild the step around CMIST-style functions, written plainly: "trouble hearing alerts," "trouble seeing," "needs help understanding or remembering," "someone helps with daily care," and so on.
  - Let people assign a need to a person.
  - Make "Prefer not to say" add a *generic* optional health section ("If anyone takes medicine or uses equipment…") instead of nothing. People who decline to disclose often need it most.

### 4. MAJOR: The budget question changes nothing about what you're asked to buy
- **What's wrong:** `stageOf()` (`buildList.ts` line 67) only reorders items. The code says outright: "it never removes anything."
- **Evidence (from the sample lists):**

  | Persona | Budget picked | Still-to-get total |
  |---|---|---|
  | A (solo renter) | "Under $50" | $285–640 |
  | B (family) | "$50 to $150" | $745–1,850 |
  | C (older couple) | n/a | $1,520–4,130 |

  "Spare parts for mobility aids" is priced at $10–60 even though it includes "a charged spare battery for a power chair… or a manual backup chair," each of which usually costs hundreds. The Ohio State study of US households found renters, low-income households, households with children, and women-led households were less likely to be even minimally prepared ([OSU](https://news.osu.edu/when-disaster-strikes-these-americans-may-not-be-ready/)).
- **Fix:**
  - Build a real "$0 / under-$50 plan": what to gather from your own kitchen, a $5-per-grocery-trip schedule, and refill-and-rotate tap water instead of buying jugs.
  - Show "free" and "you pay" totals separately.
  - Add a "help paying" section: DDAR batteries; Medi-Cal and Medicare coverage of durable medical equipment (DME) and batteries (ask your plan); CalFresh for food (ask whether bottled water counts); food banks; free N95 handouts on smoke days; free sandbags; Brace + Bolt's income-eligible supplement; 211.
  - Make the "$100 or more" cash advice proportionate.

### 5. MAJOR: English only, and the PDF drops non-Latin text
- **What's wrong:** `<html lang="en">`, with no translations. Worse, the PDF's `clean()` function (`exportPdf.ts` line 37) deletes every character outside Windows-1252. I ran it:

  | Typed | Printed in the PDF |
  |---|---|
  | `Nguyễn Văn An` | `Nguyn Vn An` |
  | `Trần Thị` | `Trn Th` |
  | `陈美玲` | (empty) |

  So a Vietnamese or Chinese family's names, and any Know your home notes typed in those scripts, vanish from the paper copy that's meant for the day itself.
- **Evidence:** Listos California has materials in roughly 20 languages, including ASL ([Listos resources](https://listoscalifornia.org/resources)). Your own research suggests Spanish, Chinese, Filipino, and Vietnamese (`research/ux.md` line 235).
- **Fix:**
  - Now: embed a Noto font subset in jsPDF so names survive.
  - Next: a "Materials in your language" link block that goes to Listos and county pages.
  - Then: professional translation of the list text with community review. The item data is already structured for it.

### 6. MAJOR: Medical Baseline and DDAR are described in ways that will mislead people
- **Medical Baseline (MB):**
  - It's shown only for "power-device." MB also covers conditions such as MS or scleroderma with heating or cooling needs, life-threatening illness or a compromised immune system, paraplegia/quadriplegia, and asthma or sleep apnea. Its device list includes dialysis machines ([PG&E MB](https://www.pge.com/en/account/billing-and-assistance/financial-assistance/medical-baseline-program.html)).
  - It needs a signature from a licensed medical practitioner, so it isn't a "this weekend" free task (startRank 2).
  - The app also skips the most important behavior once enrolled: answer PG&E's pre-shutoff calls, or they escalate to a door knock (`research/supplies.md` line 311 notes this, but the app doesn't).
- **DDAR:**
  - Battery eligibility requires living in a High Fire-Threat District or having had 2+ PSPS events since 2020. CFILC decides who qualifies, and supplies are limited, with life-sustaining users first ([PG&E DDAR](https://www.pge.com/ddar); [SVILC](https://svilc.org/ddar-information-resources/)).
  - The app shows "See if you qualify for a free backup battery" to every power-device or mobility user in any county, including SF high-rises that rarely see PSPS.
- **Utilities:** Everything is hard-coded to PG&E. Customers of Alameda Municipal Power, Palo Alto Utilities, Silicon Valley Power, and Healdsburg have different programs.
- **Fix:**
  - Trigger MB from conditions as well as devices.
  - Rename the task "Ask your doctor to sign a Medical Baseline form," and add "answer the shutoff calls."
  - State the DDAR eligibility rule and link to the local Independent Living Center.
  - Add a "my utility isn't PG&E" branch.

### 7. MAJOR: Medication advice says what to do, not how
- **What's wrong:** The `rx` tip says "Ask your doctor or insurer about a 90-day or early refill." It's a good start, but it leaves out what actually gets people their pills.
- **Missing:**
  - Medicare Part D plans are expected to lift "refill-too-soon" limits and allow the maximum day supply in declared disasters, and may do so ahead of one ([CMS](https://edit.cms.gov/About-CMS/Agency-Information/Emergency/Downloads/Reminder-Pharmacy-Provider-Federal-Disaster.pdf)).
  - California managed-care plans must keep medically necessary drugs available to people affected by a state of emergency ([DMHC APL 25-001](https://www.dmhc.ca.gov/Portals/0/Docs/OPL/APL25-001-SouthernCaliforniaFiresandEnrolleesContinuedAccesstoHealthCareServices.pdf)).
  - Pharmacies can request a "vacation override" any time.
  - Controlled medicines (Schedule II, methadone, buprenorphine) can't be stockpiled the usual way. People need to ask their clinic about its emergency dosing plan.
  - Insulin pump users need backup pens or syringes and long-acting insulin, pump and CGM supplies, and ice packs that don't touch the insulin.
- **Fix:** A short "How to actually get extra medicine" card with these four or five scripts, written as what to say to the pharmacist.

### 8. MAJOR: Privacy and safety gaps for people at risk
- **No way to erase data:** There's no "erase my data" control anywhere (I found no clear/reset function in `src/components` or `src/app`). On a shared family phone or a library computer, names, health needs, and the spare-key location stay in localStorage.
- **Share links say more than the dialog admits:** The links encode names and health needs (`share.ts` encodes `NEED_IDS`). The needs step says "This stays on your device." The share dialog says only that the link shows "this list and what's checked off." In practice the list reveals "insulin," "CPAP," and names.
- **Abuse risk:** For someone living with an abuser, the out-of-area contact, spare-key holder, and meeting spots are exactly what the abuser shouldn't see.
- **Fix:**
  - Add a "Clear everything on this device" button.
  - Say in the share dialog that the link "includes names and health-related items," and offer "share without names and health items."
  - Add a shared-device note.

### 9. MAJOR: Housing types leave out the most at-risk people
- **What's wrong:** The home step options are house, low apartment, high-rise, and "something else." There's nothing for SRO or room rentals with shared bathrooms (common for low-income older and disabled San Franciscans), living in a vehicle or RV, staying with others, board-and-care or senior housing, or no stable housing.
- **Why it matters:** For these people, a 41-gallon water target or a "large plastic bin" (Persona B) is irrelevant or impossible.
- **Fix:** Add those options, routed to a portable, go-bag-first, low-cost list:
  - ID kept dry and backed up with a trusted person
  - Cooling and warming centers
  - 211
  - The building or operator's plan (and for SROs, who checks on residents)
  - Space-saving water advice: cases under the bed, refilled bottles

### 10. MAJOR: Communication access during the event
- **What's wrong:** The battery radio is presented as the lifeline for news, which leaves out deaf users. Blind users get nothing.
- **Missing:**
  - Text-capable alerts, plus flashing or vibrating alerts.
  - Text-to-911, which works statewide but has weaker location accuracy than voice calls ([NBC Bay Area](https://www.nbcbayarea.com/news/local/text-to-911-geo-location-problem-investigation/3328367/)).
  - A lantern for lip-reading or signing in the dark.
  - Large-print or tactile labels.
  - Communication cards ([ready.gov/disability](https://www.ready.gov/disability)).
  - Notes that shelters must provide interpreters and that 211 has language lines.
- **Fix:** Add items gated on communication needs, and have the "When it happens" card say "Text 911 if you can't call."

### 11. MINOR: The outputs are hard for low vision, screen readers, and cognitive load
- **Untagged PDF:** The PDF has no `/StructTreeRoot`, `/MarkInfo`, or `/Lang`. Checkboxes are drawn shapes, so screen-reader users get an unstructured stream of text (see [WCAG PDF techniques](https://www.w3.org/WAI/WCAG22/Techniques/#pdf)).
- **Print uses the same PDF:** `printPdf()` prints that PDF, so there's no path to bigger type through browser zoom.
- **Small fixed type:** Body text is 10.5pt, with 7.5–8.5pt labels.
- **Length:** Persona B has 91 items, Persona C has 128, and the Persona B PDF runs 11 pages. That's a real cognitive and printing barrier.
- **Fix:** Add a large-print option (14pt or more), offer an accessible HTML print view, and make a one-page "my plan" summary the default print.

### 12. MINOR: Web UI details (WCAG 2.2)
- On the budget step, a visible `<h2>` and an sr-only `<legend>` carry the same text (`Wizard.tsx` lines 514–517), so screen readers announce it twice.
- "None of these" and "Prefer not to say" are checkboxes that silently uncheck the others.
- The Stepper's +/− buttons don't announce the new value. A visually hidden live region fixes this (relates to 4.1.3).
- A disabled Continue button gives no reason (3.3.1).
- Links open new tabs without a warning.
- Card and stepper borders are 1.17:1 and 1.53:1. The labels carry the meaning so this passes, but low-vision users can't see where a card ends.

### 13. MINOR: Service animals and pets
- The leash item says "Shelters that take pets require them to be leashed or in a carrier." There's no service-animal option. Service animals are allowed in shelters as a matter of disability law, and their supplies (food, water, records, ID) belong in the person's own kit ([ready.gov/disability](https://www.ready.gov/disability)).
- **Fix:** Add a "service or support animal" choice and the related items.

---

## 4. What's missing

- **Caregivers and attendants.** Nothing asks whether someone depends on an IHSS provider or home health aide, or whether someone in the house is a caregiver. Home health agencies are required to have emergency plans; ask yours what it is ([CMS Emergency Preparedness Rule](https://www.cms.gov/medicare/health-safety-standards/quality-safety-oversight-emergency-preparedness)). Missing pieces:
  - "Who covers if my aide can't come?"
  - Know your home fields for: who helps me get out, DME/oxygen supplier and phone, pharmacy, how to operate my chair.
- **Dialysis.** Not offered at all. People on dialysis need a backup clinic, the 3-day emergency diet, and a plan for home dialysis without power or water. Ready.gov names this ([ready.gov/disability](https://www.ready.gov/disability)).
- **Dementia and wandering.** ID bracelets, a current photo, and "never leave alone" ([ready.gov/disability](https://www.ready.gov/disability)).
- **Mental health.** The SAMHSA Disaster Distress Helpline (1-800-985-5990, call or text) and 988. Psychiatric medicines belong in the cold or refill guidance.
- **Undocumented and mixed-status families.** Add a calm line: "Red Cross shelters don't ask about immigration status and won't let authorities in to look for undocumented people without a subpoena or court order" ([Red Cross](https://www.redcross.org/disaster-relief)). The "Copies of IDs… to get aid" item should add "You can get shelter and food without ID."
- **Domestic violence.** A hotline line (1-800-799-7233). Note that DV shelters are confidential and a safer option than a public shelter for some people.
- **LGBTQ+.** Put hormones in the medicine list. Note that the Red Cross's nondiscrimination policy includes gender identity (same source). If your ID doesn't match how you present, carry what you have and know that shelters can't turn you away for it.
- **Independent Living Centers and the Area Agency on Aging.** These are the local organizations that run DDAR and help people make plans. The app never names them.
- **People with no smartphone, data, or printer.** Add "Have a library or friend print this," make the list mail-able, and add a 211 phone path.

---

## 5. Factually wrong or questionable content

| Claim in app | Issue |
|---|---|
| "PG&E's planned shutoffs averaged about 55 hours in 2019" (`device-power`) | 55 hours is the late-October 2019 combined event ([CPUC/PG&E report](https://webproda.cpuc.ca.gov/-/media/cpuc-website/divisions/safety-and-enforcement-division/reports/psps-post-event-reports/2019/pge-psps-postevent-report-oct-2629-2019-amended.pdf)). Other 2019 events averaged 14–37 hours, and the 2013–2020 average was about 41 hours ([PSE Healthy Energy](https://www.psehealthyenergy.org/preventing-wildfires-with-power-outages-the-growing-impacts-of-californias-public-safety-power-shutoffs/)). Say "can last two to three days or more." |
| Battery "$100–400," "at least 72 hours" | Physically impossible for an oxygen concentrator (see problem 1). |
| "Spare parts for mobility aids $10–60" incl. power chair battery or backup chair | Understated by an order of magnitude. |
| Medical Baseline "For people who rely on powered medical devices" | Incomplete. Conditions qualify too, and a practitioner must certify ([PG&E](https://www.pge.com/en/account/billing-and-assistance/financial-assistance/medical-baseline-program.html)). |
| DDAR: "can provide portable batteries… Income isn't considered" | The income claim is true. But it omits the HFTD or 2+ PSPS requirement and the limited supply ([PG&E DDAR](https://www.pge.com/ddar)). The program is run through CFILC and Independent Living Centers. |
| "Shelters that take pets require them to be leashed or in a carrier" | Needs a service-animal exception. |
| Needs step: "This stays on your device." | Needs are encoded in share links (`share.ts`). |
| "Most insulin is fine for up to 28 days at room temperature" | Broadly right, but it varies by product (some 42–56 days, some 14 once opened). Add "keep it cool, never touching ice" ([VUMC summary of manufacturer guidance](https://www.vumc.org/poison-control/toxicology-question-week/oct-3-2005-what-stability-refrigerated-medications-room-temperature)). |
| Tsunami: "a mile inland, on foot" as the only option | Not wrong as general guidance, but unsafe as the *only* guidance for mobility-impaired users. |

---

## 6. Bigger-picture suggestions

1. **Test with the people you're worried about, and pay them.** Run sessions through an Independent Living Center (DDAR partners), an Area Agency on Aging, and a Chinese- or Vietnamese-serving CBO. Ten sessions will find more than this review.
2. **For AFN users, lead with a plan, not a shopping list.** Their most important items are people, programs, and decisions: who helps me out, where I plug in, how I get my medicines. Make "My personal plan" (CMIST-shaped) the first output when any need is selected, and put the gear after it.
3. **Design for go-betweens.** Caseworkers, IHSS providers, promotoras, and adult children often fill out plans *for* someone. Add a "filling this out for someone else" mode that produces a large-print, one-page plan in that person's language.
4. **Be honest about cost.** Show a free path and a "help paying" path as first-class options, not a footnote.
5. **Put program facts on a review schedule.** DDAR, Medical Baseline, and PSPS rules change every year. Give each one a "last checked" date and an owner.
6. **Don't promise registries.** If you add "sign up for your county's AFN registry," say plainly that it doesn't guarantee anyone will come.

---

## 7. Questions I'd ask the builder

1. Who have you shown this to who uses a wheelchair, oxygen, a screen reader, or doesn't read English well? What did they say?
2. Who is the audience: middle-income households who'd otherwise do nothing, or everyone? The answer changes how much of the above is in scope.
3. Is the budget question meant to change the list? If not, why ask it?
4. Would you partner with CFILC or a local ILC so the DDAR and Medical Baseline steps hand off to a person?
5. Do you have a plan, and funding, for translation and for keeping program facts current?
6. Why does "Prefer not to say" remove health items instead of offering generic ones?
7. Have you checked what someone in an SRO, a car, or a shelter sees if they try this?
8. Would you add "Clear my data," and a share option without names and health items, before promoting it widely?
