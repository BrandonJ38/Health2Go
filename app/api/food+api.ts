import { FoodApiError, getProduct, searchProducts } from '../../lib/food/openFoodFacts';
import type { FoodApiResponse, FoodProduct, FoodSearchHit } from '../../lib/food/types';

// GET /api/food?barcode=<digits>   → full product with avoid-list flags
// GET /api/food?q=<search text>     → light search results
// Proxied through the server so requests carry an app User-Agent and results are cached.

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const productCache = new Map<string, { at: number; product: FoodProduct | null }>();
const searchCache = new Map<string, { at: number; hits: FoodSearchHit[] }>();

const json = (body: FoodApiResponse, status = 200) => Response.json(body, { status });
const fresh = (at: number) => Date.now() - at < CACHE_TTL_MS;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const barcode = params.get('barcode')?.replace(/\D/g, '');
  const q = params.get('q')?.trim().slice(0, 100);

  try {
    if (barcode) {
      if (barcode.length < 6 || barcode.length > 14) return json({ error: 'bad_request', message: 'That barcode looks incomplete.' }, 400);
      let hit = productCache.get(barcode);
      if (!hit || !fresh(hit.at)) {
        hit = { at: Date.now(), product: await getProduct(barcode) };
        productCache.set(barcode, hit);
      }
      return hit.product ? json({ product: hit.product }) : json({ error: 'not_found' }, 404);
    }
    if (q) {
      const key = q.toLowerCase();
      let hit = searchCache.get(key);
      if (!hit || !fresh(hit.at)) {
        hit = { at: Date.now(), hits: await searchProducts(q) };
        searchCache.set(key, hit);
      }
      return json({ hits: hit.hits });
    }
    return json({ error: 'bad_request', message: 'Provide barcode or q.' }, 400);
  } catch (e) {
    return json({ error: 'upstream_error', message: e instanceof FoodApiError ? e.message : 'Something went wrong.' }, 502);
  }
}
