import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiveBadge } from '@/components/badges';
import { GameCover } from '@/components/game-cover';
import { StreamCard, VideoCard } from '@/components/media-cards';
import { Chip, GradientButton, IconButton, PriceTag, Rating, SectionHeader } from '@/components/ui';
import { Colors, MaxContentWidth, Platforms, Radius, Spacing, type PlatformId } from '@/constants/theme';
import { formatCount, getGame, streamsFor, videosFor, viewersFor, type Game } from '@/data/games';
import { useCart } from '@/store/cart';

type Tab = 'watch' | 'about';
type PlatformFilter = 'all' | PlatformId;

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const game = getGame(id);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>('watch');

  if (!game) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.body}>Game not found.</Text>
      </View>
    );
  }

  const contentWidth = Math.min(width, MaxContentWidth);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 120 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={{ width: contentWidth }}>
          <GameCover game={game} iconSize={150} style={styles.hero}>
            <LinearGradient colors={['rgba(7,7,12,0.5)', 'rgba(7,7,12,0)', Colors.background]} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
          </GameCover>

          <View style={styles.header}>
            <Text style={styles.studio}>{game.studio.toUpperCase()}</Text>
            <Text style={styles.title}>{game.title}</Text>
            <Text style={styles.tagline}>{game.tagline}</Text>
            <View style={styles.metaRow}>
              <Rating value={game.rating} count={`${formatCount(game.ratingCount)} reviews`} />
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.metaText}>{game.ageRating}</Text>
              <Text style={styles.metaDivider}>•</Text>
              <Text style={styles.metaText}>{game.release}</Text>
            </View>
            <View style={styles.genreRow}>
              {game.genres.map((g) => (
                <View key={g} style={styles.genre}>
                  <Text style={styles.genreText}>{g}</Text>
                </View>
              ))}
            </View>
          </View>

          <Segmented tab={tab} onChange={setTab} />

          {tab === 'watch' ? <WatchTab game={game} /> : <AboutTab game={game} />}
        </View>
      </ScrollView>

      {/* Floating top buttons */}
      <View style={[styles.topButtons, { top: insets.top + Spacing.two, width: contentWidth }]} pointerEvents="box-none">
        <IconButton icon="arrow-left" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <IconButton icon="cart-outline" onPress={() => router.navigate('/cart')} />
      </View>

      <BuyBar game={game} />
    </View>
  );
}

function Segmented({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items: { key: Tab; label: string; icon: 'play-circle-outline' | 'book-open-page-variant-outline' }[] = [
    { key: 'watch', label: 'Watch', icon: 'play-circle-outline' },
    { key: 'about', label: 'About this game', icon: 'book-open-page-variant-outline' },
  ];
  return (
    <View style={styles.segmented}>
      {items.map((item) => {
        const active = item.key === tab;
        return (
          <Pressable key={item.key} onPress={() => onChange(item.key)} style={[styles.segment, active && styles.segmentActive]}>
            <MaterialCommunityIcons name={item.icon} size={18} color={active ? Colors.text : Colors.textMuted} />
            <Text style={[styles.segmentText, active && { color: Colors.text }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function WatchTab({ game }: { game: Game }) {
  const [platform, setPlatform] = useState<PlatformFilter>('all');
  const allStreams = streamsFor(game.id);
  const allVideos = videosFor(game.id);
  const match = (p: PlatformId) => platform === 'all' || p === platform;
  const live = allStreams.filter((s) => match(s.platform));
  const vids = allVideos.filter((v) => match(v.platform));

  return (
    <View>
      <View style={styles.watchSummary}>
        <LiveBadge viewers={viewersFor(game.id)} />
        <Text style={styles.watchSummaryText}>
          {allStreams.length} live streams · {allVideos.length} top videos
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Chip label="All" active={platform === 'all'} onPress={() => setPlatform('all')} />
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

      <SectionHeader title="Live now" subtitle="Best ranked players streaming this game" />
      <View style={styles.stack}>
        {live.map((s) => (
          <StreamCard key={s.id} stream={s} />
        ))}
        {live.length === 0 && <EmptyNote text="No live streams on this platform right now." />}
      </View>

      <View style={{ height: Spacing.five }} />
      <SectionHeader title="Top videos" subtitle="Guides, highlights and records" />
      <View style={styles.stack}>
        {vids.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
        {vids.length === 0 && <EmptyNote text="No videos on this platform yet." />}
      </View>
    </View>
  );
}

function AboutTab({ game }: { game: Game }) {
  const { about } = game;
  return (
    <View style={styles.about}>
      <Text style={styles.h2}>What is {game.title}?</Text>
      {about.overview.map((p, i) => (
        <Text key={i} style={styles.body}>
          {p}
        </Text>
      ))}

      <Text style={styles.h2}>How to play</Text>
      <View style={{ gap: Spacing.two }}>
        {about.howToPlay.map((step, i) => (
          <View key={step.title} style={styles.step}>
            <LinearGradient colors={game.colors.slice(0, 2) as [string, string]} style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepText}>{step.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.h2}>Who is it for?</Text>
      <View style={{ gap: Spacing.two }}>
        {about.whoFor.map((w) => (
          <View key={w.title} style={styles.whoCard}>
            <View style={[styles.whoIcon, { backgroundColor: game.colors[0] + '33' }]}>
              <MaterialCommunityIcons name={w.icon} size={22} color={game.colors[0]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.stepTitle}>{w.title}</Text>
              <Text style={styles.stepText}>{w.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.h2}>Key features</Text>
      <View style={{ gap: 10 }}>
        {about.features.map((f) => (
          <View key={f} style={styles.feature}>
            <MaterialCommunityIcons name="check-circle" size={18} color={Colors.success} />
            <Text style={[styles.body, { flex: 1 }]}>{f}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.h2}>Game modes</Text>
      <View style={styles.genreRow}>
        {about.modes.map((m) => (
          <View key={m} style={styles.mode}>
            <Text style={styles.modeText}>{m}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.h2}>Details</Text>
      <View style={styles.details}>
        <Detail label="Developer" value={game.studio} />
        <Detail label="Release" value={game.release} />
        <Detail label="Platforms" value={game.systems.join(', ')} />
        <Detail label="Age rating" value={game.ageRating} />
        <Detail label="Download size" value={game.size} last />
      </View>
    </View>
  );
}

function Detail({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, !last && styles.detailBorder]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <Text style={[styles.body, { color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.three }]}>{text}</Text>;
}

function BuyBar({ game }: { game: Game }) {
  const insets = useSafeAreaInsets();
  const { cart, owned, add } = useCart();
  const inCart = cart.includes(game.id);
  const isOwned = owned.includes(game.id);
  const free = game.price === 0;

  let label = free ? 'Get for free' : 'Buy now';
  if (inCart) label = 'Go to cart';
  if (isOwned) label = 'In your library';

  return (
    <View style={[styles.buyBar, { paddingBottom: insets.bottom + Spacing.three }]}>
      <View style={styles.buyInner}>
        <View>
          <Text style={styles.buyLabel}>{free ? 'Free to play' : 'Price'}</Text>
          <PriceTag game={game} size="lg" />
        </View>
        <GradientButton
          label={label}
          icon={isOwned ? 'check' : inCart ? 'cart-arrow-right' : 'cart-plus'}
          disabled={isOwned}
          style={{ flex: 1 }}
          onPress={() => {
            add(game.id);
            router.navigate('/cart');
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  center: { alignItems: 'center', justifyContent: 'center' },
  hero: { height: 380 },
  topButtons: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  header: { paddingHorizontal: Spacing.three, marginTop: -70, gap: 6 },
  studio: { color: Colors.accent2, fontSize: 12, fontWeight: '800', letterSpacing: 1.4 },
  title: { color: Colors.text, fontSize: 40, fontWeight: '900', letterSpacing: -1.2 },
  tagline: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  metaDivider: { color: Colors.textMuted },
  metaText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  genre: { backgroundColor: Colors.accentSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
  genreText: { color: '#C4B5FD', fontSize: 12, fontWeight: '700' },
  segmented: {
    flexDirection: 'row',
    margin: Spacing.three,
    marginTop: Spacing.four,
    padding: 4,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, borderRadius: 12 },
  segmentActive: { backgroundColor: Colors.surfaceRaised },
  segmentText: { color: Colors.textMuted, fontSize: 14, fontWeight: '800' },
  watchSummary: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: Spacing.three },
  watchSummaryText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  filterRow: { gap: Spacing.two, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, marginBottom: Spacing.two },
  stack: { paddingHorizontal: Spacing.three, gap: Spacing.four },
  about: { paddingHorizontal: Spacing.three, gap: 12 },
  h2: { color: Colors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.4, marginTop: Spacing.four },
  body: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24 },
  step: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumber: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontSize: 16, fontWeight: '900' },
  stepTitle: { color: Colors.text, fontSize: 15, fontWeight: '800', marginBottom: 3 },
  stepText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  whoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  whoIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mode: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill },
  modeText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  details: { borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 13 },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel: { color: Colors.textMuted, fontSize: 14 },
  detailValue: { color: Colors.text, fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  buyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(7,7,12,0.94)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  buyInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, width: '100%', maxWidth: MaxContentWidth - Spacing.three * 2 },
  buyLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 2 },
});
