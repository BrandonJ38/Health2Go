// Shared between the /api/nearby server route and the Nearby screen. No secrets here.

export type CriterionKey = 'seedOilFree' | 'freshIngredients' | 'sugarFree' | 'noAddedSugar';

// 'verified' = from a sourced list (company announcement or certification), see verifiedSources.ts.
export type Confidence = 'verified' | 'likely' | 'unlikely' | 'unknown';

export type Evidence = {
  source: string; // e.g. "Review", "Website", "Google summary", "Category", "Seed Oil Free Certified"
  snippet: string;
  supports: boolean; // true = points toward meeting the criterion
  url?: string; // link to the source, when there is one
};

export type CriterionResult = {
  confidence: Confidence;
  evidence: Evidence[];
};

export type PriceTier = 1 | 2 | 3;

// Extra filter options (diet, cooking oil, sourcing). Unlike the four health criteria above, these
// don't affect ranking — a restaurant either shows signs of them or it doesn't.
export type AttributeKey =
  | 'vegan'
  | 'vegetarian'
  | 'plantBased'
  | 'glutenFree'
  | 'dairyFree'
  | 'ketoPaleo'
  | 'oliveOil'
  | 'avocadoOil'
  | 'animalFats'
  | 'grassFed'
  | 'organic'
  | 'wildCaught';

export type AttributeGroup = 'diet' | 'cooking' | 'sourcing';

// yes = explicit (a vegan restaurant, "cooked only in olive oil"); likely = mentioned (vegan options, uses olive oil).
export type AttributeResult = { level: 'yes' | 'likely'; evidence: Evidence[] };

export const ATTRIBUTES: { key: AttributeKey; label: string; group: AttributeGroup }[] = [
  { key: 'vegan', label: 'Vegan', group: 'diet' },
  { key: 'vegetarian', label: 'Vegetarian', group: 'diet' },
  { key: 'plantBased', label: 'Plant-based', group: 'diet' },
  { key: 'glutenFree', label: 'Gluten-free', group: 'diet' },
  { key: 'dairyFree', label: 'Dairy-free', group: 'diet' },
  { key: 'ketoPaleo', label: 'Keto / paleo', group: 'diet' },
  { key: 'oliveOil', label: 'Cooked in olive oil', group: 'cooking' },
  { key: 'avocadoOil', label: 'Avocado oil', group: 'cooking' },
  { key: 'animalFats', label: 'Tallow / butter / ghee', group: 'cooking' },
  { key: 'grassFed', label: 'Grass-fed / pasture-raised', group: 'sourcing' },
  { key: 'organic', label: 'Organic', group: 'sourcing' },
  { key: 'wildCaught', label: 'Wild-caught seafood', group: 'sourcing' },
];

export const ATTRIBUTE_GROUPS: { key: AttributeGroup; label: string }[] = [
  { key: 'diet', label: 'Diet' },
  { key: 'cooking', label: 'Cooking oil & fat' },
  { key: 'sourcing', label: 'Sourcing' },
];

export const ATTRIBUTE_KEYS = ATTRIBUTES.map((a) => a.key);

// Any filter the Nearby screen can turn on.
export type FilterKey = CriterionKey | AttributeKey;

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  address: string | null;
  distanceMeters: number | null;
  price: PriceTier | null;
  rating: number | null;
  ratingCount: number | null;
  website: string | null;
  mapsUrl: string | null;
  phone: string | null; // display format, e.g. "(512) 555-0100"
  phoneUri: string | null; // tel: link
  orderUrl: string | null; // restaurant's own online-ordering link, found on its website
  menuUrl: string | null; // menu page or PDF linked from its website
  delivery: boolean | null; // from Google; null = unknown
  takeout: boolean | null;
  criteria: Record<CriterionKey, CriterionResult>;
  attributes: Partial<Record<AttributeKey, AttributeResult>>;
  logoUrl: string | null; // chain logo or the restaurant's own site icon; null = show a letter
  score: number;
};

export type NearbyResponse = { restaurants: Restaurant[] } | { error: NearbyErrorCode; message?: string };

export type NearbyErrorCode = 'missing_key' | 'bad_request' | 'upstream_error';

export const CRITERIA: { key: CriterionKey; label: string }[] = [
  { key: 'seedOilFree', label: 'Seed-oil free' },
  { key: 'freshIngredients', label: 'Fresh ingredients' },
  { key: 'sugarFree', label: 'Sugar free' },
  { key: 'noAddedSugar', label: 'No added sugar' },
];

export const CRITERION_KEYS = CRITERIA.map((c) => c.key);
