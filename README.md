# game-centre

A mobile game store built with Expo (React Native + TypeScript). For every game you can watch the best players live on Twitch, YouTube and Kick, watch their top videos, or read the "About this game" article, then buy it.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code with the Expo Go app on your phone, or press `w` to open it in the browser.

## Project layout

- `src/app/` – screens (Expo Router): Store, Live and Cart tabs, game page, watch screen
- `src/components/` – shared UI: cover art, badges, stream and video cards
- `src/data/games.ts` – sample games, streams, videos and About articles
- `src/store/cart.tsx` – cart and library state
- `src/constants/theme.ts` – colours, spacing and streaming platforms

## Checks

```bash
npx tsc --noEmit
npx eslint src
```
