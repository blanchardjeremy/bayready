import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { writeFileSync } from "node:fs";
import { deriveContext, normalizeAnswers } from "./answers";
import { buildList, slotDone, stateOf } from "./buildList";
import { toXlsx } from "./exportXlsx";
import { ITEMS } from "@/data/items";
import type { ItemState } from "./types";

function makeInput(states: Record<string, ItemState> = {}) {
  const answers = normalizeAnswers({
    build: "both",
    county: "alameda",
    hazards: ["earthquake", "outage", "smoke"],
    household: { adults: 2, kids: 1, dogs: 1 },
    have: ["flashlight"],
  });
  const ctx = deriveContext(answers);
  const entries = buildList(ctx, ITEMS).filter((e) => e.level === "basics");
  return {
    answers,
    ctx,
    entries,
    stateOf: (e: (typeof entries)[number]) => stateOf(e, states, answers),
    slotDone: (e: (typeof entries)[number], i: number) => slotDone(e, i, states, answers),
    shareUrl: "https://example.test/list#abc",
    today: new Date(2026, 9, 11),
  };
}

async function roundTrip(states?: Record<string, ItemState>) {
  const buf = await toXlsx(ExcelJS, makeInput(states));
  if (process.env.XLSX_OUT) writeFileSync(process.env.XLSX_OUT, Buffer.from(buf));
  const back = new ExcelJS.Workbook();
  await back.xlsx.load(buf as unknown as ArrayBuffer);
  return back;
}

/** Column letter for a Supplies header label (columns move with the number of go bags). */
function col(ws: ExcelJS.Worksheet, label: string) {
  let letter = "";
  ws.getRow(5).eachCell((cell, n) => {
    if (!letter && cell.text === label) letter = ws.getColumn(n).letter;
  });
  if (!letter) throw new Error(`no column ${label}`);
  return letter;
}

/** Row whose first cell starts with text (section and sub-section headings). */
function findRowA(ws: ExcelJS.Worksheet, text: string) {
  let found = 0;
  ws.eachRow((row, n) => {
    if (!found && row.getCell(1).text.startsWith(text)) found = n;
  });
  return found;
}

function findRow(ws: ExcelJS.Worksheet, text: string) {
  let found = 0;
  ws.eachRow((row, n) => {
    if (!found && row.getCell(2).text === text) found = n;
  });
  return found;
}

describe("spreadsheet export", () => {
  it("has Overview, To-dos, Supplies, and Food & water tabs", async () => {
    const wb = await roundTrip();
    expect(wb.worksheets.map((w) => w.name)).toEqual(["Overview", "To-dos", "Supplies", "Food & water"]);
  });

  it("lists tasks on To-dos and things to pack on Supplies", async () => {
    const wb = await roundTrip();
    const todos = wb.getWorksheet("To-dos")!;
    const supplies = wb.getWorksheet("Supplies")!;
    expect(findRow(todos, "Make a household plan")).toBeGreaterThan(0);
    expect(findRow(supplies, "Make a household plan")).toBe(0);
    expect(findRow(supplies, "Drinking water")).toBeGreaterThan(0);
  });

  it("keeps date tracking off Supplies", async () => {
    const ws = (await roundTrip()).getWorksheet("Supplies")!;
    const headers: string[] = [];
    ws.getRow(5).eachCell((c) => headers.push(c.text));
    for (const gone of ["Bought on", "Expires", "Refresh every", "Replace by", "Heads-up"]) expect(headers).not.toContain(gone);
  });

  it("has a blank Food & water log whose Heads-up works out what to replace", async () => {
    const wb = await roundTrip();
    const ws = wb.getWorksheet("Food & water")!;
    const headers: string[] = [];
    ws.getRow(4).eachCell((c) => headers.push(c.text));
    expect(headers).toEqual(["Food or water", "How much", "Kit", "Expires", "Heads-up", "Notes"]);
    // Rows are ready to fill in, not pre-filled
    expect(ws.getCell("A5").value).toBeNull();
    expect(ws.getCell("D5").dataValidation?.type).toBe("date");
    expect(ws.getCell("C5").dataValidation?.formulae).toEqual(['"Stay bin,Go bag"']);
    expect((ws.getCell("E5").value as { formula: string }).formula).toBe(
      'IF(D5="","",IF(D5<=TODAY(),"Replace now",IF(D5<=EDATE(TODAY(),6),"Replace soon","Good")))',
    );
    expect((ws.getCell("E64").value as { formula: string }).formula).toContain("D64");

    // The Overview's replace counts read this tab
    const overview = wb.getWorksheet("Overview")!;
    let formula = "";
    overview.eachRow((r) => {
      if (r.getCell(2).text === "Replace now") formula = (r.getCell(3).value as { formula: string }).formula;
    });
    expect(formula).toBe(`COUNTIF('Food & water'!$E:$E,"Replace now")`);
  });

  it("carries list state into Status, and pre-marks owned items", async () => {
    const wb = await roundTrip({ "stay:water": "have" });
    const ws = wb.getWorksheet("Supplies")!;
    expect(ws.getCell(`A${findRow(ws, "Drinking water")}`).value).toBe("Have");
    expect(ws.getCell(`A${findRow(ws, "Battery or hand-crank radio")}`).value).toBe("Need");
  });

  it("leaves skipped items out", async () => {
    const wb = await roundTrip({ "stay:radio": "skip" });
    expect(findRow(wb.getWorksheet("Supplies")!, "Battery or hand-crank radio")).toBe(0);
  });

  it("feeds Who dropdowns from the names on the Overview tab", async () => {
    const wb = await roundTrip();
    const overview = wb.getWorksheet("Overview")!;
    expect(overview.getCell("B17").value).toBe("Me");
    const ws = wb.getWorksheet("Supplies")!;
    const r = findRow(ws, "Drinking water");
    expect(ws.getCell(`${col(ws, "Who's buying")}${r}`).dataValidation?.formulae).toEqual(["Overview!$B$17:$B$24"]);
    expect(ws.getCell(`A${r}`).dataValidation?.formulae).toEqual(['"Need,Have,Skip"']);
  });

  it("sums what's still to buy", async () => {
    const wb = await roundTrip();
    const ws = wb.getWorksheet("Supplies")!;
    const r = findRow(ws, "Still to buy (rough estimate)");
    const cost = col(ws, "Est. cost");
    expect((ws.getCell(`${cost}${r}`).value as { formula: string }).formula).toBe(
      `SUMIF(A6:A${r - 2},"Need",${cost}6:${cost}${r - 2})+SUMIF(A6:A${r - 2},"Partly",${cost}6:${cost}${r - 2})`,
    );
  });

  it("adds a Done column for each person who carries a go bag", async () => {
    const wb = await roundTrip();
    const ws = wb.getWorksheet("Supplies")!;
    // 2 adults + 1 kid = 3 bags, named from the Overview list
    expect(["D5", "E5", "F5"].map((c) => (ws.getCell(c).value as { result: string }).result)).toEqual(["Me", "Adult 2", "Kid 1"]);
    expect((ws.getCell("D5").value as { formula: string }).formula).toBe('IF(Overview!$B$17="","Person 1",Overview!$B$17)');
    expect(wb.getWorksheet("Overview")!.getCell("B19").value).toBe("Kid 1");

    // Per-person rows get boxes and a Status that follows them
    const water = findRow(ws, "Water bottles");
    expect(["D", "E", "F"].map((c) => ws.getCell(`${c}${water}`).value)).toEqual(["Not done", "Not done", "Not done"]);
    expect(ws.getCell(`D${water}`).dataValidation?.formulae).toEqual(['"Not done,Done"']);
    expect((ws.getCell(`A${water}`).value as { formula: string }).formula).toBe(
      `IF(COUNTIF(D${water}:F${water},"Done")=3,"Have",IF(COUNTIF(D${water}:F${water},"Done")>0,"Partly","Need"))`,
    );
    // Household items in the go bag, and stay bin items, don't
    for (const name of ["First aid kit", "Drinking water"]) {
      const r = findRow(ws, name);
      expect(ws.getCell(`D${r}`).value).toBeNull();
      expect(ws.getCell(`A${r}`).value).toBe("Need");
    }
  });

  it("splits the go bag into every-bag items and one-for-the-group items", async () => {
    const ws = (await roundTrip()).getWorksheet("Supplies")!;
    const every = findRowA(ws, "In every bag");
    const group = findRowA(ws, "One for the group");
    expect(every).toBeGreaterThan(0);
    expect(group).toBeGreaterThan(every);
    expect(findRow(ws, "Water bottles")).toBeGreaterThan(every);
    expect(findRow(ws, "Water bottles")).toBeLessThan(group);
    expect(findRow(ws, "First aid kit")).toBeGreaterThan(group);
  });

  it("greys out person cells on rows the household needs just one of", async () => {
    const ws = (await roundTrip()).getWorksheet("Supplies")!;
    for (const name of ["Battery or hand-crank radio", "Duct tape", "First aid kit"]) {
      const cell = ws.getCell(`D${findRow(ws, name)}`);
      expect(cell.value).toBeNull();
      expect((cell.fill as ExcelJS.FillPattern).fgColor?.argb).toBe("FFF6F8F9");
    }
  });

  it("gives per-adult to-dos a checkbox for each adult", async () => {
    const wb = await roundTrip({ "home:alerts@0": "have" });
    const ws = wb.getWorksheet("To-dos")!;
    // 2 adults: Me and Adult 2 (kids don't sign up for alerts)
    expect(["C4", "D4"].map((c) => (ws.getCell(c).value as { result: string }).result)).toEqual(["Me", "Adult 2"]);
    expect(ws.getCell("E4").value).toBe("Who");

    const alerts = findRow(ws, "Sign up for your county's emergency alerts");
    expect([ws.getCell(`C${alerts}`).value, ws.getCell(`D${alerts}`).value]).toEqual(["Done", "Not done"]);
    expect((ws.getCell(`A${alerts}`).value as { formula: string }).formula).toContain('"Partly"');
    expect(ws.getCell(`E${alerts}`).value).toBe("Each adult");

    const plan = findRow(ws, "Make a household plan");
    expect(ws.getCell(`C${plan}`).value).toBeNull();
    expect(ws.getCell(`A${plan}`).value).toBe("To do");
    expect(ws.getCell(`E${plan}`).dataValidation?.formulae).toEqual(["Overview!$B$17:$B$24"]);
  });

  it("has a Days at home setting that stay bin amounts and costs follow", async () => {
    const wb = await roundTrip();
    const overview = wb.getWorksheet("Overview")!;
    expect(overview.getCell("B14").value).toBe("Days at home");
    expect(overview.getCell("C14").value).toBe(7);
    expect(overview.getCell("C14").dataValidation).toMatchObject({ type: "whole", formulae: [1, 90] });

    const ws = wb.getWorksheet("Supplies")!;
    const water = findRow(ws, "Drinking water");
    const amount = ws.getCell(`C${water}`).value as { formula: string; result: string };
    // 2 adults + 1 kid + 1 dog = 3.5 gallons a day
    expect(amount.formula).toBe('ROUNDUP(3.5*Overview!$C$14,0)&" gallons"');
    expect(amount.result).toBe("25 gallons");
    const cost = ws.getCell(`${col(ws, "Est. cost")}${water}`).value as { formula: string; result: number };
    expect(cost.formula).toBe("ROUND(1.5*ROUNDUP(3.5*Overview!$C$14,0),0)");
    expect(cost.result).toBe(38);

    const food = findRow(ws, "Food you can eat without cooking");
    expect((ws.getCell(`C${food}`).value as { formula: string }).formula).toBe('Overview!$C$14&" days for 3"');

    // Go bag amounts don't change with days at home
    expect(ws.getCell(`C${findRow(ws, "Ready-to-eat food")}`).value).toBe("3 days each");
  });

  it("starts with the same amounts and costs the app shows", async () => {
    const input = makeInput();
    const ws = (await roundTrip()).getWorksheet("Supplies")!;
    const costCol = col(ws, "Est. cost");
    for (const e of input.entries.filter((e) => e.container === "stay" && e.item.scalesWithDays)) {
      const r = findRow(ws, e.item.name);
      const amount = ws.getCell(`C${r}`).value as { result: string };
      if (e.qty) expect(amount.result, e.item.id).toBe(e.qty.text);
      const cost = ws.getCell(`${costCol}${r}`).value as { result: number };
      expect(cost.result, e.item.id).toBe(Math.round((e.cost[0] + e.cost[1]) / 2));
    }
  });

  it("marks every person Done for go bag items already marked have", async () => {
    const wb = await roundTrip();
    const ws = wb.getWorksheet("Supplies")!;
    const r = findRow(ws, "Headlamp"); // from the "flashlight" quick pick
    expect(["D", "E", "F"].map((c) => ws.getCell(`${c}${r}`).value)).toEqual(["Done", "Done", "Done"]);
  });

  it("uses the household's names for the people list and columns", async () => {
    const input = makeInput();
    const answers = { ...input.answers, names: { adults: ["Alex", "Sam"], kids: ["Riley"] } };
    const ctx = deriveContext(answers);
    const entries = buildList(ctx, ITEMS).filter((e) => e.level === "basics");
    const buf = await toXlsx(ExcelJS, { ...input, answers, ctx, entries });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
    const overview = wb.getWorksheet("Overview")!;
    expect(["B17", "B18", "B19"].map((c) => overview.getCell(c).value)).toEqual(["Alex", "Sam", "Riley"]);
    const ws = wb.getWorksheet("Supplies")!;
    expect(["D5", "E5", "F5"].map((c) => (ws.getCell(c).value as { result: string }).result)).toEqual(["Alex", "Sam", "Riley"]);
  });

  it("leaves out person columns for a one-person household", async () => {
    const answers = normalizeAnswers({ build: "both", hazards: ["earthquake"] });
    const ctx = deriveContext(answers);
    const entries = buildList(ctx, ITEMS).filter((e) => e.level === "basics");
    const buf = await toXlsx(ExcelJS, { answers, ctx, entries, stateOf: (e) => stateOf(e, {}, answers), slotDone: (e, i) => slotDone(e, i, {}, answers), shareUrl: "https://example.test" });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
    const ws = wb.getWorksheet("Supplies")!;
    expect(ws.getCell("D5").value).toBe("Who's buying");
  });
});
