// Daily calorie + macro targets from the user's profile. Pure functions — easy to test.
// Formula: Mifflin-St Jeor BMR × activity multiplier, adjusted for the goal, with a safe-pace limit.
import { ageFromBirthYear, type Profile } from '../profile/types';
import type { Activity, Timeline } from '../profile/options';

const ACTIVITY_MULTIPLIER: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
  athlete: 1.9,
};

const TIMELINE_WEEKS: Record<Exclude<Timeline, 'noRush'>, number> = { '1m': 4.3, '3m': 13, '6m': 26, '1y': 52 };

const KCAL_PER_KG_FAT = 7700;
const SAFE_LOSS_PER_WEEK = 0.01; // max 1% of body weight per week
const DEFAULT_LOSS_PER_WEEK = 0.005; // 0.5%/week when no target/timeline is set
const MIN_CALORIES = { male: 1500, female: 1200, unspecified: 1350 } as const;

export type Targets = {
  calories: number;
  protein: number; // grams
  carbs: number;
  fat: number;
  bmr: number;
  maintenance: number;
  notes: string[]; // shown under the target ("Assumed lightly active", pace info…)
  warning: string | null; // unsafe timeline etc.
  overridden: boolean;
};

export type TargetsResult = { ok: true; targets: Targets } | { ok: false; missing: string[] };

const round = (n: number, to = 1) => Math.round(n / to) * to;
const lb = (kg: number) => Math.round(kg * 2.20462 * 10) / 10;

export function computeTargets(p: Profile, override: number | null = null): TargetsResult {
  const age = ageFromBirthYear(p.birthYear);
  const missing = [
    p.weightKg == null && 'weight',
    p.heightCm == null && 'height',
    age == null && 'age',
  ].filter((m): m is string => !!m);
  if (missing.length) return { ok: false, missing };

  const kg = p.weightKg!;
  const sex = p.gender ?? 'unspecified';
  const sexConstant = sex === 'male' ? 5 : sex === 'female' ? -161 : -78; // unspecified = midpoint
  const bmr = 10 * kg + 6.25 * p.heightCm! - 5 * age! + sexConstant;

  const notes: string[] = [];
  let warning: string | null = null;
  if (!p.activity) notes.push('Assumed lightly active — set your activity level for a better estimate.');
  const maintenance = bmr * ACTIVITY_MULTIPLIER[p.activity ?? 'light'];

  let calories = maintenance;
  if (p.goal === 'fatLoss') {
    const safeRate = kg * SAFE_LOSS_PER_WEEK;
    let rate = kg * DEFAULT_LOSS_PER_WEEK;
    if (p.targetWeightKg != null && p.targetWeightKg < kg && p.timeline && p.timeline !== 'noRush') {
      const requested = (kg - p.targetWeightKg) / TIMELINE_WEEKS[p.timeline];
      rate = Math.min(requested, safeRate);
      if (requested > safeRate) {
        const weeks = Math.ceil((kg - p.targetWeightKg) / safeRate);
        warning =
          `Reaching your target in that time means losing ${lb(requested)} lb a week. ` +
          `A safe pace is up to ${lb(safeRate)} lb a week (1% of body weight), which gets you there in about ${weeks} weeks.`;
      }
    }
    calories = maintenance - (rate * KCAL_PER_KG_FAT) / 7;
    notes.push(`Set for losing about ${lb(rate)} lb a week.`);
  } else if (p.goal === 'muscle') {
    calories = maintenance + Math.min(maintenance * 0.1, 300);
    notes.push('Includes a small surplus for building muscle.');
  } else {
    notes.push('Set to maintain your current weight.');
  }

  const floor = MIN_CALORIES[sex];
  if (calories < floor) {
    calories = floor;
    notes.push(`Raised to a minimum of ${floor} kcal — eating less than this is hard to do safely without supervision.`);
  }

  const overridden = override != null && override > 0;
  if (overridden) {
    notes.splice(0, notes.length, `Custom target you set. Suggested for your goal: ${round(calories, 10)} kcal.`);
    calories = override!;
  }

  // Protein by body weight; then fat and carbs fill the rest, depending on eating style.
  const proteinPerKg = p.goal === 'fatLoss' ? 2.0 : p.goal === 'muscle' ? 1.8 : 1.4;
  const protein = kg * proteinPerKg;
  let carbs: number;
  let fat: number;
  if (p.eatingStyle === 'keto' || p.eatingStyle === 'carnivore') {
    carbs = p.eatingStyle === 'keto' ? 30 : 10;
    fat = Math.max((calories - protein * 4 - carbs * 4) / 9, 0);
  } else {
    fat = (calories * 0.3) / 9;
    carbs = Math.max((calories - protein * 4 - fat * 9) / 4, 0);
  }

  return {
    ok: true,
    targets: {
      calories: round(calories, 10),
      protein: round(protein),
      carbs: round(carbs),
      fat: round(fat),
      bmr: round(bmr),
      maintenance: round(maintenance, 10),
      notes,
      warning: overridden ? null : warning,
      overridden,
    },
  };
}
