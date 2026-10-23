import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameCover } from '@/components/game-cover';
import { PriceTag, Rating } from '@/components/ui';
import { Colors, Radius } from '@/constants/theme';
import { formatCount, streamsFor, viewersFor, type Game } from '@/data/games';

export function GameRow({ game }: { game: Game }) {
  const liveCount = streamsFor(game.id).length;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
      <GameCover game={game} iconSize={38} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.genres} numberOfLines={1}>
          {game.genres.join(' · ')}
        </Text>
        <View style={styles.metaRow}>
          <Rating value={game.rating} />
          {liveCount > 0 && (
            <View style={styles.liveMeta}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>{formatCount(viewersFor(game.id))} watching</Text>
            </View>
          )}
        </View>
        <PriceTag game={game} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 14,
    padding: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cover: { width: 96, height: 120, borderRadius: Radius.md },
  info: { flex: 1, justifyContent: 'center', gap: 6 },
  title: { color: Colors.text, fontSize: 17, fontWeight: '800' },
  genres: { color: Colors.textSecondary, fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.live },
  liveText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
});
