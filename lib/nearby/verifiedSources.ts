import type { AttributeKey, AttributeResult, CriterionKey, CriterionResult, Evidence } from './types';

// Restaurants whose status comes from a public, sourced statement rather than keyword guessing.
// Every entry MUST link to its source. Matching is by name prefix (case/punctuation-insensitive).
//
// Certified restaurants: the Seed Oil Free Alliance lists them at
// https://www.seedoilfreecertified.com/product-category/restaurants — only individually documented
// ones are added here. Importing their full list needs the Alliance's permission.
type VerifiedEntry = {
  match: string;
  criteria: CriterionKey[];
  source: string;
  detail: string;
  url: string;
};

const VERIFIED_ENTRIES: VerifiedEntry[] = [
  // Chains — company announcements
  {
    match: 'sweetgreen',
    criteria: ['seedOilFree'],
    source: 'Company announcement',
    detail: 'Sweetgreen removed seed oils from its menu in January 2025 and cooks with olive and avocado oil.',
    url: 'https://www.salon.com/2025/01/24/sweetgreen-ditches-seed-oils-launches-seed-oil-free-menu/',
  },
  {
    match: 'true food kitchen',
    criteria: ['seedOilFree'],
    source: 'Company announcement',
    detail: 'True Food Kitchen went 100% seed-oil free in February 2025, switching to avocado and olive oil.',
    url: 'https://www.nrn.com/casual-dining/true-food-kitchen-goes-seed-oil-free',
  },
  // Individual restaurants — Seed Oil Free Certified
  {
    match: 'just be kitchen',
    criteria: ['seedOilFree'],
    source: 'Seed Oil Free Certified',
    detail: 'Listed by the Seed Oil Free Alliance as Seed Oil Free Certified since July 2024 (kitchen audit + ingredient review).',
    url: 'https://seedoilfreecertified.com/brand/just-be-kitchen',
  },
  {
    match: 'roam artisan burgers',
    criteria: ['seedOilFree'],
    source: 'Seed Oil Free Certified',
    detail: 'Reported as certified by the Seed Oil Free Alliance, which audits kitchens for compliance.',
    url: 'https://www.pitco.com/blog/seed-oil-free-certification-making-waves-in-foodservice/',
  },
  // No sourced sugar-free / no-added-sugar entries yet — add them here with a source URL.
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’'.,!&-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const NORMALIZED = VERIFIED_ENTRIES.map((e) => ({ ...e, match: normalize(e.match) }));

// Upgrades matching criteria to 'verified' and puts the sourced statement first in the evidence.
export function applyVerified(name: string, criteria: Record<CriterionKey, CriterionResult>): void {
  const n = normalize(name);
  for (const entry of NORMALIZED) {
    if (!n.startsWith(entry.match)) continue;
    for (const key of entry.criteria) {
      const ev: Evidence = { source: entry.source, snippet: entry.detail, supports: true, url: entry.url };
      criteria[key] = { confidence: 'verified', evidence: [ev, ...criteria[key].evidence] };
    }
  }
}

// Cooking-oil attributes confirmed by the same announcements (Sweetgreen, True Food Kitchen).
const VERIFIED_ATTRIBUTES: { match: string; attributes: AttributeKey[]; url: string; detail: string }[] = [
  {
    match: 'sweetgreen',
    attributes: ['oliveOil', 'avocadoOil'],
    url: 'https://www.salon.com/2025/01/24/sweetgreen-ditches-seed-oils-launches-seed-oil-free-menu/',
    detail: 'Cooks with extra-virgin olive oil and avocado oil (2025 announcement).',
  },
  {
    match: 'true food kitchen',
    attributes: ['oliveOil', 'avocadoOil'],
    url: 'https://www.nrn.com/casual-dining/true-food-kitchen-goes-seed-oil-free',
    detail: 'Cooks with avocado oil and olive oil (2025 announcement).',
  },
];

export function applyVerifiedAttributes(name: string, attributes: Partial<Record<AttributeKey, AttributeResult>>): void {
  const n = normalize(name);
  for (const entry of VERIFIED_ATTRIBUTES) {
    if (!n.startsWith(normalize(entry.match))) continue;
    for (const key of entry.attributes) {
      const ev: Evidence = { source: 'Company announcement', snippet: entry.detail, supports: true, url: entry.url };
      attributes[key] = { level: 'yes', evidence: [ev, ...(attributes[key]?.evidence ?? [])].slice(0, 3) };
    }
  }
}
