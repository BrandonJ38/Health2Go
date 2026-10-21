import type {
  Activity,
  Allergy,
  AvoidKey,
  DaysEatOut,
  DecisionFactor,
  EatingOutChallenge,
  EatingStyle,
  FoodCategory,
  Gender,
  Goal,
  RestaurantKey,
  Timeline,
} from './options';
import { AVOID_CATEGORIES } from './options';

export type Units = 'imperial' | 'metric';
export type LocationChoice = 'granted' | 'denied' | 'skipped';

export type Profile = {
  onboardingComplete: boolean; // required quick start finished
  personalizeComplete: boolean; // optional "Personalize more" finished

  // Quick start
  goal: Goal | null;
  eatingStyle: EatingStyle | null;
  avoid: AvoidKey[];
  allergies: Allergy[];
  location: LocationChoice | null;

  // Personalize more — body stats are stored metric; `units` only controls display/input.
  units: Units;
  gender: Gender | null;
  birthYear: number | null; // stored instead of age so it stays correct over time
  heightCm: number | null;
  weightKg: number | null;
  activity: Activity | null;
  timeline: Timeline | null;
  targetWeightKg: number | null;
  daysEatOut: DaysEatOut | null;
  eatingOutChallenges: EatingOutChallenge[];
  decisionFactors: DecisionFactor[];
  favoriteRestaurants: RestaurantKey[];
  likedFoods: FoodCategory[];
  dislikedFoods: FoodCategory[];

  // Settings
  calorieTargetOverride: number | null; // user-set daily target; null = use the calculated one
  tipReminderHour: number | null; // daily tip notification hour (0–23); null = off

  updatedAt: number; // last local change (ms) — used to decide which copy wins when syncing
};

export const DEFAULT_PROFILE: Profile = {
  onboardingComplete: false,
  personalizeComplete: false,
  goal: null,
  eatingStyle: null,
  avoid: AVOID_CATEGORIES.map((c) => c.value), // all pre-checked
  allergies: [],
  location: null,
  units: 'imperial',
  gender: null,
  birthYear: null,
  heightCm: null,
  weightKg: null,
  activity: null,
  timeline: null,
  targetWeightKg: null,
  daysEatOut: null,
  eatingOutChallenges: [],
  decisionFactors: [],
  favoriteRestaurants: [],
  likedFoods: [],
  dislikedFoods: [],
  calorieTargetOverride: null,
  tipReminderHour: null,
  updatedAt: 0,
};

export const ageFromBirthYear = (birthYear: number | null): number | null =>
  birthYear == null ? null : new Date().getFullYear() - birthYear;

// --- Unit helpers -----------------------------------------------------------

export const cmToFtIn = (cm: number) => {
  const totalIn = Math.round(cm / 2.54);
  return { ft: Math.floor(totalIn / 12), inches: totalIn % 12 };
};
export const ftInToCm = (ft: number, inches: number) => Math.round((ft * 12 + inches) * 2.54 * 10) / 10;
export const kgToLb = (kg: number) => Math.round(kg * 2.20462);
export const lbToKg = (lb: number) => Math.round((lb / 2.20462) * 10) / 10;

export function formatHeight(cm: number | null, units: Units): string | null {
  if (cm == null) return null;
  if (units === 'metric') return `${Math.round(cm)} cm`;
  const { ft, inches } = cmToFtIn(cm);
  return `${ft}′ ${inches}″`;
}

export function formatWeight(kg: number | null, units: Units): string | null {
  if (kg == null) return null;
  return units === 'metric' ? `${kg} kg` : `${kgToLb(kg)} lb`;
}
