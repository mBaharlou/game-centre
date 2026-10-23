import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameCover } from '@/components/game-cover';
import { GradientButton, PriceTag } from '@/components/ui';
import { Colors, MaxContentWidth, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { finalPrice, formatPrice, getGame, type Game } from '@/data/games';
import { useCart } from '@/store/cart';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cart, owned, remove, checkout } = useCart();
  const [justBought, setJustBought] = useState(false);

  const items = cart.map(getGame).filter((g): g is Game => !!g);
  const library = owned.map(getGame).filter((g): g is Game => !!g);
  const subtotal = items.reduce((sum, g) => sum + g.price, 0);
  const total = items.reduce((sum, g) => sum + finalPrice(g), 0);
  const contentWidth = Math.min(width, MaxContentWidth);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ alignItems: 'center', paddingTop: insets.top + Spacing.three, paddingBottom: TabBarHeight + insets.bottom + Spacing.five }}
      showsVerticalScrollIndicator={false}>
      <View style={{ width: contentWidth, paddingHorizontal: Spacing.three }}>
        <Text style={styles.title}>Cart</Text>

        {justBought && items.length === 0 && (
          <View style={styles.success}>
            <MaterialCommunityIcons name="check-decagram" size={26} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.successTitle}>Purchase complete</Text>
              <Text style={styles.muted}>Your games are in your library below.</Text>
            </View>
          </View>
        )}

        {items.length === 0 && !justBought && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cart-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.muted}>Watch the best players, then pick your next game.</Text>
            <GradientButton label="Browse the store" icon="storefront-outline" onPress={() => router.navigate('/')} style={{ marginTop: Spacing.three }} />
          </View>
        )}

        {items.length > 0 && (
          <>
            <View style={{ gap: Spacing.two, marginTop: Spacing.three }}>
              {items.map((g) => (
                <View key={g.id} style={styles.item}>
                  <GameCover game={g} iconSize={26} style={styles.cover} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.itemTitle}>{g.title}</Text>
                    <PriceTag game={g} />
                  </View>
                  <Pressable onPress={() => remove(g.id)} hitSlop={10} style={styles.remove}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.summary}>
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              {subtotal !== total && <Row label="Discounts" value={`-${formatPrice(subtotal - total)}`} accent />}
              <View style={styles.divider} />
              <Row label="Total" value={formatPrice(total)} big />
              <GradientButton
                label={total === 0 ? 'Add to library' : `Pay ${formatPrice(total)}`}
                icon="lock-outline"
                style={{ marginTop: Spacing.three }}
                onPress={() => {
                  checkout();
                  setJustBought(true);
                }}
              />
              <Text style={[styles.muted, { textAlign: 'center', marginTop: Spacing.two, fontSize: 12 }]}>
                Demo checkout: no real payment is taken yet.
              </Text>
            </View>
          </>
        )}

        {library.length > 0 && (
          <>
            <Text style={[styles.title, { fontSize: 24, marginTop: Spacing.five }]}>Your library</Text>
            <View style={styles.libraryGrid}>
              {library.map((g) => (
                <Pressable key={g.id} style={styles.libraryItem} onPress={() => router.push({ pathname: '/game/[id]', params: { id: g.id } })}>
                  <GameCover game={g} iconSize={40} style={styles.libraryCover} />
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {g.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value, big, accent }: { label: string; value: string; big?: boolean; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.muted, big && styles.bigText]}>{label}</Text>
      <Text style={[styles.rowValue, big && styles.bigText, accent && { color: Colors.success }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  title: { color: Colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  muted: { color: Colors.textSecondary, fontSize: 14 },
  empty: { alignItems: 'center', gap: 8, paddingVertical: Spacing.six },
  emptyTitle: { color: Colors.text, fontSize: 18, fontWeight: '800', marginTop: Spacing.two },
  success: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  successTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cover: { width: 56, height: 70, borderRadius: 10 },
  itemTitle: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  remove: { padding: 6 },
  summary: {
    marginTop: Spacing.four,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowValue: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  bigText: { color: Colors.text, fontSize: 20, fontWeight: '900' },
  divider: { height: 1, backgroundColor: Colors.border },
  libraryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.three },
  libraryItem: { width: '30%', gap: 6 },
  libraryCover: { aspectRatio: 3 / 4, borderRadius: Radius.md },
});
