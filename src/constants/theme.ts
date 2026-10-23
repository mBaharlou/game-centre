import '@/global.css';

import { Platform } from 'react-native';

/** The app is dark-only: a near-black base with neon violet/cyan accents. */
export const Colors = {
  background: '#07070C',
  surface: '#111119',
  surfaceRaised: '#191924',
  border: 'rgba(255,255,255,0.08)',
  text: '#F5F5FA',
  textSecondary: '#A1A1B5',
  textMuted: '#6B6B80',
  accent: '#8B5CF6',
  accentSoft: 'rgba(139,92,246,0.16)',
  accent2: '#22D3EE',
  live: '#FF2D55',
  gold: '#FBBF24',
  success: '#34D399',
} as const;

export const AccentGradient = ['#8B5CF6', '#6366F1', '#22D3EE'] as const;

export const Platforms = {
  twitch: { name: 'Twitch', color: '#9146FF', icon: 'twitch' },
  youtube: { name: 'YouTube', color: '#FF0033', icon: 'youtube' },
  kick: { name: 'Kick', color: '#53FC18', icon: 'lightning-bolt' },
} as const;

export type PlatformId = keyof typeof Platforms;

export const Fonts = Platform.select({
  ios: { sans: 'system-ui', rounded: 'ui-rounded', mono: 'ui-monospace' },
  web: { sans: 'var(--font-display)', rounded: 'var(--font-rounded)', mono: 'var(--font-mono)' },
  default: { sans: 'normal', rounded: 'normal', mono: 'monospace' },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

/** Height of the floating tab bar, so scroll views can leave room for it. */
export const TabBarHeight = 64;
export const MaxContentWidth = 720;
