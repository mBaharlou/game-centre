import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEvent } from 'expo';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiveBadge, PlatformBadge } from '@/components/badges';
import { GameCover } from '@/components/game-cover';
import { KickStreamCard } from '@/components/media-cards';
import { Avatar, GradientButton, IconButton, SectionHeader } from '@/components/ui';
import { Colors, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { formatCount, formatPrice, links } from '@/data/games';
import { accentFor, useGameDetails, type Art, type GameDetails } from '@/services/game-details';
import { useKickLive, useKickPlayback } from '@/services/kick';
import { useAuth } from '@/store/auth';
import { openLink } from '@/utils/open-link';

// Trailers and live streams are HLS. Phones play it natively; most desktop browsers
// (Chrome, Firefox) can't, so there the player offers a link instead.
const CAN_PLAY_HLS =
  Platform.OS !== 'web' || (typeof document !== 'undefined' && document.createElement('video').canPlayType('application/vnd.apple.mpegurl') !== '');

type Params = {
  kind: 'trailer' | 'kick';
  gameId: string;
  gameTitle?: string;
  kick?: string;
  index?: string;
  channel?: string;
  title?: string;
  username?: string;
  viewers?: string;
  avatar?: string;
};

/** In-app player for official Steam trailers and live Kick streams, with a buy card under it. */
export default function WatchScreen() {
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { details: game } = useGameDetails(params.gameId, { kickSlug: params.kick });
  const [trailerIndex, setTrailerIndex] = useState(Number(params.index ?? 0));
  const isKick = params.kind === 'kick';
  const kick = useKickPlayback(isKick ? params.channel : undefined);

  const gameTitle = game?.title ?? params.gameTitle ?? '';
  const art: Art = game ?? { title: gameTitle, accent: accentFor(gameTitle), images: {} };
  const trailer = game?.trailers[trailerIndex];
  const source = isKick ? kick.url : trailer?.hls ?? null;
  const fallbackUrl =
    isKick && params.channel ? links.kickChannel(params.channel) : game?.steamAppId ? links.steam(game.steamAppId) : links.youtube(`${gameTitle} trailer`);
  const contentWidth = Math.min(width, MaxContentWidth);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: insets.bottom + Spacing.five }}>
        <View style={{ width: contentWidth, paddingTop: insets.top }}>
          <View style={styles.playerBar}>
            {isKick ? <LiveBadge viewers={Number(params.viewers ?? 0)} /> : <Text style={styles.playerBarText}>Official trailer</Text>}
            <IconButton icon="close" onPress={close} />
          </View>

          {isKick && kick.loading ? (
            <View style={[styles.player, styles.playerOverlay, { position: 'relative' }]}>
              <ActivityIndicator color="#fff" size="large" />
            </View>
          ) : (
            <Player key={source ?? 'none'} game={art} source={source} fallbackUrl={fallbackUrl} fallbackLabel={isKick ? 'Watch on Kick' : 'Watch on Steam'} poster={isKick ? null : trailer?.thumbnail} />
          )}

          <View style={styles.info}>
            <Text style={styles.title}>{isKick ? params.title : trailer?.name}</Text>
            {isKick ? (
              <Pressable style={styles.authorRow} onPress={() => openLink(fallbackUrl)}>
                <Avatar name={params.username ?? '?'} uri={params.avatar || null} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.author}>{params.username}</Text>
                  <Text style={styles.sub}>Streaming {gameTitle}</Text>
                </View>
                <PlatformBadge platform="kick" />
              </Pressable>
            ) : (
              <Text style={styles.sub}>
                {gameTitle}
                {game?.developers[0] ? ` · ${game.developers[0]}` : ''}
              </Text>
            )}
          </View>

          {!isKick && game && game.trailers.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
              {game.trailers.map((t, i) => (
                <Pressable key={t.id} onPress={() => setTrailerIndex(i)} style={[styles.thumb, i === trailerIndex && styles.thumbActive]}>
                  <Image source={{ uri: t.thumbnail }} style={StyleSheet.absoluteFill} contentFit="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={StyleSheet.absoluteFill} />
                  <Text style={styles.thumbText} numberOfLines={2}>
                    {t.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {game && <BuyCard game={game} />}

          {isKick && game?.kickSlug && <MoreLive game={game} currentChannel={params.channel} />}
        </View>
      </ScrollView>
    </View>
  );
}

function Player({ game, source, fallbackUrl, fallbackLabel, poster }: { game: Art; source: string | null; fallbackUrl: string; fallbackLabel: string; poster?: string | null }) {
  const player = useVideoPlayer(source, (p) => {
    p.play();
  });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  return (
    <View style={styles.player}>
      {source && status !== 'error' && CAN_PLAY_HLS ? (
        <>
          <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" nativeControls fullscreenOptions={{ enable: true }} allowsPictureInPicture />
          {status === 'loading' && (
            <View style={styles.playerOverlay} pointerEvents="none">
              {poster && <Image source={{ uri: poster }} style={StyleSheet.absoluteFill} contentFit="cover" />}
              <ActivityIndicator color="#fff" size="large" />
            </View>
          )}
        </>
      ) : (
        <GameCover game={game} variant="hero" style={StyleSheet.absoluteFill}>
          <View style={[styles.playerOverlay, { backgroundColor: 'rgba(0,0,0,0.6)', gap: 12 }]}>
            <Text style={styles.fallbackText}>{CAN_PLAY_HLS ? 'This video can’t play right now.' : 'This video can’t play in this browser.'}</Text>
            <Pressable onPress={() => openLink(fallbackUrl)} style={styles.fallbackButton}>
              <MaterialCommunityIcons name="open-in-new" size={16} color="#000" />
              <Text style={styles.fallbackButtonText}>{fallbackLabel}</Text>
            </Pressable>
          </View>
        </GameCover>
      )}
    </View>
  );
}

function BuyCard({ game }: { game: GameDetails }) {
  const { owns } = useAuth();
  const isOwned = owns(game.id);
  const price = game.isFree ? 'Free to play' : game.price ? formatPrice(game.price.final) : null;
  const openBuy = () => router.push({ pathname: '/game/[id]', params: { id: game.id, tab: 'buy' } });
  return (
    <Pressable onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })}>
      <LinearGradient colors={[game.accent + '44', Colors.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.buyCard}>
        <View style={styles.buyTop}>
          <GameCover game={game} style={styles.buyCover} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.buyEyebrow}>{isOwned ? 'IN YOUR LIBRARY' : 'LIKE WHAT YOU SEE?'}</Text>
            <Text style={styles.buyTitle}>{game.title}</Text>
            <Text style={styles.sub} numberOfLines={2}>
              {game.tagline}
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textSecondary} />
        </View>
        <View style={styles.buyBottom}>
          <Text style={styles.buyPrice}>{price ?? 'Compare stores'}</Text>
          <GradientButton label={isOwned ? 'Owned' : 'Where to buy'} icon={isOwned ? 'check' : 'tag-search-outline'} onPress={openBuy} />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function MoreLive({ game, currentChannel }: { game: GameDetails; currentChannel?: string }) {
  const live = useKickLive([{ gameId: game.id, title: game.title, slug: game.kickSlug! }], 8);
  const others = live.streams.filter((s) => s.channel !== currentChannel);
  if (others.length === 0) return null;
  return (
    <View style={{ marginTop: Spacing.five }}>
      <SectionHeader title={`More live ${game.title}`} subtitle={`${formatCount(others.reduce((n, s) => n + s.viewers, 0))} watching on Kick`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
        {others.map((s) => (
          <KickStreamCard key={s.id} stream={s} width={260} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  playerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  playerBarText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  player: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000' },
  playerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  fallbackText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  fallbackButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.pill },
  fallbackButtonText: { color: '#000', fontWeight: '800' },
  info: { padding: Spacing.three, gap: Spacing.three },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800', lineHeight: 26 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  author: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  hRow: { paddingHorizontal: Spacing.three, gap: Spacing.two, marginBottom: Spacing.three },
  thumb: { width: 150, aspectRatio: 16 / 9, borderRadius: Radius.sm, overflow: 'hidden', justifyContent: 'flex-end', borderWidth: 2, borderColor: 'transparent' },
  thumbActive: { borderColor: Colors.accent },
  thumbText: { color: '#fff', fontSize: 11, fontWeight: '700', padding: 6 },
  buyCard: { marginHorizontal: Spacing.three, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.three },
  buyTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  buyCover: { width: 64, aspectRatio: 2 / 3, borderRadius: 10 },
  buyEyebrow: { color: Colors.accent2, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  buyTitle: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  buyPrice: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  buyBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
