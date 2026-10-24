import { useCallback, useEffect, useState } from 'react';

import { games } from '@/data/games';

/** A live Kick stream, trimmed down to what the app shows. */
export type KickStream = {
  id: number;
  gameId: string;
  channel: string;
  username: string;
  avatar: string | null;
  title: string;
  viewers: number;
  language: string;
  thumbnail: string | null;
};

type RawStream = {
  id: number;
  session_title: string;
  viewer_count: number;
  language: string;
  is_mature?: boolean;
  thumbnail?: { src?: string } | null;
  channel: { slug: string; user?: { username?: string; profilepic?: string | null } };
};

// Kick's public website endpoint. It needs no key, but browsers block it (no CORS),
// so on the web build the app falls back to opening Kick directly.
const LIVE_URL = 'https://kick.com/stream/livestreams/en';

async function fetchCategory(gameId: string, slug: string, limit: number): Promise<KickStream[]> {
  const url = `${LIVE_URL}?page=1&limit=${limit}&subcategory=${encodeURIComponent(slug)}&sort=desc`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Kick returned ${res.status}`);
  const json: { data?: RawStream[] } = await res.json();
  // Streams marked 18+ by their owners are left out of the store.
  return (json.data ?? []).filter((s) => !s.is_mature).map((s) => ({
    id: s.id,
    gameId,
    channel: s.channel.slug,
    username: s.channel.user?.username ?? s.channel.slug,
    avatar: s.channel.user?.profilepic ?? null,
    title: s.session_title,
    viewers: s.viewer_count,
    language: s.language,
    thumbnail: s.thumbnail?.src ?? null,
  }));
}

type State = { streams: KickStream[]; loading: boolean; error: boolean };

async function fetchGames(key: string, perGame: number): Promise<State> {
  const targets = games.filter((g) => key.split(',').includes(g.id));
  const results = await Promise.allSettled(targets.map((g) => fetchCategory(g.id, g.kick, perGame)));
  const streams = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])).sort((a, b) => b.viewers - a.viewers);
  const allFailed = results.length > 0 && results.every((r) => r.status === 'rejected');
  return { streams, loading: false, error: allFailed };
}

/**
 * Live Kick streams for the given games, most watched first.
 * Refreshes every minute while the screen is mounted.
 */
export function useKickLive(gameIds: string[], perGame = 6) {
  const key = gameIds.join(',');
  const [state, setState] = useState<State>({ streams: [], loading: true, error: false });

  useEffect(() => {
    let active = true;
    const run = () =>
      fetchGames(key, perGame).then((next) => {
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
    setState(await fetchGames(key, perGame));
  }, [key, perGame]);

  return { ...state, refresh };
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
    fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(channel)}/playback-url`, { headers: { Accept: 'application/json' } })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { data?: string } | null) => active && setState({ url: json?.data ?? null, loading: false }))
      .catch(() => active && setState({ url: null, loading: false }));
    return () => {
      active = false;
    };
  }, [channel]);

  return state;
}
