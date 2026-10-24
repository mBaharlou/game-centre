# game-centre

A mobile game store built with Expo (React Native + TypeScript). It sells 18 of the world's best games. For every game you can watch the best players live on Twitch, YouTube and Kick, watch official trailers, find top YouTube gameplay and guides, or read the "About this game" article, then buy it. Every user gets an account with a profile, library, wishlist and order history.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone (on iPhone, sign in to the same Expo account on both the phone and the computer), or press `w` to open it in the browser.

## Where the data comes from

| What | Source |
| --- | --- |
| Prices, discounts, release dates, screenshots, trailers, Metacritic | Steam store API, saved in `src/data/steam.json` |
| About articles, genres, taglines | Written by hand in `src/data/catalog.ts` |
| Live streams that play in the app | Kick's public website endpoints, loaded live (`src/services/kick.ts`) |
| Twitch, YouTube and Kick live pages, YouTube guides | Links to each platform, sorted by viewers |

Refresh prices and trailers from Steam:

```bash
npm run update-games
```

## Accounts

Accounts are stored on the device with salted SHA-256 password hashes (`src/store/auth.tsx`). Checkout is a test checkout: no real payment is taken. Cloud accounts and real payments need a backend and are the next step.

## Project layout

- `src/app/` – screens (Expo Router): Store, Live, Cart and Profile tabs, game page, player, sign in, edit profile
- `src/components/` – shared UI: artwork, badges, stream and trailer cards
- `src/data/` – game catalog and Steam data
- `src/services/kick.ts` – live Kick streams and playback
- `src/store/` – accounts and cart
- `scripts/fetch-steam.mjs` – Steam data refresh

## Checks

```bash
npx tsc --noEmit
npx eslint src scripts
```
