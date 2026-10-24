import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/components/ui';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { formatPrice } from '@/data/games';
import { PLAY_OPTIONS, PROFILE_PLATFORM_OPTION, STORES, storeUrl, type StoreId } from '@/data/platforms';
import { useBuyAdvice, type BuyOption, type StoreLink } from '@/services/advisor';
import type { GameDetails } from '@/services/game-details';
import { useAuth } from '@/store/auth';
import { openLink } from '@/utils/open-link';

const BADGES = {
  'best-performance': { label: 'Best performance', color: Colors.gold, icon: 'trophy' as const },
  'lowest-price': { label: 'Lowest price', color: Colors.success, icon: 'tag' as const },
  portable: { label: 'Play anywhere', color: Colors.accent2, icon: 'gamepad-round' as const },
  yours: { label: 'You play here', color: '#C4B5FD', icon: 'account-check' as const },
};

/** Sales assistant: ranks every platform for this game and links to each store. */
export function BuyAdvisor({ game }: { game: GameDetails }) {
  const { user, addToLibrary, owns } = useAuth();
  const mine = (user?.platforms ?? []).map((p) => PROFILE_PLATFORM_OPTION[p]).filter(Boolean);
  const advice = useBuyAdvice(game, mine);
  const [visited, setVisited] = useState<{ store: string; platform: string } | null>(null);
  const [showHow, setShowHow] = useState(false);
  const top = advice.options[0];

  const visit = (option: BuyOption, store: StoreLink) => {
    setVisited({ store: store.name, platform: option.name });
    openLink(store.url);
  };

  const saveToLibrary = async () => {
    if (!user) {
      router.push({ pathname: '/auth', params: { reason: 'library' } });
      return;
    }
    await addToLibrary(
      { gameId: game.id, title: game.title, image: game.images.cover ?? game.images.header ?? null, accent: game.accent },
      visited ?? undefined,
    );
    setVisited(null);
  };

  return (
    <View style={{ gap: Spacing.three }}>
      {visited && !owns(game.id) && (
        <View style={styles.boughtBanner}>
          <MaterialCommunityIcons name="bag-checked" size={22} color={Colors.success} />
          <Text style={[styles.body, { flex: 1 }]}>
            Bought it on {visited.store}? Add {game.title} to your library.
          </Text>
          <Pressable onPress={saveToLibrary} hitSlop={8}>
            <Text style={styles.bannerAction}>Add</Text>
          </Pressable>
        </View>
      )}

      {top && (
        <LinearGradient colors={[game.accent + '55', Colors.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topCard}>
          <Text style={styles.eyebrow}>OUR PICK FOR THE BEST PERFORMANCE</Text>
          <View style={styles.topRow}>
            <View style={styles.topIcon}>
              <MaterialCommunityIcons name={PLAY_OPTIONS[top.option].icon} size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.topTitle}>Play on {top.name}</Text>
              <Text style={styles.small}>{top.note}</Text>
            </View>
          </View>
          <View style={styles.storeRow}>
            {top.stores.map((s) => (
              <StoreButton key={s.store} link={s} onPress={() => visit(top, s)} big />
            ))}
          </View>
        </LinearGradient>
      )}

      <SectionHeader
        title="All ways to play"
        subtitle={advice.loading ? 'Checking stores and prices…' : 'Ranked by performance. Pick where you want to buy.'}
        action={advice.loading ? <ActivityIndicator color={Colors.accent} /> : undefined}
      />
      <View style={styles.list}>
        {advice.options.map((o, i) => (
          <OptionCard key={o.option} option={o} rank={i + 1} isFree={!!game.isFree} onStore={(s) => visit(o, s)} />
        ))}
        {advice.options.length === 0 && <NoPlatformData game={game} />}
      </View>

      {advice.deals.length > 0 && (
        <>
          <SectionHeader title="PC prices right now" subtitle={`${advice.deals.length} official ${advice.deals.length === 1 ? 'store' : 'stores'} compared live`} />
          <View style={[styles.list, { gap: 0 }]}>
            <View style={styles.dealsCard}>
              {advice.deals.slice(0, 8).map((d, i) => (
                <Pressable key={d.store} onPress={() => openLink(d.url)} style={[styles.dealRow, i > 0 && styles.dealBorder]}>
                  <Text style={[styles.body, { flex: 1, color: Colors.text }]}>{d.store}</Text>
                  {d.savings > 0 && (
                    <View style={styles.savings}>
                      <Text style={styles.savingsText}>-{d.savings}%</Text>
                    </View>
                  )}
                  <Text style={styles.dealPrice}>{formatPrice(d.price)}</Text>
                  <MaterialCommunityIcons name="open-in-new" size={16} color={Colors.textMuted} />
                </Pressable>
              ))}
            </View>
            <Text style={styles.footnote}>Prices from CheapShark{advice.checkedAt ? `, checked at ${advice.checkedAt.toLocaleTimeString()}` : ''}.</Text>
          </View>
        </>
      )}

      <View style={styles.list}>
        <Pressable onPress={() => setShowHow((s) => !s)} style={styles.howHeader}>
          <MaterialCommunityIcons name="information-outline" size={18} color={Colors.accent2} />
          <Text style={styles.howTitle}>How we rank</Text>
          <MaterialCommunityIcons name={showHow ? 'chevron-up' : 'chevron-down'} size={20} color={Colors.textMuted} />
        </Pressable>
        {showHow && (
          <Text style={styles.small}>
            Each time you open this page, the app looks up which platforms {game.title} is released on and its page on every store (Wikidata),
            Valve&apos;s Steam Deck rating and live PC prices from Steam and other official stores (CheapShark). Platforms are then ranked by how
            powerful their hardware is for games: a gaming PC first, then PS5 and Xbox Series X|S, Switch 2, Mac, Steam Deck, last-generation
            consoles, Switch and phones. Your own result on PC depends on your hardware. Store links marked &quot;Search&quot; open the store&apos;s
            search because we couldn&apos;t find the exact page.
          </Text>
        )}
      </View>
    </View>
  );
}

function OptionCard({ option, rank, isFree, onStore }: { option: BuyOption; rank: number; isFree: boolean; onStore: (s: StoreLink) => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.rank, rank === 1 && { backgroundColor: Colors.gold }]}>
          <Text style={[styles.rankText, rank === 1 && { color: '#000' }]}>{rank}</Text>
        </View>
        <MaterialCommunityIcons name={PLAY_OPTIONS[option.option].icon} size={22} color={Colors.text} />
        <Text style={styles.cardTitle}>{option.name}</Text>
        <Text style={styles.price}>{isFree ? 'Free' : option.price !== null ? `from ${formatPrice(option.price)}` : ''}</Text>
      </View>

      {option.badges.length > 0 && (
        <View style={styles.badges}>
          {option.badges.map((b) => (
            <View key={b} style={[styles.badge, { borderColor: BADGES[b].color + '88' }]}>
              <MaterialCommunityIcons name={BADGES[b].icon} size={12} color={BADGES[b].color} />
              <Text style={[styles.badgeText, { color: BADGES[b].color }]}>{BADGES[b].label}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.meterRow}>
        <View style={styles.meter}>
          <View style={[styles.meterFill, { width: `${option.performance}%` }]} />
        </View>
        <Text style={styles.meterText}>{option.performance}</Text>
      </View>
      <Text style={styles.small}>{option.note}</Text>

      <View style={styles.storeRow}>
        {option.stores.map((s) => (
          <StoreButton key={s.store} link={s} onPress={() => onStore(s)} />
        ))}
      </View>
    </View>
  );
}

function StoreButton({ link, onPress, big }: { link: StoreLink; onPress: () => void; big?: boolean }) {
  const meta = STORES[link.store];
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.storeButton, big && styles.storeButtonBig, pressed && { opacity: 0.75 }]}>
      <MaterialCommunityIcons name={meta.icon} size={big ? 20 : 16} color={meta.color} />
      <Text style={[styles.storeText, big && { fontSize: 15 }]}>{link.direct ? meta.name : `Search ${meta.name}`}</Text>
      <MaterialCommunityIcons name="open-in-new" size={14} color={Colors.textMuted} />
    </Pressable>
  );
}

/** When we don't know the platforms, offer every major store's search. */
function NoPlatformData({ game }: { game: GameDetails }) {
  const stores: StoreId[] = ['steam', 'epic', 'playstation', 'xbox', 'nintendo', 'googleplay', 'appstore'];
  return (
    <View style={styles.card}>
      <Text style={styles.small}>We couldn&apos;t find which platforms {game.title} is on. Search for it in these stores:</Text>
      <View style={styles.storeRow}>
        {stores.map((s) => (
          <StoreButton key={s} link={{ store: s, name: STORES[s].name, url: storeUrl[s](game.storeIds, game.title), direct: false }} onPress={() => openLink(storeUrl[s](game.storeIds, game.title))} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: Spacing.three, gap: Spacing.two },
  body: { color: Colors.textSecondary, fontSize: 15, lineHeight: 22 },
  small: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  footnote: { color: Colors.textMuted, fontSize: 12, marginTop: Spacing.two },
  boughtBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: Spacing.three,
    padding: 14,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(52,211,153,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52,211,153,0.3)',
  },
  bannerAction: { color: Colors.success, fontSize: 15, fontWeight: '900' },
  topCard: { marginHorizontal: Spacing.three, padding: Spacing.three, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, gap: Spacing.three },
  eyebrow: { color: Colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  topIcon: { width: 54, height: 54, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: Colors.text, fontSize: 22, fontWeight: '900', marginBottom: 4 },
  card: { padding: 14, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rank: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  rankText: { color: Colors.text, fontSize: 13, fontWeight: '900' },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: '800', flex: 1 },
  price: { color: Colors.text, fontSize: 14, fontWeight: '800' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  meterRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  meter: { flex: 1, height: 8, borderRadius: 4, backgroundColor: Colors.surfaceRaised, overflow: 'hidden' },
  meterFill: { height: '100%', borderRadius: 4, backgroundColor: Colors.accent },
  meterText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '800', width: 26, textAlign: 'right' },
  storeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  storeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  storeButtonBig: { paddingHorizontal: 14, paddingVertical: 11, backgroundColor: 'rgba(255,255,255,0.1)' },
  storeText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  dealsCard: { borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14 },
  dealRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  dealBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  savings: { backgroundColor: Colors.success, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  savingsText: { color: '#03140D', fontSize: 11, fontWeight: '900' },
  dealPrice: { color: Colors.text, fontSize: 15, fontWeight: '800', minWidth: 60, textAlign: 'right' },
  howHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  howTitle: { color: Colors.text, fontSize: 15, fontWeight: '800', flex: 1 },
});
