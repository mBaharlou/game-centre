import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatCount } from '@/data/games';
import { accentFor } from '@/services/game-details';
import { useTrendingGames, type TrendingGame } from '@/services/kick';
import { cleanGameName, openTrendingGame } from '@/utils/open-game';

/** Box-art tile for a trending game; shows a spinner while its page is being found. */
export function TrendingTile({ game, width }: { game: TrendingGame; width: number }) {
  const [opening, setOpening] = useState(false);
  const open = async () => {
    setOpening(true);
    const found = await openTrendingGame(game);
    setOpening(false);
    if (!found) router.navigate({ pathname: '/search', params: { q: cleanGameName(game.name) } });
  };
  return (
    <Pressable onPress={open} disabled={opening} style={({ pressed }) => [{ width }, pressed && { opacity: 0.8 }]}>
      <View style={styles.cover}>
        <LinearGradient colors={[accentFor(game.name), Colors.surfaceRaised]} style={StyleSheet.absoluteFill} />
        {game.image && <Image source={{ uri: game.image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />}
        {opening && (
          <View style={styles.opening}>
            <ActivityIndicator color="#fff" />
          </View>
        )}
        <View style={styles.viewers}>
          <View style={styles.dot} />
          <Text style={styles.viewersText}>{formatCount(game.viewers)}</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {game.name}
      </Text>
    </Pressable>
  );
}

/** Horizontal row of the most-watched games on Kick. */
export function TrendingRow() {
  const trending = useTrendingGames(15);
  if (trending.loading) return <ActivityIndicator color={Colors.accent} style={{ paddingVertical: Spacing.four }} />;
  if (!trending.games.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}>
      {trending.games.map((g) => (
        <TrendingTile key={g.slug} game={g} width={120} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  cover: { aspectRatio: 3 / 4, borderRadius: Radius.sm, overflow: 'hidden', backgroundColor: Colors.surface },
  opening: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  viewers: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.live },
  viewersText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  name: { color: Colors.text, fontSize: 12, fontWeight: '700', marginTop: 6 },
});
