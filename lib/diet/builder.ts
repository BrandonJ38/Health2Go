// Rules-based Diet Builder: turns profile answers into an "eat more" list and a "limit or avoid" list.
// Pure function — no AI, every result is explainable.
import { ALLERGIES, AVOID_CATEGORIES, EATING_STYLES, FOOD_CATEGORIES, labelFor, type AvoidKey, type EatingStyle } from '../profile/options';
import type { Profile } from '../profile/types';
import { ALLERGY_TAGS, FOODS, type Food, type FoodGroup, type Tag } from './foods';

export type Recommended = Food & { liked: boolean; note?: string };
export type Limit = { label: string; reason: string; article?: string };

export type DietPlan = {
  eatMore: { group: FoodGroup; foods: Recommended[] }[];
  limit: Limit[];
  focus: string[]; // short guidance lines for the user's goal + style
};

// What each eating style excludes, and foods it keeps only in moderation.
const STYLE_EXCLUDES: Record<EatingStyle, Tag[]> = {
  none: [],
  keto: ['starchy', 'sweetFruit', 'grain'],
  paleo: ['grain', 'legume', 'dairy', 'peanut', 'soy'],
  carnivore: [], // handled separately — animal foods only
  mediterranean: [],
  vegetarian: ['meat', 'fish', 'shellfish'],
  vegan: ['meat', 'fish', 'shellfish', 'egg', 'dairy'],
};

const STYLE_LIMIT_TEXT: Partial<Record<EatingStyle, Limit[]>> = {
  keto: [{ label: 'Grains, potatoes, rice and sugary fruit', reason: 'Too many carbs to stay in ketosis' }],
  paleo: [{ label: 'Grains, legumes, dairy, peanuts and soy', reason: 'Not part of a paleo diet' }],
  carnivore: [{ label: 'Plant foods', reason: 'Carnivore focuses on meat, fish, eggs and animal fats' }],
  vegetarian: [{ label: 'Meat and seafood', reason: 'Vegetarian' }],
  vegan: [{ label: 'All animal products', reason: 'Vegan' }],
};

const ANIMAL_TAGS: Tag[] = ['meat', 'fish', 'shellfish', 'egg', 'dairy'];

const AVOID_ARTICLE: Partial<Record<AvoidKey, string>> = {
  seedOils: 'seed-oils',
  addedSugar: 'added-sugar',
  ultraProcessed: 'ultra-processed',
  transFats: 'trans-fats',
  artificialSweeteners: 'artificial-sweeteners',
  alcohol: 'alcohol',
};

const AVOID_REASON: Record<AvoidKey, string> = {
  seedOils: 'Cook with olive oil, avocado oil, butter or tallow instead',
  addedSugar: 'Check labels — sugar hides in sauces, dressings and "healthy" snacks',
  ultraProcessed: 'Build meals from whole foods; use the scanner on packaged food',
  artificialSweeteners: 'Including sucralose, aspartame and artificial colors',
  alcohol: 'On your avoid list',
  transFats: 'Partially hydrogenated oils, some fried and baked goods',
};

export function buildDietPlan(p: Profile): DietPlan {
  const style = p.eatingStyle ?? 'none';
  const allergyTags = p.allergies.flatMap((a) => ALLERGY_TAGS[a]);
  const excluded = new Set<Tag>([...STYLE_EXCLUDES[style], ...allergyTags]);

  const foods = FOODS.filter((f) => {
    if (f.tags.some((t) => excluded.has(t))) return false;
    if (style === 'carnivore' && !f.tags.some((t) => ANIMAL_TAGS.includes(t))) return false;
    // Disliked: drop foods whose every category is disliked (e.g. "pork"), keep mixed ones.
    if (f.categories.length && f.categories.every((c) => p.dislikedFoods.includes(c))) return false;
    return true;
  });

  const goalFirst = (f: Food) =>
    p.goal === 'fatLoss' ? (f.tags.includes('highVolume') || f.tags.includes('highProtein') ? 0 : 1) : p.goal === 'muscle' ? (f.tags.includes('highProtein') ? 0 : 1) : 0;

  const recommended: Recommended[] = foods
    .map((f) => {
      const liked = f.categories.some((c) => p.likedFoods.includes(c));
      const note =
        style === 'mediterranean' && f.tags.includes('redMeat')
          ? 'In moderation on a Mediterranean diet'
          : style === 'mediterranean' && (f.tags.includes('fish') || f.id === 'evoo' || f.id === 'lentils' || f.id === 'beans')
            ? 'A Mediterranean staple'
            : undefined;
      return { ...f, liked, note };
    })
    .sort((a, b) => goalFirst(a) - goalFirst(b) || Number(b.liked) - Number(a.liked));

  const order: FoodGroup[] = ['protein', 'vegetables', 'fats', 'carbs', 'fruit', 'dairy'];
  const eatMore = order
    .map((group) => ({ group, foods: recommended.filter((f) => f.group === group) }))
    .filter((g) => g.foods.length > 0);

  const limit: Limit[] = [
    ...p.avoid.map((k) => ({ label: labelFor(AVOID_CATEGORIES, k) ?? k, reason: AVOID_REASON[k], article: AVOID_ARTICLE[k] })),
    ...(STYLE_LIMIT_TEXT[style] ?? []),
    ...p.allergies.map((a) => ({ label: labelFor(ALLERGIES, a) ?? a, reason: 'Allergy or restriction' })),
    ...p.dislikedFoods.map((d) => ({ label: labelFor(FOOD_CATEGORIES, d) ?? d, reason: "You don't like it" })),
  ];

  const focus: string[] = [];
  if (p.goal === 'fatLoss') focus.push('Build each meal around protein and vegetables — they keep you full on fewer calories.');
  if (p.goal === 'muscle') focus.push('Get protein at every meal, and put most of your carbs around training.');
  if (p.goal === 'longevity') focus.push('Prioritize fish, vegetables, berries and olive oil; keep fried and ultra-processed food rare.');
  if (p.goal === 'energy') focus.push('Pair carbs with protein and fat to avoid energy crashes; cut sweet drinks first.');
  if (p.goal === 'general' || !p.goal) focus.push('Fill half your plate with vegetables, a quarter with protein, a quarter with whole-food carbs.');
  if (style !== 'none') focus.push(`Filtered for ${labelFor(EATING_STYLES, style)?.toLowerCase()}.`);

  return { eatMore, limit, focus };
}
