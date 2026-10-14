"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { ANSWERS_KEY, EMPTY_ANSWERS, deriveContext, defaultHazards, normalizeAnswers, suggestBuild } from "@/lib/answers";
import { buildList, formatCost, sumCost } from "@/lib/buildList";
import { useStored } from "@/lib/storage";
import type { Answers, HazardId, NeedId } from "@/lib/types";
import { COUNTIES, COUNTY_BY_ID } from "@/data/counties";
import { HAZARDS } from "@/data/hazards";
import { HAVE_PICKS } from "@/data/havePicks";
import { ITEMS } from "@/data/items";
import { lookupZip } from "@/data/zips";
import { ADVANCED_STEPS, LAST_STEP, MAIN_STEPS, STEP_TITLES, type StepId } from "./steps";
import { ZipField } from "./ZipField";
import { CheckList, ExternalLink, GoodToKnow, RadioCards, Stepper, Button } from "@/components/controls";
import { NamesEditor } from "@/components/NamesEditor";
import { useReturnToList } from "@/lib/returnToList";
import Link from "next/link";

function stepsFor(a: Answers): StepId[] {
  return [...MAIN_STEPS, ...(a.level === "advanced" ? ADVANCED_STEPS : []), LAST_STEP];
}

function sameSet<T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

/**
 * A new county or ZIP code. Hazards follow the new suggestions unless the person
 * already changed them from the old ones.
 */
function relocate(prev: Answers, next: Pick<Answers, "county" | "zip">): Partial<Answers> {
  const customized = prev.hazards.length > 0 && !sameSet(prev.hazards, defaultHazards(prev.county, prev.zip));
  return { ...next, ...(customized ? {} : { hazards: defaultHazards(next.county, next.zip) }) };
}

type Update = (patch: Partial<Answers> | ((prev: Answers) => Partial<Answers>)) => void;

interface StepView {
  hint?: ReactNode;
  why?: ReactNode;
  optional?: boolean;
  body: ReactNode;
  tip?: ReactNode;
  /** Why the step can't be finished yet. Shown, tied to the field, when someone presses Continue. */
  error?: string;
  continueLabel?: string;
}

const ERROR_ID = "step-error";

export function Wizard() {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const [answers, setAnswers] = useStored<Answers>(ANSWERS_KEY, EMPTY_ANSWERS, normalizeAnswers);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  // Set when someone jumped here from their list to change one answer.
  const returnToList = useReturnToList();
  const pushes = useRef(0);
  const lastStep = useRef<StepId | null>(null);
  // The step where someone pressed Continue before answering.
  const [errorStep, setErrorStep] = useState<StepId | null>(null);

  const a = answers ?? EMPTY_ANSWERS;
  const steps = stepsFor(a);
  const requested = segment as StepId | null;
  const step: StepId = requested && steps.includes(requested) ? requested : steps[0];
  const index = steps.indexOf(step);

  useEffect(() => {
    if (!answers) return;
    // Move focus only on real step changes, not on first load.
    if (lastStep.current && lastStep.current !== step) headingRef.current?.focus();
    lastStep.current = step;
  }, [answers, step]);

  // Updates read the latest saved answers, so quick taps never overwrite each other.
  const update: Update = (patch) =>
    setAnswers((prev) => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));

  const go = (to: StepId | "list") => {
    pushes.current += 1;
    router.push(to === "list" ? "/list" : `/build/${to}`);
  };

  const next = () => {
    // Fill in hazards once the county is known, unless the user already customized them.
    if (step === "county" && a.hazards.length === 0) update({ hazards: defaultHazards(a.county, a.zip) });
    if (step === LAST_STEP) return go("list");
    go(steps[index + 1]);
  };

  const back = () => {
    if (index === 0) return router.push("/");
    if (pushes.current > 0) {
      pushes.current -= 1;
      router.back();
    } else {
      router.replace(`/build/${steps[index - 1]}`);
    }
  };

  if (!answers) return <div className="min-h-[60vh]" aria-busy="true" />;

  const view = renderStep(step, a, update);
  const error = errorStep === step ? view.error : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-4 sm:px-6">
      <Progress step={step} steps={steps} />
      <form
        key={step}
        className="step-enter mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (view.error) {
            // Say what's missing next to the question, and put the person on its first option.
            setErrorStep(step);
            bodyRef.current?.querySelector("input")?.focus();
            return;
          }
          next();
        }}
      >
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-[1.9rem] font-extrabold leading-[1.15] tracking-[-0.02em] outline-none sm:text-[2.3rem]"
        >
          {STEP_TITLES[step]}
          {view.optional && <span className="ml-2 align-middle text-base font-normal text-ink-soft">(optional)</span>}
        </h1>
        {view.hint && <p className="mt-3 max-w-[60ch] text-ink-soft">{view.hint}</p>}
        {error && (
          <p id={ERROR_ID} className="mt-4 flex items-start gap-2 font-semibold text-orange">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-orange text-[0.8rem] font-bold text-orange-ink"
            >
              !
            </span>
            {error}
          </p>
        )}
        <div ref={bodyRef} className="mt-6">
          {view.body}
        </div>
        {view.why && (
          <details className="mt-5 text-[0.98rem]">
            <summary className="cursor-pointer font-semibold text-ink-soft hover:text-ink">Why we ask</summary>
            <p className="mt-2 max-w-[60ch] text-ink-soft">{view.why}</p>
          </details>
        )}
        {view.tip && <div className="mt-6">{view.tip}</div>}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
          <Button type="button" variant="secondary" onClick={back}>
            Back
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
            {returnToList && step !== LAST_STEP && (
              <Link href="/list" className="font-semibold text-ink underline underline-offset-2">
                Back to my list
              </Link>
            )}
            {view.optional && !view.error && (
              <button type="button" onClick={next} className="text-ink-soft underline underline-offset-2 hover:text-ink">
                Skip
              </button>
            )}
            <Button type="submit">{view.continueLabel ?? "Continue"}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

/**
 * "Step 3 of 10". Advanced adds two questions after the level step. They're counted
 * on their own ("Advanced question 1 of 2") so the total never jumps mid-way.
 */
function Progress({ step, steps }: { step: StepId; steps: StepId[] }) {
  const main = steps.filter((s) => !ADVANCED_STEPS.includes(s));
  const extra = ADVANCED_STEPS.indexOf(step);
  // On an Advanced question, the bar stays at the level step until the last one.
  const done = extra >= 0 ? main.indexOf("level") + 1 : main.indexOf(step) + 1;
  return (
    <div>
      <p className="text-[0.95rem] font-semibold text-ink-soft" aria-live="polite">
        {extra >= 0
          ? `Advanced question ${extra + 1} of ${ADVANCED_STEPS.length}`
          : `Step ${done} of ${main.length}`}
      </p>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {main.map((s, i) => (
          <span key={s} className={`h-1.5 flex-1 rounded-full ${i < done ? "bg-orange" : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

function renderStep(step: StepId, a: Answers, update: Update): StepView {
  switch (step) {
    case "county": {
      const c = a.county ? COUNTY_BY_ID[a.county] : undefined;
      return {
        hint: "We use this to suggest likely hazards and your local alert system.",
        optional: true,
        body: (
          <div className="grid gap-6">
            <ZipField
              // Picking "Prefer not to say" clears the ZIP code, including anything half typed.
              key={a.county === "private" ? "private" : "zip"}
              zip={a.zip}
              county={a.county}
              onChange={(zip) =>
                update((prev) => relocate(prev, { zip, county: lookupZip(zip)?.county ?? prev.county }))
              }
            />
            <RadioCards
              name="county"
              legend="Which county do you live in?"
              value={a.county}
              onChange={(county) =>
                update((prev) => relocate(prev, { county, zip: county === "private" ? null : prev.zip }))
              }
              options={[
                ...COUNTIES.map((c) => ({ value: c.id, label: c.name })),
                { value: "other" as const, label: "Somewhere else, or not sure" },
                { value: "private" as const, label: "Prefer not to say" },
              ]}
            />
          </div>
        ),
        tip: c?.alert ? (
          <GoodToKnow>
            {c.name} sends free emergency texts and calls through <ExternalLink href={c.alert.url}>{c.alert.name}</ExternalLink>.
            Signing up takes two minutes and is one of the most useful free steps. You can do it now or later
            from your list.
          </GoodToKnow>
        ) : (
          <GoodToKnow>
            Every Bay Area county has a free emergency alert system. We&apos;ll link yours on your list if you
            pick a county.
          </GoodToKnow>
        ),
      };
    }

    case "hazards":
      return {
        hint: hazardsHint(a),
        body: <HazardsStep a={a} update={update} />,
        tip: (
          <GoodToKnow>
            One good kit covers most of these. Getting ready for an earthquake does most of the work for
            everything else. To check your exact address for flood, fire, tsunami, and quake risks, look it up
            on <ExternalLink href="https://myhazards.caloes.ca.gov/">MyHazards</ExternalLink> from Cal OES.
          </GoodToKnow>
        ),
      };

    case "household": {
      const h = a.household;
      const set = (k: keyof Answers["household"]) => (n: number) =>
        update((prev) => ({ household: { ...prev.household, [k]: n } }));
      return {
        hint: "Count anyone you'd look after in an emergency: housemates, family, someone who often stays over.",
        why: "So we can work out how much water and food you need. We don't ask for ages, names are optional, and nothing leaves this device.",
        body: (
          <>
            <div className="grid gap-2">
              <Stepper label="Adults and teens" value={h.adults} min={1} onChange={set("adults")} />
              <Stepper label="Kids" hint="Ages 2 to 12" value={h.kids} onChange={set("kids")} />
              <Stepper label="Babies and toddlers" hint="Under 2" value={h.babies} onChange={set("babies")} />
              <Stepper label="Dogs" value={h.dogs} onChange={set("dogs")} />
              <Stepper label="Cats" value={h.cats} onChange={set("cats")} />
              <Stepper label="Other pets" value={h.otherPets} onChange={set("otherPets")} />
            </div>
            <section className="mt-8" aria-labelledby="names-heading">
              <h2 id="names-heading" className="text-xl font-extrabold tracking-tight">
                Names <span className="text-base font-normal text-ink-soft">(optional)</span>
              </h2>
              <p className="mt-1 max-w-[60ch] text-[0.95rem] text-ink-soft">
                Handy if you&apos;re packing a go bag for each person, or splitting tasks with housemates. Names stay
                on this device, and are included if you share your list.
              </p>
              <div className="mt-3">
                <NamesEditor household={h} names={a.names} onChange={(names) => update({ names })} />
              </div>
            </section>
          </>
        ),
      };
    }

    case "needs":
      return {
        optional: true,
        hint: "Pick any that apply.",
        why: "So your list includes the right backups, like spare glasses or a battery for a CPAP. It's saved on this device, and only goes elsewhere if you share your list.",
        body: <NeedsStep a={a} update={update} />,
        tip: a.needs !== null && a.needs !== "private" && (a.needs.includes("power-device") || a.needs.includes("oxygen")) ? (
          <GoodToKnow>
            If you rely on powered medical equipment, ask PG&amp;E about its{" "}
            <ExternalLink href="https://www.pge.com/en/account/billing-and-assistance/financial-assistance/medical-baseline-program.html">
              Medical Baseline program
            </ExternalLink>
            . It can lower your bill and gets you extra notice before planned shutoffs.
          </GoodToKnow>
        ) : undefined,
      };

    case "have":
      return {
        hint: "It doesn't need to be packed yet. We'll count it so you don't buy it twice.",
        optional: true,
        body: (
          <CheckList
            legend="Tap anything you already have at home"
            columns={2}
            values={a.have}
            onToggle={(k, checked) =>
              update((prev) => ({ have: checked ? [...new Set([...prev.have, k])] : prev.have.filter((x) => x !== k) }))
            }
            options={HAVE_PICKS.map((p) => ({ value: p.key, label: p.label }))}
          />
        ),
        tip:
          a.have.length >= 3 ? (
            <GoodToKnow>You&apos;re already off to a good start. Most of a kit is everyday stuff.</GoodToKnow>
          ) : undefined,
      };

    case "kit": {
      const suggestion = a.build === "unsure" ? suggestBuild(a) : null;
      return {
        hint: "You can do both, and you can change this later.",
        error: a.build === null ? "Pick one to continue. If you're not sure, pick “Not sure yet”." : undefined,
        body: (
          <>
            <RadioCards
              name="build"
              legend="What would you like to put together?"
              describedBy={a.build === null ? ERROR_ID : undefined}
              value={a.build}
              onChange={(build) => update({ build })}
              options={[
                { value: "stay", label: "Stay-at-home bin", desc: "Supplies to get through days at home without power or running water." },
                { value: "go", label: "Go bag", desc: "A grab-and-go bag in case you need to leave fast." },
                { value: "both", label: "Both", badge: "Recommended", desc: "We'll list each one separately so you can do them one at a time." },
                { value: "unsure", label: "Not sure yet", desc: "We'll suggest one based on what you've told us." },
              ]}
            />
            {suggestion && (
              <div className="mt-6 rounded-lg border-2 border-orange bg-orange-wash p-4" role="status">
                <p className="font-semibold">
                  Our suggestion: {suggestion === "both" ? "a stay-at-home bin and a go bag" : "start with a stay-at-home bin"}
                </p>
                <p className="mt-1 text-[0.95rem] text-ink-soft">
                  {suggestion === "both"
                    ? "You picked a hazard where people may need to leave quickly, so a go bag is worth having too."
                    : "For earthquakes and outages you'll most likely stay home. You can add a go bag later."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => update({ build: suggestion })}>
                    Sounds good
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => update({ build: suggestion === "both" ? "stay" : "both" })}
                  >
                    {suggestion === "both" ? "Just a stay-at-home bin" : "I want both"}
                  </Button>
                </div>
              </div>
            )}
          </>
        ),
        tip: (
          <GoodToKnow>
            After a big earthquake, most Bay Area households will stay home. Wildfires and tsunami warnings are
            when people need to leave quickly.
          </GoodToKnow>
        ),
      };
    }

    case "home":
      return {
        optional: true,
        hint: "Renting or owning doesn't matter here. Where something is usually the landlord's job, your list will say so.",
        why: "It changes which home fixes show up on your list, and whether stairs matter when elevators stop.",
        body: (
          <RadioCards
            name="home"
            legend="What kind of home do you live in?"
            value={a.home}
            onChange={(home) => update({ home })}
            options={[
              { value: "house", label: "House or townhouse" },
              { value: "apartment-low", label: "Apartment or condo, up to 4 floors" },
              { value: "apartment-high", label: "Apartment or condo, 5 floors or more" },
              { value: "other", label: "Something else, or it varies" },
            ]}
          />
        ),
      };

    case "car":
      return {
        optional: true,
        why: "It changes how you'd get out if you need to leave fast. Without a car, we'll help you plan another way. With one, Advanced adds a small car kit.",
        body: (
          <RadioCards
            name="car"
            legend="Do you usually have a car?"
            value={a.car}
            onChange={(car) => update({ car })}
            options={[
              { value: "yes", label: "Yes" },
              { value: "sometimes", label: "Sometimes" },
              { value: "no", label: "No" },
            ]}
          />
        ),
      };

    case "level":
      return {
        hint: "You can switch any time without losing your progress.",
        body: <LevelChoice a={a} update={update} />,
      };

    case "days":
      return {
        hint: "After a major Hayward Fault quake, the USGS estimates many East Bay homes could be without tap water for about 6 weeks.",
        body: (
          <RadioCards
            name="days"
            legend="How many days do you want to cover at home?"
            value={a.days ?? 14}
            onChange={(days) => update({ days })}
            options={[
              {
                value: 7,
                label: "7 days",
                desc: "What San Francisco and EBMUD recommend at a minimum. Cal OES says at least 3 days, and a week is better.",
              },
              { value: 14, label: "14 days", badge: "Recommended", desc: "What the CDC and Red Cross suggest for home. Worth it if you have the space." },
            ]}
          />
        ),
      };

    case "power":
      return {
        optional: true,
        hint: "Pick any. We'll add gear for each.",
        body: (
          <CheckList
            legend="If the power is out for days, what matters most?"
            values={a.power}
            onToggle={(v, checked) =>
              update((prev) => ({ power: checked ? [...new Set([...prev.power, v])] : prev.power.filter((x) => x !== v) }))
            }
            options={[
              { value: "cook", label: "Cooking without power", desc: "A camp stove you can use outdoors." },
              { value: "charge", label: "Keeping phones and devices charged", desc: "A portable power station or solar panel." },
              { value: "cold", label: "Keeping food or medicine cold", desc: "Coolers, ice packs, and a plan." },
            ]}
          />
        ),
      };

    case "start":
      return {
        optional: true,
        continueLabel: "Show my list",
        why: "We use this to order your list. It never removes anything.",
        body: (
          <div className="grid gap-8">
            <RadioCards
              name="start"
              legend="When could you take your first step?"
              value={a.start}
              onChange={(start) => update({ start })}
              options={[
                { value: "weekend", label: "This weekend" },
                { value: "weeks", label: "In the next couple of weeks" },
                { value: "month", label: "This month" },
                { value: "unsure", label: "Not sure yet" },
              ]}
            />
            <div>
              <h2 id="budget-heading" className="mb-3 text-xl font-extrabold tracking-tight">
                Roughly what do you want to spend to start?
              </h2>
              <RadioCards
                name="budget"
                labelledBy="budget-heading"
                value={a.budget}
                onChange={(budget) => update({ budget })}
                options={[
                  { value: "0", label: "Use what I have first", desc: "Free steps go to the top." },
                  { value: "50", label: "Under $50" },
                  { value: "150", label: "$50 to $150" },
                  { value: "more", label: "More than $150" },
                  { value: "unsure", label: "Not sure" },
                ]}
              />
            </div>
          </div>
        ),
      };
  }
}

/** Says where the picks came from, and stops claiming they're ours once the person changes them. */
function hazardsHint(a: Answers): string {
  const defaults = defaultHazards(a.county, a.zip);
  const values = a.hazards.length ? a.hazards : defaults;
  if (!sameSet(values, defaults)) return "These are your picks. Change anything you like.";
  const county = a.county ? COUNTY_BY_ID[a.county] : undefined;
  return county
    ? `We've picked the common ones for ${county.name} County. Change anything you like.`
    : "We've picked the common ones for the Bay Area. Change anything you like.";
}

function HazardsStep({ a, update }: { a: Answers; update: Update }) {
  // Said out loud and shown when someone tries to uncheck the last one.
  const [note, setNote] = useState("");
  const defaults = defaultHazards(a.county, a.zip);
  const values = a.hazards.length ? a.hazards : defaults;
  const county = a.county ? COUNTY_BY_ID[a.county] : undefined;
  const zipTsunami = lookupZip(a.zip)?.tsunami ?? false;
  const showTsunami = !county || county.tsunami || zipTsunami || values.includes("tsunami");

  const toggle = (h: HazardId, checked: boolean) => {
    if (!checked && values.length === 1) {
      setNote("Keep at least one picked. Earthquake is a good place to start.");
      return;
    }
    setNote("");
    update((prev) => {
      const set = new Set(prev.hazards.length ? prev.hazards : defaults);
      if (checked) set.add(h);
      else set.delete(h);
      return { hazards: [...set] };
    });
  };

  return (
    <>
      <CheckList
        legend="Which of these do you want to be ready for?"
        values={values}
        onToggle={toggle}
        options={HAZARDS.filter((h) => h.id !== "tsunami" || showTsunami).map((h) => ({
          value: h.id,
          label: h.name,
          desc:
            h.id === "tsunami" && zipTsunami ? (
              <>
                {h.blurb}{" "}
                <span className="font-semibold text-ink">Part of your ZIP code is in a mapped tsunami hazard area.</span>
              </>
            ) : (
              h.blurb
            ),
        }))}
      />
      <p aria-live="polite" className="font-semibold text-orange [&:not(:empty)]:mt-3">
        {note}
      </p>
      {!sameSet(values, defaults) && (
        <button
          type="button"
          className="mt-3 text-ink-soft underline underline-offset-2 hover:text-ink"
          onClick={() => {
            setNote("");
            update({ hazards: defaults });
          }}
        >
          Not sure? Go back to our suggestions
        </button>
      )}
    </>
  );
}

const NEED_GROUPS: { group: string; options: { value: NeedId; label: string; desc?: string }[] }[] = [
  {
    group: "Health and medicine",
    options: [
      { value: "meds", label: "Daily prescription medicine" },
      { value: "cold-meds", label: "Medicine that has to stay cold", desc: "Like insulin" },
      { value: "power-device", label: "A medical device that needs power", desc: "CPAP, a power wheelchair, or a pump" },
      { value: "oxygen", label: "Home oxygen", desc: "A concentrator or tanks" },
      { value: "dialysis", label: "Dialysis" },
      { value: "pregnancy", label: "Pregnancy" },
      { value: "diet", label: "A special diet, food allergy, or baby formula" },
    ],
  },
  {
    group: "Getting around and communicating",
    options: [
      { value: "vision-hearing", label: "Glasses, contacts, or hearing aids" },
      { value: "mobility", label: "A mobility aid, or trouble with stairs" },
      { value: "communication", label: "Trouble hearing or seeing alerts, or speaking", desc: "Deaf, hard of hearing, blind, low vision, or a speech disability" },
      { value: "cognitive", label: "Trouble understanding or remembering in a crisis", desc: "Like dementia, autism, or a brain injury" },
    ],
  },
  {
    group: "Other",
    options: [
      { value: "caregiver", label: "Someone who needs help with daily care", desc: "From family or a home health aide" },
      { value: "service-animal", label: "A service animal" },
    ],
  },
];

const EXCLUSIVE_LABELS = { none: "None of these", private: "Prefer not to say" } as const;

function NeedsStep({ a, update }: { a: Answers; update: Update }) {
  // "None of these" and "Prefer not to say" clear the other picks. This says so, on screen and out loud.
  const [note, setNote] = useState("");
  const values: (NeedId | "none" | "private")[] =
    a.needs === null ? [] : a.needs === "private" ? ["private"] : a.needs.length === 0 ? ["none"] : a.needs;

  const toggle = (v: NeedId | "none" | "private", checked: boolean) => {
    const cleared = checked ? values.filter((x) => x !== v) : [];
    const exclusive = v === "none" || v === "private";
    // Only the two exclusive answers clear others, and picking a need clears them.
    const lost = exclusive ? cleared : cleared.filter((x) => x === "none" || x === "private");
    setNote(
      lost.length === 0
        ? ""
        : exclusive
          ? `We unchecked your other ${lost.length === 1 ? "pick" : "picks"}, since you chose “${EXCLUSIVE_LABELS[v]}”.`
          : `We unchecked “${EXCLUSIVE_LABELS[lost[0] as "none" | "private"]}”.`,
    );
    if (v === "none") return update({ needs: checked ? [] : null });
    if (v === "private") return update({ needs: checked ? "private" : null });
    update((prev) => {
      const cur = Array.isArray(prev.needs) ? prev.needs : [];
      const next = checked ? [...new Set([...cur, v])] : cur.filter((x) => x !== v);
      return { needs: next.length ? next : null };
    });
  };

  return (
    <>
      <CheckList
        legend="Does anyone rely on any of these?"
        values={values}
        onToggle={toggle}
        options={[
          ...NEED_GROUPS.flatMap(({ group, options }) => options.map((o) => ({ ...o, group }))),
          { value: "none", label: EXCLUSIVE_LABELS.none, desc: "Clears the picks above" },
          {
            value: "private",
            label: EXCLUSIVE_LABELS.private,
            desc: "Clears the picks above. Your list will include general health items.",
          },
        ]}
      />
      <p aria-live="polite" className="text-[0.95rem] font-semibold [&:not(:empty)]:mt-3">
        {note}
      </p>
    </>
  );
}

function LevelChoice({ a, update }: { a: Answers; update: Update }) {
  const stats = useMemo(() => {
    const calc = (level: Answers["level"]) => {
      const entries = buildList(deriveContext({ ...a, level }), ITEMS).filter(
        (e) => (level === "advanced" || e.level === "basics") && !(e.item.haveKey && a.have.includes(e.item.haveKey)),
      );
      const things = entries.filter((e) => e.container !== "home");
      const tasks = entries.length - things.length;
      return {
        line: `About ${things.length} things to gather or buy and ${tasks} to do around the house, roughly ${formatCost(sumCost(entries))}`,
      };
    };
    const extraSteps = stepsFor({ ...a, level: "advanced" }).length - stepsFor({ ...a, level: "basics" }).length;
    return { basics: calc("basics"), advanced: calc("advanced"), extraSteps };
  }, [a]);

  return (
    <RadioCards
      name="level"
      legend="How much do you want to take on right now?"
      value={a.level}
      onChange={(level) => update({ level })}
      options={[
        {
          value: "basics",
          label: "Basics",
          badge: "Start here",
          desc: (
            <>
              The essentials that cover most situations, with a week of water and food at home, as Bay Area
              agencies recommend.
              <span className="mt-1 block font-semibold text-ink">{stats.basics.line}</span>
              <span className="mt-0.5 block">
                Your first steps are free. The rest is a few shopping trips, spread out however suits you.
              </span>
            </>
          ),
        },
        {
          value: "advanced",
          label: "Advanced",
          desc: (
            <>
              Two weeks of supplies, backups, and extra gear. Adds {stats.extraSteps} short questions.
              <span className="mt-1 block font-semibold text-ink">{stats.advanced.line}</span>
            </>
          ),
        },
      ]}
    />
  );
}
