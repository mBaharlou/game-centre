import type { IconName } from '@/data/catalog';

/** Ways to play a game, grouped the way people buy them. */
export type PlayOption = 'pc' | 'playstation' | 'xbox' | 'switch' | 'deck' | 'mac' | 'mobile';

/** Single hardware platforms as they appear in game data. */
export type Device =
  | 'pc'
  | 'mac'
  | 'linux'
  | 'ps5'
  | 'ps4'
  | 'xbox-series'
  | 'xbox-one'
  | 'switch2'
  | 'switch'
  | 'ios'
  | 'android';

/** Maps a platform name (e.g. from Wikidata) to a device we know how to sell for. */
export function deviceFromLabel(label: string): Device | null {
  const l = label.toLowerCase();
  if (/playstation 5/.test(l)) return 'ps5';
  if (/playstation 4/.test(l)) return 'ps4';
  if (/xbox series/.test(l)) return 'xbox-series';
  if (/xbox one/.test(l)) return 'xbox-one';
  if (/nintendo switch 2/.test(l)) return 'switch2';
  if (/nintendo switch/.test(l)) return 'switch';
  if (/^(microsoft )?windows|personal computer|^pc$/.test(l)) return 'pc';
  if (/macos|mac os|os x/.test(l)) return 'mac';
  if (/linux|steamos/.test(l)) return 'linux';
  if (/^ios|ipados/.test(l)) return 'ios';
  if (/android/.test(l)) return 'android';
  return null;
}

/** Profile "Where do you play?" choices mapped to play options. */
export const PROFILE_PLATFORM_OPTION: Record<string, PlayOption> = {
  PC: 'pc',
  PlayStation: 'playstation',
  Xbox: 'xbox',
  'Nintendo Switch': 'switch',
  'Steam Deck': 'deck',
  Mobile: 'mobile',
};

export type StoreId =
  | 'steam'
  | 'epic'
  | 'gog'
  | 'battlenet'
  | 'microsoft'
  | 'xbox'
  | 'playstation'
  | 'nintendo'
  | 'appstore'
  | 'googleplay';

export const STORES: Record<StoreId, { name: string; color: string; icon: IconName }> = {
  steam: { name: 'Steam', color: '#66C0F4', icon: 'steam' },
  epic: { name: 'Epic Games Store', color: '#E6E6E6', icon: 'alpha-e-box' },
  gog: { name: 'GOG', color: '#B57EDC', icon: 'alpha-g-box' },
  battlenet: { name: 'Battle.net', color: '#148EFF', icon: 'shield-sword' },
  microsoft: { name: 'Microsoft Store', color: '#00A4EF', icon: 'microsoft-windows' },
  xbox: { name: 'Xbox Store', color: '#107C10', icon: 'microsoft-xbox' },
  playstation: { name: 'PlayStation Store', color: '#2E6DB4', icon: 'sony-playstation' },
  nintendo: { name: 'Nintendo eShop', color: '#E60012', icon: 'nintendo-switch' },
  appstore: { name: 'App Store', color: '#0A84FF', icon: 'apple' },
  googleplay: { name: 'Google Play', color: '#34A853', icon: 'google-play' },
};

/** Store IDs a game can have (from Wikidata properties). */
export type StoreIds = Partial<{
  steam: string;
  epic: string;
  gog: string;
  battlenet: string;
  microsoft: string;
  psConcept: string;
  psProduct: string;
  nintendo: string;
  appstore: string;
  googleplay: string;
}>;

const enc = encodeURIComponent;

/** Direct store page when we know the ID, otherwise the store's own search for the title. */
export const storeUrl = {
  steam: (ids: StoreIds, title: string) =>
    ids.steam ? `https://store.steampowered.com/app/${ids.steam}` : `https://store.steampowered.com/search/?term=${enc(title)}`,
  epic: (ids: StoreIds, title: string) =>
    ids.epic ? `https://store.epicgames.com/p/${ids.epic}` : `https://store.epicgames.com/en-US/browse?q=${enc(title)}`,
  gog: (ids: StoreIds, title: string) => (ids.gog ? `https://www.gog.com/${ids.gog}` : `https://www.gog.com/en/games?query=${enc(title)}`),
  battlenet: (ids: StoreIds) => `https://eu.shop.battle.net/en-gb/product/${ids.battlenet}`,
  microsoft: (ids: StoreIds) => `https://apps.microsoft.com/detail/${ids.microsoft}`,
  xbox: (ids: StoreIds, title: string) =>
    ids.microsoft ? `https://www.xbox.com/en-US/games/store/-/${ids.microsoft}` : `https://www.xbox.com/en-US/search/results/games?q=${enc(title)}`,
  playstation: (ids: StoreIds, title: string) =>
    ids.psConcept
      ? `https://store.playstation.com/en-us/concept/${ids.psConcept}`
      : ids.psProduct
        ? `https://store.playstation.com/en-us/product/${ids.psProduct}`
        : `https://store.playstation.com/en-us/search/${enc(title)}`,
  nintendo: (ids: StoreIds, title: string) =>
    ids.nintendo ? `https://www.nintendo.com/us/store/products/${ids.nintendo}/` : `https://www.nintendo.com/us/search/#q=${enc(title)}`,
  appstore: (ids: StoreIds, title: string) =>
    ids.appstore ? `https://apps.apple.com/app/id${ids.appstore}` : `https://apps.apple.com/us/search?term=${enc(title)}`,
  googleplay: (ids: StoreIds, title: string) =>
    ids.googleplay ? `https://play.google.com/store/apps/details?id=${ids.googleplay}` : `https://play.google.com/store/search?q=${enc(title)}&c=apps`,
};

/**
 * How well each way of playing runs games in general, on a 0–100 scale.
 * Based on the hardware's power; the advisor adjusts it with what it finds for the specific game.
 */
export const PLAY_OPTIONS: Record<PlayOption, { name: string; icon: IconName; portable: boolean }> = {
  pc: { name: 'PC', icon: 'monitor', portable: false },
  playstation: { name: 'PlayStation', icon: 'sony-playstation', portable: false },
  xbox: { name: 'Xbox', icon: 'microsoft-xbox', portable: false },
  switch: { name: 'Nintendo Switch', icon: 'nintendo-switch', portable: true },
  deck: { name: 'Steam Deck', icon: 'steam', portable: true },
  mac: { name: 'Mac', icon: 'apple', portable: false },
  mobile: { name: 'Phone & tablet', icon: 'cellphone', portable: true },
};
