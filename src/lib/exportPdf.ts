import type { jsPDF as JsPDF } from "jspdf";
import type { Container, ListEntry } from "./types";
import type { ExportInput } from "./exportXlsx";
import { CONTAINER_ORDER } from "./buildList";
import { peopleNames } from "./answers";
import { listSummary } from "./summary";
import { BAY_READY_URL } from "./urls";
import { CATEGORY_META, CATEGORY_ORDER, CONTAINER_META } from "@/data/meta";
import { COUNTY_BY_ID } from "@/data/counties";
import { firstHourCard } from "@/data/firstHour";
import { expiringSections } from "@/data/expiring";
import { factFields, homeFacts } from "@/data/homeFacts";

/*
 * The list as a PDF: every kit with checkboxes, the When it happens card, and
 * (on the person's own list) a filled-in Know your home sheet. Drawn with
 * jsPDF's built-in Helvetica, so it's small and needs no font files.
 */

type RGB = [number, number, number];
const INK: RGB = [19, 41, 61];
const SOFT: RGB = [62, 92, 110];
const LINE: RGB = [200, 211, 216];
const GREEN: RGB = [63, 110, 85];
const ORANGE: RGB = [184, 58, 30];

const PAGE_W = 612; // US Letter, in points
const PAGE_H = 792;
const M = 48;
const CONTENT_W = PAGE_W - M * 2;

/**
 * The built-in Helvetica covers Western European letters plus curly quotes,
 * dashes, and a few symbols (the Windows-1252 set). Drop anything else, like emoji.
 */
function clean(s: string) {
  return s
    .replace(/\u2192/g, "->")
    .replace(/ ?[^\n\u0020-\u007e\u00a0-\u00ff\u2013\u2014\u2018-\u201e\u2022\u2026\u20ac\u2122]/g, "");
}

class Pages {
  y = M;
  landscape = false;
  constructor(readonly doc: JsPDF) {}

  /** Lowest point content can reach on this page, above the footer. */
  get bottom() {
    return (this.landscape ? PAGE_W : PAGE_H) - M - 16;
  }
  /** Start a new page unless there's this much room left. */
  room(h: number) {
    if (this.y + h > this.bottom) this.newPage();
  }
  newPage(landscape = this.landscape) {
    this.landscape = landscape;
    this.doc.addPage("letter", landscape ? "landscape" : "portrait");
    this.y = M;
  }
  font(size: number, bold = false, color: RGB = INK) {
    this.doc.setFont("helvetica", bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
  }
  /** Wrapped lines for this text at the current font. */
  lines(text: string, width: number): string[] {
    return this.doc.splitTextToSize(clean(text), width) as string[];
  }
  /** Writes a wrapped paragraph and moves down. */
  para(text: string, size: number, opts: { bold?: boolean; color?: RGB; x?: number; width?: number; after?: number } = {}) {
    this.font(size, opts.bold, opts.color);
    const x = opts.x ?? M;
    const lh = size * 1.3;
    for (const line of this.lines(text, opts.width ?? CONTENT_W - (x - M))) {
      this.room(lh);
      this.doc.text(line, x, this.y + size * 0.8);
      this.y += lh;
    }
    this.y += opts.after ?? 0;
  }
  rule(color: RGB = LINE, width = 0.5) {
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(width);
    this.doc.line(M, this.y, M + CONTENT_W, this.y);
  }
}

function checkbox(doc: JsPDF, x: number, y: number, size: number, checked: boolean) {
  doc.setLineWidth(0.9);
  if (checked) {
    doc.setFillColor(...GREEN);
    doc.setDrawColor(...GREEN);
    doc.roundedRect(x, y, size, size, 1.5, 1.5, "FD");
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(1.3);
    doc.lines([[size * 0.22, size * 0.22], [size * 0.38, -size * 0.45]], x + size * 0.2, y + size * 0.52);
  } else {
    doc.setDrawColor(...SOFT);
    doc.roundedRect(x, y, size, size, 1.5, 1.5, "S");
  }
}

function itemRow(p: Pages, e: ListEntry, input: ExportInput) {
  const { doc } = p;
  const have = input.stateOf(e) === "have";
  const qty = e.qty?.text ?? "";
  p.font(10.5, !have, have ? SOFT : INK);
  const qtyW = qty ? doc.getTextWidth(clean(qty)) + 12 : 0;
  const nameX = M + 18;
  const nameLines = p.lines(e.item.name, CONTENT_W - 18 - qtyW);
  const people = e.slots;
  const h = nameLines.length * 13.5 + (people.length ? 16 : 0) + 8;
  p.room(h);

  const top = p.y + 4;
  checkbox(doc, M, top + 0.5, 10, have);
  p.font(10.5, !have, have ? SOFT : INK);
  nameLines.forEach((line, i) => doc.text(line, nameX, top + 8.5 + i * 13.5));
  if (qty) {
    p.font(9.5, false, SOFT);
    doc.text(clean(qty), M + CONTENT_W, top + 8.5, { align: "right" });
  }

  if (people.length) {
    // A small box per person, for go bags and per-adult to-dos.
    let x = nameX;
    const y = top + nameLines.length * 13.5 + 3;
    p.font(8.5, false, SOFT);
    people.forEach((name, i) => {
      const label = clean(name);
      const w = 11 + doc.getTextWidth(label) + 12;
      if (x + w > M + CONTENT_W) return;
      checkbox(doc, x, y, 7.5, input.slotDone(e, i));
      p.font(8.5, false, SOFT);
      doc.text(label, x + 11, y + 6.5);
      x += w;
    });
  }

  p.y += h;
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.4);
  doc.line(nameX, p.y - 2, M + CONTENT_W, p.y - 2);
}

function categoryGroups(entries: ListEntry[]) {
  return CATEGORY_ORDER.map((cat) => [cat, entries.filter((e) => e.item.category === cat)] as const).filter(
    ([, list]) => list.length > 0,
  );
}

function itemGroup(p: Pages, entries: ListEntry[], input: ExportInput) {
  for (const [cat, list] of categoryGroups(entries)) {
    p.room(40); // keep a category label with its first item
    p.y += 6;
    p.font(8, true, SOFT);
    p.doc.text(CATEGORY_META[cat].toUpperCase(), M, p.y + 7, { charSpace: 0.6 });
    p.y += 12;
    list.forEach((e) => itemRow(p, e, input));
  }
}

function kitSection(p: Pages, container: Container, entries: ListEntry[], input: ExportInput) {
  const { ctx } = input;
  const meta = CONTAINER_META[container];
  p.room(90);
  p.y += 10;
  p.para(meta.name, 16, { bold: true, after: 2 });
  p.rule(INK, 1.2);
  p.y += 6;
  p.para([meta.purpose, meta.where].filter(Boolean).join(" "), 9.5, { color: SOFT, after: 4 });

  if (container === "go" && ctx.carriers > 1) {
    const names = peopleNames(ctx).slice(0, ctx.carriers);
    const each = entries.filter((e) => e.slots.length > 0);
    const group = entries.filter((e) => e.slots.length === 0);
    p.room(60);
    p.y += 6;
    p.para("In every bag", 12, { bold: true });
    p.para(`One each for ${names.join(", ")}. Tick a name when that bag has it.`, 9.5, { color: SOFT });
    itemGroup(p, each, input);
    p.room(60);
    p.y += 10;
    p.para("One for the group", 12, { bold: true });
    p.para("You need just one of these. Decide whose bag each goes in.", 9.5, { color: SOFT });
    itemGroup(p, group, input);
  } else itemGroup(p, entries, input);
  p.y += 10;
}

function whenItHappens(p: Pages, input: ExportInput) {
  const sections = firstHourCard(input.ctx);
  if (sections.length === 0) return;
  p.newPage();
  p.para("When it happens", 20, { bold: true, after: 2 });
  p.para("Tape this inside the lid of your bin.", 10, { color: SOFT, after: 8 });
  for (const s of sections) {
    p.room(50);
    p.para(s.title, 12.5, { bold: true, after: 4 });
    s.lines.forEach((line, i) => {
      p.font(10.5, true, ORANGE);
      p.room(14);
      p.doc.text(`${i + 1}.`, M, p.y + 8.5);
      p.para(line, 10.5, { x: M + 18, after: 4 });
    });
    p.y += 10;
  }
}

/**
 * A box per answer, like the printed sheet, so blanks can be filled in by hand.
 * It comes first, right under the title: it's what you'll want on the day.
 */
function knowYourHome(p: Pages, input: ExportInput) {
  const home = input.home;
  if (!home) return;
  const { doc } = p;
  p.para("Know your home", 16, { bold: true, after: 2 });
  p.rule(INK, 1.2);
  p.y += 6;
  p.para("Fill in anything that's blank. Keep a copy in your stay-at-home bin and in each go bag.", 9.5, {
    color: SOFT,
    after: 8,
  });

  const gap = 8;
  const boxW = (CONTENT_W - gap) / 2;
  const fields = factFields(homeFacts(input.ctx), input.ctx, home);
  for (let i = 0; i < fields.length; i += 2) {
    const pair = fields.slice(i, i + 2);
    p.font(10);
    const valueLines = pair.map((f) => p.lines(f.value.trim(), boxW - 16));
    const boxH = Math.max(44, 26 + Math.max(...valueLines.map((l) => l.length)) * 13);
    p.room(boxH + gap);
    pair.forEach((f, k) => {
      const x = M + k * (boxW + gap);
      doc.setDrawColor(...INK);
      doc.setLineWidth(0.8);
      doc.roundedRect(x, p.y, boxW, boxH, 3, 3, "S");
      p.font(7.5, true, SOFT);
      doc.text(clean(f.label).toUpperCase(), x + 8, p.y + 13, { charSpace: 0.5 });
      p.font(10);
      valueLines[k].forEach((line, j) => doc.text(line, x + 8, p.y + 28 + j * 13));
    });
    p.y += boxH + gap;
  }

  // Notes: a big box to write in, or flowing text if they've written more than fits on a page.
  p.font(10);
  const noteLines = p.lines(home.notes.trim(), CONTENT_W - 16);
  const boxH = Math.max(110, 30 + noteLines.length * 13);
  if (boxH <= p.bottom - M) {
    p.room(boxH);
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.8);
    doc.roundedRect(M, p.y, CONTENT_W, boxH, 3, 3, "S");
    p.font(7.5, true, SOFT);
    doc.text("NOTES AND REMINDERS", M + 8, p.y + 13, { charSpace: 0.5 });
    p.font(10);
    noteLines.forEach((line, j) => doc.text(line, M + 8, p.y + 28 + j * 13));
    p.y += boxH;
  } else {
    p.para("Notes and reminders", 12, { bold: true, after: 4 });
    p.para(home.notes.trim(), 10);
  }
}

export function buildPdf(JsPDFClass: typeof JsPDF, input: ExportInput): JsPDF {
  const { answers, ctx, entries, shareUrl } = input;
  const doc = new JsPDFClass({ unit: "pt", format: "letter" });
  doc.setProperties({ title: "My emergency list", creator: "Bay Ready" });
  const p = new Pages(doc);
  const today = input.today ?? new Date();

  p.font(8, true, ORANGE);
  doc.text("BAY READY", M, p.y + 7, { charSpace: 1 });
  p.y += 14;
  p.para("My emergency list", 24, { bold: true, after: 4 });
  p.para(listSummary(answers, ctx), 10.5, { color: SOFT, after: 2 });
  const county = answers.county ? COUNTY_BY_ID[answers.county] : undefined;
  if (county) p.para(`Emergency alerts: sign up for ${county.alert.name} at ${county.alert.url}`, 10, { color: SOFT });
  p.font(10, false, SOFT);
  const made = `Made ${today.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. `;
  doc.text(made, M, p.y + 8);
  doc.setTextColor(...INK);
  const linkX = M + doc.getTextWidth(made);
  const linkW = doc.textWithLink("Open this list online", linkX, p.y + 8, { url: shareUrl });
  doc.setDrawColor(...INK);
  doc.setLineWidth(0.5);
  doc.line(linkX, p.y + 10, linkX + linkW, p.y + 10);
  p.y += 22;

  if (input.home) {
    knowYourHome(p, input);
    p.newPage();
  }

  const shown = entries.filter((e) => input.stateOf(e) !== "skip");
  for (const c of CONTAINER_ORDER) {
    const list = shown.filter((e) => e.container === c);
    if (ctx.kits.includes(c) && list.length > 0) kitSection(p, c, list, input);
  }
  whenItHappens(p, input);

  refreshLog(p, ctx);
  footers(p);
  return doc;
}

/** Just the refresh log, for its own print button. */
export function buildRefreshPdf(JsPDFClass: typeof JsPDF, input: ExportInput): JsPDF {
  const doc = new JsPDFClass({ unit: "pt", format: "letter", orientation: "landscape" });
  doc.setProperties({ title: "Keep it fresh", creator: "Bay Ready" });
  const p = new Pages(doc);
  p.landscape = true;
  refreshLog(p, input.ctx, false);
  footers(p);
  return doc;
}

function footers(p: Pages) {
  const { doc } = p;
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    p.font(8, false, SOFT);
    doc.textWithLink("Made with Bay Ready, a free emergency kit planner for the Bay Area", M, h - M + 10, {
      url: BAY_READY_URL,
    });
    doc.text(`Page ${i} of ${pages}`, w - M, h - M + 10, { align: "right" });
  }
}

/** How many checks fit across a row of the refresh log. */
const CHECKS = 5;

/**
 * The spreadsheet's Expiration dates tab, for paper. Instead of one date to
 * cross out and rewrite, each row has a run of boxes: at every check, fill in
 * the next one with today's date and when it's next due.
 */
function refreshLog(p: Pages, ctx: ExportInput["ctx"], newPage = true) {
  const { doc } = p;
  if (newPage) p.newPage(true);
  const width = PAGE_H - M * 2;
  const itemW = 232;
  const everyW = 74;
  const checkW = (width - itemW - everyW) / CHECKS;

  p.para("Keep it fresh", 20, { bold: true, after: 2 });
  p.para(
    "Check these when the clocks change in spring and fall. Each time, use the next empty box: write today's date and when it's next due. Blank rows are for your own food and anything else that expires.",
    10,
    { color: SOFT, width, after: 10 },
  );

  const header = () => {
    p.font(7.5, true, SOFT);
    doc.text("ITEM", M, p.y + 8, { charSpace: 0.5 });
    doc.text("REPLACE", M + itemW, p.y + 8, { charSpace: 0.5 });
    doc.text("EACH CHECK", M + itemW + everyW + 4, p.y + 8, { charSpace: 0.5 });
    p.y += 13;
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.8);
    doc.line(M, p.y, M + width, p.y);
  };
  const row = (item: string, note: string, every: string) => {
    p.font(7.5);
    const noteLines = note ? p.lines(note, itemW - 10) : [];
    const rowH = Math.max(30, 18 + noteLines.length * 9);
    if (p.y + rowH > p.bottom) {
      p.newPage();
      header();
    }
    const top = p.y;
    if (item) {
      p.font(9.5, true);
      doc.text(p.lines(item, itemW - 10)[0] ?? "", M, top + 12);
      p.font(7.5, false, SOFT);
      noteLines.forEach((line, i) => doc.text(line, M, top + 22 + i * 9));
    }
    p.font(8.5, false, SOFT);
    doc.text(p.lines(every, everyW - 6), M + itemW, top + 12);
    // A box per check: "On" (the date you checked) over "Next" (when it's due).
    for (let k = 0; k < CHECKS; k++) {
      const x = M + itemW + everyW + k * checkW;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.5);
      doc.line(x, top, x, top + rowH);
      p.font(6.5, false, SOFT);
      doc.text("On", x + 4, top + 11);
      doc.text("Next", x + 4, top + rowH / 2 + 10);
    }
    p.y += rowH;
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.5);
    doc.line(M, p.y, M + width, p.y);
  };

  for (const section of expiringSections(ctx)) {
    if (p.y + 70 > p.bottom) p.newPage();
    p.y += 6;
    p.para(section.name, 12.5, { bold: true });
    p.para(section.desc + ".", 9, { color: SOFT, width, after: 4 });
    header();
    let blanks = section.blanks;
    for (const r of section.rows) {
      // The spreadsheet's example rows: real foods print as starters, the
      // "add your food here" placeholders print as blank lines.
      const name = r.item.replace(/^\[Example\] /, "");
      if (name === "Add your food here") {
        blanks++;
        continue;
      }
      row(name, r.note, r.every ? `Every ${r.every} months` : "By the date on it");
    }
    for (let k = 0; k < blanks; k++) row("", "", "");
    p.y += 10;
  }
}

/** The whole list, or just the refresh log for its own print button. */
export type PdfPart = "list" | "refresh";

async function makePdf(input: ExportInput, part: PdfPart) {
  const { jsPDF } = await import("jspdf");
  return part === "refresh" ? buildRefreshPdf(jsPDF, input) : buildPdf(jsPDF, input);
}

export async function downloadPdf(input: ExportInput, part: PdfPart = "list") {
  (await makePdf(input, part)).save(part === "refresh" ? "keep-it-fresh.pdf" : "emergency-list.pdf");
}

/**
 * Prints the same PDF the download makes, so a printout and a saved PDF match.
 * Most desktop browsers can print a PDF from a hidden frame. Safari and phones
 * can't, so they get the PDF in a new tab to print or share from there. That tab
 * has to open right away, in the click, or a popup blocker stops it.
 */
export function printPdf(input: ExportInput, part: PdfPart = "list"): Promise<void> {
  const ua = navigator.userAgent;
  const inTab = /iPad|iPhone|iPod|Android/.test(ua) || (/Safari\//.test(ua) && !/Chrome|Chromium|Edg\//.test(ua));
  const tab = inTab ? window.open("", "_blank") : null;
  return (async () => {
    try {
      const url = URL.createObjectURL((await makePdf(input, part)).output("blob"));
      setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
      if (tab) {
        tab.location.href = url;
        return;
      }
      document.getElementById("print-frame")?.remove();
      const frame = document.createElement("iframe");
      frame.id = "print-frame";
      frame.title = "Printable list";
      frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
      frame.onload = () => {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      };
      frame.src = url;
      document.body.appendChild(frame);
    } catch (err) {
      tab?.close();
      throw err;
    }
  })();
}
