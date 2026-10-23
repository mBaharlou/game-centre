import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { AccentGradient, Colors, Radius, Spacing } from '@/constants/theme';
import { finalPrice, formatPrice, type Game, type IconName } from '@/data/games';

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
  color,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: IconName;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: color ?? Colors.accent, borderColor: color ?? Colors.accent },
        pressed && { opacity: 0.75 },
      ]}>
      {icon && <MaterialCommunityIcons name={icon} size={14} color={active ? '#fff' : Colors.textSecondary} />}
      <Text style={[styles.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function PriceTag({ game, size = 'md' }: { game: Game; size?: 'md' | 'lg' }) {
  const big = size === 'lg';
  return (
    <View style={styles.priceRow}>
      {!!game.discount && (
        <View style={styles.discount}>
          <Text style={styles.discountText}>-{game.discount}%</Text>
        </View>
      )}
      {!!game.discount && <Text style={styles.oldPrice}>{formatPrice(game.price)}</Text>}
      <Text style={[styles.price, big && { fontSize: 22 }]}>{formatPrice(finalPrice(game))}</Text>
    </View>
  );
}

export function GradientButton({
  label,
  icon,
  onPress,
  style,
  disabled,
}: {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [style, pressed && { transform: [{ scale: 0.97 }] }]}>
      <LinearGradient
        colors={disabled ? ['#2A2A38', '#2A2A38'] : AccentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradientButton}>
        {icon && <MaterialCommunityIcons name={icon} size={18} color="#fff" />}
        <Text style={styles.gradientButtonText}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

export function IconButton({ icon, onPress, badge }: { icon: IconName; onPress?: () => void; badge?: number }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}>
      <MaterialCommunityIcons name={icon} size={22} color={Colors.text} />
      {!!badge && (
        <View style={styles.iconBadge}>
          <Text style={styles.iconBadgeText}>{badge}</Text>
        </View>
      )}
    </Pressable>
  );
}

/** Round avatar showing the first letter of a name on a colour picked from the name. */
export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const hues = ['#8B5CF6', '#22D3EE', '#F43F5E', '#F97316', '#34D399', '#FBBF24', '#6366F1'];
  const color = hues[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % hues.length];
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.42 }]}>{name[0].toUpperCase()}</Text>
    </View>
  );
}

export function Rating({ value, count }: { value: number; count?: string }) {
  return (
    <View style={styles.ratingRow}>
      <MaterialCommunityIcons name="star" size={14} color={Colors.gold} />
      <Text style={styles.ratingText}>{value.toFixed(1)}</Text>
      {count && <Text style={styles.ratingCount}>({count})</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.three,
    marginBottom: Spacing.three,
  },
  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  sectionSubtitle: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  discount: { backgroundColor: Colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  discountText: { color: '#03140D', fontSize: 12, fontWeight: '900' },
  oldPrice: { color: Colors.textMuted, fontSize: 13, textDecorationLine: 'line-through' },
  price: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.md,
  },
  gradientButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: Colors.live,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  avatar: { alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.background },
  avatarText: { color: '#fff', fontWeight: '900' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { color: Colors.text, fontSize: 13, fontWeight: '800' },
  ratingCount: { color: Colors.textMuted, fontSize: 12 },
});
