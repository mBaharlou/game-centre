import { useEffect, useState } from 'react';

import type { About } from '@/data/catalog';
import { getGame, type Game, type Trailer } from '@/data/games';
import { deviceFromLabel, type Device, type StoreIds } from '@/data/platforms';
import { findKickSlug } from '@/services/kick';
import { getSteamInfo, steamImage } from '@/services/steam';
import { findQidBySteamAppId, getWikiGame, type WikiGame } from '@/services/wikidata';
import { getWikiAbout, type WikiAbout } from '@/services/wikipedia';

/** Artwork for a game; any image can be missing for games without Steam art. */
export type Art = {
  title: string;
  accent: string;
  images: { cover?: string | null; hero?: string | null; header?: string | null };
};

/** Everything a game page shows, for our own catalog games and for any game found by search. */
export type GameDetails = Art & {
  /** Catalog id (e.g. "elden-ring") or Wikidata id (e.g. "Q349375"). */
  id: string;
  qid: string | null;
  curated: Game | null;
  tagline: string;
  releaseDate: string | null;
  developers: string[];
  publishers: string[];
  genres: string[];
  modes: string[];
  platformLabels: string[];
  devices: Device[];
  storeIds: StoreIds;
  steamAppId: string | null;
  steamSystems: string[];
  price: { initial: number; final: number; discount: number } | null;
  isFree: boolean | null;
  metacritic: number | null;
  metacriticSlug: string | null;
  opencriticId: string | null;
  pegi: string | null;
  twitchUrl: string;
  kickSlug: string | null;
  trailers: Trailer[];
  screenshots: string[];
  about: { kind: 'curated'; about: About } | { kind: 'wiki'; wiki: WikiAbout } | null;
};

const ACCENTS = ['#8B5CF6', '#22D3EE', '#F43F5E', '#F97316', '#34D399', '#FBBF24', '#6366F1', '#EC4899'];

export function accentFor(title: string) {
  return ACCENTS[[...title].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % ACCENTS.length];
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const twitchSearch =(title: string) => `https://www.twitch.tv/search?term=${encodeURIComponent(title)}`;

const STEAM_DEVICES: Record<string, Device> = { windows: 'pc', mac: 'mac', linux: 'linux' };

function fromCatalog(g: Game): GameDetails {
  return {
    id: g.id,
    qid: null,
    curated: g,
    title: g.title,
    accent: g.accent,
    images: g.images,
    tagline: g.tagline,
    releaseDate: g.releaseDate,
    developers: g.developers,
    publishers: g.publishers,
    genres: g.genres,
    modes: g.about.modes,
    platformLabels: [],
    devices: g.systems.map((s) => STEAM_DEVICES[s]).filter(Boolean),
    storeIds: { steam: String(g.appId) },
    steamAppId: String(g.appId),
    steamSystems: g.systems,
    price: g.isFree ? null : { initial: g.price, final: g.finalPrice, discount: g.discount },
    isFree: g.isFree,
    metacritic: g.metacritic,
    metacriticSlug: null,
    opencriticId: null,
    pegi: null,
    twitchUrl: `https://www.twitch.tv/directory/category/${g.twitch}`,
    kickSlug: g.kick,
    trailers: g.trailers,
    screenshots: g.screenshots,
    about: { kind: 'curated', about: g.about },
  };
}

function fromWiki(w: WikiGame): GameDetails {
  const steam = w.steamAppId;
  return {
    id: w.qid,
    qid: w.qid,
    curated: null,
    title: w.title,
    accent: accentFor(w.title),
    images: steam
      ? { cover: steamImage(steam, 'library_600x900.jpg'), hero: steamImage(steam, 'library_hero.jpg'), header: steamImage(steam, 'header.jpg') }
      : {},
    tagline: w.description ? w.description[0].toUpperCase() + w.description.slice(1) : '',
    releaseDate: w.releaseDate,
    developers: w.developers,
    publishers: w.publishers,
    genres: w.genres.map(capitalize),
    modes: w.modes.map(capitalize),
    platformLabels: w.platformLabels,
    devices: w.devices,
    storeIds: w.storeIds,
    steamAppId: steam,
    steamSystems: [],
    price: null,
    isFree: null,
    metacritic: null,
    metacriticSlug: w.metacriticSlug,
    opencriticId: w.opencriticId,
    pegi: w.pegi,
    twitchUrl: w.twitchCategory ? `https://www.twitch.tv/directory/category/${encodeURIComponent(w.twitchCategory)}` : twitchSearch(w.title),
    kickSlug: null,
    trailers: [],
    screenshots: [],
    about: null,
  };
}

/** Adds Wikidata's platform and store info to a catalog game. */
function mergeWiki(base: GameDetails, w: WikiGame): GameDetails {
  const devices = [...new Set([...base.devices, ...w.devices, ...w.platformLabels.map(deviceFromLabel).filter((d): d is Device => !!d)])];
  return {
    ...base,
    qid: w.qid,
    devices,
    platformLabels: w.platformLabels,
    storeIds: { ...w.storeIds, steam: base.storeIds.steam ?? w.storeIds.steam },
    modes: base.modes.length ? base.modes : w.modes.map(capitalize),
    metacriticSlug: w.metacriticSlug,
    opencriticId: w.opencriticId,
    pegi: w.pegi,
  };
}

type State = { details: GameDetails | null; loading: boolean; error: boolean };

/**
 * Loads a game page. Catalog games show at once and gain store info as it arrives;
 * other games are built from Wikidata, Wikipedia, Steam and Kick.
 */
export function useGameDetails(id: string | undefined, hints: { kickSlug?: string } = {}): State {
  const curated = id ? getGame(id) : undefined;
  const [state, setState] = useState<State>(() =>
    curated ? { details: fromCatalog(curated), loading: true, error: false } : { details: null, loading: !!id, error: false },
  );
  const kickHint = hints.kickSlug;

  useEffect(() => {
    if (!id) return;
    let active = true;
    const update = (fn: (d: GameDetails) => GameDetails) =>
      active && setState((s) => (s.details ? { ...s, details: fn(s.details) } : s));

    (async () => {
      const catalogGame = getGame(id);
      try {
        if (catalogGame) {
          const qid = await findQidBySteamAppId(catalogGame.appId);
          const wiki = qid ? await getWikiGame(qid) : null;
          if (wiki) update((d) => mergeWiki(d, wiki));
          if (active) setState((s) => ({ ...s, loading: false }));
          return;
        }

        const wiki = /^Q\d+$/.test(id) ? await getWikiGame(id) : null;
        if (!active) return;
        if (!wiki) {
          setState({ details: null, loading: false, error: true });
          return;
        }
        setState({ details: fromWiki(wiki), loading: true, error: false });

        // Fill in the rest in parallel; each part shows up as soon as it's ready.
        await Promise.all([
          (kickHint ? Promise.resolve(kickHint) : findKickSlug(wiki.title)).then((slug) => update((d) => ({ ...d, kickSlug: slug }))),
          wiki.enwiki
            ? getWikiAbout(wiki.enwiki)
                .then((about) => about && update((d) => ({ ...d, about: { kind: 'wiki', wiki: about } })))
                .catch(() => undefined)
            : Promise.resolve(),
          wiki.steamAppId
            ? getSteamInfo(wiki.steamAppId).then(
                (steam) =>
                  steam &&
                  update((d) => ({
                    ...d,
                    price: steam.price,
                    isFree: steam.isFree,
                    metacritic: steam.metacritic,
                    steamSystems: steam.systems,
                    trailers: steam.trailers,
                    screenshots: steam.screenshots,
                    tagline: steam.shortDescription || d.tagline,
                  })),
              )
            : Promise.resolve(),
        ]);
        if (active) setState((s) => ({ ...s, loading: false }));
      } catch {
        if (active) setState((s) => ({ ...s, loading: false, error: !s.details }));
      }
    })();

    return () => {
      active = false;
    };
  }, [id, kickHint]);

  return state;
}
