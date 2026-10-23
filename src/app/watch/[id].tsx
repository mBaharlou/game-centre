import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LiveBadge, PlatformBadge, RankBadge } from '@/components/badges';
import { GameCover } from '@/components/game-cover';
import { StreamCard } from '@/components/media-cards';
import { Avatar, GradientButton, IconButton, PriceTag, Rating, SectionHeader } from '@/components/ui';
import { Colors, MaxContentWidth, Platforms, Radius, Spacing } from '@/constants/theme';
import { formatCount, getGame, streams, streamsFor, videos } from '@/data/games';
import { useCart } from '@/store/cart';

/** Player screen for both live streams and recorded videos, with a buy card for the game. */
export default function WatchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cart, owned, add } = useCart();

  const stream = streams.find((s) => s.id === id);
  const video = videos.find((v) => v.id === id);
  const item = stream ?? video;
  const game = item && getGame(item.gameId);

  if (!item || !game) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.sub}>This stream has ended.</Text>
      </View>
    );
  }

  const contentWidth = Math.min(width, MaxContentWidth);
  const author = stream ? stream.streamer : video!.creator;
  const more = streamsFor(game.id).filter((s) => s.id !== id);
  const inCart = cart.includes(game.id);
  const isOwned = owned.includes(game.id);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: insets.bottom + Spacing.five }}>
        <View style={{ width: contentWidth, paddingTop: insets.top }}>
          {/* Player */}
          <GameCover game={game} iconSize={70} hideIcon style={styles.player}>
            <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} />
            <View style={styles.playButton}>
              <MaterialCommunityIcons name="play" size={34} color="#fff" />
            </View>
            <View style={styles.playerTop}>
              {stream ? <LiveBadge viewers={stream.viewers} /> : <PlatformBadge platform={item.platform} />}
              <IconButton icon="close" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
            </View>
            <View style={styles.playerBottom}>
              <Text style={styles.playerHint}>Preview · in-app playback is coming next</Text>
              {video && <Text style={styles.playerHint}>{video.duration}</Text>}
            </View>
          </GameCover>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.authorRow}>
              <Avatar name={author} size={44} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.author}>{author}</Text>
                  {stream?.rank && <RankBadge rank={stream.rank} />}
                </View>
                <Text style={styles.sub}>
                  {stream
                    ? `Streaming ${game.title} on ${Platforms[stream.platform].name}`
                    : `${formatCount(video!.views)} views · ${video!.posted} · ${Platforms[video!.platform].name}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Buy card */}
          <Pressable onPress={() => router.push({ pathname: '/game/[id]', params: { id: game.id } })}>
            <LinearGradient
              colors={[game.colors[0] + '40', game.colors[1] + '20', Colors.surface]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buyCard}>
              <View style={styles.buyTop}>
                <GameCover game={game} iconSize={28} style={styles.buyCover} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.buyEyebrow}>LIKE WHAT YOU SEE?</Text>
                  <Text style={styles.buyTitle}>{game.title}</Text>
                  <Rating value={game.rating} count={`${formatCount(game.ratingCount)}`} />
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.textSecondary} />
              </View>
              <View style={styles.buyBottom}>
                <PriceTag game={game} size="lg" />
                <GradientButton
                  label={isOwned ? 'Owned' : inCart ? 'In cart' : game.price === 0 ? 'Get' : 'Buy now'}
                  icon={isOwned || inCart ? 'check' : 'cart-plus'}
                  disabled={isOwned}
                  onPress={() => {
                    add(game.id);
                    router.navigate('/cart');
                  }}
                />
              </View>
            </LinearGradient>
          </Pressable>

          {more.length > 0 && (
            <View style={{ marginTop: Spacing.five }}>
              <SectionHeader title={`More live ${game.title}`} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}>
                {more.map((s) => (
                  <StreamCard key={s.id} stream={s} width={260} />
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  player: { aspectRatio: 16 / 9 },
  playButton: {
    position: 'absolute',
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerTop: { position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerBottom: { position: 'absolute', bottom: 10, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between' },
  playerHint: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  info: { padding: Spacing.three, gap: Spacing.three },
  title: { color: Colors.text, fontSize: 20, fontWeight: '800', lineHeight: 26 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  author: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  sub: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  buyCard: {
    marginHorizontal: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.three,
  },
  buyTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  buyCover: { width: 64, height: 80, borderRadius: 12 },
  buyEyebrow: { color: Colors.accent2, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  buyTitle: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  buyBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
