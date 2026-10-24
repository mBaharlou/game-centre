import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiveBadge } from '@/components/badges';
import { GameCover } from '@/components/game-cover';
import { KickStreamCard } from '@/components/media-cards';
import { Chip, SectionHeader } from '@/components/ui';
import { Colors, MaxContentWidth, Platforms, Radius, Spacing, TabBarHeight, type PlatformId } from '@/constants/theme';
import { games, links, type Game } from '@/data/games';
import { useKickLive } from '@/services/kick';
import { openLink } from '@/utils/open-link';

const ALL_IDS = games.map((g) => g.id);

/** Every live stream we can find, plus one-tap links to each game's live page on every platform. */
export default function LiveScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [gameId, setGameId] = useState<string | null>(null);
  const live = useKickLive(ALL_IDS, 5);

  const streams = live.streams.filter((s) => !gameId || s.gameId === gameId);
  const total = live.streams.reduce((sum, s) => sum + s.viewers, 0);
  const contentWidth = Math.min(width, MaxContentWidth);
  const shownGames = games.filter((g) => !gameId || g.id === gameId);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ alignItems: 'center', paddingTop: insets.top + Spacing.three, paddingBottom: TabBarHeight + insets.bottom + Spacing.five }}
      refreshControl={<RefreshControl refreshing={live.loading && live.streams.length > 0} onRefresh={live.refresh} tintColor={Colors.accent} />}
      showsVerticalScrollIndicator={false}>
      <View style={{ width: contentWidth }}>
        <View style={styles.header}>
          <Text style={styles.title}>Live</Text>
          {total > 0 && <LiveBadge viewers={total} />}
        </View>
        <Text style={styles.subtitle}>The best players in every game, on Twitch, YouTube and Kick.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          <Chip label="All games" active={!gameId} onPress={() => setGameId(null)} />
          {games.map((g) => (
            <Chip key={g.id} label={g.title} active={gameId === g.id} onPress={() => setGameId(g.id)} />
          ))}
        </ScrollView>

        <SectionHeader title="Streaming now on Kick" subtitle="Tap to watch inside the app" />
        <View style={styles.list}>
          {live.loading && live.streams.length === 0 && <ActivityIndicator color={Colors.accent} style={{ paddingVertical: Spacing.five }} />}
          {streams.slice(0, gameId ? 12 : 20).map((s) => (
            <KickStreamCard key={s.id} stream={s} showGame={!gameId} />
          ))}
          {!live.loading && streams.length === 0 && (
            <View style={styles.empty}>
              <MaterialCommunityIcons name={Platforms.kick.icon} size={22} color={Platforms.kick.color} />
              <Text style={styles.emptyText}>
                {live.error ? 'Kick streams could not be loaded here. Use the buttons below to watch on each platform.' : 'Nobody is live on Kick for this game right now.'}
              </Text>
            </View>
          )}
        </View>

        <View style={{ height: Spacing.five }} />
        <SectionHeader title="Watch live by game" subtitle="Opens the top streams, most viewers first" />
        <View style={styles.list}>
          {shownGames.map((g) => (
            <GameLiveRow key={g.id} game={g} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function GameLiveRow({ game }: { game: Game }) {
  const targets: { id: PlatformId; url: string }[] = [
    { id: 'twitch', url: links.twitch(game) },
    { id: 'youtube', url: links.youtubeLive(game) },
    { id: 'kick', url: links.kick(game) },
  ];
  return (
    <View style={styles.row}>
      <Pressable onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })} style={styles.rowTop}>
        <GameCover game={game} variant="header" style={styles.rowCover} />
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {game.title}
          </Text>
          <Text style={styles.rowSub} numberOfLines={1}>
            {game.genres.join(' · ')}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
      </Pressable>
      <View style={styles.rowButtons}>
        {targets.map((t) => {
          const p = Platforms[t.id];
          const dark = t.id === 'kick';
          return (
            <Pressable key={t.id} onPress={() => openLink(t.url)} style={({ pressed }) => [styles.platformButton, { backgroundColor: p.color }, pressed && { opacity: 0.8 }]}>
              <MaterialCommunityIcons name={p.icon} size={16} color={dark ? '#000' : '#fff'} />
              <Text style={[styles.platformText, dark && { color: '#000' }]}>{p.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.three },
  title: { color: Colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  subtitle: { color: Colors.textSecondary, fontSize: 14, paddingHorizontal: Spacing.three, marginTop: 4 },
  chips: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, marginBottom: Spacing.two },
  list: { paddingHorizontal: Spacing.three, gap: Spacing.four },
  empty: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyText: { flex: 1, color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  row: { padding: 12, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 12, marginTop: -Spacing.two },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowCover: { width: 96, aspectRatio: 460 / 215, borderRadius: 8 },
  rowTitle: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  rowSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  rowButtons: { flexDirection: 'row', gap: 8 },
  platformButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 10 },
  platformText: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
