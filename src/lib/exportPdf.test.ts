import { describe, expect, it } from "vitest";
import { jsPDF } from "jspdf";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deriveContext, normalizeAnswers } from "./answers";
import { buildList, slotDone, stateOf } from "./buildList";
import { buildPdf, buildRefreshPdf, type PdfFonts, type PdfOptions } from "./exportPdf";
import { ITEMS } from "@/data/items";
import type { ItemState } from "./types";
import type { HomeInfo } from "@/data/homeFacts";
import type { Lang } from "@/i18n/lang";

const FONTS: PdfFonts = {
  regular: readFileSync(join(process.cwd(), "public/fonts/NotoSans-Regular.ttf")),
  bold: readFileSync(join(process.cwd(), "public/fonts/NotoSans-Bold.ttf")),
};

function makeInput(
  home?: HomeInfo,
  names = { adults: ["Sam", "José"], kids: ["Bea 🐝"] },
  household = { adults: 2, kids: 1, dogs: 1 },
  lang: Lang = "en",
) {
  const answers = normalizeAnswers({
    build: "both",
    county: "alameda",
    hazards: ["earthquake", "outage", "wildfire"],
    household,
    names,
    have: ["flashlight"],
  });
  const ctx = deriveContext(answers, lang);
  const entries = buildList(ctx, ITEMS).filter((e) => e.level === "basics");
  const states: Record<string, ItemState> = { "home:shutoffs": "have", "go:water-go@1": "have", "stay:radio": "skip" };
  return {
    answers,
    ctx,
    entries,
    stateOf: (e: (typeof entries)[number]) => stateOf(e, states, answers),
    slotDone: (e: (typeof entries)[number], i: number) => slotDone(e, i, states, answers),
    shareUrl: "https://example.test/list#abc",
    today: new Date(2026, 9, 11),
    home,
  };
}

const HOME: HomeInfo = {
  facts: {
    gas: "Left side of the house, wrench on a hook — by the meter",
    contact: "Aunt Ro, 555-0100",
    localContact: "Kim next door, 555-0150",
    meetOutside: "The big oak out front",
  },
  bags: ["Hall closet", "", "Under Bea's bed"],
  phones: ["555-0111", "", "555-0133"],
  notes: "Radio is in Sam’s go bag.",
};

/**
 * Set PDF_OUT=/some/dir/name.pdf to save the sample PDFs for a look: name.pdf
 * (the full list), name-short.pdf, name-shared.pdf, name-names.pdf, name-big.pdf.
 */
function render(input: ReturnType<typeof makeInput>, opts: PdfOptions = { fonts: FONTS }, saveAs?: string) {
  const doc = buildPdf(jsPDF, input, opts);
  const out = process.env.PDF_OUT;
  if (out && saveAs !== undefined) writeFileSync(out.replace(/\.pdf$/, `${saveAs}.pdf`), Buffer.from(doc.output("arraybuffer")));
  return doc;
}

/** Stands in for a glyph the decoder can't map back to a character. */
const MISSING = String.fromCodePoint(0xfffd);

type Font = { id: string; metadata?: { cmap?: { unicode?: { codeMap?: Record<number, number> } } } };

/**
 * The text of a PDF, one string per line drawn. Noto Sans text is stored as
 * glyph numbers, so this maps them back through each font's own table.
 * Helvetica text is stored as plain strings.
 */
function pdfText(doc: jsPDF): string {
  const glyphs: Record<string, Map<number, string>> = {};
  const getFont = (doc.internal as unknown as { getFont: (f: string, s: string) => Font | undefined }).getFont;
  for (const style of ["normal", "bold"]) {
    let font: Font | undefined;
    try {
      font = getFont("NotoSans", style);
    } catch {
      continue;
    }
    const map = font?.metadata?.cmap?.unicode?.codeMap;
    if (!font || !map) continue;
    const back = new Map<number, string>();
    for (const [cp, gid] of Object.entries(map)) if (!back.has(gid)) back.set(gid, String.fromCodePoint(Number(cp)));
    glyphs[font.id] = back;
  }
  const lines: string[] = [];
  let current = "";
  for (const m of doc.output().matchAll(/\/(F\d+) [\d.]+ Tf|<([0-9a-fA-F]*)> Tj|\(((?:[^()\\]|\\.)*)\) Tj/g)) {
    if (m[1]) current = m[1];
    else if (m[2] !== undefined) {
      const back = glyphs[current];
      let s = "";
      for (let i = 0; i < m[2].length; i += 4) s += back?.get(parseInt(m[2].slice(i, i + 4), 16)) ?? MISSING;
      lines.push(s);
    } else lines.push(m[3].replace(/\\(.)/g, "$1"));
  }
  return lines.join("\n");
}

describe("PDF export", () => {
  it("lays out Know your home, the card, wallet cards, the list, and the refresh log, in that order", () => {
    const doc = render(makeInput(HOME), { fonts: FONTS }, "");
    expect(doc.getNumberOfPages()).toBeGreaterThan(5);
    const text = pdfText(doc);
    const at = (s: string) => {
      const i = text.indexOf(s);
      expect(i, s).toBeGreaterThan(-1);
      return i;
    };
    expect(at("Know your home")).toBeLessThan(at("When it happens"));
    expect(at("When it happens")).toBeLessThan(at("Wallet cards"));
    expect(at("Wallet cards")).toBeLessThan(at("Stay-at-home bin"));
    expect(at("Stay-at-home bin")).toBeLessThan(at("Keep it fresh"));
    expect(text).toContain("Aunt Ro, 555-0100");
    expect(text).toContain("JOSÉ'S GO BAG IS");
    expect(text).toContain("Under Bea's bed");
    expect(text).toContain("LOCAL BACKUP CONTACT");
    expect(text).toContain("SAM'S CELL");
    // Every section of the card prints, however many there are.
    expect(text).toContain("Right after a big quake");
    expect(text).toContain("Other emergencies");
    // Essentials are tagged in the full list.
    expect(text).toContain("ESSENTIAL");
    // The emoji is dropped, the name isn't.
    expect(text).toContain("Bea's cell".toUpperCase());
    expect(text).not.toContain(MISSING);
    expect(text).not.toContain("...");
  });

  it("keeps Vietnamese and other non-English names when the font loads", () => {
    const names = { adults: ["Nguyễn Văn An", "Łucja Żółć"], kids: ["Đức"] };
    const doc = render(makeInput(HOME, names), { fonts: FONTS }, "-names");
    const text = pdfText(doc);
    expect(text).toContain("Nguyễn Văn An");
    expect(text).toContain("Łucja Żółć");
    expect(text).toContain("Đức");
    // Tone marks typed as separate characters are joined up first.
    const decomposed = render(makeInput(HOME, { adults: ["Nguyễn".normalize("NFD"), ""], kids: [""] }));
    expect(pdfText(decomposed)).toContain("Nguyễn");
  });

  it("falls back to Helvetica when the font isn't there or won't load", () => {
    for (const opts of [{}, { fonts: { regular: new Uint8Array([1, 2, 3]), bold: new Uint8Array([4, 5]) } }]) {
      const doc = render(makeInput(HOME, { adults: ["Nguyễn Văn An", "Sam"], kids: ["Bea"] }), opts);
      const raw = doc.output();
      expect(raw).not.toContain("/FontFile2");
      expect(raw).toContain("(Know your home) Tj");
      // Helvetica can't print the Vietnamese letters, so they're left out.
      expect(raw).toContain("Nguy");
    }
  });

  it("sets the language and title", () => {
    const raw = render(makeInput(HOME)).output();
    expect(raw).toContain("/Lang (en-US)");
    expect(raw).toContain("/Title (My emergency list)");
  });

  it("prints a wallet card for each person, with the plan and blank lines to fill in", () => {
    const text = pdfText(render(makeInput(HOME)));
    const cards = text.split("\n").filter((l) => l === "IF WE GET SEPARATED");
    expect(cards).toHaveLength(3);
    expect(text).toContain("Kim next door, 555-0150");
    expect(text).toContain("The big oak out front");
    expect(text).toContain("555-0133");
    expect(text).toContain("Text, don't call.");
    expect(text).toContain("911 for emergencies, 211 for shelter and help.");
    expect(text).toContain("Alerts: AC Alert");
    expect(text).toContain("kid's backpack too");
  });

  it("prints blank wallet cards on a shared list, and leaves out Know your home", () => {
    const text = pdfText(render(makeInput(), { fonts: FONTS }, "-shared"));
    expect(text).not.toContain("Know your home");
    expect(text.split("\n").filter((l) => l === "IF WE GET SEPARATED")).toHaveLength(3);
    expect(text).toContain("OUT-OF-AREA CONTACT");
    expect(text).not.toContain("Aunt Ro");
    // The card follows the title on page 1 when there's no Know your home page.
    expect(text.indexOf("When it happens")).toBeLessThan(text.indexOf("Page 1 of"));
  });

  it("fits a big household's numbers on every card", () => {
    const names = { adults: ["Ana", "Ben", "Cy", "Dee", "Eve"], kids: ["Fay", "Gus", "Hal"] };
    const phones = ["555-0001", "555-0002", "555-0003", "555-0004", "555-0005", "555-0006", "555-0007", "555-0008"];
    const input = makeInput({ ...HOME, phones }, names, { adults: 5, kids: 3, dogs: 0 });
    const text = pdfText(render(input, { fonts: FONTS }, "-big"));
    expect(text.split("\n").filter((l) => l === "IF WE GET SEPARATED")).toHaveLength(8);
    // Once in Know your home, then once on each card.
    for (const phone of phones) expect(text.split("\n").filter((l) => l === phone)).toHaveLength(9);
  });

  it("makes a short version: the plan, the card, Start here, and the essentials", () => {
    const input = makeInput(HOME);
    const doc = render(input, { fonts: FONTS, short: true }, "-short");
    const full = render(input);
    expect(doc.getNumberOfPages()).toBeLessThanOrEqual(5);
    expect(doc.getNumberOfPages()).toBeLessThan(full.getNumberOfPages());
    const text = pdfText(doc);
    expect(doc.output()).toContain("/Title (My emergency list: short version)");
    for (const s of ["Know your home", "When it happens", "Wallet cards", "Start here", "The essentials"]) expect(text).toContain(s);
    expect(text).toContain("Pick an out-of-area contact and two meeting spots");
    expect(text).toContain("Water");
    expect(text).toContain("Your full list has everything else");
    expect(text).not.toContain("Keep it fresh");
    // Every row is an essential here, so no tags.
    expect(text).not.toContain("ESSENTIAL");
    // Skipped essentials stay off.
    expect(text).not.toContain("Battery or hand-crank radio");
  });

  it("prints the refresh log on its own, with food starters and no [Example] tags", () => {
    const doc = buildRefreshPdf(jsPDF, makeInput(), { fonts: FONTS });
    const text = pdfText(doc);
    expect(text).toContain("Keep it fresh");
    expect(text).toContain("Canned beans");
    expect(text).not.toContain("[Example]");
    expect(text).not.toContain("Add your food here");
    expect(doc.internal.pageSize.getWidth()).toBeGreaterThan(doc.internal.pageSize.getHeight());
  });
});

describe("PDF export in Spanish", () => {
  const es = (home?: HomeInfo) => makeInput(home, undefined, undefined, "es");

  it("writes its own words, title, and language in Spanish", () => {
    const doc = render(es(HOME), { fonts: FONTS }, "-es");
    const raw = doc.output();
    expect(raw).toContain("/Lang (es)");
    const text = pdfText(doc);
    const at = (s: string) => {
      const i = text.indexOf(s);
      expect(i, s).toBeGreaterThan(-1);
      return i;
    };
    expect(at("Mi lista de emergencia")).toBeLessThan(at("Conozca su casa"));
    expect(at("Conozca su casa")).toBeLessThan(at("Cuando ocurra"));
    expect(at("Cuando ocurra")).toBeLessThan(at("Tarjetas para la cartera"));
    expect(at("Tarjetas para la cartera")).toBeLessThan(at("Caja para quedarse en casa"));
    expect(at("Caja para quedarse en casa")).toBeLessThan(at("Manténgalo al día"));
    expect(text).toContain("Hecha el 11 de octubre de 2026.");
    expect(text).toContain("Ver esta lista en línea");
    expect(text).toContain("Tenga una copia en el refrigerador, dentro de la tapa de su caja y en cada mochila de emergencia.");
    expect(text.split("\n").filter((l) => l === "SI NOS SEPARAMOS")).toHaveLength(3);
    expect(text).toContain("NUESTROS CELULARES");
    expect(text).toContain("Mande mensajes de texto, no llame.");
    expect(text).toContain("Alertas: AC Alert");
    expect(text).toContain("En cada mochila");
    expect(text).toContain("Uno para todo el grupo");
    expect(text).toContain("ESENCIAL");
    expect(text).toContain("Página 1 de");
    expect(text).toContain("Hecho con Bay Ready");
    expect(text).not.toContain(MISSING);
    for (const en of ["Wallet cards", "IF WE GET SEPARATED", "Page 1 of", "In every bag", "Made with Bay Ready", "Keep it fresh"]) {
      expect(text, en).not.toContain(en);
    }
    // The fallback name, for a box with no name.
    expect(pdfText(render(makeInput(HOME, { adults: ["", ""], kids: [""] }, undefined, "es")))).not.toContain("Person ");
  });

  it("makes a Spanish short version", () => {
    const doc = render(es(HOME), { fonts: FONTS, short: true }, "-es-short");
    expect(doc.output()).toContain("/Title (Mi lista de emergencia: versi");
    const text = pdfText(doc);
    for (const s of ["BAY READY  |  VERSIÓN CORTA", "Empiece aquí", "Lo esencial", "Su lista completa tiene todo lo demás"]) {
      expect(text).toContain(s);
    }
    expect(text).not.toContain("ESENCIAL");
  });

  it("prints the Spanish refresh log with its own column words", () => {
    const doc = buildRefreshPdf(jsPDF, es(), { fonts: FONTS });
    if (process.env.PDF_OUT) writeFileSync(process.env.PDF_OUT.replace(/\.pdf$/, "-es-refresh.pdf"), Buffer.from(doc.output("arraybuffer")));
    const text = pdfText(doc);
    for (const s of ["Manténgalo al día", "ARTÍCULO", "CAMBIAR", "CADA REVISIÓN", "Fecha", "Próxima", "Cada 24 meses", "Según la"]) {
      expect(text).toContain(s);
    }
    expect(text).not.toMatch(/\[(Example|Ejemplo)\]/);
  });

  it("keeps Spanish accents in the Helvetica fallback", () => {
    const raw = render(es(HOME), {}).output();
    expect(raw).not.toContain("/FontFile2");
    expect(raw).toContain("(Conozca su casa) Tj");
    // Latin-1 letters are in Helvetica's set, so nothing is dropped.
    expect(raw).toMatch(/\(P.gina 1 de \d+\) Tj/);
    expect(raw).toMatch(/\(Mant.ngalo al d.a\) Tj/);
  });
});
