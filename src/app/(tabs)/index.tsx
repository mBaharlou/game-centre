import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiveBadge } from '@/components/badges';
import { GameCover } from '@/components/game-cover';
import { GameRow } from '@/components/game-row';
import { StreamCard } from '@/components/media-cards';
import { Chip, IconButton, PriceTag, SectionHeader } from '@/components/ui';
import { AccentGradient, Colors, MaxContentWidth, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { games, streams, streamsFor, viewersFor, type Game } from '@/data/games';
import { useCart } from '@/store/cart';

const GENRES = ['All', 'Action RPG', 'Shooter', 'Racing', 'Strategy', 'Horror', 'Cozy'];

export default function StoreScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cart } = useCart();
  const [genre, setGenre] = useState('All');
  const [query, setQuery] = useState('');
  const [slide, setSlide] = useState(0);

  const contentWidth = Math.min(width, MaxContentWidth);
  const cardWidth = contentWidth - Spacing.three * 2;
  const featured = games.filter((g) => g.featured);
  const liveNow = [...streams].sort((a, b) => b.viewers - a.viewers).slice(0, 8);

  const browse = useMemo(() => {
    const q = query.trim().toLowerCase();
    return games.filter(
      (g) =>
        (genre === 'All' || g.genres.includes(genre)) &&
        (!q || g.title.toLowerCase().includes(q) || g.genres.some((x) => x.toLowerCase().includes(q))),
    );
  }, [genre, query]);

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setSlide(Math.round(e.nativeEvent.contentOffset.x / (cardWidth + Spacing.three)));
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.two, paddingBottom: TabBarHeight + insets.bottom + Spacing.five }]}
      showsVerticalScrollIndicator={false}>
      <View style={{ width: contentWidth }}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <LinearGradient colors={AccentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
            <MaterialCommunityIcons name="gamepad-variant" size={20} color="#fff" />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.brand}>Game Centre</Text>
            <Text style={styles.brandSub}>Watch the best. Then play.</Text>
          </View>
          <IconButton icon="cart-outline" badge={cart.length} onPress={() => router.navigate('/cart')} />
        </View>

        {/* Featured carousel */}
        <ScrollView
          horizontal
          pagingEnabled={false}
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

        {/* Live now */}
        <SectionHeader
          title="Live right now"
          subtitle="Top players on Twitch, YouTube & Kick"
          action={
            <Pressable onPress={() => router.navigate('/live')} hitSlop={8}>
              <Text style={styles.seeAll}>See all</Text>
            </Pressable>
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}>
          {liveNow.map((s) => (
            <StreamCard key={s.id} stream={s} width={270} showGame />
          ))}
        </ScrollView>

        {/* Browse */}
        <View style={{ height: Spacing.five }} />
        <SectionHeader title="Browse games" subtitle={`${games.length} games in the store`} />
        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={20} color={Colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search games or genres"
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
          {!!query && <MaterialCommunityIcons name="close-circle" size={18} color={Colors.textMuted} onPress={() => setQuery('')} />}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.two, marginBottom: Spacing.three }}>
          {GENRES.map((g) => (
            <Chip key={g} label={g} active={g === genre} onPress={() => setGenre(g)} />
          ))}
        </ScrollView>
        <View style={styles.list}>
          {browse.map((g) => (
            <GameRow key={g.id} game={g} />
          ))}
          {browse.length === 0 && <Text style={styles.empty}>No games match your search.</Text>}
        </View>
      </View>
    </ScrollView>
  );
}

function FeaturedCard({ game, width }: { game: Game; width: number }) {
  const viewers = viewersFor(game.id);
  const liveCount = streamsFor(game.id).length;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })}
      style={({ pressed }) => [{ width }, pressed && { transform: [{ scale: 0.985 }] }]}>
      <GameCover game={game} iconSize={120} style={styles.featured}>
        <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.25)', 'rgba(7,7,12,0.95)']} locations={[0, 0.45, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.featuredTop}>
          <LiveBadge viewers={viewers} />
          <Text style={styles.featuredTopText}>{liveCount} top players streaming</Text>
        </View>
        <View style={styles.featuredBottom}>
          <Text style={styles.featuredGenres}>{game.genres.join('  ·  ').toUpperCase()}</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.four,
  },
  logo: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  brand: { color: Colors.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.4 },
  brandSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 1 },
  featured: { height: 440, borderRadius: Radius.lg },
  featuredTop: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  featuredTopText: { color: '#fff', fontSize: 12, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 6 },
  featuredBottom: { position: 'absolute', left: 20, right: 20, bottom: 20, gap: 6 },
  featuredGenres: { color: Colors.accent2, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  featuredTitle: { color: '#fff', fontSize: 36, fontWeight: '900', letterSpacing: -1 },
  featuredTagline: { color: 'rgba(255,255,255,0.78)', fontSize: 14, lineHeight: 20 },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  watchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.pill,
  },
  watchPillText: { color: '#000', fontSize: 14, fontWeight: '800' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 14, marginBottom: Spacing.five },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { width: 22, backgroundColor: Colors.accent },
  seeAll: { color: Colors.accent2, fontSize: 14, fontWeight: '700' },
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
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, outlineWidth: 0 },
  list: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  empty: { color: Colors.textSecondary, textAlign: 'center', paddingVertical: Spacing.five },
});