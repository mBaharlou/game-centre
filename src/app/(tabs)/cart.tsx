import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GameCover } from '@/components/game-cover';
import { GradientButton, PriceTag } from '@/components/ui';
import { Colors, MaxContentWidth, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import { formatPrice, getGame, type Game } from '@/data/games';
import { useAuth, type Order } from '@/store/auth';
import { useCart } from '@/store/cart';

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { cart, remove, clear } = useCart();
  const { user, owns, purchase } = useAuth();
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [paying, setPaying] = useState(false);

  const items = cart.map(getGame).filter((g): g is Game => !!g);
  const toBuy = items.filter((g) => !owns(g.id));
  const subtotal = toBuy.reduce((sum, g) => sum + g.price, 0);
  const total = toBuy.reduce((sum, g) => sum + g.finalPrice, 0);
  const contentWidth = Math.min(width, MaxContentWidth);

  const checkout = async () => {
    if (!user) {
      router.push({ pathname: '/auth', params: { reason: 'checkout' } });
      return;
    }
    setPaying(true);
    const order = await purchase(toBuy.map((g) => ({ gameId: g.id, price: g.finalPrice })));
    setPaying(false);
    if (order) {
      clear();
      setLastOrder(order);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ alignItems: 'center', paddingTop: insets.top + Spacing.three, paddingBottom: TabBarHeight + insets.bottom + Spacing.five }}
      showsVerticalScrollIndicator={false}>
      <View style={{ width: contentWidth, paddingHorizontal: Spacing.three }}>
        <Text style={styles.title}>Cart</Text>

        {lastOrder && items.length === 0 && (
          <View style={styles.success}>
            <MaterialCommunityIcons name="check-decagram" size={28} color={Colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={styles.successTitle}>Order #{lastOrder.id} complete</Text>
              <Text style={styles.muted}>
                {lastOrder.items.length} {lastOrder.items.length === 1 ? 'game' : 'games'} added to your library · {formatPrice(lastOrder.total)}
              </Text>
            </View>
            <Pressable onPress={() => router.navigate('/profile')} hitSlop={8}>
              <Text style={styles.link}>Library</Text>
            </Pressable>
          </View>
        )}

        {items.length === 0 && !lastOrder && (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="cart-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={[styles.muted, { textAlign: 'center' }]}>Watch the best players, then pick your next game.</Text>
            <GradientButton label="Browse the store" icon="storefront-outline" onPress={() => router.navigate('/')} style={{ marginTop: Spacing.three }} />
          </View>
        )}

        {items.length > 0 && (
          <>
            <View style={{ gap: Spacing.two, marginTop: Spacing.three }}>
              {items.map((g) => (
                <View key={g.id} style={styles.item}>
                  <GameCover game={g} style={styles.cover} />
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={styles.itemTitle}>{g.title}</Text>
                    {owns(g.id) ? <Text style={[styles.muted, { color: Colors.success }]}>Already in your library</Text> : <PriceTag game={g} />}
                  </View>
                  <Pressable onPress={() => remove(g.id)} hitSlop={10} style={{ padding: 6 }}>
                    <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.textSecondary} />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.summary}>
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              {subtotal !== total && <Row label="Steam discounts" value={`-${formatPrice(subtotal - total)}`} accent />}
              <View style={styles.divider} />
              <Row label="Total" value={formatPrice(total)} big />
              {!user && (
                <Text style={[styles.muted, { marginTop: 4 }]}>Sign in to buy. Your games are saved to your profile.</Text>
              )}
              <GradientButton
                label={!user ? 'Sign in to buy' : paying ? 'Processing…' : total === 0 ? 'Add to library' : `Pay ${formatPrice(total)}`}
                icon={user ? 'lock-outline' : 'account-arrow-right'}
                disabled={paying || toBuy.length === 0}
                style={{ marginTop: Spacing.three }}
                onPress={checkout}
              />
              <Text style={[styles.muted, { textAlign: 'center', marginTop: Spacing.two, fontSize: 12 }]}>
                Test checkout: no real payment is taken yet.
              </Text>
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
  link: { color: Colors.accent2, fontSize: 14, fontWeight: '800' },
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
  cover: { width: 56, aspectRatio: 2 / 3, borderRadius: 10 },
  itemTitle: { color: Colors.text, fontSize: 15, fontWeight: '800' },
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
});
