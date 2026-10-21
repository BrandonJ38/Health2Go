// Server-only: called from app/api/nearby+api.ts. Never import this from screens/components.
import { distanceMeters, evaluateCriteria, healthScore, toPriceTier, type TextSource } from './scoring';
import { evaluateAttributes } from './attributes';
import type { FilterKey, Restaurant } from './types';
import type { WebsiteInfo } from './websiteScan';
import { applyVerified, applyVerifiedAttributes } from './verifiedSources';

const BASE_URL = 'https://places.googleapis.com/v1';

// Only the fields we use — Google bills by the most expensive field requested.
// priceLevel/phone = Enterprise tier; reviews/editorialSummary/delivery/takeout = Enterprise + Atmosphere tier.
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.types',
  'places.formattedAddress',
  'places.location',
  'places.priceLevel',
  'places.rating',
  'places.userRatingCount',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.editorialSummary',
  'places.reviews',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.delivery',
  'places.takeout',
  'places.servesVegetarianFood',
].join(',');

const SEARCH_RADIUS_METERS = 5000; // ~3 miles

// Extra searches run only when the user turns on that filter. Each one is one billed Google search.
// Google matches these words against places' full reviews, descriptions and websites, so places that
// advertise them surface even when the 5 reviews we receive don't mention it.
// Combined with the food search when there is one: "seed oil free" + "tacos".
const FOCUS_PREFIXES: Record<FilterKey, string> = {
  seedOilFree: 'seed oil free',
  freshIngredients: 'farm to table',
  sugarFree: 'sugar free keto',
  noAddedSugar: 'no refined sugar paleo',
  vegan: 'vegan',
  vegetarian: 'vegetarian',
  plantBased: 'plant based',
  glutenFree: 'gluten free',
  dairyFree: 'dairy free',
  ketoPaleo: 'keto paleo',
  oliveOil: 'cooked in olive oil',
  avocadoOil: 'avocado oil',
  animalFats: 'beef tallow',
  grassFed: 'grass fed',
  organic: 'organic',
  wildCaught: 'wild caught seafood',
};

export type GooglePlace = {
  id: string;
  displayName?: { text: string };
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  types?: string[];
  formattedAddress?: string;
  location?: { latitude: number; longitude: number };
  priceLevel?: string;
  rating?: number;
  userRatingCount?: number;
  websiteUri?: string;
  googleMapsUri?: string;
  editorialSummary?: { text: string };
  reviews?: { text?: { text: string } }[];
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  delivery?: boolean;
  takeout?: boolean;
  servesVegetarianFood?: boolean;
};

export class PlacesApiError extends Error {}

async function callPlaces(apiKey: string, endpoint: string, body: object): Promise<GooglePlace[]> {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { places?: GooglePlace[]; error?: { message?: string } };
  if (!res.ok) {
    throw new PlacesApiError(json.error?.message ?? `Google Places request failed (${res.status})`);
  }
  return json.places ?? [];
}

export type SearchArea = { lat: number; lng: number } | { query: string };

const circle = (a: { lat: number; lng: number }) => ({
  circle: { center: { latitude: a.lat, longitude: a.lng }, radius: SEARCH_RADIUS_METERS },
});

const textSearch = (apiKey: string, phrase: string, area: SearchArea) =>
  'query' in area
    ? callPlaces(apiKey, 'places:searchText', { textQuery: `${phrase} in ${area.query}`, pageSize: 20 })
    : callPlaces(apiKey, 'places:searchText', { textQuery: phrase, locationBias: circle(area), pageSize: 20 });

// food = what the user typed ("grass-fed burger", "açaí bowl"), or null for all restaurants.
// focus = null → the main search; otherwise a targeted search for that criterion.
export function searchPlaces(
  apiKey: string,
  area: SearchArea,
  food: string | null,
  focus: FilterKey | null,
): Promise<GooglePlace[]> {
  if (focus) return textSearch(apiKey, `${FOCUS_PREFIXES[focus]} ${food ?? 'restaurant'}`, area);
  // Natural food searches skip the restaurant-type restriction so cafés, juice bars and food trucks can match.
  if (food) return textSearch(apiKey, food, area);
  return 'query' in area
    ? callPlaces(apiKey, 'places:searchText', {
        textQuery: `restaurants in ${area.query}`,
        includedType: 'restaurant',
        pageSize: 20,
      })
    : callPlaces(apiKey, 'places:searchNearby', {
        includedTypes: ['restaurant'],
        excludedTypes: ['fast_food_restaurant'],
        maxResultCount: 20,
        locationRestriction: circle(area),
      });
}

export function toRestaurant(
  p: GooglePlace,
  origin: { lat: number; lng: number } | null,
  website: WebsiteInfo | undefined,
  logoUrl: string | null,
): Restaurant {
  const name = p.displayName?.text ?? 'Unnamed restaurant';
  const sources: TextSource[] = [{ source: 'Name', text: name }];
  if (p.editorialSummary?.text) sources.push({ source: 'Google summary', text: p.editorialSummary.text });
  for (const review of p.reviews ?? []) {
    if (review.text?.text) sources.push({ source: 'Review', text: review.text.text });
  }
  sources.push(...(website?.sources ?? []));

  const criteria = evaluateCriteria(sources, p.types ?? []);
  applyVerified(name, criteria);
  const attributes = evaluateAttributes(sources, p.types ?? [], p.primaryType ?? null, p.servesVegetarianFood ?? null);
  applyVerifiedAttributes(name, attributes);
  const rating = p.rating ?? null;

  return {
    id: p.id,
    name,
    cuisine: p.primaryTypeDisplayName?.text ?? 'Restaurant',
    address: p.formattedAddress ?? null,
    distanceMeters:
      origin && p.location ? distanceMeters(origin, { lat: p.location.latitude, lng: p.location.longitude }) : null,
    price: toPriceTier(p.priceLevel),
    rating,
    ratingCount: p.userRatingCount ?? null,
    website: p.websiteUri ?? null,
    mapsUrl: p.googleMapsUri ?? null,
    phone: p.nationalPhoneNumber ?? p.internationalPhoneNumber ?? null,
    phoneUri: p.internationalPhoneNumber ? `tel:${p.internationalPhoneNumber.replace(/[^+\d]/g, '')}` : null,
    orderUrl: website?.orderUrl ?? null,
    menuUrl: website?.menuUrl ?? null,
    delivery: p.delivery ?? null,
    takeout: p.takeout ?? null,
    criteria,
    attributes,
    logoUrl,
    score: healthScore(criteria, rating),
  };
}
