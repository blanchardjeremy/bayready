import type { Lang } from "./lang";
import { common as enCommon } from "./en/common";
import { pages as enPages } from "./en/pages";
import { wizard as enWizard } from "./en/wizard";
import { list as enList } from "./en/list";
import { exports as enExports } from "./en/exports";
import { common as esCommon } from "./es/common";
import { pages as esPages } from "./es/pages";
import { wizard as esWizard } from "./es/wizard";
import { list as esList } from "./es/list";
import { exports as esExports } from "./es/exports";

/*
 * Every word the app shows, by language. English (./en) is the source. Each
 * other language (./es) has a file per area with exactly the same keys, which
 * TypeScript checks. Item content (names, why, tips) lives in ./es/items.ts.
 */

const en = { common: enCommon, pages: enPages, wizard: enWizard, list: enList, exports: enExports };
export type Messages = typeof en;

const MESSAGES: Record<Lang, Messages> = {
  en,
  es: { common: esCommon, pages: esPages, wizard: esWizard, list: esList, exports: esExports } as Messages,
};

export function messagesFor(lang: Lang): Messages {
  return MESSAGES[lang];
}
