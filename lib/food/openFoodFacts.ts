// Server-only: Open Food Facts (free, community-run product database). Called from app/api/food+api.ts.
import { findAvoidIngredients } from './avoidCheck';
import type { FoodProduct, FoodSearchHit, Nutrients } from './types';

const PRODUCT_URL = 'https://world.openfoodfacts.org/api/v2/product';
const SEARCH_URL = 'https://search.openfoodfacts.org/search';
// Open Food Facts asks apps to identify themselves.
const USER_AGENT = 'HealthApp/0.1 (personal project)';
const TIMEOUT_MS = 10000;

const PRODUCT_FIELDS = [
  'product_name', 'product_name_en', 'brands', 'nutriments', 'ingredients_text_en', 'ingredients_text',
  'nova_group', 'additives_tags', 'serving_size', 'serving_quantity', 'image_front_small_url', 'categories_tags',
].join(',');
const SEARCH_FIELDS = ['code', 'product_name', 'product_name_en', 'brands', 'nutriments', 'image_front_small_url'].join(',');

export class FoodApiError extends Error {}

type OffNutriments = Record<string, number | string | undefined>;
type OffProduct = {
  product_name?: string;
  product_name_en?: string;
  brands?: string | string[];
  nutriments?: OffNutriments;
  ingredients_text_en?: string;
  ingredients_text?: string;
  nova_group?: number;
  additives_tags?: string[];
  serving_size?: string;
  serving_quantity?: number | string;
  image_front_small_url?: string;
  categories_tags?: string[];
};

async function getJson(url: string): Promise<{ status: number; body: unknown }> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    return { status: res.status, body: await res.json().catch(() => null) };
  } catch {
    throw new FoodApiError('Could not reach Open Food Facts.');
  }
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : null;
};

const brandOf = (b: OffProduct['brands']): string | null => {
  const s = Array.isArray(b) ? b[0] : b?.split(',')[0];
  return s?.trim() || null;
};

function per100g(n: OffNutriments | undefined): Nutrients | null {
  if (!n) return null;
  const kcal = num(n['energy-kcal_100g']) ?? (num(n['energy_100g']) != null ? num(n['energy_100g'])! / 4.184 : null);
  if (kcal == null) return null;
  return {
    kcal: Math.round(kcal),
    protein: num(n.proteins_100g) ?? 0,
    carbs: num(n.carbohydrates_100g) ?? 0,
    fat: num(n.fat_100g) ?? 0,
    sugar: num(n.sugars_100g) ?? undefined,
  };
}

export async function getProduct(barcode: string): Promise<FoodProduct | null> {
  const { status, body } = await getJson(`${PRODUCT_URL}/${encodeURIComponent(barcode)}.json?fields=${PRODUCT_FIELDS}`);
  const data = body as { status?: number; product?: OffProduct } | null;
  if (status === 404 || !data?.product || data.status === 0) return null;
  if (status >= 400) throw new FoodApiError(`Open Food Facts error (${status})`);

  const p = data.product;
  const ingredientsText = p.ingredients_text_en || p.ingredients_text || null;
  const servingGrams = num(p.serving_quantity);
  return {
    barcode,
    name: p.product_name_en || p.product_name || brandOf(p.brands) || 'Unnamed product',
    brand: brandOf(p.brands),
    imageUrl: p.image_front_small_url ?? null,
    servingLabel: p.serving_size ?? null,
    servingGrams: servingGrams && servingGrams > 0 ? servingGrams : null,
    per100g: per100g(p.nutriments),
    ingredientsText,
    found: findAvoidIngredients({
      ingredientsText,
      additivesTags: p.additives_tags,
      novaGroup: p.nova_group,
      transFat100g: num(p.nutriments?.['trans-fat_100g']),
      categoriesTags: p.categories_tags,
    }),
  };
}

// US products first (familiar brands); worldwide if nothing matches.
const COUNTRY_FILTER = 'countries_tags:"en:united-states"';

export async function searchProducts(query: string): Promise<FoodSearchHit[]> {
  const clean = query.replace(/[":()]/g, ' ').trim(); // keep user text from changing the search syntax
  let hits = await searchOnce(`${clean} ${COUNTRY_FILTER}`);
  if (hits.length === 0) hits = await searchOnce(clean);
  return hits;
}

async function searchOnce(q: string): Promise<FoodSearchHit[]> {
  const params = new URLSearchParams({ q, page_size: '20', fields: SEARCH_FIELDS, langs: 'en' });
  const { status, body } = await getJson(`${SEARCH_URL}?${params}`);
  if (status >= 400) throw new FoodApiError(`Open Food Facts search error (${status})`);
  const hits = ((body as { hits?: (OffProduct & { code?: string })[] } | null)?.hits ?? []).filter((h) => h.code);
  return hits
    .map((h) => ({
      barcode: h.code!,
      name: h.product_name_en || h.product_name || '',
      brand: brandOf(h.brands),
      kcalPer100g: per100g(h.nutriments)?.kcal ?? null,
      imageUrl: h.image_front_small_url ?? null,
    }))
    .filter((h) => h.name); // nameless entries aren't useful in a list
}
