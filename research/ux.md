# UX Research: Bay Area Emergency Prep List Builder

Research date: October 2026
Scope: Wizard and questionnaire design, why people do or don't prepare, existing tools, how to present the results, tone, and accessibility. The doc ends with a concrete recommendation for the question flow, the results page, and design principles.

Bracketed numbers such as [3] refer to the Sources list at the end. Where a source was only seen second-hand (a search summary, press coverage, or a vendor claim), the text says so.

---

## TL;DR

- **Keep the basic path short and front-load value.** Survey drop-off rises fastest over the first ~15 questions and once a session passes about 7–8 minutes [5][6]. Aim for 7–8 question screens that take under 3 minutes.
- **One question per screen, with sensible pre-selected defaults, a "Not sure" option on every question where it is a real answer, and skip on anything sensitive** (GOV.UK [3][4], NN/g [1]).
- **The biggest barriers are cost (45%), not knowing where to start (28%), and time (25%)** [12]. FEMA finds that "preparedness efficacy" (believing that prep helps *and* that you can do it) is one of the strongest predictors of action, and only half of US adults have it [10]. The tool should build efficacy ("you already have most of this"), not fear.
- **Fear without efficacy backfires.** People respond to threats with denial or avoidance when they don't feel able to act [15][16][17]. Every hazard mention needs a concrete, doable action beside it.
- **Start with what people own.** SF's own guidance opens by saying most of what you need are household items you already have [21]. Pre-checking owned items also gives an "endowed progress" head start, which increases completion [27].
- **Present results as a staged plan** ("this weekend / this month / later") grouped by container, with Have / Need / Skip states, quantities computed for the household, rough costs, print and share. Advanced items sit behind a collapsed "Level up" section.
- **Best model to copy is Tokyo's "Bichiku Navi" stockpile tool**: 3 simple questions about household and home produce a quantified list that can be printed, shared, and tracked over time [24][25].

---

## 1. Questionnaire and wizard design that avoids overwhelm

### 1.1 When a wizard is the right pattern

NN/g defines a wizard as a fixed-order, step-by-step input flow where earlier answers decide which steps come next, and recommends it for **novices and infrequent tasks** like setup [1]. Building an emergency list is a textbook case: people do it once, maybe update it once a year, and most aren't experts.

Benefits NN/g lists: fewer fields per page reduce cognitive load, branching hides steps that don't apply, and simpler pages leave room for explanations [1]. Costs: repeat users find it slow, it's hard to compare across steps, and progress can be lost when interrupted [1].

NN/g recommendations to adopt directly [1]:
- Show progress with short, descriptive step labels.
- Explicit Back and Continue, with **back always working**.
- **Save state so users can leave and come back** (here: localStorage plus a shareable URL).
- Make each step self-contained, with help placed **beside** the field, not on top of it.
- Pre-fill smart defaults.

**Implication:** Offer an escape hatch for experts and the impatient: "Skip the questions, show me a starter list," plus an editable results page so people can change answers without walking back through the wizard.

### 1.2 One question per screen (GOV.UK)

GOV.UK's guidance is to **start with one thing per page**: one piece of information, one decision, or one question. Teams should combine questions only when user research shows it helps [2][3]. GDS research found one-question-per-page designs worked better for users than more complex forms, and dropped accordion forms as a result [3a]. The question pages pattern adds [4]:
- Use the question as the page `<h1>`/legend so screen readers announce it once.
- **Always include a Back link** and don't break the browser back button.
- Button label "Continue," left-aligned.
- Mark optional questions "(optional)" and never use asterisks.
- **Offer "I do not know" / "I'm not sure" where it is a valid answer.**
- Ask for each piece of information only once (also WCAG 3.3.7 Redundant Entry [33]).
- **Know why you are asking every question.** Caroline Jarrett's "question protocol" idea is to list every question, who uses the answer, and what for, and to cut any question whose answer changes nothing.
- Avoid range sliders.

**Grouping exceptions that make sense here:** Household composition (adults / kids / babies / pets) works as one screen of steppers, since it is one concept. Same for "Which of these do you already have?" as one tap-grid.

### 1.3 How many questions

- SurveyMonkey's analysis of 100,000 surveys found **drop-off is front-loaded**: each added question costs the most up to about 15 questions, and less per question after that [5].
- Abandonment rises noticeably for surveys that take **longer than about 7–8 minutes**, with completion falling 5–20% (SurveyMonkey, quoted second-hand) [6].
- Treat other widely repeated numbers (e.g., "62% abandon", Typeform's "3.5×") as unverified marketing claims [7].

**Target:** 6–8 screens and **under 3 minutes** for the basic path. That sits well inside the steep part of the curve and leaves a large margin under the 7-minute cliff. Tokyo's stockpile tool sells itself on **"three simple questions"** [25].

### 1.4 Conversational (Typeform-style) flows

Vendors claim much higher completion for one-at-a-time conversational forms. Third-party data is weaker: a Formstack analysis cited second-hand found multi-step forms completed about 25% more often than single-page ones, and several sources note that **very short forms see no benefit or even do worse** [7]. Take the useful parts:
- Large tap targets, one focus per screen, keyboard shortcuts (Enter to continue, 1–9 to pick).
- A friendly, human voice.
- **Avoid** fake chat bubbles and typing animations. They slow people down and add motion, which hurts accessibility. Content should be instant.

### 1.5 Progressive disclosure and branching

NN/g recommends showing the most important options first and moving advanced ones to a secondary screen. **Two levels is the practical maximum**; three or more tends to leave users lost [8]. Staged disclosure (a wizard) works when steps are fairly independent [8].

Applied here:
- Level 1 = Basics path. Level 2 = "Advanced" adds a handful of extra screens and items. No third level.
- Branching examples: skip go-bag-only questions if the user chose Stay bin only. Show the infant step only if babies > 0. Show the pet step only if pets > 0. Add the tsunami hazard only if the county has coastline.
- Preferred pattern: **"tune it later" on the results page.** Advanced refinements (home type, car, days of supply) can be edited in context on the results page instead of being forced into the wizard.

### 1.6 Progress indicators

The evidence is mixed. A meta-analysis of 32 experiments (Villar, Callegaro & Yang 2013) found **constant-rate progress bars had no meaningful effect** on completion, **fast-to-slow bars reduced drop-off, and slow-to-fast bars increased it** [9]. Other studies found bars help on short surveys but not long ones [9]. GOV.UK says to test without one first, and if you add one, use a simple "Question 3 of 8" and only show a total you can calculate reliably [4].

**Recommendation:** On a short flow, a simple "Step 3 of 8" with short labels is fine. Branching can change the total, so either compute it honestly or use section labels ("About your home · About your household · Your list"). Never let the total jump up mid-flow; that is the slow-to-fast pattern that increases drop-off.

### 1.7 Defaults, "Not sure," and skippability

- Pre-select defaults that are right for most Bay Area households: Earthquake + Power outage + Wildfire smoke always pre-checked, 1 adult, depth = Basics. NN/g recommends smart defaults [1], and defaults also signal a recommended path.
- Every question that a novice might not know (e.g., "Are you in a tsunami zone?") needs **"Not sure"**, which the tool resolves for them (a map link, or "we'll include the basics that cover it"). Survey research shows that offering "Don't know" raises its use by 5–30 points [32]. Here that is a **feature**: we would rather people move on than guess or quit. Map "Not sure" to a safe default and tell them what we assumed.
- Mark sensitive or non-essential questions "(optional)" and give them a visible "Skip" so nothing blocks progress.

### 1.8 Asking about household composition without being invasive

- Ask for **counts, not identities**: no names, genders, or exact ages. Tokyo's tool does ask gender and age bands to calculate items like sanitary products [25]. A simpler, less invasive approach is to infer nothing and offer "menstrual products" as an item people can include or skip.
- Ask about **life stages that change the list**: "Adults & teens," "Kids (2–12)," "Babies & toddlers (under 2)," plus pets by type. Count anyone **"you'd be looking after in an emergency"** rather than defining a family, since roommates, partners, a parent who stays over, or a neighbor you check on are all valid.
- Health and access needs: frame as **"things anyone relies on"** (daily medicines, power-dependent devices like CPAP or oxygen, mobility aids, glasses or hearing aids, special diets or formula). No diagnoses. Make it optional with "Prefer not to say" and explain why we ask ("so your list includes backups for these"). State plainly: **"Your answers stay on this device."**
- Census practice: define who counts in plain words on the page instead of assuming people share your definition of "household" [31].

---

## 2. Why people don't prepare, and what moves them

### 2.1 Barriers

| Barrier | Evidence |
|---|---|
| **Cost** | 45% name cost as the #1 barrier (United Way / Verizon survey, reported via PreventionWeb) [12]. FEMA 2023: socioeconomically disadvantaged people were **less likely to take higher-cost actions but about as likely to take low- or no-cost ones** [10][11]. |
| **Don't know where to start** | 28% [12]. FEMA's 2024 summary cites cost and "not knowing what to do" [11]. |
| **Time and competing priorities** | 25% cite lack of time [12]. A USGS ShakeAlert social scientist describes a "knowledge–behavior gap": people are busy managing more immediate threats [13]. |
| **Overwhelm and intimidation** | The SF72/IDEO team reported people found typical prep information **intimidating and overwhelming**, and that fear-based messaging didn't work (press coverage) [19][20]. |
| **Low efficacy and fatalism** | FEMA 2023: only **50%** believed prep helps *and* felt confident they could do it. Efficacy was lower among adults 60+ (39%), incomes under $25k (45%), and several racial groups [10]. An older SoCal study found 41% agreed "there is nothing I can do about earthquakes, so I don't try to prepare" [13]. |
| **Optimism and normalcy bias** | People judge rare events as less likely to happen to them. In California this is reinforced by trust in building codes [13]. |
| **Feeling prepared without acting** | FEMA found adults 60+ felt as prepared as younger adults but had taken fewer steps [10]. Self-rated readiness is not a reliable signal. |

### 2.2 What predicts action

**FEMA National Household Survey 2023** (n = 7,604) [10]. People with these factors were much more likely to take at least one of FEMA's 12 basic actions:
- **Preparedness efficacy:** 94% acted with high efficacy vs. 77% without.
- **Awareness of prep information:** 92% vs. 38%. People who were aware were **5×** as likely to take three or more actions.
- **Disaster experience:** 92% vs. 78%.
- **Risk perception:** 91% vs. 73%.

Also from FEMA 2023: "assembled or updated supplies" rose from 33% to 48%, but "signed up for alerts" **fell from 46% to 36%**. FEMA's recommendation is to remind people that prep is more than supplies and to **help them sign up for alerts in the moment** [10]. Least-common actions were planning with neighbors (12%) and community involvement (14%).

**Protective Action Decision Model (Lindell & Perry).** Whether people adopt a protective action depends on (a) hazard-related attributes (does it protect people and property, and is it useful for other things) and (b) **resource-related attributes: the perceived money, time, effort, knowledge, and skill required** [14]. The design lever is clear: reduce perceived cost and effort (start with owned items, show small steps, show prices) and highlight everyday usefulness ("a power bank and headlamp are handy anyway").

**Paton's social-cognitive model and Community Engagement Theory.** Positive outcome expectancy (believing your actions reduce harm) leads to engagement, and trust in the information source matters [18]. Replications are mixed, but "this helps, and here is why" consistently comes up.

**Social norms.** In a study of the 2020 Oregon wildfires, **descriptive norms (believing friends and neighbors are preparing) were the single strongest predictor** of preparedness actions, including assembling an evacuation kit (Siddiqi et al. 2023, *Disasters*) [22][23]. An online experiment found that a bare "neighbors do X" message didn't shift norm perceptions, while messages about what neighbors and trusted messengers **expect** did [23a]. Use norms carefully and honestly ("Lots of Bay Area households keep a stay bin"), and lean on **sharing with your household or neighbors** rather than invented statistics.

**Implementation intentions.** If-then plans that say when, where, and how ("This Saturday I'll put our flashlights, water, and first aid kit in the hall closet bin") reliably raise follow-through. A meta-analysis of 94 tests found d ≈ 0.65, and a 2024 update of 642 tests found larger effects when plans are if-then and rehearsed [28]. **Design lever:** end with "Pick a time for your first step" and offer an add-to-calendar file.

### 2.3 Messaging: what works and what backfires

- Fear appeals have small-to-moderate average effects (Tannenbaum et al. 2015 meta-analysis, 127 articles) [15]. The **Extended Parallel Process Model** predicts that high threat with low efficacy produces "fear control" (denial and avoidance) instead of action [16].
- A review of several meta-analyses concluded that **coping information (response efficacy and especially self-efficacy) matters more than raising fear** [17].
- SF72 was explicitly designed around **"positive preparedness"**: tapping networks and tools people already have, with real emergencies framed as "more like people coming together than cities falling apart" [19][20].
- Tokyo's stockpiling site frames prep as **"an extension of daily life"** and "everyday stockpiling," which it describes as easier to manage and sustain than special emergency gear [25].

**Rules for this tool:**
1. Never mention a hazard without a doable action next to it.
2. Lead with what the user already has and with small wins.
3. Show that steps work ("Water is the #1 thing people run short of after a quake").
4. Show low-cost and no-cost paths first.
5. Avoid catastrophe imagery, countdowns, and "the Big One is overdue" lines.

---

## 3. Existing tools to learn from

| Tool | What it does well | What it does badly / gaps |
|---|---|---|
| **SF72 → ReadySF (sf.gov/readysf)** [19][20][21] | SF72 (IDEO, ~2013) set the tone benchmark: warm, connection-first, "positive preparedness." ReadySF keeps a calm voice ("Stay ready, so you don't have to get ready"), offers 5 languages, and splits supplies into a **Stay Box (a week)** and **Go Bag (one per person)**, opening with "most of what you'll need… are everyday household items you already have." | sf72.org now redirects to sf.gov. Supplies are static PDF checklists with no personalization or quantities. Hazard content is spread across subpages. |
| **Ready.gov "Build a Kit"** [26] | Clear basic list, printable PDF, translations, maintenance and storage-location (home/work/car) guidance, "1 gallon per person per day." | One long undifferentiated list: the "Additional" section mixes infant, pets, documents, and clothing without labeled groups. Durations are vague ("several days"). No quantities for the household and no interactivity. |
| **Listos California** [29] | Five simple steps, including "Pack a Go Bag" and **"Build a Stay Box for when you can't leave."** Plain language, multilingual, built for under-served communities. Advice to "save a little at a time" addresses cost. | Static guide. Item lists vary between editions. |
| **Tokyo Bousai handbook** [24a][24b] | Bright yellow, illustrated, friendly mascot. Designed to be readable in about 30 minutes with deeper content for a week, and fun for kids. Includes a checklist and tips for using everyday items. Mailed to 8M households. | Print-first and long. Not personalized. |
| **Tokyo Bichiku Navi (stockpile tool)** [24][25] | **The closest model to this product.** "Three simple questions" (household size with age and gender, home type such as detached house vs. apartment, pets) produce a **quantified** list sized for about 3 days, with encouragement toward a week or more. Results can be **printed or shared** (LINE, email). A tracker records quantities and expiry dates, scores days covered, and shows what's missing. No personal info required. Uses everyday "rolling stock" framing. | Links to shopping sites can feel commercial. Asking gender is more invasive than needed. |
| **Japan "rolling stock"** [30] | Keep a bit extra of what you normally eat, eat the oldest, replace it. This avoids finding 3–5-year-old expired emergency food. It applies to non-food items too (diapers, contacts, regular medication). | n/a (concept). Use it for food and water advice and reminders. |
| **NZ Get Ready / Red Cross NZ "Good and Ready"** [34] | Explicitly says many items are probably already in the house and don't need to be in one place. Separates household supplies from a grab bag. Consumer NZ suggests adding a couple of items to your regular shopping until the kit is complete. | Mostly static lists. Official site blocked automated fetch, so details were seen second-hand. |
| **The Prepared (bug-out bag guide)** [35] | **Tiered levels** (Level 1 light and cheap → Level 3), each with a price range and weight cap. A "Customize" and an "Avoid" section per category. Kit builder can clone and share. Leaves out items you always have nearby (shoes, phone). | Very long and gear-heavy. Its blunt, expert voice suits enthusiasts, not the target audience here. |
| **Wirecutter** [36] | Says you can assemble a basic kit mostly from stuff you already own, and quotes the Red Cross saying "we almost overcomplicate these things." Separate shelter-in-place and go-bag guides. | Product review format with many links. Not a plan. |
| **FEMA app** [37] | Customizable kit checklist, family plan with meeting places, reminders, ZIP-based "Know Your Risk," alerts. | Generic national content. Checklist not computed for household. |
| **Red Cross Emergency app** [38] | 40+ alerts, offline content, "I'm Safe" family notification, wildfire plan feature, accessible. | Kit building is not the focus. |

**Patterns worth stealing:**
1. Tokyo's **question → quantified list → share/print → track over time** loop.
2. SF/Listos's two containers, **Stay Box vs Go Bag**, which match the user's mental model and this product's brief.
3. The Prepared's **levels with price ranges**.
4. SF/NZ/Wirecutter's **"you already have most of this."**
5. Rolling stock for food and water upkeep.
6. FEMA's insight: put the alert sign-up in the flow.

---

## 4. Presenting the resulting list

### 4.1 Grouping

- **Primary grouping: by container** (Stay bin, Go bag, plus optional Car, Work, or Everyday carry in Advanced). This matches how people will physically pack and how SF/Listos teach it [21][29].
- **Secondary grouping inside each container: by category** (Water · Food · Light & power · First aid & meds · Sanitation & hygiene · Documents & cash · Warmth & shelter · Tools · Pets · Baby). Ready.gov's unlabeled mixed list is the anti-pattern [26].
- **Alternate views** (tabs or toggle, same data):
  1. **Shopping list**: only "Need" items, deduplicated across containers, grouped by store type (grocery, hardware, pharmacy, online), with rough cost subtotals.
  2. **Plan**: items staged as *This weekend / This month / Later*.
- Show **why** each item is there with small hazard tags (e.g., "Quake · Outage") so users see that one item covers several hazards. This counters "it's too big."

### 4.2 Item states

Each item has three states: **Need** (default), **Have**, and **Skip / Not for us**.
- "Have" items stay visible but collapse to a single line (struck through or muted) so progress is visible.
- "Skip" items move into a collapsed "Skipped (3)" group, which respects autonomy without nagging.
- Items the user ticked in the "What do you already have?" step arrive pre-marked **Have**. That gives an **endowed-progress** head start: in the classic car-wash study, a 10-stamp card with 2 pre-filled was completed more often than an 8-stamp card starting at zero [27]. Only pre-fill from real answers; never fake it.

### 4.3 Quantities and costs

- Compute for household and duration. For example, water at 1 gal per person per day [26] gives "**2 adults + 1 kid, 7 days → 21 gal**," which is about **4 × 5-gal jugs or 9 cases of 24 × 16.9oz bottles**. Translate quantities into **purchase units**.
- Note the range across official sources: Listos says at least 3 days [29]; ReadySF says a week for the Stay Box [21]; SF's employee guidance says 5 days [21a]. Basics can target 3 days with an explicit "build toward a week" nudge, and Advanced 7–14 days.
- Pets: separate water and food lines per pet.
- Costs: show a **range** per item and a subtotal per stage ("This weekend: $0–30"). Label it "rough cost" and keep it brand-neutral. Lead with **$0 items** (gather, fill, store) to address the #1 barrier [12]. Avoid affiliate-feeling links in the main list. Optional "examples" can sit inside an item's detail.

### 4.4 Staged plan

Turn the list into a plan in three stages. This reflects FEMA's low-/no-cost finding [10], the implementation-intentions evidence [28], and the "add a couple items to your weekly shop" advice [34]:
- **This weekend (mostly free):** sign up for your county alert, gather what you already have into one bin or bag, fill and label water containers, put shoes and a flashlight by the bed, photograph your documents.
- **This month:** buy water/food for N days, first aid basics, N95 masks, a power bank, a radio.
- **Later / Level up:** advanced items, longer durations, car kit, rotation habits.

Add an **"Add to calendar"** (.ics) for the first step and a **6-month check-up** reminder (rotate water and food, check meds and batteries).

### 4.5 Making Advanced not feel overwhelming

- Basics list first. Advanced items sit in a collapsed **"Level up (12 more items)"** group under each container. Never interleave them.
- Use counts and time estimates instead of walls of items ("Level up adds 12 items, ~$150, ~1 hour of shopping").
- Let users switch Basics ↔ Advanced on the results page without losing their Have/Skip states.
- Two disclosure levels maximum [8].

### 4.6 Progress and gamification: helpful, not cheesy

- Do: a calm progress meter per container ("Stay bin: 14 of 22 ready") and **days covered** ("Water: 3 of 7 days"). Tokyo's "How many days of stockpiles do you have?" is a meaningful, real-world metric [24].
- Do: small, honest acknowledgments ("Stay bin basics done. Nice.").
- Don't: badges, streaks, confetti, points, leaderboards, or loss-framed nags. They trivialize the topic and add motion. If any celebration is used, keep it static and respect reduced motion.

### 4.7 Print, share, save

- **Print view:** black-and-white, checkboxes, grouped by container, fits on 1–2 pages for Basics. Include household summary, emergency contacts blank, and a QR or link back. Tokyo Bousai's own reviewers recommend keeping paper because power may be out [24a].
- **Share link:** encode answers and item states in the URL fragment (`#…`) so nothing is stored on a server and no account is needed. Copy, share sheet, or email/text. Sharing with household members also sets up the social-norms effect [22].
- **Save:** localStorage autosave with "Continue where you left off" (NN/g recommends save and resume [1]). Use try/catch, since storage can be unavailable.
- **Copy as text** for notes apps.

---

## 5. Tone and copy

**Voice:** calm, competent, warm, a little light. Think good neighbor who happens to know this stuff, not a drill sergeant or a doom prepper.

- **Positive preparedness:** emphasize connection and capability [19][20]. "Most of this is stuff you already have."
- **Efficacy-first:** pair every risk with an action [16][17].
- **Plain language:** CDC, AMA, and NIH recommend a 6th–8th grade reading level for public health information. CDC's health literacy guidance also suggests about 8–10 words per sentence, mostly 1–2 syllable words, and everyday synonyms for jargon [39]. Avoid "shelter-in-place," "PSPS," "WUI," and "potable" without a plain gloss. Examples: "Stay home safely (shelter in place)"; "Planned power shutoff (PSPS)."
- **Inclusive:** "people you look after," not "family." Pets are family. Use "Kids" not "children/dependents." Mention access and functional needs as normal, not special. Consider Spanish, Chinese (Traditional), Filipino, and Vietnamese, which are SF's own language set [21].
- **No judgment:** "Not yet" instead of "Missing." "Skip" instead of "Ignore." No "you should have done this already."
- **Short hints:** GOV.UK suggests one-sentence hints without links [4]. Longer "Why we ask" and "Good to know" content goes in an expandable `<details>`.
- **Honest uncertainty:** "Not sure? That's fine, we'll include the basics that cover it."

Microcopy examples:
- Welcome: "Let's build your emergency list. 8 quick questions, about 3 minutes. No sign-up. Your answers stay on your device."
- Hazard screen hint: "We've picked the common ones for your area. Change anything you like."
- Results header: "You're 35% of the way there already."
- Results empty or skip state: "Skipped items are tucked away here. Bring any back anytime."

---

## 6. Accessibility for a wizard

- **One `<form>` per step, with the question as `<h1>` and as `<legend>` or `<label>`.** GOV.UK makes the label the heading so screen readers hear it once [4].
- **Focus management on step change (SPA):** after rendering the new step, move focus to the step `<h1>` (with `tabindex="-1"`). Otherwise focus is stranded on a removed Continue button and keyboard and screen reader users land at the top with no cue [40]. Optionally add a polite live region ("Step 3 of 8: Who's in your household") that already exists in the DOM. Only move focus on real transitions [40].
- **Update `document.title`** per step ("Step 3 of 8: Household – Bay Prep"), and push history state so **browser Back works** [4].
- **Native controls:** radios and checkboxes inside `<fieldset>`; steppers as `<input type="number">` with visible −/+ buttons labeled "Remove one adult" / "Add one adult." No sliders [4].
- **Errors:** few are needed, since nearly everything has a default. If any occur, use a GOV.UK-style error summary at top plus inline messages, and move focus to the summary.
- **WCAG 2.2:**
  - 3.3.7 Redundant Entry: never re-ask; carry answers forward [33].
  - 2.4.11 Focus Not Obscured: sticky footers with a Continue button must not cover focused fields [41].
  - 2.5.8 Target Size: at least 24×24 CSS px; aim for 44+ on mobile [41].
  - 2.3.3 Animation from Interactions: honor `prefers-reduced-motion` and disable slide transitions between steps [41].
- **No time limits**, and save progress automatically.
- **Results page:** proper heading hierarchy (container h2, category h3). Each item is a labeled checkbox or segmented control with a visible text state, not just color. Collapsibles use `<details>/<summary>` or `aria-expanded`. Progress meters have text equivalents.
- **Print stylesheet** with real text (no background-image icons) and good contrast.
- **Cognitive accessibility:** one thing per page, plain language, consistent button placement, and an answers summary the user can edit.

---

## 7. CONCRETE RECOMMENDATION

### 7.1 Proposed question flow

**Basic path: welcome + 8 question screens + results. Under 3 minutes.** Every screen has Back, Continue, a "Step X of 8" label, an optional "Why we ask" disclosure, and a one-line **"Good to know"** tip that gives advice in context without adding screens. Answers autosave.

---

**Screen 0: Welcome** (not counted)
- H1: **"Let's build your emergency list"**
- Body: "Answer 8 quick questions (about 3 minutes) and get a list sized for your household, starting with what you already have. No sign-up. Your answers stay on this device."
- Primary: **Start**. Secondary link: **"Skip the questions, show me a starter list"** (defaults: 1 adult, Stay bin, Earthquake + Outage + Smoke, Basics; editable on the results page).
- If a saved session exists: **"Pick up where you left off"** / "Start over."

---

**Step 1: What are you building?** (required; default none)
- Question: **"What would you like to put together?"**
- Options (radio cards with a one-line description and a small illustration):
  - **Stay bin**: "Supplies to get through several days at home without power or water."
  - **Go bag**: "A grab-and-go bag in case you need to leave fast."
  - **Both**: "We'll start with the stay bin, then the go bag." *(recommended badge)*
  - **Not sure yet**: "We'll suggest one after a couple of questions."
- Good to know: "After an earthquake, most Bay Area households stay home. Wildfire or tsunami warnings are when people need to leave."
- Branching: "Not sure" is resolved after Step 3, with an inline suggestion card at the top of Step 4: "Our suggestion: Both. Start with a stay bin [and a go bag because you picked wildfire/tsunami]." Accept or change.

---

**Step 2: Where do you live?** (optional, skippable)
- Question: **"Which county do you live in?"**
- Options (radio list): Alameda, Contra Costa, Marin, Napa, San Francisco, San Mateo, Santa Clara, Santa Cruz, Solano, Sonoma, **Somewhere else / Not sure**, **Prefer not to say**.
- Hint: "We use this to pre-pick likely hazards and your local alert system."
- Good to know (after choosing, inline): "Sign up for **[AlertSF / AC Alert / SMC Alert / …]**, free texts about emergencies near you. *[Open sign-up in new tab]*" This puts FEMA's alert action in the moment [10] and surfaces it again on the results page.
- Advanced-only follow-up (optional): "Do you know if you're in a tsunami or wildfire evacuation zone?" Yes / No / Not sure → link to the county zone lookup.

---

**Step 3: Which situations do you want to prep for?** (required; pre-filled)
- Question: **"Which of these do you want to be ready for?"**
- Checkboxes, each with a 1-line plain description and hazard icon:
  - **Earthquake** *(pre-checked for everyone)*
  - **Power outage**, including planned shutoffs *(pre-checked)*
  - **Wildfire smoke** *(pre-checked)*
  - **Wildfire evacuation** *(pre-checked for Marin, Napa, Sonoma, Santa Cruz, and hill areas; otherwise unchecked)*
  - **Extreme heat** *(pre-checked for inland counties)*
  - **Flooding & winter storms**
  - **Tsunami** *(shown or pre-checked for coastal and bay-shore counties)*
  - **"Not sure, just pick the common ones for me"** *(selecting this restores the defaults)*
- Hint: "We've picked the common ones for your area. Most items cover several of these."
- Good to know: "One good kit covers most of these. Earthquake prep does a lot of the work."

---

**Step 4: Who are you prepping for?** (required; default 1 adult)
- Question: **"Who are you prepping for?"**
- Hint: "Count anyone you'd look after in an emergency: housemates, family, someone who stays over often."
- Steppers: **Adults & teens** [1] · **Kids (2–12)** [0] · **Babies & toddlers (under 2)** [0] · **Dogs** [0] · **Cats** [0] · **Other pets** [0]
- Why we ask: "So we can work out how much water and food you need. We don't ask for names or ages."
- Branching: babies > 0 adds baby items. Pets > 0 adds pet items. Go bag selected → "one go bag per person" note on results.

---

**Step 5: Does anyone rely on any of these?** (optional, clearly skippable)
- Question: **"Does anyone rely on any of these? (optional)"**
- Checkboxes:
  - Daily prescription medicine
  - A medical device that needs power (CPAP, oxygen, power wheelchair, etc.)
  - A mobility aid, or trouble with stairs
  - Glasses, contacts, or hearing aids
  - A special diet, food allergy, or baby formula
  - **None of these** (exclusive)
  - **Prefer not to say** (exclusive)
- Why we ask: "So your list includes backups, like a spare pair of glasses or a battery for a CPAP. This stays on your device."
- Branching: power-dependent device adds battery/power items to Basics (not Advanced) plus a tip to register for **PG&E Medical Baseline** / utility notification. Mobility adds "keep go bag light / near exit" guidance.

---

**Step 6: What do you already have?** (optional; the "start with what you have" step)
- Question: **"Tap anything you already have at home."**
- Hint: "It doesn't need to be packed yet. We'll count it and won't tell you to buy it again."
- Tap-grid (about 12 icon tiles, multi-select): Flashlight or headlamp · Spare batteries · Phone power bank · First aid kit · Bottled water or jugs · Canned or dry food · Manual can opener · N95 masks · Backpack or duffel · Plastic storage bin · Cash in small bills · Battery or crank radio
- Secondary: **"Skip, I'll check things off on my list."**
- Good to know (inline after ≥3 taps): "You're already off to a good start. Most kits are mostly everyday stuff."
- Effect: selected items are pre-marked **Have** on results (endowed progress [27]).

---

**Step 7: How far do you want to go?** (required; default Basics)
- Question: **"How much do you want to take on right now?"**
- Options (radio cards):
  - **Basics** *(selected by default)*: "The essentials that cover most situations. About 3 days of supplies. Mostly one weekend and a shopping trip." Show item count and rough cost range, computed live: "~20 items · ~$60–150."
  - **Advanced**: "More days of supplies (1–2 weeks), backups, and extra gear. A few more questions." "~45 items · ~$250–600."
- Hint: "You can level up anytime without starting over."
- Branching: **Advanced** inserts the Advanced screens A1–A4 (below) before Step 8. The step counter shows "Step 7 of 8 · plus 4 extra" so the total doesn't silently grow.

---

**Step 8: When do you want to start?** (optional)
- Question: **"When could you take your first step?"**
- Options: **This weekend** · **In the next couple of weeks** · **This month** · **Not sure yet**
- Optional second group on the same screen (grouped because it is one "pace" concept): **"Roughly what do you want to spend to start?"**: Use what I have first ($0) · Under $50 · $50–150 · $150+ · Not sure.
- Effect: the budget **doesn't remove items**. It sets how many paid items land in "This weekend / This month" vs "Later." The timing choice pre-fills the calendar reminder on results.
- Continue button label: **"Show my list"**

---

**Advanced-only screens** (inserted after Step 7; each skippable)
- **A1. Your home:** "What kind of home do you live in?" Apartment or condo (ask floor: ground / 2–4 / 5+) · House or townhouse · Other / varies. *Affects:* water storage form (cases vs jugs), stairs and elevator outage, gas shutoff wrench, fire extinguisher, securing furniture.
- **A2. How long?** "How many days do you want to cover at home?" 3 · 7 *(recommended)* · 14 · Not sure (→7).
- **A3. Getting around:** "Do you usually have a car?" Yes / No / Sometimes. Yes adds a **Car kit** container and "keep tank half full." No adds walking-evac notes and a lighter go bag.
- **A4. Cooking & power:** "If the power's out for days, how would you like to manage?" multi-select: Cook without power (camp stove) · Keep phones charged (power station/solar) · Keep medicine cold · Not sure, suggest options.

---

**Branching summary**
- Stay bin only → hide go-bag-only items and A3 go-bag notes.
- Go bag only → items sized per person, weight-aware, and Stay-bin-only items hidden (but offered in "Level up").
- Not sure (Step 1) → suggest after Step 3 (wildfire evacuation or tsunami selected → Both; else Stay bin first + go bag later).
- County → preselect hazards and alert link. "Prefer not to say" → generic defaults.
- Babies/pets > 0 → add categories. Health needs → add backups to Basics.
- Advanced → A1–A4.
- "Skip the questions" → defaults with a banner on results: "This is a starter list. *Personalize it* (8 questions)."

### 7.2 Proposed results page structure

1. **Header summary (sticky on desktop, collapsible on mobile)**
   "Your list: Stay bin + Go bag · 2 adults, 1 kid, 1 dog · Earthquake, Outage, Smoke · Basics" → **Edit answers** (opens inline edits, not the wizard).
2. **Progress strip**
   "You already have 7 of 22 items." Per container meters plus **days covered** for water and food ("Water: 1 of 3 days").
3. **"Start here" card (This weekend)**: 3–5 mostly free actions, each checkable:
   - Sign up for [county alert] (link)
   - Gather what you have into one bin in an easy-to-reach spot
   - Fill and label water containers
   - Put shoes + flashlight by each bed
   - Photograph IDs, insurance, and prescriptions
   - "**Add to calendar**" button for the user's chosen time (.ics)
4. **View switcher (tabs):** **By container** (default) · **Shopping list** · **Plan** (Weekend / Month / Later)
5. **Container sections** (Stay bin, Go bag, plus Car in Advanced). Each section includes:
   - Short purpose line plus "Where to keep it" tip.
   - Categories (h3) → item rows. Each row shows:
     - Item name + **computed quantity in purchase units** ("Water: 9 gal → 2 × 5-gal jugs")
     - State control: **Need / Have / Skip**
     - Hazard tags (Quake · Outage · Smoke)
     - Rough cost range
     - `<details>` "Tips" with why it matters, cheap alternatives, and what to look for, plus rolling-stock notes for food and water
   - **"Level up (N more items)"** collapsed group (Advanced items, or Advanced suggestions for Basics users).
   - "Skipped (N)" collapsed group.
6. **Shopping list view:** Need items only, deduplicated, grouped by store type, with subtotals and a "Copy list" button.
7. **Beyond supplies (short, 3–4 items):** a household plan (meeting spot, out-of-area contact), "check on a neighbor," secure heavy furniture, learn the gas shutoff. Keep it brief and linked out. FEMA notes prep is more than supplies [10].
8. **Keep it fresh:** "Set a 6-month check" (.ics), plus rolling-stock explanation ("eat the oldest, replace it").
9. **Actions bar:** **Print** · **Share link** · **Copy as text** · **Save** (autosaved) · **Switch to Advanced/Basics**
10. **Footer:** Sources (Ready.gov, ReadySF, Listos, county OES), last-reviewed date, privacy note ("Nothing is sent anywhere").

### 7.3 Design principles

1. **Start with what they have.** Every flow and list begins by counting what's already at home. Progress is never zero by design, but it is never faked either.
2. **One question per screen, under 3 minutes.** About 8 screens for Basics. Each question must change the list, or it gets cut (question protocol).
3. **Defaults do the work.** Pre-select sensible Bay Area defaults so that pressing Continue repeatedly still produces a good list.
4. **"Not sure" is always OK.** Offer it wherever it's a real answer, resolve it to a safe default, and say what was assumed.
5. **Optional means optional.** Sensitive questions (health, location) are labeled "(optional)," have "Prefer not to say," and explain why we ask.
6. **Efficacy over fear.** Never show a hazard without a doable action. No countdowns, disaster imagery, or "overdue" language.
7. **Small first step, then the rest.** Lead with a free "This weekend" card and an add-to-calendar prompt. Stage everything else into Month / Later.
8. **Basics first, depth on request.** Advanced content lives in collapsed "Level up" groups. Maximum two disclosure levels. Switching levels never loses progress.
9. **Concrete, computed, purchasable.** Quantities are calculated for the household and shown in store units. Costs are shown as rough ranges, with $0 options first.
10. **Organize the way people pack.** Group by container, then category. Offer a shopping view and a plan view of the same data.
11. **Calm, plain, inclusive voice.** Grade 6–8 reading level, short sentences, "people you look after," pets as family, no jargon without a gloss, no judgment ("Not yet," not "Missing").
12. **Private by default, no account.** State lives on the device and in the share link. Never ask for names, exact ages, or diagnoses.
13. **Paper-ready and shareable.** A 1–2 page B&W print view and a share link for household and neighbors, since social norms and conversation drive action.
14. **Accessible by construction.** Native form controls, the question as the heading, focus moved to the step heading on each change, working browser Back, reduced-motion respected, 24px+ targets, and no time limits.
15. **Build a habit, not a one-off.** Offer 6-month check-ups and rolling-stock advice so the kit stays fresh without becoming a project.

---

## Sources

1. NN/g, "Wizards: Definition and Design Recommendations." https://www.nngroup.com/articles/wizards/
2. GOV.UK Service Manual, "Structuring forms." https://www.gov.uk/service-manual/design/form-structure
3. GDS Design Notes, "One thing per page" (Tim Paul, 2015). https://designnotes.blog.gov.uk/2015/07/03/one-thing-per-page/
3a. GDS User Research blog, "No more accordions: how to choose a form structure." https://userresearch.blog.gov.uk/2015/08/13/no-more-accordions-how-to-choose-a-form-structure/
4. GOV.UK Design System, "Question pages" pattern. https://design-system.service.gov.uk/patterns/question-pages/
5. SurveyMonkey, "Does adding one more question impact survey completion rate?" https://www.surveymonkey.com/curiosity/survey_questions_and_completion_rates/
6. CustomerThink, citing SurveyMonkey on the 7–8-minute abandonment rise. https://customerthink.com/customer_feedback_could_we_improve_response_rates_by_adding_a_question/
7. Fomr, "Conversational form builder" (vendor; claims treated as directional). https://fomr.io/blog/conversational-form-builder
8. NN/g, "Progressive Disclosure." https://www.nngroup.com/articles/progressive-disclosure/
9. Villar, Callegaro & Yang (2013), "Where Am I? A Meta-Analysis of Experiments on the Effects of Progress Indicators for Web Surveys," *SSCR*. https://openaccess.city.ac.uk/id/eprint/14427/ ; Conrad et al. (2010). https://pmc.ncbi.nlm.nih.gov/articles/PMC2910434
10. FEMA, "2023 National Household Survey on Disaster Preparedness: Key Findings" (slide deck, hosted by Town of Slaughter Beach, DE). https://slaughterbeach.delaware.gov/files/2024/01/2023-National-Household-Survey1.pdf
11. Risk & Resilience Hub, summary of FEMA survey findings. https://riskandresiliencehub.com/are-americans-prepared-for-disasters-femas-survey-reveals-key-findings/ ; Disabled World summary of FEMA 2023. https://www.disabled-world.com/disability/emergency/fema-2023.php
12. United Way / Verizon preparedness survey, via PreventionWeb. https://www.preventionweb.net/quick/104562 ; United We Prepare. https://www.unitedway.org/our-impact/community-resiliency/disaster-preparedness
13. KCRW, "Many of us don't prepare for earthquakes, but why?" https://kcrw.com/news/shows/greater-la/turkey-communication/earthquakes-prepare ; NSF/NIST 1982 Southern California survey. https://nehrpsearch.nist.gov/static/files/NSF/PB82111279.pdf
14. Protective Action Decision Model applied to household preparedness (Lindell & Perry; e.g., NHESS 2023). https://nhess.copernicus.org/articles/23/3789/2023/ ; Applied Volcanology lahar study comparing PMT/PADM. https://link.springer.com/10.1186/s13617-017-0055-8
15. Tannenbaum et al. (2015), "Appealing to fear: A meta-analysis of fear appeal effectiveness and theories," *Psychological Bulletin*. https://pubmed.ncbi.nlm.nih.gov/26501228/
16. Extended Parallel Process Model (Witte). https://en.wikipedia.org/wiki/Extended_parallel_process_model
17. Ruiter, Kessels, Peters & Kok (2014), "Sixty years of fear appeal research: Current state of the evidence." https://cris.maastrichtuniversity.nl/portal/en/publications/sixty-years-of-fear-appeal-research-current-state-of-the-evidence(8373cfd0-195a-4016-956c-c8ce011c9059).html
18. Paton et al., social-cognitive preparedness model / Community Engagement Theory (NZ Natural Hazards Commission reports). https://www.naturalhazards.govt.nz/assets/Publications-Resources/1371-Developing-a-model-to-predict-the-adoption-of-natural-hazard-risk-reduction-and-prepatory-adjustments-compressed.pdf ; https://massey.ac.nz/%7Etrauma/issues/2024-1/AJDTS_28_1_Paton-Becker.pdf
19. IDEO, "Designing a city emergency plan" (SF72 case study). https://www.ideo.com/case-study/designing-a-city-emergency-plan
20. Intersector Project, "Creating a Culture of Disaster Preparedness in San Francisco." https://intersector.com/case/sf72_sanfrancisco/ ; Fast Company, "IDEO rebrands disaster preparedness." https://www.fastcompany.com/3031874/ideo-rebrands-disaster-preparedness
21. SF.gov, "Gather supplies: pack what you'll need for an emergency in San Francisco." https://www.sf.gov/gather-supplies-pack-what-youll-need-for-an-emergency-in-san-francisco ; ReadySF. https://www.sf.gov/readysf
21a. SF Dept. of Human Resources, Employee Home/Work/Vehicle Preparedness Checklists. https://sfdhr.org/sites/default/files/documents/DSW/Employee-Home-Work-Vehicle-Preparedness-Checklists.pdf
22. Oregon State University news, "Personal experience with wildfire increases engagement in disaster preparedness" (Siddiqi et al. 2023, *Disasters* 47(4)). https://news.oregonstate.edu/news/personal-experience-wildfire-increases-engagement-disaster-preparedness-osu-study-finds
23. NOAA repository copy of Siddiqi et al. (2023). https://repository.library.noaa.gov/view/noaa/64076
23a. UMD START, "Are you prepared for the next storm? Developing social norms messages…" https://start.umd.edu/publication/are-you-prepared-next-storm-developing-social-norms-messages-motivate-community-members
24. Tokyo Metropolitan Government, Tokyo Bichiku Navi results page. https://www.bichiku.metro.tokyo.lg.jp/en/tool/result/
24a. Spoon & Tamago, "Tokyo Bousai: Tokyo's New Disaster Preparedness Guide." https://spoon-tamago.com/tokyo-bousai-tokyos-new-disaster-preparedness-guide/
24b. NOSIGNER, Tokyo Bousai project page. https://nosigner.com/projects/bousai ; Dentsu-ho. https://dentsu-ho.com/en/articles/3394
25. Tokyo Bichiku Navi, "Why stockpile" (everyday stockpiling). https://www.bichiku.metro.tokyo.lg.jp/en/why/
26. Ready.gov, "Build A Kit." https://www.ready.gov/kit
27. Nunes & Drèze (2006), "The Endowed Progress Effect," *Journal of Consumer Research* 32(4). Summary: https://en.wikipedia.org/wiki/Goal_pursuit
28. Gollwitzer & Sheeran (2006) and Sheeran, Listrom & Gollwitzer (2024) on implementation intentions; overview: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.565202/pdf
29. Listos California Disaster Ready Guide (hosted copy). https://sclarc.org/SCLARC-Updates/Dept/Executive/DisasterReadyGuide_Print_EN.pdf ; Cal OES. https://www.news.caloes.ca.gov/disasters-can-happen-at-any-moment-are-you-prepared/ ; Oakland. https://www.oaklandca.gov/Public-Safety-Streets/Fire/EMSD/Ready-Oakland/Be-Prepared-and-Involved
30. Mie University, Disaster prevention guideline: "Key Supplies" (rolling stock). https://www.mie-u.ac.jp/bosai/guideline/key-supplies.html ; Second Harvest Japan. https://2hj.org/english/report/482
31. Scotland's Census 2022 household questionnaire. https://www.scotlandscensus.gov.uk/media/mecf4qa4/scotlands-census-2022-household-questionnaire.pdf ; Typeform household verification template guidance. https://www.typeform.com/templates/household-verification-form
32. Pew Research Center, "How adding a 'Don't know' response option can affect cross-national survey results." https://www.pewresearch.org/decoded/2023/09/06/how-adding-a-dont-know-response-option-can-affect-cross-national-survey-results/ ; SAGE Encyclopedia, "Don't knows." https://sk.sagepub.com/ency/edvol/embed/survey/chpt/dont-knows-dks
33. W3C, "Understanding SC 3.3.7: Redundant Entry." https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html
34. Red Cross NZ "Good and Ready." https://redcross.org.nz/hazard-app ; Consumer NZ, "How to make a home emergency kit." https://www.consumer.org.nz/articles/how-to-make-a-home-emergency-kit ; Get Ready NZ. https://getready.govt.nz/
35. The Prepared, "Bug out bag list." https://theprepared.com/bug-out-bags/guides/bug-out-bag-list/
36. Wirecutter, emergency preparedness supplies (excerpted via Sawyer). https://www.sawyer.com/blog/ny-times-the-best-emergency-preparedness-supplies
37. FEMA app overview (PCWorld). https://www.pcworld.com/article/399018/5-apps-to-prepare-you-for-any-emergency.html
38. American Red Cross, "Emergency App enhanced to help you be ready" (2023). https://redcross.org/about-us/news-and-events/news/2023/emergency-app-enhanced-to-help-you-be-ready-should-a-crisis-occur.html
39. Mishra & Dexter (2020), readability of COVID-19 websites vs. CDC/NIH grade 6–8 guidance, *JAMA Network Open*. https://pmc.ncbi.nlm.nih.gov/articles/PMC7435342 ; CDC Clear Communication Index. https://www.cdc.gov/ccindex/
40. "Accessible multi-step wizard forms" (focus management). https://ezud.com/accessible-multi-step-wizard-forms/ ; WebAIM discussion. https://webaim.org/discussion/mail_message?id=29506
41. Deque, "WCAG 2.2 Updates" (2.4.11, 2.5.8). https://dequeuniversity.com/resources/wcag-2.2 ; W3C, Understanding 2.3.3 Animation from Interactions. https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html

### Research caveats
- The FEMA 2023 figures come from FEMA's own key-findings deck (hosted by a Delaware town). The 2024 findings were only seen via secondary summaries.
- The United Way/Verizon survey methodology (sample size) was not available.
- Typeform and other completion-rate uplift claims are vendor-sourced.
- Getready.govt.nz, Fast Company, and the Wayback archive of sf72.org could not be fetched directly. Claims about them rely on search excerpts and press coverage.
- Bay Area hazard preselection by county (Step 3) is a UX proposal. The actual county-to-hazard mapping should come from the content/hazard research track (Cal OES / USGS / CAL FIRE zone data).
