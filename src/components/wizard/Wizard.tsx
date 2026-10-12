"use client";

import { useEffect, useMemo, useRef, type ReactNode } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { ANSWERS_KEY, BASE_HAZARDS, EMPTY_ANSWERS, deriveContext, normalizeAnswers, suggestBuild } from "@/lib/answers";
import { buildList, formatCost, sumCost } from "@/lib/buildList";
import { useStored } from "@/lib/storage";
import type { Answers, HazardId, NeedId } from "@/lib/types";
import { COUNTIES, COUNTY_BY_ID } from "@/data/counties";
import { HAZARDS } from "@/data/hazards";
import { HAVE_PICKS } from "@/data/havePicks";
import { ITEMS } from "@/data/items";
import { STEP_TITLES, type StepId } from "./steps";
import { CheckList, GoodToKnow, RadioCards, Stepper, Button } from "@/components/controls";
import { NamesEditor } from "@/components/NamesEditor";

/** Hazards where people may have to leave, so whether they have a car matters even in Basics. */
const LEAVING_HAZARDS: HazardId[] = ["wildfire", "tsunami", "flood"];

function stepsFor(a: Answers): StepId[] {
  const hazards = a.hazards.length ? a.hazards : defaultHazards(a.county);
  const carEarly = hazards.some((h) => LEAVING_HAZARDS.includes(h));
  const advanced = a.level === "advanced";
  return [
    "build", "county", "hazards", "household", "home",
    ...(carEarly ? ["car" as const] : []),
    "needs", "have", "level",
    ...(advanced ? (["days", ...(carEarly ? [] : ["car" as const]), "power"] as StepId[]) : []),
    "start",
  ];
}

export function defaultHazards(county: Answers["county"]): HazardId[] {
  const c = county ? COUNTY_BY_ID[county] : undefined;
  return [...new Set([...BASE_HAZARDS, ...(c?.hazards ?? [])])];
}

function sameSet<T>(a: T[], b: T[]) {
  return a.length === b.length && a.every((x) => b.includes(x));
}

type Update = (patch: Partial<Answers> | ((prev: Answers) => Partial<Answers>)) => void;

interface StepView {
  hint?: ReactNode;
  why?: ReactNode;
  optional?: boolean;
  body: ReactNode;
  tip?: ReactNode;
  canContinue?: boolean;
  continueLabel?: string;
}

export function Wizard() {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const [answers, setAnswers] = useStored<Answers>(ANSWERS_KEY, EMPTY_ANSWERS, normalizeAnswers);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const pushes = useRef(0);
  const lastStep = useRef<StepId | null>(null);

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
    if (step === "county" && a.hazards.length === 0) update({ hazards: defaultHazards(a.county) });
    if (step === "start") return go("list");
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

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-4 sm:px-6">
      <Progress index={index} total={steps.length} />
      <form
        key={step}
        className="step-enter mt-8"
        onSubmit={(e) => {
          e.preventDefault();
          if (view.canContinue !== false) next();
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
        <div className="mt-6">{view.body}</div>
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
          <div className="flex items-center gap-4">
            {view.optional && view.canContinue !== false && (
              <button type="button" onClick={next} className="text-ink-soft underline underline-offset-2 hover:text-ink">
                Skip
              </button>
            )}
            <Button type="submit" disabled={view.canContinue === false} className="disabled:opacity-40">
              {view.continueLabel ?? "Continue"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Progress({ index, total }: { index: number; total: number }) {
  return (
    <div>
      <p className="text-[0.95rem] font-semibold text-ink-soft" aria-live="polite">
        Step {index + 1} of {total}
      </p>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= index ? "bg-orange" : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

function renderStep(step: StepId, a: Answers, update: Update): StepView {
  switch (step) {
    case "build":
      return {
        hint: "You can do both, and you can change this later.",
        canContinue: a.build !== null,
        body: (
          <RadioCards
            name="build"
            legend="What would you like to put together?"
            value={a.build}
            onChange={(build) => update({ build })}
            options={[
              { value: "stay", label: "Stay-at-home bin", desc: "Supplies to get through days at home without power or running water." },
              { value: "go", label: "Go bag", desc: "A grab-and-go bag in case you need to leave fast." },
              { value: "both", label: "Both", badge: "Recommended", desc: "We'll list each one separately so you can do them one at a time." },
              { value: "unsure", label: "Not sure yet", desc: "We'll suggest one after a couple of questions." },
            ]}
          />
        ),
        tip: (
          <GoodToKnow>
            After a big earthquake, most Bay Area households will stay home. Wildfires and tsunami warnings are
            when people need to leave quickly.
          </GoodToKnow>
        ),
      };

    case "county": {
      const c = a.county ? COUNTY_BY_ID[a.county] : undefined;
      return {
        hint: "We use this to suggest likely hazards and your local alert system.",
        optional: true,
        body: (
          <RadioCards
            name="county"
            legend="Which county do you live in?"
            value={a.county}
            onChange={(county) =>
              update((prev) => {
                // Re-default hazards only if they still match the previous county's defaults.
                const keep = prev.hazards.length > 0 && !sameSet(prev.hazards, defaultHazards(prev.county));
                return { county, ...(keep ? {} : { hazards: defaultHazards(county) }) };
              })
            }
            options={[
              ...COUNTIES.map((c) => ({ value: c.id, label: c.name })),
              { value: "other" as const, label: "Somewhere else, or not sure" },
              { value: "private" as const, label: "Prefer not to say" },
            ]}
          />
        ),
        tip: c?.alert ? (
          <GoodToKnow>
            {c.name} sends free emergency texts and calls through{" "}
            <a href={c.alert.url} target="_blank" rel="noopener noreferrer">
              {c.alert.name}
            </a>
            . Signing up takes two minutes and is the single most useful free step. You can do it now or later
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

    case "hazards": {
      const defaults = defaultHazards(a.county);
      const values = a.hazards.length ? a.hazards : defaults;
      const county = a.county ? COUNTY_BY_ID[a.county] : undefined;
      return {
        hint: county
          ? `We've picked the common ones for ${county.name} County. Change anything you like.`
          : "We've picked the common ones for the Bay Area. Change anything you like.",
        canContinue: values.length > 0,
        body: (
          <>
            <CheckList
              legend="Which of these do you want to be ready for?"
              values={values}
              onToggle={(h, checked) =>
                update((prev) => {
                  const set = new Set(prev.hazards.length ? prev.hazards : defaults);
                  if (checked) set.add(h);
                  else set.delete(h);
                  return { hazards: [...set] };
                })
              }
              options={HAZARDS.filter((h) => h.id !== "tsunami" || !county || county.tsunami).map((h) => ({
                value: h.id,
                label: h.name,
                desc: h.blurb,
              }))}
            />
            {!sameSet(values, defaults) && (
              <button
                type="button"
                className="mt-3 text-ink-soft underline underline-offset-2 hover:text-ink"
                onClick={() => update({ hazards: defaults })}
              >
                Not sure? Go back to our suggestions
              </button>
            )}
          </>
        ),
        tip: (
          <GoodToKnow>
            One good kit covers most of these. Getting ready for an earthquake does most of the work for
            everything else.
          </GoodToKnow>
        ),
      };
    }

    case "household": {
      const h = a.household;
      const set = (k: keyof Answers["household"]) => (n: number) =>
        update((prev) => ({ household: { ...prev.household, [k]: n } }));
      const suggestion = a.build === "unsure" ? suggestBuild(a) : null;
      return {
        hint: "Count anyone you'd look after in an emergency: housemates, family, someone who often stays over.",
        why: "So we can work out how much water and food you need. We don't ask for ages, names are optional, and nothing leaves this device.",
        body: (
          <>
            {suggestion && (
              <div className="mb-6 rounded-lg border-2 border-orange bg-orange-wash p-4">
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

    case "needs": {
      const values: (NeedId | "none" | "private")[] =
        a.needs === null ? [] : a.needs === "private" ? ["private"] : a.needs.length === 0 ? ["none"] : a.needs;
      return {
        optional: true,
        hint: "Pick any that apply.",
        why: "So your list includes the right backups, like spare glasses or a battery for a CPAP. This stays on your device.",
        body: (
          <CheckList
            legend="Does anyone rely on any of these?"
            values={values}
            onToggle={(v, checked) => {
              if (v === "none") return update({ needs: checked ? [] : null });
              if (v === "private") return update({ needs: checked ? "private" : null });
              update((prev) => {
                const cur = Array.isArray(prev.needs) ? prev.needs : [];
                const next = checked ? [...new Set([...cur, v])] : cur.filter((x) => x !== v);
                return { needs: next.length ? next : null };
              });
            }}
            options={[
              { value: "meds", label: "Daily prescription medicine" },
              { value: "power-device", label: "A medical device that needs power", desc: "CPAP, oxygen, power wheelchair, or medicine that must stay cold" },
              { value: "mobility", label: "A mobility aid, or trouble with stairs" },
              { value: "vision-hearing", label: "Glasses, contacts, or hearing aids" },
              { value: "diet", label: "A special diet, food allergy, or baby formula" },
              { value: "none", label: "None of these" },
              { value: "private", label: "Prefer not to say" },
            ]}
          />
        ),
        tip: a.needs !== null && a.needs !== "private" && a.needs.includes("power-device") ? (
          <GoodToKnow>
            If you rely on powered medical equipment, ask PG&amp;E about its{" "}
            <a href="https://www.pge.com/en/account/billing-and-assistance/financial-assistance/medical-baseline-program.html" target="_blank" rel="noopener noreferrer">
              Medical Baseline program
            </a>
            . It can lower your bill and gets you extra notice before planned shutoffs.
          </GoodToKnow>
        ) : undefined,
      };
    }

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

    case "level":
      return {
        hint: "You can switch any time without losing your progress.",
        body: <LevelChoice a={a} update={update} />,
      };

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
              { value: 7, label: "7 days", desc: "What San Francisco, EBMUD, and Cal OES recommend at a minimum." },
              { value: 14, label: "14 days", badge: "Recommended", desc: "What the CDC and Red Cross suggest for home. Worth it if you have the space." },
            ]}
          />
        ),
      };

    case "car":
      return {
        optional: true,
        why:
          a.level === "advanced"
            ? "A car can hold a small kit of its own. Without one, we'll help you plan another way out."
            : "If you might need to leave fast, it changes how you'd get out. Without a car, we'll help you plan another way.",
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
              <h2 className="mb-3 text-xl font-extrabold tracking-tight">Roughly what do you want to spend to start?</h2>
              <RadioCards
                name="budget"
                legend="Roughly what do you want to spend to start?"
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
              agencies recommend. Usually one weekend and a shopping trip or two.
              <span className="mt-1 block font-semibold text-ink">{stats.basics.line}</span>
              <span className="mt-0.5 block">
                Most people spread this over a few months. Your first steps are free.
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
