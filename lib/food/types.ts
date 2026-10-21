// Shared between the /api/food server route and the app.
import type { AvoidKey } from '../profile/options';
import type { AvoidFound } from './avoidCheck';

export type Nutrients = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number;
};

// A packaged product, normalized from Open Food Facts.
export type FoodProduct = {
  barcode: string;
  name: string;
  brand: string | null;
  imageUrl: string | null;
  servingLabel: string | null; // e.g. "1 bar (40 g)"
  servingGrams: number | null;
  per100g: Nutrients | null;
  ingredientsText: string | null;
  found: AvoidFound; // every avoid category detected; the app filters by the user's own list
};

// Light search result — full details (ingredients) are fetched by barcode when opened.
export type FoodSearchHit = {
  barcode: string;
  name: string;
  brand: string | null;
  kcalPer100g: number | null;
  imageUrl: string | null;
};

export type FoodApiResponse =
  | { product: FoodProduct }
  | { hits: FoodSearchHit[] }
  | { error: 'not_found' | 'bad_request' | 'upstream_error'; message?: string };

export const MEALS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'snack', label: 'Snacks' },
] as const;
export type Meal = (typeof MEALS)[number]['value'];

export type LogSource = 'scan' | 'search' | 'manual' | 'restaurant';

export type LogEntry = {
  id: string;
  date: string; // local YYYY-MM-DD
  meal: Meal;
  name: string;
  brand: string | null;
  amountLabel: string | null; // "1.5 servings", "120 g"
  nutrients: Nutrients;
  flags: AvoidKey[]; // avoid categories this food contains (all detected, filtered by the user's list at display time)
  source: LogSource;
  barcode: string | null;
  createdAt: number;
};

export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function shiftDate(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + days));
}

export function mealForNow(d = new Date()): Meal {
  const h = d.getHours();
  return h < 11 ? 'breakfast' : h < 15 ? 'lunch' : h < 21 ? 'dinner' : 'snack';
}
