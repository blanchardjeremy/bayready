# Bay Ready: review from a risk communication and preparedness-behavior perspective

Reviewer stance: social scientist working on household preparedness (PADM, EPPM, efficacy, norms, implementation intentions, habit). I read the wizard (`src/components/wizard/Wizard.tsx`), home page (`src/app/page.tsx`), results page (`src/components/list/ListView.tsx`), items, `buildList.ts`, `firstHour.ts`, the builder's own `research/ux.md`, the three sample lists, and the screenshots and PDF.

---

## 1. Verdict

This is one of the better-informed civilian prep tools I've reviewed. The builder clearly read the right literature (`research/ux.md` cites EPPM, PADM, FEMA's household survey, implementation intentions, and endowed progress), and the tone is calm, local, and efficacy-first. But the build has drifted away from its own research. That research asked for 7–8 questions, a 3–5 item weekend card, a 1–2 page printout, "days covered" progress, and every question changing the list. What shipped is 10–12 wizard steps, 45 to 128 equal-weight checkboxes, an 11-page PDF, item-count progress bars, and a budget question that barely changes anything. The result is a very good reference document, but it isn't yet a behavior-change tool. It gives people a thorough list in one sitting and does almost nothing to bring them back for weeks two through twelve, which is when preparedness actually happens or fades. Fix the triage, the follow-through, and the social layer before adding any more content.

---

## 2. What works

- **Efficacy-first framing, no doom.** There are no countdowns, no "overdue Big One" lines, and no rubble photos. Hazard blurbs are short and concrete ("Water, gas, and power can be out for days"). The `why` lines carry response efficacy item by item ("Electric openers won't work without power"). This fits EPPM: coping information matters more than raising fear ([Witte 1992 via summary](https://en.wikipedia.org/wiki/Extended_parallel_process_model)).
- **Tasks come before supplies.** "Around the house" is ordered plan, then neighbors, then sign-ups, then home safety, then supplies (`CATEGORY_ORDER` in `meta.ts`). Furniture strapping and water-heater straps are Basics. That matches the Earthquake Country Alliance's Seven Steps, which start with "Secure your space" ([ECA / USGS](https://www.usgs.gov/media/images/seven-steps-earthquake-safety)).
- **The alert sign-up is placed where people already are.** The county step links the county's alert system mid-wizard ("You can do it now"). FEMA's 2023 survey recommends exactly this, because alert sign-ups fell from 46% to 36% while supply-gathering rose ([FEMA NHS 2023 deck](https://slaughterbeach.delaware.gov/files/2024/01/2023-National-Household-Survey1.pdf)).
- **The "have" step builds endowed progress.** Ticking owned items, plus "You're already off to a good start. Most of a kit is everyday stuff," is a sound application of [Nunes & Drèze 2006](https://coglode.com/nuggets/endowed-progress-effect) (34% vs 19% completion with a head start).
- **Real quantities, sized to the household,** with a fallback: "If that's a lot, start with 18 gallons (3 days)." That fallback line is the best piece of copy on the site, and the pattern should be used everywhere.
- **The "When it happens" card and the OK/HELP sign.** Both are concrete, printable, and act at the moment of need. The sign comes in SF's five main languages.
- **Access and functional needs treated as normal.** The CPAP case adds Medical Baseline and backup-battery steps to the persona's Start here. "Don't count on just one person, or only on paid help" is excellent.
- **Honest about disagreement.** The About page explains the choice of a week vs. FEMA's 3 days.

---

## 3. Top problems, ranked

### 3.1 CRITICAL: The list is too long and has no triage
**What's wrong.** Persona A (solo renter, Basics, "$50") gets 45 entries plus 27 "level up" items. Persona B (family) gets 91. Persona C (older couple, Advanced) gets 128. Within a kit, 41 gallons of water carries the same weight as "Wet wipes" and "Menstrual products." Nothing says "if you only do five things, do these."
**Evidence.** The goal-gradient effect: effort rises as a goal gets close and sags when it's far away ([Kivetz, Urminsky & Zheng 2006](https://business.columbia.edu/faculty/research/goal-gradient-hypothesis-resurrected-purchase-acceleration-illusionary-goal)). PADM lists perceived time, effort, and cost as the main barriers to adopting a protective action ([Lindell & Perry 2012](https://ideas.repec.org/a/wly/riskan/v32y2012i4p616-632.html)). The builder's own notes cite "not knowing where to start" (28%) as a top barrier.
**Why it matters.** Most people will do a few items and stall. Without triage, those few may be the easy ones (soap, wipes) rather than the ones that matter most (water, a toilet plan, meds, light, a contact plan).
**Fix.** Add a tier above Basics, something like "Ready for 3 days: the 8 things that matter most" (water, bucket toilet, meds, light, radio or power bank, cash, the plan, alerts). Make it a visible finish line with its own done state, and make it what Basics opens on. Then "Ready for a week" (current Basics), then Advanced. Mark the core items in every view.

### 3.2 CRITICAL: Nothing supports follow-through after the first visit
**What's wrong.** State lives in localStorage. The only return paths are an optional calendar event for the first weekend and a 6-month check buried at the bottom. Nothing exists for the "This month" stage, which in Persona B holds about 80 items. The app can't know whether anyone did anything.
**Evidence.** Gains from preparedness interventions fade fast. A Seattle workshop's effect was gone at 3 months ([Seattle study](https://invenio.itam.cas.cz/record/18348)). After the Whittier Narrows quake, repeated contact slowed the decay, and a single contact didn't ([summary of studies](https://link.springer.com/doi/10.1007/BF00124393)). A 2024 meta-analysis found only a small effect of interventions on preparedness behavior, very low certainty, and no clear effect on supplies ([Heagele et al., Frontiers in Public Health 2024](https://doaj.org/article/6b76260d61744d86ba637f004351adb6)).
**Why it matters.** One sitting produces intention. Kits get built over weeks. Without repeated contact, the tool's effect will mostly vanish.
**Fix.** Offer a short reminder sequence, as calendar events if you want to stay account-free: weekend steps, a shopping trip 10 days later, a 30-day "how far did you get?", then twice a year. Each event should deep-link to the list with one concrete next action. Optionally offer email or SMS reminders through a privacy-respecting service.

### 3.3 CRITICAL: The action card misses the people most at risk
**What's wrong.** Persona C has a CPAP or oxygen, insulin, and a mobility aid, and lives in a tsunami zone. Their card says "Walk to high ground now" and "Power out: keep the fridge and freezer shut," with nothing about the device, keeping insulin cold, or what to do if walking isn't possible. Persona A picked smoke and Persona B picked heat, but `firstHour.ts` has no smoke or heat lines at all. The wheelchair version of Drop, Cover, and Hold On is in a task tip but not on the card.
**Evidence.** Protective action guidance has to match what the person can actually do. That's response efficacy and self-efficacy at the moment of action (EPPM). Heat is consistently among the deadliest US weather hazards.
**Fix.** Add lines based on the household's needs: "Power out and you use oxygen or a CPAP: switch to backup, and call [supplier / PG&E / 911] if it will run out." "Insulin: move it to the cooler with ice packs." "Can't walk to high ground fast? Go up to the 3rd floor or higher of a sturdy building and arrange a ride ahead of time." Add short smoke and heat lines too.

### 3.4 MAJOR: "Start here" has no tangible step and a time promise it can't keep
**What's wrong.** Persona A's six steps are alerts, household plan, shoes/flashlight/whistle, practice DCHO, swap numbers with a neighbor, and photograph IDs. The copy says "These are free and take about an hour all together." But "Make a household plan" means choosing an out-of-area contact (and asking them), two meeting spots, and kid and pet pickup. That's a negotiation, not a task. Persona B also gets "Line up a few people who'd check on you." The builder's research recommended "Gather what you already have into one bin," and it isn't on the list.
**Evidence.** A bin with stuff in it is a visible, physical cue and a real piece of endowed progress. Breaking a promised time estimate costs credibility, and the planning fallacy means people already underestimate time.
**Fix.** Cap it at 3–5 steps. Include one physical win ("Put what you already have in one bin or bag and put it in the hall closet"). Split "Make a household plan" into a 10-minute first piece ("Text one out-of-area person and ask if they'll be your contact"). Change the time line to "Most take 5–15 minutes each."

### 3.5 MAJOR: Cost is shown in ways that discourage, and the budget answer is ignored
**What's wrong.** Every kit shows a bold "Still to get" total. Persona B's Basics adds up to roughly $750–1,850, and Persona C's bin alone is $1,050–2,870. The wizard asks "Roughly what do you want to spend to start?", but in `stageOf()` only "Use what I have first" changes anything. "Under $50" and "$50 to $150" produce identical lists, and the "more" branch is a no-op (`month` → `month`). Persona A said $50 and got a $240–490 bin with no acknowledgment.
**Evidence.** Cost is the most-cited barrier (45%, per the builder's own notes). FEMA 2023 found lower-income people take low- or no-cost actions about as often as others, but fewer high-cost ones ([FEMA NHS 2023](https://slaughterbeach.delaware.gov/files/2024/01/2023-National-Household-Survey1.pdf)). Asking a question and then ignoring the answer erodes trust.
**Fix.** Use the answer. For "Under $50," show "Your first $50," with the items that give the most protection per dollar, then the rest. Show free paths for paid items ("Fill cleaned jugs from the tap: $0" next to bottled water). Show cost per stage, not per kit, and keep the grand total one click away.

### 3.6 MAJOR: The page rewards exporting over doing
**What's wrong.** On mobile (`list-top.jpg`), the order is: three empty progress bars ("0 of 21 done"), then five export buttons, with **Download spreadsheet** as the only primary (red) button, and only then "Start here." The PDF runs 11 pages for a Basics family.
**Evidence.** Making or announcing a plan can give people a premature sense that the goal is done ([Gollwitzer et al. 2009](https://www.socmot.uni-konstanz.de/sites/default/files/09_Gollwitzer_Sheeran_Seifert_Michalski_When_Intentions_.pdf), small studies, so read it as a caution, not a law). Downloading a spreadsheet feels like progress and isn't.
**Fix.** Put Start here directly under the header. Make its first item the primary action ("Sign up for AC Alert"). Fold the exports into one "Save or share" menu below the fold. Offer a 2-page "core" PDF as the default and the full one as an option.

### 3.7 MAJOR: The implementation intention is a time window, not a plan
**What's wrong.** "When could you take your first step?" offers "This weekend / couple of weeks / this month / not sure." That window sets a calendar date (Saturday 10am) and a heading. It doesn't ask where, with whom, or what the first concrete act is.
**Evidence.** If-then plans that name when, where, and how work much better than goals ([Gollwitzer & Sheeran; overview](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.565202/pdf)). Asking people to write down a specific date and time raised flu-shot rates ([Milkman et al. 2011, PNAS](https://www.pnas.org/doi/10.1073/pnas.1103170108)).
**Fix.** On the last screen, ask: "Pick a day and time," "Where will your bin live?", and "Who will you do it with?" Then echo it back as a sentence ("Saturday at 10, Sam and I will put what we have in a bin in the hall closet") and put that sentence in the calendar event and on page 1 of the PDF.

### 3.8 MAJOR: The social lever is under-used, misplaced, and once backfires
**What's wrong.** The About page argues neighbors matter most (Kobe), yet "Get your block or building together" and "Offer a neighbor a ride out" are Advanced, and Persona A sees them only collapsed. The share link sends your whole list, which is the wrong thing to hand a neighbor. The alerts item says "Most are opt-in, and few people sign up."
**Evidence.** Descriptive norms (believing friends and neighbors are preparing) were the strongest predictor of wildfire preparedness in Oregon ([Siddiqi et al. 2023, *Disasters*](https://news.oregonstate.edu/news/personal-experience-wildfire-increases-engagement-disaster-preparedness-osu-study-finds)). Telling people an undesired behavior is common makes it more common (Cialdini's Petrified Forest study, [summary](https://research.fs.usda.gov/treesearch/45277)). Pre-disaster social ties predict recovery better than damage levels ([Aldrich, *Building Resilience*](https://muse.jhu.edu/article/570843/summary)). FEMA finds planning with neighbors is the rarest action (12%).
**Fix.** Delete "few people sign up." Use honest positive norms ("About half of US households gathered supplies last year": FEMA 48%). Build a small neighbor artifact: a pre-written text or printable card ("We're putting together quake kits. Want to swap numbers and check on each other?"). Move a light version of "Get your block together" into Basics. Add a household invite ("Send this to the other adults in your home so you can split the list"), since per-person slots already exist.

### 3.9 MAJOR: The wizard is longer than promised, and two questions do little
**What's wrong.** The home page says "a few quick questions… About 3 minutes." There are 10 steps (12 on Advanced), and the hazards screenshot shows "Step 3 of 10." The first question asks a novice to choose between a bin and a bag before they've thought about hazards. "Start" only changes a heading and a calendar date, and "budget" barely changes anything (3.5). The builder's own principle says "Each question must change the list, or it gets cut."
**Fix.** Order: county → hazards → household → needs → have. Then suggest the kit, without asking about it up front. Move home type, car, level, and power goals onto the results page as refinements. Keep the step with the start time and commitment (3.7) as the last screen.

### 3.10 MINOR: Progress and "done" states don't motivate
**What's wrong.** Progress is a count of items, so "Hand soap" counts the same as "41 gallons." Bars start at 0 for anyone who ticked little. The header says "Ready for: Quake, outage, wildfire" at 0% done, which implies a readiness that doesn't exist. The only celebration is "Free steps done. Nice work."
**Fix.** Use the "days covered" metric from the builder's own research ("Water: 3 of 7 days"). Add milestone moments at each tier ("You're ready for 3 days. That's a real milestone."). Rename the header label to "Planning for."

### 3.11 MINOR: Credibility signals are thin
**What's wrong.** There's no named maker, no "last reviewed" date on the list or PDF, and no partner organization. The Sources page is good but sits behind a nav link.
**Evidence.** Trust in the information source shapes outcome expectancy (Paton's model, cited in `ux.md`). People who used official sources were 1.7× more likely to take 3+ actions (Siddiqi et al. 2023).
**Fix.** Add "Made by [name], a volunteer in [city]. Not affiliated with any agency. Last checked [date]." Ask a NERT/CERT chapter or a county OES to review it, and say so if they do.

### 3.12 MINOR: Framing tweaks
"Think of it as camping at home" is a smart self-efficacy reframe, but it's culturally specific (not everyone camps, and for some, "camping" means hardship, not recreation). It may also undersell a weeks-long water outage and invite gear shopping. Test it against "Like a long power outage, but with no water too." The home page gives no reason to care. That's fine for self-selected visitors, but it isn't fine for household members who arrive through a share link. Add one experiential line ("If you lived through the 2020 orange-sky day or a PG&E shutoff, you've seen why"). Disaster experience is one of FEMA's strongest predictors.

---

## 4. What's missing

- **Skills.** Only DCHO and extinguisher use are taught. There's no first aid/CPR class, and no Stop the Bleed even though Advanced adds a bleeding control kit, which contradicts the app's own "don't pack anything you don't know how to use." CERT/NERT is Advanced only.
- **Teachable-moment entry points.** In Canterbury, the share of households reporting they were prepared doubled from 18% to 36% after the first big quake ([Victoria University thesis and Stats NZ](https://openaccess.wgtn.ac.nz/articles/thesis/Essays_On_Disaster_Management_Issues_Related_To_Household_Preparedness_And_Public_Attention/17151917)). Make "Felt that quake? / Smoke day? / Shutoff coming? Do these 3 things tonight" pages, built for search and sharing.
- **A maintenance plan that fits how habits work.** A twice-yearly check can't become a habit, because habits need frequent repetition in a stable context ([Lally et al. 2010](https://www.ucl.ac.uk/news/2009/aug/how-long-does-it-take-form-habit)). Rely on external cues and rotation instead. The copy says "when the clocks change," but the calendar event fires 6 months from today. Tie it to DST and ShakeOut (third Thursday of October). Trim the refresh log too. Persona B's log has about 58 rows, which is a project, not a check.
- **Languages.** The sign is in five languages, and nothing else is.
- **Renter and low-space versions.** "Water can sit next to it" assumes a closet. Add an under-bed or small-apartment layout.
- **Any measurement at all** (section 6).

---

## 5. Questionable claims or copy

| Copy | Location | Issue |
|---|---|---|
| "Most are opt-in, and few people sign up." | `items.ts`, alerts `why` | A negative descriptive norm that normalizes not signing up (Cialdini). Replace it with "Takes two minutes. Most alerts are opt-in, so you have to sign up to get them." |
| "Usually one weekend and a shopping trip or two." next to "Most people spread this over a few months." | `Wizard.tsx` LevelChoice | They contradict each other, and the "most people" claim has no source. Pick one and make it honest: "Most of this takes a few shopping trips. Spread it out." |
| "These are free and take about an hour all together." | Start here | Not credible when the box includes a household plan, a neighbor, and check-in people. |
| "the single most useful free step" | County step | No source. It's defensible as advice but stated as fact. Soften it to "one of the most useful." |
| "Ready for Quake, outage, wildfire" | List header | Implies readiness at 0% done. |
| "About 3 minutes" / "a few quick questions" | Home | 10–12 steps plus optional names. Time it with real users and state the median. |
| "Ready.gov says healthy people can get by on [1,200–1,500 cal/day]" | Canned protein `why` | I couldn't confirm this exact figure on Ready.gov. Older FEMA/Red Cross guidance says people can survive on about half their usual intake. Verify the quote or attribute it correctly. |
| "Skip candles. They're a leading cause of fires after earthquakes." | Flashlight tip | Plausible and widely repeated, but "leading" needs a source. Gas and electrical ignitions dominate the post-quake fire literature. |
| "After a big earthquake, most Bay Area households will stay home." | Build step | Probably true, but add a source (HayWired, ReadySF). |
| Example card: "2 of 5 ready" | Home | Sets an expectation of about 5 items. The real list is 45+. The gap between the two is a reason people quit. |
| Home hazard line, if added | — | If you add a probability, use USGS's own wording: 72% chance of M6.7+ in the Bay Area by 2043 ([USGS FS 2016-3020](https://pubs.usgs.gov/publication/fs20163020)). Always put it next to an action. |

---

## 6. Bigger-picture and strategic suggestions

1. **Reposition from "kit list" to "first 3 days, then a week."** Make the core-tier finish line the product. Treat everything else as reference material.
2. **Rebalance supplies vs. plans, skills, and people.** Supplies are about two-thirds of every list. Critics of the "get prepared" discourse note that kit-centric messaging favors people with money and space ([Blake, Marlowe & Johnston 2017](https://www.preventionweb.net/quick/46418)), and Aldrich's work puts resilience in social ties. Give "people and plans" equal visual weight with the bin, with its own progress bar and finish line.
3. **Design for the second session, not the first.** Pick one metric: the share of people who come back within 30 days and mark something done. Build the reminder sequence, deep links, and "what changed since last time" around it.
4. **Be the household's shared to-do list.** Per-person slots and names already exist. A household invite plus per-person "your part" views would turn the tool into a coordination device. That's also where norms operate.
5. **Distribute through trusted messengers.** NERT/CERT trainers, PTAs, tenant associations, faith groups, and ShakeOut events. A tool shared by a neighbor carries a norm with it, and a search result doesn't.

**How to test and measure (privacy-preserving):**
- **Qualitative first.** Run 8–10 moderated sessions across segments: a low-income renter, a Spanish- or Chinese-speaking household, an older adult who uses a power-dependent device, a parent of young kids, and a skeptic who "doesn't believe in this." Watch for the moment of overwhelm (likely the Level step and the first list scroll) and for what they say they'll actually do.
- **Aggregate, cookieless counts** (Plausible/GoatCounter, or a counter on a static endpoint): wizard start → finish by step, Start here items checked, calendar adds, exports, return visits. No answers, no identifiers.
- **Opt-in follow-up.** The 30-day calendar event links to a 3-question check-in ("Which of these did you do?"). Benchmark against the actions in FEMA's household survey.
- **Sequential A/B tests on behavior, not clicks:** Start here with vs. without a physical step, the full list vs. a core-tier default, and the if-then commitment screen vs. the current time window. Outcome: the share of people who check 3+ Start here items within 14 days.
- **Report honestly.** Self-reported preparedness is inflated, and RAND has argued that most citizen-preparedness assumptions are untested ([Uscher-Pines et al. 2012](https://www.rand.org/pubs/external_publications/EP201200137.html)). Measure specific actions, not "do you feel prepared."

---

## 7. Questions I'd ask the builder

1. Who is this for: people already motivated to prep who need a good list, or people who aren't? The answers lead to different products.
2. How will people find it, and who will they hear about it from?
3. Have you watched anyone use it from start to finish? Where did they slow down or stop?
4. What would count as success 90 days after someone builds a list, and how would you know?
5. Was budget meant to filter or reorder the list? Right now it does neither for most answers.
6. Why is the spreadsheet the primary action? What do you expect people to do with it?
7. Would you accept a "core 8" tier as the default view, even though it hides most of the content you've built?
8. Who reviews the medical and safety copy (insulin, oxygen, water treatment), and how often?
9. Are you willing to add a light reminder channel (calendar sequence, or opt-in email/SMS), given that a tool you use once mostly won't change behavior?
10. Is there a local partner (NERT, CERT, county OES, a library system) who would co-sign and distribute it?
