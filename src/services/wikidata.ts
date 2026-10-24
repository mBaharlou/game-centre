import { deviceFromLabel, type Device, type StoreIds } from '@/data/platforms';
import { APP_AGENT, getJson } from '@/services/http';

/**
 * Wikidata is a free, open database that knows almost every video game ever released:
 * its platforms, release date, studios and its IDs on every store.
 */

const API = 'https://www.wikidata.org/w/api.php';
const HEADERS = { 'Api-User-Agent': APP_AGENT };
const VIDEO_GAME = 'Q7889';

type Snak = { datavalue?: { value: unknown } };
type Claims = Record<string, { mainsnak: Snak; rank?: string }[]>;
type Entity = {
  id: string;
  labels?: Record<string, { value: string }>;
  descriptions?: Record<string, { value: string }>;
  claims?: Claims;
  sitelinks?: Record<string, { title: string }>;
};

export type GameHit = {
  qid: string;
  title: string;
  description: string;
  year: string | null;
  devices: Device[];
  steamAppId: string | null;
};

export type WikiGame = GameHit & {
  enwiki: string | null;
  releaseDate: string | null;
  developers: string[];
  publishers: string[];
  genres: string[];
  modes: string[];
  platformLabels: string[];
  storeIds: StoreIds;
  twitchCategory: string | null;
  metacriticSlug: string | null;
  opencriticId: string | null;
  pegi: string | null;
};

const url = (params: Record<string, string>) =>
  `${API}?${new URLSearchParams({ format: 'json', origin: '*', ...params }).toString()}`;

function strings(claims: Claims | undefined, prop: string): string[] {
  return (claims?.[prop] ?? [])
    .filter((c) => c.rank !== 'deprecated')
    .map((c) => c.mainsnak.datavalue?.value)
    .map((v) => (typeof v === 'string' ? v : (v as { id?: string } | undefined)?.id))
    .filter((v): v is string => !!v);
}

function firstDate(claims: Claims | undefined): string | null {
  const times = (claims?.P577 ?? [])
    .map((c) => (c.mainsnak.datavalue?.value as { time?: string; precision?: number } | undefined) ?? null)
    .filter((t): t is { time: string; precision: number } => !!t?.time)
    .sort((a, b) => a.time.localeCompare(b.time));
  if (!times.length) return null;
  const { time, precision } = times[0];
  const date = new Date(time.replace(/^\+/, '').replace(/-00/g, '-01'));
  if (Number.isNaN(date.getTime())) return null;
  if (precision >= 11) return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  if (precision === 10) return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' });
  return String(date.getUTCFullYear());
}

const label = (e: Entity) => e.labels?.en?.value ?? e.id;

/** Labels for referenced items (platforms, studios, genres), cached for the session. */
const labelCache = new Map<string, string>();

async function labels(ids: string[]): Promise<Map<string, string>> {
  const missing = [...new Set(ids)].filter((id) => !labelCache.has(id));
  for (let i = 0; i < missing.length; i += 50) {
    const batch = missing.slice(i, i + 50);
    const res = await getJson<{ entities: Record<string, Entity> }>(
      url({ action: 'wbgetentities', ids: batch.join('|'), props: 'labels', languages: 'en', languagefallback: '1' }),
      { headers: HEADERS, ttl: 24 * 3600_000 },
    );
    for (const e of Object.values(res.entities)) labelCache.set(e.id, label(e));
  }
  return labelCache;
}

async function entities(ids: string[], props = 'labels|descriptions|claims|sitelinks') {
  if (!ids.length) return [];
  const res = await getJson<{ entities: Record<string, Entity> }>(
    url({ action: 'wbgetentities', ids: ids.join('|'), props, languages: 'en', languagefallback: '1', sitefilter: 'enwiki' }),
    { headers: HEADERS },
  );
  return ids.map((id) => res.entities[id]).filter((e): e is Entity => !!e && !('missing' in e));
}

function devicesOf(e: Entity, names: Map<string, string>): Device[] {
  const found = strings(e.claims, 'P400')
    .map((id) => deviceFromLabel(names.get(id) ?? ''))
    .filter((d): d is Device => !!d);
  return [...new Set(found)];
}

function toHit(e: Entity, names: Map<string, string>): GameHit {
  return {
    qid: e.id,
    title: label(e),
    description: e.descriptions?.en?.value ?? '',
    year: firstDate(e.claims)?.slice(-4) ?? null,
    devices: devicesOf(e, names),
    steamAppId: strings(e.claims, 'P1733')[0] ?? null,
  };
}

/** Finds video games matching a search, best matches first. */
export async function searchGames(query: string, limit = 20): Promise<GameHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const found = await getJson<{ search: { id: string }[] }>(
    url({ action: 'wbsearchentities', search: q, language: 'en', uselang: 'en', type: 'item', limit: '40' }),
    { headers: HEADERS },
  );
  const list = await entities(found.search.map((s) => s.id), 'labels|descriptions|claims');
  const games = list.filter((e) => strings(e.claims, 'P31').includes(VIDEO_GAME));
  const names = await labels(games.flatMap((e) => strings(e.claims, 'P400')));
  return games.slice(0, limit).map((e) => toHit(e, names));
}

/** Everything the store needs about one game. */
export async function getWikiGame(qid: string): Promise<WikiGame | null> {
  const [e] = await entities([qid]);
  if (!e) return null;
  const c = e.claims;
  const refs = ['P400', 'P178', 'P123', 'P136', 'P404', 'P908'].flatMap((p) => strings(c, p));
  const names = await labels(refs);
  const named = (p: string) => [...new Set(strings(c, p).map((id) => names.get(id) ?? id))];
  const one = (p: string) => strings(c, p)[0];

  return {
    ...toHit(e, names),
    enwiki: e.sitelinks?.enwiki?.title ?? null,
    releaseDate: firstDate(c),
    developers: named('P178'),
    publishers: named('P123'),
    genres: named('P136'),
    modes: named('P404'),
    platformLabels: named('P400'),
    storeIds: {
      steam: one('P1733'),
      epic: one('P6278'),
      gog: one('P2725'),
      battlenet: one('P13193'),
      microsoft: one('P5885'),
      psConcept: one('P12332'),
      psProduct: one('P5944'),
      nintendo: one('P8084'),
      appstore: one('P3861'),
      googleplay: one('P3418'),
    },
    twitchCategory: one('P4467') ?? null,
    metacriticSlug: one('P12054') ?? null,
    opencriticId: one('P2864') ?? null,
    pegi: named('P908')[0] ?? null,
  };
}

/** The Wikidata item for a Steam game, if there is one. */
export async function findQidBySteamAppId(appId: number | string): Promise<string | null> {
  const res = await getJson<{ query: { search: { title: string }[] } }>(
    url({ action: 'query', list: 'search', srsearch: `haswbstatement:P1733=${appId}`, srlimit: '1' }),
    { headers: HEADERS, ttl: 24 * 3600_000 },
  );
  return res.query.search[0]?.title ?? null;
}

/** Best Wikidata match for a game name (e.g. from a trending list). */
export async function findGameByName(name: string): Promise<GameHit | null> {
  const hits = await searchGames(name, 5);
  const exact = hits.find((h) => h.title.toLowerCase() === name.toLowerCase());
  return exact ?? hits[0] ?? null;
}
