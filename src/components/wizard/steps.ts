import type { Metadata } from "next";

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

/** Each step's question. Doubles as the page title so screen readers hear it on navigation. */
export const STEP_TITLES: Record<StepId, string> = {
  county: "Which county do you live in?",
  hazards: "Which of these do you want to be ready for?",
  household: "Who are you prepping for?",
  needs: "Does anyone rely on any of these?",
  have: "Tap anything you already have at home",
  kit: "What would you like to put together?",
  home: "What kind of home do you live in?",
  car: "Do you usually have a car?",
  level: "How much do you want to take on right now?",
  days: "How many days do you want to cover at home?",
  power: "If the power is out for days, what matters most?",
  start: "When could you take your first step?",
};

/** Each step is its own static page (/build/county) so its title is fixed at build time. */
export function stepMetadata(step: StepId): Metadata {
  return { title: `${STEP_TITLES[step]} – Bay Ready` };
}
