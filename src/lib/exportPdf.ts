import type { jsPDF as JsPDF } from "jspdf";
import type { Container, ListEntry } from "./types";
import type { ExportInput } from "./exportXlsx";
import { CONTAINER_ORDER, firstSteps } from "./buildList";
import { peopleNames } from "./answers";
import { listSummary } from "./summary";
import { BAY_READY_URL } from "./urls";
import { CATEGORY_META, CATEGORY_ORDER, CONTAINER_META } from "@/data/meta";
import { COUNTY_BY_ID } from "@/data/counties";
import { firstHourCard } from "@/data/firstHour";
import { expiringSections } from "@/data/expiring";
import { EMPTY_HOME, factFields, homeFacts, type HomeFactId } from "@/data/homeFacts";
import { isEssential } from "@/data/essentials";

/*
 * The list as a PDF. The full version, in order: Know your home (on the
 * person's own list), the When it happens card, wallet cards, every kit with
 * checkboxes, and the refresh log. The short version swaps the kits and the
 * log for the Start here steps and the essentials.
 *
 * Text is set in Noto Sans (public/fonts), so names typed in Vietnamese,
 * Polish, Russian, and so on print as typed. If the font can't load, it falls
 * back to jsPDF's built-in Helvetica.
 */

type RGB = [number, number, number];
const INK: RGB = [19, 41, 61];
const SOFT: RGB = [62, 92, 110];
const LINE: RGB = [200, 211, 216];
const GREEN: RGB = [63, 110, 85];
const ORANGE: RGB = [184, 58, 30];
const TINT: RGB = [233, 239, 242];

const PAGE_W = 612; // US Letter, in points
const PAGE_H = 792;
const M = 48;
const CONTENT_W = PAGE_W - M * 2;

// ---------------------------------------------------------------------------
// Fonts

/** The PDF font's TTF files, as raw bytes. */
export interface PdfFonts {
  regular: Uint8Array;
  bold: Uint8Array;
}

export interface PdfOptions {
  /** The short version: the plan, the card, Start here, and the essentials. */
  short?: boolean;
  /** Noto Sans. Without it, the PDF uses Helvetica, which only has Western European letters. */
  fonts?: PdfFonts;
}

const FAMILY = "NotoSans";
const FONT_FILES = { regular: "NotoSans-Regular.ttf", bold: "NotoSans-Bold.ttf" } as const;

/** jsPDF wants a font file as a "binary string", one character per byte. */
function binaryString(bytes: Uint8Array) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return s;
}

type Covers = (codePoint: number) => boolean;

/**
 * The built-in Helvetica covers Western European letters plus curly quotes,
 * dashes, and a few symbols (the Windows-1252 set).
 */
const HELVETICA_EXTRAS = new Set([0x2013, 0x2014, 0x2022, 0x2026, 0x20ac, 0x2122]);
const helveticaCovers: Covers = (cp) =>
  (cp >= 0x20 && cp <= 0x7e) || (cp >= 0xa0 && cp <= 0xff) || (cp >= 0x2018 && cp <= 0x201e) || HELVETICA_EXTRAS.has(cp);

/**
 * Registers Noto Sans with the document and returns what it can print, or
 * null (use Helvetica) if the files don't parse.
 *
 * The subset covers Latin (Vietnamese included), Greek, and Cyrillic. Chinese,
 * Japanese, Korean, and other scripts aren't in it, so those characters are
 * still left out. jsPDF also reads text one UTF-16 unit at a time, so nothing
 * outside the Basic Multilingual Plane (emoji, for one) can print.
 */
function addNoto(doc: JsPDF, fonts: PdfFonts): Covers | null {
  type Loaded = { metadata?: { cmap?: { unicode?: { codeMap?: Record<number, number> } } } };
  // A TrueType file starts with 00 01 00 00. Anything else (say, an HTML error page) isn't a font.
  const isTtf = (b: Uint8Array) => b.length > 4 && b[0] === 0 && b[1] === 1 && b[2] === 0 && b[3] === 0;
  if (!isTtf(fonts.regular) || !isTtf(fonts.bold)) return null;
  try {
    const maps = (["regular", "bold"] as const).map((weight) => {
      doc.addFileToVFS(FONT_FILES[weight], binaryString(fonts[weight]));
      doc.addFont(FONT_FILES[weight], FAMILY, weight === "bold" ? "bold" : "normal");
      doc.setFont(FAMILY, weight === "bold" ? "bold" : "normal");
      return (doc.getFont() as unknown as Loaded).metadata?.cmap?.unicode?.codeMap;
    });
    const [regular, bold] = maps;
    if (!regular || !bold) return null;
    return (cp) => cp <= 0xffff && Boolean(regular[cp] && bold[cp]);
  } catch {
    return null;
  }
}

const ARROW = 0x2192;

/**
 * Keeps the characters the font can print and drops the rest (with the space
 * before them, so "Bea" plus an emoji prints as "Bea"). Text is composed first
 * (NFC), since some keyboards type Vietnamese tone marks as separate characters.
 */
function cleaner(covers: Covers) {
  return (s: string) => {
    let out = "";
    for (const ch of s.normalize("NFC")) {
      const cp = ch.codePointAt(0) ?? 0;
      if (ch === "\n" || covers(cp)) out += ch;
      else if (cp === ARROW) out += "->";
      else if (out.endsWith(" ")) out = out.slice(0, -1);
    }
    return out;
  };
}

let fontsLoading: Promise<PdfFonts | undefined> | undefined;

/** Fetches the font files once per visit. Resolves to undefined if they can't load, so the PDF still works. */
export function loadFonts(): Promise<PdfFonts | undefined> {
  fontsLoading ??= (async () => {
    try {
      // Not sitePath(): that adds the trailing slash page URLs need.
      const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
      const [regular, bold] = await Promise.all(
        [FONT_FILES.regular, FONT_FILES.bold].map(async (file) => {
          const res = await fetch(`${base}/fonts/${file}`);
          if (!res.ok) throw new Error(`${file}: ${res.status}`);
          return new Uint8Array(await res.arrayBuffer());
        }),
      );
      return { regular, bold };
    } catch {
      fontsLoading = undefined; // try again next time
      return undefined;
    }
  })();
  return fontsLoading;
}

// ---------------------------------------------------------------------------
// Layout

class Pages {
  y = M;
  landscape = false;
  constructor(
    readonly doc: JsPDF,
    readonly family: string,
    /** Drops what the font can't print. */
    readonly clean: (s: string) => string,
  ) {}

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
    this.doc.setFont(this.family, bold ? "bold" : "normal");
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
  }
  /** Writes one line of text, cleaned for the font. */
  text(s: string, x: number, y: number, opts?: Parameters<JsPDF["text"]>[3]) {
    this.doc.text(this.clean(s), x, y, opts);
  }
  /** Wrapped lines for this text at the current font. */
  lines(text: string, width: number): string[] {
    return this.doc.splitTextToSize(this.clean(text), width) as string[];
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
  /** A section title with a dark rule under it. */
  heading(title: string, intro?: string) {
    this.para(title, 16, { bold: true, after: 2 });
    this.rule(INK, 1.2);
    this.y += 6;
    if (intro) this.para(intro, 9.5, { color: SOFT, after: 4 });
  }
}

function newDoc(JsPDFClass: typeof JsPDF, title: string, opts: PdfOptions, landscape = false): Pages {
  const doc = new JsPDFClass({ unit: "pt", format: "letter", orientation: landscape ? "landscape" : "portrait" });
  doc.setProperties({ title, creator: "Bay Ready" });
  doc.setLanguage("en-US");
  const covers = opts.fonts ? addNoto(doc, opts.fonts) : null;
  const p = new Pages(doc, covers ? FAMILY : "helvetica", cleaner(covers ?? helveticaCovers));
  p.landscape = landscape;
  return p;
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

const ESSENTIAL_TAG = "ESSENTIAL";

/** One checkbox row. `tag` marks the essentials, for the full list where they're mixed in with everything else. */
function itemRow(p: Pages, e: ListEntry, input: ExportInput, tag = false) {
  const { doc } = p;
  const have = input.stateOf(e) === "have";
  const qty = p.clean(e.qty?.text ?? "");
  const essential = tag && isEssential(e);
  p.font(6, true);
  const tagW = essential ? doc.getTextWidth(ESSENTIAL_TAG) + 0.4 * ESSENTIAL_TAG.length + 8 : 0;
  p.font(10.5, !have, have ? SOFT : INK);
  const qtyW = qty ? doc.getTextWidth(qty) + 12 : 0;
  const nameX = M + 18;
  const nameLines = p.lines(e.item.name, CONTENT_W - 18 - qtyW - (tagW ? tagW + 6 : 0));
  const nameEnd = nameX + doc.getTextWidth(nameLines[nameLines.length - 1] ?? "") + (tagW ? tagW + 6 : 0);

  // A small box per person, for go bags and per-adult to-dos. They sit in a
  // column to the right of a short name, or on their own line under a long one.
  p.font(8.5, false, SOFT);
  const people = e.slots.map((name, i) => {
    const label = p.clean(name) || `Person ${i + 1}`;
    return { label, w: 11 + doc.getTextWidth(label) + 12 };
  });
  const peopleW = people.reduce((sum, s) => sum + s.w, 0) - 12;
  const inlineX = M + 270;
  const inline =
    people.length > 0 && nameLines.length === 1 && nameEnd + 12 <= inlineX && inlineX + peopleW <= M + CONTENT_W - qtyW;
  const h = nameLines.length * 13.5 + (people.length && !inline ? 16 : 0) + 8;
  p.room(h);

  const top = p.y + 4;
  checkbox(doc, M, top + 0.5, 10, have);
  p.font(10.5, !have, have ? SOFT : INK);
  nameLines.forEach((line, i) => doc.text(line, nameX, top + 8.5 + i * 13.5));
  if (essential) {
    const last = nameLines.length - 1;
    const x = nameX + doc.getTextWidth(nameLines[last] ?? "") + 6;
    const y = top + last * 13.5;
    doc.setFillColor(...TINT);
    doc.roundedRect(x, y + 0.5, tagW, 10, 2, 2, "F");
    p.font(6, true, SOFT);
    doc.text(ESSENTIAL_TAG, x + 4, y + 7.6, { charSpace: 0.4 });
  }
  if (qty) {
    p.font(9.5, false, SOFT);
    doc.text(qty, M + CONTENT_W, top + 8.5, { align: "right" });
  }

  let x = inline ? inlineX : nameX;
  const y = inline ? top + 1.5 : top + nameLines.length * 13.5 + 3;
  people.forEach(({ label, w }, i) => {
    if (x + w - 12 > M + CONTENT_W) return;
    checkbox(doc, x, y, 7.5, input.slotDone(e, i));
    p.font(8.5, false, SOFT);
    doc.text(label, x + 11, y + 6.5);
    x += w;
  });

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

/** A kit's items: the essentials first, then everything else by category. */
function itemGroup(p: Pages, entries: ListEntry[], input: ExportInput) {
  const essentials = entries.filter(isEssential);
  const groups: [string, ListEntry[], boolean][] = [
    // No tag inside the Essentials group: every row there is one.
    ...(essentials.length ? [["ESSENTIALS", essentials, false] as [string, ListEntry[], boolean]] : []),
    ...categoryGroups(entries.filter((e) => !isEssential(e))).map(
      ([cat, list]) => [CATEGORY_META[cat].toUpperCase(), list, true] as [string, ListEntry[], boolean],
    ),
  ];
  for (const [label, list, tag] of groups) {
    p.room(40); // keep a group label with its first item
    p.y += 6;
    p.font(8, true, SOFT);
    p.text(label, M, p.y + 7, { charSpace: 0.6 });
    p.y += 12;
    list.forEach((e) => itemRow(p, e, input, tag));
  }
}

function kitSection(p: Pages, container: Container, entries: ListEntry[], input: ExportInput) {
  const { ctx } = input;
  const meta = CONTAINER_META[container];
  p.room(90);
  p.y += 10;
  p.heading(meta.name, [meta.purpose, meta.where].filter(Boolean).join(" "));

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

// ---------------------------------------------------------------------------
// Sections

function titleBlock(p: Pages, input: ExportInput, short: boolean) {
  const { answers, ctx, shareUrl } = input;
  const { doc } = p;
  const today = input.today ?? new Date();
  p.font(8, true, ORANGE);
  p.text(short ? "BAY READY  |  SHORT VERSION" : "BAY READY", M, p.y + 7, { charSpace: 1 });
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
}

/**
 * A box per answer, like the printed sheet, so blanks can be filled in by hand.
 * It comes first, right under the title: it's what you'll want on the day.
 */
function knowYourHome(p: Pages, input: ExportInput) {
  const home = input.home;
  if (!home) return;
  const { doc } = p;
  p.heading("Know your home", "Fill in anything that's blank. Keep a copy in your stay-at-home bin and in each go bag.");
  p.y += 4;

  const gap = 6;
  const boxW = (CONTENT_W - gap) / 2;
  const fields = factFields(homeFacts(input.ctx), input.ctx, home);
  for (let i = 0; i < fields.length; i += 2) {
    const pair = fields.slice(i, i + 2);
    p.font(10);
    const valueLines = pair.map((f) => p.lines(f.value.trim(), boxW - 16));
    const boxH = Math.max(36, 23 + Math.max(...valueLines.map((l) => l.length)) * 13);
    p.room(boxH + gap);
    pair.forEach((f, k) => {
      const x = M + k * (boxW + gap);
      doc.setDrawColor(...INK);
      doc.setLineWidth(0.8);
      doc.roundedRect(x, p.y, boxW, boxH, 3, 3, "S");
      p.font(7.5, true, SOFT);
      doc.text(p.clean(f.label).toUpperCase(), x + 8, p.y + 13, { charSpace: 0.5 });
      p.font(10);
      valueLines[k].forEach((line, j) => doc.text(line, x + 8, p.y + 27 + j * 13));
    });
    p.y += boxH + gap;
  }

  // Notes: a box to write in, or flowing text if they've written more than fits on a page.
  p.font(10);
  const noteLines = p.lines(home.notes.trim(), CONTENT_W - 16);
  const needed = 34 + noteLines.length * 13;
  const boxH = Math.max(90, needed);
  if (boxH <= p.bottom - M) {
    // The box shrinks to stay on this page, as long as what's written fits and there's room to write more.
    const fit = Math.min(boxH, Math.max(needed + 26, 64, p.bottom - p.y));
    p.room(fit);
    doc.setDrawColor(...INK);
    doc.setLineWidth(0.8);
    doc.roundedRect(M, p.y, CONTENT_W, fit, 3, 3, "S");
    p.font(7.5, true, SOFT);
    doc.text("NOTES AND REMINDERS", M + 8, p.y + 13, { charSpace: 0.5 });
    p.font(10);
    noteLines.forEach((line, j) => doc.text(line, M + 8, p.y + 28 + j * 13));
    p.y += fit;
  } else {
    p.para("Notes and reminders", 12, { bold: true, after: 4 });
    p.para(home.notes.trim(), 10);
  }
}

/** The card for the day it happens. Any number of sections, each a numbered list. */
function whenItHappens(p: Pages, input: ExportInput, newPage: boolean) {
  const sections = firstHourCard(input.ctx);
  if (sections.length === 0) return;
  if (newPage) p.newPage();
  else {
    p.room(160);
    p.y += 8;
  }
  const kits = input.ctx.kits;
  const places = ["on the fridge", kits.includes("stay") && "inside the lid of your bin", kits.includes("go") && "in each go bag"].filter(
    (s): s is string => Boolean(s),
  );
  const where = places.length > 1 ? `${places.slice(0, -1).join(", ")}, and ${places[places.length - 1]}` : places[0];
  p.para("When it happens", 20, { bold: true, after: 2 });
  p.para(`Keep a copy ${where}.`, 10, { color: SOFT, after: 8 });
  // Sized to fit on one page, so the whole card can go on the fridge.
  for (const s of sections) {
    p.room(50);
    p.para(s.title, 12, { bold: true, after: 3 });
    s.lines.forEach((line, i) => {
      p.font(10, true, ORANGE);
      p.room(13);
      p.doc.text(`${i + 1}.`, M, p.y + 8);
      p.para(line, 10, { x: M + 18, after: 3 });
    });
    p.y += 8;
  }
}

/** A folded wallet card: 3.5 by 2 inches, front and back side by side. */
const CARD_W = 252;
const CARD_H = 144;
const CARD_GAP = 12;
const CARD_PAD = 10;

interface CardInfo {
  county?: string;
  facts: Partial<Record<HomeFactId, string>>;
  /** Everyone's name and cell number, adults first. */
  cells: { name: string; phone: string }[];
}

function cardInfo(input: ExportInput): CardInfo {
  const { ctx, answers } = input;
  const fields = factFields(homeFacts(ctx), ctx, input.home ?? EMPTY_HOME);
  const facts: CardInfo["facts"] = {};
  for (const f of fields) if (f.person === undefined) facts[f.fact.id] = f.value.trim();
  const phones = fields.filter((f) => f.fact.id === "phones");
  const names = peopleNames(ctx);
  return {
    county: answers.county ? COUNTY_BY_ID[answers.county]?.alert.name : undefined,
    facts,
    cells: names.map((name, i) => ({ name, phone: phones[i]?.value.trim() ?? "" })),
  };
}

/** Text on one line, shrunk to fit if it's long, and cut short if it's very long. */
function fitLine(p: Pages, s: string, width: number, size: number, bold = false, color: RGB = INK): string {
  const text = p.clean(s).replace(/\s+/g, " ").trim();
  for (let sz = size; sz >= Math.min(size, 6.5); sz -= 0.5) {
    p.font(sz, bold, color);
    if (p.doc.getTextWidth(text) <= width) return text;
  }
  const [first = ""] = p.lines(text, width - p.doc.getTextWidth("..."));
  return `${first.trimEnd()}...`;
}

/** A small label with an answer on a write-in line under it. */
function cardField(p: Pages, label: string, value: string, x: number, y: number, w: number) {
  const { doc } = p;
  p.font(5.8, true, SOFT);
  doc.text(fitLine(p, label.toUpperCase(), w, 5.8, true, SOFT), x, y, { charSpace: 0.35 });
  doc.setDrawColor(...LINE);
  doc.setLineWidth(0.5);
  doc.line(x, y + 12.5, x + w, y + 12.5);
  if (value) doc.text(fitLine(p, value, w, 8.5), x, y + 10.5);
}

function walletCard(p: Pages, info: CardInfo, name: string, x: number, y: number) {
  const { doc } = p;
  // Cut line around the outside, fold line down the middle.
  doc.setLineDashPattern([4, 3], 0);
  doc.setDrawColor(...SOFT);
  doc.setLineWidth(0.6);
  doc.rect(x, y, CARD_W * 2, CARD_H, "S");
  doc.setLineDashPattern([1, 2.5], 0);
  doc.setDrawColor(...LINE);
  doc.line(x + CARD_W, y + 4, x + CARD_W, y + CARD_H - 4);
  doc.setLineDashPattern([], 0);

  // Front: whose card, and how to find each other.
  const fx = x + CARD_PAD;
  const fw = CARD_W - CARD_PAD * 2;
  p.font(6, true, ORANGE);
  doc.text("IF WE GET SEPARATED", fx, y + CARD_PAD + 5, { charSpace: 0.6 });
  const who = p.clean(name).trim();
  if (who) doc.text(fitLine(p, who, fw, 13, true), fx, y + CARD_PAD + 20);
  else cardField(p, "Name", "", fx, y + CARD_PAD + 10, fw);
  const rows: [string, string][] = [
    ["Out-of-area contact", info.facts.contact ?? ""],
    ["Local backup contact", info.facts.localContact ?? ""],
    ["Meeting spot outside", info.facts.meetOutside ?? ""],
    ["Meeting spot nearby", info.facts.meetNearby ?? ""],
  ];
  rows.forEach(([label, value], i) => cardField(p, label, value, fx, y + 45 + i * 22, fw));

  // Back: everyone's numbers, and the three things to remember.
  const bx = x + CARD_W + CARD_PAD;
  const bw = CARD_W - CARD_PAD * 2;
  p.font(6, true, ORANGE);
  doc.text("OUR CELL NUMBERS", bx, y + CARD_PAD + 5, { charSpace: 0.6 });
  // Two across, adults first. Up to 8 people fit.
  const pitch = info.cells.length > 6 ? 17.5 : 20;
  const colW = (bw - 10) / 2;
  info.cells.forEach((c, i) => {
    const solo = info.cells.length === 1;
    const x = bx + (solo ? 0 : (i % 2) * (colW + 10));
    cardField(p, p.clean(c.name) || `Person ${i + 1}`, c.phone, x, y + 25 + Math.floor(i / 2) * pitch, solo ? bw : colW);
  });
  const foot = y + CARD_H - CARD_PAD;
  p.font(8.5, true);
  doc.text("Text, don't call.", bx, foot - 22);
  p.font(7.5);
  doc.text("911 for emergencies, 211 for shelter and help.", bx, foot - 11.5);
  if (info.county) doc.text(fitLine(p, `Alerts: ${info.county}`, bw, 7.5), bx, foot - 1);
  else {
    doc.text("Alerts:", bx, foot - 1);
    doc.setDrawColor(...LINE);
    doc.line(bx + doc.getTextWidth("Alerts: "), foot, bx + bw, foot);
  }
}

/**
 * One card per person, kids included. On a shared list there's no Know your
 * home, so the cards print with names and blank lines to fill in by hand:
 * the plan still matters, and it's the most useful page to hand around.
 */
function walletCards(p: Pages, input: ExportInput) {
  const names = peopleNames(input.ctx);
  const info = cardInfo(input);
  p.newPage();
  p.para("Wallet cards", 20, { bold: true, after: 2 });
  p.para(
    "One for each person. Cut along the dashed line and fold in half. It fits in a wallet or phone case, and works in a kid's backpack too.",
    10,
    { color: SOFT, after: 12 },
  );
  const x = M + (CONTENT_W - CARD_W * 2) / 2;
  for (const name of names) {
    p.room(CARD_H + 2);
    walletCard(p, info, name, x, p.y);
    p.y += CARD_H + CARD_GAP;
  }
}

/** The short version's checklist: Start here, then the essentials for each kit. */
function shortChecklist(p: Pages, input: ExportInput) {
  const { ctx, answers } = input;
  p.newPage();
  const steps = firstSteps(input.entries, input.stateOf, answers);
  if (steps.length) {
    p.heading("Start here", "Free things to do first. No shopping needed.");
    steps.forEach((e) => itemRow(p, e, input));
    p.y += 16;
  }

  const essentials = input.entries.filter((e) => isEssential(e) && input.stateOf(e) !== "skip");
  if (essentials.length) {
    p.room(120);
    p.heading(
      "The essentials",
      "Buy these first and put them away. Check them off as you go. Your full list has everything else, for when you're ready for more.",
    );
    for (const c of CONTAINER_ORDER) {
      const kit = essentials.filter((e) => e.container === c);
      if (!ctx.kits.includes(c) || kit.length === 0) continue;
      const meta = CONTAINER_META[c];
      p.room(60);
      p.y += 6;
      p.para(meta.name, 12.5, { bold: true });
      p.para(meta.where, 9, { color: SOFT, after: 2 });
      kit.forEach((e) => itemRow(p, e, input));
      p.y += 6;
    }
  }

}

// ---------------------------------------------------------------------------
// Documents

export function buildPdf(JsPDFClass: typeof JsPDF, input: ExportInput, opts: PdfOptions = {}): JsPDF {
  const short = Boolean(opts.short);
  const p = newDoc(JsPDFClass, short ? "My emergency list: short version" : "My emergency list", opts);

  titleBlock(p, input, short);
  knowYourHome(p, input);
  whenItHappens(p, input, Boolean(input.home));
  walletCards(p, input);

  if (short) shortChecklist(p, input);
  else {
    p.newPage();
    const shown = input.entries.filter((e) => input.stateOf(e) !== "skip");
    for (const c of CONTAINER_ORDER) {
      const list = shown.filter((e) => e.container === c);
      if (input.ctx.kits.includes(c) && list.length > 0) kitSection(p, c, list, input);
    }
    refreshLog(p, input.ctx);
  }
  footers(p);
  return p.doc;
}

/** Just the refresh log, for its own print button. */
export function buildRefreshPdf(JsPDFClass: typeof JsPDF, input: ExportInput, opts: Pick<PdfOptions, "fonts"> = {}): JsPDF {
  const p = newDoc(JsPDFClass, "Keep it fresh", opts, true);
  refreshLog(p, input.ctx, false);
  footers(p);
  return p.doc;
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

// ---------------------------------------------------------------------------
// In the browser

/** The whole list, the short version (plan, card, and essentials), or just the refresh log. */
export type PdfPart = "list" | "short" | "refresh";

const FILE_NAMES: Record<PdfPart, string> = {
  list: "emergency-list.pdf",
  short: "emergency-list-short.pdf",
  refresh: "keep-it-fresh.pdf",
};

async function makePdf(input: ExportInput, part: PdfPart) {
  const [{ jsPDF }, fonts] = await Promise.all([import("jspdf"), loadFonts()]);
  if (part === "refresh") return buildRefreshPdf(jsPDF, input, { fonts });
  return buildPdf(jsPDF, input, { fonts, short: part === "short" });
}

export async function downloadPdf(input: ExportInput, part: PdfPart = "list") {
  (await makePdf(input, part)).save(FILE_NAMES[part]);
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
