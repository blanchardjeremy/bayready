import type { Metadata } from "next";
import { wizard } from "@/i18n/en/wizard";

export type StepId =
  | "county"
  | "hazards"
  | "household"
  | "needs"
  | "have"
  | "kit"
  | "home"
  | "car"
  | "level"
  | "days"
  | "power"
  | "start";

/**
 * The order people see. They describe their situation before choosing a kit, so the
 * kit step can make a suggestion. Each step's URL is /build/<id>, and /build itself
 * shows the first step.
 */
export const MAIN_STEPS: StepId[] = ["county", "hazards", "household", "needs", "have", "kit", "home", "car", "level"];
/** Only for Advanced, between the level and the last step. */
export const ADVANCED_STEPS: StepId[] = ["days", "power"];
export const LAST_STEP: StepId = "start";

/**
 * Each step's question, in English. Doubles as the page title so screen readers hear it
 * on navigation. The words live in src/i18n/en/wizard.ts; the wizard shows the visitor's
 * language and updates the tab title to match.
 */
export const STEP_TITLES: Record<StepId, string> = wizard.titles;

/** Each step is its own static page (/build/county) so its title is fixed at build time. */
export function stepMetadata(step: StepId): Metadata {
  return { title: wizard.pageTitle(STEP_TITLES[step]) };
}
