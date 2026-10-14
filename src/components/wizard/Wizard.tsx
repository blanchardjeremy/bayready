"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { ANSWERS_KEY, EMPTY_ANSWERS, deriveContext, defaultHazards, normalizeAnswers, suggestBuild } from "@/lib/answers";
import { buildList, formatCost, sumCost } from "@/lib/buildList";
import { useStored } from "@/lib/storage";
import type { Answers, HazardId, NeedId } from "@/lib/types";
import { COUNTIES, COUNTY_BY_ID } from "@/data/counties";
import { hazardsFor } from "@/data/hazards";
import { havePicksFor } from "@/data/havePicks";
import { ITEMS } from "@/data/items";
import { lookupZip } from "@/data/zips";
import { ADVANCED_STEPS, LAST_STEP, MAIN_STEPS, type StepId } from "./steps";
import { ZipField } from "./ZipField";
import { CheckList, ExternalLink, GoodToKnow, RadioCards, Stepper, Button } from "@/components/controls";
import { NamesEditor } from "@/components/NamesEditor";
import { useReturnToList } from "@/lib/returnToList";
import { useDocumentTitle } from "@/components/useDocumentTitle";
import { useLang, useT } from "@/i18n/useLang";
import type { Lang } from "@/i18n/lang";
import type { Messages } from "@/i18n/messages";
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
type W = Messages["wizard"];

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
  const lang = useLang();
  const t = useT().wizard;
  useDocumentTitle(t.pageTitle(t.titles[step]));

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

  const view = renderStep(step, a, update, t, lang);
  const error = errorStep === step ? view.error : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-16 pt-4 sm:px-6">
      <Progress step={step} steps={steps} t={t} />
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
          {t.titles[step]}
          {view.optional && <span className="ml-2 align-middle text-base font-normal text-ink-soft">{t.optional}</span>}
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
            <summary className="cursor-pointer font-semibold text-ink-soft hover:text-ink">{t.whyWeAsk}</summary>
            <p className="mt-2 max-w-[60ch] text-ink-soft">{view.why}</p>
          </details>
        )}
        {view.tip && <div className="mt-6">{view.tip}</div>}

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
          <Button type="button" variant="secondary" onClick={back}>
            {t.back}
          </Button>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
            {returnToList && step !== LAST_STEP && (
              <Link href="/list" className="font-semibold text-ink underline underline-offset-2">
                {t.backToList}
              </Link>
            )}
            {view.optional && !view.error && (
              <button type="button" onClick={next} className="text-ink-soft underline underline-offset-2 hover:text-ink">
                {t.skip}
              </button>
            )}
            <Button type="submit">{view.continueLabel ?? t.continue}</Button>
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
function Progress({ step, steps, t }: { step: StepId; steps: StepId[]; t: W }) {
  const main = steps.filter((s) => !ADVANCED_STEPS.includes(s));
  const extra = ADVANCED_STEPS.indexOf(step);
  // On an Advanced question, the bar stays at the level step until the last one.
  const done = extra >= 0 ? main.indexOf("level") + 1 : main.indexOf(step) + 1;
  return (
    <div>
      <p className="text-[0.95rem] font-semibold text-ink-soft" aria-live="polite">
        {extra >= 0 ? t.advancedOf(extra + 1, ADVANCED_STEPS.length) : t.stepOf(done, main.length)}
      </p>
      <div className="mt-2 flex gap-1" aria-hidden="true">
        {main.map((s, i) => (
          <span key={s} className={`h-1.5 flex-1 rounded-full ${i < done ? "bg-orange" : "bg-line"}`} />
        ))}
      </div>
    </div>
  );
}

function renderStep(step: StepId, a: Answers, update: Update, t: W, lang: Lang): StepView {
  switch (step) {
    case "county": {
      const c = a.county ? COUNTY_BY_ID[a.county] : undefined;
      return {
        hint: t.county.hint,
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
              legend={t.titles.county}
              value={a.county}
              onChange={(county) =>
                update((prev) => relocate(prev, { county, zip: county === "private" ? null : prev.zip }))
              }
              options={[
                ...COUNTIES.map((c) => ({ value: c.id, label: c.name })),
                { value: "other" as const, label: t.county.other },
                { value: "private" as const, label: t.county.private },
              ]}
            />
          </div>
        ),
        tip: c?.alert ? (
          <GoodToKnow>
            {t.county.alertTip.before(c.name)}
            <ExternalLink href={c.alert.url}>{c.alert.name}</ExternalLink>
            {t.county.alertTip.after}
          </GoodToKnow>
        ) : (
          <GoodToKnow>{t.county.noAlertTip}</GoodToKnow>
        ),
      };
    }

    case "hazards":
      return {
        hint: hazardsHint(a, t),
        body: <HazardsStep a={a} update={update} t={t} lang={lang} />,
        tip: (
          <GoodToKnow>
            {t.hazards.tip.before}
            <ExternalLink href="https://myhazards.caloes.ca.gov/">MyHazards</ExternalLink>
            {t.hazards.tip.after}
          </GoodToKnow>
        ),
      };

    case "household": {
      const h = a.household;
      const set = (k: keyof Answers["household"]) => (n: number) =>
        update((prev) => ({ household: { ...prev.household, [k]: n } }));
      return {
        hint: t.household.hint,
        why: t.household.why,
        body: (
          <>
            <div className="grid gap-2">
              <Stepper id="adults" label={t.household.adults} value={h.adults} min={1} onChange={set("adults")} />
              <Stepper id="kids" label={t.household.kids} hint={t.household.kidsHint} value={h.kids} onChange={set("kids")} />
              <Stepper
                id="babies"
                label={t.household.babies}
                hint={t.household.babiesHint}
                value={h.babies}
                onChange={set("babies")}
              />
              <Stepper id="dogs" label={t.household.dogs} value={h.dogs} onChange={set("dogs")} />
              <Stepper id="cats" label={t.household.cats} value={h.cats} onChange={set("cats")} />
              <Stepper id="other-pets" label={t.household.otherPets} value={h.otherPets} onChange={set("otherPets")} />
            </div>
            <section className="mt-8" aria-labelledby="names-heading">
              <h2 id="names-heading" className="text-xl font-extrabold tracking-tight">
                {t.household.names} <span className="text-base font-normal text-ink-soft">{t.optional}</span>
              </h2>
              <p className="mt-1 max-w-[60ch] text-[0.95rem] text-ink-soft">{t.household.namesNote}</p>
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
        hint: t.needs.hint,
        why: t.needs.why,
        body: <NeedsStep a={a} update={update} t={t} />,
        tip: a.needs !== null && a.needs !== "private" && (a.needs.includes("power-device") || a.needs.includes("oxygen")) ? (
          <GoodToKnow>
            {t.needs.medicalBaseline.before}
            <ExternalLink href={t.needs.medicalBaseline.url}>{t.needs.medicalBaseline.link}</ExternalLink>
            {t.needs.medicalBaseline.after}
          </GoodToKnow>
        ) : undefined,
      };

    case "have":
      return {
        hint: t.have.hint,
        optional: true,
        body: (
          <CheckList
            legend={t.titles.have}
            columns={2}
            values={a.have}
            onToggle={(k, checked) =>
              update((prev) => ({ have: checked ? [...new Set([...prev.have, k])] : prev.have.filter((x) => x !== k) }))
            }
            options={havePicksFor(lang).map((p) => ({ value: p.key, label: p.label }))}
          />
        ),
        tip:
          a.have.length >= 3 ? (
            <GoodToKnow>{t.have.tip}</GoodToKnow>
          ) : undefined,
      };

    case "kit": {
      const suggestion = a.build === "unsure" ? suggestBuild(a) : null;
      return {
        hint: t.kit.hint,
        error: a.build === null ? t.kit.error : undefined,
        body: (
          <>
            <RadioCards
              name="build"
              legend={t.titles.kit}
              describedBy={a.build === null ? ERROR_ID : undefined}
              value={a.build}
              onChange={(build) => update({ build })}
              options={[
                { value: "stay", ...t.kit.options.stay },
                { value: "go", ...t.kit.options.go },
                { value: "both", ...t.kit.options.both, badge: t.kit.recommended },
                { value: "unsure", ...t.kit.options.unsure },
              ]}
            />
            {suggestion && (
              <div className="mt-6 rounded-lg border-2 border-orange bg-orange-wash p-4" role="status">
                <p className="font-semibold">{t.kit.suggestion[suggestion]}</p>
                <p className="mt-1 text-[0.95rem] text-ink-soft">{t.kit.suggestionWhy[suggestion]}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" onClick={() => update({ build: suggestion })}>
                    {t.kit.soundsGood}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => update({ build: suggestion === "both" ? "stay" : "both" })}
                  >
                    {suggestion === "both" ? t.kit.justStay : t.kit.wantBoth}
                  </Button>
                </div>
              </div>
            )}
          </>
        ),
        tip: (
          <GoodToKnow>{t.kit.tip}</GoodToKnow>
        ),
      };
    }

    case "home":
      return {
        optional: true,
        hint: t.home.hint,
        why: t.home.why,
        body: (
          <RadioCards
            name="home"
            legend={t.titles.home}
            value={a.home}
            onChange={(home) => update({ home })}
            options={(["house", "apartment-low", "apartment-high", "other"] as const).map((value) => ({
              value,
              label: t.home.options[value],
            }))}
          />
        ),
      };

    case "car":
      return {
        optional: true,
        why: t.car.why,
        body: (
          <RadioCards
            name="car"
            legend={t.titles.car}
            value={a.car}
            onChange={(car) => update({ car })}
            options={(["yes", "sometimes", "no"] as const).map((value) => ({ value, label: t.car.options[value] }))}
          />
        ),
      };

    case "level":
      return {
        hint: t.level.hint,
        body: <LevelChoice a={a} update={update} t={t} lang={lang} />,
      };

    case "days":
      return {
        hint: t.days.hint,
        body: (
          <RadioCards
            name="days"
            legend={t.titles.days}
            value={a.days ?? 14}
            onChange={(days) => update({ days })}
            options={[
              { value: 7, label: t.days.seven, desc: t.days.sevenDesc },
              { value: 14, label: t.days.fourteen, badge: t.kit.recommended, desc: t.days.fourteenDesc },
            ]}
          />
        ),
      };

    case "power":
      return {
        optional: true,
        hint: t.power.hint,
        body: (
          <CheckList
            legend={t.titles.power}
            values={a.power}
            onToggle={(v, checked) =>
              update((prev) => ({ power: checked ? [...new Set([...prev.power, v])] : prev.power.filter((x) => x !== v) }))
            }
            options={(["cook", "charge", "cold"] as const).map((value) => ({ value, ...t.power.options[value] }))}
          />
        ),
      };

    case "start":
      return {
        optional: true,
        continueLabel: t.start.continue,
        why: t.start.why,
        body: (
          <div className="grid gap-8">
            <RadioCards
              name="start"
              legend={t.titles.start}
              value={a.start}
              onChange={(start) => update({ start })}
              options={(["weekend", "weeks", "month", "unsure"] as const).map((value) => ({
                value,
                label: t.start.options[value],
              }))}
            />
            <div>
              <h2 id="budget-heading" className="mb-3 text-xl font-extrabold tracking-tight">
                {t.start.budgetHeading}
              </h2>
              <RadioCards
                name="budget"
                labelledBy="budget-heading"
                value={a.budget}
                onChange={(budget) => update({ budget })}
                options={(["0", "50", "150", "more", "unsure"] as const).map((value) => ({
                  value,
                  ...t.start.budget[value],
                }))}
              />
            </div>
          </div>
        ),
      };
  }
}

/** Says where the picks came from, and stops claiming they're ours once the person changes them. */
function hazardsHint(a: Answers, t: W): string {
  const defaults = defaultHazards(a.county, a.zip);
  const values = a.hazards.length ? a.hazards : defaults;
  if (!sameSet(values, defaults)) return t.hazards.hintCustom;
  const county = a.county ? COUNTY_BY_ID[a.county] : undefined;
  return county ? t.hazards.hintCounty(county.name) : t.hazards.hintBayArea;
}

function HazardsStep({ a, update, t, lang }: { a: Answers; update: Update; t: W; lang: Lang }) {
  // Said out loud and shown when someone tries to uncheck the last one.
  const [note, setNote] = useState(false);
  const defaults = defaultHazards(a.county, a.zip);
  const values = a.hazards.length ? a.hazards : defaults;
  const county = a.county ? COUNTY_BY_ID[a.county] : undefined;
  const zipTsunami = lookupZip(a.zip)?.tsunami ?? false;
  const showTsunami = !county || county.tsunami || zipTsunami || values.includes("tsunami");

  const toggle = (h: HazardId, checked: boolean) => {
    if (!checked && values.length === 1) {
      setNote(true);
      return;
    }
    setNote(false);
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
        legend={t.titles.hazards}
        values={values}
        onToggle={toggle}
        options={hazardsFor(lang)
          .filter((h) => h.id !== "tsunami" || showTsunami)
          .map((h) => ({
            value: h.id,
            label: h.name,
            desc:
              h.id === "tsunami" && zipTsunami ? (
                <>
                  {h.blurb} <span className="font-semibold text-ink">{t.hazards.zipTsunami}</span>
                </>
              ) : (
                h.blurb
              ),
          }))}
      />
      <p aria-live="polite" className="font-semibold text-orange [&:not(:empty)]:mt-3">
        {note ? t.hazards.keepOne : ""}
      </p>
      {!sameSet(values, defaults) && (
        <button
          type="button"
          className="mt-3 text-ink-soft underline underline-offset-2 hover:text-ink"
          onClick={() => {
            setNote(false);
            update({ hazards: defaults });
          }}
        >
          {t.hazards.reset}
        </button>
      )}
    </>
  );
}

/** Needs by group, in the order shown. The words are in the wizard messages. */
const NEED_GROUPS: { group: keyof W["needs"]["groups"]; options: NeedId[] }[] = [
  { group: "health", options: ["meds", "cold-meds", "power-device", "oxygen", "dialysis", "pregnancy", "diet"] },
  { group: "getAround", options: ["vision-hearing", "mobility", "communication", "cognitive"] },
  { group: "other", options: ["caregiver", "service-animal"] },
];

type Exclusive = "none" | "private";
/** What the note says happened, kept as facts so it reads right after a language switch. */
type NeedsNote = { cleared: number; choice: Exclusive } | { unchecked: Exclusive } | null;

function NeedsStep({ a, update, t }: { a: Answers; update: Update; t: W }) {
  // "None of these" and "Prefer not to say" clear the other picks. This says so, on screen and out loud.
  const [note, setNote] = useState<NeedsNote>(null);
  const values: (NeedId | Exclusive)[] =
    a.needs === null ? [] : a.needs === "private" ? ["private"] : a.needs.length === 0 ? ["none"] : a.needs;

  const toggle = (v: NeedId | Exclusive, checked: boolean) => {
    const cleared = checked ? values.filter((x) => x !== v) : [];
    const exclusive = v === "none" || v === "private";
    // Only the two exclusive answers clear others, and picking a need clears them.
    const lost = exclusive ? cleared : cleared.filter((x) => x === "none" || x === "private");
    setNote(
      lost.length === 0
        ? null
        : exclusive
          ? { cleared: lost.length, choice: v }
          : { unchecked: lost[0] as Exclusive },
    );
    if (v === "none") return update({ needs: checked ? [] : null });
    if (v === "private") return update({ needs: checked ? "private" : null });
    update((prev) => {
      const cur = Array.isArray(prev.needs) ? prev.needs : [];
      const next = checked ? [...new Set([...cur, v])] : cur.filter((x) => x !== v);
      return { needs: next.length ? next : null };
    });
  };

  const said = !note
    ? ""
    : "cleared" in note
      ? t.needs.clearedOthers(note.cleared, t.needs[note.choice])
      : t.needs.clearedOne(t.needs[note.unchecked]);

  return (
    <>
      <CheckList
        legend={t.titles.needs}
        values={values}
        onToggle={toggle}
        options={[
          ...NEED_GROUPS.flatMap(({ group, options }) =>
            options.map((value) => {
              const o: { label: string; desc?: string } = t.needs.options[value];
              return { value, label: o.label, desc: o.desc, group: t.needs.groups[group] };
            }),
          ),
          { value: "none", label: t.needs.none, desc: t.needs.noneDesc },
          { value: "private", label: t.needs.private, desc: t.needs.privateDesc },
        ]}
      />
      <p aria-live="polite" className="text-[0.95rem] font-semibold [&:not(:empty)]:mt-3">
        {said}
      </p>
    </>
  );
}

function LevelChoice({ a, update, t, lang }: { a: Answers; update: Update; t: W; lang: Lang }) {
  const stats = useMemo(() => {
    const calc = (level: Answers["level"]) => {
      const entries = buildList(deriveContext({ ...a, level }, lang), ITEMS).filter(
        (e) => (level === "advanced" || e.level === "basics") && !(e.item.haveKey && a.have.includes(e.item.haveKey)),
      );
      const things = entries.filter((e) => e.container !== "home");
      return { things: things.length, tasks: entries.length - things.length, cost: formatCost(sumCost(entries)) };
    };
    const extraSteps = stepsFor({ ...a, level: "advanced" }).length - stepsFor({ ...a, level: "basics" }).length;
    return { basics: calc("basics"), advanced: calc("advanced"), extraSteps };
  }, [a, lang]);
  const line = (s: (typeof stats)["basics"]) => t.level.stats(s.things, s.tasks, s.cost);

  return (
    <RadioCards
      name="level"
      legend={t.titles.level}
      value={a.level}
      onChange={(level) => update({ level })}
      options={[
        {
          value: "basics",
          label: t.level.basics,
          badge: t.level.startHere,
          desc: (
            <>
              {t.level.basicsDesc}
              <span className="mt-1 block font-semibold text-ink">{line(stats.basics)}</span>
              <span className="mt-0.5 block">{t.level.basicsFree}</span>
            </>
          ),
        },
        {
          value: "advanced",
          label: t.level.advanced,
          desc: (
            <>
              {t.level.advancedDesc(stats.extraSteps)}
              <span className="mt-1 block font-semibold text-ink">{line(stats.advanced)}</span>
            </>
          ),
        },
      ]}
    />
  );
}
