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
import { firstStepDate, firstStepsEvent, twiceYearlyChecks } from "@/lib/ics";
import { AddToCalendar } from "@/components/AddToCalendar";
import { Reveal } from "./Reveal";
import { MenuButton, type MenuItem } from "@/components/MenuButton";
import { downloadPdf, printPdf, type PdfPart } from "@/lib/exportPdf";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { CheckIcon, CopyTextIcon, LinkIcon, PdfIcon, PrinterIcon, SheetIcon } from "@/components/icons";
import { decodeShare, encodeShare } from "@/lib/share";
import { clearAllStored, useStored } from "@/lib/storage";
import type { Answers, Container, Context, ItemState, ListEntry, Names, Stage } from "@/lib/types";
import { COUNTY_BY_ID } from "@/data/counties";
import { hazardFor } from "@/data/hazards";
import { ITEMS } from "@/data/items";
import { essentialsFirst, isEssential } from "@/data/essentials";
import { firstHourCard } from "@/data/firstHour";
import { CATEGORY_ORDER, SHOP_ORDER, metaFor } from "@/data/meta";
import { useLang, useT } from "@/i18n/useLang";
import { messagesFor, type Messages } from "@/i18n/messages";
import type { Lang } from "@/i18n/lang";
import { asText, groupByCategory, handDate, shoppingText } from "./listText";
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
import { sitePath, siteUrl } from "@/lib/urls";
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
  const lang = useLang();
  const t = useT().list;
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
  // The page's <title> is set at build time in English; follow the visitor's language once it's known.
  useEffect(() => {
    document.title = t.pageTitle;
  }, [t.pageTitle]);

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

  // The language goes into ctx, so item text, amounts, the card, and the exports all follow it.
  const ctx = useMemo(() => (answers ? deriveContext(answers, lang) : null), [answers, lang]);
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
        <span className="font-semibold">{t.row.waterNote}</span>
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
      flash(t.flash.copyFailed);
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
      flash(t.flash.failed);
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
            <span className="font-semibold">{t.shared.title}</span>{" "}
            <span className="text-ink-soft">{t.shared.note}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => (storedAnswers?.build != null ? setConfirming("replace") : makeItMine())}
            >
              {t.shared.makeMine}
            </Button>
            <Link href="/build" className={buttonClass.secondary}>
              {t.shared.buildOwn}
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
                flash(t.flash.linkCopied);
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2500);
              },
              () => open(false),
            );
          }}
        >
          {linkCopied ? <CheckIcon /> : <LinkIcon />}
          {linkCopied ? t.exports.linkCopied : t.exports.copyLink}
        </Button>
        <Button type="button" variant="secondary" onClick={() => copy(asText(kits, main, st, ctx), t.flash.textCopied)}>
          <CopyTextIcon />
          {t.exports.copyText}
        </Button>
        {/* Print and the PDF are the same file, short or complete. They're imported up front, not on click,
            because printing on Safari opens a tab, and that only works during the click itself. */}
        <MenuButton
          label={busy === "print" ? t.exports.preparing : t.exports.print}
          icon={<PrinterIcon />}
          align="left"
          disabled={busy !== null}
          items={pdfChoices(t, (part) => run("print", () => printPdf(exportInput(), part), ""))}
        />
        <MenuButton
          label={busy === "pdf" ? t.exports.makingPdf : t.exports.pdf}
          icon={<PdfIcon />}
          align="left"
          disabled={busy !== null}
          items={pdfChoices(t, (part) => run("pdf", () => downloadPdf(exportInput(), part), t.flash.pdfDone))}
        />
        <Button
          type="button"
          variant="primary"
          disabled={busy !== null}
          onClick={() =>
            run(
              "xlsx",
              () => import("@/lib/exportXlsx").then((m) => m.downloadWorkbook(exportInput())),
              t.flash.xlsxDone,
            )
          }
        >
          <SheetIcon />
          {busy === "xlsx" ? t.exports.makingXlsx : t.exports.xlsx}
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
              {t.fullList.title} <span className="font-semibold text-ink-soft">{t.fullList.count(activeCount)}</span>
            </h2>
            <p className="mt-2 max-w-[64ch] text-ink-soft">
              {t.fullList.intro}
              {levelUpCount > 0 && ` ${t.fullList.more(levelUpCount)}`}
            </p>
          </div>
          <LevelToggle answers={answers} onLevel={setLevel} />
        </div>

        <Progress kits={kits} main={main} st={st} />

        <div
          className="no-print mt-8 flex flex-wrap gap-1 rounded-lg bg-paper p-1 sm:inline-flex"
          role="group"
          aria-label={t.fullList.viewsLabel}
        >
          {(["kits", "shop", "plan"] as View[]).map((v) => [v, t.fullList.views[v]] as const).map(([v, label]) => (
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
              copy={(text) => copy(text, t.flash.shopCopied)}
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
          {t.clear.prompt}{" "}
          <button
            type="button"
            onClick={() => setConfirming("clear")}
            className="inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-2"
          >
            {t.clear.button}
          </button>
        </p>
      )}

      {/* The site footer doesn't print, so printed lists get their own credit. */}
      <p className="hidden pt-8 text-sm print:block">{t.credit}</p>

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
          title={t.replace.title}
          confirmLabel={t.replace.confirm}
          cancelLabel={t.replace.cancel}
          onConfirm={makeItMine}
          onCancel={() => setConfirming(null)}
        >
          <p>{t.replace.body}</p>
          <CopyLink
            url={`${siteUrl("/list")}#${encodeShare(storedAnswers, storedStates)}`}
            label={t.replace.copyLink}
          />
        </ConfirmDialog>
      )}

      {confirming === "clear" && (
        <ConfirmDialog
          title={t.clear.title}
          confirmLabel={t.clear.confirm}
          cancelLabel={t.clear.cancel}
          onConfirm={clearDevice}
          onCancel={() => setConfirming(null)}
        >
          <p>{t.clear.body}</p>
          <p>{t.clear.keep}</p>
          <CopyLink url={shareUrl()} label={t.clear.copyLink} />
        </ConfirmDialog>
      )}
    </div>
  );
}

/** A quiet "copy this link" button that says when it worked. */
function CopyLink({ url, label }: { url: string; label: string }) {
  const t = useT().list.copyLink;
  const [state, setState] = useState<"" | "copied" | "failed">("");
  return (
    <p>
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(url).then(() => setState("copied"), () => setState("failed"))}
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink underline underline-offset-2"
      >
        {state === "copied" ? <CheckIcon /> : <LinkIcon />}
        {state === "copied" ? t.copied : label}
      </button>
      <span role="status" className="ml-2">
        {state === "failed" && t.failed}
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
  const t = messagesFor(ctx.lang).list.header;
  const build = resolveBuild(answers);
  const h = answers.household;
  const people = [
    t.adults(h.adults),
    h.kids && t.kids(h.kids),
    h.babies && t.babies(h.babies),
    h.dogs && t.dogs(h.dogs),
    h.cats && t.cats(h.cats),
    h.otherPets && t.otherPets(h.otherPets),
  ].filter(Boolean);
  const county = answers.county ? COUNTY_BY_ID[answers.county] : undefined;
  const kits = metaFor(ctx.lang).container;
  const kitNames = [
    ...{ stay: [kits.stay.name], go: [kits.go.name], both: [kits.stay.name, kits.go.name] }[build],
    ...(ctx.kits.includes("car") ? [kits.car.name] : []),
  ].map((name, i) => (i === 0 ? name : lowerFirst(name)));
  const hazards = [...ctx.hazards].map((id, i) => {
    const short = hazardFor(id, ctx.lang).short;
    return i === 0 ? short : short.toLowerCase();
  });

  // One badge per answer, each jumping to the wizard step that sets it. The values read on
  // their own, so the labels are only for screen readers.
  const groups: { label: string; step: string; value: string }[] = [
    { label: t.labels.building, step: "kit", value: kitNames.join(" + ") },
    { label: t.labels.for, step: "household", value: people.join(", ") },
    { label: t.labels.hazards, step: "hazards", value: hazards.join(", ") },
    ...(build !== "go"
      ? [{ label: t.labels.days, step: answers.level === "advanced" ? "days" : "level", value: t.daysAtHome(ctx.stayDays) }]
      : []),
    ...(county ? [{ label: t.labels.county, step: "county", value: t.county(county.name) }] : []),
  ];

  return (
    <div className="print:-order-2">
      <h1 className="text-[2.2rem] font-extrabold leading-[1.1] tracking-[-0.025em] sm:text-[2.8rem]">{t.title}</h1>
      <div className="mt-2 flex items-center gap-x-2 sm:flex-wrap">
        <span className="shrink-0 text-[0.9rem] font-semibold text-ink-soft">{t.planningFor}</span>
        {/* On phones the answers scroll sideways on one line instead of taking up the first screen. */}
        <ul
          aria-label={t.yourAnswers}
          className="-my-1 flex min-w-0 items-center gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none] sm:flex-wrap sm:overflow-visible print:flex-wrap"
        >
          {groups.map((g) => (
            <li key={g.label} className="shrink-0">
              <AnswerBadge
                value={g.value}
                href={readOnly ? undefined : `/build${g.step ? `/${g.step}` : ""}`}
                label={t.badge(g.label, g.value)}
              />
            </li>
          ))}
          {!readOnly && (
            <li className="no-print shrink-0">
              <Link
                href="/build"
                onClick={markReturnToList}
                className="inline-flex min-h-11 items-center px-1 text-[0.9rem] font-semibold text-ink underline underline-offset-2"
              >
                {t.changeAnswers}
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
          {t.happeningNow}
          <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M8 3v10M4 9l4 4 4-4" />
          </svg>
        </a>
      )}
    </div>
  );
}

/** "Go bag" to "go bag", for a name in the middle of a line. */
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/**
 * One answer shown as a badge. Links to the wizard step that sets it; the pencil says it's editable.
 * `label` is the full screen-reader label, like "Hazards: Earthquake, smoke. Change".
 */
function AnswerBadge({ value, href, label }: { value: string; href?: string; label: string }) {
  const pill =
    "inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap rounded-full border bg-paper px-3 text-[0.85rem] font-semibold text-ink";
  if (!href) return <span className={`${pill} border-line`}>{value}</span>;
  return (
    <Link
      href={href}
      onClick={markReturnToList}
      aria-label={label}
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
  const t = useT().list.level;
  const goOnly = resolveBuild(answers) === "go";
  const size = {
    basics: goOnly ? t.core : t.oneWeek,
    advanced: goOnly ? t.plusExtras : t.withExtras(answers.days === 7 ? 1 : 2),
  };
  return (
    <fieldset className="no-print">
      <legend className="mb-1.5 text-[0.95rem] font-semibold text-ink-soft">{t.legend}</legend>
      <div className="inline-flex rounded-lg border-2 border-ink p-0.5">
        {(["basics", "advanced"] as const).map((l) => (
          <label
            key={l}
            className={`min-h-11 cursor-pointer rounded-md px-4 py-1.5 text-center leading-tight has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-focus ${
              answers.level === l ? "bg-ink text-fog" : "text-ink-soft hover:text-ink"
            }`}
          >
            <input type="radio" name="level" className="sr-only" checked={answers.level === l} onChange={() => onLevel(l)} />
            <span className="block font-semibold">{t[l]}</span>
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
  const lang = useLang();
  const t = messagesFor(lang).list.progress;
  const names = metaFor(lang).container;
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
              <span className="font-semibold">{names[c].name}</span>
              <span className="text-[0.95rem] tabular-nums text-ink-soft">{t.count(done, list.length, c === "home")}</span>
            </div>
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-line"
              role="progressbar"
              aria-label={t.label(names[c].name)}
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
        {t.already(have, active.length)}
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
  const lang = useLang();
  const t = messagesFor(lang).list.startHere;
  if (firsts.length === 0) return null;
  const allDone = firsts.every((e) => st(e) === "have");
  const weekend = answers.start === "weekend" || answers.start === null;

  return (
    <section className="mt-8 rounded-xl border-2 border-orange bg-paper p-5 sm:p-6" aria-labelledby="start-here">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="start-here" className="text-2xl font-extrabold tracking-tight">
            {allDone ? t.allDone : weekend ? t.weekend : t.title}
          </h2>
          <p className="mt-1 text-ink-soft">{t.desc}</p>
        </div>
        <AddToCalendar
          className="no-print"
          event={firstStepsEvent(
            firsts.map((e) => e.item.name),
            listUrl,
            firstStepDate(answers.start),
            lang,
          )}
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

/** Whether a shopping line (one item, maybe in more than one kit) is an essential anywhere. */
const l0e = (lines: ListEntry[]) => lines.some(isEssential);

/** A kit's groups: the essentials first, then everything else by category. */
function kitGroups(entries: ListEntry[], lang: Lang): [string, string, ListEntry[]][] {
  const essentials = entries.filter(isEssential);
  const heading = messagesFor(lang).list.kit.essentials;
  return [
    ...(essentials.length ? [["essentials", heading, essentials] as [string, string, ListEntry[]]] : []),
    ...groupByCategory(entries.filter((e) => !isEssential(e))).map(
      ([cat, list]) => [cat, metaFor(lang).category[cat], list] as [string, string, ListEntry[]],
    ),
  ];
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
  const t = messagesFor(ctx.lang).list.kit;
  const meta = metaFor(ctx.lang).container[container];
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
          <p className="text-[0.95rem] font-semibold text-ink">{t.stillToGet(formatCost(sumCost(need)))}</p>
        )}
      </div>
      {container === "go" && ctx.carriers > 1 && (
        <p className="mt-3 max-w-[64ch] border-l-4 border-line pl-3 text-[0.95rem]">
          {t.packBags(ctx.carriers)}
          {ctx.babies > 0 && ` ${t.babies}`}
        </p>
      )}
      {shownAbove > 0 && <p className="mt-3 max-w-[64ch] text-[0.95rem] font-semibold">{t.shownAbove(shownAbove)}</p>}
      {container === "stay" && ctx.kits.includes("go") && (
        <p className="mt-3 max-w-[64ch] border-l-4 border-line pl-3 text-[0.95rem]">{t.stayWithGo}</p>
      )}
      {container === "go" && <p className="mt-3 max-w-[64ch] border-l-4 border-line pl-3 text-[0.95rem]">{t.secondBag}</p>}
      {container === "go" && ctx.needs.has("mobility") && (
        <p className="mt-3 max-w-[64ch] border-l-4 border-line pl-3 text-[0.95rem]">{t.mobility}</p>
      )}

      {container === "go" && ctx.carriers > 1 ? (
        // Go bags for several people: what goes in every bag, and what the group needs just one of.
        <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-2">
          {(
            [
              [t.everyBag, t.everyBagDesc(t.join(peopleNames(ctx).slice(0, ctx.carriers))), true],
              [t.oneForGroup, t.oneForGroupDesc, false],
            ] as const
          ).map(([heading, desc, perPerson]) => {
            const list = essentialsFirst(sortByCategory(active.filter((e) => !!e.item.perPerson === perPerson)));
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
          {kitGroups(active, ctx.lang).map(([key, heading, list]) => (
            <div key={key} className="print-break-avoid mb-6">
              <h4 className="border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">{heading}</h4>
              <ul className="divide-y divide-line">
                {list.map((e) => (
                  // In the Essentials group, every row is one, so the tag would just repeat.
                  <ItemRow key={e.key} {...row(e)} {...(key === "essentials" ? { essential: false } : {})} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {levelUpActive.length > 0 && (
        <Reveal
          className="mt-2"
          label={t.moreReady(levelUpActive.length)}
          detail={t.moreDetail(formatCost(sumCost(levelUpActive)))}
        >
          <p className="mt-1 max-w-[64ch] text-[0.95rem] text-ink-soft">
            <button type="button" onClick={onLevelUp} className="font-semibold text-ink underline underline-offset-2">
              {t.switchAdvanced}
            </button>{" "}
            {t.switchRest}
          </p>
          <ul className="mt-2 divide-y divide-line">
            {levelUpActive.map((e) => (
              <ItemRow key={e.key} {...row(e)} />
            ))}
          </ul>
        </Reveal>
      )}

      {skipped.length > 0 && (
        <Reveal quiet className="mt-3" label={t.showSkipped(skipped.length)}>
          <p className="text-[0.95rem] text-ink-soft">{t.skippedNote}</p>
          <ul className="divide-y divide-line">
            {skipped.map((e) => (
              <ItemRow key={e.key} {...row(e)} />
            ))}
          </ul>
        </Reveal>
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
  const lang = useLang();
  const t = messagesFor(lang).list.shop;
  const shops = metaFor(lang).shop;
  const [got, setGot] = useState<Set<string>>(() => new Set());
  const buyable = entries.filter((e) => e.container !== "home" && e.cost[1] > 0);
  const shown = buyable.filter((e) => st(e) === "need" || (st(e) === "have" && got.has(e.item.id)));
  const need = shown.filter((e) => st(e) === "need");
  // One line per item, even when it goes in more than one kit.
  const byItem = new Map<string, ListEntry[]>();
  for (const e of shown) byItem.set(e.item.id, [...(byItem.get(e.item.id) ?? []), e]);
  const groups = SHOP_ORDER.map(
    (shop) =>
      [
        shop,
        // Essentials first in each store, so a short trip still gets the important things.
        [...byItem.values()].filter((l) => l[0].item.shop === shop).sort((a, b) => Number(l0e(b)) - Number(l0e(a))),
      ] as const,
  ).filter(
    ([, l]) => l.length > 0,
  );
  const toBuy = new Set(need.map((e) => e.item.id)).size;

  if (groups.length === 0) return <p className="text-lg">{t.nothing}</p>;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-lg">
          {toBuy === 0 ? (
            <span className="font-semibold">{t.allBought}</span>
          ) : (
            <>
              <span className="font-semibold">{t.toBuy(toBuy)}</span> {t.roughly(formatCost(sumCost(need)))}
            </>
          )}
        </p>
        <Button type="button" variant="secondary" className="no-print" onClick={() => copy(shoppingText(groups, st, lang))}>
          {t.copy}
        </Button>
      </div>
      <p className="no-print mt-1 text-[0.95rem] text-ink-soft">{t.hint}</p>
      <div className="mt-6 grid gap-x-12 gap-y-8 lg:grid-cols-2">
        {groups.map(([shop, lists]) => (
          <section key={shop} className="print-break-avoid">
            <h3 className="flex items-baseline justify-between border-b-2 border-ink pb-1 text-lg font-extrabold tracking-tight">
              {shops[shop]}
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
  const lang = useLang();
  const kits = metaFor(lang).container;
  const id = `shop-${list[0].item.id}`;
  return (
    <li className="flex items-start gap-3 py-3">
      <input id={id} type="checkbox" className="peer sr-only" checked={have} onChange={(e) => onChange(e.target.checked)} />
      <label
        htmlFor={id}
        className="mt-0.5 cursor-pointer rounded peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
      >
        <CheckBox checked={have} tone="eucalyptus" />
        <span className="sr-only">{messagesFor(lang).list.shop.gotIt}</span>
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
              {kits[e.container].name}
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
  const lang = useLang();
  const t = messagesFor(lang).list.plan;
  const stageMeta = metaFor(lang).stage;
  // Number only the stages that have something in them, so the steps don't skip.
  const stages = (["weekend", "month", "later"] as Stage[])
    .map((stage) => [stage, essentialsFirst(entries.filter((e) => planStage(e, firstKeys, answers) === stage && st(e) !== "skip"))] as const)
    .filter(([, list]) => list.length > 0);

  return (
    <ol className="grid gap-12">
      {stages.map(([stage, list], i) => {
        const need = list.filter((e) => st(e) === "need");
        return (
          <li key={stage} className="grid gap-4 md:grid-cols-[14rem_1fr] md:gap-10">
            <div>
              <p className="text-[0.95rem] font-semibold text-orange">{t.step(i + 1)}</p>
              <h3 className="text-2xl font-extrabold tracking-tight">{stageMeta[stage].name}</h3>
              <p className="mt-1 text-ink-soft">{stageMeta[stage].desc}</p>
              <p className="mt-2 text-[0.95rem] font-semibold">
                {need.length === 0 ? t.allDone : t.toGo(need.length, formatCost(sumCost(need)))}
              </p>
            </div>
            <div className="grid gap-8">
              {planGroups(list, lang).map(([heading, group]) => (
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
function planGroups(list: ListEntry[], lang: Lang): [string | null, ListEntry[]][] {
  const t = messagesFor(lang).list.plan;
  const free = list.filter((e) => e.cost[1] === 0);
  const buy = list.filter((e) => e.cost[1] > 0).sort((a, b) => SHOP_ORDER.indexOf(a.item.shop) - SHOP_ORDER.indexOf(b.item.shop));
  if (list.length <= 10 || free.length === 0 || buy.length === 0) return [[null, list]];
  return [
    [t.free, free],
    [t.buy, buy],
  ];
}

function Together() {
  const t = useT().list.together;
  return (
    <p className="mt-6 max-w-[70ch] border-l-4 border-eucalyptus pl-4 text-ink-soft">
      <span className="font-semibold text-ink">{t.lead}</span> {t.body}
    </p>
  );
}

/** What to do when it happens. Its own print button prints just this card. */
function FirstHour({ ctx }: { ctx: Context }) {
  const t = messagesFor(ctx.lang).list.firstHour;
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
            {t.title}
          </h2>
          <p className="mt-1 text-ink-soft">{t.desc}</p>
        </div>
        <Button type="button" variant="secondary" className="no-print" onClick={printCard}>
          {t.print}
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
  const lang = useLang();
  const t = messagesFor(lang).list;
  return (
    <section className="no-print mt-6 border-t border-line pt-10" aria-labelledby="keep-fresh">
      <h2 id="keep-fresh" className="text-2xl font-extrabold tracking-tight">
        {t.fresh.title}
      </h2>
      <div className="mt-2 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start">
        <div>
          <p className="max-w-[60ch] text-ink-soft">{t.fresh.body}</p>
          <p className="mt-3 max-w-[60ch] text-ink-soft">{t.fresh.paper}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" disabled={busy} onClick={onPrint}>
              <PrinterIcon />
              {busy ? t.exports.preparing : t.fresh.print}
            </Button>
            <AddToCalendar
              label={t.fresh.reminders}
              variant="quiet"
              align="left"
              events={twiceYearlyChecks(listUrl, lang)}
            />
          </div>
        </div>
        <RefreshLogExample lang={lang} />
      </div>
    </section>
  );
}

/** A made-up, filled-in refresh log, so people can see how the paper one works. */
function RefreshLogExample({ lang }: { lang: Lang }) {
  const t = messagesFor(lang).list;
  const ex = t.fresh.example;
  const pen = "font-[Bradley_Hand,Segoe_Print,Comic_Sans_MS,cursive] text-[0.95rem] text-focus";
  // Hand-written dates, like "Mar 8 '26" and "Oct '26", in the page's language.
  const day = (m: number, d: number, y: number) => `${handDate(t.locale, m, d)} '${y}`;
  const month = (m: number, y: number) => `${handDate(t.locale, m)} '${y}`;
  const twice: [string, string][] = [
    [day(3, 8, 26), month(10, 26)],
    [day(10, 15, 26), month(3, 27)],
  ];
  const rows: { item: string; every: string; checks: [string, string][] }[] = [
    { item: ex.beans, every: ex.every24, checks: [[day(3, 8, 26), month(3, 28)]] },
    { item: ex.tapWater, every: ex.every6, checks: twice },
    { item: ex.lights, every: ex.every6, checks: twice },
    { item: ex.meds, every: ex.byDate, checks: [[day(3, 8, 26), month(1, 27)]] },
    { item: ex.granola, every: "", checks: [[day(10, 15, 26), month(8, 27)]] },
  ];
  return (
    <figure className="relative">
      <div
        role="img"
        aria-label={ex.label}
        className="rotate-[0.6deg] overflow-hidden rounded-lg border border-line bg-paper p-4 shadow-[0_18px_40px_-24px_rgba(19,41,61,0.45)]"
      >
        <span className="absolute right-3 top-3 z-10 rounded-full bg-ink px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-widest text-paper">
          {ex.badge}
        </span>
        <p className="font-extrabold">{ex.title}</p>
        <div aria-hidden="true" className="mt-2 overflow-x-auto">
          <table className="w-full min-w-max border-collapse text-left text-[0.78rem]">
            <thead>
              <tr className="border-b-2 border-ink text-[0.65rem] uppercase tracking-wider text-ink-soft">
                <th className="py-1 pr-2 font-bold">{ex.item}</th>
                <th className="py-1 pr-2 font-bold">{ex.replace}</th>
                <th className="py-1 font-bold" colSpan={3}>
                  {ex.eachCheck}
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
                        {ex.on} <span className={pen}>{r.checks[k]?.[0]}</span>
                      </div>
                      <div>
                        {ex.next} <span className={pen}>{r.checks[k]?.[1]}</span>
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
        {ex.caption}
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
  const t = useT().list.names;
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
          {t.title}
        </h2>
        <p className="mt-1 text-[0.95rem] text-ink-soft">{t.desc}</p>
        <div className="mt-4">
          <NamesEditor household={answers.household} names={answers.names} onChange={onChange} />
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit">{t.done}</Button>
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
  const t = useT().list.empty;
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
          {t.cleared}
        </p>
      )}
      <h1 className="text-[2.2rem] font-extrabold leading-tight tracking-tight">{standalone ? t.titleApp : t.title}</h1>
      <p className="mt-3 text-lg text-ink-soft">{standalone ? t.introApp : t.intro}</p>
      {!standalone && <p className="mt-3 text-ink-soft">{t.before}</p>}
      <div className="mt-8 flex flex-wrap items-center gap-5">
        <Link href="/build" className={buttonClass.primary}>
          {t.start}
        </Link>
        <button
          type="button"
          onClick={onStarter}
          className="inline-flex min-h-11 items-center text-ink-soft underline underline-offset-2 hover:text-ink"
        >
          {t.starter}
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
          {t.pasteLabel}
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
            {t.open}
          </Button>
        </div>
        {error && (
          <p id="restore-error" role="alert" className="mt-1.5 text-[0.95rem] font-semibold text-orange">
            {t.error}
          </p>
        )}
      </form>
    </div>
  );
}

/** The two ways to print or save the PDF: just the essentials, or everything. */
function pdfChoices(t: Messages["list"], choose: (part: PdfPart) => void): MenuItem[] {
  return [
    {
      key: "short",
      onSelect: () => choose("short"),
      label: (
        <>
          {t.exports.short} <span className="text-ink-soft">{t.exports.shortDetail}</span>
        </>
      ),
    },
    {
      key: "list",
      onSelect: () => choose("list"),
      label: (
        <>
          {t.exports.everything} <span className="text-ink-soft">{t.exports.everythingDetail}</span>
        </>
      ),
    },
  ];
}
