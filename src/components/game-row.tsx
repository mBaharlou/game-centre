import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameCover } from '@/components/game-cover';
import { PriceTag } from '@/components/ui';
import { Colors, Radius } from '@/constants/theme';
import type { Game } from '@/data/games';
import { useAuth } from '@/store/auth';

const openGame = (game: Game) => router.push({ pathname: '/game/[id]', params: { id: game.id } });

/** Box-art card for grids and carousels. */
export function GameTile({ game, width }: { game: Game; width: number }) {
  const { owns } = useAuth();
  return (
    <Pressable onPress={() => openGame(game)} style={({ pressed }) => [{ width }, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}>
      <GameCover game={game} style={styles.tileCover}>
        {owns(game.id) && (
          <View style={styles.owned}>
            <MaterialCommunityIcons name="check" size={12} color="#03140D" />
            <Text style={styles.ownedText}>OWNED</Text>
          </View>
        )}
      </GameCover>
      <Text style={styles.tileTitle} numberOfLines={1}>
        {game.title}
      </Text>
      <Text style={styles.genres} numberOfLines={1}>
        {game.genres.slice(0, 2).join(' · ')}
      </Text>
      <View style={{ marginTop: 6 }}>
        <PriceTag game={game} />
      </View>
    </Pressable>
  );
}

/** Wide list row with the Steam banner. */
export function GameRow({ game }: { game: Game }) {
  return (
    <Pressable onPress={() => openGame(game)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.85 }]}>
      <GameCover game={game} variant="header" style={styles.rowCover} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={1}>
          {game.title}
        </Text>
        <Text style={styles.genres} numberOfLines={1}>
          {game.genres.join(' · ')}
        </Text>
        <PriceTag game={game} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tileCover: { aspectRatio: 2 / 3, borderRadius: Radius.md },
  tileTitle: { color: Colors.text, fontSize: 15, fontWeight: '800', marginTop: 10 },
  owned: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ownedText: { color: '#03140D', fontSize: 10, fontWeight: '900' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowCover: { width: 128, aspectRatio: 460 / 215, borderRadius: 10 },
  info: { flex: 1, gap: 4 },
  title: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  genres: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
});
