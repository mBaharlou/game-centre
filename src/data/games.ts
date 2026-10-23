import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

import type { PlatformId } from '@/constants/theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type Game = {
  id: string;
  title: string;
  studio: string;
  tagline: string;
  genres: string[];
  /** Price in USD before any discount. 0 means free to play. */
  price: number;
  /** Discount in percent, e.g. 25 for 25% off. */
  discount?: number;
  rating: number;
  ratingCount: number;
  release: string;
  systems: string[];
  ageRating: string;
  size: string;
  /** Gradient used for the generated cover art. */
  colors: readonly [string, string, string];
  icon: IconName;
  featured?: boolean;
  about: {
    overview: string[];
    howToPlay: { title: string; text: string }[];
    whoFor: { icon: IconName; title: string; text: string }[];
    features: string[];
    modes: string[];
  };
};

export type Stream = {
  id: string;
  gameId: string;
  platform: PlatformId;
  streamer: string;
  title: string;
  viewers: number;
  /** Position in the game's ranked leaderboard, if the streamer is ranked. */
  rank?: number;
  country: string;
};

export type Video = {
  id: string;
  gameId: string;
  platform: PlatformId;
  creator: string;
  title: string;
  views: number;
  duration: string;
  posted: string;
};

export const games: Game[] = [
  {
    id: 'neon-drift',
    title: 'Neon Drift',
    studio: 'Parallax Works',
    tagline: 'Anti-gravity racing through a city that never turns its lights off.',
    genres: ['Racing', 'Arcade', 'Multiplayer'],
    price: 29.99,
    discount: 30,
    rating: 4.7,
    ratingCount: 18240,
    release: 'Mar 2026',
    systems: ['PC', 'PS5', 'Xbox Series X|S', 'Switch 2'],
    ageRating: 'PEGI 7',
    size: '38 GB',
    colors: ['#FF2D95', '#8B5CF6', '#1E1B4B'],
    icon: 'car-sports',
    featured: true,
    about: {
      overview: [
        'Neon Drift is a high-speed arcade racer set in Lumen City, a vertical megacity where hover-cars race across rooftops, through tunnels and along the outside walls of skyscrapers.',
        'Every track has several layers. Drop down a level to find a shortcut, ride the magnetic rails to keep your speed, or drift through neon gates to fill your boost meter. A good racer is always reading the city.',
      ],
      howToPlay: [
        { title: 'Pick your rig', text: 'Choose from 40+ hover-cars. Light rigs turn sharply, heavy rigs keep their speed when they hit things.' },
        { title: 'Drift to charge', text: 'Hold drift through corners to fill your Flux meter. Longer, cleaner drifts charge it faster.' },
        { title: 'Spend your Flux', text: 'Use Flux to boost, or save it to flip gravity and drive on walls and ceilings.' },
        { title: 'Climb the ladder', text: 'Win ranked races to move from Bronze League to the Apex Circuit, where the top streamers race.' },
      ],
      whoFor: [
        { icon: 'speedometer', title: 'Speed lovers', text: 'If you want instant, fast action without simulation-level tuning.' },
        { icon: 'trophy', title: 'Competitive players', text: 'Time trials and ranked seasons reward perfect lines and practice.' },
        { icon: 'account-group', title: 'Couch friends', text: '4-player split screen on one sofa, plus online cross-play.' },
      ],
      features: [
        '60 tracks across 6 districts, each with day and night versions',
        'Full cross-play and cross-progression',
        'Track editor with shareable codes',
        'Synthwave soundtrack with 90+ licensed songs',
      ],
      modes: ['Career', 'Ranked', 'Time Trial', 'Split screen (4P)', 'Track Editor'],
    },
  },
  {
    id: 'ashen-crown',
    title: 'Ashen Crown',
    studio: 'Ember Hollow',
    tagline: 'A dying kingdom, a broken crown, and a hundred ways to die learning it.',
    genres: ['Action RPG', 'Soulslike', 'Dark Fantasy'],
    price: 59.99,
    rating: 4.9,
    ratingCount: 52310,
    release: 'Aug 2026',
    systems: ['PC', 'PS5', 'Xbox Series X|S'],
    ageRating: 'PEGI 16',
    size: '96 GB',
    colors: ['#F97316', '#B91C1C', '#1C0A07'],
    icon: 'sword-cross',
    featured: true,
    about: {
      overview: [
        'Ashen Crown is a challenging action RPG set in Vael, a kingdom slowly burning under a curse. You play an Unburnt, a warrior who cannot die but loses a little of their memory every time they fall.',
        'Fights are slow, heavy and fair. Every boss can be beaten with patience and by learning its patterns. The world is open and interconnected, full of hidden paths and optional bosses.',
      ],
      howToPlay: [
        { title: 'Learn the rhythm', text: 'Watch enemy attacks, dodge or parry at the right moment, then hit back. Stamina limits how much you can do.' },
        { title: 'Collect Embers', text: 'Defeated enemies drop Embers. Spend them at shrines to level up, but you drop them all when you die.' },
        { title: 'Build your warrior', text: 'Mix 12 weapon types, spells and relics. There are no fixed classes, so any build is possible.' },
        { title: 'Call for help', text: 'Stuck on a boss? Summon up to two other players to fight with you.' },
      ],
      whoFor: [
        { icon: 'sword', title: 'Challenge seekers', text: 'If beating a hard boss after 40 tries is your favourite feeling.' },
        { icon: 'map-search', title: 'Explorers', text: 'Huge hand-built world with secrets behind every wall.' },
        { icon: 'book-open-variant', title: 'Lore fans', text: 'The story is hidden in item descriptions, ruins and NPC dialogue.' },
      ],
      features: [
        '70+ bosses, 30 of them optional',
        'Seamless open world with no loading screens',
        'Online co-op and invasions',
        'New Game+ with remixed enemy placement',
      ],
      modes: ['Single player', 'Online co-op (3P)', 'PvP invasions', 'New Game+'],
    },
  },
  {
    id: 'starfall-tactics',
    title: 'Starfall Tactics',
    studio: 'Orbit Nine',
    tagline: 'Command a fleet. Outthink a galaxy. Every turn counts.',
    genres: ['Strategy', 'Turn-based', 'Sci-Fi'],
    price: 39.99,
    discount: 15,
    rating: 4.6,
    ratingCount: 9870,
    release: 'Jan 2026',
    systems: ['PC', 'Mac', 'PS5'],
    ageRating: 'PEGI 12',
    size: '24 GB',
    colors: ['#22D3EE', '#2563EB', '#0B1026'],
    icon: 'rocket-launch',
    about: {
      overview: [
        'Starfall Tactics is a turn-based space strategy game. You lead a small fleet of ships and pilots across a galaxy at war, choosing which systems to defend and which to let fall.',
        'Battles happen on 3D grids where position, facing and cover matter. Lose a ship and its crew is gone for good, so every decision carries weight.',
      ],
      howToPlay: [
        { title: 'Plan on the star map', text: 'Move between star systems, pick missions and manage fuel, money and crew morale.' },
        { title: 'Fight in turns', text: 'Each ship has action points. Move, shoot, shield or use special abilities, then the enemy moves.' },
        { title: 'Use the terrain', text: 'Asteroids give cover, nebulas hide you, and gravity wells bend the path of your missiles.' },
        { title: 'Upgrade your fleet', text: 'Research new hulls and weapons, and train pilots who gain traits as they survive battles.' },
      ],
      whoFor: [
        { icon: 'chess-knight', title: 'Strategy fans', text: 'If you like thinking several moves ahead, as in chess or XCOM-style games.' },
        { icon: 'clock-outline', title: 'Relaxed pace', text: 'No reflexes needed. Take as long as you want on every turn.' },
        { icon: 'reload', title: 'Replay lovers', text: 'Galaxies and stories are generated fresh for every campaign.' },
      ],
      features: [
        'Procedurally generated campaigns',
        'Permadeath for ships and pilots',
        'Asynchronous online duels',
        'Steam Workshop mod support',
      ],
      modes: ['Campaign', 'Skirmish', 'Online duels', 'Daily challenge'],
    },
  },
  {
    id: 'hollow-signal',
    title: 'Hollow Signal',
    studio: 'Static Bloom',
    tagline: 'Something is broadcasting from the abandoned station. Go find out what.',
    genres: ['Horror', 'Co-op', 'Survival'],
    price: 19.99,
    rating: 4.5,
    ratingCount: 31400,
    release: 'Oct 2025',
    systems: ['PC', 'PS5', 'Xbox Series X|S'],
    ageRating: 'PEGI 18',
    size: '18 GB',
    colors: ['#34D399', '#065F46', '#020A08'],
    icon: 'radio-tower',
    featured: true,
    about: {
      overview: [
        'Hollow Signal is a co-op horror game for 1 to 4 players. Your team enters a research station that went silent years ago, follows a strange radio signal, and tries to make it out alive.',
        'The creature hunts by sound. Talking on proximity voice chat, running or dropping something can bring it straight to you, which makes every match tense and often very funny.',
      ],
      howToPlay: [
        { title: 'Gear up', text: 'Pick a scanner, flashlight, radio or trap before each run. You can only carry four items.' },
        { title: 'Track the signal', text: 'Tune your radio to find the next clue. The signal gets stronger the closer you get.' },
        { title: 'Stay quiet', text: 'Crouch, whisper and close doors behind you. Sound is what the creature follows.' },
        { title: 'Escape together', text: 'Fix the lift and get as many teammates out as you can. Fallen players can still help as ghosts.' },
      ],
      whoFor: [
        { icon: 'ghost', title: 'Horror fans', text: 'Real jump scares and a creature that learns how your group plays.' },
        { icon: 'microphone', title: 'Friend groups', text: 'Proximity voice chat makes it a great game to play and to stream.' },
        { icon: 'timer-sand', title: 'Short sessions', text: 'Most runs take 20 to 40 minutes.' },
      ],
      features: [
        'Proximity voice chat',
        'Creature AI that changes based on your behaviour',
        '5 stations with random layouts',
        'Streamer mode that lets chat trigger events',
      ],
      modes: ['Solo', 'Online co-op (4P)', 'Nightmare mode'],
    },
  },
  {
    id: 'skyward-isles',
    title: 'Skyward Isles',
    studio: 'Little Lantern',
    tagline: 'Build a home on a floating island and sail the skies with friends.',
    genres: ['Survival', 'Crafting', 'Cozy'],
    price: 24.99,
    discount: 20,
    rating: 4.8,
    ratingCount: 27650,
    release: 'May 2026',
    systems: ['PC', 'PS5', 'Switch 2', 'Mobile'],
    ageRating: 'PEGI 3',
    size: '12 GB',
    colors: ['#38BDF8', '#22C55E', '#0C2A1E'],
    icon: 'island',
    about: {
      overview: [
        'Skyward Isles is a relaxing open-world crafting game. You start with a tiny floating rock and grow it into a flying island home with farms, workshops and friendly villagers.',
        'Build a sky-ship to travel between hundreds of islands, each with its own resources, puzzles and creatures to befriend. There is no combat pressure; you play at your own pace.',
      ],
      howToPlay: [
        { title: 'Gather', text: 'Collect wood, stone and cloud-cotton from your island and nearby rocks.' },
        { title: 'Craft and build', text: 'Snap-together building lets you make anything from a hut to a castle.' },
        { title: 'Grow and cook', text: 'Plant seeds, cook meals and trade with villagers who move onto your island.' },
        { title: 'Sail the skies', text: 'Build and upgrade a sky-ship to reach far islands and hidden ruins.' },
      ],
      whoFor: [
        { icon: 'flower', title: 'Cozy gamers', text: 'Calm, beautiful, and stress-free.' },
        { icon: 'hammer-wrench', title: 'Builders', text: 'Detailed building with hundreds of pieces and colours.' },
        { icon: 'human-male-child', title: 'Families', text: 'Suitable for all ages, with 4-player online co-op.' },
      ],
      features: [
        '300+ islands to discover',
        'Online co-op for up to 4 players',
        'Seasons and weather that affect your farm',
        'Photo mode and island sharing',
      ],
      modes: ['Single player', 'Online co-op (4P)', 'Creative mode'],
    },
  },
  {
    id: 'vanguard-zero',
    title: 'Vanguard Zero',
    studio: 'Hardline Interactive',
    tagline: '5v5 tactical shooter where one round can change everything.',
    genres: ['Shooter', 'Tactical', 'Esports'],
    price: 0,
    rating: 4.4,
    ratingCount: 120400,
    release: 'Feb 2025',
    systems: ['PC', 'PS5', 'Xbox Series X|S'],
    ageRating: 'PEGI 16',
    size: '45 GB',
    colors: ['#F43F5E', '#7C3AED', '#14051F'],
    icon: 'target',
    about: {
      overview: [
        'Vanguard Zero is a free-to-play 5v5 tactical shooter. One team attacks and plants a device; the other team defends. Each player picks an Operative with special gadgets.',
        'Aim matters, but teamwork, information and smart use of gadgets win rounds. It is one of the most watched esports games, with daily tournaments streamed by top players.',
      ],
      howToPlay: [
        { title: 'Pick an Operative', text: 'Choose from 24 Operatives. Each has two gadgets and one ultimate ability.' },
        { title: 'Buy each round', text: 'Earn credits by playing well and spend them on weapons and armour before each round.' },
        { title: 'Plant or defend', text: 'Attackers plant the device on a site; defenders stop them or defuse it.' },
        { title: 'Win 13 rounds', text: 'Teams switch sides at half-time. The first team to win 13 rounds wins the match.' },
      ],
      whoFor: [
        { icon: 'crosshairs-gps', title: 'Aim enthusiasts', text: 'Precise gunplay with little randomness.' },
        { icon: 'account-voice', title: 'Team players', text: 'Communication and strategy decide most matches.' },
        { icon: 'trophy-variant', title: 'Esports fans', text: 'Ranked mode from Iron to Zero, plus weekly tournaments.' },
      ],
      features: [
        'Free to play, no pay-to-win items',
        '128-tick servers',
        '9 competitive maps',
        'Built-in tournament mode',
      ],
      modes: ['Ranked', 'Unrated', 'Deathmatch', 'Tournaments'],
    },
  },
];

export const streams: Stream[] = [
  { id: 's1', gameId: 'ashen-crown', platform: 'twitch', streamer: 'KaelBlade', title: 'NO-HIT run, all 70 bosses. Day 3', viewers: 48210, rank: 1, country: 'SE' },
  { id: 's2', gameId: 'ashen-crown', platform: 'youtube', streamer: 'MiraSouls', title: 'Blind playthrough, chat picks my build', viewers: 21400, rank: 7, country: 'US' },
  { id: 's3', gameId: 'ashen-crown', platform: 'kick', streamer: 'Draven', title: 'Level 1 challenge, Ember King attempts', viewers: 9800, rank: 3, country: 'DE' },
  { id: 's4', gameId: 'vanguard-zero', platform: 'twitch', streamer: 'Zer0Recoil', title: 'Rank #1 grind, Zero tier solo queue', viewers: 63100, rank: 1, country: 'KR' },
  { id: 's5', gameId: 'vanguard-zero', platform: 'youtube', streamer: 'TacticalTess', title: 'Pro coach reviews YOUR games', viewers: 17250, rank: 12, country: 'GB' },
  { id: 's6', gameId: 'vanguard-zero', platform: 'kick', streamer: 'Ozzy', title: '2v2 showmatch vs pros', viewers: 22900, rank: 5, country: 'TR' },
  { id: 's7', gameId: 'neon-drift', platform: 'twitch', streamer: 'ApexAyla', title: 'World record attempts, Skyline Loop', viewers: 14300, rank: 1, country: 'JP' },
  { id: 's8', gameId: 'neon-drift', platform: 'youtube', streamer: 'DriftDad', title: 'Racing viewers in custom lobbies', viewers: 5200, country: 'CA' },
  { id: 's9', gameId: 'hollow-signal', platform: 'twitch', streamer: 'Whisperlynn', title: 'Nightmare mode with the squad (scary)', viewers: 31800, country: 'US' },
  { id: 's10', gameId: 'hollow-signal', platform: 'kick', streamer: 'BigMoe', title: 'Chat controls the creature tonight', viewers: 12600, country: 'BR' },
  { id: 's11', gameId: 'skyward-isles', platform: 'youtube', streamer: 'CozyCass', title: 'Building a cloud castle, chill vibes', viewers: 8900, country: 'NL' },
  { id: 's12', gameId: 'starfall-tactics', platform: 'twitch', streamer: 'AdmiralNyx', title: 'Ironman Insane, no ships lost so far', viewers: 6400, rank: 2, country: 'FR' },
];

export const videos: Video[] = [
  { id: 'v1', gameId: 'ashen-crown', platform: 'youtube', creator: 'KaelBlade', title: 'Ember King no-hit, every phase explained', views: 2400000, duration: '18:42', posted: '2 weeks ago' },
  { id: 'v2', gameId: 'ashen-crown', platform: 'youtube', creator: 'LoreKeeper', title: 'The full story of Vael in 30 minutes', views: 1100000, duration: '31:05', posted: '1 month ago' },
  { id: 'v3', gameId: 'ashen-crown', platform: 'twitch', creator: 'MiraSouls', title: 'Best early-game build for beginners', views: 420000, duration: '12:10', posted: '5 days ago' },
  { id: 'v4', gameId: 'vanguard-zero', platform: 'youtube', creator: 'Zer0Recoil', title: 'How I hit rank #1: settings, routine, mindset', views: 3800000, duration: '22:31', posted: '3 weeks ago' },
  { id: 'v5', gameId: 'vanguard-zero', platform: 'kick', creator: 'Ozzy', title: '1v5 clutch in the grand final', views: 960000, duration: '4:18', posted: '6 days ago' },
  { id: 'v6', gameId: 'neon-drift', platform: 'youtube', creator: 'ApexAyla', title: 'Every shortcut in Lumen City', views: 780000, duration: '15:57', posted: '1 month ago' },
  { id: 'v7', gameId: 'neon-drift', platform: 'twitch', creator: 'DriftDad', title: 'Wall-ride tutorial for beginners', views: 150000, duration: '8:44', posted: '2 days ago' },
  { id: 'v8', gameId: 'hollow-signal', platform: 'youtube', creator: 'Whisperlynn', title: 'Our funniest deaths, season 2', views: 5200000, duration: '14:20', posted: '2 months ago' },
  { id: 'v9', gameId: 'hollow-signal', platform: 'twitch', creator: 'BigMoe', title: 'Solo Nightmare clear, first ever', views: 640000, duration: '41:02', posted: '1 week ago' },
  { id: 'v10', gameId: 'skyward-isles', platform: 'youtube', creator: 'CozyCass', title: '10 building tips I wish I knew sooner', views: 890000, duration: '11:36', posted: '3 weeks ago' },
  { id: 'v11', gameId: 'starfall-tactics', platform: 'youtube', creator: 'AdmiralNyx', title: 'Beginner guide: your first 5 hours', views: 310000, duration: '26:14', posted: '1 month ago' },
  { id: 'v12', gameId: 'skyward-isles', platform: 'kick', creator: 'IslaBuilds', title: 'Speedrun: tiny rock to sky-castle', views: 120000, duration: '47:50', posted: '4 days ago' },
];

export function getGame(id: string) {
  return games.find((g) => g.id === id);
}

export function streamsFor(gameId: string) {
  return streams.filter((s) => s.gameId === gameId).sort((a, b) => b.viewers - a.viewers);
}

export function videosFor(gameId: string) {
  return videos.filter((v) => v.gameId === gameId).sort((a, b) => b.views - a.views);
}

export function viewersFor(gameId: string) {
  return streams.filter((s) => s.gameId === gameId).reduce((sum, s) => sum + s.viewers, 0);
}

export function finalPrice(game: Game) {
  return game.discount ? game.price * (1 - game.discount / 100) : game.price;
}

export function formatPrice(value: number) {
  return value === 0 ? 'Free' : `$${value.toFixed(2)}`;
}

export function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(value);
}
