import type { Answers, ItemState } from "./types";
import {
  BUDGETS, BUILDS, CARS, COUNTY_IDS, DAYS, HAZARD_IDS, HOMES, MAX_COUNT, MAX_NAME, NEED_IDS, POWERS, STARTS,
  deriveContext, normalizeAnswers,
} from "./answers";
import { buildList, slotKey } from "./buildList";
import { ITEMS } from "@/data/items";
import { HAVE_PICKS } from "@/data/havePicks";

/*
 * Share links. Everything goes in the URL fragment, so nothing reaches a server,
 * packed bit by bit to keep links short:
 *
 * - Each answer is a position in a fixed list (answers.ts), using as few bits as
 *   that list needs. Sets like hazards are bitmasks.
 * - Names use a 6-bit alphabet for letters, spaces, and common punctuation.
 * - Checkmarks aren't stored by name. Both ends rebuild the same list from the
 *   answers, so a mark is just its position on that list. Only marks that differ
 *   from the default are stored, either as gaps between them (few marks) or as a
 *   bitmap (lots), whichever is shorter.
 * - A one-byte fingerprint of the item list guards against a link made before the
 *   list changed. If it doesn't match, the answers still load but the marks don't.
 */

type States = Record<string, ItemState>;
const VERSION = 1;

// ---- Bits ----------------------------------------------------------------------

class BitWriter {
  bits: number[] = [];
  write(value: number, n: number) {
    for (let i = n - 1; i >= 0; i--) this.bits.push((value >> i) & 1);
  }
  flag(on: boolean) {
    this.bits.push(on ? 1 : 0);
  }
  /** Elias gamma: short for small numbers, no fixed limit. n >= 1. */
  gamma(n: number) {
    const len = Math.floor(Math.log2(n));
    this.write(0, len);
    this.write(n, len + 1);
  }
  bytes() {
    const out = new Uint8Array(Math.ceil(this.bits.length / 8));
    this.bits.forEach((b, i) => (out[i >> 3] |= b << (7 - (i & 7))));
    return out;
  }
}

class BitReader {
  private i = 0;
  constructor(private data: Uint8Array) {}
  bit() {
    if (this.i >= this.data.length * 8) throw new Error("Share link ended early");
    const b = (this.data[this.i >> 3] >> (7 - (this.i & 7))) & 1;
    this.i++;
    return b;
  }
  read(n: number) {
    let v = 0;
    for (let k = 0; k < n; k++) v = (v << 1) | this.bit();
    return v;
  }
  flag() {
    return this.bit() === 1;
  }
  gamma() {
    let len = 0;
    while (this.bit() === 0) if (++len > 24) throw new Error("Bad number in share link");
    return (1 << len) | this.read(len);
  }
}

const bitsFor = (count: number) => Math.ceil(Math.log2(count + 1));

/** One value from a list, or none: 0 means unset. */
function writeOne<T>(w: BitWriter, list: readonly T[], v: T | null) {
  w.write(v === null ? 0 : list.indexOf(v) + 1, bitsFor(list.length));
}
function readOne<T>(r: BitReader, list: readonly T[]): T | null {
  const i = r.read(bitsFor(list.length));
  return i === 0 ? null : (list[i - 1] ?? null);
}

function writeSet<T>(w: BitWriter, list: readonly T[], vs: readonly T[]) {
  list.forEach((x) => w.flag(vs.includes(x)));
}
function readSet<T>(r: BitReader, list: readonly T[]): T[] {
  return list.filter(() => r.flag());
}

/** Household counts are almost always 0 to 2, so those take 2 bits. */
function writeCount(w: BitWriter, n: number) {
  if (n <= 2) w.write(n, 2);
  else {
    w.write(3, 2);
    w.write(Math.min(n, MAX_COUNT), bitsFor(MAX_COUNT));
  }
}
function readCount(r: BitReader) {
  const n = r.read(2);
  return n < 3 ? n : r.read(bitsFor(MAX_COUNT));
}

// Letters, space, and the punctuation names tend to have fit in 6 bits. Anything
// else (accents, digits, emoji) is code 63 followed by its 16-bit UTF-16 unit.
const NAME_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ -.'&";
const ESCAPE = 63;

function writeName(w: BitWriter, name: string) {
  w.gamma(name.length + 1);
  for (const ch of name) {
    const i = NAME_CHARS.indexOf(ch);
    if (i >= 0 && i < ESCAPE) w.write(i, 6);
    else
      for (let k = 0; k < ch.length; k++) {
        w.write(ESCAPE, 6);
        w.write(ch.charCodeAt(k), 16);
      }
  }
}
function readName(r: BitReader) {
  const len = r.gamma() - 1;
  if (len > MAX_NAME * 2) throw new Error("Name too long");
  let s = "";
  while (s.length < len) {
    const c = r.read(6);
    s += c === ESCAPE ? String.fromCharCode(r.read(16)) : (NAME_CHARS[c] ?? "");
  }
  return s;
}

// ---- Checkmarks ----------------------------------------------------------------

const ORDER: ItemState[] = ["need", "have", "skip"];
/** The two states other than the default, so a changed mark needs one bit to say which. */
const others = (def: ItemState) => ORDER.filter((s) => s !== def);

/**
 * Every checkmark spot on this household's list, in order: each item, then each
 * person's part of it. Both ends of a link build the same list from the answers.
 */
function markSpots(answers: Answers) {
  const spots: { key: string; parent?: string; haveKey?: string }[] = [];
  for (const e of buildList(deriveContext(answers), ITEMS)) {
    spots.push({ key: e.key, haveKey: e.item.haveKey });
    e.slots.forEach((_, i) => spots.push({ key: slotKey(e, i), parent: e.key }));
  }
  return spots;
}

/** One byte that changes when items are added, removed, or reordered. */
function itemsFingerprint() {
  let h = 0x811c9dc5;
  for (const item of ITEMS) {
    for (const ch of `${item.id}:${item.containers.join(",")};`) {
      h ^= ch.charCodeAt(0);
      h = Math.imul(h, 0x01000193);
    }
  }
  return (h ^ (h >>> 8) ^ (h >>> 16) ^ (h >>> 24)) & 0xff;
}

function writeMarks(w: BitWriter, answers: Answers, states: States) {
  // What each spot shows, and what it would show untouched.
  const shown: Record<string, ItemState> = {};
  const marks: { pos: number; alt: number }[] = [];
  markSpots(answers).forEach((spot, pos) => {
    const def: ItemState = spot.parent
      ? shown[spot.parent]
      : spot.haveKey && answers.have.includes(spot.haveKey)
        ? "have"
        : "need";
    const now = states[spot.key] ?? def;
    shown[spot.key] = now;
    if (now !== def) marks.push({ pos, alt: others(def).indexOf(now) });
  });
  const total = Object.keys(shown).length;

  w.flag(marks.length > 0);
  if (marks.length === 0) return;
  w.write(itemsFingerprint(), 8);

  const gaps = new BitWriter();
  gaps.gamma(marks.length);
  let prev = -1;
  for (const m of marks) {
    gaps.gamma(m.pos - prev);
    gaps.write(m.alt, 1);
    prev = m.pos;
  }
  const bitmapSize = total + marks.length;
  w.flag(gaps.bits.length <= bitmapSize);
  if (gaps.bits.length <= bitmapSize) w.bits.push(...gaps.bits);
  else {
    let next = 0;
    for (let pos = 0; pos < total; pos++) {
      const hit = marks[next]?.pos === pos;
      w.flag(hit);
      if (hit) w.write(marks[next++].alt, 1);
    }
  }
}

function readMarks(r: BitReader, answers: Answers): States {
  // The marks come last, so a problem here still leaves the answers usable.
  try {
    return readMarksOrThrow(r, answers);
  } catch {
    return {};
  }
}

function readMarksOrThrow(r: BitReader, answers: Answers): States {
  if (!r.flag()) return {};
  const fingerprint = r.read(8);
  const spots = markSpots(answers);
  const alts = new Map<number, number>();
  if (r.flag()) {
    // Gaps between marks.
    const count = r.gamma();
    let pos = -1;
    for (let k = 0; k < count; k++) {
      pos += r.gamma();
      alts.set(pos, r.read(1));
    }
  } else {
    // A bit for every spot.
    for (let pos = 0; pos < spots.length; pos++) if (r.flag()) alts.set(pos, r.read(1));
  }
  // Made from a different version of the list: the positions would point at the wrong items.
  if (fingerprint !== itemsFingerprint()) return {};

  const shown: Record<string, ItemState> = {};
  const states: States = {};
  spots.forEach((spot, pos) => {
    const def: ItemState = spot.parent
      ? shown[spot.parent]
      : spot.haveKey && answers.have.includes(spot.haveKey)
        ? "have"
        : "need";
    const alt = alts.get(pos);
    const now = alt === undefined ? def : others(def)[alt];
    if (alt !== undefined) states[spot.key] = now;
    shown[spot.key] = now;
  });
  return states;
}

// ---- Links ---------------------------------------------------------------------

const HAVE_KEYS = HAVE_PICKS.map((p) => p.key);

export function encodeShare(answers: Answers, states: States = {}): string {
  const a = normalizeAnswers(answers);
  const w = new BitWriter();
  w.write(VERSION, 2);
  writeOne(w, BUILDS, a.build);
  writeOne(w, COUNTY_IDS, a.county);
  writeSet(w, HAZARD_IDS, a.hazards);
  const h = a.household;
  [h.adults, h.kids, h.babies, h.dogs, h.cats, h.otherPets].forEach((n) => writeCount(w, n));

  // Trailing blank names are the same as no name, so they're left off.
  const trim = (names: string[]) => names.slice(0, names.findLastIndex((n) => n !== "") + 1);
  const adults = trim(a.names.adults);
  const kids = trim(a.names.kids);
  w.flag(adults.length + kids.length > 0);
  if (adults.length + kids.length > 0)
    for (const list of [adults, kids]) {
      w.gamma(list.length + 1);
      list.forEach((n) => writeName(w, n));
    }

  w.write(a.needs === null ? 0 : a.needs === "private" ? 1 : 2, 2);
  if (Array.isArray(a.needs)) writeSet(w, NEED_IDS, a.needs);
  w.flag(a.have.length > 0);
  if (a.have.length > 0) writeSet(w, HAVE_KEYS, a.have);
  w.flag(a.level === "advanced");
  writeOne(w, STARTS, a.start);
  writeOne(w, BUDGETS, a.budget);
  const extras = a.home !== null || a.days !== null || a.car !== null || a.power.length > 0;
  w.flag(extras);
  if (extras) {
    writeOne(w, HOMES, a.home);
    writeOne(w, DAYS, a.days);
    writeOne(w, CARS, a.car);
    writeSet(w, POWERS, a.power);
  }

  writeMarks(w, a, states);
  return toBase64Url(w.bytes());
}

export function decodeShare(hash: string): { answers: Answers; states: States } | null {
  try {
    const r = new BitReader(fromBase64Url(hash.replace(/^#/, "")));
    if (r.read(2) !== VERSION) return null;
    const build = readOne(r, BUILDS);
    const county = readOne(r, COUNTY_IDS);
    const hazards = readSet(r, HAZARD_IDS);
    const [adults, kids, babies, dogs, cats, otherPets] = Array.from({ length: 6 }, () => readCount(r));
    const names = { adults: [] as string[], kids: [] as string[] };
    if (r.flag())
      for (const role of ["adults", "kids"] as const) {
        const n = r.gamma() - 1;
        if (n > MAX_COUNT) return null;
        names[role] = Array.from({ length: n }, () => readName(r));
      }
    const needsTag = r.read(2);
    const needs = needsTag === 0 ? null : needsTag === 1 ? "private" : readSet(r, NEED_IDS);
    const have = r.flag() ? readSet(r, HAVE_KEYS) : [];
    const level = r.flag() ? "advanced" : "basics";
    const start = readOne(r, STARTS);
    const budget = readOne(r, BUDGETS);
    const extras = r.flag();
    const answers = normalizeAnswers({
      build, county, hazards, names, needs, have, level, start, budget,
      household: { adults, kids, babies, dogs, cats, otherPets },
      home: extras ? readOne(r, HOMES) : null,
      days: extras ? readOne(r, DAYS) : null,
      car: extras ? readOne(r, CARS) : null,
      power: extras ? readSet(r, POWERS) : [],
    });
    return { answers, states: readMarks(r, answers) };
  } catch {
    return null;
  }
}

function toBase64Url(bytes: Uint8Array) {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string) {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
