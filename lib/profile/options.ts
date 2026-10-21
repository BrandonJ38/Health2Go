// Answer options for onboarding and Profile. `value` is what gets stored; `label` is what users see.

export type Option<T extends string = string> = { value: T; label: string; description?: string; image?: string };

// Restaurant logos come from each brand's site icon via Google's favicon service (no files bundled).
// Before a public launch, review brand-logo usage (identifying a restaurant is generally fine; implying endorsement is not).
const logo = (domain: string) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

export const GOALS = [
  { value: 'longevity', label: 'Live longer & healthier', description: 'Eat and live for the long run' },
  { value: 'fatLoss', label: 'Lose fat', description: 'Lean out without crash dieting' },
  { value: 'muscle', label: 'Build muscle', description: 'Fuel training and recovery' },
  { value: 'energy', label: 'More energy', description: 'Fewer crashes, better focus' },
  { value: 'general', label: 'General health', description: 'Just eat better overall' },
] as const satisfies readonly Option[];
export type Goal = (typeof GOALS)[number]['value'];

export const EATING_STYLES = [
  { value: 'none', label: 'No preference' },
  { value: 'keto', label: 'Keto / low carb' },
  { value: 'paleo', label: 'Paleo' },
  { value: 'carnivore', label: 'Carnivore' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
] as const satisfies readonly Option[];
export type EatingStyle = (typeof EATING_STYLES)[number]['value'];

// The default avoid list — all pre-checked during onboarding.
export const AVOID_CATEGORIES = [
  { value: 'seedOils', label: 'Seed oils', description: 'Canola, soybean, sunflower, corn oil…' },
  { value: 'addedSugar', label: 'Added & refined sugar', description: 'Including HFCS, maltodextrin…' },
  { value: 'ultraProcessed', label: 'Ultra-processed foods', description: 'Packaged, industrially made foods' },
  { value: 'artificialSweeteners', label: 'Artificial sweeteners & additives', description: 'Sucralose, aspartame, dyes…' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'transFats', label: 'Trans fats', description: 'Partially hydrogenated oils' },
] as const satisfies readonly Option[];
export type AvoidKey = (typeof AVOID_CATEGORIES)[number]['value'];

export const ALLERGIES = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'peanuts', label: 'Peanuts' },
  { value: 'treeNuts', label: 'Tree nuts' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'fish', label: 'Fish' },
  { value: 'soy', label: 'Soy' },
  { value: 'sesame', label: 'Sesame' },
] as const satisfies readonly Option[];
export type Allergy = (typeof ALLERGIES)[number]['value'];

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'unspecified', label: 'Prefer not to say' },
] as const satisfies readonly Option[];
export type Gender = (typeof GENDERS)[number]['value'];

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Mostly sitting', description: 'Desk job, little exercise' },
  { value: 'light', label: 'Lightly active', description: 'Exercise 1–3 days a week' },
  { value: 'moderate', label: 'Moderately active', description: 'Exercise 3–5 days a week' },
  { value: 'very', label: 'Very active', description: 'Hard exercise 6–7 days a week' },
  { value: 'athlete', label: 'Athlete', description: 'Training twice a day or physical job' },
] as const satisfies readonly Option[];
export type Activity = (typeof ACTIVITY_LEVELS)[number]['value'];

export const TIMELINES = [
  { value: '1m', label: '1 month' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
  { value: '1y', label: '1 year' },
  { value: 'noRush', label: 'No rush — steady progress' },
] as const satisfies readonly Option[];
export type Timeline = (typeof TIMELINES)[number]['value'];

export const DAYS_EAT_OUT = [
  { value: '0', label: 'Rarely' },
  { value: '1', label: '1–2 days' },
  { value: '3', label: '3–4 days' },
  { value: '5', label: '5–6 days' },
  { value: '7', label: 'Every day' },
] as const satisfies readonly Option[];
export type DaysEatOut = (typeof DAYS_EAT_OUT)[number]['value'];

export const EATING_OUT_CHALLENGES = [
  { value: 'unknownHealthy', label: "I don't know what's actually healthy" },
  { value: 'hiddenIngredients', label: "Menus don't say what oils or ingredients they use" },
  { value: 'fewOptions', label: 'Few healthy places near me' },
  { value: 'price', label: 'Healthy options cost more' },
  { value: 'cravings', label: 'Cravings win' },
  { value: 'social', label: 'Eating with friends or family' },
  { value: 'time', label: 'No time — I grab whatever is fast' },
] as const satisfies readonly Option[];
export type EatingOutChallenge = (typeof EATING_OUT_CHALLENGES)[number]['value'];

export const DECISION_FACTORS = [
  { value: 'cravings', label: "Whatever I'm craving" },
  { value: 'health', label: "What's healthiest" },
  { value: 'price', label: 'Price' },
  { value: 'convenience', label: "What's closest or fastest" },
  { value: 'reviews', label: 'Reviews and ratings' },
  { value: 'habit', label: 'My usual spots' },
] as const satisfies readonly Option[];
export type DecisionFactor = (typeof DECISION_FACTORS)[number]['value'];

// Popular US chains, fast food included — used for "best order" guides (build step 4).
export const RESTAURANTS = [
  { value: 'mcdonalds', label: "McDonald's", image: logo('mcdonalds.com') },
  { value: 'chickfila', label: 'Chick-fil-A', image: logo('chick-fil-a.com') },
  { value: 'starbucks', label: 'Starbucks', image: logo('starbucks.com') },
  { value: 'tacobell', label: 'Taco Bell', image: logo('tacobell.com') },
  { value: 'wendys', label: "Wendy's", image: logo('wendys.com') },
  { value: 'burgerking', label: 'Burger King', image: logo('bk.com') },
  { value: 'subway', label: 'Subway', image: logo('subway.com') },
  { value: 'chipotle', label: 'Chipotle', image: logo('chipotle.com') },
  { value: 'panera', label: 'Panera Bread', image: logo('panerabread.com') },
  { value: 'sweetgreen', label: 'Sweetgreen', image: logo('sweetgreen.com') },
  { value: 'cava', label: 'CAVA', image: logo('cava.com') },
  { value: 'fiveguys', label: 'Five Guys', image: logo('fiveguys.com') },
  { value: 'pandaexpress', label: 'Panda Express', image: logo('pandaexpress.com') },
  { value: 'dominos', label: "Domino's", image: logo('dominos.com') },
  { value: 'popeyes', label: 'Popeyes', image: logo('popeyes.com') },
  { value: 'raisingcanes', label: "Raising Cane's", image: logo('raisingcanes.com') },
  { value: 'innout', label: 'In-N-Out', image: logo('in-n-out.com') },
  { value: 'shakeshack', label: 'Shake Shack', image: logo('shakeshack.com') },
  { value: 'truefoodkitchen', label: 'True Food Kitchen', image: logo('truefoodkitchen.com') },
  { value: 'olivegarden', label: 'Olive Garden', image: logo('olivegarden.com') },
] as const satisfies readonly Option[];
export type RestaurantKey = (typeof RESTAURANTS)[number]['value'];

// Used for both "foods you eat" and "foods you don't like".
export const FOOD_CATEGORIES = [
  { value: 'beef', label: 'Beef' },
  { value: 'chicken', label: 'Chicken' },
  { value: 'pork', label: 'Pork' },
  { value: 'seafood', label: 'Fish & seafood' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'grains', label: 'Bread & grains' },
  { value: 'rice', label: 'Rice' },
  { value: 'legumes', label: 'Beans & lentils' },
  { value: 'nuts', label: 'Nuts & seeds' },
  { value: 'salads', label: 'Salads' },
  { value: 'mexican', label: 'Mexican' },
  { value: 'italian', label: 'Italian' },
  { value: 'asian', label: 'Asian' },
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'indian', label: 'Indian' },
  { value: 'american', label: 'American' },
  { value: 'breakfast', label: 'Breakfast foods' },
  { value: 'bowls', label: 'Smoothies & bowls' },
] as const satisfies readonly Option[];
export type FoodCategory = (typeof FOOD_CATEGORIES)[number]['value'];

export function labelFor(options: readonly Option[], value: string | null | undefined): string | null {
  return options.find((o) => o.value === value)?.label ?? null;
}

export function labelsFor(options: readonly Option[], values: readonly string[]): string[] {
  return values.map((v) => labelFor(options, v)).filter((l): l is string => l !== null);
}
