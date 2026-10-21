// Server-only: picks a logo for each restaurant card.
//   Known chain (onboarding list) → its logo.  Otherwise → the restaurant's own site icon, but only if
//   one actually exists (Google's favicon service returns 404 + a generic globe when it doesn't).
import { guideKeyForName } from '../guides/guides';
import { RESTAURANTS } from '../profile/options';

const FAVICON = (domain: string, size: number) => `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; ok: boolean }>();

async function hasFavicon(domain: string): Promise<boolean> {
  const hit = cache.get(domain);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.ok;
  let ok = false;
  try {
    const res = await fetch(FAVICON(domain, 64), { signal: AbortSignal.timeout(4000) });
    ok = res.ok;
  } catch {
    ok = false;
  }
  cache.set(domain, { at: Date.now(), ok });
  return ok;
}

const domainOf = (url: string | undefined) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, '') : null;
  } catch {
    return null;
  }
};

export async function resolveLogos(places: { id: string; name: string; websiteUri?: string }[]): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  await Promise.all(
    places.map(async (p) => {
      const chain = guideKeyForName(p.name);
      const known = chain ? RESTAURANTS.find((r) => r.value === chain)?.image : undefined;
      if (known) return out.set(p.id, known);
      const domain = domainOf(p.websiteUri);
      // Big platforms (Instagram, Facebook, Linktree…) would show their logo, not the restaurant's.
      if (!domain || /(^|\.)(facebook|instagram|linktr|yelp|google|doordash|ubereats|grubhub|toasttab|square|wix|squarespace)\./.test(`.${domain}`)) {
        return out.set(p.id, null);
      }
      out.set(p.id, (await hasFavicon(domain)) ? FAVICON(domain, 128) : null);
    }),
  );
  return out;
}
