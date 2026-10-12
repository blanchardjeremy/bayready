"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ComponentProps } from "react";
import {
  ANSWERS_KEY,
  normalizeAnswers,
  EMPTY_ANSWERS,
  peopleNames,
  STARTER_ANSWERS,
  STATES_KEY,
  decodeShare,
  deriveContext,
  encodeShare,
  resolveBuild,
} from "@/lib/answers";
import { CONTAINER_ORDER, buildList, firstSteps, formatCost, planStage, slotDone, slotKey, stateOf, sumCost } from "@/lib/buildList";
import { downloadIcs, firstStepDate } from "@/lib/ics";
import { useStored } from "@/lib/storage";
import type { Answers, Container, Context, ItemState, ListEntry, Names, Stage } from "@/lib/types";
import { COUNTY_BY_ID } from "@/data/counties";
import { HAZARD_BY_ID } from "@/data/hazards";
import { ITEMS } from "@/data/items";
import { firstHourCard } from "@/data/firstHour";
import { CATEGORY_META, CATEGORY_ORDER, CONTAINER_META, SHOP_META, SHOP_ORDER, STAGE_META } from "@/data/meta";
import { Button, buttonClass } from "@/components/controls";
import { ItemRow } from "./ItemRow";
import { BAY_READY_URL, CREDIT, sitePath, siteUrl } from "@/lib/urls";
import { clearReturnToList, markReturnToList } from "@/lib/returnToList";
import { NamesEditor } from "@/components/NamesEditor";

type States = Record<string, ItemState>;
type RowProps = (e: ListEntry) => ComponentProps<typeof ItemRow>;
const EMPTY_STATES: States = {};
type View = "kits" | "shop" | "plan";

export function ListView() {
  const [storedAnswers, setStoredAnswers] = useStored<Answers>(ANSWERS_KEY, EMPTY_ANSWERS, normalizeAnswers);
  const [storedStates, setStoredStates] = useStored<States>(STATES_KEY, EMPTY_STATES);
  // A shared link carries its own answers in the URL fragment; read it once on the client.
  const [shared, setShared] = useState(() =>
    typeof window !== "undefined" && window.location.hash.length > 1 ? decodeShare(window.location.hash) : null,
  );
  const [view, setView] = useState<View>("kits");
  const [copied, setCopied] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [editingNames, setEditingNames] = useState(false);
  // Back on the list, so the wizard's "Back to my list" shortcut is no longer needed.
  useEffect(() => clearReturnToList(), []);

  const answers = shared ? shared.answers : storedAnswers;
  const states = shared ? shared.states : storedStates;

  const ctx = useMemo(() => (answers ? deriveContext(answers) : null), [answers]);
  const entries = useMemo(() => (ctx ? buildList(ctx, ITEMS) : []), [ctx]);

  if (!answers || !states || !ctx) return <div className="min-h-[60vh]" aria-busy="true" />;

  if (!shared && answers.build === null) return <EmptyState onStarter={() => setStoredAnswers(STARTER_ANSWERS)} />;

  const setStates = (patch: States) => {
    if (shared) setShared({ ...shared, states: { ...shared.states, ...patch } });
    else setStoredStates((prev) => ({ ...prev, ...patch }));
  };
  const setLevel = (level: Answers["level"]) => {
    if (shared) setShared({ ...shared, answers: { ...shared.answers, level } });
    else setStoredAnswers((prev) => ({ ...prev, level }));
  };

  const st = (e: ListEntry) => stateOf(e, states, answers);

  /** Props for one item row. Per-person rows tick everyone at once from the main checkbox. */
  const row: RowProps = (e) => ({
    entry: e,
    state: st(e),
    ctx,
    slotDone: (i) => slotDone(e, i, states, answers),
    onEditNames: shared ? undefined : () => setEditingNames(true),
    onSlot: (i, done) => setStates({ [slotKey(e, i)]: done ? "have" : "need" }),
    onChange: (s) => {
      const patch: States = { [e.key]: s };
      if (s !== "skip") e.slots.forEach((_, i) => (patch[slotKey(e, i)] = s));
      setStates(patch);
    },
  });
  const advanced = answers.level === "advanced";
  const main = entries.filter((e) => advanced || e.level === "basics");
  const levelUp = advanced ? [] : entries.filter((e) => e.level === "advanced");
  const kits = CONTAINER_ORDER.filter((c) => ctx.kits.includes(c) && main.some((e) => e.container === c));
  const firsts = firstSteps(main, st, answers);
  const firstKeys = new Set(firsts.map((e) => e.key));

  const flash = (msg: string) => {
    setCopied(msg);
    setTimeout(() => setCopied(null), 2500);
  };
  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      flash(msg);
    } catch {
      flash("Couldn't copy. Your browser blocked it.");
    }
  };
  const shareUrl = () => `${siteUrl("/list")}#${encodeShare(answers, states)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6">
      {shared && (
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-ink bg-paper p-4">
          <p>
            <span className="font-semibold">You&apos;re looking at a list someone shared.</span>{" "}
            <span className="text-ink-soft">Changes here aren&apos;t saved until you make it yours.</span>
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => {
                setStoredAnswers(shared.answers);
                setStoredStates(shared.states);
                history.replaceState(null, "", sitePath("/list"));
                setShared(null);
              }}
            >
              Make it my list
            </Button>
            <Link href="/build" className={buttonClass.secondary}>
              Build my own
            </Link>
          </div>
        </div>
      )}

      <Header ctx={ctx} answers={answers} onLevel={setLevel} readOnly={!!shared} />

      <Progress kits={kits} main={main} st={st} />

      <div className="no-print mt-6 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={() => window.print()}>
          Print
        </Button>
        <Button type="button" variant="secondary" onClick={() => copy(shareUrl(), "Link copied. Anyone with it can see this list.")}>
          Copy share link
        </Button>
        <Button type="button" variant="secondary" onClick={() => copy(asText(kits, main, st, ctx), "List copied as text.")}>
          Copy as text
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={exporting}
          onClick={async () => {
            setExporting(true);
            try {
              const { downloadWorkbook } = await import("@/lib/exportXlsx");
              await downloadWorkbook({
                answers,
                ctx,
                entries: main,
                stateOf: st,
                slotDone: (e, i) => slotDone(e, i, states, answers),
                shareUrl: shareUrl(),
              });
              flash("Spreadsheet downloaded. It opens in Google Sheets, Excel, or Numbers.");
            } catch {
              flash("Couldn't make the spreadsheet. Try again.");
            } finally {
              setExporting(false);
            }
          }}
        >
          {exporting ? "Making spreadsheet…" : "Download spreadsheet"}
        </Button>
        <p role="status" className="self-center text-[0.95rem] text-eucalyptus">
          {copied}
        </p>
      </div>

      <StartHere firsts={firsts} st={st} row={row} answers={answers} />

      <Together />

      <div className="no-print mt-12 flex flex-wrap gap-1 rounded-lg bg-paper p-1 sm:inline-flex" role="group" aria-label="How to show your list">
        {(
          [
            ["kits", "By kit"],
            ["shop", "Shopping list"],
            ["plan", "Step by step"],
          ] as [View, string][]
        ).map(([v, label]) => (
          <button
            key={v}
            type="button"
            aria-pressed={view === v}
            onClick={() => setView(v)}
            className={`min-h-11 flex-1 rounded-md px-4 font-semibold sm:flex-none ${
              view === v ? "bg-ink text-fog" : "text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {view === "kits" &&
          kits.map((c) => (
            <KitSection
              key={c}
              container={c}
              entries={main.filter((e) => e.container === c && !firstKeys.has(e.key))}
              shownAbove={main.filter((e) => e.container === c && firstKeys.has(e.key)).length}
              levelUp={levelUp.filter((e) => e.container === c)}
              st={st}
              row={row}
              ctx={ctx}
              onLevelUp={() => setLevel("advanced")}
            />
          ))}
        {view === "shop" && (
          <ShoppingList entries={main} st={st} copy={(t) => copy(t, "Shopping list copied.")} />
        )}
        {view === "plan" && (
          <Plan entries={[...main, ...levelUp]} firstKeys={firstKeys} st={st} row={row} answers={answers} />
        )}
      </div>

      <FirstHour ctx={ctx} />

      <KeepFresh />

      {/* The site footer doesn't print, so printed lists get their own credit. */}
      <p className="hidden pt-8 text-sm print:block">
        Made with Bay Ready, a free emergency kit planner for the Bay Area: {BAY_READY_URL}
      </p>

      {editingNames && (
        <NamesDialog
          answers={answers}
          onChange={(names) => setStoredAnswers((prev) => ({ ...prev, names }))}
          onClose={() => setEditingNames(false)}
        />
      )}
    </div>
  );
}

function Header({
  ctx,
  answers,
  onLevel,
  readOnly,
}: {
  ctx: Context;
  answers: Answers;
  onLevel: (l: Answers["level"]) => void;
  readOnly: boolean;
}) {
  const build = resolveBuild(answers);
  const h = answers.household;
  const people = [
    `${h.adults} ${h.adults === 1 ? "adult" : "adults"}`,
    h.kids && `${h.kids} ${h.kids === 1 ? "kid" : "kids"}`,
    h.babies && `${h.babies} ${h.babies === 1 ? "baby" : "babies"}`,
    h.dogs && `${h.dogs} ${h.dogs === 1 ? "dog" : "dogs"}`,
    h.cats && `${h.cats} ${h.cats === 1 ? "cat" : "cats"}`,
    h.otherPets && `${h.otherPets} other ${h.otherPets === 1 ? "pet" : "pets"}`,
  ].filter(Boolean);
  const county = answers.county ? COUNTY_BY_ID[answers.county] : undefined;
  const kitNames = { stay: ["Stay-at-home bin"], go: ["Go bag"], both: ["Stay-at-home bin", "go bag"] }[build];
  if (ctx.kits.includes("car")) kitNames.push("car kit");
  const hazards = [...ctx.hazards].map((id, i) => {
    const short = HAZARD_BY_ID[id].short;
    return i === 0 ? short : short.toLowerCase();
  });

  // One badge per answer, each jumping to the wizard step that sets it.
  const groups: { label: string; step: string; value: string }[] = [
    { label: "Building", step: "", value: kitNames.join(" + ") },
    { label: "For", step: "household", value: people.join(", ") },
    { label: "Ready for", step: "hazards", value: hazards.join(", ") },
    ...(build !== "go"
      ? [{ label: "At home", step: answers.level === "advanced" ? "days" : "level", value: `${ctx.stayDays} days` }]
      : []),
    ...(county ? [{ label: "In", step: "county", value: `${county.name} County` }] : []),
  ];

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
      <div>
        <h1 className="text-[2.2rem] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-[2.8rem]">Your emergency list</h1>
        <dl className="mt-4 flex max-w-[60rem] flex-wrap items-center gap-x-4 gap-y-2">
          {groups.map((g) => (
            <div key={g.label} className="flex items-center gap-1.5">
              <dt className="text-[0.85rem] text-ink-soft">{g.label}</dt>
              <dd>
                <AnswerBadge value={g.value} href={readOnly ? undefined : `/build${g.step ? `/${g.step}` : ""}`} label={g.label} />
              </dd>
            </div>
          ))}
        </dl>
        {!readOnly && (
          <Link
            href="/build"
            onClick={markReturnToList}
            className="no-print mt-3 inline-block text-[0.95rem] font-semibold text-ink underline underline-offset-2"
          >
            Change answers
          </Link>
        )}
      </div>
      <fieldset className="no-print">
        <legend className="mb-1.5 text-[0.95rem] font-semibold text-ink-soft">Level</legend>
        <div className="inline-flex rounded-lg border-2 border-ink p-0.5">
          {(["basics", "advanced"] as const).map((l) => (
            <label
              key={l}
              className={`cursor-pointer rounded-md px-4 py-2 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-focus ${
                answers.level === l ? "bg-ink text-fog" : "text-ink-soft hover:text-ink"
              }`}
            >
              <input type="radio" name="level" className="sr-only" checked={answers.level === l} onChange={() => onLevel(l)} />
              {l === "basics" ? "Basics" : "Advanced"}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

/** One answer shown as a badge. Links to the wizard step that sets it; the faint pencil says it's editable. */
function AnswerBadge({ value, href, label }: { value: string; href?: string; label: string }) {
  const cls =
    "inline-flex min-h-7 items-center gap-1.5 rounded-full border border-line bg-paper px-2.5 text-[0.85rem] font-semibold text-ink";
  if (!href) return <span className={cls}>{value}</span>;
  return (
    <Link
      href={href}
      onClick={markReturnToList}
      aria-label={`${label}: ${value}. Change`}
      className={`group/badge ${cls} transition-colors hover:border-ink`}
    >
      {value}
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="no-print size-3 text-ink-soft opacity-50 transition-opacity group-hover/badge:opacity-100 group-focus-visible/badge:opacity-100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11.5 2.5 13.5 4.5 5.5 12.5 2.5 13.5 3.5 10.5Z" />
      </svg>
    </Link>
  );
}

function Progress({ kits, main, st }: { kits: Container[]; main: ListEntry[]; st: (e: ListEntry) => ItemState }) {
  const active = main.filter((e) => st(e) !== "skip");
  const have = active.filter((e) => st(e) === "have").length;
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {kits.map((c) => {
        const list = active.filter((e) => e.container === c);
        const done = list.filter((e) => st(e) === "have").length;
        const pct = list.length ? Math.round((done / list.length) * 100) : 0;
        return (
          <div key={c}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold">{CONTAINER_META[c].name}</span>
              <span className="text-[0.95rem] tabular-nums text-ink-soft">
                {done} of {list.length} {c === "home" ? "done" : "ready"}
              </span>
            </div>
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-label={`${CONTAINER_META[c].name} progress`}
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-full rounded-full bg-eucalyptus" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
      {have > 0 && (
        <p className="text-[0.95rem] text-ink-soft sm:col-span-2 lg:col-span-4">
          You already have {have} of {active.length} things on this list.
        </p>
      )}
    </div>
  );
}

function StartHere({
  firsts,
  st,
  row,
  answers,
}: {
  firsts: ListEntry[];
  st: (e: ListEntry) => ItemState;
  row: RowProps;
  answers: Answers;
}) {
  if (firsts.length === 0) return null;
  const allDone = firsts.every((e) => st(e) === "have");
  const when = answers.start === "weekend" || answers.start === null ? "this weekend" : "first";

  return (
    <section className="mt-10 rounded-xl border-2 border-orange bg-paper p-5 sm:p-6" aria-labelledby="start-here">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="start-here" className="text-2xl font-extrabold tracking-tight">
            {allDone ? "Free steps done. Nice work." : `Start here ${when}`}
          </h2>
          <p className="mt-1 text-ink-soft">These are free and take about an hour all together.</p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="no-print"
          onClick={() =>
            downloadIcs(
              "emergency-prep-first-step.ics",
              "Emergency prep: first steps",
              firsts.map((e) => `- ${e.item.name}`).join("\n") + `\n\nYour list: ${siteUrl("/list")}\n\n${CREDIT}`,
              firstStepDate(answers.start),
            )
          }
        >
          Add to calendar
        </Button>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {firsts.map((e) => (
          <ItemRow key={e.key} {...row(e)} />
        ))}
      </ul>
    </section>
  );
}

function sortByCategory(entries: ListEntry[]) {
  return [...entries].sort((a, b) => CATEGORY_ORDER.indexOf(a.item.category) - CATEGORY_ORDER.indexOf(b.item.category));
}

function groupByCategory(entries: ListEntry[]) {
  return CATEGORY_ORDER.map((cat) => [cat, entries.filter((e) => e.item.category === cat)] as const).filter(
    ([, list]) => list.length > 0,
  );
}

function KitSection({
  container,
  entries,
  shownAbove,
  levelUp,
  st,
  row,
  ctx,
  onLevelUp,
}: {
  container: Container;
  entries: ListEntry[];
  shownAbove: number;
  levelUp: ListEntry[];
  st: (e: ListEntry) => ItemState;
  row: RowProps;
  ctx: Context;
  onLevelUp: () => void;
}) {
  const meta = CONTAINER_META[container];
  const active = entries.filter((e) => st(e) !== "skip");
  const skipped = entries.filter((e) => st(e) === "skip");
  const need = active.filter((e) => st(e) === "need");
  const levelUpActive = levelUp.filter((e) => st(e) !== "skip");

  return (
    <section className="mb-16" aria-labelledby={`kit-${container}`}>
      <h2 id={`kit-${container}`} className="tag text-xl sm:text-2xl">
        {meta.name}
      </h2>
      <div className="mt-3 grid gap-1 text-ink-soft md:grid-cols-[1fr_auto] md:items-baseline md:gap-6">
        <p className="max-w-[64ch]">
          {meta.purpose} {meta.where}
        </p>
        {container !== "home" && need.length > 0 && (
          <p className="text-[0.95rem] font-semibold text-ink">Still to get: {formatCost(sumCost(need))}</p>
        )}
      </div>
      {container === "go" && ctx.carriers > 1 && (
        <p className="mt-3 max-w-[64ch] border-l-4 border-line pl-3 text-[0.95rem]">
          Pack {ctx.carriers} bags, one for each person who can carry one.
          {ctx.babies > 0 && " Babies' things ride in a grown-up's bag."}
        </p>
      )}
      {shownAbove > 0 && (
        <p className="mt-3 max-w-[64ch] text-[0.95rem] font-semibold">
          Plus the {shownAbove} free {shownAbove === 1 ? "step" : "steps"} in Start here above.
        </p>
      )}
      {container === "stay" && ctx.kits.includes("go") && (
        <p className="mt-3 max-w-[64ch] border-l-4 border-line pl-3 text-[0.95rem]">
          Your go bags live at home too, so this bin only adds what they don&apos;t cover: more water, food, and
          supplies for a longer stay.
        </p>
      )}
      {container === "go" && (
        <p className="mt-3 max-w-[64ch] border-l-4 border-line pl-3 text-[0.95rem]">
          If you spend a lot of time at work or a loved one&apos;s home, a second small bag there is worth it.
        </p>
      )}
      {container === "go" && ctx.needs.has("mobility") && (
        <p className="mt-3 max-w-[64ch] border-l-4 border-line pl-3 text-[0.95rem]">
          Keep the bag light and right by the exit you&apos;d use. A small rolling bag can be easier than a backpack.
        </p>
      )}

      {container === "go" && ctx.carriers > 1 ? (
        // Go bags for several people: what goes in every bag, and what the group needs just one of.
        <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-2">
          {(
            [
              ["In every bag", `One each for ${joinList(peopleNames(ctx).slice(0, ctx.carriers))}. Tap a name when that bag has it.`, true],
              ["One for the group", "You need just one of these. Decide whose bag each goes in.", false],
            ] as const
          ).map(([heading, desc, perPerson]) => {
            const list = sortByCategory(active.filter((e) => !!e.item.perPerson === perPerson));
            if (list.length === 0) return null;
            return (
              <div key={heading}>
                <h3 className="border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">{heading}</h3>
                <p className="mt-2 text-[0.95rem] text-ink-soft">{desc}</p>
                <ul className="divide-y divide-line">
                  {list.map((e) => (
                    <ItemRow key={e.key} {...row(e)} />
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 grid gap-x-12 lg:grid-cols-2">
          {groupByCategory(active).map(([cat, list]) => (
            <div key={cat} className="print-break-avoid mb-6">
              <h3 className="border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">{CATEGORY_META[cat]}</h3>
              <ul className="divide-y divide-line">
                {list.map((e) => (
                  <ItemRow key={e.key} {...row(e)} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {levelUpActive.length > 0 && (
        <details className="no-print mt-2 rounded-lg bg-paper-2 px-5 py-4">
          <summary className="cursor-pointer font-semibold">
            Level up: {levelUpActive.length} more for when you&apos;re ready
            <span className="font-normal text-ink-soft"> (roughly {formatCost(sumCost(levelUpActive))})</span>
          </summary>
          <p className="mt-2 max-w-[64ch] text-[0.95rem] text-ink-soft">
            These go beyond the basics: more days of supplies, backups, and extra gear.{" "}
            <button type="button" onClick={onLevelUp} className="font-semibold text-ink underline underline-offset-2">
              Switch to Advanced
            </button>{" "}
            to make them part of your main list.
          </p>
          <ul className="mt-2 divide-y divide-line">
            {levelUpActive.map((e) => (
              <ItemRow key={e.key} {...row(e)} />
            ))}
          </ul>
        </details>
      )}

      {skipped.length > 0 && (
        <details className="no-print mt-3 px-1">
          <summary className="cursor-pointer text-ink-soft hover:text-ink">Skipped ({skipped.length})</summary>
          <p className="mt-1 text-[0.95rem] text-ink-soft">Tucked away here. Bring any back whenever you like.</p>
          <ul className="divide-y divide-line">
            {skipped.map((e) => (
              <ItemRow key={e.key} {...row(e)} />
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

function ShoppingList({
  entries,
  st,
  copy,
}: {
  entries: ListEntry[];
  st: (e: ListEntry) => ItemState;
  copy: (text: string) => void;
}) {
  const need = entries.filter((e) => st(e) === "need" && e.container !== "home" && e.cost[1] > 0);
  // One line per item, even when it goes in more than one kit.
  const byItem = new Map<string, ListEntry[]>();
  for (const e of need) byItem.set(e.item.id, [...(byItem.get(e.item.id) ?? []), e]);
  const groups = SHOP_ORDER.map((shop) => [shop, [...byItem.values()].filter((l) => l[0].item.shop === shop)] as const).filter(
    ([, l]) => l.length > 0,
  );
  const total = sumCost(need);

  if (groups.length === 0)
    return <p className="text-lg">Nothing left to buy. Everything on your list is marked as have or skipped.</p>;

  const text = groups
    .map(([shop, lists]) =>
      [SHOP_META[shop], ...lists.map((l) => `[ ] ${l[0].item.name}${l.map((e) => (e.qty ? ` (${CONTAINER_META[e.container].name}: ${e.qty.text})` : "")).join("")}`)].join("\n"),
    )
    .join("\n\n")
    .concat(`\n\n${CREDIT}`);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-lg">
          <span className="font-semibold">{byItem.size} things to buy,</span> roughly {formatCost(total)} in all.
        </p>
        <Button type="button" variant="secondary" className="no-print" onClick={() => copy(text)}>
          Copy shopping list
        </Button>
      </div>
      <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-2">
        {groups.map(([shop, lists]) => (
          <section key={shop} className="print-break-avoid">
            <h2 className="flex items-baseline justify-between border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">
              {SHOP_META[shop]}
              <span className="text-[0.95rem] font-semibold text-ink-soft">{formatCost(sumCost(lists.flat()))}</span>
            </h2>
            <ul className="divide-y divide-line">
              {lists.map((l) => (
                <li key={l[0].item.id} className="py-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="font-semibold">{l[0].item.name}</span>
                    <span className="text-[0.95rem] text-ink-soft">{formatCost(sumCost(l))}</span>
                  </div>
                  <div className="mt-0.5 text-[0.9rem] text-ink-soft">
                    {l.map((e) => (
                      <span key={e.key} className="mr-4 inline-block">
                        {CONTAINER_META[e.container].name}
                        {e.qty ? `: ${e.qty.text}` : ""}
                        {e.qty?.buy ? ` (${e.qty.buy})` : ""}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function Plan({
  entries,
  firstKeys,
  st,
  row,
  answers,
}: {
  entries: ListEntry[];
  firstKeys: Set<string>;
  st: (e: ListEntry) => ItemState;
  row: RowProps;
  answers: Answers;
}) {
  const stages: Stage[] = ["weekend", "month", "later"];

  return (
    <ol className="grid gap-12">
      {stages.map((stage, i) => {
        const list = entries.filter((e) => planStage(e, firstKeys, answers) === stage && st(e) !== "skip");
        if (list.length === 0) return null;
        const need = list.filter((e) => st(e) === "need");
        return (
          <li key={stage} className="grid gap-4 md:grid-cols-[14rem_1fr] md:gap-10">
            <div>
              <p className="text-[0.95rem] font-semibold text-orange">Step {i + 1}</p>
              <h2 className="text-2xl font-extrabold tracking-tight">{STAGE_META[stage].name}</h2>
              <p className="mt-1 text-ink-soft">{STAGE_META[stage].desc}</p>
              <p className="mt-2 text-[0.95rem] font-semibold">
                {need.length === 0 ? "All done" : `${need.length} to go · ${formatCost(sumCost(need))}`}
              </p>
            </div>
            <div className="grid gap-8">
              {planGroups(list).map(([heading, group]) => (
                <div key={heading ?? "all"}>
                  {heading && (
                    <h3 className="flex items-baseline justify-between border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">
                      {heading}
                      <span className="text-[0.95rem] font-semibold text-ink-soft">{group.length}</span>
                    </h3>
                  )}
                  <ul className="divide-y divide-line">
                    {group.map((e) => (
                      <ItemRow key={e.key} {...row(e)} showContainer />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Long plan steps split into what's free (tasks and things already at home) and
 * what to buy, with the buying sorted by store so it reads like a shopping trip.
 */
function planGroups(list: ListEntry[]): [string | null, ListEntry[]][] {
  const free = list.filter((e) => e.cost[1] === 0);
  const buy = list.filter((e) => e.cost[1] > 0).sort((a, b) => SHOP_ORDER.indexOf(a.item.shop) - SHOP_ORDER.indexOf(b.item.shop));
  if (list.length <= 10 || free.length === 0 || buy.length === 0) return [[null, list]];
  return [
    ["Do or gather, free", free],
    ["To buy", buy],
  ];
}

function Together() {
  return (
    <p className="mt-6 max-w-[70ch] border-l-4 border-eucalyptus pl-4 text-ink-soft">
      <span className="font-semibold text-ink">You don&apos;t have to do this alone.</span> Neighbors who know each
      other get through disasters better, and sharing costs less than buying everything yourself. Start by swapping
      numbers with one neighbor, and send them your list.
    </p>
  );
}

/** What to do when it happens. Its own print button prints just this card. */
function FirstHour({ ctx }: { ctx: Context }) {
  const sections = firstHourCard(ctx);
  if (sections.length === 0) return null;
  const printCard = () => {
    document.body.dataset.print = "card";
    window.addEventListener("afterprint", () => delete document.body.dataset.print, { once: true });
    window.print();
  };
  return (
    <section id="first-hour" className="print-break-avoid mt-14 rounded-xl border-2 border-ink bg-paper p-5 sm:p-6" aria-labelledby="first-hour-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="first-hour-title" className="text-2xl font-extrabold tracking-tight">
            When it happens
          </h2>
          <p className="mt-1 text-ink-soft">Print this card and tape it inside the lid of your bin.</p>
        </div>
        <Button type="button" variant="secondary" className="no-print" onClick={printCard}>
          Print this card
        </Button>
      </div>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {sections.map((s) => (
          <div key={s.title}>
            <h3 className="font-extrabold">{s.title}</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5">
              {s.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}

function KeepFresh() {
  return (
    <section className="mt-6 border-t border-line pt-10" aria-labelledby="keep-fresh">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <h2 id="keep-fresh" className="text-2xl font-extrabold tracking-tight">
            Keep it fresh
          </h2>
          <p className="mt-2 max-w-[64ch] text-ink-soft">
            Check your kits when the clocks change in spring and fall. Look at expiration dates, swap stored water,
            test flashlights and radios, refill prescriptions, and update clothes for kids who&apos;ve grown. An easy
            habit: eat the oldest food from your bin and replace it on your next shop.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="no-print"
          onClick={() => {
            const d = new Date();
            d.setMonth(d.getMonth() + 6);
            d.setHours(10, 0, 0, 0);
            downloadIcs(
              "emergency-kit-check.ics",
              "Emergency kit 6-month check",
              "Check dates on food, water, and medicine. Test flashlights and radios. Swap batteries. Update clothes and documents." +
                `\n\nYour list: ${siteUrl("/list")}\n\n${CREDIT}`,
              d,
              45,
              6,
            );
          }}
        >
          Set a 6-month reminder
        </Button>
      </div>
    </section>
  );
}

function NamesDialog({
  answers,
  onChange,
  onClose,
}: {
  answers: Answers;
  onChange: (names: Names) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="names-title"
      className="m-auto w-[min(38rem,calc(100vw-2rem))] rounded-xl bg-fog p-0 text-ink backdrop:bg-ink/40"
    >
      <form method="dialog" className="p-5 sm:p-6">
        <h2 id="names-title" className="text-2xl font-extrabold tracking-tight">
          Names
        </h2>
        <p className="mt-1 text-[0.95rem] text-ink-soft">
          Shown on your list and in the spreadsheet. Leave one blank to use Me, Adult 2, and so on.
        </p>
        <div className="mt-4">
          <NamesEditor household={answers.household} names={answers.names} onChange={onChange} />
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit">Done</Button>
        </div>
      </form>
    </dialog>
  );
}

function EmptyState({ onStarter }: { onStarter: () => void }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-[2.2rem] font-extrabold leading-tight tracking-tight">You haven&apos;t built a list yet</h1>
      <p className="mt-3 text-lg text-ink-soft">
        Answer a few quick questions to get one sized for your household, or start from a simple one-person list and
        change it later.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Link href="/build" className={buttonClass.primary}>
          Start the questions
        </Link>
        <button type="button" onClick={onStarter} className="text-ink-soft underline underline-offset-2 hover:text-ink">
          Show a starter list
        </button>
      </div>
    </div>
  );
}

function asText(kits: Container[], main: ListEntry[], st: (e: ListEntry) => ItemState, ctx: Context): string {
  const county = ctx.answers.county ? COUNTY_BY_ID[ctx.answers.county] : undefined;
  const lines: string[] = ["My emergency list (Bay Ready)", ""];
  for (const c of kits) {
    lines.push(CONTAINER_META[c].name.toUpperCase());
    for (const [cat, list] of groupByCategory(main.filter((e) => e.container === c && st(e) !== "skip"))) {
      lines.push(`  ${CATEGORY_META[cat]}`);
      for (const e of list) {
        lines.push(`  [${st(e) === "have" ? "x" : " "}] ${e.item.name}${e.qty ? ` (${e.qty.text})` : ""}`);
      }
    }
    lines.push("");
  }
  if (county?.alert) lines.push(`Emergency alerts: ${county.alert.name} ${county.alert.url}`, "");
  lines.push(CREDIT);
  return lines.join("\n");
}


function joinList(xs: string[]) {
  if (xs.length <= 1) return xs.join("");
  return `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}
