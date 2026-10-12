import type ExcelJSNamespace from "exceljs";
import type { Answers, Container, Context, ItemState, ListEntry, Shop, Stage } from "./types";
import { CONTAINER_ORDER, firstSteps, planStage } from "./buildList";
import { MAX_PEOPLE, peopleNames, resolveBuild } from "./answers";
import { CATEGORY_ORDER, CONTAINER_META, STAGE_META } from "@/data/meta";
import { COUNTY_BY_ID } from "@/data/counties";
import { HAZARD_BY_ID } from "@/data/hazards";

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

const DATE_FMT = "mmm d, yyyy";
const MONEY_FMT = '"$"#,##0';

const SHOP_SHORT: Record<Shop, string> = {
  free: "At home",
  grocery: "Grocery",
  pharmacy: "Pharmacy",
  hardware: "Hardware store",
  outdoor: "Outdoor store",
  online: "Online",
};

// The "Your people" names on the Overview tab feed every Who dropdown and
// name the per-person columns.
const NAMES_FIRST_ROW = 17;
const NAMES_COUNT = MAX_PEOPLE;
const WHO_RANGE = `Overview!$B$${NAMES_FIRST_ROW}:$B$${NAMES_FIRST_ROW + NAMES_COUNT - 1}`;
// "Days at home" on the Overview tab. Stay bin amounts that scale with days read it.
const DAYS_ROW = 14;
const DAYS = `Overview!$C$${DAYS_ROW}`;

const STATUS = { supplies: ["Need", "Have", "Skip"], todos: ["To do", "Done", "Skip"] };

// ---------------------------------------------------------------------------

export function buildWorkbook(Excel: ExcelJS, input: ExportInput): Workbook {
  const wb = new Excel.Workbook();
  wb.creator = "Bay Ready";
  wb.created = input.today ?? new Date();
  wb.calcProperties.fullCalcOnLoad = true;

  const overview = wb.addWorksheet("Overview", sheetOpts());
  const todos = wb.addWorksheet("To-dos", sheetOpts());
  const supplies = wb.addWorksheet("Supplies", sheetOpts());
  const food = wb.addWorksheet(FOOD_SHEET, sheetOpts());

  const active = input.entries.filter((e) => input.stateOf(e) !== "skip");
  const firstKeys = new Set(firstSteps(input.entries, input.stateOf, input.answers).map((e) => e.key));

  buildTodos(todos, active.filter((e) => e.container === "home"), input, firstKeys);
  const layout = buildSupplies(supplies, active.filter((e) => e.container !== "home"), input);
  buildFood(food, input.ctx);
  buildOverview(overview, input, layout);

  return wb;
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

function statusCell(cell: ExcelJSNamespace.Cell, value: string, options: string[]) {
  cell.value = value;
  // Quiet by default. Conditional formats make finished rows stand out in green.
  cell.font = font({ size: 10, color: { argb: C.soft } });
  cell.alignment = { vertical: "middle", horizontal: "center" };
  cell.border = { bottom: hairline };
  cell.dataValidation = { type: "list", allowBlank: false, formulae: [`"${options.join(",")}"`] };
}

function whoCell(cell: ExcelJSNamespace.Cell) {
  bodyCell(cell);
  cell.dataValidation = {
    type: "list",
    allowBlank: true,
    formulae: [WHO_RANGE],
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
function statusFormats(ws: Worksheet, first: number, last: number, done: string, itemCols: string) {
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
      { type: "expression", priority: 2, formulae: [`$A${first}="Skip"`], style: { font: { color: { argb: C.muted } } } },
    ],
  });
  ws.addConditionalFormatting({
    ref: itemCols.replace(/\{f\}/g, String(first)).replace(/\{l\}/g, String(last)),
    rules: [
      { type: "expression", priority: 3, formulae: [`$A${first}="${done}"`], style: { font: { color: { argb: C.soft } } } },
      { type: "expression", priority: 4, formulae: [`$A${first}="Skip"`], style: { font: { color: { argb: C.muted }, strike: true } } },
    ],
  });
}

// ---------------------------------------------------------------------------
// Per-person Done columns (go bags on Supplies, per-adult tasks on To-dos)
// ---------------------------------------------------------------------------

/** Header cells named after the people on the Overview tab, so renaming someone there renames their column. */
function personHeaders(ws: Worksheet, headerRow: number, startCol: number, count: number, ctx: Context) {
  const names = peopleNames(ctx);
  for (let i = 0; i < count; i++) {
    const cell = ws.getRow(headerRow).getCell(startCol + i);
    const ref = `Overview!$B$${NAMES_FIRST_ROW + i}`;
    const fallback = `Person ${i + 1}`;
    cell.value = { formula: `IF(${ref}="","${fallback}",${ref})`, result: names[i] ?? fallback };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  }
}

// Plain text values with a dropdown work the same in Google Sheets, Excel, and Numbers.
const DONE = "Done";
const NOT_DONE = "Not done";

/** A Done / Not done dropdown per person, or quiet grey cells when the row is done once for everyone. */
function personCells(r: ExcelJSNamespace.Row, startCol: number, count: number, done: ((i: number) => boolean) | null) {
  for (let i = 0; i < count; i++) {
    const cell = r.getCell(startCol + i);
    cell.border = { bottom: hairline };
    if (!done) {
      cell.fill = fill(C.auto);
      continue;
    }
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
) {
  const range = `${colLetter(startCol)}${row}:${colLetter(startCol + count - 1)}${row}`;
  cell.value = {
    formula: `IF(COUNTIF(${range},"${DONE}")=${count},"${done}",IF(COUNTIF(${range},"${DONE}")>0,"${partly}","${none}"))`,
    result: allDone ? done : none,
  };
  cell.font = font({ size: 10, color: { argb: C.soft } });
  cell.alignment = { vertical: "middle", horizontal: "center" };
  cell.border = { bottom: hairline };
}

function personFormats(ws: Worksheet, first: number, last: number, startCol: number, count: number) {
  if (!count || last < first) return;
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
    rules: [{ type: "expression", priority: 22, formulae: [`$A${first}="Partly"`], style: { font: { color: { argb: C.amber }, bold: true } } }],
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

function sortByCategory(list: ListEntry[]) {
  return [...list].sort((a, b) => CATEGORY_ORDER.indexOf(a.item.category) - CATEGORY_ORDER.indexOf(b.item.category));
}

// Short enough to fit beside the section name without being cut off.
const TODO_STAGE_BLURB: Record<Stage, string> = {
  weekend: "Free quick wins, about an hour",
  month: "The rest of the plan, plus a few small buys",
  later: "Extra steps for when you're ready",
};

// ---------------------------------------------------------------------------
// To-dos
// ---------------------------------------------------------------------------

function buildTodos(ws: Worksheet, list: ListEntry[], input: ExportInput, firstKeys: Set<string>) {
  // Per-adult tasks (alerts, phone setup) get a Done column for each adult.
  const people = Math.max(0, ...list.map((e) => e.slots.length));
  const P = 3; // first person column
  const [WHO, LINK, WHY] = [P + people, P + people + 1, P + people + 2];
  ws.columns = [
    { width: 11 }, // Status
    { width: 50 }, // Task
    ...Array.from({ length: people }, () => ({ width: 10 })),
    { width: 16 }, // Who
    { width: 28 }, // Link
    { width: 90 }, // Why
  ].map((c) => ({ ...c, style: { font: font() } }));

  title(
    ws,
    "To-dos",
    people
      ? "Most of these are free and quick. Start with This weekend. Some are for each adult, so mark your own column Done."
      : "Most of these are free and quick. Start with This weekend, and set Status to Done as you go.",
    colLetter(WHY),
  );
  const HEADER = 4;
  headerRow(
    ws,
    HEADER,
    ["Status", "Task", ...Array.from({ length: people }, () => ""), "Who", "Link", "Why it matters"],
    { [WHO]: "Who's doing it. Pick a name from the list on the Overview tab, or type one." },
  );
  personHeaders(ws, HEADER, P, people, input.ctx);
  ws.getRow(3).height = 8;

  let row = HEADER + 1;
  const first = row;
  for (const stage of ["weekend", "month", "later"] as Stage[]) {
    const items = sortByCategory(list.filter((e) => planStage(e, firstKeys, input.answers) === stage));
    if (items.length === 0) continue;
    sectionRow(ws, row++, STAGE_META[stage].name, TODO_STAGE_BLURB[stage], WHY);
    for (const e of items) {
      const r = ws.getRow(row);
      r.height = 24;
      const perPerson = people > 0 && e.slots.length > 0;
      if (perPerson) {
        personStatus(r.getCell(1), row, P, people, ["Done", "Partly", "To do"], input.stateOf(e) === "have");
      } else {
        statusCell(r.getCell(1), input.stateOf(e) === "have" ? "Done" : "To do", STATUS.todos);
      }
      r.getCell(2).value = e.item.name;
      bodyCell(r.getCell(2));
      personCells(r, P, people, perPerson ? (i) => input.slotDone(e, i) : null);
      if (perPerson) {
        r.getCell(WHO).value = "Each adult";
        bodyCell(r.getCell(WHO), { size: 10, color: { argb: C.soft } });
      } else {
        whoCell(r.getCell(WHO));
      }
      linkCell(r.getCell(LINK), e.item.link?.(input.ctx));
      r.getCell(WHY).value = e.item.why;
      bodyCell(r.getCell(WHY), { size: 10, color: { argb: C.soft } });
      row++;
    }
  }
  const last = row - 1;
  statusFormats(ws, first, last, "Done", "B{f}:B{l}");
  personFormats(ws, first, last, P, people);
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

type Group = "what" | "bags" | "buy";
interface Col {
  key: string;
  label: string;
  width: number;
  group: Group;
  note?: string;
  auto?: boolean;
}

const GROUP_LABEL: Record<Group, string> = {
  what: "What to get",
  bags: "Each go bag",
  buy: "Buying",
};

const round2 = (n: number) => Math.round(n * 100) / 100;

function colLetter(n: number): string {
  let s = "";
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}

/** One Done column per person who carries a go bag, when there's more than one bag. */
function bagCount(ctx: Context): number {
  return ctx.kits.includes("go") && ctx.carriers > 1 ? Math.min(ctx.carriers, MAX_PEOPLE) : 0;
}

function supplyColumns(bags: number): Col[] {
  return [
    { key: "status", label: "Status", width: 10, group: "what" },
    { key: "item", label: "Item", width: 42, group: "what" },
    { key: "amount", label: "Amount", width: 20, group: "what" },
    ...Array.from({ length: bags }, (_, i): Col => ({ key: `bag${i}`, label: defaultLabel(i), width: 10, group: "bags" })),
    { key: "who", label: "Who's buying", width: 14, group: "buy", note: "Who's getting it. Pick a name from the Overview tab, or type one." },
    { key: "cost", label: "Est. cost", width: 11, group: "buy", note: "A rough estimate for the whole amount." },
    { key: "where", label: "Where", width: 15, group: "buy" },
    { key: "example", label: "Example", width: 22, group: "buy" },
  ];
}

function defaultLabel(i: number) {
  return `Bag ${i + 1}`;
}

function buildSupplies(ws: Worksheet, list: ListEntry[], input: ExportInput): SupplyLayout {
  const bags = bagCount(input.ctx);
  const cols = supplyColumns(bags);
  const idx = Object.fromEntries(cols.map((c, i) => [c.key, i + 1])) as Record<string, number>;
  const L = (key: string) => colLetter(idx[key]);
  const lastCol = colLetter(cols.length);

  ws.columns = cols.map((c) => ({ width: c.width, style: { font: font() } }));

  title(
    ws,
    "Supplies",
    bags
      ? "Mark each person Done as you pack their go bag. For everything else, set Status to Have when you get it."
      : "Set Status to Have when you get something. Track food and water dates on the Food & water tab.",
    lastCol,
  );

  // Group labels above the header, so the parts of the table read at a glance.
  const GROUP = 4;
  const HEADER = 5;
  ws.getRow(3).height = 8;
  ws.getRow(GROUP).height = 20;
  for (const group of ["what", "bags", "buy"] as Group[]) {
    const members = cols.map((c, i) => (c.group === group ? i + 1 : 0)).filter(Boolean);
    if (members.length === 0) continue;
    const a = colLetter(members[0]);
    const b = colLetter(members[members.length - 1]);
    if (a !== b) ws.mergeCells(`${a}${GROUP}:${b}${GROUP}`);
    const g = ws.getCell(`${a}${GROUP}`);
    g.value = GROUP_LABEL[group];
    g.font = { name: DISPLAY, size: 10, bold: true, color: { argb: C.soft } };
    g.alignment = { vertical: "bottom", horizontal: group === "bags" ? "center" : "left", indent: group === "bags" ? 0 : 1 };
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
  if (bags) personHeaders(ws, HEADER, idx.bag0, bags, input.ctx);

  let row = HEADER + 1;
  const first = row;
  const kits = CONTAINER_ORDER.filter((c): c is Exclude<Container, "home"> => c !== "home");
  for (const kit of kits) {
    const items = sortByCategory(list.filter((e) => e.container === kit));
    if (items.length === 0) continue;
    sectionRow(ws, row++, CONTAINER_META[kit].name, kitBlurb(kit, input.ctx), cols.length);
    if (kit === "go" && bags) {
      // What goes in every bag, then what the group needs just one of.
      const groups: [string, string, ListEntry[]][] = [
        ["In every bag", "Mark each person Done as you pack their bag", items.filter((e) => e.slots.length > 0)],
        ["One for the group", "Just one of these. Decide whose bag it goes in", items.filter((e) => e.slots.length === 0)],
      ];
      for (const [name, desc, group] of groups) {
        if (group.length === 0) continue;
        subSectionRow(ws, row++, name, desc, cols.length);
        for (const e of group) writeSupplyRow(ws, row++, e, input, idx, bags);
      }
    } else {
      for (const e of items) writeSupplyRow(ws, row++, e, input, idx, bags);
    }
  }
  const last = row - 1;

  // Total
  row++;
  const total = ws.getRow(row);
  total.height = 28;
  total.getCell(idx.item).value = "Still to buy (rough estimate)";
  total.getCell(idx.item).font = font({ bold: true });
  total.getCell(idx.item).alignment = { vertical: "middle", indent: 1 };
  const costRange = `${L("cost")}${first}:${L("cost")}${last}`;
  const statusRange = `A${first}:A${last}`;
  const totalCell = total.getCell(idx.cost);
  totalCell.value = { formula: `SUMIF(${statusRange},"Need",${costRange})+SUMIF(${statusRange},"Partly",${costRange})` };
  totalCell.numFmt = MONEY_FMT;
  totalCell.font = font({ bold: true });
  totalCell.alignment = { vertical: "middle", horizontal: "right", indent: 1 };
  for (let i = 1; i <= cols.length; i++) total.getCell(i).border = { top: { style: "thin", color: { argb: C.ink } } };

  if (last >= first) {
    statusFormats(ws, first, last, "Have", "B{f}:C{l}");
    if (bags) personFormats(ws, first, last, idx.bag0, bags);
  }

  ws.autoFilter = { from: { row: HEADER, column: 1 }, to: { row: Math.max(last, HEADER), column: cols.length } };
  ws.views = [{ state: "frozen", ySplit: HEADER, xSplit: 2, showGridLines: false }];

  return { cost: L("cost"), bags };
}

function kitBlurb(kit: Container, ctx: Context): string {
  if (kit === "stay") return "Amounts follow Days at home on the Overview tab";
  if (kit === "go") return bagCount(ctx) ? `${ctx.carriers} bags, one for each person who can carry one` : "Ready to grab in minutes";
  return "Kept in the trunk";
}

function writeSupplyRow(ws: Worksheet, row: number, e: ListEntry, input: ExportInput, idx: Record<string, number>, bags: number) {
  const r = ws.getRow(row);
  const cell = (key: string) => r.getCell(idx[key]);
  r.height = 24;
  const have = input.stateOf(e) === "have";
  const perBag = bags > 0 && e.slots.length > 0;

  if (perBag) personStatus(cell("status"), row, idx.bag0, bags, ["Have", "Partly", "Need"], have);
  else statusCell(cell("status"), have ? "Have" : "Need", STATUS.supplies);
  if (bags) personCells(r, idx.bag0, bags, perBag ? (i) => input.slotDone(e, i) : null);

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
      amount.value = {
        formula: `ROUNDUP(${perDay}*${DAYS},0)&" ${scale.unit ?? ""}"`,
        result: `${Math.ceil(perDay * days)} ${scale.unit ?? ""}`,
      };
    } else {
      const suffix = scale.suffix?.(input.ctx) ?? "";
      amount.value = { formula: `${DAYS}&" days${suffix}"`, result: `${days} days${suffix}` };
    }
  } else {
    amount.value = e.qty?.text ?? "";
  }
  bodyCell(amount, { size: 10, color: { argb: C.soft } });

  whoCell(cell("who"));

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

  cell("where").value = SHOP_SHORT[e.item.shop];
  bodyCell(cell("where"), { size: 10, color: { argb: C.soft } });

  linkCell(cell("example"), e.item.examples?.[0]);

}

// ---------------------------------------------------------------------------
// Food & water: a blank log for the things that need rotating
// ---------------------------------------------------------------------------

const FOOD_SHEET = "Food & water";
const FOOD_HEADS_COL = "E";
const FOOD_ROWS = 60;

function buildFood(ws: Worksheet, ctx: Context) {
  ws.columns = [
    { width: 36 }, // Food or water
    { width: 18 }, // How much
    { width: 13 }, // Kit
    { width: 15 }, // Expires
    { width: 16 }, // Heads-up
    { width: 44 }, // Notes
  ].map((c) => ({ ...c, style: { font: font() } }));

  title(
    ws,
    FOOD_SHEET,
    "Write down the food and water you store and when each expires. Heads-up tells you what to eat or swap soon.",
    "F",
  );
  ws.getRow(3).height = 8;
  const HEADER = 4;
  headerRow(ws, HEADER, ["Food or water", "How much", "Kit", "Expires", "Heads-up", "Notes"], {
    3: "Where it's stored.",
    4: "The date on the package. For water you bottled yourself, use the day you filled it plus 6 months.",
    5: "Fills in on its own.\nReplace now: past its date.\nReplace soon: within the next 6 months.\nGood: nothing to do.",
  });
  // The first cell is centered by headerRow; this column holds text.
  ws.getRow(HEADER).getCell(1).alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  ws.getRow(HEADER).getCell(5).fill = fill(C.soft);

  const kits = (["stay", "go", "car"] as Container[]).filter((k) => ctx.kits.includes(k)).map((k) => CONTAINER_META[k].name);
  const first = HEADER + 1;
  const last = HEADER + FOOD_ROWS;
  for (let row = first; row <= last; row++) {
    const r = ws.getRow(row);
    r.height = 24;
    bodyCell(r.getCell(1));
    bodyCell(r.getCell(2), { size: 10, color: { argb: C.soft } });
    const kit = r.getCell(3);
    bodyCell(kit, { size: 10, color: { argb: C.soft } });
    kit.dataValidation = { type: "list", allowBlank: true, formulae: [`"${kits.join(",")}"`], showErrorMessage: false };
    const expires = r.getCell(4);
    bodyCell(expires);
    expires.numFmt = DATE_FMT;
    expires.dataValidation = {
      type: "date",
      operator: "greaterThan",
      allowBlank: true,
      showErrorMessage: true,
      errorTitle: "That doesn't look like a date",
      error: "Try something like 3/1/2027.",
      formulae: [new Date(Date.UTC(2000, 0, 1))],
    };
    const heads = r.getCell(5);
    heads.value = { formula: `IF(D${row}="","",IF(D${row}<=TODAY(),"Replace now",IF(D${row}<=EDATE(TODAY(),6),"Replace soon","Good")))` };
    bodyCell(heads, { size: 10, color: { argb: C.soft } });
    heads.fill = fill(C.auto);
    bodyCell(r.getCell(6), { size: 10, color: { argb: C.soft } });
  }

  ws.addConditionalFormatting({
    ref: `E${first}:E${last}`,
    rules: [
      {
        type: "expression",
        priority: 1,
        formulae: [`$E${first}="Replace now"`],
        style: { font: { color: { argb: C.orange }, bold: true }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.orangeWash } } },
      },
      {
        type: "expression",
        priority: 2,
        formulae: [`$E${first}="Replace soon"`],
        style: { font: { color: { argb: C.amber }, bold: true }, fill: { type: "pattern", pattern: "solid", bgColor: { argb: C.amberWash } } },
      },
      { type: "expression", priority: 3, formulae: [`$E${first}="Good"`], style: { font: { color: { argb: C.green } } } },
    ],
  });

  const tip = ws.getCell(`A${last + 2}`);
  tip.value = "Eat the oldest first and replace it on your next shop. Need more rows? Copy the last row down so Heads-up comes with it.";
  tip.font = font({ size: 10, color: { argb: C.soft } });
  tip.alignment = { indent: 1 };

  ws.autoFilter = { from: { row: HEADER, column: 1 }, to: { row: last, column: 6 } };
  ws.views = [{ state: "frozen", ySplit: HEADER, showGridLines: false }];
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function buildOverview(ws: Worksheet, input: ExportInput, layout: SupplyLayout) {
  const { answers, ctx } = input;
  ws.columns = [{ width: 3 }, { width: 30 }, { width: 20 }, { width: 62 }].map((c) => ({ ...c, style: { font: font() } }));

  // Title block
  ws.getRow(1).height = 14;
  ws.getRow(2).height = 40;
  ws.mergeCells("B2:D2");
  const t = ws.getCell("B2");
  t.value = "Our emergency kit";
  t.font = { name: DISPLAY, size: 24, bold: true, color: { argb: C.ink } };
  t.alignment = { vertical: "bottom" };

  ws.mergeCells("B3:D3");
  const sub = ws.getCell("B3");
  sub.value = summary(answers, ctx);
  sub.font = font({ size: 11, color: { argb: C.soft } });
  sub.alignment = { vertical: "top", wrapText: true };
  ws.getRow(3).height = 32;

  ws.mergeCells("B4:D4");
  const link = ws.getCell("B4");
  const url = input.shareUrl.length < 2000 ? input.shareUrl : input.shareUrl.split("#")[0];
  link.value = { text: "Open this list in Bay Ready", hyperlink: url };
  link.font = font({ size: 10, color: { argb: C.ink }, underline: true });

  // Where things stand
  const { cost } = layout;
  const heads = `'${FOOD_SHEET}'!$${FOOD_HEADS_COL}:$${FOOD_HEADS_COL}`;
  let row = 6;
  overviewSection(ws, row++, "Where things stand");
  const stats: [string, ExcelJSNamespace.CellValue, string, string?][] = [
    [
      "To-dos done",
      {
        formula: `COUNTIF('To-dos'!$A:$A,"Done")&" of "&(COUNTIF('To-dos'!$A:$A,"Done")+COUNTIF('To-dos'!$A:$A,"To do")+COUNTIF('To-dos'!$A:$A,"Partly"))`,
      },
      "Start with This weekend on the To-dos tab.",
    ],
    [
      "Supplies ready",
      {
        formula: `COUNTIF(Supplies!$A:$A,"Have")&" of "&(COUNTIF(Supplies!$A:$A,"Have")+COUNTIF(Supplies!$A:$A,"Need")+COUNTIF(Supplies!$A:$A,"Partly"))`,
      },
      layout.bags ? "Go bag items count once every bag has one." : "Set Status to Have on the Supplies tab as you get things.",
    ],
    [
      "Still to buy",
      { formula: `SUMIF(Supplies!$A:$A,"Need",Supplies!$${cost}:$${cost})+SUMIF(Supplies!$A:$A,"Partly",Supplies!$${cost}:$${cost})` },
      "A rough estimate. Most people spread it over a few months.",
      MONEY_FMT,
    ],
    ["Replace now", { formula: `COUNTIF(${heads},"Replace now")` }, `Food or water past its date. See the ${FOOD_SHEET} tab.`, "0"],
    ["Replace in the next 6 months", { formula: `COUNTIF(${heads},"Replace soon")` }, "Eat these or swap them at your next check-up.", "0"],
  ];
  const statRows: number[] = [];
  for (const [label, value, hint, fmt] of stats) {
    statRows.push(row);
    statRow(ws, row++, label, value, hint, fmt);
  }
  // "Replace now" turns orange only when there's something to do.
  const replaceRow = statRows[3];
  ws.addConditionalFormatting({
    ref: `C${replaceRow}`,
    rules: [{ type: "expression", priority: 1, formulae: [`C${replaceRow}>0`], style: { font: { color: { argb: C.orange }, bold: true } } }],
  });

  row++;
  const check = new Date(input.today ?? new Date());
  const next = new Date(Date.UTC(check.getFullYear(), check.getMonth() + 6, check.getDate()));
  statRow(ws, row, "Next check-up", next, "Check your kits when the clocks change in spring and fall.", DATE_FMT);
  inputStyle(ws.getCell(`C${row}`));
  row++;

  // Days at home: change it and the stay bin's water, food, and costs recalculate.
  if (row !== DAYS_ROW) throw new Error(`Overview layout moved: days at row ${row}, expected ${DAYS_ROW}`);
  statRow(
    ws,
    row,
    "Days at home",
    ctx.stayDays,
    "Stay bin amounts and costs follow this. Aim for at least 7.",
    // A plain number: some apps carry a "days" format into the formulas that read it.
    "0",
  );
  const days = ws.getCell(`C${row}`);
  inputStyle(days);
  // A plain number rather than a dropdown: some apps (Numbers) reset dropdowns to the first choice on import.
  days.dataValidation = {
    type: "whole",
    operator: "between",
    allowBlank: false,
    showErrorMessage: true,
    errorTitle: "Days at home",
    error: "Type a number of days, like 7 or 14.",
    formulae: [1, 90],
  };
  days.note = "Type any number of days, like 7 or 14.";
  row += 2;

  // Your people: feeds the Who dropdowns (WHO_RANGE) and names the go bag columns.
  overviewSection(ws, row++, "Your people");
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
  hint.value = layout.bags
    ? "Change these to real names. They label each go bag column and fill the Who dropdowns."
    : "Add names here. They show up in the Who dropdowns on the other tabs.";
  hint.font = font({ size: 10, color: { argb: C.soft } });
  hint.alignment = { vertical: "middle" };
  row += NAMES_COUNT + 1;

  // How to use
  overviewSection(ws, row++, "How to use this");
  const steps = [
    "Pick who's doing each thing in the Who column.",
    layout.bags
      ? "Packing a go bag? Set that person's column to Done. For everything else, set Status to Have. Finished a task? Set it to Done."
      : "When you get something, set Status to Have. Finished a task? Set it to Done.",
    `Write your food and water on the ${FOOD_SHEET} tab with their expiration dates. Heads-up shows what to replace.`,
    "At each check-up, swap anything marked Replace now or Replace soon.",
  ];
  steps.forEach((s, i) => {
    ws.mergeCells(`B${row}:D${row}`);
    const c = ws.getCell(`B${row}`);
    c.value = `${i + 1}.  ${s}`;
    c.font = font();
    c.alignment = { vertical: "middle", indent: 1 };
    ws.getRow(row).height = 22;
    row++;
  });

  const county = answers.county ? COUNTY_BY_ID[answers.county] : undefined;
  if (county) {
    row++;
    const label = ws.getCell(`B${row}`);
    label.value = "Emergency alerts";
    label.font = font({ color: { argb: C.soft } });
    label.alignment = { indent: 1 };
    const c = ws.getCell(`C${row}`);
    c.value = { text: `Sign up for ${county.alert.name}`, hyperlink: county.alert.url };
    c.font = font({ underline: true });
  }

  ws.views = [{ showGridLines: false }];
}

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

function summary(answers: Answers, ctx: Context): string {
  const build = resolveBuild(answers);
  const kits = { stay: "A stay bin", go: "A go bag", both: "A stay bin and a go bag" }[build];
  const h = answers.household;
  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const who = [
    plural(h.adults, "adult"),
    h.kids && plural(h.kids, "kid"),
    h.babies && plural(h.babies, "baby", "babies"),
    h.dogs && plural(h.dogs, "dog"),
    h.cats && plural(h.cats, "cat"),
    h.otherPets && plural(h.otherPets, "other pet"),
  ].filter(Boolean);
  const hazards = [...ctx.hazards].map((id) => HAZARD_BY_ID[id].name.toLowerCase());
  const level = answers.level === "advanced" ? "Advanced" : "Basics";
  return `${kits} for ${who.join(", ")}. Ready for ${hazards.join(", ")}. ${level} list.`;
}

/** Build the workbook and return finished .xlsx bytes. */
export async function toXlsx(Excel: ExcelJS, input: ExportInput): Promise<Uint8Array> {
  const wb = buildWorkbook(Excel, input);
  return new Uint8Array(await wb.xlsx.writeBuffer());
}

// ---------------------------------------------------------------------------
// Browser download
// ---------------------------------------------------------------------------

export async function downloadWorkbook(input: ExportInput, filename = "emergency-kit.xlsx") {
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
