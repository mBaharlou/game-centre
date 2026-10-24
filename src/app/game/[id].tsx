import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MetacriticBadge } from '@/components/badges';
import { GameCover } from '@/components/game-cover';
import { KickStreamCard, LinkRow, PlatformLiveButton, TrailerCard } from '@/components/media-cards';
import { GradientButton, IconButton, PriceTag, SectionHeader } from '@/components/ui';
import { Colors, MaxContentWidth, Platforms, Radius, Spacing } from '@/constants/theme';
import { getGame, links, youtubeTopics, type Game } from '@/data/games';
import { useKickLive } from '@/services/kick';
import { useAuth } from '@/store/auth';
import { useCart } from '@/store/cart';
import { openLink } from '@/utils/open-link';

type Tab = 'watch' | 'about';

export default function GameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const game = getGame(id);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, toggleWishlist } = useAuth();
  const [tab, setTab] = useState<Tab>('watch');

  if (!game) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.body}>Game not found.</Text>
      </View>
    );
  }

  const contentWidth = Math.min(width, MaxContentWidth);
  const wished = !!user?.wishlist.includes(game.id);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 130 + insets.bottom }} showsVerticalScrollIndicator={false}>
        <View style={{ width: contentWidth }}>
          <GameCover game={game} variant="hero" style={styles.hero}>
            <LinearGradient colors={['rgba(7,7,12,0.55)', 'rgba(7,7,12,0)', Colors.background]} locations={[0, 0.35, 1]} style={StyleSheet.absoluteFill} />
          </GameCover>

          <View style={styles.header}>
            <GameCover game={game} style={styles.boxArt} />
            <View style={{ flex: 1, gap: 4, paddingTop: 70 }}>
              <Text style={[styles.studio, { color: game.accent }]} numberOfLines={1}>
                {game.developers[0]?.toUpperCase()}
              </Text>
              <Text style={styles.title}>{game.title}</Text>
            </View>
          </View>

          <View style={styles.intro}>
            <Text style={styles.tagline}>{game.tagline}</Text>
            <View style={styles.metaRow}>
              {game.metacritic && <MetacriticBadge score={game.metacritic} />}
              <Text style={styles.metaText}>{game.releaseDate}</Text>
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

      <View style={[styles.topButtons, { top: insets.top + Spacing.two, width: contentWidth }]} pointerEvents="box-none">
        <IconButton icon="arrow-left" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton
            icon={wished ? 'heart' : 'heart-outline'}
            onPress={() => (user ? toggleWishlist(game.id) : router.push({ pathname: '/auth', params: { reason: 'wishlist' } }))}
          />
          <IconButton icon="steam" onPress={() => openLink(links.steam(game))} />
        </View>
      </View>

      <BuyBar game={game} />
    </View>
  );
}

function Segmented({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const items = [
    { key: 'watch' as const, label: 'Watch', icon: 'play-circle-outline' as const },
    { key: 'about' as const, label: 'About this game', icon: 'book-open-page-variant-outline' as const },
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
  const live = useKickLive([game.id], 8);

  return (
    <View>
      <SectionHeader title="Watch live" subtitle="The best players streaming right now" />
      <View style={styles.stack}>
        <PlatformLiveButton platform="twitch" game={game} />
        <PlatformLiveButton platform="youtube" game={game} />
        <PlatformLiveButton platform="kick" game={game} />
      </View>

      <View style={styles.gap} />
      <SectionHeader
        title="Live on Kick"
        subtitle="Plays right here in the app"
        action={
          <Pressable onPress={live.refresh} hitSlop={8}>
            <MaterialCommunityIcons name="refresh" size={22} color={Colors.textSecondary} />
          </Pressable>
        }
      />
      {live.streams.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
          {live.streams.map((s) => (
            <KickStreamCard key={s.id} stream={s} width={280} />
          ))}
        </ScrollView>
      )}
      <View style={styles.stack}>
        {live.loading && live.streams.length === 0 && <ActivityIndicator color={Colors.accent} style={{ paddingVertical: Spacing.four }} />}
        {!live.loading && live.streams.length === 0 && (
          <Note
            icon={Platforms.kick.icon}
            text={live.error ? 'Kick live streams could not be loaded here. Open Kick to watch.' : `Nobody is live on Kick with ${game.title} right now.`}
            action="Open Kick"
            onPress={() => openLink(links.kick(game))}
          />
        )}
      </View>

      {game.trailers.length > 0 && (
        <>
          <View style={styles.gap} />
          <SectionHeader title="Official trailers" subtitle={`${game.trailers.length} videos from Steam`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {game.trailers.map((t, i) => (
              <TrailerCard key={t.id} game={game} trailer={t} index={i} width={260} />
            ))}
          </ScrollView>
        </>
      )}

      <View style={styles.gap} />
      <SectionHeader title="Best players on YouTube" subtitle="Pro gameplay, guides and records" />
      <View style={[styles.stack, { gap: Spacing.two }]}>
        {youtubeTopics(game).map((t) => (
          <LinkRow key={t.title} icon={t.icon} title={t.title} subtitle={t.subtitle} url={t.url} color={Platforms.youtube.color} />
        ))}
      </View>

      {game.screenshots.length > 0 && (
        <>
          <View style={styles.gap} />
          <SectionHeader title="Screenshots" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {game.screenshots.map((uri) => (
              <Image key={uri} source={{ uri }} style={styles.screenshot} contentFit="cover" transition={200} />
            ))}
          </ScrollView>
        </>
      )}
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
          <View key={step.title} style={styles.card}>
            <View style={[styles.stepNumber, { backgroundColor: game.accent }]}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{step.title}</Text>
              <Text style={styles.cardText}>{step.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.h2}>Who is it for?</Text>
      <View style={{ gap: Spacing.two }}>
        {about.whoFor.map((w) => (
          <View key={w.title} style={[styles.card, { alignItems: 'center' }]}>
            <View style={[styles.whoIcon, { backgroundColor: game.accent + '26' }]}>
              <MaterialCommunityIcons name={w.icon} size={22} color={game.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{w.title}</Text>
              <Text style={styles.cardText}>{w.text}</Text>
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
        <Detail label="Developer" value={game.developers.join(', ')} />
        <Detail label="Publisher" value={game.publishers.join(', ')} />
        <Detail label="Release date" value={game.releaseDate} />
        {game.metacritic && <Detail label="Metacritic" value={`${game.metacritic} / 100`} />}
        <Detail label="Runs on" value={game.systems.map((s) => (s === 'windows' ? 'Windows' : s === 'mac' ? 'macOS' : 'Linux / Steam Deck')).join(', ')} />
        {game.steamFeatures.length > 0 && <Detail label="Features" value={game.steamFeatures.join(', ')} />}
        <Detail label="Store" value="Steam" last />
      </View>
      <Pressable onPress={() => openLink(links.steam(game))} style={styles.steamLink}>
        <MaterialCommunityIcons name="steam" size={18} color={Colors.accent2} />
        <Text style={styles.steamLinkText}>See system requirements on Steam</Text>
      </Pressable>
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

function Note({ icon, text, action, onPress }: { icon: 'lightning-bolt'; text: string; action: string; onPress: () => void }) {
  return (
    <View style={styles.note}>
      <MaterialCommunityIcons name={icon} size={20} color={Platforms.kick.color} />
      <Text style={[styles.cardText, { flex: 1 }]}>{text}</Text>
      <Pressable onPress={onPress} hitSlop={8}>
        <Text style={styles.noteAction}>{action}</Text>
      </Pressable>
    </View>
  );
}

function BuyBar({ game }: { game: Game }) {
  const insets = useSafeAreaInsets();
  const { cart, add } = useCart();
  const { owns } = useAuth();
  const inCart = cart.includes(game.id);
  const isOwned = owns(game.id);

  let label = game.isFree ? 'Get for free' : 'Buy now';
  if (inCart) label = 'Go to cart';
  if (isOwned) label = 'In your library';

  return (
    <View style={[styles.buyBar, { paddingBottom: insets.bottom + Spacing.three }]}>
      <View style={styles.buyInner}>
        <View>
          <Text style={styles.buyLabel}>{game.isFree ? 'Free to play' : 'Price'}</Text>
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
  hero: { height: 300 },
  topButtons: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  header: { flexDirection: 'row', gap: Spacing.three, paddingHorizontal: Spacing.three, marginTop: -110 },
  boxArt: { width: 110, aspectRatio: 2 / 3, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  studio: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.8, lineHeight: 32 },
  intro: { paddingHorizontal: Spacing.three, marginTop: Spacing.three, gap: 8 },
  tagline: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  metaText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  genre: { backgroundColor: Colors.accentSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
  genreText: { color: '#C4B5FD', fontSize: 12, fontWeight: '700' },
  segmented: {
    flexDirection: 'row',
    margin: Spacing.three,
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
    padding: 4,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 42, borderRadius: 12 },
  segmentActive: { backgroundColor: Colors.surfaceRaised },
  segmentText: { color: Colors.textMuted, fontSize: 14, fontWeight: '800' },
  stack: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  hRow: { paddingHorizontal: Spacing.three, gap: Spacing.three },
  gap: { height: Spacing.five },
  screenshot: { width: 280, aspectRatio: 16 / 9, borderRadius: Radius.md, backgroundColor: Colors.surface },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noteAction: { color: Platforms.kick.color, fontWeight: '800', fontSize: 14 },
  about: { paddingHorizontal: Spacing.three, gap: 12 },
  h2: { color: Colors.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.4, marginTop: Spacing.three },
  body: { color: Colors.textSecondary, fontSize: 15, lineHeight: 24 },
  card: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepNumber: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#000', fontSize: 16, fontWeight: '900' },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '800', marginBottom: 3 },
  cardText: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  whoIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  mode: { borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.pill },
  modeText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  details: { borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 13 },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel: { color: Colors.textMuted, fontSize: 14 },
  detailValue: { color: Colors.text, fontSize: 14, fontWeight: '700', flexShrink: 1, textAlign: 'right' },
  steamLink: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  steamLinkText: { color: Colors.accent2, fontSize: 14, fontWeight: '700' },
  buyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    backgroundColor: 'rgba(7,7,12,0.95)',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  buyInner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, width: '100%', maxWidth: MaxContentWidth - Spacing.three * 2 },
  buyLabel: { color: Colors.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 2 },
});
