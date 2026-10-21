// Daily tips. Each one is drawn from (and links to) a Learn article, so its source is one tap away.
import type { AvoidKey, EatingOutChallenge } from '../profile/options';
import type { Profile } from '../profile/types';

export type Tip = {
  id: string;
  text: string;
  article: string; // Learn article slug
  avoid?: AvoidKey[]; // relevant when the user avoids any of these
  challenge?: EatingOutChallenge[]; // relevant for these eating-out challenges
};

export const TIPS: Tip[] = [
  { id: 'ask-oil', text: 'At restaurants, just ask: "What oil do you cook with?" Many kitchens will tell you — and some can switch to butter or olive oil.', article: 'seed-oils', avoid: ['seedOils'], challenge: ['hiddenIngredients'] },
  { id: 'evoo', text: 'Extra-virgin olive oil has the strongest evidence of any cooking fat — a large trial linked it to about 30% fewer heart attacks and strokes.', article: 'seed-oils', avoid: ['seedOils'] },
  { id: 'high-heat-fats', text: 'For high-heat searing, avocado oil, ghee or tallow hold up better than seed oils.', article: 'seed-oils', avoid: ['seedOils'] },
  { id: 'vegetable-oil-label', text: '"Vegetable oil" on a label almost always means soybean, corn or canola oil.', article: 'seed-oils', avoid: ['seedOils'] },
  { id: 'dressing', text: 'Bottled dressings are one of the biggest hidden sources of seed oil and sugar. Olive oil plus vinegar or lemon takes 30 seconds.', article: 'seed-oils', avoid: ['seedOils', 'addedSugar'] },
  { id: 'fryer-reuse', text: 'Restaurant fryer oil gets reused for days, building up oxidation products. Grilled or roasted beats "crispy".', article: 'fried-fast-food', avoid: ['seedOils', 'ultraProcessed'], challenge: ['hiddenIngredients', 'time'] },
  { id: 'fries-swap', text: 'Swapping fries for a side salad or vegetables is the single easiest upgrade at most restaurants.', article: 'fried-fast-food', avoid: ['seedOils', 'ultraProcessed'], challenge: ['unknownHealthy', 'cravings'] },
  { id: 'fast-food-twice', text: 'In a 15-year study, eating fast food more than twice a week was linked to 10 extra pounds and double the rise in insulin resistance.', article: 'fried-fast-food', challenge: ['time', 'cravings'] },
  { id: 'fried-diabetes', text: 'Fried food 4–6 times a week was linked to a 39% higher risk of type 2 diabetes. Keep it occasional, not a habit.', article: 'fried-fast-food' },
  { id: 'drinks-first', text: 'Sweet drinks are the #1 source of added sugar. Switching to water, sparkling water or unsweetened tea is the biggest single cut you can make.', article: 'added-sugar', avoid: ['addedSugar'] },
  { id: 'sugar-limit', text: 'The American Heart Association suggests no more than about 25 g of added sugar a day for women and 36 g for men. One soda can go over that.', article: 'added-sugar', avoid: ['addedSugar'] },
  { id: 'sauce-sugar', text: 'Ketchup, BBQ sauce and teriyaki are mostly sugar. Ask for sauce on the side and use half.', article: 'added-sugar', avoid: ['addedSugar'], challenge: ['hiddenIngredients'] },
  { id: 'sugar-names', text: 'Sugar has dozens of names on labels: dextrose, maltose, brown rice syrup, cane juice, agave… If it ends in "-ose" or "syrup", it counts.', article: 'added-sugar', avoid: ['addedSugar'] },
  { id: 'yogurt', text: 'Flavored yogurt can have as much sugar as dessert. Plain Greek yogurt with berries gives you the protein without it.', article: 'added-sugar', avoid: ['addedSugar'] },
  { id: 'hfcs-same', text: "High-fructose corn syrup isn't uniquely worse than sugar — but it's a reliable sign you're holding an ultra-processed product.", article: 'hfcs', avoid: ['addedSugar', 'ultraProcessed'] },
  { id: 'hfcs-where', text: 'HFCS shows up in bread, cereal bars and salad dressing, not just soda. Check the first few ingredients.', article: 'hfcs', avoid: ['addedSugar'] },
  { id: 'malto-sugarfree', text: '"Sugar-free" sweetener packets are often mostly maltodextrin, which your body turns into glucose very quickly.', article: 'maltodextrin', avoid: ['addedSugar', 'artificialSweeteners'] },
  { id: 'malto-protein', text: 'Check your protein powder: maltodextrin is a common cheap filler. Look for a short ingredient list.', article: 'maltodextrin', avoid: ['addedSugar', 'ultraProcessed'] },
  { id: 'ages-marinate', text: 'Marinating meat in lemon juice or vinegar before cooking significantly cuts the AGEs that form during cooking.', article: 'ages' },
  { id: 'ages-moist', text: 'Stewing, braising and steaming create far fewer AGEs than grilling, broiling or frying.', article: 'ages' },
  { id: 'ages-char', text: "Skip the char. The darker and crispier the surface, the more AGEs — and they build up in the body over time.", article: 'ages' },
  { id: 'upf-500', text: 'In a controlled trial, people ate about 500 more calories a day on ultra-processed food — without feeling any fuller.', article: 'ultra-processed', avoid: ['ultraProcessed'] },
  { id: 'upf-ingredients', text: "A quick test: if the ingredient list has things you'd never cook with at home, it's probably ultra-processed.", article: 'ultra-processed', avoid: ['ultraProcessed'], challenge: ['unknownHealthy'] },
  { id: 'upf-batch', text: 'Batch-cook protein and vegetables on the weekend so the fast option on busy days is a real meal.', article: 'ultra-processed', avoid: ['ultraProcessed'], challenge: ['time'] },
  { id: 'scanner', text: 'Not sure about a packaged food? Scan it — the app checks the ingredients against your avoid list in seconds.', article: 'ultra-processed', challenge: ['unknownHealthy'] },
  { id: 'social', text: "Eating out with friends? Pick the place yourself when you can — Nearby shows the healthiest options around you.", article: 'fried-fast-food', challenge: ['social', 'fewOptions'] },
  { id: 'nss-who', text: "The WHO advises against relying on zero-calorie sweeteners for weight loss — they didn't lead to lasting fat loss in its review.", article: 'artificial-sweeteners', avoid: ['artificialSweeteners'] },
  { id: 'erythritol', text: '"Natural" doesn\'t mean harmless: erythritol, common in keto snacks, has been linked to blood clotting in recent research.', article: 'artificial-sweeteners', avoid: ['artificialSweeteners'] },
  { id: 'alcohol-zero', text: 'A 195-country analysis found the amount of alcohol that minimizes health loss is zero. Fewer drinks is always better.', article: 'alcohol', avoid: ['alcohol'] },
  { id: 'alcohol-sleep', text: 'A nightcap helps you fall asleep but breaks up the second half of your sleep. Stop drinking a few hours before bed.', article: 'alcohol', avoid: ['alcohol'] },
  { id: 'trans-imports', text: 'Trans fats are banned in US food, but check imported snacks for "partially hydrogenated oil".', article: 'trans-fats', avoid: ['transFats'] },
  { id: 'price', text: 'Healthy on a budget: eggs, canned fish, beans, frozen vegetables and plain oats are cheap and unprocessed.', article: 'ultra-processed', challenge: ['price'] },
];

const dayNumber = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);

// Round-robin across articles so consecutive days cover different topics.
function interleaveByArticle(tips: Tip[]): Tip[] {
  const groups = new Map<string, Tip[]>();
  for (const t of tips) groups.set(t.article, [...(groups.get(t.article) ?? []), t]);
  const queues = [...groups.values()];
  const out: Tip[] = [];
  while (queues.some((q) => q.length)) for (const q of queues) if (q.length) out.push(q.shift()!);
  return out;
}

// Tips that match the user's avoid list or eating-out challenges come first; one per day, rotating.
export function tipsForUser(profile: Profile): Tip[] {
  const relevant = TIPS.filter(
    (t) =>
      t.avoid?.some((a) => profile.avoid.includes(a)) || t.challenge?.some((c) => profile.eatingOutChallenges.includes(c)),
  );
  return interleaveByArticle(relevant.length >= 7 ? relevant : TIPS);
}

export function tipForDate(profile: Profile, date = new Date()): Tip {
  const list = tipsForUser(profile);
  return list[dayNumber(date) % list.length];
}
