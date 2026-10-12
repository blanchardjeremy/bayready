import type { Answers, Container, ItemState } from "./types";
import {
  BUDGETS, BUILDS, CARS, COUNTY_IDS, DAYS, HAZARD_IDS, HOMES, LEVELS, MAX_COUNT, MAX_NAME, NEED_IDS, POWERS,
  STARTS, deriveContext, normalizeAnswers,
} from "./answers";
import { buildList, slotKey } from "./buildList";
import { ITEMS } from "@/data/items";
import { HAVE_PICKS } from "@/data/havePicks";
import { SHARE_IDS } from "@/data/shareIds";

/*
 * Share links. Everything goes in the URL fragment, so nothing reaches a server.
 * They hold the answers and checkmarks, never the Know your home info or notes.
 *
 * Packed bit by bit to keep links short, but built so the app can grow without
 * breaking links people already sent:
 *
 * - An answer is its position in a fixed, append-only list (answers.ts), written
 *   with a code that grows with the number (Elias gamma), so lists can get longer.
 *   Unset costs 1 bit. A value a link doesn't know about yet reads as unset.
 * - Sets like hazards are bitmasks with their length up front, so they can grow too.
 * - Names use a 6-bit alphabet for letters, spaces, and common punctuation.
 * - A checkmark is the item's permanent number (shareIds.ts), its kit, and the
 *   person, if any. Only marks that differ from what the list shows by default
 *   are stored, sorted by item, with the gap from the last item's number.
 *
 * To add a field later, put it at the very end behind a 1-bit "present" flag.
 * Older links end before it, or in zero padding, which reads as "not present".
 */

type States = Record<string, ItemState>;
const VERSION = 1;

/** Kits in mark order, most common first since earlier ones take fewer bits. Append only. */
const MARK_KITS: Container[] = ["home", "go", "stay", "car"];
/** Mark states, most common first. Append only. */
const MARK_STATES: ItemState[] = ["have", "skip", "need"];

// ---- Bits ----------------------------------------------------------------------

class BitWriter {
  bits: number[] = [];
  write(value: number, n: number) {
    for (let i = n - 1; i >= 0; i--) this.bits.push((value >> i) & 1);
  }
  flag(on: boolean) {
    this.bits.push(on ? 1 : 0);
  }
  /** Elias gamma: 1 is "1", 2-3 take 3 bits, 4-7 take 5, and so on. n >= 1. */
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

/** One value from a list, or none. */
function writeOne<T>(w: BitWriter, list: readonly T[], v: T | null) {
  w.gamma(v === null || !list.includes(v) ? 1 : list.indexOf(v) + 2);
}
function readOne<T>(r: BitReader, list: readonly T[]): T | null {
  const n = r.gamma();
  return n === 1 ? null : (list[n - 2] ?? null);
}

/** A set, as a bitmask that stops at the last value that's in it. */
function writeSet<T>(w: BitWriter, list: readonly T[], vs: readonly T[]) {
  const len = list.findLastIndex((x) => vs.includes(x)) + 1;
  w.gamma(len + 1);
  list.slice(0, len).forEach((x) => w.flag(vs.includes(x)));
}
function readSet<T>(r: BitReader, list: readonly T[]): T[] {
  const len = r.gamma() - 1;
  const out: T[] = [];
  for (let i = 0; i < len; i++) if (r.flag() && i < list.length) out.push(list[i]);
  return out;
}

/** Household counts are almost always 0 to 2, so those take 2 bits. */
function writeCount(w: BitWriter, n: number) {
  if (n <= 2) w.write(n, 2);
  else {
    w.write(3, 2);
    w.gamma(n - 2);
  }
}
function readCount(r: BitReader) {
  const n = r.read(2);
  return n < 3 ? n : r.gamma() + 2;
}

// Letters, space, and the punctuation names tend to have fit in 6 bits. Anything
// else (accents, digits, emoji) is code 63 followed by its 16-bit UTF-16 unit.
const NAME_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ -.'&";
const ESCAPE = 63;

function writeName(w: BitWriter, name: string) {
  w.gamma(name.length + 1);
  for (const ch of name) {
    const i = NAME_CHARS.indexOf(ch);
    if (i >= 0) w.write(i, 6);
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

interface Mark {
  code: number;
  kit: number;
  /** Person index, for marks on one person's part of an item. */
  slot: number | null;
  state: ItemState;
}

/** The marks that differ from what the list would show untouched. */
function changedMarks(answers: Answers, states: States): Mark[] {
  const marks: Mark[] = [];
  for (const e of buildList(deriveContext(answers), ITEMS)) {
    const code = SHARE_IDS.indexOf(e.item.id);
    const kit = MARK_KITS.indexOf(e.container);
    if (code < 0 || kit < 0) continue;
    const def = e.item.haveKey && answers.have.includes(e.item.haveKey) ? "have" : "need";
    const shown = states[e.key] ?? def;
    if (shown !== def) marks.push({ code, kit, slot: null, state: shown });
    // A person's part shows the item's state unless it was set on its own.
    e.slots.forEach((_, i) => {
      const own = states[slotKey(e, i)];
      if (own && own !== shown) marks.push({ code, kit, slot: i, state: own });
    });
  }
  return marks.sort((a, b) => a.code - b.code || a.kit - b.kit || (a.slot ?? -1) - (b.slot ?? -1));
}

function writeMarks(w: BitWriter, marks: Mark[]) {
  w.gamma(marks.length + 1);
  let prev = 0;
  for (const m of marks) {
    w.gamma(m.code - prev + 1);
    prev = m.code;
    w.gamma(m.kit + 1);
    w.flag(m.slot !== null);
    if (m.slot !== null) w.gamma(m.slot + 1);
    w.gamma(MARK_STATES.indexOf(m.state) + 1);
  }
}

function readMarks(r: BitReader): States {
  const states: States = {};
  const count = r.gamma() - 1;
  let code = 0;
  for (let k = 0; k < count; k++) {
    code += r.gamma() - 1;
    const kit = MARK_KITS[r.gamma() - 1];
    const slot = r.flag() ? r.gamma() - 1 : null;
    const state = MARK_STATES[r.gamma() - 1];
    const id = SHARE_IDS[code];
    // Skip anything this version doesn't know. Marks for items that aren't on
    // this household's list do nothing, so they don't need checking.
    if (!id || !kit || !state) continue;
    states[slot === null ? `${kit}:${id}` : `${kit}:${id}@${slot}`] = state;
  }
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
  for (const list of [trim(a.names.adults), trim(a.names.kids)]) {
    w.gamma(list.length + 1);
    list.forEach((n) => writeName(w, n));
  }

  w.gamma(a.needs === null ? 1 : a.needs === "private" ? 2 : 3);
  if (Array.isArray(a.needs)) writeSet(w, NEED_IDS, a.needs);
  writeSet(w, HAVE_KEYS, a.have);
  writeOne(w, LEVELS, a.level);
  writeOne(w, STARTS, a.start);
  writeOne(w, BUDGETS, a.budget);
  writeOne(w, HOMES, a.home);
  writeOne(w, DAYS, a.days);
  writeOne(w, CARS, a.car);
  writeSet(w, POWERS, a.power);

  writeMarks(w, changedMarks(a, states));
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
    const [namedAdults, namedKids] = Array.from({ length: 2 }, () => {
      const n = r.gamma() - 1;
      if (n > MAX_COUNT) throw new Error("Too many names");
      return Array.from({ length: n }, () => readName(r));
    });
    const needsTag = r.gamma();
    const needs = needsTag === 1 ? null : needsTag === 2 ? "private" : readSet(r, NEED_IDS);
    const answers = normalizeAnswers({
      build, county, hazards, needs,
      household: { adults, kids, babies, dogs, cats, otherPets },
      names: { adults: namedAdults, kids: namedKids },
      have: readSet(r, HAVE_KEYS),
      level: readOne(r, LEVELS),
      start: readOne(r, STARTS),
      budget: readOne(r, BUDGETS),
      home: readOne(r, HOMES),
      days: readOne(r, DAYS),
      car: readOne(r, CARS),
      power: readSet(r, POWERS),
    });
    return { answers, states: readMarks(r) };
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
