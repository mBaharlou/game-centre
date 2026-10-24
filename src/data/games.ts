import { catalog, type About, type IconName } from '@/data/catalog';
import steam from '@/data/steam.json';

export type { IconName };

export type Trailer = { id: number; name: string; thumbnail: string; hls: string };

export type Game = {
  id: string;
  appId: number;
  title: string;
  tagline: string;
  genres: string[];
  accent: string;
  featured: boolean;
  developers: string[];
  publishers: string[];
  releaseDate: string;
  isFree: boolean;
  /** Price in USD before discount; 0 for free-to-play games. */
  price: number;
  finalPrice: number;
  discount: number;
  metacritic: number | null;
  systems: string[];
  steamFeatures: string[];
  images: { header: string; cover: string; hero: string };
  screenshots: string[];
  trailers: Trailer[];
  twitch: string;
  kick: string;
  about: About;
};

type SteamApp = (typeof steam.apps)[number];

/** Steam features worth showing in the store, in display order. */
const FEATURES = [
  'Single-player',
  'Online PvP',
  'Online Co-op',
  'Shared/Split Screen Co-op',
  'Cross-Platform Multiplayer',
  'Full controller support',
  'Steam Achievements',
  'Steam Cloud',
];

const steamById = new Map<number, SteamApp>(steam.apps.map((a) => [a.appId, a]));

export const games: Game[] = catalog.flatMap((entry) => {
  const s = steamById.get(entry.appId);
  if (!s) return [];
  return [
    {
      ...entry,
      featured: !!entry.featured,
      developers: s.developers,
      publishers: s.publishers,
      releaseDate: s.releaseDate,
      isFree: s.isFree,
      price: s.price?.initial ?? 0,
      finalPrice: s.price?.final ?? 0,
      discount: s.price?.discount ?? 0,
      metacritic: s.metacritic,
      systems: s.systems,
      steamFeatures: FEATURES.filter((f) => s.categories.includes(f)),
      images: s.images,
      screenshots: s.screenshots,
      trailers: s.trailers,
    },
  ];
});

/** When the Steam prices and trailers were last refreshed (npm run update-games). */
export const pricesUpdatedAt = new Date(steam.fetchedAt);

export function getGame(id: string) {
  return games.find((g) => g.id === id);
}

export const ALL_GENRES = ['All', 'Free to play', 'On sale', ...Array.from(new Set(games.flatMap((g) => g.genres))).sort()];

export function matchesGenre(game: Game, genre: string) {
  if (genre === 'All') return true;
  if (genre === 'Free to play') return game.isFree;
  if (genre === 'On sale') return game.discount > 0;
  return game.genres.includes(genre);
}

export function formatPrice(value: number) {
  return value === 0 ? 'Free' : `$${value.toFixed(2)}`;
}

export function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(value);
}

const enc = encodeURIComponent;

/** Outside links. Every URL here opens a real page on the platform. */
export const links = {
  steam: (g: Game) => `https://store.steampowered.com/app/${g.appId}`,
  twitch: (g: Game) => `https://www.twitch.tv/directory/category/${g.twitch}`,
  kick: (g: Game) => `https://kick.com/category/${g.kick}`,
  kickChannel: (slug: string) => `https://kick.com/${slug}`,
  /** YouTube search with the "Live" filter switched on. */
  youtubeLive: (g: Game) => `https://www.youtube.com/results?search_query=${enc(g.title)}&sp=EgJAAQ%253D%253D`,
  youtube: (query: string) => `https://www.youtube.com/results?search_query=${enc(query)}`,
};

/** Ready-made YouTube searches for the "best players" section of a game. */
export function youtubeTopics(g: Game): { icon: IconName; title: string; subtitle: string; url: string }[] {
  return [
    { icon: 'trophy-outline', title: 'Best players & pro gameplay', subtitle: 'Top-level play to learn from', url: links.youtube(`${g.title} pro gameplay best player`) },
    { icon: 'school-outline', title: 'Beginner guides', subtitle: 'Tips for your first hours', url: links.youtube(`${g.title} beginner guide tips`) },
    { icon: 'timer-outline', title: 'Speedruns & records', subtitle: 'The fastest and most skilled runs', url: links.youtube(`${g.title} speedrun world record`) },
    { icon: 'star-outline', title: 'Reviews', subtitle: 'Is it worth buying?', url: links.youtube(`${g.title} review`) },
  ];
}
