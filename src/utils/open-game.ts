import { router } from 'expo-router';

import type { TrendingGame } from '@/services/kick';
import { findGameByName } from '@/services/wikidata';

/** Kick names some categories like "Grand Theft Auto V (GTA)"; drop the extra part before searching. */
export const cleanGameName = (name: string) => name.replace(/\s*\(.*?\)\s*/g, ' ').trim();

/**
 * Opens the game page for a trending Kick category by finding the game on Wikidata.
 * Returns false when no match was found.
 */
export async function openTrendingGame(t: TrendingGame): Promise<boolean> {
  const hit = await findGameByName(cleanGameName(t.name)).catch(() => null);
  if (!hit) return false;
  router.push({ pathname: '/game/[id]', params: { id: hit.qid, kick: t.slug } });
  return true;
}
