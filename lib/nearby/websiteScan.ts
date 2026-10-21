// Server-only: reads restaurant homepages (+ one menu page) so the keyword rules can check
// what restaurants say about themselves, and finds their online-ordering link. Free — no Google calls.
import type { TextSource } from './scoring';

const TIMEOUT_MS = 5000;
const MAX_CHARS = 400_000;
const CONCURRENCY = 8;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const USER_AGENT = 'Mozilla/5.0 (compatible; HealthAppNearby/0.1)';

const cache = new Map<string, { at: number; info: WebsiteInfo }>();

async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok || !(res.headers.get('content-type') ?? '').includes('html')) return null;
    return (await res.text()).slice(0, MAX_CHARS);
  } catch {
    return null;
  }
}

const ENTITIES: Record<string, string> = { amp: '&', nbsp: ' ', quot: '"', apos: "'", lt: '<', gt: '>', rsquo: '’', lsquo: '‘', ndash: '–', mdash: '—' };

function htmlToText(html: string): string {
  return html
    .replace(/<(script|style|noscript|svg|head)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|section|article|br|tr)>/gi, '.\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#\d+|[a-z]+);/gi, (m, e: string) =>
      e.startsWith('#') ? String.fromCharCode(Number(e.slice(1))) : (ENTITIES[e.toLowerCase()] ?? m),
    )
    .replace(/[ \t]+/g, ' ')
    .replace(/(\s*\.\s*\n\s*)+/g, '.\n')
    .trim();
}

// First same-site link that looks like a menu page (PDF menus are skipped — can't read them yet).
function findMenuUrl(html: string, base: string): string | null {
  const baseUrl = new URL(base);
  const linkRe = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html))) {
    const [, href, label] = m;
    if (!/menu/i.test(href) && !/menu/i.test(label.replace(/<[^>]+>/g, ''))) continue;
    try {
      const url = new URL(href, baseUrl);
      if (url.hostname !== baseUrl.hostname || /\.pdf$/i.test(url.pathname)) continue;
      if (url.href.replace(/\/$/, '') === baseUrl.href.replace(/\/$/, '')) continue;
      return url.href;
    } catch {
      continue;
    }
  }
  return null;
}

// Menu link to show people: same-site page or PDF, or a menu hosted elsewhere — but not social sites,
// review sites or delivery apps (those aren't the restaurant's own menu).
const NOT_A_MENU_HOST = /(^|\.)(facebook|instagram|twitter|x|tiktok|yelp|tripadvisor|google|doordash|ubereats|grubhub|postmates|seamless)\./;

function findMenuLink(html: string, base: string): string | null {
  const baseUrl = new URL(base);
  const linkRe = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html))) {
    const [, href, label] = m;
    if (!/menu/i.test(href) && !/menu/i.test(label.replace(/<[^>]+>/g, ''))) continue;
    try {
      const url = new URL(href, baseUrl);
      if (!/^https?:$/.test(url.protocol) || NOT_A_MENU_HOST.test(`.${url.hostname}`)) continue;
      if (url.href.replace(/\/$/, '') === baseUrl.href.replace(/\/$/, '')) continue;
      return url.href;
    } catch {
      continue;
    }
  }
  return null;
}

// Online-ordering platforms restaurants commonly link to from their own site.
const ORDER_HOSTS = [
  'toasttab.com', 'order.online', 'chownow.com', 'square.site', 'squareup.com', 'olo.com', 'clover.com',
  'menufy.com', 'spoton.com', 'slicelife.com', 'beyondmenu.com', 'order.mealkeyway.com', 'owner.com',
  'doordash.com', 'ubereats.com', 'grubhub.com', 'seamless.com', 'postmates.com', 'ezcater.com',
];

// Prefer a link to a known ordering platform; otherwise a link labelled "order online/now/pickup/delivery".
function findOrderUrl(html: string, base: string): string | null {
  const linkRe = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let labelled: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = linkRe.exec(html))) {
    const [, href, rawLabel] = m;
    let url: URL;
    try {
      url = new URL(href, base);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(url.protocol)) continue;
    // Ordering platforms also host gift cards, jobs, reservations etc. — those aren't ordering links.
    if (/gift|career|jobs?\b|reserv|loyalty|reward|marketing|signup|newsletter/i.test(url.pathname + url.search)) continue;
    if (/^(tables|reservations?)\./i.test(url.hostname)) continue;
    const host = url.hostname.replace(/^www\./, '');
    if (ORDER_HOSTS.some((h) => host === h || host.endsWith('.' + h))) return url.href;
    const label = rawLabel.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!labelled && /\border\b.{0,12}\b(online|now|here|pickup|delivery|ahead|to go)\b|\border online\b/i.test(label)) {
      labelled = url.href;
    }
  }
  return labelled;
}

// Only show menu links that actually load (some restaurant sites link to pages that no longer exist).
async function linkWorks(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, redirect: 'follow', signal: AbortSignal.timeout(TIMEOUT_MS) });
    res.body?.cancel().catch(() => {});
    return res.ok;
  } catch {
    return false;
  }
}

export type WebsiteInfo = { sources: TextSource[]; orderUrl: string | null; menuUrl: string | null };

const EMPTY: WebsiteInfo = { sources: [], orderUrl: null, menuUrl: null };

async function scanOne(url: string): Promise<WebsiteInfo> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.info;

  let info = EMPTY;
  if (/^https?:\/\//i.test(url)) {
    const home = await fetchHtml(url);
    if (home) {
      const sources: TextSource[] = [{ source: 'Website', text: htmlToText(home) }];
      let orderUrl = findOrderUrl(home, url);
      const menuUrl = findMenuUrl(home, url);
      const menu = menuUrl ? await fetchHtml(menuUrl) : null;
      if (menu && menuUrl) {
        sources.push({ source: 'Website menu', text: htmlToText(menu) });
        orderUrl ??= findOrderUrl(menu, menuUrl);
      }
      const menuLink = findMenuLink(home, url) ?? menuUrl;
      info = { sources, orderUrl, menuUrl: menuLink && (await linkWorks(menuLink)) ? menuLink : null };
    }
  }
  cache.set(url, { at: Date.now(), info });
  return info;
}

export async function scanWebsites(urls: string[]): Promise<Map<string, WebsiteInfo>> {
  const unique = [...new Set(urls)];
  const results = new Map<string, WebsiteInfo>();
  let next = 0;
  const worker = async () => {
    while (next < unique.length) {
      const url = unique[next++];
      results.set(url, await scanOne(url));
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, unique.length) }, worker));
  return results;
}
