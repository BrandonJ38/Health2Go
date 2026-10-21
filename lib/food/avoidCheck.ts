// Flags avoid-list ingredients in a product's ingredient list. Pure — shared by server and app.
import type { AvoidKey } from '../profile/options';

export type AvoidFound = Partial<Record<AvoidKey, string[]>>; // category → matched ingredient names
export type Rating = 'good' | 'okay' | 'avoid';

// Ingredient names to look for (lower-case). Kept explicit so each flag is explainable.
const INGREDIENTS: Record<Exclude<AvoidKey, 'ultraProcessed'>, string[]> = {
  seedOils: [
    'canola oil', 'canola', 'rapeseed oil', 'rapeseed', 'soybean oil', 'soya oil', 'soy oil', 'sunflower oil',
    'sunflower seed oil', 'safflower oil', 'corn oil', 'cottonseed oil', 'grapeseed oil', 'grape seed oil',
    'rice bran oil', 'vegetable oil', 'vegetable oils',
  ],
  addedSugar: [
    'high fructose corn syrup', 'corn syrup solids', 'corn syrup', 'glucose-fructose syrup', 'glucose syrup',
    'fructose syrup', 'maltodextrin', 'dextrose', 'sucrose', 'cane sugar', 'brown sugar', 'invert sugar',
    'raw sugar', 'coconut sugar', 'evaporated cane juice', 'cane juice', 'brown rice syrup', 'rice syrup',
    'malt syrup', 'barley malt', 'maltose', 'agave syrup', 'agave nectar', 'molasses', 'fruit juice concentrate',
    'sugar',
  ],
  artificialSweeteners: [
    'sucralose', 'aspartame', 'acesulfame potassium', 'acesulfame k', 'acesulfame', 'saccharin', 'neotame',
    'advantame', 'cyclamate', 'red 40', 'red no. 40', 'allura red', 'yellow 5', 'yellow no. 5', 'tartrazine',
    'yellow 6', 'yellow no. 6', 'sunset yellow', 'blue 1', 'blue no. 1', 'brilliant blue', 'caramel color',
  ],
  alcohol: ['alcohol', 'ethanol', 'wine', 'beer', 'rum', 'vodka', 'whiskey', 'bourbon', 'brandy', 'liqueur'],
  transFats: ['partially hydrogenated', 'hydrogenated vegetable oil', 'shortening'],
};

// Open Food Facts additive tags (E-numbers) for sweeteners and dyes.
const ADDITIVE_TAGS: Record<string, string> = {
  'en:e950': 'acesulfame K',
  'en:e951': 'aspartame',
  'en:e952': 'cyclamate',
  'en:e954': 'saccharin',
  'en:e955': 'sucralose',
  'en:e961': 'neotame',
  'en:e969': 'advantame',
  'en:e102': 'tartrazine (yellow 5)',
  'en:e110': 'sunset yellow (yellow 6)',
  'en:e129': 'allura red (red 40)',
  'en:e133': 'brilliant blue (blue 1)',
  'en:e150d': 'caramel color',
};

// Phrases that mention an ingredient without it being one ("no added sugar", "sugar alcohol").
const EXCLUSIONS: Partial<Record<AvoidKey, RegExp>> = {
  addedSugar: /\b(no|without|free of|zero) (added )?sugars?\b|\bsugar[- ]free\b|\bsugar alcohols?\b/gi,
  alcohol: /\bsugar alcohols?\b|\balcohol[- ]free\b|\bcetyl alcohol\b|\bbenzyl alcohol\b/gi,
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export type ProductFacts = {
  ingredientsText?: string | null;
  additivesTags?: string[] | null;
  novaGroup?: number | null;
  transFat100g?: number | null;
  categoriesTags?: string[] | null;
};

export function findAvoidIngredients(facts: ProductFacts): AvoidFound {
  const found: AvoidFound = {};
  const add = (key: AvoidKey, name: string) => {
    const list = (found[key] ??= []);
    if (!list.includes(name)) list.push(name);
  };

  const raw = (facts.ingredientsText ?? '').toLowerCase().replace(/_/g, '');
  for (const [key, names] of Object.entries(INGREDIENTS) as [AvoidKey, string[]][]) {
    let text = raw;
    const exclusion = EXCLUSIONS[key];
    if (exclusion) text = text.replace(exclusion, ' ');
    for (const name of names) {
      // Longer names first in each list, so "corn syrup" isn't also reported as "sugar"-style duplicates.
      const re = new RegExp(`\\b${escapeRegex(name)}\\b`, 'i');
      if (re.test(text)) {
        if ((found[key] ?? []).some((n) => n.includes(name))) continue;
        add(key, name);
        text = text.replace(new RegExp(`\\b${escapeRegex(name)}\\b`, 'gi'), ' ');
      }
    }
  }

  for (const tag of facts.additivesTags ?? []) {
    const name = ADDITIVE_TAGS[tag];
    if (name) add('artificialSweeteners', name);
  }
  if (facts.novaGroup === 4) add('ultraProcessed', 'ultra-processed (NOVA group 4)');
  if (facts.transFat100g != null && facts.transFat100g > 0) add('transFats', `${facts.transFat100g} g trans fat per 100 g`);
  if ((facts.categoriesTags ?? []).includes('en:alcoholic-beverages')) add('alcohol', 'alcoholic beverage');

  return found;
}

// Only the categories the user chose to avoid count toward the rating.
export function rateFood(found: AvoidFound, userAvoid: readonly AvoidKey[]): { rating: Rating; flagged: AvoidKey[] } {
  const flagged = userAvoid.filter((k) => (found[k]?.length ?? 0) > 0);
  const rating: Rating = flagged.length === 0 ? 'good' : flagged.length === 1 && !flagged.includes('transFats') ? 'okay' : 'avoid';
  return { rating, flagged };
}
