// The template registry. The Gallery shows every entry, so a new template
// appears there as soon as it is listed here. `npm run template:new` adds the
// import and the entry for you at the two markers below; keep the markers.
import type { ComponentType } from "react";
import { DailyBonus } from "./DailyBonus";
import { LevelUp } from "./LevelUp";
import { OfferStore } from "./OfferStore";
import { WeeklyChallenge } from "./WeeklyChallenge";
// @templates:imports

export type TemplateEntry = {
  id: string;
  name: string;
  /** the request this template answers, in one or two sentences */
  brief: string;
  Component: ComponentType;
};

export const TEMPLATES: TemplateEntry[] = [
  {
    id: "DailyBonus",
    name: "Daily bonus",
    brief: "A seven-day streak. Collecting today's reward opens that day's chest.",
    Component: DailyBonus,
  },
  {
    id: "LevelUp",
    name: "Level up",
    brief: "A level bar that fills with XP. Every new level pays a chest.",
    Component: LevelUp,
  },
  {
    id: "OfferStore",
    name: "Coin store",
    brief: "Three coin packs side by side, the middle one featured, with computed badges.",
    Component: OfferStore,
  },
  {
    id: "WeeklyChallenge",
    name: "Weekly challenge",
    brief: "Weekly challenge: spin 50 times this week to open a chest. Show the progress, and let the player start the next week after collecting.",
    Component: WeeklyChallenge,
  },
  // @templates:entries
];
