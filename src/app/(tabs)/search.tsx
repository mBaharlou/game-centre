import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameCover } from '@/components/game-cover';
import { Chip, SectionHeader } from '@/components/ui';
import { Colors, MaxContentWidth, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { games } from '@/data/games';
import type { Device } from '@/data/platforms';
import { accentFor } from '@/services/game-details';
import { TrendingTile } from '@/components/trending';
import { useTrendingGames } from '@/services/kick';
import { steamImage } from '@/services/steam';
import { searchGames, type GameHit } from '@/services/wikidata';

const QUICK = ['Fortnite', 'Minecraft', 'Valorant', 'League of Legends', 'Call of Duty', 'EA Sports FC', 'Roblox', 'The Legend of Zelda'];

const DEVICE_ICONS: Partial<Record<Device, 'monitor' | 'apple' | 'sony-playstation' | 'microsoft-xbox' | 'nintendo-switch' | 'cellphone'>> = {
  pc: 'monitor',
  mac: 'apple',
  ps5: 'sony-playstation',
  ps4: 'sony-playstation',
  'xbox-series': 'microsoft-xbox',
  'xbox-one': 'microsoft-xbox',
  switch2: 'nintendo-switch',
  switch: 'nintendo-switch',
  ios: 'cellphone',
  android: 'cellphone',
};

type Result = GameHit & { catalogId?: string };

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [failed, setFailed] = useState(false);
  const trending = useTrendingGames(24);
  const contentWidth = Math.min(width, MaxContentWidth);
  const tileWidth = (contentWidth - Spacing.three * 4) / 3;
  const q = query.trim();

  // Catalog games match instantly while the online search runs.
  const local = useMemo(() => {
    if (q.length < 2) return [];
    const lower = q.toLowerCase();
    return games.filter((g) => g.title.toLowerCase().includes(lower) || g.developers.some((d) => d.toLowerCase().includes(lower)));
  }, [q]);

  useEffect(() => {
    if (q.length < 2) return;
    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      setFailed(false);
      try {
        const hits = await searchGames(q, 25);
        if (active) setResults(hits);
      } catch {
        if (active) setFailed(true);
      } finally {
        if (active) setSearching(false);
      }
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [q]);

  const steamIdsInCatalog = new Set(local.map((g) => String(g.appId)));
  const online = q.length < 2 ? [] : results.filter((r) => !r.steamAppId || !steamIdsInCatalog.has(r.steamAppId));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ alignItems: 'center', paddingTop: insets.top + Spacing.three, paddingBottom: TabBarHeight + insets.bottom + Spacing.five }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      showsVerticalScrollIndicator={false}>
      <View style={{ width: contentWidth }}>
        <Text style={styles.title}>Search</Text>
        <Text style={styles.subtitle}>Any game, on any platform.</Text>

        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={22} color={Colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Fortnite, Call of Duty, Minecraft…"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            autoFocus={!params.q}
            autoCorrect={false}
            returnKeyType="search"
          />
          {searching ? (
            <ActivityIndicator color={Colors.accent} size="small" />
          ) : (
            !!query && <MaterialCommunityIcons name="close-circle" size={20} color={Colors.textMuted} onPress={() => setQuery('')} />
          )}
        </View>

        {q.length < 2 ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
              {QUICK.map((name) => (
                <Chip key={name} label={name} icon="magnify" onPress={() => setQuery(name)} />
              ))}
            </ScrollView>

            <SectionHeader title="Trending now" subtitle="Most watched games on Kick right now" />
            {trending.loading && <ActivityIndicator color={Colors.accent} style={{ paddingVertical: Spacing.five }} />}
            <View style={styles.grid}>
              {trending.games.map((t) => (
                <TrendingTile key={t.slug} game={t} width={tileWidth} />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.list}>
            {local.map((g) => (
              <ResultRow
                key={g.id}
                onPress={() => router.push({ pathname: '/game/[id]', params: { id: g.id } })}
                art={g}
                title={g.title}
                sub={`${g.releaseDate.slice(-4)} · ${g.genres.slice(0, 2).join(', ')}`}
                devices={[]}
                featured
              />
            ))}
            {online.map((r) => (
              <ResultRow
                key={r.qid}
                onPress={() => router.push({ pathname: '/game/[id]', params: { id: r.qid } })}
                art={{
                  title: r.title,
                  accent: accentFor(r.title),
                  images: r.steamAppId ? { header: steamImage(r.steamAppId, 'header.jpg') } : {},
                }}
                title={r.title}
                sub={r.year && !r.description.includes(r.year) ? `${r.year} · ${r.description}` : r.description}
                devices={r.devices}
              />
            ))}
            {!searching && local.length === 0 && online.length === 0 && (
              <Text style={styles.empty}>{failed ? 'Search is unavailable right now. Check your connection.' : `No games found for “${q}”.`}</Text>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function ResultRow({
  art,
  title,
  sub,
  devices,
  featured,
  onPress,
}: {
  art: Parameters<typeof GameCover>[0]['game'];
  title: string;
  sub: string;
  devices: Device[];
  featured?: boolean;
  onPress: () => void;
}) {
  const icons = [...new Set(devices.map((d) => DEVICE_ICONS[d]).filter(Boolean))];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <GameCover game={art} variant="header" style={styles.rowCover} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {title}
          </Text>
          {featured && <MaterialCommunityIcons name="star-four-points" size={14} color={Colors.gold} />}
        </View>
        {!!sub && (
          <Text style={styles.rowSub} numberOfLines={2}>
            {sub}
          </Text>
        )}
        {icons.length > 0 && (
          <View style={styles.icons}>
            {icons.map((i) => (
              <MaterialCommunityIcons key={i} name={i!} size={14} color={Colors.textMuted} />
            ))}
          </View>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  title: { color: Colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1, paddingHorizontal: Spacing.three },
  subtitle: { color: Colors.textSecondary, fontSize: 14, paddingHorizontal: Spacing.three, marginTop: 4 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    margin: Spacing.three,
    paddingHorizontal: 16,
    height: 54,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.accent + '66',
  },
  searchInput: { flex: 1, color: Colors.text, fontSize: 16, outlineWidth: 0 },
  chips: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingBottom: Spacing.four },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, paddingHorizontal: Spacing.three, rowGap: Spacing.three },
  list: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  rowCover: { width: 112, aspectRatio: 460 / 215, borderRadius: 8 },
  rowTitle: { color: Colors.text, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  rowSub: { color: Colors.textSecondary, fontSize: 12, lineHeight: 17 },
  icons: { flexDirection: 'row', gap: 6, marginTop: 2 },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.five },
});
