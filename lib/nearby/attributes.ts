// Detects the extra Nearby filters (diet, cooking oil, sourcing) from Google types, Google's
// vegetarian flag, and text (name, Google summary, reviews, website). Pure — easy to test.
import type { TextSource } from './scoring';
import type { AttributeKey, AttributeResult, Evidence } from './types';

type Phrase = { text: string; level: 'yes' | 'likely'; pattern?: RegExp };

const yes = (text: string, pattern?: RegExp): Phrase => ({ text, level: 'yes', pattern });
const likely = (text: string, pattern?: RegExp): Phrase => ({ text, level: 'likely', pattern });

// Ordered strongest first: the first match per source decides the level.
const PHRASES: Record<AttributeKey, Phrase[]> = {
  vegan: [yes('100% vegan'), yes('fully vegan'), yes('all vegan'), yes('entirely vegan'), yes('vegan restaurant'), yes('vegan cafe'), likely('vegan')],
  vegetarian: [yes('vegetarian restaurant'), yes('all vegetarian'), yes('100% vegetarian'), likely('vegetarian'), likely('veggie options')],
  plantBased: [yes('100% plant-based'), yes('fully plant-based'), yes('plant-based restaurant'), likely('plant-based'), likely('plant based'), likely('plant-forward'), likely('plant forward')],
  glutenFree: [
    yes('100% gluten-free'),
    yes('100% gluten free'),
    yes('dedicated gluten-free'),
    yes('dedicated gluten free'),
    yes('celiac safe'),
    yes('celiac-safe'),
    likely('gluten-free'),
    likely('gluten free'),
    likely('celiac'),
  ],
  dairyFree: [yes('100% dairy-free'), yes('100% dairy free'), likely('dairy-free'), likely('dairy free'), likely('non-dairy')],
  ketoPaleo: [likely('keto'), likely('paleo'), likely('whole30'), likely('low carb'), likely('low-carb')],
  // Cooking context only — "olive oil cake" or "bread with olive oil" says nothing about the kitchen's cooking fat.
  oliveOil: [
    yes('cooked in olive oil'),
    yes('cook everything in olive oil'),
    yes('cook with olive oil'),
    yes('fried in olive oil'),
    yes('only olive oil'),
    yes('only use olive oil'),
    yes('100% olive oil'),
    likely('cooked with olive oil'),
    likely('made with olive oil'),
    likely('uses olive oil'),
    likely('use olive oil'),
    likely('sauteed in olive oil'),
    likely('sautéed in olive oil'),
    likely('roasted in olive oil'),
    likely('grilled with olive oil'),
  ],
  avocadoOil: [yes('cooked in avocado oil'), yes('100% avocado oil'), yes('only avocado oil'), likely('avocado oil')],
  animalFats: [
    yes('cooked in beef tallow'),
    yes('fried in beef tallow'),
    yes('fried in tallow'),
    likely('beef tallow'),
    likely('tallow'),
    likely('duck fat'),
    likely('lard'),
    likely('ghee'),
    likely('grass-fed butter'),
    likely('cooked in butter'),
  ],
  grassFed: [likely('grass-fed'), likely('grass fed'), likely('grass-finished'), likely('pasture-raised'), likely('pasture raised')],
  organic: [yes('certified organic'), yes('usda organic'), yes('100% organic'), likely('organic')],
  wildCaught: [likely('wild-caught'), likely('wild caught')],
};

// Google place types for an attribute. As the place's main type → yes; as a secondary type → likely
// (Google adds "vegan_restaurant" to many places that merely have vegan options).
const TYPE_RULES: Partial<Record<AttributeKey, string[]>> = {
  vegan: ['vegan_restaurant'],
  vegetarian: ['vegetarian_restaurant', 'vegan_restaurant'],
  plantBased: ['vegan_restaurant'],
};

// Attributes implied by a confirmed (yes) other attribute.
const IMPLIED_BY_YES: Partial<Record<AttributeKey, AttributeKey[]>> = {
  vegan: ['vegetarian', 'plantBased', 'dairyFree'],
};

const OLIVE_OIL_CUISINES = /^(mediterranean|greek|italian|spanish|middle_eastern|lebanese|turkish)_restaurant$/;

const NEGATION_BEFORE = /\b(no|never|not|without|zero|nor|don'?t|lacks?|lacking)\b[^.!?]{0,20}$/i;
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const cache = new Map<string, RegExp>();
const regexFor = (p: Phrase) => {
  if (p.pattern) return p.pattern;
  let re = cache.get(p.text);
  if (!re) {
    re = new RegExp(`\\b${escapeRegex(p.text)}\\b`, 'i');
    cache.set(p.text, re);
  }
  return re;
};

function snippet(text: string, index: number, length: number): string {
  const start = Math.max(text.slice(0, index).search(/[^.!?\n]*$/), 0);
  const rest = text.slice(index + length);
  const endRel = rest.search(/[.!?\n]/);
  let s = text.slice(start, index + length + (endRel === -1 ? rest.length : endRel + 1)).trim();
  if (s.length > 160) {
    const from = Math.max(index - start - 60, 0);
    s = (from > 0 ? '…' : '') + s.slice(from, from + 150).trim() + '…';
  }
  return s;
}

const MAX_EVIDENCE = 2;

export function evaluateAttributes(
  sources: TextSource[],
  types: string[],
  primaryType: string | null,
  servesVegetarianFood: boolean | null,
): Partial<Record<AttributeKey, AttributeResult>> {
  const out: Partial<Record<AttributeKey, AttributeResult>> = {};
  const add = (key: AttributeKey, level: 'yes' | 'likely', ev: Evidence) => {
    const cur = out[key];
    if (!cur) {
      out[key] = { level, evidence: [ev] };
      return;
    }
    if (level === 'yes') cur.level = 'yes';
    if (cur.evidence.length < MAX_EVIDENCE && !cur.evidence.some((e) => e.snippet === ev.snippet)) cur.evidence.push(ev);
  };

  for (const [key, typeList] of Object.entries(TYPE_RULES) as [AttributeKey, string[]][]) {
    if (primaryType && typeList.includes(primaryType)) {
      add(key, 'yes', { source: 'Category', snippet: `Listed as a ${primaryType.replace(/_/g, ' ')}`, supports: true });
      continue;
    }
    const t = types.find((x) => typeList.includes(x));
    if (t) add(key, 'likely', { source: 'Category', snippet: `Also listed under ${t.replace(/_/g, ' ')}`, supports: true });
  }
  // Google marks most restaurants as serving vegetarian food, so on its own this only means "likely".
  if (servesVegetarianFood) add('vegetarian', 'likely', { source: 'Google', snippet: 'Google lists it as serving vegetarian food', supports: true });

  for (const [key, phrases] of Object.entries(PHRASES) as [AttributeKey, Phrase[]][]) {
    for (const { source, text } of sources) {
      for (const p of phrases) {
        const m = regexFor(p).exec(text);
        if (!m) continue;
        if (NEGATION_BEFORE.test(text.slice(Math.max(0, m.index - 40), m.index))) continue; // "no vegan options"
        add(key, p.level, { source, snippet: snippet(text, m.index, m[0].length), supports: true });
        break; // strongest phrase in this source wins
      }
    }
  }

  // Kitchens rarely write "cooked in olive oil", but Mediterranean-style restaurants that mention it
  // usually do cook with it — count that as likely, and say why.
  if (!out.oliveOil && primaryType && OLIVE_OIL_CUISINES.test(primaryType)) {
    for (const { source, text } of sources) {
      const m = /\b(extra[- ]virgin olive oil|evoo|olive oil)\b/i.exec(text);
      if (!m || NEGATION_BEFORE.test(text.slice(Math.max(0, m.index - 40), m.index))) continue;
      add('oliveOil', 'likely', {
        source,
        snippet: `${snippet(text, m.index, m[0].length)} (${primaryType.replace(/_restaurant$/, '').replace(/_/g, ' ')} kitchens typically cook with olive oil)`,
        supports: true,
      });
      break;
    }
  }

  for (const [key, implied] of Object.entries(IMPLIED_BY_YES) as [AttributeKey, AttributeKey[]][]) {
    if (out[key]?.level !== 'yes') continue;
    for (const k of implied) {
      if (out[k]?.level !== 'yes') {
        out[k] = { level: 'yes', evidence: out[k]?.evidence ?? [{ source: 'Category', snippet: 'Fully vegan menu', supports: true }] };
      }
    }
  }
  return out;
}
