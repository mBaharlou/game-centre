import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type About = {
  overview: string[];
  howToPlay: { title: string; text: string }[];
  whoFor: { icon: IconName; title: string; text: string }[];
  features: string[];
  modes: string[];
};

/** Hand-written store info for each game. Facts like price and trailers come from steam.json. */
export type CatalogEntry = {
  id: string;
  appId: number;
  title: string;
  tagline: string;
  genres: string[];
  /** Accent colour used for gradients and highlights on the game's pages. */
  accent: string;
  /** Category slugs on the streaming platforms (all checked to exist). */
  twitch: string;
  kick: string;
  featured?: boolean;
  about: About;
};

export const catalog: CatalogEntry[] = [
  {
    id: 'elden-ring',
    appId: 1245620,
    title: 'Elden Ring',
    tagline: 'Rise, Tarnished. A vast open world of brutal bosses and hidden secrets.',
    genres: ['Action RPG', 'Soulslike', 'Open World'],
    accent: '#D4A64A',
    twitch: 'elden-ring',
    kick: 'elden-ring',
    featured: true,
    about: {
      overview: [
        'Elden Ring is an open-world action RPG from FromSoftware, the studio behind Dark Souls. You play as a Tarnished, an exile called back to the Lands Between after the Elden Ring was shattered, and your goal is to become the Elden Lord.',
        'The world is huge and open from the start: ride your spirit horse Torrent across fields, ruins, castles and underground cities. Combat is hard but fair, and almost every challenge can be beaten by exploring, levelling up or changing your build. The Shadow of the Erdtree expansion adds a whole new region.',
      ],
      howToPlay: [
        { title: 'Explore freely', text: 'Pick any direction. If an area is too hard, leave and come back stronger later.' },
        { title: 'Rest at Sites of Grace', text: 'These are checkpoints where you level up with Runes, refill flasks and fast travel.' },
        { title: 'Learn every fight', text: 'Dodge, block or parry, watch enemy patterns and attack in the openings. Dying drops your Runes; get back to that spot to recover them.' },
        { title: 'Use your tools', text: 'Summon Spirit Ashes, add Ashes of War skills to weapons, or call other players for help with tough bosses.' },
      ],
      whoFor: [
        { icon: 'sword-cross', title: 'Challenge lovers', text: 'Beating a boss after many attempts feels amazing here.' },
        { icon: 'map-search', title: 'Explorers', text: 'Caves, catacombs and secret areas are hidden everywhere.' },
        { icon: 'account-hard-hat', title: 'Build crafters', text: 'Strength, magic, faith, bleed and more: hundreds of weapons and spells to combine.' },
      ],
      features: [
        'Huge seamless open world with mounted combat',
        'World lore written with George R. R. Martin',
        'Online co-op summoning and PvP invasions',
        'Shadow of the Erdtree expansion available',
      ],
      modes: ['Single player', 'Online co-op (3 players)', 'PvP invasions & duels'],
    },
  },
  {
    id: 'baldurs-gate-3',
    appId: 1086940,
    title: "Baldur's Gate 3",
    tagline: 'Gather your party. Every choice, every dice roll, changes your story.',
    genres: ['RPG', 'Strategy', 'Co-op'],
    accent: '#C0392B',
    twitch: 'baldurs-gate-3',
    kick: 'baldurs-gate-3',
    featured: true,
    about: {
      overview: [
        "Baldur's Gate 3 is a story-rich RPG from Larian Studios, built on the Dungeons & Dragons 5th Edition rules. A mind flayer has put a parasite tadpole in your head, and you must find a cure before it turns you into a monster.",
        'You lead a party of four through a world that reacts to almost everything you do. Talk, sneak, fight or trick your way through problems; companions like Astarion, Shadowheart and Karlach remember your choices and can become friends, rivals or romances.',
      ],
      howToPlay: [
        { title: 'Create your hero', text: 'Pick a race and one of 12 classes, or play as one of the Origin companions with their own story.' },
        { title: 'Talk and roll the dice', text: 'Conversations often call for a d20 skill check. Your stats decide the odds, the dice decide the result.' },
        { title: 'Fight in turns', text: 'Each character has actions, bonus actions and movement. Use height, the environment and spells to win.' },
        { title: 'Rest and choose', text: 'Make camp to recover and talk to companions. Your decisions open or close whole storylines.' },
      ],
      whoFor: [
        { icon: 'dice-d20', title: 'D&D fans', text: 'The most faithful video game version of D&D ever made.' },
        { icon: 'chess-knight', title: 'Tactical thinkers', text: 'Turn-based fights reward planning more than reflexes.' },
        { icon: 'account-group', title: 'Friend groups', text: 'Play the whole campaign together in online co-op.' },
      ],
      features: [
        '12 classes and dozens of subclasses',
        'Fully voiced story with many endings',
        'Online co-op for up to 4 players',
        "Honour Mode: one save, no second chances",
      ],
      modes: ['Single player', 'Online co-op (4 players)', 'Honour Mode'],
    },
  },
  {
    id: 'grand-theft-auto-v',
    appId: 3240220,
    title: 'Grand Theft Auto V',
    tagline: 'Three criminals, one city, and the biggest heists of their lives.',
    genres: ['Open World', 'Action', 'Multiplayer'],
    accent: '#7CB342',
    twitch: 'grand-theft-auto-v',
    kick: 'grand-theft-auto-v',
    featured: true,
    about: {
      overview: [
        'Grand Theft Auto V is Rockstar’s open-world crime game set in Los Santos, a satirical version of Los Angeles. The story follows three very different criminals, Michael, Franklin and Trevor, who team up for a series of dangerous heists.',
        'It also includes GTA Online, a constantly updated multiplayer world. On streaming platforms it is one of the most watched games thanks to roleplay (RP) servers, where streamers play police, gangsters and ordinary citizens. The Enhanced edition adds ray tracing, faster loading and better graphics on PC.',
      ],
      howToPlay: [
        { title: 'Switch characters', text: 'Swap between Michael, Franklin and Trevor at any time; each has a different life and special ability.' },
        { title: 'Plan the heist', text: 'Choose an approach and crew, prepare the gear, then pull off the job.' },
        { title: 'Explore Los Santos', text: 'Drive, fly, dive and take on side activities from golf to stock trading.' },
        { title: 'Go online', text: 'In GTA Online, build your own criminal business with friends.' },
      ],
      whoFor: [
        { icon: 'car-sports', title: 'Open-world fans', text: 'One of the most detailed cities ever made in a game.' },
        { icon: 'movie-open', title: 'Story players', text: 'A cinematic, funny and dark three-hero story.' },
        { icon: 'account-multiple', title: 'Online players', text: 'GTA Online heists and roleplay communities.' },
      ],
      features: [
        'Three playable protagonists',
        'GTA Online included',
        'Ray tracing and faster loading in the Enhanced edition',
        'Huge roleplay community on Twitch and Kick',
      ],
      modes: ['Story mode', 'GTA Online'],
    },
  },
  {
    id: 'counter-strike-2',
    appId: 730,
    title: 'Counter-Strike 2',
    tagline: 'The world’s classic 5v5 tactical shooter. Free to play.',
    genres: ['Shooter', 'Tactical', 'Esports'],
    accent: '#F5A623',
    twitch: 'counter-strike',
    kick: 'counter-strike-2',
    featured: true,
    about: {
      overview: [
        'Counter-Strike 2 is Valve’s free-to-play tactical shooter and the newest chapter of a series that has defined competitive gaming for over 20 years. Two teams of five, Terrorists and Counter-Terrorists, fight over bomb sites in short, intense rounds.',
        'There are no abilities or random power-ups: winning comes from aim, smart use of grenades, team communication and managing your money. Its Majors are some of the biggest esports events in the world.',
      ],
      howToPlay: [
        { title: 'Plant or defuse', text: 'Terrorists plant the bomb at site A or B; Counter-Terrorists stop them or defuse it.' },
        { title: 'Manage the economy', text: 'Earn money every round and decide when to buy rifles and when to save.' },
        { title: 'Use utility', text: 'Smokes, flashbangs and molotovs block vision and take control of the map.' },
        { title: 'Win 13 rounds', text: 'Teams swap sides at half time; first to 13 rounds wins.' },
      ],
      whoFor: [
        { icon: 'crosshairs-gps', title: 'Aim enthusiasts', text: 'Pure gunplay where skill matters most.' },
        { icon: 'account-voice', title: 'Team players', text: 'Callouts and strategy decide most rounds.' },
        { icon: 'trophy', title: 'Esports fans', text: 'Watch the pros, then practise the same maps.' },
      ],
      features: [
        'Free to play',
        'Premier mode with a global CS Rating',
        'Volumetric smokes that react to bullets and grenades',
        'Sub-tick servers for precise shots',
      ],
      modes: ['Premier', 'Competitive', 'Wingman (2v2)', 'Deathmatch', 'Casual'],
    },
  },
  {
    id: 'hades-ii',
    appId: 1145350,
    title: 'Hades II',
    tagline: 'Battle beyond the Underworld with dark sorcery to take on the Titan of Time.',
    genres: ['Roguelike', 'Action', 'Indie'],
    accent: '#B388FF',
    twitch: 'hades-ii',
    kick: 'hades-ii',
    featured: true,
    about: {
      overview: [
        'Hades II is a fast action roguelike from Supergiant Games, the sequel to the award-winning Hades. You play Melinoë, Princess of the Underworld and a witch, on a mission to defeat Chronos, the Titan of Time, who has taken her family captive.',
        'Every run is different. Olympian gods give you Boons that change your attacks, and even when you fall, you return to the Crossroads stronger, with new story scenes to unlock. The art, music and voice acting are among the best in games.',
      ],
      howToPlay: [
        { title: 'Choose a weapon', text: 'Pick one of the Nocturnal Arms, such as a staff, blades or a skull, each with its own style.' },
        { title: 'Collect Boons', text: 'Gods like Zeus, Apollo and Hera offer upgrades. Combine them into a powerful build.' },
        { title: 'Use your magick', text: 'Hold attacks to unleash Omega moves and cast spells with your Magick.' },
        { title: 'Grow between runs', text: 'Back at the Crossroads, use reagents for Incantations and Arcana cards that make you stronger.' },
      ],
      whoFor: [
        { icon: 'lightning-bolt', title: 'Action fans', text: 'Smooth, fast combat that feels great from the first minute.' },
        { icon: 'reload', title: 'Replay lovers', text: 'Runs last about 30 minutes and are never the same.' },
        { icon: 'book-open-variant', title: 'Story fans', text: 'Greek myths retold with great writing and characters.' },
      ],
      features: [
        'Two paths: the Underworld and the Surface',
        'Dozens of gods and characters, fully voiced',
        'Witchcraft, familiars and crafting at the Crossroads',
        'Optional God Mode for an easier time',
      ],
      modes: ['Single player'],
    },
  },
  {
    id: 'cyberpunk-2077',
    appId: 1091500,
    title: 'Cyberpunk 2077',
    tagline: 'Become a cyber-enhanced mercenary in the most dangerous city of the future.',
    genres: ['RPG', 'Open World', 'Shooter'],
    accent: '#FCEE0A',
    twitch: 'cyberpunk-2077',
    kick: 'cyberpunk-2077',
    about: {
      overview: [
        'Cyberpunk 2077 is a first-person open-world RPG from CD PROJEKT RED, set in Night City, a megacity ruled by corporations and gangs. You play V, a mercenary carrying a chip that contains the digital ghost of rock legend Johnny Silverhand, played by Keanu Reeves.',
        'After major updates and the Phantom Liberty expansion, it is now considered one of the best RPGs of its generation. You can shoot, sneak, hack or talk your way through missions, and your choices shape how V’s story ends.',
      ],
      howToPlay: [
        { title: 'Build your V', text: 'Choose a life path and spend points on attributes and skill trees.' },
        { title: 'Install cyberware', text: 'Upgrade your body with implants like Mantis Blades, double jumps or the Sandevistan.' },
        { title: 'Pick your style', text: 'Go in guns blazing, sneak, or hack enemies with quickhacks.' },
        { title: 'Take on gigs', text: 'Fixers around Night City offer side jobs with their own stories.' },
      ],
      whoFor: [
        { icon: 'robot', title: 'Sci-fi fans', text: 'A dense, neon-lit future world to explore.' },
        { icon: 'source-branch', title: 'Choice lovers', text: 'Multiple endings shaped by your decisions.' },
        { icon: 'pistol', title: 'Shooter-RPG fans', text: 'Satisfying gunplay mixed with deep RPG builds.' },
      ],
      features: [
        'Phantom Liberty spy-thriller expansion available',
        'Rebuilt skill trees and police system (update 2.0)',
        'Cars and motorbikes, including vehicle combat',
        'Path tracing support on PC',
      ],
      modes: ['Single player'],
    },
  },
  {
    id: 'red-dead-redemption-2',
    appId: 1174180,
    title: 'Red Dead Redemption 2',
    tagline: 'The end of the Wild West, told through one outlaw’s story.',
    genres: ['Open World', 'Action', 'Story'],
    accent: '#C62828',
    twitch: 'red-dead-redemption-2',
    kick: 'red-dead-redemption-2',
    about: {
      overview: [
        'Red Dead Redemption 2 is Rockstar’s epic western set in 1899. You play Arthur Morgan, an outlaw in the Van der Linde gang, which is on the run as the law closes in and the age of outlaws comes to an end.',
        'It is famous for its incredibly detailed world: wildlife, weather, towns and strangers all feel alive. The story is slow, emotional and often called one of the best in gaming. Red Dead Online lets you ride the frontier with other players.',
      ],
      howToPlay: [
        { title: 'Follow the story', text: 'Missions move the gang’s story forward across many chapters.' },
        { title: 'Live in the world', text: 'Hunt, fish, play poker and help (or rob) strangers you meet on the road.' },
        { title: 'Care for camp and horse', text: 'Bring supplies to the gang and bond with your horse to make it better.' },
        { title: 'Use Dead Eye', text: 'Slow time and mark targets for precise shots in gunfights.' },
      ],
      whoFor: [
        { icon: 'horse', title: 'Western fans', text: 'The most complete cowboy experience ever made.' },
        { icon: 'movie-open', title: 'Story players', text: 'A long, emotional story with memorable characters.' },
        { icon: 'pine-tree', title: 'Slow explorers', text: 'Perfect for players who love to wander and take in the scenery.' },
      ],
      features: [
        'Honor system that changes how people react to you',
        'Huge, living open world',
        'Red Dead Online included',
        'Photo mode',
      ],
      modes: ['Story mode', 'Red Dead Online'],
    },
  },
  {
    id: 'the-witcher-3',
    appId: 292030,
    title: 'The Witcher 3: Wild Hunt',
    tagline: 'Hunt monsters for coin and search for the child of prophecy.',
    genres: ['RPG', 'Open World', 'Story'],
    accent: '#B71C1C',
    twitch: 'the-witcher-3-wild-hunt',
    kick: 'the-witcher-3:-wild-hunt',
    about: {
      overview: [
        'The Witcher 3: Wild Hunt is CD PROJEKT RED’s award-winning open-world RPG. You play Geralt of Rivia, a professional monster hunter, searching for his adopted daughter Ciri, who is being chased by the ghostly riders of the Wild Hunt.',
        'Its side quests are as well written as the main story, and many decisions have consequences much later. This edition includes the Hearts of Stone and Blood and Wine expansions, which add dozens of hours of content.',
      ],
      howToPlay: [
        { title: 'Take contracts', text: 'Read notice boards, investigate with your Witcher Senses and hunt the monster.' },
        { title: 'Prepare for fights', text: 'Use the right oil on your sword, drink potions and pick the right Sign.' },
        { title: 'Cast Signs', text: 'Igni burns, Aard knocks back, Quen shields, Yrden traps and Axii charms.' },
        { title: 'Play Gwent', text: 'Collect cards and challenge innkeepers to the famous in-game card game.' },
      ],
      whoFor: [
        { icon: 'book-open-page-variant', title: 'Story lovers', text: 'Some of the best quests and characters in any RPG.' },
        { icon: 'sword', title: 'Fantasy fans', text: 'A dark world full of monsters, magic and politics.' },
        { icon: 'clock-outline', title: 'Long-game players', text: 'Easily 100+ hours with both expansions.' },
      ],
      features: [
        'Hearts of Stone and Blood and Wine expansions',
        'Gwent card game built in',
        'Choices with long-term consequences',
        'Ray tracing and quality-of-life updates',
      ],
      modes: ['Single player'],
    },
  },
  {
    id: 'black-myth-wukong',
    appId: 2358720,
    title: 'Black Myth: Wukong',
    tagline: 'Journey to the West, reborn as a stunning action RPG.',
    genres: ['Action RPG', 'Mythology', 'Soulslike'],
    accent: '#E0A33A',
    twitch: 'black-myth-wukong',
    kick: 'black-myth-wukong',
    about: {
      overview: [
        'Black Myth: Wukong is an action RPG from Game Science, inspired by the Chinese classic Journey to the West. You play the Destined One, a monkey warrior who sets out on a journey through ancient China to uncover the truth behind a legend.',
        'It is known for its beautiful graphics and spectacular boss fights against yaoguai, demons and gods. Combat is fast and flexible, with staff stances, spells and transformations into other creatures.',
      ],
      howToPlay: [
        { title: 'Master the staff', text: 'Switch between Smash, Pillar and Thrust stances for different combos.' },
        { title: 'Build Focus', text: 'Land hits to charge Focus, then release it in heavy attacks.' },
        { title: 'Cast spells', text: 'Freeze enemies with Immobilize, create clones or transform into defeated foes.' },
        { title: 'Rest at shrines', text: 'Keeper’s Shrines let you level up, refill your gourd and travel.' },
      ],
      whoFor: [
        { icon: 'sword-cross', title: 'Boss-fight fans', text: 'The game is built around huge, cinematic bosses.' },
        { icon: 'image-filter-hdr', title: 'Graphics lovers', text: 'One of the best-looking games available.' },
        { icon: 'book-open-variant', title: 'Mythology fans', text: 'A fresh take on a famous Chinese story.' },
      ],
      features: [
        'Dozens of unique bosses',
        'Transformations and spells',
        'Six chapters with different regions',
        'New Game+',
      ],
      modes: ['Single player'],
    },
  },
  {
    id: 'god-of-war-ragnarok',
    appId: 2322010,
    title: 'God of War Ragnarök',
    tagline: 'Kratos and Atreus face the end of the Norse world.',
    genres: ['Action', 'Story', 'Mythology'],
    accent: '#4FC3F7',
    twitch: 'god-of-war-ragnarok',
    kick: 'god-of-war-ragnarok',
    about: {
      overview: [
        'God of War Ragnarök is the sequel to 2018’s God of War, from Santa Monica Studio. Fimbulwinter has come, and Kratos and his son Atreus travel through the Nine Realms as Ragnarök, the prophesied end of the world, draws closer.',
        'It mixes brutal, weighty combat with a heartfelt story about a father and son. The PC version includes Valhalla, a free roguelite mode that continues Kratos’s story.',
      ],
      howToPlay: [
        { title: 'Fight with three weapons', text: 'Switch between the Leviathan Axe, the Blades of Chaos and the Draupnir Spear.' },
        { title: 'Use Spartan Rage', text: 'Fill your rage meter and unleash it to turn a fight around.' },
        { title: 'Explore the realms', text: 'Visit all Nine Realms, solve puzzles and find hidden treasure.' },
        { title: 'Upgrade your gear', text: 'Craft armour and runic attacks at the dwarven shops.' },
      ],
      whoFor: [
        { icon: 'movie-open', title: 'Cinematic story fans', text: 'A big, emotional, beautifully acted adventure.' },
        { icon: 'axe', title: 'Action fans', text: 'Heavy, satisfying combat with lots of depth.' },
        { icon: 'castle', title: 'Mythology fans', text: 'Thor, Odin, Freya and more from Norse myth.' },
      ],
      features: [
        'Valhalla roguelite mode included',
        'Play as both Kratos and Atreus',
        'Many accessibility options',
        'Ultra-wide and high-framerate support on PC',
      ],
      modes: ['Single player', 'Valhalla mode'],
    },
  },
  {
    id: 'helldivers-2',
    appId: 553850,
    title: 'Helldivers 2',
    tagline: 'Spread managed democracy across the galaxy with up to three friends.',
    genres: ['Shooter', 'Co-op', 'Action'],
    accent: '#FFD600',
    twitch: 'helldivers-ii',
    kick: 'helldivers-2',
    about: {
      overview: [
        'Helldivers 2 is a 4-player co-op third-person shooter from Arrowhead Game Studios. As an elite soldier of Super Earth, you drop onto alien planets to fight bugs, robots and other enemies in the name of “managed democracy”, a funny satire of military propaganda.',
        'All players share one Galactic War: the community’s victories and losses decide which planets are liberated. Friendly fire is always on, which leads to chaos and a lot of laughs.',
      ],
      howToPlay: [
        { title: 'Pick a mission', text: 'Choose a planet on the war map and a difficulty level.' },
        { title: 'Call in Stratagems', text: 'Enter arrow codes to drop airstrikes, turrets, heavy weapons and reinforcements.' },
        { title: 'Complete objectives', text: 'Launch missiles, destroy nests or rescue civilians, then reach the extraction point.' },
        { title: 'Unlock gear', text: 'Earn medals and requisition to unlock new weapons, armour and Stratagems.' },
      ],
      whoFor: [
        { icon: 'account-group', title: 'Friend groups', text: 'Best with three friends on voice chat.' },
        { icon: 'emoticon-lol', title: 'Chaos lovers', text: 'Accidental airstrikes on teammates are part of the fun.' },
        { icon: 'earth', title: 'Community players', text: 'Every mission counts toward the shared war.' },
      ],
      features: [
        'Online co-op for up to 4 players',
        'Community-wide Galactic War',
        'Dozens of Stratagems to call in',
        '10 difficulty levels',
      ],
      modes: ['Online co-op (1–4 players)'],
    },
  },
  {
    id: 'hollow-knight-silksong',
    appId: 1030300,
    title: 'Hollow Knight: Silksong',
    tagline: 'Play as Hornet and climb to the top of a haunted kingdom.',
    genres: ['Metroidvania', 'Action', 'Indie'],
    accent: '#E57373',
    twitch: 'hollow-knight-silksong',
    kick: 'hollow-knight-silksong',
    about: {
      overview: [
        'Hollow Knight: Silksong is the sequel to the hit metroidvania Hollow Knight, from Team Cherry. You play Hornet, princess-protector of Hallownest, who is captured and taken to Pharloom, a kingdom of silk and song. Your goal is to climb to its shining Citadel.',
        'Hornet is faster and more acrobatic than the original Knight. The hand-drawn world is full of secrets, more than 200 enemies and many tough bosses. It is very popular with speedrunners.',
      ],
      howToPlay: [
        { title: 'Explore and map', text: 'Find your way through connected areas and buy maps to keep track.' },
        { title: 'Bind to heal', text: 'Fill your silk spool by hitting enemies, then bind to restore health.' },
        { title: 'Craft tools', text: 'Make and equip tools like traps and throwing weapons, and switch Crests to change your moves.' },
        { title: 'Take on quests', text: 'Help the bugs of Pharloom through wishes posted in towns.' },
      ],
      whoFor: [
        { icon: 'run-fast', title: 'Platformer fans', text: 'Precise, fast, acrobatic movement.' },
        { icon: 'map-search', title: 'Explorers', text: 'A huge interconnected map with hidden areas.' },
        { icon: 'timer-outline', title: 'Speedrunners', text: 'Huge speedrun scene from day one.' },
      ],
      features: [
        'Beautiful hand-drawn art',
        '200+ enemies and many bosses',
        'Crests that change how Hornet fights',
        'Orchestral soundtrack by Christopher Larkin',
      ],
      modes: ['Single player'],
    },
  },
  {
    id: 'sekiro',
    appId: 814380,
    title: 'Sekiro: Shadows Die Twice',
    tagline: 'Take revenge. Restore your honour. Kill ingeniously.',
    genres: ['Action', 'Soulslike', 'Story'],
    accent: '#EF5350',
    twitch: 'sekiro-shadows-die-twice',
    kick: 'sekiro:-shadows-die-twice',
    about: {
      overview: [
        'Sekiro: Shadows Die Twice is an action-adventure game from FromSoftware set in late 1500s Sengoku Japan. You play the Wolf, a shinobi who must rescue and protect a young lord with a mysterious bloodline.',
        'It won Game of the Year at The Game Awards 2019. Unlike Dark Souls, there are no classes or builds: it is all about mastering sword fights by deflecting attacks at the perfect moment.',
      ],
      howToPlay: [
        { title: 'Deflect, don’t dodge', text: 'Block at the right moment to deflect attacks and break the enemy’s posture.' },
        { title: 'Land a Deathblow', text: 'When posture breaks, finish the enemy with one lethal strike.' },
        { title: 'Use the Prosthetic', text: 'Your artificial arm holds tools like a shuriken, an axe and fire, plus a grappling hook.' },
        { title: 'Resurrect', text: 'When you die, you can sometimes rise again on the spot.' },
      ],
      whoFor: [
        { icon: 'sword', title: 'Sword-fight fans', text: 'Duels feel like a rhythmic clash of steel.' },
        { icon: 'arm-flex', title: 'Hard-game veterans', text: 'One of the hardest and most rewarding games around.' },
        { icon: 'ninja', title: 'Stealth fans', text: 'Grapple onto rooftops and take out enemies unseen.' },
      ],
      features: [
        'Game of the Year at The Game Awards 2019',
        'Posture-based sword combat',
        'Grappling hook and vertical exploration',
        'GOTY Edition with extra challenges',
      ],
      modes: ['Single player'],
    },
  },
  {
    id: 'monster-hunter-wilds',
    appId: 2246340,
    title: 'Monster Hunter Wilds',
    tagline: 'Hunt giant monsters across living lands with up to three friends.',
    genres: ['Action RPG', 'Co-op', 'Open World'],
    accent: '#26A69A',
    twitch: 'monster-hunter-wilds',
    kick: 'monster-hunter-wilds',
    about: {
      overview: [
        'Monster Hunter Wilds is Capcom’s latest Monster Hunter game. As a Hunter, you explore the Forbidden Lands, where weather changes the land and the monsters that live in it, from peaceful seasons to violent storms.',
        'The loop is simple and addictive: track a monster, fight it, carve materials and craft better weapons and armour to hunt something even bigger. Hunts can be played solo or with friends.',
      ],
      howToPlay: [
        { title: 'Pick a weapon', text: 'Choose from 14 weapon types, from the Great Sword to the Bow. Each plays very differently.' },
        { title: 'Track and fight', text: 'Ride your Seikret mount to the monster, then use Focus Mode to target wounds.' },
        { title: 'Carve and craft', text: 'Collect monster parts and turn them into new gear.' },
        { title: 'Hunt together', text: 'Join friends or call support hunters for tougher monsters.' },
      ],
      whoFor: [
        { icon: 'account-group', title: 'Co-op fans', text: 'Hunting with friends is the heart of the series.' },
        { icon: 'hammer-wrench', title: 'Gear grinders', text: 'Hundreds of weapons and armour sets to craft.' },
        { icon: 'paw', title: 'Monster lovers', text: 'Huge, detailed monsters with their own behaviour.' },
      ],
      features: [
        '14 weapon types',
        'Seamless open areas with changing weather',
        'Online co-op for up to 4 players',
        'Cross-play',
      ],
      modes: ['Single player', 'Online co-op (4 players)'],
    },
  },
  {
    id: 'dota-2',
    appId: 570,
    title: 'Dota 2',
    tagline: 'The deepest team strategy game in the world. Free forever.',
    genres: ['MOBA', 'Strategy', 'Esports'],
    accent: '#E53935',
    twitch: 'dota-2',
    kick: 'dota-2',
    about: {
      overview: [
        'Dota 2 is Valve’s free-to-play MOBA. Two teams of five, the Radiant and the Dire, battle across one map to destroy the enemy’s Ancient. With more than 120 heroes and hundreds of items, no two games are the same.',
        'All heroes are free; only cosmetics cost money. Its world championship, The International, has had some of the biggest prize pools in esports history.',
      ],
      howToPlay: [
        { title: 'Pick a hero and role', text: 'Positions 1 to 5 range from the carry who farms gold to the hard support who protects the team.' },
        { title: 'Farm your lane', text: 'Last-hit creeps for gold and deny the enemy by killing your own creeps.' },
        { title: 'Buy items', text: 'Turn gold into items that change your hero’s power and abilities.' },
        { title: 'Push and win', text: 'Take towers, Roshan and barracks, then destroy the Ancient.' },
      ],
      whoFor: [
        { icon: 'brain', title: 'Strategy lovers', text: 'Endless depth: you keep learning for years.' },
        { icon: 'account-group', title: 'Team players', text: 'Coordination beats individual skill.' },
        { icon: 'trophy', title: 'Esports fans', text: 'Follow The International and pro leagues.' },
      ],
      features: [
        'Free to play, every hero unlocked',
        '120+ heroes',
        'Ranked matchmaking',
        'Huge custom games workshop',
      ],
      modes: ['Ranked', 'All Pick', 'Turbo', 'Custom games'],
    },
  },
  {
    id: 'apex-legends',
    appId: 1172470,
    title: 'Apex Legends',
    tagline: 'Squad up and be the last team standing. Free to play.',
    genres: ['Battle Royale', 'Shooter', 'Hero Shooter'],
    accent: '#DA292A',
    twitch: 'apex-legends',
    kick: 'apex-legends',
    about: {
      overview: [
        'Apex Legends is a free-to-play hero battle royale from Respawn Entertainment, the makers of Titanfall. Squads of Legends, each with unique abilities, drop onto a map and fight until only one team is left.',
        'It is known for fast movement such as sliding and climbing, and a ping system that lets teams communicate without voice chat. ALGS is its pro esports league.',
      ],
      howToPlay: [
        { title: 'Choose a Legend', text: 'Pick from Assault, Skirmisher, Recon, Support and Controller Legends.' },
        { title: 'Drop and loot', text: 'Land, grab weapons, armour and attachments as fast as possible.' },
        { title: 'Stay in the ring', text: 'The ring keeps shrinking; move with your team and fight for position.' },
        { title: 'Bring teammates back', text: 'Collect fallen teammates’ banners and respawn them at beacons.' },
      ],
      whoFor: [
        { icon: 'run-fast', title: 'Movement fans', text: 'Some of the best movement in any shooter.' },
        { icon: 'account-multiple', title: 'Squad players', text: 'Built for teams of three.' },
        { icon: 'currency-usd-off', title: 'Free players', text: 'Everything that affects gameplay can be earned.' },
      ],
      features: [
        'Free to play',
        'Over 25 Legends with unique abilities',
        'Ping system for easy teamwork',
        'New seasons with maps and Legends',
      ],
      modes: ['Battle Royale (Trios & Duos)', 'Ranked', 'Mixtape'],
    },
  },
  {
    id: 'marvel-rivals',
    appId: 2767030,
    title: 'Marvel Rivals',
    tagline: 'Team up as Marvel heroes and villains in 6v6 battles. Free to play.',
    genres: ['Hero Shooter', 'Shooter', 'Team'],
    accent: '#FF1744',
    twitch: 'marvel-rivals',
    kick: 'marvel-rivals',
    about: {
      overview: [
        'Marvel Rivals is a free-to-play 6v6 hero shooter from NetEase Games. Play as famous Marvel heroes and villains, from Spider-Man and Iron Man to Loki and Magneto, on maps from across the Marvel multiverse.',
        'Many parts of the maps can be destroyed, and heroes can combine powers with Team-Up abilities. New heroes arrive with each season.',
      ],
      howToPlay: [
        { title: 'Choose a role', text: 'Vanguards protect, Duelists deal damage and Strategists heal and support.' },
        { title: 'Use Team-Ups', text: 'Some hero pairs unlock special combined abilities.' },
        { title: 'Play the objective', text: 'Capture points, escort the payload or hold zones depending on the mode.' },
        { title: 'Break the map', text: 'Destroy cover and walls to open new paths.' },
      ],
      whoFor: [
        { icon: 'shield-star', title: 'Marvel fans', text: 'A huge, growing roster of famous characters.' },
        { icon: 'account-group', title: 'Team players', text: 'Balanced teams and combos win games.' },
        { icon: 'currency-usd-off', title: 'Free players', text: 'All heroes are free to play.' },
      ],
      features: [
        'Free to play, all heroes unlocked',
        'Destructible environments',
        'Team-Up abilities between heroes',
        'New heroes every season',
      ],
      modes: ['Quick Match', 'Competitive', 'Arcade modes'],
    },
  },
  {
    id: 'stardew-valley',
    appId: 413150,
    title: 'Stardew Valley',
    tagline: 'Leave the city behind and build the farm of your dreams.',
    genres: ['Farming', 'Cozy', 'Indie'],
    accent: '#66BB6A',
    twitch: 'stardew-valley',
    kick: 'stardew-valley',
    about: {
      overview: [
        'Stardew Valley is a much-loved farming life game made almost entirely by one developer, ConcernedApe. You inherit your grandfather’s old farm near Pelican Town and start a new, slower life in the countryside.',
        'Grow crops, raise animals, fish, mine for treasure, and get to know the townspeople, even marry one of them. Play alone or invite friends to run the farm together.',
      ],
      howToPlay: [
        { title: 'Plant and harvest', text: 'Each season has its own crops. Plan ahead to earn the most money.' },
        { title: 'Make friends', text: 'Talk to villagers and give gifts they love to unlock events and romance.' },
        { title: 'Explore the mines', text: 'Fight monsters and collect ores and gems to upgrade your tools.' },
        { title: 'Restore the Community Center', text: 'Complete bundles to bring the town back to life.' },
      ],
      whoFor: [
        { icon: 'flower', title: 'Cozy gamers', text: 'Relaxing, warm and stress-free.' },
        { icon: 'account-heart', title: 'Life-sim fans', text: 'Friendships, marriage and family.' },
        { icon: 'account-group', title: 'Couples & friends', text: 'Share one farm in co-op.' },
      ],
      features: [
        'Over 100 hours of content',
        'Online and split-screen co-op',
        'Free updates with new content',
        'Huge modding community on PC',
      ],
      modes: ['Single player', 'Online co-op', 'Split-screen co-op'],
    },
  },
];
