/** The languages the app speaks. English is the source; every other language follows it. */
export type Lang = "en" | "es";

/** Each language's name, written in that language, for the switcher. */
export const LANGS: readonly { id: Lang; name: string }[] = [
  { id: "en", name: "English" },
  { id: "es", name: "Español" },
];

/** Where the choice is saved. Starts with "bayready:" so "Clear everything" removes it too. */
export const LANG_KEY = "bayready:lang";

export const isLang = (v: unknown): v is Lang => LANGS.some((l) => l.id === v);

/**
 * A saved choice wins. Otherwise the first browser language we speak, so a phone
 * set to Spanish opens in Spanish. Otherwise English.
 */
export function pickLang(saved: string | null, preferred: readonly string[]): Lang {
  if (isLang(saved)) return saved;
  for (const p of preferred) {
    const base = p.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return "en";
}
