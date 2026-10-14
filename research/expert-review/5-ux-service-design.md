# Bay Ready: UX and service design review

Reviewer lens: government digital services (GOV.UK / USDS / 18F / CfA style). Based on the code at `/Users/jeremy/dev/bay-emergency-prep`, the three screenshots, the 11-page sample PDF, and `sample-lists.txt`. I didn't run any user sessions. Severity tags are my own judgment.

## 1. Verdict

This is better than most civic prep tools I've reviewed. The content is careful and local, the tone builds confidence instead of fear, the wizard follows GOV.UK question-page rules, and the accessibility basics are clearly deliberate. But the results page takes everything that care produced and puts all of it on one screen. A "Basics" list runs 45 to 128 items. The PDF is 11 pages. The biggest button on the page downloads an Excel file. The one thing a stressed, busy person needs ("do these 3 things this weekend") sits below the fold on a phone. The other serious gap is what happens after people leave. All data lives in `localStorage`, Safari can wipe it after a week, and the 6-month reminder links to a page that will then say "You haven't built a list yet." The wizard is good. The results page and the return visit need a redesign before this goes in front of the public.

## 2. What works

- **Tone and framing.** "It starts with what you already have," the "Tap anything you already have" step, "Good to know" asides, and "You don't have to do this alone" all build efficacy, which is the right goal (`research/ux.md` §2). Hazards are paired with actions, never with scare copy.
- **Wizard mechanics.** Each step has its own URL and page title (`src/components/wizard/steps.ts`), focus moves to the H1 on step change (`Wizard.tsx`), the browser Back button works, every step has a default, and "Why we ask" uses `<details>`. Optional steps say "(optional)" and offer Skip. "Prefer not to say" on county and needs is respectful.
- **"Not sure" handled well.** "Not sure yet" on kit type becomes a reasoned suggestion ("You picked a hazard where people may need to leave quickly…"). County sets default hazards, with a "Go back to our suggestions" reset.
- **Editable answer badges** on the list (`ListView.tsx` `AnswerBadge`) give a lightweight "check your answers" pattern, plus a "Back to my list" shortcut in the wizard.
- **Local, specific content.** It names the right alert system for each county (AC Alert, AlertSF…), covers PG&E Medical Baseline, uses EBMUD bleach doses, KCBS/KQED, the HayWired outage numbers, and covers renters ("Where something is usually the landlord's job, your list will say so").
- **Real quantities.** "25 gallons" is much more actionable than "water." The "start with 3 gallons" fallback is a good touch.
- **Paper-first thinking.** Know your home prints at the front of the PDF, the "When it happens" card is meant to be taped inside the lid, there's a printed refresh log, and there's an OK/HELP window sign. Good instincts for a scenario with no power.
- **Typography and contrast.** Atkinson Hyperlegible, 17px body text, and text contrast that passes everywhere I checked (ink-soft on fog 6.1:1, white on orange 5.7:1, dark-mode ink-soft 8.7:1). Reduced motion is respected, including the "flash" effect.
- **Privacy.** No accounts, data kept in the URL fragment, and Know your home is left out of share links with a clear explanation.

## 3. Top problems, ranked

### 3.1 CRITICAL: The results page is one very long page with no clear priority, and "Basics" isn't basic
- **What's wrong:** On a phone, the first screen shows a heading, 5 answer badges spread over 3 rows, a Level toggle, 3 empty progress bars ("0 of 23 ready"), and 5 export buttons. "Start here this weekend" only starts at the very bottom (`list-top.jpg`). After that, the page has a neighbors paragraph, a view switcher, every kit, the "When it happens" card, Know your home, and Keep it fresh.
- **Evidence:** In `sample-lists.txt`, a solo renter on Basics gets **45 items (+27 level-up)**. A family on Basics gets **91 (+41)**. An Advanced couple gets **128**. The PDF for a 3-person Basics household is **11 pages**. The builder's own research aimed for a printout that "fits on 1–2 pages for Basics" (`research/ux.md` §4.7).
- **Why it matters:** The builder's own research lists the top barriers as cost, not knowing where to start, and time. A 91-row list plus three bars at "0 of 23" undercuts all three. Opening with empty progress bars tells people they're at zero, which is the opposite of the endowed-progress effect the wizard set up.
- **Fix:** Rebuild the page around one job: **"Your next step."** Put the Start here card directly under the H1, with a single primary button. Collapse the answer badges into one line ("For 2 adults, 1 kid, 1 dog · Alameda · Edit"). Move the progress bars below the fold, or show them only once something is checked. Present kits as collapsed sections that show a count and cost ("Stay-at-home bin · 23 things · ~$420–860 ›"). Within a kit, show the top 10 essentials first and put "Also useful" behind a disclosure. Rename Basics so it describes a size, and cap it at what a person can finish in about a month.

### 3.2 CRITICAL: Saved progress quietly disappears, and return visits fail
- **What's wrong:** Answers, checkmarks, and Know your home are stored only in `localStorage` (`src/lib/storage.ts`). Safari deletes script-written storage after 7 days of browsing without a visit to the site ([WebKit](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/)). The 6-month reminder and the Start here calendar event both link to bare `siteUrl("/list")`, not the share link (`ListView.tsx` `sixMonthCheck`, `StartHere`). An iPhone user who follows the reminder will most likely land on "You haven't built a list yet," and their Know your home notes are lost for good.
- **More evidence:** The share link is a snapshot, so two adults in one household immediately get out of sync. "Make it my list" on a shared link replaces the recipient's own list with no warning (`ListView.tsx`, shared banner). The PDF's "Open this list online" link opens your own list in the "You're looking at a list someone shared" state.
- **Why it matters:** Prep takes months. A tool that forgets you after a week loses people right when habit-building should start, and it fails the "what happens after people leave" test.
- **Fix:** (a) Put the full share link in every calendar event and the PDF, and label it "Your list link. Save it." (b) After the first checkmark, show a one-time "Save your list" sheet with three choices: Copy link, Email it to myself (`mailto:`, no server), Add to Home Screen. Home-screen web apps are exempt from Safari's cap. (c) Before "Make it my list" overwrites anything, say "This replaces the list saved on this device." (d) Change the empty state to: "Made a list before? It may have been cleared from this browser. Open your saved link or PDF to bring it back." (e) Separately, decide whether household sync is worth a small backend. If it isn't, say so in the UI.

### 3.3 MAJOR: Too many ways to save, share, and print, and the wrong one is primary
- **What's wrong:** There are 5 export buttons (Copy share link, Copy as text, Print, Download PDF, Download spreadsheet). The page also has Print this card, Print this info, Print these for your kit, Print the refresh log, two Add to calendar menus, Copy shopping list, and the OK/HELP sign. "Print" and "Download PDF" produce the same 11-page PDF. **Download spreadsheet is the only filled orange button**, so it's styled as the main action on a page meant for phones.
- **Why it matters:** Most people will be on phones, where an .xlsx file opens badly or not at all. Every extra equal-weight button makes "Start here" weaker. Once the spreadsheet is downloaded, it drifts out of sync with the web list.
- **Fix:** Use one "Save or share" button that opens a sheet. Lead with **Send to someone** (share link through the native share sheet) and **Print or save PDF**, then put the spreadsheet under "More: spreadsheet for planning with your household; copy as text." Make Start here the only orange element on the page. Make Print produce a short printout (Know your home, When it happens, and a 1–2 page checklist), and offer the full 11 pages as an option.

### 3.4 MAJOR: The wizard asks questions that change little, and some pages ask more than one
- **Evidence:** Budget barely affects the list. In `buildList.ts`, "$0" moves paid items out of the weekend stage, and the "more" branch is a no-op. The solo renter who picked "Under $50" got about $285–640 with no acknowledgment. Car only creates a kit at Advanced (`answers.ts`), but it's asked of everyone. Basics has 10 steps and Advanced 12, against the builder's own target of 7–8 (`research/ux.md` TL;DR). The household page holds 6 steppers, a Names section, and sometimes the "Our suggestion" box. The last page asks two questions (when to start, and budget). The counter jumps from "of 10" to "of 12" at step 9. Continue is disabled with no explanation on the kit and hazards steps.
- **Why it matters:** GOV.UK's default is [one question per page](https://design-system.service.gov.uk/patterns/question-pages/), and Caroline Jarrett's question protocol, quoted in the builder's own notes, says to cut any question whose answer changes nothing. Asking about budget and then ignoring it erodes trust. A disabled button with no message is a known accessibility problem.
- **Fix:** Cut to about 6 screens: kit, county (which sets hazards), household, health needs, what you have, size. Show hazards on a "Check your answers" page ([GOV.UK pattern](https://design-system.service.gov.uk/patterns/check-answers/)) rather than as a step. Ask home type, car, and power where they matter on the list ("Live in an apartment? Tell us so we can adjust 4 items"). Either make budget actually filter what's shown first ("Your first $50: …") or drop it. Keep Continue enabled and show an inline error. Ask Names after the list, when per-person bags show up.

### 3.5 MAJOR: Each row has too many controls, and "have it" is all-or-nothing
- **What's wrong:** A single row can contain a checkbox, name chips, an "Edit names" link that only appears on hover, a Skip button, a "Why this" disclosure, an external link, and inline text fields (`ItemRow.tsx`, `TaskFacts`). Quantities are binary. Ticking "Bottled water or jugs" in the wizard marks **"Drinking water: 7 gallons"** as done (`sample-lists.txt`, persona A), even if the person owns a 6-pack.
- **Why it matters:** This can overstate how ready someone is, and water is the item that matters most. A dense row is also slow to scan on a 375px screen.
- **Fix:** For quantity items, replace the checkbox with a small "Have: 0 / 3 / 7 gallons" step control, or split water into milestones ("3 days → 7 days"). The wizard's "have" answers should pre-fill "some" rather than "all." Put Skip in an overflow menu or long-press, and make Edit names always visible.

### 3.6 MAJOR: Weak trust and credibility signals, and one contradiction in the sources
- **What's wrong:** Nothing says who made this, whether it's official, when the content was last reviewed, or how to report an error. The look (navy, red-orange tag, plain language) reads as a government site. The Sources page says "When agencies disagree… we pick the more careful number," then quotes EBMUD's **2 gallons per person per day**, while the app uses **1** (`about/page.tsx` versus `items.ts` `water`).
- **Fix:** Add an About block: who built it, "Not affiliated with any county or agency," "Content last reviewed: [month year]," and a feedback link. Resolve the water number, or explain the choice in the item's "Why this."

### 3.7 MAJOR: English only
The Bay Area's alert systems, ReadySF, and Listos California all publish in several languages. The builder's own research recommends SF's language set: Spanish, Chinese, Filipino, Vietnamese (`research/ux.md` §5). Households with limited English face higher disaster risk. **Fix:** Translate the item content and the "When it happens" card first, since those get printed and taped up. Machine translation reviewed by community partners is enough for v1.

### 3.8 MAJOR: Accessibility gaps
- **PDF is untagged.** jsPDF output has no `/StructTreeRoot` or `/Lang` (checked in `sample.pdf`), and the main "Print" button goes through that PDF. Screen-reader users get unstructured text. See [GDS on HTML vs PDF](https://gds.blog.gov.uk/2018/07/16/why-gov-uk-content-should-be-published-in-html-and-not-pdf/). **Fix:** Make Print use the page's own print stylesheet, which already exists in `globals.css`, and keep the PDF as an extra.
- **Non-text contrast ([WCAG 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast)).** Text inputs in Know your home, the notes box, and the share-link field use `border-line` (#c8d3d8 on white = **1.53:1**). They need 3:1. The answer badges use the same border with a 50%-opacity pencil, so they barely look clickable.
- **Disabled Continue** at 40% opacity with no message (see 3.4).
- **Hydration flash.** `StartActions` renders "Start" and then switches to "Open my list" for returning users. The list and wizard pages show an empty `aria-busy` block until JavaScript loads, which matters on slow phones.
- **Targets.** Mostly fine under [WCAG 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), since the item name is also a label for the 20px checkbox. The 0.88rem Skip text button is borderline.

### 3.9 MAJOR: Labels need plainer names
| Current | Problem | Suggest |
|---|---|---|
| Basics / Advanced | "Advanced" sounds like a skill level, but it means 2 weeks plus extra gear | "1 week" / "2 weeks + extras" |
| Around the house | Vague. Its progress says "done" while the others say "ready" | "To-dos" |
| Level up | Game jargon | "When you're ready: 27 more" |
| Know your home | Reasonable, but it's really your emergency info sheet | "Your emergency info" |
| Keep it fresh | Cute, unclear | "Check your kit twice a year" |
| Stay-at-home bin | Fine. ReadySF says "Stay Box," so consider matching the agency term | "Stay-at-home kit" |
| Step by step (view) | Clashes with the wizard's "Step 3 of 10" | "By week" |

### 3.10 MINOR: "When it happens" is buried, and its content doesn't always match the household
The most important card for the day of an emergency sits after all the kit sections. For the stay-only renter it still says "take your go bags and leave," and it has no smoke guidance even though smoke was chosen (`sample-lists.txt`, persona A). **Fix:** Link it from the top of the page ("If it's happening now →") and filter its lines by kit and hazard.

## 4. What's missing

- **An "it's happening now" path.** Someone will open this during a quake or an evacuation warning. The home page needs a small link to the first-hour card, 911/211, and county alerts.
- **A finish line.** Progress counts items, not outcomes. Tell people what they can now handle: "You could get through about 3 days without tap water." That's an efficacy message and a natural place to celebrate.
- **Household collaboration** (see 3.2), at minimum a clear explanation that each phone keeps its own copy.
- **Feedback channel, version or date, and an "about us" section.**
- **Shopping mode.** The Shopping list view has no checkboxes, so people can't tick items off in the store, which is the most likely phone use.
- **Restore from backup.** The spreadsheet and PDF can't be loaded back in.
- **Content for renters in big buildings and people without a car.** It exists, but nothing surfaces it. Show "Tailored for you: apartment, no car" on the list so people can see the personalization.
- **Language selector** (see 3.7).

## 5. Inconsistencies and bugs

1. The home page sample shows rows that don't exist in real lists: "Food you don't have to cook" and "Pet food and water." Real lists split food into 6 rows and call the pet item "Pet food." The 5-row sample also makes people expect a much shorter list.
2. Basics is described as "a week… as Bay Area agencies recommend," but the Advanced days step pre-selects 14 days and badges it "Recommended."
3. The Sources page says it picks "the more careful number," but the app uses 1 gallon per person per day while EBMUD says 2.
4. Budget answers "$50 to $150" and "Under $50" have no effect (`buildList.ts` lines 70–71). The "more" branch is a no-op.
5. The "When it happens" card mentions go bags to households without one. The building-plan tip says "Keep your go bag by the door" to a stay-only renter.
6. In persona B, kids get "Phone power bank," "Prescription medicine," and "Contacts…" rows in their refresh logs because an adult needs them.
7. The Plan view numbers stages from the array index, so an empty stage makes the numbers skip ("Step 2" first). It also shows level-up items to Basics users, while the kit view hides them, so counts differ between views.
8. With a start answer other than "this weekend," the heading reads "Start here first."
9. The hazards hint "We've picked the common ones for Alameda County" stays after the user changes the picks.
10. The step counter changes from "of 10" to "of 12" at step 9.
11. In shared-link view, checkboxes work but nothing is saved. Work is lost on reload, and the only warning is a sentence in the banner.
12. The PDF mixes portrait and landscape pages. Page 11 holds 3 rows on an otherwise blank landscape page. Each person's refresh log has 5 check columns, which is 2.5 years at 6-month checks.
13. `globals.css` supports `[data-theme]`, but no theme toggle exists.
14. "Start here… These are free and take about an hour" is the same text no matter which 6 steps are chosen. "Keep shoes, a flashlight, and a whistle by every bed" isn't free if you don't own a whistle.

## 6. Bigger-picture redesign and testing plan

**Treat it as a service, not a list.** The list is one step in a journey:

1. **Home:** "Get a prep plan for your household in 3 minutes," with a small "Emergency happening now?" link.
2. **About 6 questions,** then a **Check your answers** page.
3. **Your plan:** one screen that leads with "This weekend: 3 free things" (big checkboxes and Add to calendar), then "This month: one shopping trip (~$X)," then "When you're ready." Kits are reference sections, not the main view.
4. **Save it:** after the first checkmark, a prompt to save the link, email it to yourself, or add to home screen.
5. **Come back:** a calendar reminder that carries the full link. On return: "Welcome back. 2 things due for a check."
6. **Print pack:** Know your home, When it happens, and the OK/HELP sign, about 3 pages. The full list and refresh log are optional.

Also consider an installable PWA, which survives Safari's cap and works offline when the network is down. That fits the scenario better than a PDF.

**Lightweight testing plan (2 weeks, about $1–2k in incentives):**
- **Who:** 8 Bay Area residents, all on their own phones. Include 2 renters in buildings of 5+ floors, a parent with young kids, someone 70+, a person with a disability or a powered medical device, and 2 people whose first language is Spanish or Cantonese. Recruit through a CERT/NERT group, a library, or a tenants' union.
- **Session (40 min, remote or in person):** Build your list. "What would you do first?" (first-click test on the results page.) Mark that you have some water but not all of it. Send the list to your partner. Find what to do right after a quake. Think aloud the whole time.
- **Follow-up:** Text them 7 days later: "What did you do? Open your list." This measures action and checks whether their data survived.
- **Measure:** time to the first meaningful action, whether they found Start here without help, whether they understood Basics/Advanced, how many tried the spreadsheet on a phone, and how many still had their data at day 7.
- **Accessibility pass:** VoiceOver on iOS and TalkBack through the wizard and list. Run axe and check contrast. Run the PDF through PAC.

## 7. Questions for the builder

1. Who is this for, specifically? People who have never prepared at all, or people halfway there? The answer changes how long Basics should be.
2. What does success look like: lists built, Start here steps done, or kits finished? Without analytics, how will you know?
3. Which export do you expect people to actually use? Why is the spreadsheet primary?
4. Is there a plan for households where two people want to check off items together?
5. Who reviews the content, and how often? Has anyone from a county Office of Emergency Services or NERT read it?
6. Why 1 gallon of water when EBMUD says 2?
7. What should the budget answer do?
8. Can you partner with a county or community organization? That solves trust, translation, and distribution together.
9. Have you opened the site on an iPhone after a week away?

## Sources

- GOV.UK Design System, Question pages: https://design-system.service.gov.uk/patterns/question-pages/
- GOV.UK Design System, Check answers: https://design-system.service.gov.uk/patterns/check-answers/
- DWP Accessibility Manual, interaction design (one thing per page): https://accessibility-manual.dwp.gov.uk/guidance-for-your-job-role/interaction-designer
- Nielsen Norman Group, Wizards: https://www.nngroup.com/articles/wizards/
- W3C, Understanding WCAG 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast
- W3C, Understanding WCAG 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- WebKit, 7-day cap on script-writeable storage: https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/
- GDS, Why GOV.UK content should be published in HTML and not PDF: https://gds.blog.gov.uk/2018/07/16/why-gov-uk-content-should-be-published-in-html-and-not-pdf/
- Cal OES / Listos California multilingual materials: https://www.caloes.ca.gov/wp-content/uploads/2023/12/PPT-FireandRescueBriefing-1.pdf and https://www.listoscalifornia.org
- The builder's own notes: `research/ux.md` (7–8 screens target, 1–2 page printout, language set, question protocol)
