# Bay Ready: review from a household and neighborhood preparedness educator

Reviewer's background: Red Cross and Listos California instructor, SF NERT and Oakland CORE trainer, and facilitator of Map Your Neighborhood sessions and school reunification workshops. I read the source (`src/data/items.ts`, `ListView.tsx`, `firstHour.ts`, `homeFacts.ts`, `expiring.ts`, `counties.ts`, `exportXlsx.ts`, `Wizard.tsx`, and the research notes), the three sample lists, and the PDF export.

---

## 1. Verdict

This is one of the better kit builders I've seen. The quantities are honest, the voice is calm, it's local, it respects privacy, and it already puts free actions ahead of shopping. But it is still a **supply list with a plan attached, not a plan with a supply list attached**. Almost everything I teach that actually saves lives and speeds recovery is a single checkbox in Basics or sits behind "Level up". That includes knowing your neighbors, knowing who gets the kids, knowing how you'll find each other when the phones are jammed, and having practiced it once. The Oakland hills family in the samples gets 91 items and an 11-page PDF. Their reunification plan is one checkbox and one blank box. Meeting the block and the commute kit are both "Advanced, later". That's upside down. The good news is that the bones are here (Who columns, a Neighbors tab, Know your home, the OK/HELP sign), so the fix is mostly about priorities and structure, not starting over.

---

## 2. What works

- **Free actions first.** "Start here this weekend" (`StartHere` in `ListView.tsx`) leads with alerts, the household plan, shoes and a flashlight by the bed, Drop/Cover/Hold On, and swapping numbers with a neighbor. Those are the right first moves, and putting them on a calendar invite is a nice nudge.
- **Text-first advice is right and repeated.** It shows up in the `contact` tip and in step 6 of the "When it happens" card ("Send one 'We're OK' to your out-of-area contact, then save your battery"). This matches FCC guidance that texts often get through when calls don't ([FCC/FEMA tips](https://www.fcc.gov/sites/default/files/fcc-fema_tips_for_communicating_during_an_emergency.pdf)).
- **The school item gets the key fact right.** `school-plan` says schools hold kids until an approved adult comes, and that the emergency card should list people who could get there "if you're stuck across the Bay". That is exactly SFUSD's policy ([SFUSD School Emergency Information](https://www.sfusd.edu/school/lafayette-elementary-school/families/school-emergency-information)).
- **The `neighbor` tip is good relationship coaching**: "Ask what would help them, and say what would help you." Offering a check-in instead of assuming someone is "vulnerable" is the respectful framing we teach.
- **Access and functional needs are taken seriously.** `support-network` ("Don't count on just one person, or only on paid help"), Medical Baseline, DDAR, written medical info kept private to each bag, and the high-rise stairwell tip are all good.
- **Know your home** asks the right kinds of questions: shutoffs, meeting spots, spare key, per-person go bag location, who picks up the kids, who grabs the pets. Keeping it on the device is a sound privacy call.
- **The Who and Who's buying columns** in `exportXlsx.ts` are the first real division-of-labor tool I've seen in a consumer kit app.
- **The OK/HELP sign in five SF languages**, the comfort item in every go bag, and "a familiar treat helps" all show care for people, not just logistics.
- **The `offer-ride` item** ("people without cars are often the last to get out") is exactly the mutual-aid habit I wish more people had.

---

## 3. Top problems, ranked

### 3.1 CRITICAL: Neighbor work is demoted to "Advanced, later", while the sign that depends on it is Basics

**What's wrong.** In Basics, the only neighbor actions are `neighbor` (swap numbers with one person) and `ok-help-sign`. Three items are `level: "advanced", stage: "later"`: `block` (get your block or building together), `training` (CERT/NERT), and `offer-ride`. The OK/HELP sign only works if someone walks the block and reads it. That walk is the block meeting, which is hidden. Persona A, a solo renter in an SF high-rise, gets 27 stay-bin rows and no step to meet anyone on her floor.

**Evidence.** In Kobe in 1995, roughly 75–80% of people pulled from rubble were dug out by family and neighbors, not responders ([GovTech 20-year retrospective](https://www.govtech.com/em/emergency-blogs/disaster-zone/20yearretrospectiveonthekobeearthquake.html); [PCIJ](https://old.pcij.org/blog/2011/03/02/quake-ready-communities)). Aldrich's work finds that social ties before a disaster predict recovery better than damage levels do ([Aldrich & Meyer 2015, *American Behavioral Scientist*](https://doi.org/10.1177/0002764214550299); [FEMA PrepTalk guide](https://fema.gov/sites/default/files/documents/fema_preptalks_aldrich_discussion-guide.pdf)). FEMA's 2023 survey found that planning with neighbors was among the least common actions, at 12% ([FEMA 2023 NHS findings](https://slaughterbeach.delaware.gov/files/2024/01/2023-National-Household-Survey1.pdf)). The builder's own `research/supplies.md` marks `act.neighbors` as **basics**.

**Why it matters.** In the first hours after a Hayward quake, your neighbors are the rescue squad. A sign in the window with nobody organized to read it does little.

**Fix.** Move `block` to Basics at stage "month", and make the first step small: "Meet three neighbors on your floor or block. Agree that one of you will walk the block after a quake." Link SF to [Map Your Neighborhood](https://sf-fire.org/nert/map-your-neighborhood) (already in `counties.ts`), and link everyone to MYN's free 90-minute class or the [Listos block party kit](https://www.listoscalifornia.org/blockparty/). Tie the OK/HELP sign copy to that agreement. Put `neighbor` in Start Here for everyone, not just some households (see 3.8).

### 3.2 CRITICAL: The household plan is one checkbox, and the paper version has no instructions

**What's wrong.** `contact` packs five or more decisions into one tick: an out-of-area contact, two meeting spots, who picks up kids, who gets pets, paper copies, and an annual review. The PDF prints task titles only (`exportPdf.ts` has no why or tip), so on paper it just says "Make a household plan." Know your home (`homeFacts.ts`) has **no fields for the household's own people**: no cell numbers, workplaces, school names and addresses, local contact, doctor, or vet. It has one out-of-area contact and nothing on how check-ins work. Nothing produces a wallet card, and nothing produces a contact card for a kid's backpack. The only nod is a tip under `contacts-paper`.

**Evidence.** Ready.gov's Make a Plan has four steps: meet, assess needs (ages, schools, frequently visited places, languages, pets), document it with a fillable form and a wallet-size **Family Communication Plan card**, and practice it ([Ready.gov Make a Plan](https://www.ready.gov/plan)). Cal OES/Listos asks for contacts for schools, childcare, and workplaces, plus meeting spots at work and school ([Cal OES](https://news.caloes.ca.gov/making-a-personalized-emergency-plan/)). FEMA's kids' card has fields for an emergency contact, out-of-town contact, meeting place, and 911 ([FEMA child plan](https://www.weather.gov/media/owlie/FEMA_plan_child.pdf)).

**Why it matters.** People tick "Make a household plan" after a two-minute chat in the kitchen. When the phones die, the numbers are in nobody's head.

**Fix.** Split it into 4–5 tasks: (a) ask someone out of the area to be your contact, and tell them what to do; (b) start a household group text and agree on a check-in message; (c) pick the two meeting spots and walk to them; (d) fill in a per-person wallet card and a kid backpack card; (e) go over it with everyone. Add Know your home fields for each person's number, work or school with address, and a local backup contact. Generate printable wallet and backpack cards. Print the why/tip text for plan-type tasks.

### 3.3 CRITICAL for families: Reunification is thin, and missing from the first-hour card

**What's wrong.** `school-plan` has no `startRank`, so even with kids it isn't in Start Here. In Persona B, "Line up a few people who'd check on you" beat it. The app also never mentions:
- daycare or preschool
- kids at different schools
- teens: they're folded into "Adults and teens" in `Wizard.tsx`, yet high schools may release them on their own, and teens ride BART alone
- the photo-ID requirement
- refilling the emergency card **every school year**
- the hardest rule for parents: **don't rush the school and don't call it**

"Picks up the kids" is one box for every kid and every school. The "When it happens" card (`firstHour.ts`) says nothing about children who aren't at home.

**Evidence.** SFUSD releases students only to parents and adults named on the emergency card. Adults must show photo ID or be known to staff. The card has to be refilled every year, and parents are told not to phone the school ([SFUSD](https://www.sfusd.edu/school/lafayette-elementary-school/families/school-emergency-information)). The Standard Reunification Method used by many districts includes a check-in line, an ID check, possible reunification **off campus**, and possible self-release for high schoolers ([SRM parent handout](https://evolution.iloveuguys.org/downloads/SRM-V2-Parent-Handout.pdf)). Licensed child care in California has to name two relocation sites on the LIC 610 ([SF relocation guidance](https://www.sf.gov/relocation-planning-and-procedure)).

**Fix.** For any household with kids, put `school-plan` in Start Here. Make it per child, with school or daycare name, relocation site, authorized adults (at least one who doesn't cross a bridge), and a reminder to bring ID. Add a teen tier: their own go bag, their own wallet card, and a plan for where they go if they're stuck. Add to the card: "Kids at school or daycare stay there until an adult on their card arrives. Don't call the school. Follow your pickup plan." Add an August calendar event: "Update school emergency cards."

### 3.4 MAJOR: The app assumes everyone is home when it happens

**What's wrong.** The wizard never asks where people spend the day. `work-kit` ("Keep a small kit at work or school") is `advanced/later`, and there is no get-home plan. Persona B, two likely-commuting parents in the Oakland hills, sees the work kit only under Level up. Persona C, a retired Santa Cruz couple, gets it anyway, so it's mis-targeted in both directions.

**Evidence.** After Loma Prieta, the Bay Bridge was closed for about a month ([ABC7](https://abc7news.com/archive/7050920)). BART holds every train after shaking, and the trains in the Transbay Tube move to the nearest station and wait. Its damage response team has never been activated for a real event ([BART](https://www.bart.gov/node/44666)). In Tokyo in 2011, 5.15 million people in the metro area couldn't get home that night. Tokyo now asks employers to stock 3 days of supplies and keep staff in place ([Tokyo ordinance](https://en.wikipedia.org/wiki/Metropolitan_Tokyo_Ordinance_on_Measures_for_Stranded_Individuals)). Ready.gov publishes an Emergency Plan for Commuters and says to be ready to shelter at work for 24 hours ([Ready.gov](https://www.ready.gov/plan)).

**Fix.** Add one wizard question: "On a weekday, where is everyone? Home / same city / across a bridge or another county / school." If anyone crosses water, promote `work-kit` to Basics and add a "stay put first" plan: shelter at work, decide who is nearest to the kids, mark a walking route. Add "If you're away from home" lines to the card.

### 3.5 MAJOR: Planning without practice

**What's wrong.** The only drill is `drop-cover`. "Plan two ways out of every room" is buried in the smoke-alarm tip. There is no:
- home fire drill
- wildfire "out the door in 10 minutes" drill with the dog and the cat carrier
- test text to the out-of-area contact
- walk to the meeting spots
- pet carrier training, even though the builder's research lists it

The six-month reminder (`sixMonthCheck` in `ListView.tsx`) covers supplies only. The Great ShakeOut is **tomorrow, October 15, 2026** ([SB County OES](https://oes.sbcounty.gov/shakeout/)), but the app only says "third Thursday in October."

**Evidence.** Ready.gov step 4 is "Practice your plan." Cal OES says to "rehearse it so each family member knows what they are supposed to do" ([Cal OES](https://www.news.caloes.ca.gov/prepare-a-family-emergency-plan-during-national-preparedness-month/)). In FEMA's 2015 survey, nearly 60% of adults had never practiced through a drill ([summary](https://riskandresiliencehub.com/are-americans-prepared-for-disasters-femas-survey-reveals-key-findings/)).

**Fix.** Add a "Practice" group with 4–5 short drills, each with a time box: 10-minute evacuation, a night fire drill, a test text, a meeting-spot walk, and a carrier practice. Put the next ShakeOut date in the app with a calendar invite ("invite the neighbors"). Add plan items to the six-month reminder.

### 3.6 MAJOR: The plan lives on one phone

**What's wrong.** Know your home is saved in localStorage and left out of share links (`homeFacts.ts` comment). Leaving it out is the right privacy call. The result, though, is that the second parent, the teen, and the roommates never see the meeting spots or who grabs the dog, unless someone emails a spreadsheet snapshot that goes stale.

**Fix.** Make the printed **one-page household plan** the main artifact: the fridge copy, plus the wallet and backpack cards. Offer an explicit, warned "include my plan details in this link" toggle for household members. Add a task: "Go over the plan with [names]."

### 3.7 MAJOR: "When it happens" card: order and gaps

**What's wrong.**
- For coastal households, the tsunami line comes **6th**, after the gas check, candles, and go bags (Persona C). California guidance is that strong shaking near the coast is the warning: once it stops, go to high ground immediately, because waves can arrive within minutes ([CGS](https://conservation.ca.gov/cgs/tsunami/preparedness); [CGS handout](https://www.conservation.ca.gov/cgs/Documents/Tsunami/How-to-Survive-a-Tsunami.pdf)).
- There is no line about kids at school (3.3) and nothing for when you're away from home (3.4).
- There is no fallback such as "Can't reach anyone? Go to the meeting spot at the top of the hour."
- There is no line about checking on the specific neighbors you agreed to check on.
- Persona A has no go bag, but her card still says "take your go bags."

**Fix.** Make tsunami step 2 for coastal households. Add a reunification line and a check-in fallback. Fill in the card's lines from Know your home (the meeting spot, the out-of-area contact's name).

### 3.8 MAJOR: Caring for people outside the household is invisible

**What's wrong.** The wizard counts the people who live with you. It doesn't ask about the elderly mother in San Leandro, the neighbor you look in on, or the dog who's home alone during your workday. "Grabs the pets" helps with the dog, but nothing helps with the mother. Separately, `support-network` triggers on *any* need, including glasses. That's how Persona B got "Line up a few people who'd check on you", with copy about showing someone your equipment, in Start Here ahead of `neighbor`.

**Fix.** Add a wizard question: "Anyone outside your home you'd check on or pick up?" If yes, add tasks to add them to your plan, put their address on your map, and make sure *they* have a check-in buddy nearby. Limit `support-network` to mobility, power-device, and cold-meds needs.

### 3.9 MAJOR: Kids and emotional readiness are mostly items, not actions

**What's wrong.** There's a comfort item and a Sesame link, which is good. But there are no tasks to:
- let kids pack their own bag
- have them memorize one number (only a tip mentions it)
- talk about earthquakes calmly and at their level
- give them a job in the plan

There's nothing on adult coping either: limiting news exposure, keeping routines, Psychological First Aid. Per-person go bag rows give a 3-year-old a phone power bank and a charging cable.

**Evidence.** NCTSN guidance: kids cope better when they have a role, routines should be kept, and the more coverage they watch, the worse they do ([NCTSN media tips](https://www.samhsa.gov/resource/dbhis/tips-parents-media-coverage-earthquake); [NCTSN](https://nctsn.org/node/1020)).

**Fix.** Add a kids' task: "Make it theirs: pack, practice, memorize, a job." Add "After: routines, limit news, watch for delayed reactions" to the card or the PDF. Make phone gear per *phone owner*, not per bag.

### 3.10 MINOR: Neighbors tab doesn't match how blocks actually organize

`buildNeighbors` gives you 12 rows with name, contact, location, skills, notes, and OK to share. Map Your Neighborhood also tracks gas meters and propane tanks, people who may need help (including **kids home alone after school**), and a neighborhood care center ([MYN workbook](https://communicrossings.com/files/other/CERT/Map-Your-Neighborhood-workbook.pdf); [Island County MYN](https://islandcountywa.gov/467/Map-Your-Neighborhood)). **Fix:** add columns for "home during the day?", "kids/pets", "has our key", and "gas/propane location". Add a block meeting spot and a care-center row.

### 3.11 MINOR: CERT links are by county, but the programs are run by cities

`counties.ts` sends every Alameda County household to Alameda County Fire CERT. That program serves San Leandro, Dublin, Newark, Union City, Emeryville, and unincorporated areas, **not Oakland, Berkeley, Fremont, or Hayward** ([ACFD CERT overview](https://aspawebq.acgov.org/fire/documents/ACFD%20CERT%20Overview.pdf)). Oakland has its own program, CORE, which has dropped CORE I–III in favor of a Personal Emergency Preparedness course plus CERT ([Oakland CORE](https://oaklandca.gov/services/core)). Santa Clara has city-level programs. **Fix:** ask for the city, or list the main city programs for each county.

### 3.12 MINOR: OK/HELP sign copy overpromises

"Tells neighbors and crews" (`ok-help-sign`), and the `/sign` page's "neighbors and crews go door to door," suggest that responders will scan windows. Holdeman calls that "the wrong message to send." The sign is for neighbors ([GovTech](https://www.govtech.com/em/emergency-blogs/disaster-zone/help-and-ok-window-signs); [Seattle SNAP drill](https://www.seattle.gov/documents/departments/emergency/preparedness/snap/gettingconfident/advancedneighborhoodearthquakedrill.pdf)). "Put up HELP even if you can't get to the door" is unclear. **Fix:** say "for your neighbors." Say "Post it in a window facing the street." Add "a home with no sign still gets a knock."

---

## 4. What's missing

- **Wallet and backpack cards.** A printable, per-person communication card.
- **Daytime map.** Where each person is on a typical weekday, and a get-home or stay-put plan for each.
- **Renters, condos, and shared housing.** Building-level contacts (manager, HOA emergency committee); what happens if the building is red-tagged; renters insurance "loss of use"; a condo master policy and loss-assessment coverage; a roommate agreement on shared supplies and who covers whom. Right now `high-rise` is the only building-specific task, and it's limited to tall buildings.
- **Recovery.** What happens in weeks 1–8: DisasterAssistance.gov registration, insurance claims, SBA disaster loans (renters qualify too), and where to get updates. The Emergency Financial First Aid Kit (`effak`) is Advanced only.
- **Finding people.** The current Red Cross "Contact Loved Ones" page sends people to local chapters and suggests texts and social media; it no longer features Safe and Well ([Red Cross](https://www.redcross.org/get-help/disaster-relief-and-recovery-services/contact-and-locate-loved-ones.html)). Teach the household to use social-media check-ins and the out-of-area relay. Don't promise a website.
- **Satellite texting as part of the plan.** iPhone 14 and later can text contacts by satellite, and T-Mobile's T-Satellite works with other carriers for about $10 a month ([TidBITS](https://talk.tidbits.com/t/how-t-mobile-s-new-t-satellite-compares-with-apple-s-free-satellite-features/31659)). The `phone-setup` item only mentions texting 911.
- **Pets left home during the workday.** A neighbor key-holder for the pet, a pet-alert sticker, and a carrier by the door. There are pieces of this, but no single task.
- **Language.** Add an "OK to share" column for language spoken in the Neighbors tab, and translated plan cards. The sign is translated; the plan isn't.
- **Workplace and school preparedness.** "Ask your employer what their plan is" and "Does your kid's school do ShakeOut?" Both build community preparedness without the household buying anything.

---

## 5. Factually wrong or questionable content

1. **"Local calls often fail but texts and long-distance calls can get through"** (`contact` tip). This is half true. The text part is right (FCC). The "long-distance" part comes from the landline era; on cell networks, local congestion is the bottleneck either way. The real value of an out-of-area contact is that they're a relay hub outside the damaged area. Reword it that way.
2. **Tsunami order on the card** (`firstHour.ts`). It comes after gas and go bags, which conflicts with CGS guidance to move immediately (see 3.7).
3. **OK/HELP "crews"** language (see 3.12).
4. **`school-plan`: "Schools keep kids until an approved adult picks them up."** That's true for SFUSD elementary schools. High schools may self-release students under the SRM, and kids may be moved to a reunification site off campus. Add that caveat.
5. **Oakland CERT routing** (`counties.ts`). It points to a county program that doesn't serve Oakland (see 3.11).
6. **`phone-setup`** undersells satellite. It's not just 911; Messages via satellite reaches contacts. It also needs a clear view of the sky, so it only works outside.
7. The rest checked out: the ShakeOut "third Thursday in October" claim, CEA renters policies starting around $35 a year ([CEA](https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters)), and BART holding trains after a quake.

---

## 6. Bigger-picture suggestions

1. **Lead with a one-page plan, not a long list.** Make the first artifact a printable "Our plan" page (people, numbers, meeting spots, who does what, school pickup) plus wallet cards. Put the 91-item supply list second. People finish one page. They abandon 11.
2. **Three tracks with equal weight:** *Plan* (household), *People* (neighbors, people you check on), and *Supplies*. Show progress on each. Right now the progress bars count tasks next to bin items, and stuff dominates.
3. **A seasonal rhythm instead of one six-month supply check.** August: school cards. June: fire season evacuation drill. October: ShakeOut, plan review, invite the neighbors. Spring daylight-saving change: supplies. Each one is a calendar invite with a 15-minute script.
4. **A neighbor mode.** "Host a 45-minute block meeting" should generate a door-hanger invite, a sign-in sheet that matches the Neighbors tab, the MYN steps, and a share link that carries no personal data. The app is good at making things printable, so use that for organizing.
5. **Partner, don't duplicate.** Funnel people to NERT, CORE, MYN, Listos, and CERT at the city level, and track "took a class" as a household milestone.
6. **Test it the way we test plans: with a tabletop exercise.** Give five real households their printout and a scenario. For example: "4:40 pm Tuesday, M7.0 Hayward. You're in SF, your partner is in San Jose, the 8-year-old is at after-care in Oakland, and the dog is home." Watch where they get stuck. I predict it'll be pickup authority, not water.

---

## 7. Questions for the builder

1. Why are `block`, `training`, and `offer-ride` Advanced/later, when your own research marked neighbor actions Basics?
2. Have you watched any household fill in "Make a household plan"? What did they actually write down?
3. Who is the plan for: the person who ran the wizard, or everyone in the home? How does the second adult, the teen, or a roommate get it?
4. Would you ask "where is everyone on a weekday?" if it took one screen? That one answer changes the commute, reunification, and pet tasks.
5. Why aren't teens their own group? They have different roles and different release rules at school.
6. Have you talked to SF NERT, Oakland CORE, or a school district about linking to their materials or co-branding?
7. Are you willing to add a "practice" phase with time-boxed drills, and to change "done" so it means *practiced*, not just *planned*?
8. Is "Copy share link" meant to reach neighbors? If so, what should a neighbor see that's useful to *them*?
9. What happens to the plan in year two, when nobody opens the site? Is the paper refresh log the only thing that persists?
10. Would you consider a Spanish and Chinese version of the one-page plan and the cards before translating the full list?

---

### Sources

- Ready.gov, Make a Plan: https://www.ready.gov/plan
- FEMA kids' communication plan card: https://www.weather.gov/media/owlie/FEMA_plan_child.pdf
- Cal OES, personalized emergency plan: https://news.caloes.ca.gov/making-a-personalized-emergency-plan/ and https://www.news.caloes.ca.gov/prepare-a-family-emergency-plan-during-national-preparedness-month/
- FCC/FEMA, tips for communicating in an emergency: https://www.fcc.gov/sites/default/files/fcc-fema_tips_for_communicating_during_an_emergency.pdf
- SFUSD, School Emergency Information: https://www.sfusd.edu/school/lafayette-elementary-school/families/school-emergency-information
- I Love U Guys, SRM Parent Handout: https://evolution.iloveuguys.org/downloads/SRM-V2-Parent-Handout.pdf
- SF.gov, child care relocation planning (LIC 610): https://www.sf.gov/relocation-planning-and-procedure
- BART, Earthquake Response Team: https://www.bart.gov/node/44666 ; Earthquake Safety: https://www.bart.gov/node/34141
- ABC7, Loma Prieta and Bay Bridge closure: https://abc7news.com/archive/7050920
- Tokyo stranded-persons ordinance: https://en.wikipedia.org/wiki/Metropolitan_Tokyo_Ordinance_on_Measures_for_Stranded_Individuals
- Great ShakeOut 2026 (Oct 15): https://oes.sbcounty.gov/shakeout/
- GovTech, Kobe retrospective: https://www.govtech.com/em/emergency-blogs/disaster-zone/20yearretrospectiveonthekobeearthquake.html ; PCIJ: https://old.pcij.org/blog/2011/03/02/quake-ready-communities
- Aldrich & Meyer (2015), Social Capital and Community Resilience: https://doi.org/10.1177/0002764214550299 ; FEMA PrepTalk: https://fema.gov/sites/default/files/documents/fema_preptalks_aldrich_discussion-guide.pdf
- FEMA 2023 National Household Survey findings: https://slaughterbeach.delaware.gov/files/2024/01/2023-National-Household-Survey1.pdf
- Map Your Neighborhood: https://islandcountywa.gov/467/Map-Your-Neighborhood ; workbook: https://communicrossings.com/files/other/CERT/Map-Your-Neighborhood-workbook.pdf ; SF NERT MYN: https://sf-fire.org/nert/map-your-neighborhood
- Listos California block party kit: https://www.listoscalifornia.org/blockparty/
- Oakland CORE: https://oaklandca.gov/services/core
- Alameda County Fire CERT overview: https://aspawebq.acgov.org/fire/documents/ACFD%20CERT%20Overview.pdf
- GovTech, HELP and OK window signs: https://www.govtech.com/em/emergency-blogs/disaster-zone/help-and-ok-window-signs ; Seattle SNAP drill: https://www.seattle.gov/documents/departments/emergency/preparedness/snap/gettingconfident/advancedneighborhoodearthquakedrill.pdf
- California Geological Survey, tsunami preparedness: https://conservation.ca.gov/cgs/tsunami/preparedness ; handout: https://www.conservation.ca.gov/cgs/Documents/Tsunami/How-to-Survive-a-Tsunami.pdf
- NCTSN/SAMHSA, tips for parents on earthquake media coverage: https://www.samhsa.gov/resource/dbhis/tips-parents-media-coverage-earthquake
- American Red Cross, Contact Loved Ones: https://www.redcross.org/get-help/disaster-relief-and-recovery-services/contact-and-locate-loved-ones.html
- TidBITS, satellite texting comparison: https://talk.tidbits.com/t/how-t-mobile-s-new-t-satellite-compares-with-apple-s-free-satellite-features/31659
- California Earthquake Authority, renters: https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters
