import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Game } from '@/data/games';

type Props = {
  game: Game;
  /** cover = tall box art, hero = wide background art, header = Steam store banner. */
  variant?: 'cover' | 'hero' | 'header';
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
};

/** Official Steam artwork for a game, with its accent gradient showing while it loads. */
export function GameCover({ game, variant = 'cover', style, children }: Props) {
  return (
    <View style={[styles.box, style]}>
      <LinearGradient colors={[game.accent, Colors.surfaceRaised]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Image
        source={{ uri: game.images[variant] }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={250}
        cachePolicy="memory-disk"
        accessibilityLabel={`${game.title} artwork`}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', backgroundColor: Colors.surfaceRaised },
});
