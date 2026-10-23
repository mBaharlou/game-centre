import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { Colors, Platforms, Radius, type PlatformId } from '@/constants/theme';
import { formatCount } from '@/data/games';

/** Red "LIVE" pill with a softly pulsing dot. */
export function LiveBadge({ viewers }: { viewers?: number }) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!reduceMotion) pulse.value = withRepeat(withTiming(0.25, { duration: 800 }), -1, true);
  }, [pulse, reduceMotion]);

  const dotStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <View style={styles.row}>
      <View style={styles.live}>
        <Animated.View style={[styles.dot, dotStyle]} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
      {viewers !== undefined && (
        <View style={styles.viewers}>
          <MaterialCommunityIcons name="eye" size={11} color="#fff" />
          <Text style={styles.viewersText}>{formatCount(viewers)}</Text>
        </View>
      )}
    </View>
  );
}

export function PlatformBadge({ platform, label = true }: { platform: PlatformId; label?: boolean }) {
  const p = Platforms[platform];
  return (
    <View style={[styles.platform, { backgroundColor: p.color }]}>
      <MaterialCommunityIcons name={p.icon} size={12} color={platform === 'kick' ? '#000' : '#fff'} />
      {label && <Text style={[styles.platformText, platform === 'kick' && { color: '#000' }]}>{p.name}</Text>}
    </View>
  );
}

export function RankBadge({ rank }: { rank: number }) {
  const top = rank <= 3;
  return (
    <View style={[styles.rank, top && { backgroundColor: Colors.gold }]}>
      <MaterialCommunityIcons name="crown" size={11} color={top ? '#000' : Colors.gold} />
      <Text style={[styles.rankText, top && { color: '#000' }]}>#{rank}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  live: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.live,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  viewers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  viewersText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  platform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  platformText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  rank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rankText: { color: Colors.gold, fontSize: 11, fontWeight: '900' },
});
