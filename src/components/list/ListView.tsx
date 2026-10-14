"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ComponentProps, type MouseEvent } from "react";
import {
  ANSWERS_KEY,
  normalizeAnswers,
  EMPTY_ANSWERS,
  peopleNames,
  STARTER_ANSWERS,
  STATES_KEY,
  deriveContext,
  resolveBuild,
} from "@/lib/answers";
import { CONTAINER_ORDER, buildList, firstSteps, formatCost, planStage, slotDone, slotKey, stateOf, sumCost } from "@/lib/buildList";
import { firstStepDate, twiceYearlyChecks } from "@/lib/ics";
import { AddToCalendar } from "@/components/AddToCalendar";
import { MenuButton, type MenuItem } from "@/components/MenuButton";
import { downloadPdf, printPdf, type PdfPart } from "@/lib/exportPdf";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CheckIcon, CopyTextIcon, LinkIcon, PdfIcon, PrinterIcon, SheetIcon } from "@/components/icons";
import { decodeShare, encodeShare } from "@/lib/share";
import { clearAllStored, useStored } from "@/lib/storage";
import type { Answers, Container, Context, ItemState, ListEntry, Names, Stage } from "@/lib/types";
import { COUNTY_BY_ID } from "@/data/counties";
import { HAZARD_BY_ID } from "@/data/hazards";
import { ITEMS } from "@/data/items";
import { isEssential } from "@/data/essentials";
import { firstHourCard } from "@/data/firstHour";
import { CATEGORY_META, CATEGORY_ORDER, CONTAINER_META, SHOP_META, SHOP_ORDER, STAGE_META } from "@/data/meta";
import { Button, CheckBox, buttonClass } from "@/components/controls";
import { useStandalone } from "@/components/useStandalone";
import { ItemRow } from "./ItemRow";
import { Essentials } from "./Essentials";
import { SaveYourList } from "./SaveYourList";
import { ShareDialog } from "./ShareDialog";
import {
  LIST_ANCHORS,
  SAVE_PROMPT_KEY,
  STORAGE_PREFIX,
  hasPersonalInfo,
  shareCodeFrom,
  shouldOfferSave,
  withoutPersonalInfo,
} from "./sharing";
import { BAY_READY_URL, CREDIT, sitePath, siteUrl } from "@/lib/urls";
import { clearReturnToList, markReturnToList } from "@/lib/returnToList";
import { NamesEditor } from "@/components/NamesEditor";
import {
  EMPTY_HOME,
  HOME_KEY,
  factFields,
  hasHomeInfo as anyHomeInfo,
  homeFacts,
  normalizeHome,
  setField,
  type FactField,
  type HomeInfo,
} from "@/data/homeFacts";
import { KnowYourHome, TaskFacts } from "./HomeFields";

type States = Record<string, ItemState>;
type RowProps = (e: ListEntry) => ComponentProps<typeof ItemRow>;
type Shared = { answers: Answers; states: States };
const EMPTY_STATES: States = {};
type Export = "print" | "pdf" | "xlsx" | "refresh";
type View = "kits" | "shop" | "plan";

/** A list carried in the address bar's #, or null for no hash or a jump to a spot on the page. */
function readSharedHash(): Shared | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.slice(1);
  if (!hash || LIST_ANCHORS.has(hash)) return null;
  return decodeShare(hash);
}

/** Scrolls to a section and moves focus to its heading, without touching the # (which may hold a list). */
function jumpTo(id: string) {
  return (e: MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    el.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  };
}

export function ListView() {
  const [storedAnswers, setStoredAnswers] = useStored<Answers>(ANSWERS_KEY, EMPTY_ANSWERS, normalizeAnswers);
  const [storedStates, setStoredStates] = useStored<States>(STATES_KEY, EMPTY_STATES);
  // A shared link carries its own answers in the URL fragment; read it once on the client.
  const [shared, setShared] = useState<Shared | null>(readSharedHash);
  const [view, setView] = useState<View>("kits");
  const [copied, setCopied] = useState<string | null>(null);
  const [busy, setBusy] = useState<Export | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [sharing, setSharing] = useState<{ url: string; privateUrl: string; copied: boolean; personal: boolean } | null>(null);
  const [editingNames, setEditingNames] = useState(false);
  const [confirming, setConfirming] = useState<"replace" | "clear" | null>(null);
  const [cleared, setCleared] = useState(false);
  const [home, setHome] = useStored<HomeInfo>(HOME_KEY, EMPTY_HOME, normalizeHome);
  const [saveDismissed, setSaveDismissed] = useStored<boolean>(SAVE_PROMPT_KEY, false);
  // Counts clicks on a task's "Print these for your kit" link; the card flashes its print button.
  const [printPulse, setPrintPulse] = useState(0);
  // Back on the list, so the wizard's "Back to my list" shortcut is no longer needed.
  useEffect(() => clearReturnToList(), []);

  // Opening a link to the list already saved here (a calendar reminder, a bookmark) is just your own list.
  const sameAsMine =
    !!shared &&
    !!storedAnswers &&
    !!storedStates &&
    storedAnswers.build !== null &&
    encodeShare(storedAnswers, storedStates) === encodeShare(shared.answers, shared.states);
  if (sameAsMine) setShared(null);

  // Once a shared list is made yours, cleared, or turns out to be yours, take its code out of the
  // address bar so a reload shows the list saved here.
  useEffect(() => {
    if (shared) return;
    const hash = window.location.hash.slice(1);
    if (hash && !LIST_ANCHORS.has(hash)) history.replaceState(null, "", sitePath("/list"));
  }, [shared]);

  const answers = shared ? shared.answers : storedAnswers;
  const states = shared ? shared.states : storedStates;

  const ctx = useMemo(() => (answers ? deriveContext(answers) : null), [answers]);
  const entries = useMemo(() => (ctx ? buildList(ctx, ITEMS) : []), [ctx]);

  // The page draws after saved data loads, too late for the browser's own jump to #first-hour.
  const ready = !!(answers && states && ctx);
  useEffect(() => {
    if (!ready) return;
    const hash = window.location.hash.slice(1);
    if (LIST_ANCHORS.has(hash)) document.getElementById(hash)?.scrollIntoView();
  }, [ready]);

  if (!answers || !states || !ctx) return <div className="min-h-[60vh]" aria-busy="true" />;

  if (!shared && answers.build === null)
    return (
      <EmptyState
        cleared={cleared}
        onStarter={() => setStoredAnswers(STARTER_ANSWERS)}
        onRestore={(list) => {
          setShared(list);
          setCleared(false);
        }}
      />
    );

  const setStates = (patch: States) => {
    if (shared) setShared((prev) => prev && { ...prev, states: { ...prev.states, ...patch } });
    else setStoredStates((prev) => ({ ...prev, ...patch }));
  };
  /** Marking a whole entry marks each person's part the same way. Skipping leaves their parts alone. */
  const patchFor = (e: ListEntry, s: ItemState): States => {
    const patch: States = { [e.key]: s };
    if (s !== "skip") e.slots.forEach((_, i) => (patch[slotKey(e, i)] = s));
    return patch;
  };
  const setLevel = (level: Answers["level"]) => {
    if (shared) setShared((prev) => prev && { ...prev, answers: { ...prev.answers, level } });
    else setStoredAnswers((prev) => ({ ...prev, level }));
  };
  const makeItMine = () => {
    if (!shared) return;
    setStoredAnswers(shared.answers);
    setStoredStates(shared.states);
    setShared(null);
    setConfirming(null);
  };
  const clearDevice = () => {
    clearAllStored(STORAGE_PREFIX);
    clearReturnToList();
    setShared(null);
    setConfirming(null);
    setCleared(true);
  };

  const st = (e: ListEntry) => stateOf(e, states, answers);

  // Know your home: device-only answers, shown on their task and in one card. Not for shared lists.
  const facts = homeFacts(ctx);
  const homeInfo = home ?? EMPTY_HOME;
  const onField = (field: FactField, value: string) => setHome((prev) => setField(prev, field, value));

  /** Props for one item row. Per-person rows tick everyone at once from the main checkbox. */
  const row: RowProps = (e) => ({
    entry: e,
    state: st(e),
    ctx,
    essential: isEssential(e),
    // "Bottled water" in the wizard's have step pre-checks water, which may not be the full amount.
    note:
      e.item.haveKey === "water" && states[e.key] === undefined && answers.have.includes("water") ? (
        <span className="font-semibold">You said you have some. Check you have the full amount.</span>
      ) : undefined,
    slotDone: (i) => slotDone(e, i, states, answers),
    onEditNames: shared ? undefined : () => setEditingNames(true),
    extra: shared ? undefined : (
      <TaskFacts
        fields={factFields(facts.filter((f) => f.task === e.item.id), ctx, homeInfo)}
        onChange={onField}
        onShowPrint={() => setPrintPulse((n) => n + 1)}
      />
    ),
    onSlot: (i, done) => setStates({ [slotKey(e, i)]: done ? "have" : "need" }),
    onChange: (s) => setStates(patchFor(e, s)),
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
  const privateShareUrl = () => `${siteUrl("/list")}#${encodeShare(withoutPersonalInfo(answers), states)}`;
  const hasHomeInfo = !shared && anyHomeInfo(homeInfo);
  /** What the PDF, printout, and spreadsheet are made from. */
  const exportInput = () => ({
    answers,
    ctx,
    entries: main,
    stateOf: st,
    slotDone: (e: ListEntry, i: number) => slotDone(e, i, states, answers),
    home: shared ? undefined : homeInfo,
    shareUrl: shareUrl(),
  });
  /** Runs one export at a time, with a message when it's done or fails. */
  const run = async (kind: Export, task: () => Promise<void>, done: string) => {
    setBusy(kind);
    try {
      await task();
      if (done) flash(done);
    } catch {
      flash("Something went wrong. Try again.");
    } finally {
      setBusy(null);
    }
  };
  const hasFirstHour = firstHourCard(ctx).length > 0;
  const activeCount = main.filter((e) => st(e) !== "skip").length;
  const levelUpCount = levelUp.filter((e) => st(e) !== "skip").length;

  return (
    // In print, a flex column lets Know your home move up under the header.
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6 print:flex print:flex-col">
      {shared && (
        <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-ink bg-paper p-4">
          <p>
            <span className="font-semibold">You&apos;re looking at a list from a link.</span>{" "}
            <span className="text-ink-soft">Changes here aren&apos;t saved until you make it yours.</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => (storedAnswers?.build != null ? setConfirming("replace") : makeItMine())}
            >
              Make it my list
            </Button>
            <Link href="/build" className={buttonClass.secondary}>
              Build my own
            </Link>
          </div>
        </div>
      )}

      <Header ctx={ctx} answers={answers} readOnly={!!shared} hasFirstHour={hasFirstHour} />

      <StartHere firsts={firsts} st={st} row={row} answers={answers} listUrl={shareUrl()} />

      <Essentials entries={main.filter(isEssential)} st={st} row={row} budget={answers.budget} />

      {shouldOfferSave({ shared: !!shared, dismissed: !!saveDismissed, states }) && (
        <SaveYourList url={shareUrl()} onDismiss={() => setSaveDismissed(true)} />
      )}

      <div className="no-print mt-10 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            // Only explain what's in the link, or left out of it, when there's something to explain.
            const url = shareUrl();
            const personal = hasPersonalInfo(answers);
            const open = (ok: boolean) => setSharing({ url, privateUrl: privateShareUrl(), copied: ok, personal });
            navigator.clipboard.writeText(url).then(
              () => {
                if (personal || hasHomeInfo) return open(true);
                flash("Link copied. Anyone with it can see this list.");
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2500);
              },
              () => open(false),
            );
          }}
        >
          {linkCopied ? <CheckIcon /> : <LinkIcon />}
          {linkCopied ? "Link copied" : "Copy share link"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => copy(asText(kits, main, st, ctx), "List copied as text.")}>
          <CopyTextIcon />
          Copy as text
        </Button>
        {/* Print and the PDF are the same file, short or complete. They're imported up front, not on click,
            because printing on Safari opens a tab, and that only works during the click itself. */}
        <MenuButton
          label={busy === "print" ? "Getting it ready…" : "Print"}
          icon={<PrinterIcon />}
          align="left"
          disabled={busy !== null}
          items={pdfChoices((part) => run("print", () => printPdf(exportInput(), part), ""))}
        />
        <MenuButton
          label={busy === "pdf" ? "Making PDF…" : "Download PDF"}
          icon={<PdfIcon />}
          align="left"
          disabled={busy !== null}
          items={pdfChoices((part) => run("pdf", () => downloadPdf(exportInput(), part), "PDF downloaded."))}
        />
        <Button
          type="button"
          variant="primary"
          disabled={busy !== null}
          onClick={() =>
            run(
              "xlsx",
              () => import("@/lib/exportXlsx").then((m) => m.downloadWorkbook(exportInput())),
              "Spreadsheet downloaded. It opens in Google Sheets, Excel, or Numbers.",
            )
          }
        >
          <SheetIcon />
          {busy === "xlsx" ? "Making spreadsheet…" : "Download spreadsheet"}
        </Button>
        <p role="status" className="self-center text-[0.95rem] text-eucalyptus">
          {copied}
        </p>
      </div>

      <Together />

      <section id="full-list" className="mt-14 scroll-mt-4 border-t border-line pt-10" aria-labelledby="full-list-title">
        <div className="no-print grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h2 id="full-list-title" tabIndex={-1} className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Your full list <span className="font-semibold text-ink-soft">· {activeCount} things</span>
            </h2>
            <p className="mt-2 max-w-[64ch] text-ink-soft">
              Everything for your household, with the essentials marked. There&apos;s no rush: work through it a bit
              at a time, and skip anything that doesn&apos;t fit your life.
              {levelUpCount > 0 && ` When you're ready, ${levelUpCount} more ideas wait at the end of each kit.`}
            </p>
          </div>
          <LevelToggle answers={answers} onLevel={setLevel} />
        </div>

        <Progress kits={kits} main={main} st={st} />

        <div
          className="no-print mt-8 flex flex-wrap gap-1 rounded-lg bg-paper p-1 sm:inline-flex"
          role="group"
          aria-label="How to show your list"
        >
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
            <ShoppingList
              entries={main}
              st={st}
              onGot={(list, got) => setStates(Object.assign({}, ...list.map((e) => patchFor(e, got ? "have" : "need"))))}
              copy={(t) => copy(t, "Shopping list copied.")}
            />
          )}
          {view === "plan" && (
            <Plan entries={[...main, ...levelUp]} firstKeys={firstKeys} st={st} row={row} answers={answers} />
          )}
        </div>
      </section>

      <FirstHour ctx={ctx} />

      {!shared && (
        <KnowYourHome
          fields={factFields(facts, ctx, homeInfo)}
          home={homeInfo}
          onField={onField}
          onNotes={(notes) => setHome((prev) => ({ ...prev, notes }))}
          pulse={printPulse}
        />
      )}

      <KeepFresh
        busy={busy === "refresh"}
        listUrl={shareUrl()}
        onPrint={() => run("refresh", () => printPdf(exportInput(), "refresh"), "")}
      />

      {!shared && (
        <p className="no-print mt-12 border-t border-line pt-6 text-[0.95rem] text-ink-soft">
          On a shared phone or computer?{" "}
          <button
            type="button"
            onClick={() => setConfirming("clear")}
            className="inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-2"
          >
            Clear everything on this device
          </button>
        </p>
      )}

      {/* The site footer doesn't print, so printed lists get their own credit. */}
      <p className="hidden pt-8 text-sm print:block">
        Made with Bay Ready, a free emergency kit planner for the Bay Area: {BAY_READY_URL}
      </p>

      {sharing && <ShareDialog {...sharing} leftOut={hasHomeInfo} onClose={() => setSharing(null)} />}

      {editingNames && (
        <NamesDialog
          answers={answers}
          onChange={(names) => setStoredAnswers((prev) => ({ ...prev, names }))}
          onClose={() => setEditingNames(false)}
        />
      )}

      {confirming === "replace" && storedAnswers && storedStates && (
        <ConfirmDialog
          title="Replace your list?"
          confirmLabel="Replace my list"
          cancelLabel="Keep my list"
          onConfirm={makeItMine}
          onCancel={() => setConfirming(null)}
        >
          <p>
            This device already has a list. Making this one yours replaces it, along with its checkmarks. Your Know
            your home info stays.
          </p>
          <CopyLink
            url={`${siteUrl("/list")}#${encodeShare(storedAnswers, storedStates)}`}
            label="Copy the link to my current list first"
          />
        </ConfirmDialog>
      )}

      {confirming === "clear" && (
        <ConfirmDialog
          title="Clear everything on this device?"
          confirmLabel="Clear everything"
          onConfirm={clearDevice}
          onCancel={() => setConfirming(null)}
        >
          <p>
            This deletes your answers, checkmarks, and Know your home info from this browser. It can&apos;t be undone.
          </p>
          <p>To keep your list, copy its link first. Know your home info isn&apos;t in the link.</p>
          <CopyLink url={shareUrl()} label="Copy my list link" />
        </ConfirmDialog>
      )}
    </div>
  );
}

/** A quiet "copy this link" button that says when it worked. */
function CopyLink({ url, label }: { url: string; label: string }) {
  const [state, setState] = useState<"" | "copied" | "failed">("");
  return (
    <p>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(url).then(() => setState("copied"), () => setState("failed"))}
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink underline underline-offset-2"
      >
        {state === "copied" ? <CheckIcon /> : <LinkIcon />}
        {state === "copied" ? "Link copied" : label}
      </button>
      <span role="status" className="ml-2">
        {state === "failed" && "Your browser didn't let us copy it."}
      </span>
    </p>
  );
}

function Header({
  ctx,
  answers,
  readOnly,
  hasFirstHour,
}: {
  ctx: Context;
  answers: Answers;
  readOnly: boolean;
  hasFirstHour: boolean;
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

  // One badge per answer, each jumping to the wizard step that sets it. The values read on
  // their own, so the labels are only for screen readers.
  const groups: { label: string; step: string; value: string }[] = [
    { label: "Building", step: "kit", value: kitNames.join(" + ") },
    { label: "For", step: "household", value: people.join(", ") },
    { label: "Hazards", step: "hazards", value: hazards.join(", ") },
    ...(build !== "go"
      ? [{ label: "Days", step: answers.level === "advanced" ? "days" : "level", value: `${ctx.stayDays} days at home` }]
      : []),
    ...(county ? [{ label: "County", step: "county", value: `${county.name} County` }] : []),
  ];

  return (
    <div className="print:-order-2">
      <h1 className="text-[2.2rem] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-[2.8rem]">Your emergency list</h1>
      <div className="mt-2 flex items-center gap-x-2 sm:flex-wrap">
        <span className="shrink-0 text-[0.9rem] font-semibold text-ink-soft">Planning for</span>
        {/* On phones the answers scroll sideways on one line instead of taking up the first screen. */}
        <ul
          aria-label="Your answers"
          className="-my-1 flex min-w-0 items-center gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible print:flex-wrap"
        >
          {groups.map((g) => (
            <li key={g.label} className="shrink-0">
              <AnswerBadge value={g.value} href={readOnly ? undefined : `/build${g.step ? `/${g.step}` : ""}`} label={g.label} />
            </li>
          ))}
          {!readOnly && (
            <li className="no-print shrink-0">
              <Link
                href="/build"
                onClick={markReturnToList}
                className="inline-flex min-h-11 items-center px-1 text-[0.9rem] font-semibold text-ink underline underline-offset-2"
              >
                Change answers
              </Link>
            </li>
          )}
        </ul>
      </div>
      {hasFirstHour && (
        <a
          href="#first-hour"
          onClick={jumpTo("first-hour")}
          className="no-print inline-flex min-h-11 items-center gap-1.5 text-[0.95rem] font-semibold text-ink underline underline-offset-2"
        >
          Happening now? See what to do first
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M8 3v10M4 9l4 4 4-4" />
          </svg>
        </a>
      )}
    </div>
  );
}

/** One answer shown as a badge. Links to the wizard step that sets it; the pencil says it's editable. */
function AnswerBadge({ value, href, label }: { value: string; href?: string; label: string }) {
  const pill =
    "inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-full border bg-paper px-3 text-[0.85rem] font-semibold text-ink";
  if (!href) return <span className={`${pill} border-line`}>{value}</span>;
  return (
    <Link
      href={href}
      onClick={markReturnToList}
      aria-label={`${label}: ${value}. Change`}
      className="group/badge inline-flex min-h-11 items-center"
    >
      <span className={`${pill} border-field-line transition-colors group-hover/badge:border-ink group-hover/badge:bg-paper-2`}>
        {value}
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="no-print size-3 text-ink-soft group-hover/badge:text-ink"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11.5 2.5 13.5 4.5 5.5 12.5 2.5 13.5 3.5 10.5Z" />
        </svg>
      </span>
    </Link>
  );
}

/** Basics or Advanced, named by how much it covers. */
function LevelToggle({ answers, onLevel }: { answers: Answers; onLevel: (l: Answers["level"]) => void }) {
  const goOnly = resolveBuild(answers) === "go";
  const size = {
    basics: goOnly ? "The core" : "1 week",
    advanced: goOnly ? "Plus extras" : `${answers.days === 7 ? "1 week" : "2 weeks"} + extras`,
  };
  return (
    <fieldset className="no-print">
      <legend className="mb-1.5 text-[0.95rem] font-semibold text-ink-soft">List size</legend>
      <div className="inline-flex rounded-lg border-2 border-ink p-0.5">
        {(["basics", "advanced"] as const).map((l) => (
          <label
            key={l}
            className={`min-h-11 cursor-pointer rounded-md px-4 py-1.5 text-center leading-tight has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-focus ${
              answers.level === l ? "bg-ink text-fog" : "text-ink-soft hover:text-ink"
            }`}
          >
            <input type="radio" name="level" className="sr-only" checked={answers.level === l} onChange={() => onLevel(l)} />
            <span className="block font-semibold">{l === "basics" ? "Basics" : "Advanced"}</span>
            <span className="block text-[0.85rem]">{size[l]}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Progress per kit. Hidden until something is checked, so nobody's first look
 * at their list is a row of empty bars.
 */
function Progress({ kits, main, st }: { kits: Container[]; main: ListEntry[]; st: (e: ListEntry) => ItemState }) {
  const active = main.filter((e) => st(e) !== "skip");
  const have = active.filter((e) => st(e) === "have").length;
  if (have === 0) return null;
  return (
    <div className="no-print mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
      <p className="text-[0.95rem] text-ink-soft sm:col-span-2 lg:col-span-4">
        You already have {have} of {active.length} things on this list.
      </p>
    </div>
  );
}

function StartHere({
  firsts,
  st,
  row,
  answers,
  listUrl,
}: {
  firsts: ListEntry[];
  st: (e: ListEntry) => ItemState;
  row: RowProps;
  answers: Answers;
  listUrl: string;
}) {
  if (firsts.length === 0) return null;
  const allDone = firsts.every((e) => st(e) === "have");
  const weekend = answers.start === "weekend" || answers.start === null;

  return (
    <section className="mt-8 rounded-xl border-2 border-orange bg-paper p-5 sm:p-6" aria-labelledby="start-here">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="start-here" className="text-2xl font-extrabold tracking-tight">
            {allDone ? "Free steps done. Nice work." : weekend ? "Start here this weekend" : "Start here"}
          </h2>
          <p className="mt-1 text-ink-soft">These are free. Most take 5 to 15 minutes each.</p>
        </div>
        <AddToCalendar
          className="no-print"
          event={{
            filename: "emergency-prep-first-step.ics",
            title: "Emergency prep: first steps",
            description: firsts.map((e) => `- ${e.item.name}`).join("\n") + `\n\nYour list: ${listUrl}\n\n${CREDIT}`,
            start: firstStepDate(answers.start),
          }}
        />
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
      <h3 id={`kit-${container}`} className="tag text-xl sm:text-2xl">
        {meta.name}
      </h3>
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
                <h4 className="border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">{heading}</h4>
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
              <h4 className="border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">{CATEGORY_META[cat]}</h4>
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
            When you&apos;re ready: {levelUpActive.length} more
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

/**
 * Everything still to buy, one line per item, grouped by store. Checking one off
 * marks it "have" everywhere; it stays here, crossed out, until the view changes,
 * so a mis-tap in the store is easy to undo.
 */
function ShoppingList({
  entries,
  st,
  onGot,
  copy,
}: {
  entries: ListEntry[];
  st: (e: ListEntry) => ItemState;
  onGot: (list: ListEntry[], got: boolean) => void;
  copy: (text: string) => void;
}) {
  const [got, setGot] = useState<Set<string>>(() => new Set());
  const buyable = entries.filter((e) => e.container !== "home" && e.cost[1] > 0);
  const shown = buyable.filter((e) => st(e) === "need" || (st(e) === "have" && got.has(e.item.id)));
  const need = shown.filter((e) => st(e) === "need");
  // One line per item, even when it goes in more than one kit.
  const byItem = new Map<string, ListEntry[]>();
  for (const e of shown) byItem.set(e.item.id, [...(byItem.get(e.item.id) ?? []), e]);
  const groups = SHOP_ORDER.map((shop) => [shop, [...byItem.values()].filter((l) => l[0].item.shop === shop)] as const).filter(
    ([, l]) => l.length > 0,
  );
  const toBuy = new Set(need.map((e) => e.item.id)).size;

  if (groups.length === 0)
    return <p className="text-lg">Nothing left to buy. Everything on your list is marked as have or skipped.</p>;

  const text = groups
    .map(([shop, lists]) => {
      const open = lists.map((l) => l.filter((e) => st(e) === "need")).filter((l) => l.length > 0);
      if (open.length === 0) return null;
      return [
        SHOP_META[shop],
        ...open.map((l) => `[ ] ${l[0].item.name}${l.map((e) => (e.qty ? ` (${CONTAINER_META[e.container].name}: ${e.qty.text})` : "")).join("")}`),
      ].join("\n");
    })
    .filter(Boolean)
    .join("\n\n")
    .concat(`\n\n${CREDIT}`);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-lg">
          {toBuy === 0 ? (
            <span className="font-semibold">All bought. Nice work.</span>
          ) : (
            <>
              <span className="font-semibold">{toBuy} things to buy,</span> roughly {formatCost(sumCost(need))} in all.
            </>
          )}
        </p>
        <Button type="button" variant="secondary" className="no-print" onClick={() => copy(text)}>
          Copy shopping list
        </Button>
      </div>
      <p className="no-print mt-1 text-[0.95rem] text-ink-soft">Check things off as you shop. They&apos;re marked as have on your list.</p>
      <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-2">
        {groups.map(([shop, lists]) => (
          <section key={shop} className="print-break-avoid">
            <h3 className="flex items-baseline justify-between border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">
              {SHOP_META[shop]}
              <span className="text-[0.95rem] font-semibold text-ink-soft">
                {formatCost(sumCost(lists.flat().filter((e) => st(e) === "need")))}
              </span>
            </h3>
            <ul className="divide-y divide-line">
              {lists.map((l) => (
                <ShoppingRow
                  key={l[0].item.id}
                  list={l}
                  have={l.every((e) => st(e) === "have")}
                  onChange={(on) => {
                    setGot((prev) => new Set(prev).add(l[0].item.id));
                    onGot(l, on);
                  }}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function ShoppingRow({ list, have, onChange }: { list: ListEntry[]; have: boolean; onChange: (have: boolean) => void }) {
  const id = `shop-${list[0].item.id}`;
  return (
    <li className="flex items-start gap-3 py-3">
      <input id={id} type="checkbox" className="peer sr-only" checked={have} onChange={(e) => onChange(e.target.checked)} />
      <label
        htmlFor={id}
        className="mt-0.5 cursor-pointer rounded peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
      >
        <CheckBox checked={have} tone="eucalyptus" />
        <span className="sr-only">Got it</span>
      </label>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <label htmlFor={id} className={`cursor-pointer ${have ? "text-ink-soft line-through decoration-1" : "font-semibold"}`}>
            {list[0].item.name}
          </label>
          <span className="text-[0.95rem] text-ink-soft">{formatCost(sumCost(list))}</span>
        </div>
        <div className="mt-0.5 text-[0.9rem] text-ink-soft">
          {list.map((e) => (
            <span key={e.key} className="mr-4 inline-block">
              {CONTAINER_META[e.container].name}
              {e.qty ? `: ${e.qty.text}` : ""}
              {e.qty?.buy ? ` (${e.qty.buy})` : ""}
            </span>
          ))}
        </div>
      </div>
    </li>
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
  // Number only the stages that have something in them, so the steps don't skip.
  const stages = (["weekend", "month", "later"] as Stage[])
    .map((stage) => [stage, entries.filter((e) => planStage(e, firstKeys, answers) === stage && st(e) !== "skip")] as const)
    .filter(([, list]) => list.length > 0);

  return (
    <ol className="grid gap-12">
      {stages.map(([stage, list], i) => {
        const need = list.filter((e) => st(e) === "need");
        return (
          <li key={stage} className="grid gap-4 md:grid-cols-[14rem_1fr] md:gap-10">
            <div>
              <p className="text-[0.95rem] font-semibold text-orange">Step {i + 1}</p>
              <h3 className="text-2xl font-extrabold tracking-tight">{STAGE_META[stage].name}</h3>
              <p className="mt-1 text-ink-soft">{STAGE_META[stage].desc}</p>
              <p className="mt-2 text-[0.95rem] font-semibold">
                {need.length === 0 ? "All done" : `${need.length} to go · ${formatCost(sumCost(need))}`}
              </p>
            </div>
            <div className="grid gap-8">
              {planGroups(list).map(([heading, group]) => (
                <div key={heading ?? "all"}>
                  {heading && (
                    <h4 className="flex items-baseline justify-between border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">
                      {heading}
                      <span className="text-[0.95rem] font-semibold text-ink-soft">{group.length}</span>
                    </h4>
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
    <section
      id="first-hour"
      className="print-break-avoid mt-14 scroll-mt-4 rounded-xl border-2 border-ink bg-paper p-5 sm:p-6"
      aria-labelledby="first-hour-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="first-hour-title" tabIndex={-1} className="text-2xl font-extrabold tracking-tight">
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

/**
 * Keeping food and batteries fresh happens over years, long after anyone has this
 * page open, so this section doesn't track anything. It shows what the printed
 * refresh log looks like once it's in use, prints a blank one, and offers
 * yearly calendar reminders that carry the list's link.
 */
function KeepFresh({ busy, listUrl, onPrint }: { busy: boolean; listUrl: string; onPrint: () => void }) {
  return (
    <section className="no-print mt-6 border-t border-line pt-10" aria-labelledby="keep-fresh">
      <h2 id="keep-fresh" className="text-2xl font-extrabold tracking-tight">
        Keep it fresh
      </h2>
      <div className="mt-2 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start">
        <div>
          <p className="max-w-[60ch] text-ink-soft">
            Food, water, medicine, and batteries all go bad eventually. Check your kits twice a year, when the clocks
            change in spring, and at ShakeOut in October: look at dates, swap stored water, test flashlights and
            radios, refill prescriptions, and update clothes for kids who&apos;ve grown. An easy habit is to eat the
            oldest food from your bin and replace it on your next shop.
          </p>
          <p className="mt-3 max-w-[60ch] text-ink-soft">
            Keep track on paper, in your bin. The refresh log lists what to check for your household. Each time, write
            the date and when it&apos;s next due in the next empty box, so there&apos;s nothing to cross out.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={busy} onClick={onPrint}>
              <PrinterIcon />
              {busy ? "Getting it ready…" : "Print the refresh log"}
            </Button>
            <AddToCalendar
              label="Add the twice-a-year reminders"
              variant="quiet"
              align="left"
              events={twiceYearlyChecks(listUrl, CREDIT)}
            />
          </div>
        </div>
        <RefreshLogExample />
      </div>
    </section>
  );
}

/** A made-up, filled-in refresh log, so people can see how the paper one works. */
function RefreshLogExample() {
  const pen = "font-[Bradley_Hand,Segoe_Print,Comic_Sans_MS,cursive] text-[0.95rem] text-focus";
  const rows: { item: string; every: string; checks: [string, string][] }[] = [
    { item: "Canned beans", every: "Every 24 months", checks: [["Mar 8 '26", "Mar '28"]] },
    { item: "Water from the tap", every: "Every 6 months", checks: [["Mar 8 '26", "Oct '26"], ["Oct 15 '26", "Mar '27"]] },
    { item: "Flashlights and radio", every: "Every 6 months", checks: [["Mar 8 '26", "Oct '26"], ["Oct 15 '26", "Mar '27"]] },
    { item: "Everyday medicines", every: "By the date on it", checks: [["Mar 8 '26", "Jan '27"]] },
    { item: "Granola bars", every: "", checks: [["Oct 15 '26", "Aug '27"]] },
  ];
  return (
    <figure className="relative">
      <div
        role="img"
        aria-label="Example: a printed refresh log with dates written in by hand"
        className="rotate-[0.6deg] overflow-hidden rounded-lg border border-line bg-paper p-4 shadow-[0_18px_40px_-24px_rgba(19,41,61,0.45)]"
      >
        <span className="absolute right-3 top-3 z-10 rounded-full bg-ink px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-widest text-paper">
          Example
        </span>
        <p className="font-extrabold">Keep it fresh</p>
        <div aria-hidden="true" className="mt-2 overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-left text-[0.78rem]">
            <thead>
              <tr className="border-b-2 border-ink text-[0.65rem] uppercase tracking-wider text-ink-soft">
                <th className="py-1 pr-2 font-bold">Item</th>
                <th className="py-1 pr-2 font-bold">Replace</th>
                <th className="py-1 font-bold" colSpan={3}>
                  Each check
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.item} className="border-b border-line align-top">
                  <td className={`py-1.5 pr-2 font-semibold ${r.every ? "" : pen}`}>{r.item}</td>
                  <td className="whitespace-nowrap py-1.5 pr-2 text-ink-soft">{r.every}</td>
                  {[0, 1, 2].map((k) => (
                    <td key={k} className="w-[19%] whitespace-nowrap border-l border-line px-1.5 py-1 text-[0.65rem] text-ink-soft">
                      <div>
                        On <span className={pen}>{r.checks[k]?.[0]}</span>
                      </div>
                      <div>
                        Next <span className={pen}>{r.checks[k]?.[1]}</span>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <figcaption className="mt-3 text-[0.88rem] text-ink-soft">
        A made-up example. Yours lists what&apos;s in your kits, with blank rows for your own food.
      </figcaption>
    </figure>
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

function EmptyState({
  cleared,
  onStarter,
  onRestore,
}: {
  cleared: boolean;
  onStarter: () => void;
  onRestore: (list: Shared) => void;
}) {
  const standalone = useStandalone();
  const [link, setLink] = useState("");
  const [error, setError] = useState(false);
  const restore = () => {
    const code = shareCodeFrom(link);
    const list = code ? decodeShare(code) : null;
    if (!code || !list) return setError(true);
    // Keep the code in the address bar until it's made yours, same as opening the link.
    history.replaceState(null, "", `${sitePath("/list")}#${code}`);
    onRestore(list);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {cleared && (
        <p role="status" className="mb-6 rounded-lg border-l-4 border-eucalyptus bg-paper px-4 py-3 font-semibold">
          Everything on this device is cleared.
        </p>
      )}
      <h1 className="text-[2.2rem] font-extrabold leading-tight tracking-tight">
        {standalone ? "Bring your list here" : "You haven't built a list yet"}
      </h1>
      <p className="mt-3 text-lg text-ink-soft">
        {standalone
          ? "This Home Screen app starts empty. Paste the link to your list below, or build a new one."
          : "Answer some short questions to get one sized for your household, or start from a simple one-person list and change it later."}
      </p>
      {!standalone && (
        <p className="mt-3 text-ink-soft">
          Made a list before? Some browsers clear saved lists after a while. Open the link you saved to bring it back,
          or paste it below.
        </p>
      )}
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Link href="/build" className={buttonClass.primary}>
          Start the questions
        </Link>
        <button
          type="button"
          onClick={onStarter}
          className="inline-flex min-h-11 items-center text-ink-soft underline underline-offset-2 hover:text-ink"
        >
          Show a starter list
        </button>
      </div>
      <form
        className="mt-10 max-w-xl"
        onSubmit={(e) => {
          e.preventDefault();
          restore();
        }}
      >
        <label htmlFor="restore-link" className="block font-semibold">
          Paste your list link
        </label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <input
            id="restore-link"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={link}
            aria-invalid={error || undefined}
            aria-describedby={error ? "restore-error" : undefined}
            onChange={(e) => {
              setLink(e.target.value);
              setError(false);
            }}
            className="min-h-11 min-w-0 flex-1 rounded-md border border-field-line bg-paper px-3 text-[0.95rem] text-ink focus:border-ink"
          />
          <Button type="submit" variant="secondary">
            Open it
          </Button>
        </div>
        {error && (
          <p id="restore-error" role="alert" className="mt-1.5 text-[0.95rem] font-semibold text-orange">
            That doesn&apos;t look like a Bay Ready list link. It should end with a # and a long code.
          </p>
        )}
      </form>
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

/** The two ways to print or save the PDF: just the essentials, or everything. */
function pdfChoices(choose: (part: PdfPart) => void): MenuItem[] {
  return [
    {
      key: "short",
      onSelect: () => choose("short"),
      label: (
        <>
          Short version <span className="text-ink-soft">(your plan, the card, and the essentials)</span>
        </>
      ),
    },
    {
      key: "list",
      onSelect: () => choose("list"),
      label: (
        <>
          Everything <span className="text-ink-soft">(the full list and refresh log)</span>
        </>
      ),
    },
  ];
}
