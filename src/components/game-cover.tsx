import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Game } from '@/data/games';

type Props = {
  game: Game;
  iconSize?: number;
  /** Hide the centre icon, e.g. when a play button sits on top of the cover. */
  hideIcon?: boolean;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/**
 * Generated cover art: the game's gradient, soft glowing orbs and a large icon.
 * Stands in for real key art until the store has image assets.
 */
export function GameCover({ game, iconSize = 96, hideIcon, style, children }: Props) {
  const [a, b, c] = game.colors;
  return (
    <LinearGradient colors={[a, b, c]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.cover, style]}>
      <View style={[styles.orb, { backgroundColor: a, width: iconSize * 2.6, height: iconSize * 2.6, top: -iconSize, right: -iconSize * 0.8 }]} />
      <View style={[styles.orb, { backgroundColor: b, width: iconSize * 2, height: iconSize * 2, bottom: -iconSize * 0.9, left: -iconSize * 0.6 }]} />
      <View style={[styles.ring, { width: iconSize * 1.9, height: iconSize * 1.9, borderRadius: iconSize }]} />
      {!hideIcon && <MaterialCommunityIcons name={game.icon} size={iconSize} color="rgba(255,255,255,0.92)" style={styles.icon} />}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  cover: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.45,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  icon: {
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 6 },
    textShadowRadius: 18,
  },
});
