import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { writeFileSync } from "node:fs";
import { deriveContext, normalizeAnswers } from "./answers";
import { buildList, slotDone, stateOf } from "./buildList";
import { toXlsx } from "./exportXlsx";
import { ITEMS } from "@/data/items";
import type { ItemState } from "./types";
import type { Lang } from "@/i18n/lang";

function makeInput(states: Record<string, ItemState> = {}, lang: Lang = "en") {
  const answers = normalizeAnswers({
    build: "both",
    county: "alameda",
    hazards: ["earthquake", "outage", "smoke"],
    household: { adults: 2, kids: 1, dogs: 1 },
    have: ["flashlight"],
  });
  const ctx = deriveContext(answers, lang);
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

async function roundTrip(states?: Record<string, ItemState>, lang: Lang = "en") {
  const buf = await toXlsx(ExcelJS, makeInput(states, lang));
  if (process.env.XLSX_OUT) writeFileSync(process.env.XLSX_OUT.replace(/\.xlsx$/, lang === "en" ? ".xlsx" : `-${lang}.xlsx`), Buffer.from(buf));

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
    expect(findRow(todos, "Pick an out-of-area contact and two meeting spots")).toBeGreaterThan(0);
    expect(findRow(supplies, "Pick an out-of-area contact and two meeting spots")).toBe(0);
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
    const water = findRow(ws, "Water bottle");
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

  it("leaves the kids' cells empty on adults-only go bag rows", async () => {
    const ws = (await roundTrip()).getWorksheet("Supplies")!;
    expect(ws.getCell(`A${findRowA(ws, "In every bag")}`).text).toMatch(/adults only/);
    const cable = findRow(ws, "Phone charging cable");
    expect(["D", "E", "F"].map((c) => ws.getCell(`${c}${cable}`).value)).toEqual(["Not done", "Not done", null]);
    expect(ws.getCell(`F${cable}`).dataValidation).toBeUndefined();
    expect((ws.getCell(`A${cable}`).value as { formula: string }).formula).toBe(
      `IF(COUNTIF(D${cable}:E${cable},"Done")=2,"Have",IF(COUNTIF(D${cable}:E${cable},"Done")>0,"Partly","Need"))`,
    );
  });

  it("splits the go bag into every-bag items and one-for-the-group items", async () => {
    const ws = (await roundTrip()).getWorksheet("Supplies")!;
    const every = findRowA(ws, "In every bag");
    const group = findRowA(ws, "One for the group");
    expect(every).toBeGreaterThan(0);
    expect(group).toBeGreaterThan(every);
    expect(findRow(ws, "Water bottle")).toBeGreaterThan(every);
    expect(findRow(ws, "Water bottle")).toBeLessThan(group);
    expect(findRow(ws, "Water purification tablets")).toBeGreaterThan(group);
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

    const plan = findRow(ws, "Pick an out-of-area contact and two meeting spots");
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
    // Alameda is EBMUD: 2 adults + 1 kid at 2 gallons, plus 1 dog = 6.5 gallons a day
    expect(amount.formula).toBe('ROUNDUP(6.5*Overview!$C$14,0)&" gallons"');
    expect(amount.result).toBe("46 gallons");
    const cost = ws.getCell(`${col(ws, "Est. cost")}${water}`).value as { formula: string; result: number };
    expect(cost.formula).toBe("ROUND(1.5*ROUNDUP(6.5*Overview!$C$14,0),0)");
    expect(cost.result).toBe(69);

    // Food is a plan in store units: 2 adults + 1 kid eat like 3 people
    const protein = findRow(ws, "Canned protein: beans, tuna, chicken, or chili");
    const cell = ws.getCell(`C${protein}`).value as { formula: string; result: string };
    expect(cell.formula).toBe('ROUNDUP(3*Overview!$C$14,0)&IF(ROUNDUP(3*Overview!$C$14,0)=1," can"," cans")');
    expect(cell.result).toBe("21 cans");
    const butter = ws.getCell(`C${findRow(ws, "Peanut butter or other nut butter")}`).value as { result: string };
    expect(butter.result).toBe("2 jars");

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
    for (let r = stay + 1; r < extras; r++) {
      if (/^(Essentials|Everything else)/.test(ws.getCell(`A${r}`).text)) continue; // group headings
      expect(basicsNames.has(ws.getCell(`B${r}`).text), ws.getCell(`B${r}`).text).toBe(true);
    }
    const firstExtra = ws.getCell(`B${extras + 1}`);
    expect(advancedNames.has(firstExtra.text)).toBe(true);
    expect((firstExtra.fill as ExcelJS.FillPattern).fgColor?.argb).toBe("FFF4F1FB");
  });

  it("lists the stay-at-home bin's essentials first, under their own heading", async () => {
    const wb = await roundTrip();
    const ws = wb.getWorksheet("Supplies")!;
    const heading = findRowA(ws, "Essentials");
    const rest = findRowA(ws, "Everything else");
    expect(heading).toBe(findRowA(ws, "Stay-at-home bin") + 1);
    expect(rest).toBeGreaterThan(heading + 1);
    const names = Array.from({ length: rest - heading - 1 }, (_, i) => ws.getCell(`B${heading + 1 + i}`).text);
    expect(names).toContain("Drinking water");
    expect(names).not.toContain("Wet wipes");
  });

  it("colors the item name by its status on Supplies and To-dos", async () => {
    const wb = await roundTrip();
    for (const [sheet, done, notDone] of [
      ["Supplies", "Have", '$A6="Need",$A6="Partly"'],
      ["To-dos", "Done", '$A5="To do",$A5="Partly"'],
    ] as const) {
      const ws = wb.getWorksheet(sheet)!;
      const cf = (ws as unknown as { conditionalFormattings: { ref: string; rules: { formulae: string[]; style: { fill?: { bgColor?: { argb: string } } } }[] }[] })
        .conditionalFormattings.find((c) => c.ref.startsWith("B"))!;
      expect(cf.rules.find((r) => r.formulae[0].includes(`"${done}"`))!.style.fill!.bgColor!.argb, sheet).toBe("FFE2F0E7");
      expect(cf.rules.find((r) => r.formulae[0] === `OR(${notDone})`)!.style.fill!.bgColor!.argb, sheet).toBe("FFFFF2B8");
      // The Status cell matches the item name
      const status = (ws as unknown as { conditionalFormattings: { ref: string; rules: { formulae: string[]; style: { fill?: { bgColor?: { argb: string } } } }[] }[] })
        .conditionalFormattings.find((c) => c.ref.startsWith("A") && c.rules.some((r) => r.formulae[0] === `OR(${notDone})`))!;
      expect(status.rules.find((r) => r.formulae[0] === `OR(${notDone})`)!.style.fill!.bgColor!.argb, sheet).toBe("FFFFF2B8");
    }
  });

  it("tints the whole Expiration dates row when something is due", async () => {
    const ws = (await roundTrip()).getWorksheet("Expiration dates")!;
    const cfs = (ws as unknown as { conditionalFormattings: { ref: string; rules: { formulae: string[] }[] }[] }).conditionalFormattings;
    const row = cfs.find((c) => c.ref.startsWith("A"))!;
    expect(row.ref).toMatch(/^A5:H\d+$/);
    expect(row.rules.map((r) => r.formulae[0])).toEqual(['$G5="Due now"', '$G5="Due soon"']);
  });

  it("fills Know your home and notes from the app", async () => {
    const input = makeInput();
    const buf = await toXlsx(ExcelJS, {
      ...input,
      home: { facts: { gas: "Side of the house, wrench on a hook", contact: "Aunt Pat 555-0100" }, bags: [], notes: "Radio is in Sam's go bag\nCheck the car kit in June" },
    });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf as unknown as ArrayBuffer);
    const ws = wb.getWorksheet("Overview")!;
    const valueFor = (label: string) => {
      let v: unknown = null;
      ws.eachRow((r) => {
        if (r.getCell(2).text === label) v = r.getCell(3).value;
      });
      return v;
    };
    expect(valueFor("Gas shutoff")).toBe("Side of the house, wrench on a hook");
    expect(valueFor("Out-of-area contact")).toBe("Aunt Pat 555-0100");
    expect(valueFor("Water shutoff")).toBeNull();
    const notesTitle = findRow(ws, "Notes and reminders");
    expect(ws.getCell(`B${notesTitle + 1}`).value).toBe("Radio is in Sam's go bag");
    expect(ws.getCell(`B${notesTitle + 2}`).value).toBe("Check the car kit in June");
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

describe("spreadsheet export in Spanish", () => {
  type CF = { ref: string; rules: { formulae: string[]; style: { fill?: { bgColor?: { argb: string } } } }[] };
  const cfs = (ws: ExcelJS.Worksheet) => (ws as unknown as { conditionalFormattings: CF[] }).conditionalFormattings;
  const formula = (c: ExcelJS.Cell) => (c.value as { formula?: string } | null)?.formula ?? "";

  // Every value a formula or a color rule may look for, in Spanish.
  const SPANISH = new Set(["Falta", "Lo tengo", "Omitir", "En parte", "Pendiente", "Hecho", "Vence ya", "Vence pronto", "Al día"]);
  const ENGLISH = ["Need", "Have", "Skip", "Partly", "To do", "Done", "Not done", "Due now", "Due soon", "Good"];

  it("names the tabs in Spanish", async () => {
    const wb = await roundTrip(undefined, "es");
    expect(wb.worksheets.map((w) => w.name)).toEqual([
      "Resumen", "Tareas", "Suministros", "Fechas de vencimiento", "Vecinos", "Cuando ocurra",
    ]);
  });

  it("uses the same Spanish words in dropdowns, formulas, and colors, and points only at tabs that exist", async () => {
    const wb = await roundTrip(undefined, "es");
    const tabs = new Set(wb.worksheets.map((w) => w.name));
    const formulas: string[] = [];
    const lists: string[] = [];
    for (const ws of wb.worksheets) {
      ws.eachRow((r) =>
        r.eachCell((c) => {
          if (formula(c)) formulas.push(formula(c));
          const dv = c.dataValidation;
          if (dv?.type === "list") lists.push(...(dv.formulae as string[]));
        }),
      );
      for (const cf of cfs(ws)) for (const rule of cf.rules) formulas.push(...rule.formulae);
    }
    expect(formulas.length).toBeGreaterThan(100);

    // The words formulas compare against (not the spaced bits they join, like " de ").
    const compared = new Set(
      formulas
        .flatMap((f) => [...f.matchAll(/"([^"]*)"/g)].map((m) => m[1]))
        .filter((s) => s && !s.startsWith(" ") && !/^Persona \d$/.test(s)),
    );
    expect(compared.size).toBeGreaterThan(5);
    for (const s of compared) expect(SPANISH.has(s), s).toBe(true);
    for (const en of ENGLISH) expect(formulas.join("\n"), en).not.toContain(`"${en}"`);

    // Status dropdowns offer the words the formulas count, and no English.
    const offered = new Set(lists.filter((l) => l.startsWith('"')).flatMap((l) => l.slice(1, -1).split(",")));
    for (const s of ["Falta", "Lo tengo", "Omitir", "Pendiente", "Hecho"]) expect(offered.has(s), s).toBe(true);
    for (const en of ENGLISH) expect(offered.has(en), en).toBe(false);

    // Every tab a formula or dropdown points at exists.
    for (const f of [...formulas, ...lists]) {
      for (const m of f.matchAll(/(?:'((?:[^']|'')+)'|([A-Za-zÀ-ÿ0-9_]+))!/g)) {
        const name = (m[1] ?? m[2]).replace(/''/g, "'");
        expect(tabs.has(name), `${name} in ${f}`).toBe(true);
      }
    }
  });

  it("counts Spanish statuses on the Resumen tab", async () => {
    const wb = await roundTrip(undefined, "es");
    const ws = wb.getWorksheet("Resumen")!;
    const stat = (label: string) => formula(ws.getCell(`C${findRow(ws, label)}`));
    expect(stat("Tareas hechas")).toBe(
      'COUNTIF(Tareas!$A:$A,"Hecho")&" de "&(COUNTIF(Tareas!$A:$A,"Hecho")+COUNTIF(Tareas!$A:$A,"Pendiente")+COUNTIF(Tareas!$A:$A,"En parte"))',
    );
    expect(stat("Suministros listos")).toBe(
      'COUNTIF(Suministros!$A:$A,"Lo tengo")&" de "&(COUNTIF(Suministros!$A:$A,"Lo tengo")+COUNTIF(Suministros!$A:$A,"Falta")+COUNTIF(Suministros!$A:$A,"En parte"))',
    );
    expect(stat("Falta comprar")).toMatch(/^SUMIF\(Suministros!\$A:\$A,"Falta",Suministros!\$(\w+):\$\1\)\+SUMIF\(Suministros!\$A:\$A,"En parte",/);
    expect(stat("Vence ya")).toBe(`COUNTIF('Fechas de vencimiento'!$G:$G,"Vence ya")`);
    expect(stat("Vence en los próximos 6 meses")).toBe(`COUNTIF('Fechas de vencimiento'!$G:$G,"Vence pronto")`);
    expect(ws.getCell("B14").value).toBe("Días en casa");
    expect(ws.getCell(`C${findRow(ws, "Próxima revisión")}`).numFmt).toBe("d mmm yyyy");
  });

  it("gives Supplies Spanish statuses, per-person columns, and colors", async () => {
    const ws = (await roundTrip({ "stay:water": "have" }, "es")).getWorksheet("Suministros")!;
    const headers: string[] = [];
    ws.getRow(5).eachCell({ includeEmpty: true }, (c) => headers.push(c.text));
    expect(headers).toEqual(["Estado", "Artículo", "Cantidad", "", "", "", "Quién compra", "Costo aprox.", "Ejemplo", "Notas"]);
    expect(ws.getCell("A4").text).toBe("Qué conseguir");

    const every = findRowA(ws, "En cada mochila");
    expect(every).toBeGreaterThan(findRowA(ws, "Mochila de emergencia"));
    expect(findRowA(ws, "Uno para todo el grupo")).toBeGreaterThan(every);
    expect(formula(ws.getCell(`D${every}`))).toBe('IF(Resumen!$B$17="","Persona 1",Resumen!$B$17)');

    // The first item in every bag: a Hecho / Pendiente cell per person, and a status that counts them.
    const r = every + 1;
    expect(ws.getCell(`D${r}`).dataValidation?.formulae).toEqual(['"Pendiente,Hecho"']);
    expect(["Pendiente", "Hecho"]).toContain(ws.getCell(`D${r}`).value);
    expect(formula(ws.getCell(`A${r}`))).toBe(
      `IF(COUNTIF(D${r}:F${r},"Hecho")=3,"Lo tengo",IF(COUNTIF(D${r}:F${r},"Hecho")>0,"En parte","Falta"))`,
    );

    // Household items: a plain dropdown, and the Who list from the Resumen tab.
    const essentials = findRowA(ws, "Lo esencial");
    expect(essentials).toBe(findRowA(ws, "Caja para quedarse en casa") + 1);
    expect(findRowA(ws, "Todo lo demás")).toBeGreaterThan(essentials);
    const water = essentials + 1;
    expect(ws.getCell(`A${water}`).dataValidation?.formulae).toEqual(['"Falta,Lo tengo,Omitir"']);
    expect(ws.getCell(`G${water}`).dataValidation?.formulae).toEqual(["Resumen!$B$17:$B$24"]);
    expect(["Falta", "Lo tengo"]).toContain(ws.getCell(`A${water}`).value);

    const total = findRow(ws, "Falta comprar (cálculo aproximado)");
    expect(formula(ws.getCell(`H${total}`))).toContain('"Falta"');

    const names = cfs(ws).find((c) => c.ref.startsWith("B"))!;
    expect(names.rules.map((x) => x.formulae[0])).toEqual(['$A6="Lo tengo"', 'OR($A6="Falta",$A6="En parte")', '$A6="Omitir"']);
    const person = cfs(ws).find((c) => c.ref.startsWith("D"))!;
    expect(person.rules.map((x) => x.formulae[0])).toEqual(['D6="Hecho"', 'D6="Pendiente"']);
    expect(cfs(ws).some((c) => c.rules.some((x) => x.formulae[0] === '$A6="En parte"'))).toBe(true);
  });

  it("gives To-dos Spanish statuses", async () => {
    const ws = (await roundTrip({ "home:alerts@0": "have" }, "es")).getWorksheet("Tareas")!;
    expect(ws.getCell("E4").value).toBe("Quién");
    expect(findRowA(ws, "Cada adulto")).toBe(5);
    expect(findRowA(ws, "Este fin de semana")).toBeGreaterThan(5);
    const alerts = 6;
    expect([ws.getCell(`C${alerts}`).value, ws.getCell(`D${alerts}`).value]).toEqual(["Hecho", "Pendiente"]);
    expect(formula(ws.getCell(`A${alerts}`))).toContain('"En parte"');
    expect(ws.getCell(`E${alerts}`).value).toBe("Cada adulto");
    const weekend = findRowA(ws, "Este fin de semana");
    expect(ws.getCell(`A${weekend + 1}`).dataValidation?.formulae).toEqual(['"Pendiente,Hecho,Omitir"']);
    // Wide enough for "Pendiente" and the dropdown arrow.
    expect(ws.getColumn("A").width).toBeGreaterThanOrEqual(13);
  });

  it("works out Vence el and Aviso in Spanish on Fechas de vencimiento", async () => {
    const ws = (await roundTrip(undefined, "es")).getWorksheet("Fechas de vencimiento")!;
    const headers: string[] = [];
    ws.getRow(4).eachCell((c) => headers.push(c.text));
    expect(headers).toEqual(["Artículo", "Dónde", "Cambiar cada", "Empacado el", "Fecha del paquete", "Vence el", "Aviso", "Notas"]);
    const r = 6; // the first row under the first section
    expect(formula(ws.getCell(`G${r}`))).toBe(
      `IF(F${r}="","",IF(F${r}<=TODAY(),"Vence ya",IF(F${r}<=EDATE(TODAY(),6),"Vence pronto","Al día")))`,
    );
    expect(ws.getCell(`C${r}`).numFmt).toBe('0" meses"');
    expect(ws.getCell(`D${r}`).numFmt).toBe("d mmm yyyy");
    expect(ws.getCell(`B${r}`).value).toBe("Caja para quedarse en casa");
    expect(ws.getCell(`B${r}`).dataValidation?.formulae).toEqual([
      '"Caja para quedarse en casa,Mochila de emergencia,Kit para el carro,En la casa"',
    ]);
    const row = cfs(ws).find((c) => c.ref.startsWith("A"))!;
    expect(row.rules.map((x) => x.formulae[0])).toEqual(['$G5="Vence ya"', '$G5="Vence pronto"']);
    const heads = cfs(ws).find((c) => c.ref.startsWith("G"))!;
    expect(heads.rules.map((x) => x.formulae[0])).toEqual(['$G5="Vence ya"', '$G5="Vence pronto"', '$G5="Al día"']);
    expect(ws.getCell("G4").note).toContain("Vence ya: ya pasó la fecha.");
  });

  it("translates Vecinos, the card, the Resumen, and the credit", async () => {
    const wb = await roundTrip(undefined, "es");
    const neighbors = wb.getWorksheet("Vecinos")!;
    expect(neighbors.getCell("A4").value).toBe("Nombre");
    expect(neighbors.getCell("F5").dataValidation?.formulae).toEqual(['"Sí,No"']);
    expect(wb.getWorksheet("Cuando ocurra")!.getCell("A1").value).toBe("Cuando ocurra");
    for (const ws of wb.worksheets) {
      let credit = "";
      ws.eachRow((r) =>
        r.eachCell((c) => {
          const v = c.value as { text?: string } | null;
          if (v && typeof v === "object" && v.text?.startsWith("Hecho con Bay Ready")) credit = v.text;
        }),
      );
      expect(credit, ws.name).not.toBe("");
      expect(ws.headerFooter.oddFooter, ws.name).toContain("Página &P de &N");
    }
    const overview = wb.getWorksheet("Resumen")!;
    expect(overview.getCell("B2").value).toBe("Nuestro kit de emergencia");
    expect(findRow(overview, "Cómo usar esta hoja")).toBeGreaterThan(0);
  });
});
