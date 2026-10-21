import type { Confidence, CriterionKey, CriterionResult, Evidence, PriceTier } from './types';

// ---------------------------------------------------------------------------
// Fast food (hard filter — these places are never shown)
// ---------------------------------------------------------------------------

const FAST_FOOD_TYPES = ['fast_food_restaurant'];

const FAST_FOOD_CHAINS = [
  "mcdonald's", 'burger king', "wendy's", 'taco bell', 'kfc', 'kentucky fried chicken', 'subway', 'popeyes',
  'chick-fil-a', "arby's", 'sonic drive-in', 'jack in the box', "domino's", 'pizza hut', 'little caesars',
  "papa john's", 'dairy queen', "carl's jr", "hardee's", 'whataburger', 'del taco', 'wingstop', 'panda express',
  'five guys', 'in-n-out', "raising cane's", "church's", "bojangles", "zaxby's", "culver's", 'white castle',
  'krystal', 'checkers', "rally's", "long john silver's", 'dunkin', 'tim hortons', "jimmy john's",
  'firehouse subs', "jersey mike's", 'quiznos', 'el pollo loco', "captain d's", "steak 'n shake", 'shake shack',
  'taco john', 'qdoba', 'krispy kreme',
];

const normalize = (s: string) => s.toLowerCase().replace(/[’']/g, '').replace(/\s+/g, ' ').trim();
const NORMALIZED_CHAINS = FAST_FOOD_CHAINS.map(normalize);

export function isFastFood(name: string, types: string[]): boolean {
  if (types.some((t) => FAST_FOOD_TYPES.includes(t))) return true;
  const n = normalize(name);
  return NORMALIZED_CHAINS.some((chain) => n.startsWith(chain));
}

// ---------------------------------------------------------------------------
// Criteria detection from text (reviews, Google summary, website, name)
// ---------------------------------------------------------------------------

// `pattern` overrides the default whole-phrase match when a phrase needs exceptions.
// `flipWhenNegated`: a negated match supports the criterion ("we never use canola"). Other negated
// negatives ("not too sweet") say nothing reliable and are ignored.
type Rule = { phrase: string; weight: number; pattern?: RegExp; flipWhenNegated?: boolean };

// Positive rules point toward meeting the criterion, negative rules away from it.
// Weight 3 = explicit claim, 2 = strong hint, 1 = weak hint.
const RULES: Record<CriterionKey, { positive: Rule[]; negative: Rule[] }> = {
  seedOilFree: {
    positive: [
      { phrase: 'seed oil free', weight: 3 },
      { phrase: 'seed-oil free', weight: 3 },
      { phrase: 'seed oil-free', weight: 3 },
      { phrase: 'seed-oil-free', weight: 3 },
      { phrase: 'no seed oils', weight: 3 },
      { phrase: 'no seed oil', weight: 3 },
      { phrase: 'zero seed oils', weight: 3 },
      { phrase: 'not seed oils', weight: 3 },
      { phrase: 'free of seed oils', weight: 3 },
      { phrase: 'without seed oils', weight: 3 },
      { phrase: 'beef tallow', weight: 2 },
      { phrase: 'tallow', weight: 2 },
      { phrase: 'cooked in olive oil', weight: 2 },
      { phrase: 'avocado oil', weight: 2 },
      { phrase: 'extra virgin olive oil', weight: 1 },
      { phrase: 'ghee', weight: 1 },
      { phrase: 'grass-fed butter', weight: 1 },
      { phrase: 'coconut oil', weight: 1 },
      { phrase: 'lard', weight: 1 },
    ],
    negative: [
      { phrase: 'canola', weight: 2, flipWhenNegated: true },
      { phrase: 'vegetable oil', weight: 2, flipWhenNegated: true },
      { phrase: 'soybean oil', weight: 2, flipWhenNegated: true },
      { phrase: 'sunflower oil', weight: 2, flipWhenNegated: true },
      { phrase: 'cottonseed oil', weight: 2, flipWhenNegated: true },
      { phrase: 'deep fried', weight: 1 },
      { phrase: 'deep-fried', weight: 1 },
      { phrase: 'greasy', weight: 1 },
    ],
  },
  freshIngredients: {
    positive: [
      { phrase: 'farm to table', weight: 3 },
      { phrase: 'farm-to-table', weight: 3 },
      { phrase: 'made from scratch', weight: 3 },
      { phrase: 'from scratch', weight: 2 },
      { phrase: 'locally sourced', weight: 2 },
      { phrase: 'local ingredients', weight: 2 },
      { phrase: 'fresh ingredients', weight: 2 },
      { phrase: 'whole foods', weight: 1 },
      { phrase: 'organic', weight: 1 },
      { phrase: 'grass-fed', weight: 1 },
      { phrase: 'pasture-raised', weight: 1 },
      { phrase: 'wild-caught', weight: 1 },
      { phrase: 'house-made', weight: 1 },
      { phrase: 'homemade', weight: 1 },
      { phrase: 'seasonal menu', weight: 1 },
    ],
    negative: [
      { phrase: 'microwaved', weight: 2 },
      { phrase: 'reheated', weight: 1 },
      { phrase: 'pre-made', weight: 1 },
      { phrase: 'premade', weight: 1 },
      { phrase: 'frozen food', weight: 1 },
    ],
  },
  sugarFree: {
    positive: [
      // "refined sugar free" is about added sugar, not sugar free — excluded here.
      { phrase: 'sugar free', weight: 3, pattern: /(?<!refined[ -])\bsugar[ -]free\b/i },
      { phrase: 'zero sugar', weight: 3 },
      { phrase: 'no sugar', weight: 2 },
      { phrase: 'keto-friendly', weight: 2 },
      { phrase: 'keto', weight: 1 },
      { phrase: 'low carb', weight: 1 },
    ],
    negative: [
      { phrase: 'sugary', weight: 1 },
      { phrase: 'too sweet', weight: 1 },
    ],
  },
  noAddedSugar: {
    positive: [
      { phrase: 'no added sugar', weight: 3 },
      { phrase: 'no added sugars', weight: 3 },
      { phrase: 'no refined sugar', weight: 3 },
      { phrase: 'refined sugar free', weight: 3 },
      { phrase: 'refined-sugar-free', weight: 3 },
      { phrase: 'naturally sweetened', weight: 2 },
      { phrase: 'whole30', weight: 2 },
      { phrase: 'paleo', weight: 1 },
      { phrase: 'unsweetened', weight: 1 },
    ],
    negative: [
      { phrase: 'sugary', weight: 1 },
      { phrase: 'too sweet', weight: 1 },
    ],
  },
};

// Place categories that almost always mean sugar (counts against both sugar criteria).
const SWEET_TYPES = ['bakery', 'dessert_shop', 'dessert_restaurant', 'donut_shop', 'ice_cream_shop', 'confectionery', 'candy_store'];
const SUGAR_CRITERIA: CriterionKey[] = ['sugarFree', 'noAddedSugar'];

// "we never use canola", "no vegetable oil", "not sugar free" — a negation just before the match flips its meaning.
const NEGATION_BEFORE = /\b(no|never|not|without|free of|instead of|zero|nor|don'?t use|do not use)\b[^.!?]{0,15}$/i;

export type TextSource = { source: string; text: string };

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ruleRegex = new Map<string, RegExp>();
function regexFor(rule: Rule): RegExp {
  if (rule.pattern) return rule.pattern;
  let re = ruleRegex.get(rule.phrase);
  if (!re) {
    re = new RegExp(`\\b${escapeRegex(rule.phrase)}\\b`, 'i');
    ruleRegex.set(rule.phrase, re);
  }
  return re;
}

// The sentence around a match, trimmed to a readable length.
function snippetAround(text: string, index: number, length: number): string {
  const before = text.slice(0, index);
  const after = text.slice(index + length);
  const start = Math.max(before.search(/[^.!?\n]*$/), 0);
  const endMatch = after.search(/[.!?\n]/);
  const end = index + length + (endMatch === -1 ? after.length : endMatch + 1);
  let s = text.slice(start, end).trim();
  if (s.length > 160) {
    const from = Math.max(index - start - 60, 0);
    s = (from > 0 ? '…' : '') + s.slice(from, from + 150).trim() + '…';
  }
  return s;
}

const MAX_EVIDENCE = 3;
const MIN_SIGNAL = 2;

export function evaluateCriteria(sources: TextSource[], types: string[]): Record<CriterionKey, CriterionResult> {
  const result = {} as Record<CriterionKey, CriterionResult>;

  for (const key of Object.keys(RULES) as CriterionKey[]) {
    let total = 0;
    const evidence: Evidence[] = [];
    const seen = new Set<string>();

    const check = (rules: Rule[], positiveRule: boolean) => {
      for (const rule of rules) {
        // Skip weaker phrases already covered by a longer one ("tallow" inside "beef tallow").
        if ([...seen].some((p) => p.includes(rule.phrase))) continue;
        for (const { source, text } of sources) {
          const match = regexFor(rule).exec(text);
          if (!match) continue;
          const negated = NEGATION_BEFORE.test(text.slice(Math.max(0, match.index - 40), match.index));
          // Negated positive ("not sugar free") is ignored; negated negative only counts when the rule allows it.
          if (negated && (positiveRule || !rule.flipWhenNegated)) continue;
          const supports = positiveRule || negated;
          seen.add(rule.phrase);
          total += supports ? rule.weight : -rule.weight;
          const snippet = snippetAround(text, match.index, match[0].length);
          if (evidence.length < MAX_EVIDENCE && !evidence.some((e) => e.snippet === snippet)) {
            evidence.push({ source, snippet, supports });
          }
          break;
        }
      }
    };

    check(RULES[key].positive, true);
    check(RULES[key].negative, false);

    if (SUGAR_CRITERIA.includes(key)) {
      const sweet = types.find((t) => SWEET_TYPES.includes(t));
      if (sweet) {
        total -= 2;
        evidence.push({ source: 'Category', snippet: `Listed as ${sweet.replace(/_/g, ' ')}`, supports: false });
      }
    }

    // A single weak hint (weight 1) isn't enough either way.
    const confidence: Confidence = total >= MIN_SIGNAL ? 'likely' : total <= -MIN_SIGNAL ? 'unlikely' : 'unknown';
    result[key] = { confidence, evidence };
  }

  return result;
}

// ---------------------------------------------------------------------------
// Ranking, price, distance
// ---------------------------------------------------------------------------

const CONFIDENCE_POINTS: Record<Confidence, number> = { verified: 3, likely: 2, unknown: 0, unlikely: -2 };

export function healthScore(criteria: Record<CriterionKey, CriterionResult>, rating: number | null): number {
  const criteriaPoints = Object.values(criteria).reduce((sum, c) => sum + CONFIDENCE_POINTS[c.confidence], 0);
  // Rating is only a small tie-breaker; health signals dominate.
  const ratingPoints = rating ? (rating - 3.5) * 0.5 : 0;
  return Math.round((criteriaPoints + ratingPoints) * 100) / 100;
}

// Google has 4 paid levels; the app shows 3 ($$$ covers Expensive and Very expensive).
export function toPriceTier(priceLevel: string | undefined): PriceTier | null {
  switch (priceLevel) {
    case 'PRICE_LEVEL_INEXPENSIVE':
      return 1;
    case 'PRICE_LEVEL_MODERATE':
      return 2;
    case 'PRICE_LEVEL_EXPENSIVE':
    case 'PRICE_LEVEL_VERY_EXPENSIVE':
      return 3;
    default:
      return null;
  }
}

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}
