import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';
import type { Art } from '@/services/game-details';

type Props = {
  game: Art;
  /** cover = tall box art, hero = wide background art, header = Steam store banner. */
  variant?: 'cover' | 'hero' | 'header';
  style?: StyleProp<ViewStyle>;
  /** Show the title on games that have no artwork. */
  showTitle?: boolean;
  children?: ReactNode;
};

/** Official artwork for a game, or a gradient with its name when there is none. */
export function GameCover({ game, variant = 'cover', style, showTitle = true, children }: Props) {
  const uri = game.images[variant] ?? (variant === 'hero' ? game.images.header : null) ?? null;
  return (
    <View style={[styles.box, style]}>
      <LinearGradient colors={[game.accent, Colors.surfaceRaised]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      {uri ? (
        <Image source={{ uri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} cachePolicy="memory-disk" accessibilityLabel={`${game.title} artwork`} />
      ) : (
        showTitle && (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="gamepad-variant" size={variant === 'hero' ? 56 : 28} color="rgba(255,255,255,0.35)" />
            {variant !== 'hero' && (
              <Text style={styles.placeholderText} numberOfLines={3}>
                {game.title}
              </Text>
            )}
          </View>
        )
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: 'hidden', backgroundColor: Colors.surfaceRaised },
  placeholder: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 10, gap: 6 },
  placeholderText: { color: '#fff', fontSize: 14, fontWeight: '900', textAlign: 'center' },
});
