import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LiveBadge, PlatformBadge } from '@/components/badges';
import { GameCover } from '@/components/game-cover';
import { Avatar } from '@/components/ui';
import { Colors, Platforms, Radius, type PlatformId } from '@/constants/theme';
import { getGame, links, type Game, type IconName, type Trailer } from '@/data/games';
import type { KickStream } from '@/services/kick';
import { openLink } from '@/utils/open-link';

export function openKickStream(stream: KickStream) {
  router.push({
    pathname: '/watch',
    params: {
      kind: 'kick',
      gameId: stream.gameId,
      channel: stream.channel,
      title: stream.title,
      username: stream.username,
      viewers: String(stream.viewers),
      avatar: stream.avatar ?? '',
    },
  });
}

/** A real live stream from Kick. Opens in the in-app player. */
export function KickStreamCard({ stream, width, showGame }: { stream: KickStream; width?: number; showGame?: boolean }) {
  const game = getGame(stream.gameId)!;
  return (
    <Pressable onPress={() => openKickStream(stream)} style={({ pressed }) => [{ width }, pressed && styles.pressed]}>
      <GameCover game={game} variant="header" style={styles.thumb}>
        {stream.thumbnail && <Image source={{ uri: stream.thumbnail }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />}
        <LinearGradient colors={['rgba(0,0,0,0.35)', 'transparent', 'rgba(0,0,0,0.55)']} style={StyleSheet.absoluteFill} />
        <View style={styles.topLeft}>
          <LiveBadge viewers={stream.viewers} />
        </View>
        <View style={styles.bottomLeft}>
          <PlatformBadge platform="kick" />
          {!!stream.language && (
            <View style={styles.lang}>
              <Text style={styles.langText}>{stream.language}</Text>
            </View>
          )}
        </View>
      </GameCover>
      <View style={styles.meta}>
        <Avatar name={stream.username} uri={stream.avatar} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {stream.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {stream.username}
            {showGame ? ` · ${game.title}` : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/** An official Steam trailer. Opens in the in-app player. */
export function TrailerCard({ game, trailer, index, width }: { game: Game; trailer: Trailer; index: number; width?: number }) {
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/watch', params: { kind: 'trailer', gameId: game.id, index: String(index) } })}
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}>
      <GameCover game={game} variant="header" style={styles.thumb}>
        <Image source={{ uri: trailer.thumbnail }} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <View style={styles.playWrap}>
          <View style={styles.play}>
            <MaterialCommunityIcons name="play" size={26} color="#fff" />
          </View>
        </View>
      </GameCover>
      <Text style={[styles.title, { marginTop: 8 }]} numberOfLines={1}>
        {trailer.name}
      </Text>
      <Text style={styles.sub}>Official trailer · Steam</Text>
    </Pressable>
  );
}

/** Big button that opens a game's live directory on Twitch, YouTube or Kick. */
export function PlatformLiveButton({ platform, game }: { platform: PlatformId; game: Game }) {
  const p = Platforms[platform];
  const url = platform === 'twitch' ? links.twitch(game) : platform === 'youtube' ? links.youtubeLive(game) : links.kick(game);
  const dark = platform === 'kick';
  return (
    <Pressable onPress={() => openLink(url)} style={({ pressed }) => [styles.platformButton, { backgroundColor: p.color }, pressed && styles.pressed]}>
      <MaterialCommunityIcons name={p.icon} size={22} color={dark ? '#000' : '#fff'} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.platformTitle, dark && { color: '#000' }]}>Live on {p.name}</Text>
        <Text style={[styles.platformSub, dark && { color: 'rgba(0,0,0,0.7)' }]}>Top streams, most viewers first</Text>
      </View>
      <MaterialCommunityIcons name="open-in-new" size={18} color={dark ? '#000' : '#fff'} />
    </Pressable>
  );
}

/** A row that opens an outside page, e.g. a YouTube search. */
export function LinkRow({ icon, title, subtitle, url, color = Colors.text }: { icon: IconName; title: string; subtitle?: string; url: string; color?: string }) {
  return (
    <Pressable onPress={() => openLink(url)} style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.75 }]}>
      <View style={[styles.linkIcon, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.sub}>{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="open-in-new" size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  thumb: { aspectRatio: 16 / 9, borderRadius: Radius.md },
  topLeft: { position: 'absolute', top: 10, left: 10 },
  bottomLeft: { position: 'absolute', bottom: 10, left: 10, flexDirection: 'row', gap: 6, alignItems: 'center' },
  lang: { backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  langText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  title: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  sub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  playWrap: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  play: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  platformButton: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: Radius.md },
  platformTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  platformSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  linkIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
