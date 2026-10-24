import { useEffect, useState } from 'react';

import { PLAY_OPTIONS, STORES, storeUrl, type PlayOption, type StoreId } from '@/data/platforms';
import { getPcDeals, type PcDeal } from '@/services/cheapshark';
import type { GameDetails } from '@/services/game-details';
import { getDeckStatus, type DeckStatus } from '@/services/steam';

export type StoreLink = { store: StoreId; name: string; url: string; direct: boolean };

export type BuyOption = {
  option: PlayOption;
  name: string;
  /** 0–100: how well this way of playing runs the game. */
  performance: number;
  note: string;
  price: number | null;
  stores: StoreLink[];
  badges: ('best-performance' | 'lowest-price' | 'portable' | 'yours')[];
};

export type Advice = {
  options: BuyOption[];
  deals: PcDeal[];
  deck: DeckStatus;
  loading: boolean;
  checkedAt: Date | null;
};

function link(store: StoreId, d: GameDetails): StoreLink {
  const ids = d.storeIds;
  const direct: Record<StoreId, boolean> = {
    steam: !!ids.steam,
    epic: !!ids.epic,
    gog: !!ids.gog,
    battlenet: !!ids.battlenet,
    microsoft: !!ids.microsoft,
    xbox: !!ids.microsoft,
    playstation: !!(ids.psConcept || ids.psProduct),
    nintendo: !!ids.nintendo,
    appstore: !!ids.appstore,
    googleplay: !!ids.googleplay,
  };
  return { store, name: STORES[store].name, url: storeUrl[store](ids, d.title), direct: direct[store] };
}

/**
 * Ranks every way to play a game. Performance comes from each platform's hardware
 * (PC > PS5/Xbox Series > Switch 2 > Mac > Steam Deck > last-gen > Switch > mobile),
 * adjusted with what was found online for this game: which platforms it's on,
 * Valve's Steam Deck rating and live PC prices.
 */
export function buildOptions(d: GameDetails, deals: PcDeal[], deck: DeckStatus, myOptions: PlayOption[]): BuyOption[] {
  const has = (...devices: string[]) => devices.some((x) => d.devices.includes(x as never));
  const steamPrice = d.isFree ? 0 : (d.price?.final ?? null);
  const cheapestDeal = deals[0]?.price ?? null;
  const pcPrice = d.isFree ? 0 : [steamPrice, cheapestDeal].filter((p): p is number => p !== null).sort((a, b) => a - b)[0] ?? null;
  const ids = d.storeIds;
  const options: Omit<BuyOption, 'badges' | 'name'>[] = [];

  if (has('pc')) {
    const stores: StoreId[] = [];
    if (ids.steam) stores.push('steam');
    if (ids.epic) stores.push('epic');
    if (ids.gog) stores.push('gog');
    if (ids.battlenet) stores.push('battlenet');
    if (ids.microsoft && !has('xbox-series', 'xbox-one')) stores.push('microsoft');
    if (!stores.length) stores.push('steam', 'epic');
    options.push({
      option: 'pc',
      performance: 100,
      note: 'The highest graphics settings, resolution and frame rate, plus mods and ultrawide screens. How high depends on your PC.',
      price: pcPrice,
      stores: stores.map((s) => link(s, d)),
    });
  }
  if (has('ps5', 'ps4')) {
    const ps5 = has('ps5');
    options.push({
      option: 'playstation',
      performance: ps5 ? 88 : 45,
      note: ps5
        ? 'Smooth on PS5 with quality and performance modes. PS5 Pro adds sharper visuals in supported games.'
        : 'PS4 version: lower resolution and frame rate than current consoles (it also runs on PS5).',
      price: null,
      stores: [link('playstation', d)],
    });
  }
  if (has('xbox-series', 'xbox-one')) {
    const series = has('xbox-series');
    options.push({
      option: 'xbox',
      performance: series ? 86 : 44,
      note: series
        ? 'Series X runs it at the top console settings; Series S at a lower resolution.'
        : 'Xbox One version: older hardware, lower performance (it also runs on Series X|S).',
      price: null,
      stores: [link('xbox', d)],
    });
  }
  if (has('switch2', 'switch')) {
    const two = has('switch2');
    options.push({
      option: 'switch',
      performance: two ? 60 : 30,
      note: two
        ? 'Switch 2: play on the TV or handheld. Less detail than PS5 or Xbox Series, but fully portable.'
        : 'The most portable, but the weakest hardware: reduced graphics and frame rate.',
      price: null,
      stores: [link('nintendo', d)],
    });
  }
  if (has('mac')) {
    options.push({
      option: 'mac',
      performance: 55,
      note: 'Runs natively on macOS. Performance depends on your Mac’s chip.',
      price: steamPrice,
      stores: [link('steam', d), ...(ids.gog ? [link('gog', d)] : [])],
    });
  }
  if (d.steamAppId && (deck === 'verified' || deck === 'playable' || has('linux'))) {
    options.push({
      option: 'deck',
      performance: deck === 'verified' ? 52 : deck === 'playable' ? 45 : 40,
      note:
        deck === 'verified'
          ? 'Verified by Valve: runs great on Steam Deck, handheld.'
          : deck === 'playable'
            ? 'Playable on Steam Deck, but may need small tweaks to settings or controls.'
            : 'Runs on SteamOS/Linux; Valve hasn’t rated it for Steam Deck yet.',
      price: steamPrice,
      stores: [link('steam', d)],
    });
  }
  if (has('ios', 'android')) {
    options.push({
      option: 'mobile',
      performance: 25,
      note: 'Play anywhere on your phone or tablet, with touch controls and the lowest graphics.',
      price: d.isFree ? 0 : null,
      stores: [...(has('ios') ? [link('appstore', d)] : []), ...(has('android') ? [link('googleplay', d)] : [])],
    });
  }

  const ranked = options.sort((a, b) => b.performance - a.performance);
  const priced = ranked.filter((o) => o.price !== null);
  const lowest = priced.length > 1 ? Math.min(...priced.map((o) => o.price!)) : null;

  return ranked.map((o, i) => ({
    ...o,
    name: PLAY_OPTIONS[o.option].name,
    badges: [
      ...(i === 0 ? (['best-performance'] as const) : []),
      ...(lowest !== null && o.price === lowest ? (['lowest-price'] as const) : []),
      ...(PLAY_OPTIONS[o.option].portable ? (['portable'] as const) : []),
      ...(myOptions.includes(o.option) ? (['yours'] as const) : []),
    ],
  }));
}

/** Looks up live prices and the Steam Deck rating, then ranks the ways to play. */
export function useBuyAdvice(details: GameDetails | null, myOptions: PlayOption[]): Advice {
  const [extra, setExtra] = useState<{ deals: PcDeal[]; deck: DeckStatus; loading: boolean; checkedAt: Date | null }>({
    deals: [],
    deck: 'unknown',
    loading: true,
    checkedAt: null,
  });
  const steamAppId = details?.steamAppId ?? null;
  const title = details?.title ?? '';
  const onPc = !!details?.devices.includes('pc');

  useEffect(() => {
    if (!title) return;
    let active = true;
    Promise.all([onPc ? getPcDeals({ steamAppId, title }) : Promise.resolve([]), steamAppId ? getDeckStatus(steamAppId) : Promise.resolve('unknown' as const)]).then(
      ([deals, deck]) => active && setExtra({ deals, deck, loading: false, checkedAt: new Date() }),
    );
    return () => {
      active = false;
    };
  }, [steamAppId, title, onPc]);

  return {
    options: details ? buildOptions(details, extra.deals, extra.deck, myOptions) : [],
    deals: extra.deals,
    deck: extra.deck,
    loading: extra.loading,
    checkedAt: extra.checkedAt,
  };
}
