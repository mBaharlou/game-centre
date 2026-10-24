import type { Trailer } from '@/data/games';
import { getJson } from '@/services/http';

export type SteamInfo = {
  price: { initial: number; final: number; discount: number } | null;
  isFree: boolean;
  metacritic: number | null;
  shortDescription: string;
  systems: string[];
  screenshots: string[];
  trailers: Trailer[];
};

export type DeckStatus = 'verified' | 'playable' | 'unsupported' | 'unknown';

export const steamImage = (appId: string | number, name: 'header.jpg' | 'library_600x900.jpg' | 'library_hero.jpg') =>
  `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}/${name}`;

type AppDetails = Record<
  string,
  {
    success: boolean;
    data?: {
      is_free: boolean;
      short_description?: string;
      price_overview?: { initial: number; final: number; discount_percent: number };
      metacritic?: { score: number };
      platforms?: Record<string, boolean>;
      screenshots?: { path_full: string }[];
      movies?: { id: number; name: string; thumbnail: string; hls_h264?: string }[];
    };
  }
>;

/**
 * Live store data for any Steam game. Steam doesn't allow browser requests (no CORS),
 * so this only works in the phone app; on the web it returns null.
 */
export async function getSteamInfo(appId: string | number): Promise<SteamInfo | null> {
  try {
    const res = await getJson<AppDetails>(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=us&l=english`, { ttl: 30 * 60_000 });
    const d = res[String(appId)]?.data;
    if (!d) return null;
    const clean = (u: string) => u.split('?')[0];
    return {
      price: d.price_overview
        ? { initial: d.price_overview.initial / 100, final: d.price_overview.final / 100, discount: d.price_overview.discount_percent }
        : null,
      isFree: d.is_free,
      metacritic: d.metacritic?.score ?? null,
      shortDescription: d.short_description ?? '',
      systems: Object.entries(d.platforms ?? {})
        .filter(([, v]) => v)
        .map(([k]) => k),
      screenshots: (d.screenshots ?? []).slice(0, 8).map((s) => clean(s.path_full)),
      trailers: (d.movies ?? [])
        .filter((m) => m.hls_h264)
        .slice(0, 5)
        .map((m) => ({ id: m.id, name: m.name, thumbnail: clean(m.thumbnail), hls: m.hls_h264! })),
    };
  } catch {
    return null;
  }
}

/** Valve's own Steam Deck compatibility rating. */
export async function getDeckStatus(appId: string | number): Promise<DeckStatus> {
  try {
    const res = await getJson<{ results?: { resolved_category?: number } }>(
      `https://store.steampowered.com/saleaction/ajaxgetdeckappcompatibilityreport?nAppID=${appId}`,
      { ttl: 24 * 3600_000 },
    );
    return (['unknown', 'unsupported', 'playable', 'verified'] as const)[res.results?.resolved_category ?? 0] ?? 'unknown';
  } catch {
    return 'unknown';
  }
}
