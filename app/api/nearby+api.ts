import { PlacesApiError, searchPlaces, toRestaurant, type GooglePlace, type SearchArea } from '../../lib/nearby/googlePlaces';
import { distanceMeters, isFastFood } from '../../lib/nearby/scoring';
import { resolveLogos } from '../../lib/nearby/logos';
import { ATTRIBUTE_KEYS, CRITERION_KEYS, type FilterKey, type NearbyResponse } from '../../lib/nearby/types';
import { scanWebsites } from '../../lib/nearby/websiteScan';

// GET /api/nearby?lat=..&lng=..   or   ?q=<city or zip>
//   optional: &food=<what the user is craving>   &focus=seedOilFree,vegan,oliveOil (any FilterKey)
// Runs on the server, so the Google key (from .env.local) never reaches the app.
// `focus` adds one targeted Google search per listed criterion (the user's active filters).

const CACHE_TTL_MS = 30 * 60 * 1000;
// Text searches are location-biased, not restricted, so drop anything unreasonably far away.
const MAX_DISTANCE_METERS = 15000;
const searchCache = new Map<string, { at: number; places: GooglePlace[] }>();
// Each filter adds one billed Google search; beyond this many, remaining filters still apply to the
// results on screen but don't trigger their own search (protects the free monthly allowance).
const MAX_FOCUS_SEARCHES = 4;
const FILTER_KEYS: string[] = [...CRITERION_KEYS, ...ATTRIBUTE_KEYS];

const json = (body: NearbyResponse, status = 200) => Response.json(body, { status });

async function cachedSearch(apiKey: string, area: SearchArea, areaKey: string, food: string | null, focus: FilterKey | null) {
  const key = `${areaKey}|${food ?? ''}|${focus ?? 'all'}`;
  const hit = searchCache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.places;
  const places = await searchPlaces(apiKey, area, food, focus);
  searchCache.set(key, { at: Date.now(), places });
  return places;
}

export async function GET(request: Request) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return json({ error: 'missing_key' }, 503);

  const params = new URL(request.url).searchParams;
  const q = params.get('q')?.trim();
  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));
  const food = params.get('food')?.trim().slice(0, 100).toLowerCase() || null;
  const focus = (params.get('focus') ?? '')
    .split(',')
    .filter((f): f is FilterKey => FILTER_KEYS.includes(f))
    .slice(0, MAX_FOCUS_SEARCHES);

  let area: SearchArea;
  let areaKey: string;
  if (q) {
    area = { query: q.slice(0, 100) };
    areaKey = `q:${q.toLowerCase()}`;
  } else if (params.has('lat') && params.has('lng') && Number.isFinite(lat) && Number.isFinite(lng)) {
    area = { lat, lng };
    // Round to ~1 km so small GPS jitter reuses the same (already paid for) searches.
    areaKey = `ll:${lat.toFixed(2)},${lng.toFixed(2)}`;
  } else {
    return json({ error: 'bad_request', message: 'Provide lat & lng, or q.' }, 400);
  }

  try {
    const lists = await Promise.all([null, ...focus].map((f) => cachedSearch(apiKey, area, areaKey, food, f)));
    const origin = 'query' in area ? null : area;

    // Merge (same place can come back from several searches), drop fast food and far-away results.
    const byId = new Map<string, GooglePlace>();
    for (const p of lists.flat()) {
      if (byId.has(p.id) || isFastFood(p.displayName?.text ?? '', p.types ?? [])) continue;
      if (origin && p.location) {
        const d = distanceMeters(origin, { lat: p.location.latitude, lng: p.location.longitude });
        if (d > MAX_DISTANCE_METERS) continue;
      }
      byId.set(p.id, p);
    }
    const places = [...byId.values()];

    const [websites, logos] = await Promise.all([
      scanWebsites(places.flatMap((p) => (p.websiteUri ? [p.websiteUri] : []))),
      resolveLogos(places.map((p) => ({ id: p.id, name: p.displayName?.text ?? '', websiteUri: p.websiteUri }))),
    ]);
    const restaurants = places
      .map((p) => toRestaurant(p, origin, p.websiteUri ? websites.get(p.websiteUri) : undefined, logos.get(p.id) ?? null))
      .sort((a, b) => b.score - a.score || (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity));

    return json({ restaurants });
  } catch (e) {
    const message = e instanceof PlacesApiError ? e.message : 'Could not reach Google Places.';
    return json({ error: 'upstream_error', message }, 502);
  }
}
