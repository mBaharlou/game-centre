import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MetacriticBadge } from '@/components/badges';
import { GameCover } from '@/components/game-cover';
import { GameTile } from '@/components/game-row';
import { KickStreamCard } from '@/components/media-cards';
import { Avatar, Chip, IconButton, PriceTag, SectionHeader } from '@/components/ui';
import { AccentGradient, Colors, MaxContentWidth, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { ALL_GENRES, games, matchesGenre, type Game } from '@/data/games';
import { catalogTargets, useKickLive } from '@/services/kick';
import { useAuth } from '@/store/auth';
import { TrendingRow } from '@/components/trending';

const ALL_TARGETS = catalogTargets(games.map((g) => g.id));

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const live = useKickLive(ALL_TARGETS, 3);
  const [genre, setGenre] = useState('All');
  const [slide, setSlide] = useState(0);

  const contentWidth = Math.min(width, MaxContentWidth);
  const cardWidth = contentWidth - Spacing.three * 2;
  const tileWidth = (contentWidth - Spacing.three * 3) / 2;
  const featured = games.filter((g) => g.featured);
  const deals = games.filter((g) => g.discount > 0);
  const free = games.filter((g) => g.isFree);

  const browse = useMemo(() => games.filter((g) => matchesGenre(g, genre)), [genre]);

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setSlide(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + Spacing.three)));
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.two, paddingBottom: TabBarHeight + insets.bottom + Spacing.five }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <View style={{ width: contentWidth }}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <LinearGradient colors={AccentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
            <MaterialCommunityIcons name="gamepad-variant" size={20} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>Game Centre</Text>
            <Text style={styles.brandSub}>{user ? `Welcome back, ${user.displayName.split(' ')[0]}` : 'Watch the best. Then play.'}</Text>
          </View>
          <IconButton icon="magnify" onPress={() => router.navigate('/search')} />
          <Pressable onPress={() => router.navigate('/profile')} hitSlop={6}>
            {user ? (
              <Avatar name={user.displayName} color={user.avatarColor} size={42} />
            ) : (
              <View style={styles.signInPill}>
                <Text style={styles.signInText}>Sign in</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Search */}
        <Pressable onPress={() => router.navigate('/search')} style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={22} color={Colors.textMuted} />
          <Text style={styles.searchPlaceholder}>Search any game: Fortnite, Call of Duty…</Text>
        </Pressable>

        {/* Featured carousel */}
        <ScrollView
          horizontal
          snapToInterval={cardWidth + Spacing.three}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onScroll={onCarouselScroll}
          scrollEventThrottle={32}
          contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}>
          {featured.map((game) => (
            <FeaturedCard key={game.id} game={game} width={cardWidth} />
          ))}
        </ScrollView>
        <View style={styles.dots}>
          {featured.map((g, i) => (
            <View key={g.id} style={[styles.dot, i === slide && styles.dotActive]} />
          ))}
        </View>

        {/* Live on Kick */}
        <SectionHeader
          title="Live right now"
          subtitle="Real streams from Kick, most viewers first"
          action={
            <Pressable onPress={() => router.navigate('/live')} hitSlop={8}>
              <Text style={styles.seeAll}>All live</Text>
            </Pressable>
          }
        />
        {live.streams.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {live.streams.slice(0, 10).map((s) => (
              <KickStreamCard key={s.id} stream={s} width={280} showGame />
            ))}
          </ScrollView>
        ) : (
          <Pressable onPress={() => router.navigate('/live')} style={styles.liveFallback}>
            <MaterialCommunityIcons name="broadcast" size={22} color={Colors.live} />
            <Text style={styles.liveFallbackText}>
              {live.loading ? 'Loading live streams…' : 'Open the Live tab to watch on Twitch, YouTube and Kick'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </Pressable>
        )}

        {/* Trending */}
        <View style={styles.gap} />
        <SectionHeader
          title="Trending now"
          subtitle="Most watched games on Kick right now"
          action={
            <Pressable onPress={() => router.navigate('/search')} hitSlop={8}>
              <Text style={styles.seeAll}>More</Text>
            </Pressable>
          }
        />
        <TrendingRow />

        {/* Deals */}
        {deals.length > 0 && (
          <>
            <View style={styles.gap} />
            <SectionHeader title="On sale" subtitle="Current Steam discounts" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {deals.map((g) => (
                <GameTile key={g.id} game={g} width={150} />
              ))}
            </ScrollView>
          </>
        )}

        {/* Free */}
        <View style={styles.gap} />
        <SectionHeader title="Free to play" subtitle="Jump in without paying anything" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
          {free.map((g) => (
            <GameTile key={g.id} game={g} width={150} />
          ))}
        </ScrollView>

        {/* Browse */}
        <View style={styles.gap} />
        <SectionHeader title="Our picks" subtitle={`${games.length} of the world's best games, with full guides`} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.hRow, { gap: Spacing.two, marginBottom: Spacing.three }]}>
          {ALL_GENRES.map((g) => (
            <Chip key={g} label={g} active={g === genre} onPress={() => setGenre(g)} />
          ))}
        </ScrollView>
        <View style={styles.grid}>
          {browse.map((g) => (
            <GameTile key={g.id} game={g} width={tileWidth} />
          ))}
        </View>
        {browse.length === 0 && <Text style={styles.empty}>No games in this category yet. Try Search to find any game.</Text>}
      </View>
    </ScrollView>
  );
}

function FeaturedCard({ game, width }: { game: Game; width: number }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })}
      style={({ pressed }) => [{ width }, pressed && { transform: [{ scale: 0.985 }] }]}>
      <GameCover game={game} variant="hero" style={styles.featured}>
        <LinearGradient colors={['rgba(7,7,12,0)', 'rgba(7,7,12,0.55)', 'rgba(7,7,12,0.97)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.featuredTop}>
          <View style={styles.featuredTag}>
            <MaterialCommunityIcons name="star-four-points" size={12} color="#000" />
            <Text style={styles.featuredTagText}>FEATURED</Text>
          </View>
          {game.metacritic && <MetacriticBadge score={game.metacritic} />}
        </View>
        <View style={styles.featuredBottom}>
          <Text style={[styles.featuredGenres, { color: game.accent }]}>{game.genres.join('  ·  ').toUpperCase()}</Text>
          <Text style={styles.featuredTitle}>{game.title}</Text>
          <Text style={styles.featuredTagline} numberOfLines={2}>
            {game.tagline}
          </Text>
          <View style={styles.featuredFooter}>
            <PriceTag game={game} />
            <View style={styles.watchPill}>
              <MaterialCommunityIcons name="play-circle" size={18} color="#000" />
              <Text style={styles.watchPillText}>Watch & buy</Text>
            </View>
          </View>
        </View>
      </GameCover>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { alignItems: 'center' },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.three, marginBottom: Spacing.four },
  logo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  brand: { color: Colors.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  brandSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  signInPill: { backgroundColor: Colors.text, paddingHorizontal: 14, height: 42, borderRadius: 21, justifyContent: 'center' },
  signInText: { color: '#000', fontSize: 13, fontWeight: '800' },
  featured: { height: 440, borderRadius: Radius.lg },
  featuredTop: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  featuredTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.gold, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  featuredTagText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  featuredBottom: { position: 'absolute', left: 20, right: 20, bottom: 20, gap: 6 },
  featuredGenres: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  featuredTitle: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  featuredTagline: { color: 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20 },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  watchPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.pill },
  watchPillText: { color: '#000', fontSize: 14, fontWeight: '800' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14, marginBottom: Spacing.five },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 22, backgroundColor: Colors.accent },
  seeAll: { color: Colors.accent2, fontSize: 14, fontWeight: '700' },
  hRow: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  gap: { height: Spacing.five },
  liveFallback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  liveFallbackText: { flex: 1, color: Colors.textSecondary, fontSize: 14 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.three,
    marginBottom: Spacing.three,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchPlaceholder: { flex: 1, color: Colors.textMuted, fontSize: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, paddingHorizontal: Spacing.three, rowGap: Spacing.four },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.five },
});
