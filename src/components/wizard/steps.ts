import type { Metadata } from "next";

export type StepId =
  | "build"
  | "county"
  | "hazards"
  | "household"
  | "needs"
  | "have"
  | "level"
  | "home"
  | "days"
  | "car"
  | "power"
  | "start";

/** Each step's question. Doubles as the page title so screen readers hear it on navigation. */
export const STEP_TITLES: Record<StepId, string> = {
  build: "What would you like to put together?",
  county: "Which county do you live in?",
  hazards: "Which of these do you want to be ready for?",
  household: "Who are you prepping for?",
  needs: "Does anyone rely on any of these?",
  have: "Tap anything you already have at home",
  level: "How much do you want to take on right now?",
  home: "What kind of home do you live in?",
  days: "How many days do you want to cover at home?",
  car: "Do you usually have a car?",
  power: "If the power is out for days, what matters most?",
  start: "When could you take your first step?",
};

/** Each step is its own static page (/build/county) so its title is fixed at build time. */
export function stepMetadata(step: StepId): Metadata {
  return { title: `${STEP_TITLES[step]} – Bay Ready` };
}
