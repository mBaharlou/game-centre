import { getJson } from '@/services/http';

/**
 * CheapShark compares live PC prices across official digital stores
 * (Steam, GOG, Humble, Fanatical, Green Man Gaming and more). No key needed.
 */

const API = 'https://www.cheapshark.com/api/1.0';

export type PcDeal = { store: string; price: number; retail: number; savings: number; url: string };

type Store = { storeID: string; storeName: string; isActive: number };
type GameSearch = { gameID: string; steamAppID: string | null; external: string }[];
type GameDeals = { deals: { storeID: string; dealID: string; price: string; retailPrice: string; savings: string }[] };

async function stores() {
  const list = await getJson<Store[]>(`${API}/stores`, { ttl: 24 * 3600_000 });
  return new Map(list.filter((s) => s.isActive).map((s) => [s.storeID, s.storeName]));
}

/** Current PC prices for a game, cheapest first. Empty when the game isn't sold on PC stores. */
export async function getPcDeals({ steamAppId, title }: { steamAppId?: string | null; title: string }): Promise<PcDeal[]> {
  try {
    const query = steamAppId ? `steamAppID=${steamAppId}` : `title=${encodeURIComponent(title)}&exact=1`;
    const found = await getJson<GameSearch>(`${API}/games?${query}&limit=1`, { ttl: 30 * 60_000 });
    const game = found[0];
    if (!game) return [];
    const [details, names] = await Promise.all([getJson<GameDeals>(`${API}/games?id=${game.gameID}`, { ttl: 30 * 60_000 }), stores()]);
    return details.deals
      .filter((d) => names.has(d.storeID))
      .map((d) => ({
        store: names.get(d.storeID)!,
        price: Number(d.price),
        retail: Number(d.retailPrice),
        savings: Math.round(Number(d.savings)),
        url: `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(d.dealID)}`,
      }))
      .sort((a, b) => a.price - b.price);
  } catch {
    return [];
  }
}
