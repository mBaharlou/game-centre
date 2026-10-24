# game-centre

A mobile game store and buying assistant built with Expo (React Native + TypeScript). Search any game on any platform. For every game you can watch the best players live on Twitch, YouTube and Kick, watch official trailers, read about it, and let the buying assistant rank every platform it runs on (PC, PlayStation, Xbox, Switch, Steam Deck, Mac, mobile) by performance, with links to every store that sells it (Steam, Epic, GOG, Battle.net, Microsoft/Xbox, PlayStation Store, Nintendo eShop, App Store, Google Play) and live PC price comparison. Every user gets an account with a profile, library and wishlist.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone (on iPhone, sign in to the same Expo account on both the phone and the computer), or press `w` to open it in the browser.

## Where the data comes from

| What | Source |
| --- | --- |
| Search, platforms, studios, store IDs for every game | Wikidata (`src/services/wikidata.ts`) |
| About text for searched games | Wikipedia, CC BY-SA (`src/services/wikipedia.ts`) |
| Live PC prices across official stores | CheapShark (`src/services/cheapshark.ts`) |
| Steam price, trailers, screenshots, Steam Deck rating | Steam store (`src/services/steam.ts`; phone app only, browsers block it) |
| 18 hand-picked games with full guides | `src/data/catalog.ts` + Steam snapshot in `src/data/steam.json` |
| Live streams that play in the app, trending games | Kick's public website endpoints (`src/services/kick.ts`) |
| Twitch, YouTube and Kick live pages, YouTube guides | Links to each platform, sorted by viewers |

## Buying assistant

`src/services/advisor.ts` builds the "Buy" tab of every game: it checks which platforms the game is on, finds its page on each store, the Steam Deck rating and live PC prices, then ranks the platforms by how powerful their hardware is for games (PC, PS5, Xbox Series X|S, Switch 2, Mac, Steam Deck, last-gen consoles, Switch, phones). The user picks where to buy; afterwards they can add the game to their library.

Refresh prices and trailers from Steam:

```bash
npm run update-games
```

## Accounts

Accounts are stored on the device with salted SHA-256 password hashes (`src/store/auth.tsx`). Games are bought on the stores themselves; the app keeps the user's library and wishlist. Cloud accounts need a backend and are the next step.

## Project layout

- `src/app/` – screens (Expo Router): Store, Search, Live and Profile tabs, game page, player, sign in, edit profile
- `src/components/` – shared UI: artwork, badges, stream and trailer cards
- `src/data/` – game catalog and Steam data
- `src/services/` – Wikidata, Wikipedia, Steam, CheapShark and Kick, the game loader and the buying assistant
- `src/store/` – accounts, library and wishlist
- `scripts/fetch-steam.mjs` – Steam data refresh

## Checks

```bash
npx tsc --noEmit
npx eslint src scripts
```
