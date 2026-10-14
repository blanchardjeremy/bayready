import type ExcelJSNamespace from "exceljs";
import type { Answers, Container, Context, ItemState, ListEntry, Stage } from "./types";
import { CONTAINER_ORDER, firstSteps, planStage } from "./buildList";
import { MAX_PEOPLE, peopleNames } from "./answers";
import { CATEGORY_ORDER, CONTAINER_META, metaFor } from "@/data/meta";
import { essentialsFirst, isEssential } from "@/data/essentials";
import { COUNTY_BY_ID } from "@/data/counties";
import { expiringSections } from "@/data/expiring";
import { EMPTY_HOME, factFields, homeFacts, type HomeInfo } from "@/data/homeFacts";
import { firstHourCard } from "@/data/firstHour";
import { BAY_READY_URL } from "./urls";
import { listSummary } from "./summary";
import { messagesFor } from "@/i18n/messages";
import type { Lang } from "@/i18n/lang";

type ExcelJS = typeof ExcelJSNamespace;
type Workbook = ExcelJSNamespace.Workbook;
type Worksheet = ExcelJSNamespace.Worksheet;
type Font = Partial<ExcelJSNamespace.Font>;

export interface ExportInput {
  answers: Answers;
  ctx: Context;
  /** The entries on the user's current list (their level), skipped ones included. */
  entries: ListEntry[];
  stateOf: (e: ListEntry) => ItemState;
  /** Know your home answers and notes typed in the app. Device-only, never in share links. */
  home?: HomeInfo;
  /** For entries tracked per person (entry.slots): whether that person's part is done. */
  slotDone: (e: ListEntry, i: number) => boolean;
  shareUrl: string;
  today?: Date;
}

// ---------------------------------------------------------------------------
// Design tokens. A small palette: navy for structure, green for done, amber
// for "soon", orange only for "act now". Everything else is grey.
// ---------------------------------------------------------------------------

const C = {
  ink: "FF13293D",
  soft: "FF5B7383",
  muted: "FF9AABB5",
  line: "FFE1E8EC",
  band: "FFEEF2F4",
  auto: "FFF6F8F9",
  input: "FFFAFBFC",
  white: "FFFFFFFF",
  green: "FF2F6B4F",
  greenWash: "FFE2F0E7",
  amber: "FF8A5A00",
  yellow: "FF6B5200",
  // Advanced extras: a quiet lavender, so they read as optional at a glance.
  extra: "FF5B4E8C",
  extraWash: "FFF4F1FB",
  yellowWash: "FFFFF2B8",
  amberWash: "FFFBF0D6",
  orange: "FFB0381C",
  orangeWash: "FFFBE7E0",
};

// Lexend and Roboto are both in Google Sheets' default font menu.
const DISPLAY = "Lexend";
const BODY = "Roboto";

const font = (f: Font = {}): Font => ({ name: BODY, size: 11, color: { argb: C.ink }, ...f });
const fill = (argb: string): ExcelJSNamespace.Fill => ({ type: "pattern", pattern: "solid", fgColor: { argb } });
const hairline = { style: "thin" as const, color: { argb: C.line } };

const MONEY_FMT = '"$"#,##0';

// The "Your people" names on the Overview tab feed every Who dropdown and
// name the per-person columns.
const NAMES_FIRST_ROW = 17;
const NAMES_COUNT = MAX_PEOPLE;
// "Days at home" on the Overview tab. Stay-at-home bin amounts that scale with days read it.
const DAYS_ROW = 14;

/** A tab name as a formula writes it: quoted unless it's plain letters and digits. */
const sheetRef = (name: string) => (/^[A-Za-z0-9_]+$/.test(name) ? name : `'${name.replace(/'/g, "''")}'`);

/**
 * The words for one workbook, in the list's language (src/i18n/<lang>/exports.ts).
 * Dropdown values, the formulas that count them, the colors keyed off them, and
 * formulas that point at other tabs all read from here, so they always agree.
 */
function wordsFor(lang: Lang) {
  const t = messagesFor(lang).exports;
  const x = t.xlsx;
  const overview = sheetRef(x.sheets.overview);
  return {
    t,
    x,
    meta: metaFor(lang),
    /** Tab names, ready to use in a formula. */
    ref: {
      overview,
      todos: sheetRef(x.sheets.todos),
      supplies: sheetRef(x.sheets.supplies),
      expiring: sheetRef(x.sheets.expiring),
    },
    /** The Overview's people list, which feeds every Who dropdown. */
    whoRange: `${overview}!$B$${NAMES_FIRST_ROW}:$B$${NAMES_FIRST_ROW + NAMES_COUNT - 1}`,
    /** Days at home on the Overview. */
    days: `${overview}!$C$${DAYS_ROW}`,
    status: {
      supplies: [x.status.need, x.status.have, x.status.skip],
      todos: [x.status.todo, x.status.done, x.status.skip],
    },
  };
}
type Words = ReturnType<typeof wordsFor>;

// ---------------------------------------------------------------------------

export function buildWorkbook(Excel: ExcelJS, input: ExportInput): Workbook {
  const w = wordsFor(input.ctx.lang);
  const { sheets } = w.x;
  const wb = new Excel.Workbook();
  wb.creator = "Bay Ready";
  wb.created = input.today ?? new Date();
  wb.calcProperties.fullCalcOnLoad = true;

  const overview = wb.addWorksheet(sheets.overview, sheetOpts());
  const todos = wb.addWorksheet(sheets.todos, sheetOpts());
  const supplies = wb.addWorksheet(sheets.supplies, sheetOpts());
  const expiring = wb.addWorksheet(sheets.expiring, sheetOpts());
  const neighbors = wb.addWorksheet(sheets.neighbors, sheetOpts());
  const card = firstHourCard(input.ctx);
  const whenItHappens = card.length ? wb.addWorksheet(sheets.card, { ...sheetOpts(), pageSetup: { ...sheetOpts().pageSetup, orientation: "portrait" } }) : null;

  const active = input.entries.filter((e) => input.stateOf(e) !== "skip");
  const firstKeys = new Set(firstSteps(input.entries, input.stateOf, input.answers).map((e) => e.key));

  buildTodos(todos, active.filter((e) => e.container === "home"), input, firstKeys, w);
  const layout = buildSupplies(supplies, active.filter((e) => e.container !== "home"), input, w);
  buildExpiring(expiring, input.ctx, w);
  buildNeighbors(neighbors, w);
  if (whenItHappens) buildCard(whenItHappens, card, w);
  buildOverview(overview, input, layout, w);

  wb.title = w.x.title;
  wb.description = `${w.t.credit}: ${BAY_READY_URL}`;
  for (const ws of [overview, todos, supplies, expiring, neighbors, whenItHappens]) if (ws) addCredit(ws, w, ws === overview);

  return wb;
}

/** A "Made with Bay Ready" link under the last row, and in the printed footer. */
function addCredit(ws: Worksheet, w: Words, isOverview: boolean) {
  // The Overview has a narrow spacer column A; the other tabs start in A.
  const col = isOverview ? "B" : "A";
  const row = (ws.lastRow?.number ?? 0) + 2;
  const cell = ws.getCell(`${col}${row}`);
  cell.value = { text: w.t.credit, hyperlink: BAY_READY_URL };
  cell.font = font({ size: 10, color: { argb: C.soft }, underline: true });
  cell.alignment = { vertical: "middle", indent: col === "A" ? 1 : 0 };
  ws.headerFooter.oddFooter = w.x.creditFooter(BAY_READY_URL);
}

function sheetOpts(): Partial<ExcelJSNamespace.AddWorksheetOptions> {
  return {
    views: [{ showGridLines: false }],
    pageSetup: { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } },
  };
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

function title(ws: Worksheet, text: string, sub: string, lastCol: string) {
  ws.getRow(1).height = 40;
  const t = ws.getCell("A1");
  t.value = text;
  t.font = { name: DISPLAY, size: 20, bold: true, color: { argb: C.ink } };
  t.alignment = { vertical: "bottom" };
  ws.getRow(2).height = 22;
  ws.mergeCells(`A2:${lastCol}2`);
  const s = ws.getCell("A2");
  s.value = sub;
  s.font = font({ size: 10, color: { argb: C.soft } });
  s.alignment = { vertical: "top" };
}

function headerRow(ws: Worksheet, row: number, labels: string[], notes: Record<number, string> = {}) {
  const r = ws.getRow(row);
  r.height = 26;
  labels.forEach((label, i) => {
    const cell = r.getCell(i + 1);
    cell.value = label;
    cell.font = font({ size: 10, bold: true, color: { argb: C.white } });
    cell.fill = fill(C.ink);
    cell.alignment = { vertical: "middle", horizontal: i === 0 ? "center" : "left", indent: i === 0 ? 0 : 1 };
    if (notes[i + 1]) cell.note = notes[i + 1];
  });
}

function sectionRow(ws: Worksheet, row: number, name: string, desc: string, cols: number) {
  const r = ws.getRow(row);
  r.height = 30;
  for (let i = 1; i <= cols; i++) r.getCell(i).fill = fill(C.band);
  const cell = r.getCell(1);
  cell.value = {
    richText: [
      { text: name, font: { name: DISPLAY, size: 12, bold: true, color: { argb: C.ink } } },
      { text: `    ${desc}`, font: { name: BODY, size: 10, color: { argb: C.soft } } },
    ],
  };
  cell.alignment = { vertical: "middle", indent: 1 };
}

function bodyCell(cell: ExcelJSNamespace.Cell, f: Font = {}, indent = 1) {
  cell.font = font(f);
  cell.alignment = { vertical: "middle", indent };
  cell.border = { bottom: hairline };
}

/** Wide enough for the longest status and its dropdown arrow. */
function statusWidth(options: readonly string[], min: number) {
  return Math.max(min, ...options.map((s) => s.length + 4));
}

function statusCell(cell: ExcelJSNamespace.Cell, value: string, options: string[]) {
  cell.value = value;
  // Quiet by default. Conditional formats make finished rows stand out in green.
  cell.font = font({ size: 10, color: { argb: C.soft } });
  cell.alignment = { vertical: "middle", horizontal: "center" };
  cell.border = { bottom: hairline };
  cell.dataValidation = { type: "list", allowBlank: false, formulae: [`"${options.join(",")}"`] };
}

function whoCell(cell: ExcelJSNamespace.Cell, w: Words) {
  bodyCell(cell);
  cell.dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: [w.whoRange],
    // Allow typing a name that isn't on the Overview list.
    showErrorMessage: false,
  };
}

function linkCell(cell: ExcelJSNamespace.Cell, link: { label: string; url: string } | null | undefined) {
  bodyCell(cell, { size: 10, color: { argb: C.soft } });
  if (!link) return;
  cell.value = { text: link.label, hyperlink: link.url };
  cell.font = font({ size: 10, color: { argb: C.ink }, underline: true });
}

/** Conditional formats keyed off the Status column (A). */
/**
 * Status colors, on both the Status cell and the item name: yellow while it
 * still needs doing, green when done, grey (and struck through on the name)
 * when skipped. Same colors as the per-person Not done / Done cells.
 */
function statusFormats(ws: Worksheet, first: number, last: number, done: string, notDone: string[], skip: string, itemCols: string) {
  if (last < first) return;
  ws.addConditionalFormatting({
    ref: `A${first}:A${last}`,
    rules: [
      {
        type: "expression",
        priority: 1,
        formulae: [`$A${first}="${done}"`],
        style: { font: { color: { argb: C.green }, bold: true }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.greenWash } } },
      },
      {
        type: "expression",
        priority: 2,
        formulae: [`OR(${notDone.map((w) => `$A${first}="${w}"`).join(",")})`],
        style: { font: { color: { argb: C.yellow } }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.yellowWash } } },
      },
      { type: "expression", priority: 3, formulae: [`$A${first}="${skip}"`], style: { font: { color: { argb: C.muted } } } },
    ],
  });
  ws.addConditionalFormatting({
    ref: itemCols.replace(/\{f\}/g, String(first)).replace(/\{l\}/g, String(last)),
    rules: [
      {
        type: "expression",
        priority: 3,
        formulae: [`$A${first}="${done}"`],
        style: { font: { color: { argb: C.green } }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.greenWash } } },
      },
      {
        type: "expression",
        priority: 4,
        formulae: [`OR(${notDone.map((w) => `$A${first}="${w}"`).join(",")})`],
        style: { font: { color: { argb: C.yellow } }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.yellowWash } } },
      },
      { type: "expression", priority: 5, formulae: [`$A${first}="${skip}"`], style: { font: { color: { argb: C.muted }, strike: true } } },
    ],
  });
}

// ---------------------------------------------------------------------------
// Per-person Done columns (go bags on Supplies, per-adult tasks on To-dos)
// ---------------------------------------------------------------------------

/** Name cells for the person columns, from the Overview tab, so renaming someone there renames their column. */
function personHeaders(ws: Worksheet, headerRow: number, startCol: number, count: number, ctx: Context, w: Words) {
  const names = peopleNames(ctx);
  for (let i = 0; i < count; i++) {
    const cell = ws.getRow(headerRow).getCell(startCol + i);
    const ref = `${w.ref.overview}!$B$${NAMES_FIRST_ROW + i}`;
    const fallback = w.t.person(i + 1);
    cell.value = { formula: `IF(${ref}="","${fallback}",${ref})`, result: names[i] ?? fallback };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  }
}

// Wide enough for a first name, and for "Not done" with its dropdown arrow.
const PERSON_COL_WIDTH = 15;

// Plain text values with a dropdown work the same in Google Sheets, Excel, and Numbers.
// The values are w.x.person.done and notDone ("Done" and "Not done" in English).

/**
 * A Done / Not done dropdown per person, or plain empty cells when the row is done once for everyone.
 * Only the first `active` people get a dropdown (adults-only go bag items leave the kids' cells empty).
 */
function personCells(
  r: ExcelJSNamespace.Row,
  startCol: number,
  count: number,
  done: ((i: number) => boolean) | null,
  w: Words,
  active = count,
) {
  const { done: DONE, notDone: NOT_DONE } = w.x.person;
  for (let i = 0; i < count; i++) {
    const cell = r.getCell(startCol + i);
    cell.border = { bottom: hairline };
    if (!done || i >= active) continue;
    cell.value = done(i) ? DONE : NOT_DONE;
    cell.font = font({ size: 10 });
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.dataValidation = { type: "list", allowBlank: false, formulae: [`"${NOT_DONE},${DONE}"`] };
  }
}

/** Status that follows the person columns: done when everyone's done, partly when some are. */
function personStatus(
  cell: ExcelJSNamespace.Cell,
  row: number,
  startCol: number,
  count: number,
  [done, partly, none]: [string, string, string],
  allDone: boolean,
  w: Words,
) {
  const DONE = w.x.person.done;
  const range = `${colLetter(startCol)}${row}:${colLetter(startCol + count - 1)}${row}`;
  cell.value = {
    formula: `IF(COUNTIF(${range},"${DONE}")=${count},"${done}",IF(COUNTIF(${range},"${DONE}")>0,"${partly}","${none}"))`,
    result: allDone ? done : none,
  };
  cell.font = font({ size: 10, color: { argb: C.soft } });
  cell.alignment = { vertical: "middle", horizontal: "center" };
  cell.border = { bottom: hairline };
}

function personFormats(ws: Worksheet, first: number, last: number, startCol: number, count: number, w: Words) {
  if (!count || last < first) return;
  const { done: DONE, notDone: NOT_DONE } = w.x.person;
  const a = colLetter(startCol);
  ws.addConditionalFormatting({
    ref: `${a}${first}:${colLetter(startCol + count - 1)}${last}`,
    rules: [
      {
        type: "expression",
        priority: 20,
        formulae: [`${a}${first}="${DONE}"`],
        style: { font: { color: { argb: C.green }, bold: true }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.greenWash } } },
      },
      {
        type: "expression",
        priority: 21,
        formulae: [`${a}${first}="${NOT_DONE}"`],
        style: { font: { color: { argb: C.yellow } }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.yellowWash } } },
      },
    ],
  });
  ws.addConditionalFormatting({
    ref: `A${first}:A${last}`,
    rules: [
      { type: "expression", priority: 22, formulae: [`$A${first}="${w.x.status.partly}"`], style: { font: { color: { argb: C.amber }, bold: true } } },
    ],
  });
}

/** A lighter heading inside a section, e.g. "In every bag". */
function subSectionRow(ws: Worksheet, row: number, name: string, desc: string, cols: number) {
  const r = ws.getRow(row);
  r.height = 26;
  for (let i = 1; i <= cols; i++) r.getCell(i).border = { bottom: { style: "thin", color: { argb: C.muted } } };
  const cell = r.getCell(1);
  cell.value = {
    richText: [
      { text: name, font: { name: DISPLAY, size: 10, bold: true, color: { argb: C.ink } } },
      { text: `    ${desc}`, font: { name: BODY, size: 10, color: { argb: C.soft } } },
    ],
  };
  cell.alignment = { vertical: "bottom", indent: 1 };
}

/** Heading for the Advanced items at the bottom of a section. */
function extrasRow(ws: Worksheet, row: number, cols: number, w: Words) {
  const r = ws.getRow(row);
  r.height = 26;
  for (let i = 1; i <= cols; i++) {
    r.getCell(i).fill = fill(C.extraWash);
    r.getCell(i).border = { bottom: { style: "thin", color: { argb: C.muted } } };
  }
  const cell = r.getCell(1);
  cell.value = {
    richText: [
      { text: w.x.extras, font: { name: DISPLAY, size: 10, bold: true, color: { argb: C.extra } } },
      { text: `    ${w.x.extrasDesc}`, font: { name: BODY, size: 10, color: { argb: C.extra } } },
    ],
  };
  cell.alignment = { vertical: "bottom", indent: 1 };
}

function markExtra(ws: Worksheet, row: number, cols: number) {
  const r = ws.getRow(row);
  for (let i = 1; i <= cols; i++) r.getCell(i).fill = fill(C.extraWash);
}

/** Basics first, then Advanced items under an "Advanced extras" heading. */
function writeWithExtras(
  ws: Worksheet,
  startRow: number,
  list: ListEntry[],
  cols: number,
  w: Words,
  write: (row: number, e: ListEntry) => void,
): number {
  let row = startRow;
  for (const e of list.filter((e) => e.level === "basics")) write(row++, e);
  const extras = list.filter((e) => e.level === "advanced");
  if (extras.length) {
    extrasRow(ws, row++, cols, w);
    for (const e of extras) {
      write(row, e);
      markExtra(ws, row++, cols);
    }
  }
  return row;
}

function sortByCategory(list: ListEntry[]) {
  return [...list].sort((a, b) => CATEGORY_ORDER.indexOf(a.item.category) - CATEGORY_ORDER.indexOf(b.item.category));
}


// ---------------------------------------------------------------------------
// To-dos
// ---------------------------------------------------------------------------

function buildTodos(ws: Worksheet, list: ListEntry[], input: ExportInput, firstKeys: Set<string>, w: Words) {
  const tx = w.x.todos;
  const { status } = w.x;
  // Per-adult tasks (alerts, phone setup) get a Done column for each adult.
  const people = Math.max(0, ...list.map((e) => e.slots.length));
  const P = 3; // first person column
  const [WHO, LINK, WHY] = [P + people, P + people + 1, P + people + 2];
  ws.columns = [
    { width: statusWidth(w.status.todos, 11) }, // Status
    { width: 50 }, // Task
    ...Array.from({ length: people }, () => ({ width: PERSON_COL_WIDTH })),
    { width: 16 }, // Who
    { width: 28 }, // Link
    { width: 90 }, // Why
  ].map((c) => ({ ...c, style: { font: font() } }));

  title(ws, tx.title, people ? tx.subPeople : tx.sub, colLetter(WHY));
  const HEADER = 4;
  const h = tx.headers;
  headerRow(ws, HEADER, [h.status, h.task, ...Array.from({ length: people }, () => ""), h.who, h.link, h.why], { [WHO]: tx.whoNote });
  personHeaders(ws, HEADER, P, people, input.ctx, w);
  ws.getRow(3).height = 8;

  // Tasks each adult does go together at the top, so the household tasks below
  // don't carry empty person columns.
  const perPerson = (e: ListEntry) => people > 0 && e.slots.length > 0;
  const stages = ["weekend", "month", "later"] as Stage[];
  const byStage = (e: ListEntry) => stages.indexOf(planStage(e, firstKeys, input.answers));
  const sections: [string, string, ListEntry[]][] = [
    [tx.eachAdult, tx.eachAdultDesc, list.filter(perPerson).sort((a, b) => byStage(a) - byStage(b))],
    ...stages.map((stage): [string, string, ListEntry[]] => [
      w.meta.stage[stage].name,
      // Short enough to fit beside the section name without being cut off.
      tx.stageBlurb[stage],
      sortByCategory(list.filter((e) => !perPerson(e) && planStage(e, firstKeys, input.answers) === stage)),
    ]),
  ];

  let row = HEADER + 1;
  const first = row;
  for (const [name, desc, items] of sections) {
    if (items.length === 0) continue;
    sectionRow(ws, row++, name, desc, WHY);
    row = writeWithExtras(ws, row, items, WHY, w, (row, e) => {
      const r = ws.getRow(row);
      r.height = 24;
      const each = perPerson(e);
      if (each) {
        personStatus(r.getCell(1), row, P, people, [status.done, status.partly, status.todo], input.stateOf(e) === "have", w);
      } else {
        statusCell(r.getCell(1), input.stateOf(e) === "have" ? status.done : status.todo, w.status.todos);
      }
      r.getCell(2).value = e.item.name;
      bodyCell(r.getCell(2));
      personCells(r, P, people, each ? (i) => input.slotDone(e, i) : null, w);
      if (each) {
        r.getCell(WHO).value = tx.eachAdult;
        bodyCell(r.getCell(WHO), { size: 10, color: { argb: C.soft } });
      } else {
        whoCell(r.getCell(WHO), w);
      }
      linkCell(r.getCell(LINK), e.item.link?.(input.ctx));
      r.getCell(WHY).value = e.item.why;
      bodyCell(r.getCell(WHY), { size: 10, color: { argb: C.soft } });
    });
  }
  const last = row - 1;
  statusFormats(ws, first, last, status.done, [status.todo, status.partly], status.skip, "B{f}:B{l}");
  personFormats(ws, first, last, P, people, w);

  ws.autoFilter = { from: { row: HEADER, column: 1 }, to: { row: Math.max(last, HEADER), column: WHY } };
  ws.views = [{ state: "frozen", ySplit: HEADER, xSplit: 2, showGridLines: false }];
}

// ---------------------------------------------------------------------------
// Supplies
// ---------------------------------------------------------------------------

/** Where the Overview's formulas find things on the Supplies tab. */
interface SupplyLayout {
  cost: string;
  bags: number;
}

type Group = "what" | "bags" | "buy" | "notes";
interface Col {
  key: string;
  label: string;
  width: number;
  group: Group;
  note?: string;
  auto?: boolean;
}


// Enough precision that the sheet's rounded-up counts match the app's.
const round2 = (n: number) => Math.round(n * 10000) / 10000;

function colLetter(n: number): string {
  let s = "";
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** One Done column per person who carries a go bag, when there's more than one bag. */
function bagCount(ctx: Context): number {
  return ctx.kits.includes("go") && ctx.carriers > 1 ? Math.min(ctx.carriers, MAX_PEOPLE) : 0;
}

function supplyColumns(bags: number, w: Words): Col[] {
  const sx = w.x.supplies;
  const h = sx.headers;
  return [
    { key: "status", label: h.status, width: statusWidth(w.status.supplies, 10), group: "what" },
    { key: "item", label: h.item, width: 42, group: "what" },
    { key: "amount", label: h.amount, width: 20, group: "what" },
    ...Array.from({ length: bags }, (_, i): Col => ({ key: `bag${i}`, label: sx.bag(i + 1), width: PERSON_COL_WIDTH, group: "bags" })),
    { key: "who", label: h.who, width: 14, group: "buy", note: sx.whoNote },
    { key: "cost", label: h.cost, width: 11, group: "buy", note: sx.costNote },
    { key: "example", label: h.example, width: 22, group: "buy" },
    { key: "notes", label: h.notes, width: 44, group: "notes", note: sx.notesNote },
  ].map((c) => ({ ...c, width: Math.max(c.width, c.label.length + 2) }) as Col);
}

function buildSupplies(ws: Worksheet, list: ListEntry[], input: ExportInput, w: Words): SupplyLayout {
  const sx = w.x.supplies;
  const { status } = w.x;
  const bags = bagCount(input.ctx);
  const cols = supplyColumns(bags, w);
  const idx = Object.fromEntries(cols.map((c, i) => [c.key, i + 1])) as Record<string, number>;
  const L = (key: string) => colLetter(idx[key]);
  const lastCol = colLetter(cols.length);

  ws.columns = cols.map((c) => ({ width: c.width, style: { font: font() } }));

  title(ws, sx.title, bags ? sx.subBags : sx.sub, lastCol);

  // Group labels above the header, so the parts of the table read at a glance.
  const GROUP = 4;
  const HEADER = 5;
  ws.getRow(3).height = 8;
  ws.getRow(GROUP).height = 20;
  // The person columns get no group label: they only apply to the go bag.
  for (const group of ["what", "buy"] as const) {
    const members = cols.map((c, i) => (c.group === group ? i + 1 : 0)).filter(Boolean);
    if (members.length === 0) continue;
    const a = colLetter(members[0]);
    const b = colLetter(members[members.length - 1]);
    if (a !== b) ws.mergeCells(`${a}${GROUP}:${b}${GROUP}`);
    const g = ws.getCell(`${a}${GROUP}`);
    // The "bags" and "notes" columns have no group label on purpose.
    g.value = sx.groups[group];
    g.font = { name: DISPLAY, size: 10, bold: true, color: { argb: C.soft } };
    g.alignment = { vertical: "bottom", indent: 1 };
  }

  headerRow(
    ws,
    HEADER,
    cols.map((c) => c.label),
    Object.fromEntries(cols.flatMap((c, i) => (c.note ? [[i + 1, c.note]] : []))),
  );
  const header = ws.getRow(HEADER);
  // Auto columns get a lighter header so they read as "not for typing".
  for (const c of cols.filter((c) => c.auto)) header.getCell(idx[c.key]).fill = fill(C.soft);
  // Person columns stay unnamed in the sticky header, so the rows they don't apply to
  // (the stay-at-home bin, "One for the group") don't look like they need filling in.
  // The names sit on the go bag's "In every bag" row instead.
  for (let i = 0; i < bags; i++) header.getCell(idx.bag0 + i).value = "";

  let row = HEADER + 1;
  const first = row;
  const kits = CONTAINER_ORDER.filter((c): c is Exclude<Container, "home"> => c !== "home");
  for (const kit of kits) {
    const items = sortByCategory(list.filter((e) => e.container === kit));
    if (items.length === 0) continue;
    sectionRow(ws, row++, w.meta.container[kit].name, kitBlurb(kit, input.ctx, w), cols.length);
    if (kit === "go" && bags) {
      // What goes in every bag, then what the group needs just one of.
      const groups: [string, string, ListEntry[]][] = [
        [
          sx.everyBag,
          items.some((e) => e.slots.length > 0 && e.slots.length < bags) ? sx.everyBagAdults : sx.everyBagDesc,
          items.filter((e) => e.slots.length > 0),
        ],
        [sx.groupBag, sx.groupBagDesc, items.filter((e) => e.slots.length === 0)],
      ];
      for (const [name, desc, group] of groups) {
        if (group.length === 0) continue;
        subSectionRow(ws, row, name, desc, cols.length);
        if (group[0]?.slots.length) {
          personHeaders(ws, row, idx.bag0, bags, input.ctx, w);
          for (let i = 0; i < bags; i++) {
            ws.getRow(row).getCell(idx.bag0 + i).font = { name: DISPLAY, size: 10, bold: true, color: { argb: C.ink } };
            ws.getRow(row).getCell(idx.bag0 + i).alignment = { vertical: "bottom", horizontal: "center" };
          }
        }
        row++;
        row = writeWithExtras(ws, row, essentialsFirst(group), cols.length, w, (r, e) => writeSupplyRow(ws, r, e, input, idx, bags, w));
      }
    } else {
      // The essentials first under their own heading, then everything else.
      const essentials = items.filter(isEssential);
      const rest = items.filter((e) => !isEssential(e));
      const write = (r: number, e: ListEntry) => writeSupplyRow(ws, r, e, input, idx, bags, w);
      if (essentials.length && rest.length) {
        subSectionRow(ws, row++, sx.essentials, sx.essentialsDesc, cols.length);
        for (const e of essentials) write(row++, e);
        subSectionRow(ws, row++, sx.rest, sx.restDesc, cols.length);
        row = writeWithExtras(ws, row, rest, cols.length, w, write);
      } else row = writeWithExtras(ws, row, items, cols.length, w, write);
    }
  }
  const last = row - 1;

  // Total
  row++;
  const total = ws.getRow(row);
  total.height = 28;
  total.getCell(idx.item).value = sx.total;
  total.getCell(idx.item).font = font({ bold: true });
  total.getCell(idx.item).alignment = { vertical: "middle", indent: 1 };
  const costRange = `${L("cost")}${first}:${L("cost")}${last}`;
  const statusRange = `A${first}:A${last}`;
  const totalCell = total.getCell(idx.cost);
  totalCell.value = {
    formula: `SUMIF(${statusRange},"${status.need}",${costRange})+SUMIF(${statusRange},"${status.partly}",${costRange})`,
  };
  totalCell.numFmt = MONEY_FMT;
  totalCell.font = font({ bold: true });
  totalCell.alignment = { vertical: "middle", horizontal: "right", indent: 1 };
  for (let i = 1; i <= cols.length; i++) total.getCell(i).border = { top: { style: "thin", color: { argb: C.ink } } };

  if (last >= first) {
    statusFormats(ws, first, last, status.have, [status.need, status.partly], status.skip, "B{f}:B{l}");
    if (bags) personFormats(ws, first, last, idx.bag0, bags, w);
  }

  ws.autoFilter = { from: { row: HEADER, column: 1 }, to: { row: Math.max(last, HEADER), column: cols.length } };
  ws.views = [{ state: "frozen", ySplit: HEADER, xSplit: 2, showGridLines: false }];

  return { cost: L("cost"), bags };
}

function kitBlurb(kit: Container, ctx: Context, w: Words): string {
  const b = w.x.supplies.blurb;
  if (kit === "stay") return b.stay;
  if (kit === "go") return bagCount(ctx) ? b.bags(ctx.carriers) : b.go;
  return b.car;
}

function writeSupplyRow(
  ws: Worksheet,
  row: number,
  e: ListEntry,
  input: ExportInput,
  idx: Record<string, number>,
  bags: number,
  w: Words,
) {
  const { status } = w.x;
  const DAYS = w.days;
  const r = ws.getRow(row);
  const cell = (key: string) => r.getCell(idx[key]);
  r.height = 24;
  const have = input.stateOf(e) === "have";
  const perBag = bags > 0 && e.slots.length > 0;

  // Adults-only items (N95s, power banks) have fewer slots than bags. Adults come first, so
  // their slots line up with the first bag columns and the kids' columns stay empty.
  const slots = Math.min(e.slots.length, bags);
  if (perBag) personStatus(cell("status"), row, idx.bag0, slots, [status.have, status.partly, status.need], have, w);
  else statusCell(cell("status"), have ? status.have : status.need, w.status.supplies);
  if (bags) personCells(r, idx.bag0, bags, perBag ? (i) => input.slotDone(e, i) : null, w, slots);

  const item = cell("item");
  item.value = e.item.name;
  bodyCell(item);
  item.note = e.item.tip ? `${e.item.why}\n\n${e.item.tip}` : e.item.why;

  const scale = e.container === "stay" ? e.item.scalesWithDays : undefined;
  const amount = cell("amount");
  if (scale) {
    // Recalculates from Days at home on the Overview tab.
    const days = input.ctx.stayDays;
    if (scale.perDay) {
      const perDay = round2(scale.perDay(input.ctx));
      const n = `ROUNDUP(${perDay}*${DAYS},0)`;
      const count = Math.ceil(perDay * days);
      amount.value = scale.unitOne
        ? { formula: `${n}&IF(${n}=1," ${scale.unitOne}"," ${scale.unit}")`, result: `${count} ${count === 1 ? scale.unitOne : scale.unit}` }
        : { formula: `${n}&" ${scale.unit ?? ""}"`, result: `${count} ${scale.unit ?? ""}` };
    } else {
      const suffix = scale.suffix?.(input.ctx) ?? "";
      amount.value = { formula: `${DAYS}&" ${w.x.days}${suffix}"`, result: `${days} ${w.x.days}${suffix}` };
    }
  } else {
    amount.value = e.qty?.text ?? "";
  }
  bodyCell(amount, { size: 10, color: { argb: C.soft } });

  whoCell(cell("who"), w);

  const cost = Math.round((e.cost[0] + e.cost[1]) / 2);
  const costCell = cell("cost");
  if (scale) {
    const [lo, hi] = scale.costPerDay(input.ctx);
    const days = input.ctx.stayDays;
    if (scale.perDay) {
      // Price the rounded-up count (whole gallons, diapers), the same way the app does.
      const perDay = round2(scale.perDay(input.ctx));
      const perUnit = round2((lo + hi) / 2 / scale.perDay(input.ctx));
      costCell.value = {
        formula: `ROUND(${perUnit}*ROUNDUP(${perDay}*${DAYS},0),0)`,
        result: Math.round(perUnit * Math.ceil(perDay * days)),
      };
    } else {
      const perDay = round2((lo + hi) / 2);
      costCell.value = { formula: `ROUND(${perDay}*${DAYS},0)`, result: Math.round(perDay * days) };
    }
  } else if (cost > 0) costCell.value = cost;
  costCell.numFmt = MONEY_FMT;
  bodyCell(costCell, {}, 0);
  costCell.alignment = { vertical: "middle", horizontal: "right", indent: 1 };

  linkCell(cell("example"), e.item.examples?.[0]);

  bodyCell(cell("notes"), { size: 10 });

}

// ---------------------------------------------------------------------------
// Expiration dates: things that expire or need a regular check, food first
// ---------------------------------------------------------------------------

const EXPIRING_HEADS_COL = "G";

/** The kits in the order the Kit dropdown lists them. */
const EXPIRING_KITS: Container[] = ["stay", "go", "car", "home"];

function buildExpiring(ws: Worksheet, ctx: Context, w: Words) {
  const ex = w.x.expiring;
  const { now: DUE_NOW, soon: DUE_SOON, good: GOOD } = w.x.heads;
  ws.columns = [
    { width: 38 }, // A Item
    { width: 18 }, // B Kit
    { width: 15 }, // C Replace every
    { width: 15 }, // D Packed on
    { width: 16 }, // E Date on package
    { width: 15 }, // F Due by
    { width: 13 }, // G Heads-up
    { width: 58 }, // H Notes
  ].map((c) => ({ ...c, style: { font: font() } }));

  title(ws, w.x.sheets.expiring, ex.sub, "H");
  ws.getRow(3).height = 8;
  const HEADER = 4;
  headerRow(ws, HEADER, [...ex.headers], {
    2: ex.notes.kit,
    3: ex.notes.every,
    4: ex.notes.packed,
    5: ex.notes.date,
    6: ex.notes.due,
    7: ex.notes.heads(DUE_NOW, DUE_SOON, GOOD),
  });
  // headerRow centers the first column; this one holds text.
  ws.getRow(HEADER).getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  for (const col of [6, 7]) ws.getRow(HEADER).getCell(col).fill = fill(C.soft);

  const kits = EXPIRING_KITS.map((c) => w.meta.container[c].name);
  // Rows name their kit in English ("Go bag"); the dropdown shows the list's language.
  const kitName = (name: string) => {
    const c = EXPIRING_KITS.find((c) => CONTAINER_META[c].name === name || c === name);
    return c ? w.meta.container[c].name : name;
  };
  const writeRow = (row: number, item?: { item: string; kit: string; every?: number; note: string }) => {
    const r = ws.getRow(row);
    r.height = 24;
    r.getCell(1).value = item?.item ?? null;
    bodyCell(r.getCell(1));
    const kit = r.getCell(2);
    kit.value = item ? kitName(item.kit) : null;
    bodyCell(kit, { size: 10, color: { argb: C.soft } });
    kit.dataValidation = { type: "list", allowBlank: true, formulae: [`"${kits.join(",")}"`], showErrorMessage: false };
    const every = r.getCell(3);
    if (item?.every) every.value = item.every;
    every.numFmt = w.x.monthsFormat;
    bodyCell(every, { color: { argb: C.soft } });
    every.dataValidation = {
      type: "whole",
      operator: "between",
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: ex.headers[2],
      error: ex.everyError,
      formulae: [1, 120],
    };
    for (const col of [4, 5]) {
      const c = r.getCell(col);
      bodyCell(c);
      c.numFmt = w.x.dateFormat;
      c.fill = fill(C.input);
      c.dataValidation = {
        type: "date",
        operator: "greaterThan",
        allowBlank: true,
        showErrorMessage: true,
        errorTitle: ex.dateErrorTitle,
        error: ex.dateError,
        formulae: [new Date(Date.UTC(2000, 0, 1))],
      };
    }
    const due = r.getCell(6);
    // Works in Google Sheets and Excel. Apple Numbers mistranslates date functions on cells
    // that were empty when the file was opened, so there only "Date on package" calculates.
    due.value = { formula: `IF(E${row}<>"",E${row},IF(AND(D${row}<>"",C${row}<>""),EDATE(D${row},C${row}),""))` };
    due.numFmt = w.x.dateFormat;
    bodyCell(due, { color: { argb: C.soft } });
    due.fill = fill(C.auto);
    const heads = r.getCell(7);
    heads.value = {
      formula: `IF(F${row}="","",IF(F${row}<=TODAY(),"${DUE_NOW}",IF(F${row}<=EDATE(TODAY(),6),"${DUE_SOON}","${GOOD}")))`,
    };
    bodyCell(heads, { size: 10, color: { argb: C.soft } });
    heads.fill = fill(C.auto);
    r.getCell(8).value = item?.note || null;
    bodyCell(r.getCell(8), { size: 10, color: { argb: C.soft } });
  };

  let row = HEADER + 1;
  const first = row;
  for (const section of expiringSections(ctx)) {
    sectionRow(ws, row++, section.name, section.desc, 8);
    for (const item of section.rows) writeRow(row++, item);
    for (let i = 0; i < section.blanks; i++) writeRow(row++);
  }
  const last = row - 1;

  ws.addConditionalFormatting({
    ref: `G${first}:G${last}`,
    rules: [
      {
        type: "expression",
        priority: 1,
        formulae: [`$G${first}="${DUE_NOW}"`],
        style: { font: { color: { argb: C.orange }, bold: true }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.orangeWash } } },
      },
      {
        type: "expression",
        priority: 2,
        formulae: [`$G${first}="${DUE_SOON}"`],
        style: { font: { color: { argb: C.amber }, bold: true }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.amberWash } } },
      },
      { type: "expression", priority: 3, formulae: [`$G${first}="${GOOD}"`], style: { font: { color: { argb: C.green } } } },
    ],
  });
  // The rest of the row gets the same tint, so due items stand out while scrolling.
  ws.addConditionalFormatting({
    ref: `A${first}:H${last}`,
    rules: [
      {
        type: "expression",
        priority: 4,
        formulae: [`$G${first}="${DUE_NOW}"`],
        style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.orangeWash } } },
      },
      {
        type: "expression",
        priority: 5,
        formulae: [`$G${first}="${DUE_SOON}"`],
        style: { fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.amberWash } } },
      },
    ],
  });

  const tip = ws.getCell(`A${last + 2}`);
  tip.value = ex.tip;
  tip.font = font({ size: 10, color: { argb: C.soft } });
  tip.alignment = { indent: 1 };

  ws.autoFilter = { from: { row: HEADER, column: 1 }, to: { row: last, column: 8 } };
  ws.views = [{ state: "frozen", ySplit: HEADER, showGridLines: false }];
}

// ---------------------------------------------------------------------------
// Neighbors: a blank sheet. Neighbors' details never go into the app or a share link.
// ---------------------------------------------------------------------------

function buildNeighbors(ws: Worksheet, w: Words) {
  const nx = w.x.neighbors;
  const widths = [24, 24, 20, 30, 34, 28];
  const cols = nx.headers.map((label, i) => [label, Math.max(widths[i], label.length + 2)] as const);
  ws.columns = cols.map(([, width]) => ({ width, style: { font: font() } }));
  title(ws, w.x.sheets.neighbors, nx.sub, "F");
  ws.getRow(3).height = 8;
  const HEADER = 4;
  headerRow(ws, HEADER, cols.map(([label]) => label), { 4: nx.skillsNote, 5: nx.knowNote });
  ws.getRow(HEADER).getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  for (let row = HEADER + 1; row <= HEADER + 12; row++) {
    const r = ws.getRow(row);
    r.height = 24;
    for (let c = 1; c <= cols.length; c++) {
      bodyCell(r.getCell(c));
      r.getCell(c).fill = fill(C.input);
    }
    r.getCell(6).dataValidation = { type: "list", allowBlank: true, formulae: [`"${w.x.yesNo.join(",")}"`], showErrorMessage: false };
  }
  const spot = ws.getCell(`A${HEADER + 14}`);
  spot.value = nx.meetingSpot;
  spot.font = font({ bold: true });
  spot.alignment = { indent: 1 };
  ws.mergeCells(`B${HEADER + 14}:D${HEADER + 14}`);
  inputStyle(ws.getCell(`B${HEADER + 14}`));
  ws.views = [{ state: "frozen", ySplit: HEADER, showGridLines: false }];
}

// ---------------------------------------------------------------------------
// When it happens: the first-hour card, sized to print on one page.
// ---------------------------------------------------------------------------

function buildCard(ws: Worksheet, sections: ReturnType<typeof firstHourCard>, w: Words) {
  ws.columns = [{ width: 5 }, { width: 92 }].map((c) => ({ ...c, style: { font: font() } }));
  title(ws, w.x.sheets.card, w.x.card.sub, "B");

  let row = 4;
  for (const s of sections) {
    ws.getRow(row).height = 28;
    const h = ws.getCell(`A${row}`);
    h.value = s.title;
    h.font = { name: DISPLAY, size: 13, bold: true, color: { argb: C.ink } };
    h.alignment = { vertical: "bottom" };
    row++;
    s.lines.forEach((line, i) => {
      const r = ws.getRow(row++);
      r.height = 34;
      r.getCell(1).value = `${i + 1}.`;
      r.getCell(1).font = font({ bold: true });
      r.getCell(1).alignment = { vertical: "top", horizontal: "right" };
      r.getCell(2).value = line;
      r.getCell(2).font = font({ size: 12 });
      r.getCell(2).alignment = { vertical: "top", wrapText: true, indent: 1 };
    });
    row++;
  }
  ws.pageSetup.fitToHeight = 1;
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function buildOverview(ws: Worksheet, input: ExportInput, layout: SupplyLayout, w: Words) {
  const { answers, ctx } = input;
  const o = w.x.overview;
  const { status, sheets } = w.x;
  const { now: DUE_NOW, soon: DUE_SOON } = w.x.heads;
  const { todos: TODOS, supplies: SUPPLIES } = w.ref;
  ws.columns = [{ width: 3 }, { width: 30 }, { width: 20 }, { width: 62 }].map((c) => ({ ...c, style: { font: font() } }));

  // Title block
  ws.getRow(1).height = 14;
  ws.getRow(2).height = 40;
  ws.mergeCells("B2:D2");
  const t = ws.getCell("B2");
  t.value = w.x.title;
  t.font = { name: DISPLAY, size: 24, bold: true, color: { argb: C.ink } };
  t.alignment = { vertical: "bottom" };

  ws.mergeCells("B3:D3");
  const sub = ws.getCell("B3");
  sub.value = listSummary(answers, ctx);
  sub.font = font({ size: 11, color: { argb: C.soft } });
  sub.alignment = { vertical: "top", wrapText: true };
  ws.getRow(3).height = 32;

  ws.mergeCells("B4:D4");
  const link = ws.getCell("B4");
  const url = input.shareUrl.length < 2000 ? input.shareUrl : input.shareUrl.split("#")[0];
  link.value = { text: o.openLink, hyperlink: url };
  link.font = font({ size: 10, color: { argb: C.ink }, underline: true });

  // Where things stand
  const { cost } = layout;
  const heads = `${w.ref.expiring}!$${EXPIRING_HEADS_COL}:$${EXPIRING_HEADS_COL}`;
  // "3 of 12": how many are done, of the ones not skipped.
  const countOf = (sheet: string, done: string, open: string[]) => {
    const n = (v: string) => `COUNTIF(${sheet}!$A:$A,"${v}")`;
    return `${n(done)}&"${o.of}"&(${[done, ...open].map(n).join("+")})`;
  };
  let row = 6;
  overviewSection(ws, row++, o.whereThingsStand);
  const stats: [string, ExcelJSNamespace.CellValue, string, string?][] = [
    [o.todosDone, { formula: countOf(TODOS, status.done, [status.todo, status.partly]) }, o.todosHint],
    [
      o.suppliesReady,
      { formula: countOf(SUPPLIES, status.have, [status.need, status.partly]) },
      layout.bags ? o.suppliesHintBags : o.suppliesHint,
    ],
    [
      o.stillToBuy,
      {
        formula: [status.need, status.partly]
          .map((v) => `SUMIF(${SUPPLIES}!$A:$A,"${v}",${SUPPLIES}!$${cost}:$${cost})`)
          .join("+"),
      },
      o.stillToBuyHint,
      MONEY_FMT,
    ],
    [DUE_NOW, { formula: `COUNTIF(${heads},"${DUE_NOW}")` }, o.dueNowHint(sheets.expiring), "0"],
    [o.dueSoon, { formula: `COUNTIF(${heads},"${DUE_SOON}")` }, o.dueSoonHint, "0"],
  ];
  const statRows: number[] = [];
  for (const [label, value, hint, fmt] of stats) {
    statRows.push(row);
    statRow(ws, row++, label, value, hint, fmt);
  }
  // "Due now" turns orange only when there's something to do.
  const replaceRow = statRows[3];
  ws.addConditionalFormatting({
    ref: `C${replaceRow}`,
    rules: [{ type: "expression", priority: 1, formulae: [`C${replaceRow}>0`], style: { font: { color: { argb: C.orange }, bold: true } } }],
  });

  row++;
  const check = new Date(input.today ?? new Date());
  const next = new Date(Date.UTC(check.getFullYear(), check.getMonth() + 6, check.getDate()));
  statRow(ws, row, o.nextCheck, next, o.nextCheckHint, w.x.dateFormat);
  inputStyle(ws.getCell(`C${row}`));
  row++;

  // Days at home: change it and the stay-at-home bin's water, food, and costs recalculate.
  if (row !== DAYS_ROW) throw new Error(`Overview layout moved: days at row ${row}, expected ${DAYS_ROW}`);
  // A plain number: some apps carry a "days" format into the formulas that read it.
  statRow(ws, row, o.days, ctx.stayDays, o.daysHint, "0");
  const days = ws.getCell(`C${row}`);
  inputStyle(days);
  // A plain number rather than a dropdown: some apps (Numbers) reset dropdowns to the first choice on import.
  days.dataValidation = {
    type: "whole",
    operator: "between",
    allowBlank: false,
    showErrorMessage: true,
    errorTitle: o.days,
    error: o.daysError,
    formulae: [1, 90],
  };
  days.note = o.daysNote;
  row += 2;

  // Your people: feeds the Who dropdowns (w.whoRange) and names the go bag columns.
  overviewSection(ws, row++, o.people);
  if (row !== NAMES_FIRST_ROW) throw new Error(`Overview layout moved: names start at row ${row}, expected ${NAMES_FIRST_ROW}`);
  const names = peopleNames(ctx);
  for (let i = 0; i < NAMES_COUNT; i++) {
    const r = row + i;
    const cell = ws.getCell(`B${r}`);
    cell.value = names[i] ?? "";
    cell.font = font();
    cell.fill = fill(C.input);
    cell.border = { bottom: hairline };
    cell.alignment = { vertical: "middle", indent: 1 };
    ws.getRow(r).height = 22;
  }
  const hint = ws.getCell(`D${row}`);
  hint.value = layout.bags ? o.peopleHintBags : o.peopleHint;
  hint.font = font({ size: 10, color: { argb: C.soft } });
  hint.alignment = { vertical: "middle" };
  row += NAMES_COUNT + 1;

  // Know your home: blanks for the things the to-dos ask people to find out.
  overviewSection(ws, row++, o.knowYourHome);
  for (const { label, value, fact, person } of factFields(homeFacts(ctx), ctx, input.home ?? EMPTY_HOME)) {
    ws.getRow(row).height = 24;
    const l = ws.getCell(`B${row}`);
    l.value = label;
    l.font = font();
    l.alignment = { vertical: "middle", indent: 1 };
    l.border = { bottom: hairline };
    ws.mergeCells(`C${row}:D${row}`);
    const v = ws.getCell(`C${row}`);
    if (value.trim()) v.value = value.trim();
    v.font = font();
    v.fill = fill(C.input);
    v.border = { bottom: hairline };
    v.alignment = { vertical: "middle", indent: 1, wrapText: true };
    if (!person) v.note = fact.hint;
    row++;
  }
  row++;

  overviewSection(ws, row++, o.notes);
  // One line of notes per row; anything past the last row goes in the last one.
  const NOTE_ROWS = 8;
  const lines = (input.home?.notes ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const noteRows = [...lines.slice(0, NOTE_ROWS - 1), lines.slice(NOTE_ROWS - 1).join(" ")];
  for (let i = 0; i < NOTE_ROWS; i++) {
    ws.getRow(row).height = 24;
    ws.mergeCells(`B${row}:D${row}`);
    const c = ws.getCell(`B${row}`);
    if (noteRows[i]) c.value = noteRows[i];
    c.font = font();
    c.fill = fill(C.input);
    c.border = { bottom: hairline };
    c.alignment = { vertical: "middle", indent: 1, wrapText: true };
    row++;
  }
  row++;

  // How to use
  overviewSection(ws, row++, o.howTo);
  const steps = [
    o.steps.who,
    layout.bags ? o.steps.statusBags : o.steps.status,
    o.steps.expiring(sheets.expiring),
    o.steps.checkUp(DUE_NOW, DUE_SOON),
    o.steps.neighbors(sheets.neighbors) + (firstHourCard(ctx).length ? o.steps.card(sheets.card) : ""),
  ];
  steps.forEach((s, i) => {
    ws.mergeCells(`B${row}:D${row}`);
    const c = ws.getCell(`B${row}`);
    const text = `${i + 1}.  ${s}`;
    c.value = text;
    c.font = font();
    // A merged cell doesn't spill over, so long steps wrap onto a second line.
    c.alignment = { vertical: "middle", indent: 1, wrapText: true };
    ws.getRow(row).height = text.length > STEP_LINE ? 38 : 22;
    row++;
  });

  const county = answers.county ? COUNTY_BY_ID[answers.county] : undefined;
  if (county) {
    row++;
    const label = ws.getCell(`B${row}`);
    label.value = o.alerts;
    label.font = font({ color: { argb: C.soft } });
    label.alignment = { indent: 1 };
    const c = ws.getCell(`C${row}`);
    c.value = { text: o.signUp(county.alert.name), hyperlink: county.alert.url };
    c.font = font({ underline: true });
  }

  ws.views = [{ showGridLines: false }];
}

/** About how many characters fit on one line across the Overview's B:D. */
const STEP_LINE = 105;

/** Overview cells people are meant to change: a soft fill and a bold value. */
function inputStyle(cell: ExcelJSNamespace.Cell) {
  cell.fill = fill(C.input);
  cell.font = { name: DISPLAY, size: 13, bold: true, color: { argb: C.ink } };
  cell.border = { bottom: { style: "thin", color: { argb: C.muted } } };
}

function overviewSection(ws: Worksheet, row: number, text: string) {
  ws.getRow(row).height = 30;
  const c = ws.getCell(`B${row}`);
  c.value = text;
  c.font = { name: DISPLAY, size: 13, bold: true, color: { argb: C.ink } };
  c.alignment = { vertical: "bottom" };
  for (const col of ["B", "C", "D"]) ws.getCell(`${col}${row}`).border = { bottom: { style: "thin", color: { argb: C.ink } } };
}

function statRow(ws: Worksheet, row: number, label: string, value: ExcelJSNamespace.CellValue, hint: string, fmt?: string) {
  ws.getRow(row).height = 28;
  const l = ws.getCell(`B${row}`);
  l.value = label;
  l.font = font();
  l.alignment = { vertical: "middle", indent: 1 };
  const v = ws.getCell(`C${row}`);
  v.value = value;
  v.font = { name: DISPLAY, size: 14, bold: true, color: { argb: C.ink } };
  v.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  if (fmt) v.numFmt = fmt;
  const h = ws.getCell(`D${row}`);
  h.value = hint;
  h.font = font({ size: 10, color: { argb: C.soft } });
  h.alignment = { vertical: "middle" };
  for (const col of ["B", "C", "D"]) ws.getCell(`${col}${row}`).border = { bottom: hairline };
}

/** Build the workbook and return finished .xlsx bytes. */
export async function toXlsx(Excel: ExcelJS, input: ExportInput): Promise<Uint8Array> {
  const wb = buildWorkbook(Excel, input);
  return new Uint8Array(await wb.xlsx.writeBuffer());
}

// ---------------------------------------------------------------------------
// Browser download
// ---------------------------------------------------------------------------

export async function downloadWorkbook(input: ExportInput, filename = messagesFor(input.ctx.lang).exports.xlsx.file) {

  const mod = await import("exceljs");
  const Excel = (mod.default ?? mod) as ExcelJS;
  const buffer = await toXlsx(Excel, input);
  const url = URL.createObjectURL(
    new Blob([buffer as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
