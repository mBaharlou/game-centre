import { useCallback, useEffect, useState } from 'react';

import { games } from '@/data/games';
import { getJson } from '@/services/http';

/**
 * Kick's public website endpoints: live streams per game, trending games and channel playback.
 * They need no key. If Kick blocks a request the app falls back to opening Kick directly.
 */

/** A live Kick stream, trimmed down to what the app shows. */
export type KickStream = {
  id: number;
  gameId: string;
  gameTitle: string;
  /** Kick category slug of the game. */
  slug: string;
  channel: string;
  username: string;
  avatar: string | null;
  title: string;
  viewers: number;
  language: string;
  thumbnail: string | null;
};

/** Which game to load streams for: our game id plus its Kick category slug. */
export type KickTarget = { gameId: string; title: string; slug: string };

type RawStream = {
  id: number;
  session_title: string;
  viewer_count: number;
  language: string;
  is_mature?: boolean;
  thumbnail?: { src?: string } | null;
  channel: { slug: string; user?: { username?: string; profilepic?: string | null } };
};

type RawCategory = { id: number; category_id: number; name: string; slug: string; viewers: number; is_mature?: boolean; banner?: { src?: string; srcset?: string; responsive?: string } };

async function fetchCategory(target: KickTarget, limit: number): Promise<KickStream[]> {
  const url = `https://kick.com/stream/livestreams/en?page=1&limit=${limit}&subcategory=${encodeURIComponent(target.slug)}&sort=desc`;
  const json = await getJson<{ data?: RawStream[] }>(url, { ttl: 30_000 });
  // Streams marked 18+ by their owners are left out of the store.
  return (json.data ?? [])
    .filter((s) => !s.is_mature)
    .map((s) => ({
      id: s.id,
      gameId: target.gameId,
      gameTitle: target.title,
      slug: target.slug,
      channel: s.channel.slug,
      username: s.channel.user?.username ?? s.channel.slug,
      avatar: s.channel.user?.profilepic ?? null,
      title: s.session_title,
      viewers: s.viewer_count,
      language: s.language,
      thumbnail: s.thumbnail?.src ?? null,
    }));
}

/** Kick targets for games from our own catalog. */
export function catalogTargets(ids: string[]): KickTarget[] {
  return games.filter((g) => ids.includes(g.id)).map((g) => ({ gameId: g.id, title: g.title, slug: g.kick }));
}

type State = { streams: KickStream[]; loading: boolean; error: boolean };

async function fetchAll(targets: KickTarget[], perGame: number): Promise<State> {
  const results = await Promise.allSettled(targets.map((t) => fetchCategory(t, perGame)));
  const streams = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])).sort((a, b) => b.viewers - a.viewers);
  const allFailed = results.length > 0 && results.every((r) => r.status === 'rejected');
  return { streams, loading: false, error: allFailed };
}

/**
 * Live Kick streams for the given games, most watched first.
 * Refreshes every minute while the screen is mounted.
 */
export function useKickLive(targets: KickTarget[], perGame = 6) {
  const key = JSON.stringify(targets);
  const [state, setState] = useState<State>({ streams: [], loading: targets.length > 0, error: false });

  useEffect(() => {
    const list: KickTarget[] = JSON.parse(key);
    if (!list.length) return;
    let active = true;
    const run = () =>
      fetchAll(list, perGame).then((next) => {
        if (active) setState(next);
      });
    run();
    const timer = setInterval(run, 60_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [key, perGame]);

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    setState(await fetchAll(JSON.parse(key), perGame));
  }, [key, perGame]);

  return { ...state, refresh };
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Kick's category slug for a game title, if Kick has one. */
export async function findKickSlug(title: string): Promise<string | null> {
  try {
    const res = await getJson<{ categories?: RawCategory[] }>(`https://kick.com/api/search?searched_word=${encodeURIComponent(title)}`, {
      ttl: 3600_000,
    });
    const cats = res.categories ?? [];
    const want = normalize(title);
    const exact = cats.find((c) => normalize(c.name) === want);
    const close = cats.find((c) => normalize(c.name).startsWith(want) || want.startsWith(normalize(c.name)));
    return (exact ?? close)?.slug ?? null;
  } catch {
    return null;
  }
}

export type TrendingGame = { name: string; slug: string; viewers: number; image: string | null };

/** Most-watched games on Kick right now (non-game categories like Just Chatting are left out). */
export function useTrendingGames(limit = 24) {
  const [state, setState] = useState<{ games: TrendingGame[]; loading: boolean }>({ games: [], loading: true });

  useEffect(() => {
    let active = true;
    getJson<{ data?: RawCategory[] }>(`https://kick.com/api/v1/subcategories?limit=${limit + 16}&page=1`, { ttl: 5 * 60_000 })
      .then((res) => {
        const list = (res.data ?? [])
          .filter((c) => c.category_id === 1 && !c.is_mature)
          .slice(0, limit)
          .map((c) => ({ name: c.name, slug: c.slug, viewers: c.viewers, image: c.banner?.src ?? firstSrc(c.banner?.srcset ?? c.banner?.responsive) }));
        if (active) setState({ games: list, loading: false });
      })
      .catch(() => active && setState({ games: [], loading: false }));
    return () => {
      active = false;
    };
  }, [limit]);

  return state;
}

function firstSrc(srcset?: string) {
  return srcset?.split(',')[0]?.trim().split(' ')[0] ?? null;
}

/**
 * Kick's stream video needs a short-lived token, so the player asks for a fresh,
 * signed playlist URL for the channel when it opens.
 */
export function useKickPlayback(channel: string | undefined) {
  const [state, setState] = useState<{ url: string | null; loading: boolean }>({ url: null, loading: !!channel });

  useEffect(() => {
    if (!channel) return;
    let active = true;
    getJson<{ data?: string }>(`https://kick.com/api/v2/channels/${encodeURIComponent(channel)}/playback-url`, { ttl: 0 })
      .then((json) => active && setState({ url: json?.data ?? null, loading: false }))
      .catch(() => active && setState({ url: null, loading: false }));
    return () => {
      active = false;
    };
  }, [channel]);

  return state;
}
