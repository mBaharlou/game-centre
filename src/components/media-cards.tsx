import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LiveBadge, PlatformBadge, RankBadge } from '@/components/badges';
import { GameCover } from '@/components/game-cover';
import { Avatar } from '@/components/ui';
import { Colors, Radius } from '@/constants/theme';
import { formatCount, getGame, type Stream, type Video } from '@/data/games';

type StreamCardProps = {
  stream: Stream;
  width?: number;
  /** Show the game's name under the title (useful outside the game page). */
  showGame?: boolean;
};

export function StreamCard({ stream, width, showGame }: StreamCardProps) {
  const game = getGame(stream.gameId)!;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/watch/[id]', params: { id: stream.id } })}
      style={({ pressed }) => [{ width }, pressed && styles.pressed]}>
      <GameCover game={game} iconSize={44} style={styles.thumb}>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.65)']} style={StyleSheet.absoluteFill} />
        <View style={styles.thumbTopLeft}>
          <LiveBadge viewers={stream.viewers} />
        </View>
        <View style={styles.thumbTopRight}>{stream.rank && <RankBadge rank={stream.rank} />}</View>
        <View style={styles.thumbBottomLeft}>
          <PlatformBadge platform={stream.platform} />
        </View>
      </GameCover>
      <View style={styles.meta}>
        <Avatar name={stream.streamer} size={34} />
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {stream.title}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {stream.streamer}
            {showGame ? ` · ${game.title}` : ''}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function VideoCard({ video }: { video: Video }) {
  const game = getGame(video.gameId)!;
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/watch/[id]', params: { id: video.id } })}
      style={({ pressed }) => [styles.videoRow, pressed && styles.pressed]}>
      <GameCover game={game} iconSize={30} hideIcon style={styles.videoThumb}>
        <View style={styles.play}>
          <MaterialCommunityIcons name="play" size={18} color="#fff" />
        </View>
        <View style={styles.duration}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
      </GameCover>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.title} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.sub}>{video.creator}</Text>
        <View style={styles.videoMeta}>
          <PlatformBadge platform={video.platform} label={false} />
          <Text style={styles.sub}>
            {formatCount(video.views)} views · {video.posted}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  thumb: { aspectRatio: 16 / 9, borderRadius: Radius.md },
  thumbTopLeft: { position: 'absolute', top: 10, left: 10 },
  thumbTopRight: { position: 'absolute', top: 10, right: 10 },
  thumbBottomLeft: { position: 'absolute', bottom: 10, left: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  title: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  sub: { color: Colors.textSecondary, fontSize: 12 },
  videoRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  videoThumb: { width: 140, aspectRatio: 16 / 9, borderRadius: Radius.sm },
  play: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  duration: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  durationText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
