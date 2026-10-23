import { useState } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiveBadge } from '@/components/badges';
import { StreamCard } from '@/components/media-cards';
import { Chip } from '@/components/ui';
import { Colors, MaxContentWidth, Platforms, Spacing, TabBarHeight, type PlatformId } from '@/constants/theme';
import { games, streams } from '@/data/games';

/** Every live stream across all games and platforms, most watched first. */
export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [platform, setPlatform] = useState<'all' | PlatformId>('all');
  const [gameId, setGameId] = useState<string | null>(null);

  const list = streams
    .filter((s) => (platform === 'all' || s.platform === platform) && (!gameId || s.gameId === gameId))
    .sort((a, b) => b.viewers - a.viewers);
  const total = streams.reduce((sum, s) => sum + s.viewers, 0);
  const contentWidth = Math.min(width, MaxContentWidth);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ alignItems: 'center', paddingTop: insets.top + Spacing.three, paddingBottom: TabBarHeight + insets.bottom + Spacing.five }}
      showsVerticalScrollIndicator={false}>
      <View style={{ width: contentWidth }}>
        <View style={styles.header}>
          <Text style={styles.title}>Live</Text>
          <LiveBadge viewers={total} />
        </View>
        <Text style={styles.subtitle}>The best players in every game, from every platform, in one place.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All platforms" active={platform === 'all'} onPress={() => setPlatform('all')} />
          {(Object.keys(Platforms) as PlatformId[]).map((p) => (
            <Chip
              key={p}
              label={Platforms[p].name}
              icon={Platforms[p].icon}
              color={Platforms[p].color}
              active={platform === p}
              onPress={() => setPlatform(p)}
            />
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { paddingTop: 0 }]}>
          <Chip label="All games" active={!gameId} onPress={() => setGameId(null)} />
          {games.map((g) => (
            <Chip key={g.id} label={g.title} icon={g.icon} active={gameId === g.id} onPress={() => setGameId(g.id)} />
          ))}
        </ScrollView>

        <View style={styles.list}>
          {list.map((s) => (
            <StreamCard key={s.id} stream={s} showGame />
          ))}
          {list.length === 0 && <Text style={styles.empty}>Nobody is live with these filters right now.</Text>}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.three },
  title: { color: Colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, paddingHorizontal: Spacing.three, marginTop: 4 },
  chips: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
  list: { paddingHorizontal: Spacing.three, gap: Spacing.four, marginTop: Spacing.two },
  empty: { color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.five },
});
