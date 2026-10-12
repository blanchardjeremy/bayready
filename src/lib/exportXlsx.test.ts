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
  it("has Overview, To-dos, Supplies, Expiration dates, Neighbors, and When it happens tabs", async () => {
    const wb = await roundTrip();
    expect(wb.worksheets.map((w) => w.name)).toEqual([
      "Overview", "To-dos", "Supplies", "Expiration dates", "Neighbors", "When it happens",
    ]);
  });

  it("leaves room on the Overview to note where the shutoffs are, plus free notes", async () => {
    const ws = (await roundTrip()).getWorksheet("Overview")!;
    for (const label of ["Know your home", "Gas shutoff", "Water shutoff", "Breaker box", "Grabs the pets", "Notes and reminders"]) {
      expect(findRow(ws, label), label).toBeGreaterThan(0);
    }
    expect(findRow(ws, "Picks up the kids")).toBeGreaterThan(0);
    expect(findRow(ws, "Evacuation zone")).toBe(0); // no wildfire, flood, or tsunami picked
  });

  it("leaves the Neighbors tab blank, and fits the first-hour card to the household's hazards", async () => {
    const wb = await roundTrip();
    const neighbors = wb.getWorksheet("Neighbors")!;
    expect(neighbors.getCell("A5").text).toBe("");
    const card = wb.getWorksheet("When it happens")!;
    expect(findRowA(card, "Right after a big quake")).toBeGreaterThan(0);
    expect(findRowA(card, "Other emergencies")).toBeGreaterThan(0); // power outage line
    let text = "";
    card.eachRow((r) => (text += r.getCell(2).text + "\n"));
    expect(text).toContain("Drop, cover, and hold on");
    expect(text).not.toContain("tsunami");
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

  it("pre-fills an Expiration dates tab: shared supplies, then each person's go bag", async () => {
    const wb = await roundTrip();
    const ws = wb.getWorksheet("Expiration dates")!;
    const headers: string[] = [];
    ws.getRow(4).eachCell((c) => headers.push(c.text));
    expect(headers).toEqual(["Item", "Kit", "Replace every", "Packed on", "Date on package", "Due by", "Heads-up", "Notes"]);

    // One shared section, then one per person who carries a go bag
    const sections: [string, number][] = [];
    ws.eachRow((r, n) => {
      const v = r.getCell(1).value as { richText?: { text: string }[] } | null;
      if (v && typeof v === "object" && "richText" in v && v.richText) sections.push([v.richText[0].text, n]);
    });
    expect(sections.map(([name]) => name)).toEqual(["Everyone", "Me", "Adult 2", "Kid 1"]);
    const sectionOf = (row: number) => [...sections].reverse().find(([, n]) => n < row)![0];

    // Shared food comes first
    const beans = findRowA(ws, "[Example] Canned beans");
    expect(beans).toBe(6);
    expect(ws.getCell(`C${beans}`).value).toBe(24);

    // Water gets a 6-month default, and Due by and Heads-up work from it
    const water = findRowA(ws, "Water you bottled from the tap");
    expect(ws.getCell(`C${water}`).value).toBe(6);
    expect((ws.getCell(`F${water}`).value as { formula: string }).formula).toBe(
      `IF(E${water}<>"",E${water},IF(AND(D${water}<>"",C${water}<>""),EDATE(D${water},C${water}),""))`,
    );
    expect((ws.getCell(`G${water}`).value as { formula: string }).formula).toBe(
      `IF(F${water}="","",IF(F${water}<=TODAY(),"Due now",IF(F${water}<=EDATE(TODAY(),6),"Due soon","Good")))`,
    );

    expect(sectionOf(water)).toBe("Everyone");

    // Each person's own go bag rows, in their section
    const goWater: string[] = [];
    ws.eachRow((r, n) => {
      if (r.getCell(1).text === "Go bag water") goWater.push(sectionOf(n));
    });
    expect(goWater).toEqual(["Me", "Adult 2", "Kid 1"]);
    const kidClothes = findRowA(ws, "Clothes and shoes");
    expect(sectionOf(kidClothes)).toBe("Kid 1");
    expect(sectionOf(findRowA(ws, "Change of clothes"))).toBe("Me");

    // Tailored: this household has a dog and a go bag, but no car kit or baby
    expect(sectionOf(findRowA(ws, "Pet food"))).toBe("Everyone");
    expect(findRowA(ws, "Water in the car")).toBe(0);
    expect(findRowA(ws, "Formula and baby food")).toBe(0);
    expect(findRowA(ws, "Prescription medicine")).toBe(0); // nobody said they take daily medicine

    // The Overview's counts read this tab
    const overview = wb.getWorksheet("Overview")!;
    let formula = "";
    overview.eachRow((r) => {
      if (r.getCell(2).text === "Due now") formula = (r.getCell(3).value as { formula: string }).formula;
    });
    expect(formula).toBe(`COUNTIF('Expiration dates'!$G:$G,"Due now")`);
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
    // 2 adults + 1 kid = 3 bags. The sticky header leaves them unnamed; the names
    // sit on the go bag's "In every bag" row, from the Overview list.
    expect(["D5", "E5", "F5"].map((c) => ws.getCell(c).value)).toEqual(["", "", ""]);
    const every = findRowA(ws, "In every bag");
    expect(["D", "E", "F"].map((c) => (ws.getCell(`${c}${every}`).value as { result: string }).result)).toEqual(["Me", "Adult 2", "Kid 1"]);
    expect((ws.getCell(`D${every}`).value as { formula: string }).formula).toBe('IF(Overview!$B$17="","Person 1",Overview!$B$17)');
    expect(ws.getCell(`D${findRowA(ws, "One for the group")}`).value).toBeNull();
    expect(wb.getWorksheet("Overview")!.getCell("B19").value).toBe("Kid 1");

    // Per-person rows get boxes and a Status that follows them
    const water = findRow(ws, "Water, plus tablets or a filter to treat more");
    expect(["D", "E", "F"].map((c) => ws.getCell(`${c}${water}`).value)).toEqual(["Not done", "Not done", "Not done"]);
    expect(ws.getCell(`D${water}`).dataValidation?.formulae).toEqual(['"Not done,Done"']);
    expect((ws.getCell(`A${water}`).value as { formula: string }).formula).toBe(
      `IF(COUNTIF(D${water}:F${water},"Done")=3,"Have",IF(COUNTIF(D${water}:F${water},"Done")>0,"Partly","Need"))`,
    );
    // Household items in the go bag, and stay-at-home bin items, don't
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
    expect(findRow(ws, "Water, plus tablets or a filter to treat more")).toBeGreaterThan(every);
    expect(findRow(ws, "Water, plus tablets or a filter to treat more")).toBeLessThan(group);
    expect(findRow(ws, "First aid kit")).toBeGreaterThan(group);
  });

  it("has a Notes column instead of Where", async () => {
    const ws = (await roundTrip()).getWorksheet("Supplies")!;
    const headers: string[] = [];
    ws.getRow(5).eachCell((c) => headers.push(c.text));
    expect(headers).not.toContain("Where");
    expect(headers[headers.length - 1]).toBe("Notes");
    // Empty and ready to type in
    const notes = col(ws, "Notes");
    expect(ws.getCell(`${notes}${findRow(ws, "Battery or hand-crank radio")}`).value).toBeNull();
  });

  it("leaves person cells empty on rows the household needs just one of", async () => {
    const ws = (await roundTrip()).getWorksheet("Supplies")!;
    for (const name of ["Battery or hand-crank radio", "Duct tape", "First aid kit"]) {
      const cell = ws.getCell(`D${findRow(ws, name)}`);
      expect(cell.value).toBeNull();
      expect((cell.fill as ExcelJS.FillPattern | undefined)?.fgColor).toBeUndefined();
      expect(cell.dataValidation).toBeUndefined();
    }
    expect(ws.getCell("D4").value).toBeNull(); // no "Each person" group label
    expect(ws.getColumn("D").width).toBe(15);
  });

  it("gives per-adult to-dos a checkbox for each adult", async () => {
    const wb = await roundTrip({ "home:alerts@0": "have" });
    const ws = wb.getWorksheet("To-dos")!;
    // 2 adults: Me and Adult 2 (kids don't sign up for alerts)
    expect(["C4", "D4"].map((c) => (ws.getCell(c).value as { result: string }).result)).toEqual(["Me", "Adult 2"]);
    expect(ws.getCell("E4").value).toBe("Who");

    // Per-adult tasks get their own section at the top
    expect(findRowA(ws, "Each adult")).toBe(5);
    const alerts = findRow(ws, "Sign up for your county's emergency alerts");
    expect(alerts).toBeGreaterThan(5);
    expect(alerts).toBeLessThan(findRowA(ws, "This weekend"));
    expect([ws.getCell(`C${alerts}`).value, ws.getCell(`D${alerts}`).value]).toEqual(["Done", "Not done"]);
    expect((ws.getCell(`A${alerts}`).value as { formula: string }).formula).toContain('"Partly"');
    expect(ws.getCell(`E${alerts}`).value).toBe("Each adult");

    const plan = findRow(ws, "Make a household plan");
    expect(ws.getCell(`C${plan}`).value).toBeNull();
    expect(ws.getCell(`A${plan}`).value).toBe("To do");
    expect(ws.getCell(`E${plan}`).dataValidation?.formulae).toEqual(["Overview!$B$17:$B$24"]);
  });

  it("has a Days at home setting that stay-at-home bin amounts and costs follow", async () => {
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
    const every = findRowA(ws, "In every bag");
    expect(["D", "E", "F"].map((c) => (ws.getCell(`${c}${every}`).value as { result: string }).result)).toEqual(["Alex", "Sam", "Riley"]);
  });

  it("credits and links back to Bay Ready on every tab", async () => {
    const wb = await roundTrip();
    for (const ws of wb.worksheets) {
      let link: { text: string; hyperlink: string } | null = null;
      ws.eachRow((r) =>
        r.eachCell((c) => {
          const v = c.value as { text?: string; hyperlink?: string } | null;
          if (v && typeof v === "object" && v.text?.startsWith("Made with Bay Ready")) link = v as { text: string; hyperlink: string };
        }),
      );
      expect(link, ws.name).not.toBeNull();
      expect(link!.hyperlink, ws.name).toBe("https://blanchardjeremy.github.io/bayready/");
      expect(ws.headerFooter.oddFooter, ws.name).toContain("blanchardjeremy.github.io/bayready");
    }
  });

  it("puts Advanced items last in each section, shaded, in an Advanced export", async () => {
    const input = makeInput();
    const answers = { ...input.answers, level: "advanced" as const };
    const ctx = deriveContext(answers);
    const entries = buildList(ctx, ITEMS); // everything, like an Advanced list
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load((await toXlsx(ExcelJS, { ...input, answers, ctx, entries })) as unknown as ArrayBuffer);
    const ws = wb.getWorksheet("Supplies")!;

    const stay = findRowA(ws, "Stay-at-home bin");
    const extras = findRowA(ws, "Advanced extras");
    expect(extras).toBeGreaterThan(stay);
    // Every row between the section heading and Advanced extras is Basics, and after it, Advanced
    const basicsNames = new Set(entries.filter((e) => e.container === "stay" && e.level === "basics").map((e) => e.item.name));
    const advancedNames = new Set(entries.filter((e) => e.container === "stay" && e.level === "advanced").map((e) => e.item.name));
    for (let r = stay + 1; r < extras; r++) expect(basicsNames.has(ws.getCell(`B${r}`).text), ws.getCell(`B${r}`).text).toBe(true);
    const firstExtra = ws.getCell(`B${extras + 1}`);
    expect(advancedNames.has(firstExtra.text)).toBe(true);
    expect((firstExtra.fill as ExcelJS.FillPattern).fgColor?.argb).toBe("FFF4F1FB");
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
