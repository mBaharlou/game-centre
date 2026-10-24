// Refreshes src/data/steam.json from the public Steam store API:
// prices, release dates, genres, screenshots and official trailers.
// Run with: npm run update-games

import { writeFile } from 'node:fs/promises';

const APP_IDS = [
  1245620, // Elden Ring
  1086940, // Baldur's Gate 3
  1091500, // Cyberpunk 2077
  1174180, // Red Dead Redemption 2
  3240220, // Grand Theft Auto V Enhanced
  292030, // The Witcher 3: Wild Hunt
  730, // Counter-Strike 2
  570, // Dota 2
  1172470, // Apex Legends
  2358720, // Black Myth: Wukong
  2322010, // God of War Ragnarök
  553850, // Helldivers 2
  1145350, // Hades II
  413150, // Stardew Valley
  814380, // Sekiro: Shadows Die Twice
  1030300, // Hollow Knight: Silksong
  2246340, // Monster Hunter Wilds
  2767030, // Marvel Rivals
];

const OUT = new URL('../src/data/steam.json', import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clean = (url) => url?.split('?')[0];

async function fetchApp(id) {
  const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${id}&cc=us&l=english`);
  if (!res.ok) throw new Error(`Steam returned ${res.status} for ${id}`);
  const json = await res.json();
  const d = json[id]?.data;
  if (!json[id]?.success || !d) throw new Error(`No data for ${id}`);

  const image = (name) => `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/${name}`;
  return {
    appId: id,
    name: d.name,
    developers: d.developers ?? [],
    publishers: d.publishers ?? [],
    releaseDate: d.release_date?.date ?? '',
    isFree: d.is_free,
    price: d.price_overview
      ? { initial: d.price_overview.initial / 100, final: d.price_overview.final / 100, discount: d.price_overview.discount_percent }
      : null,
    genres: (d.genres ?? []).map((g) => g.description),
    categories: (d.categories ?? []).map((c) => c.description),
    metacritic: d.metacritic?.score ?? null,
    recommendations: d.recommendations?.total ?? null,
    systems: Object.entries(d.platforms ?? {}).filter(([, v]) => v).map(([k]) => k),
    images: {
      header: image('header.jpg'),
      cover: image('library_600x900.jpg'),
      hero: image('library_hero.jpg'),
    },
    screenshots: (d.screenshots ?? []).slice(0, 8).map((s) => clean(s.path_full)),
    trailers: (d.movies ?? [])
      .filter((m) => m.hls_h264)
      .slice(0, 5)
      .map((m) => ({ id: m.id, name: m.name, thumbnail: clean(m.thumbnail), hls: m.hls_h264 })),
  };
}

const apps = [];
for (const id of APP_IDS) {
  try {
    const app = await fetchApp(id);
    apps.push(app);
    console.log(`✓ ${app.name} (${app.trailers.length} trailers)`);
  } catch (err) {
    console.error(`✗ ${id}: ${err.message}`);
  }
  await sleep(1200);
}

await writeFile(OUT, JSON.stringify({ fetchedAt: new Date().toISOString(), apps }, null, 2) + '\n');
console.log(`Saved ${apps.length} games to src/data/steam.json`);
