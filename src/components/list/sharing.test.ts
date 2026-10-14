import { describe, expect, it } from "vitest";
import { STARTER_ANSWERS } from "@/lib/answers";
import { decodeShare, encodeShare } from "@/lib/share";
import type { Answers } from "@/lib/types";
import { hasPersonalInfo, shareCodeFrom, shouldOfferSave, withoutPersonalInfo } from "./sharing";

const personal: Answers = {
  ...STARTER_ANSWERS,
  household: { ...STARTER_ANSWERS.household, adults: 2 },
  names: { adults: ["Sam", ""], kids: [] },
  needs: ["meds", "mobility"],
};

describe("personal info in share links", () => {
  it("spots names and health needs", () => {
    expect(hasPersonalInfo(STARTER_ANSWERS)).toBe(false);
    expect(hasPersonalInfo({ ...STARTER_ANSWERS, names: { adults: ["  "], kids: [] } })).toBe(false);
    expect(hasPersonalInfo({ ...STARTER_ANSWERS, needs: "private" })).toBe(false);
    expect(hasPersonalInfo({ ...STARTER_ANSWERS, needs: [] })).toBe(false);
    expect(hasPersonalInfo({ ...STARTER_ANSWERS, names: { adults: [], kids: ["Ana"] } })).toBe(true);
    expect(hasPersonalInfo(personal)).toBe(true);
  });

  it("makes a link with no names or health needs, keeping everything else", () => {
    const states = { "stay:water": "have" as const };
    const decoded = decodeShare(encodeShare(withoutPersonalInfo(personal), states));
    expect(decoded).not.toBeNull();
    expect(decoded!.answers.names).toEqual({ adults: [], kids: [] });
    expect(decoded!.answers.needs).toBeNull();
    expect(decoded!.answers.household.adults).toBe(2);
    expect(decoded!.states["stay:water"]).toBe("have");
    expect(hasPersonalInfo(decoded!.answers)).toBe(false);
  });
});

describe("the Save your list card", () => {
  it("waits for a checkmark someone made themselves", () => {
    expect(shouldOfferSave({ shared: false, dismissed: false, states: {} })).toBe(false);
    expect(shouldOfferSave({ shared: false, dismissed: false, states: { "stay:radio": "skip" } })).toBe(false);
    expect(shouldOfferSave({ shared: false, dismissed: false, states: { "stay:radio": "have" } })).toBe(true);
    expect(shouldOfferSave({ shared: false, dismissed: false, states: { "home:alerts@1": "have" } })).toBe(true);
  });

  it("stays hidden once dismissed, and on someone else's list", () => {
    const states = { "stay:radio": "have" as const };
    expect(shouldOfferSave({ shared: false, dismissed: true, states })).toBe(false);
    expect(shouldOfferSave({ shared: true, dismissed: false, states })).toBe(false);
  });
});

describe("pasting a list link", () => {
  const code = encodeShare(STARTER_ANSWERS);

  it("finds the code in a full link or on its own", () => {
    expect(shareCodeFrom(`https://example.github.io/bayready/list/#${code}`)).toBe(code);
    expect(shareCodeFrom(`  ${code}\n`)).toBe(code);
    expect(decodeShare(shareCodeFrom(`http://localhost:3000/list#${code}`)!)).not.toBeNull();
  });

  it("ignores blanks, links without a list, and page anchors", () => {
    expect(shareCodeFrom("")).toBeNull();
    expect(shareCodeFrom("https://example.github.io/bayready/list/")).toBeNull();
    expect(shareCodeFrom("https://example.github.io/bayready/list/#first-hour")).toBeNull();
    expect(shareCodeFrom("not a link at all")).toBeNull();
  });
});
