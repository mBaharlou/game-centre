import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RefTile } from '@/components/game-row';
import { Avatar, GradientButton, SectionHeader } from '@/components/ui';
import { AccentGradient, Colors, MaxContentWidth, Platforms, Radius, Spacing, TabBarHeight } from '@/constants/theme';
import type { IconName } from '@/data/games';
import { useAuth, type User } from '@/store/auth';
import { openLink } from '@/utils/open-link';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const contentWidth = Math.min(width, MaxContentWidth);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ alignItems: 'center', paddingTop: insets.top + Spacing.three, paddingBottom: TabBarHeight + insets.bottom + Spacing.five }}
      showsVerticalScrollIndicator={false}>
      <View style={{ width: contentWidth }}>{user ? <SignedIn user={user} width={contentWidth} /> : <SignedOut />}</View>
    </ScrollView>
  );
}

function SignedOut() {
  const perks: { icon: IconName; text: string }[] = [
    { icon: 'bookshelf', text: 'Your own game library' },
    { icon: 'heart-outline', text: 'Wishlist for games you want' },
    { icon: 'tag-search-outline', text: 'Advice on where to buy each game' },
    { icon: 'account-star-outline', text: 'Profile with your favourite genres, platforms and channels' },
  ];
  return (
    <View style={{ paddingHorizontal: Spacing.three }}>
      <Text style={styles.pageTitle}>Profile</Text>
      <LinearGradient colors={['#2E1065', Colors.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.signedOutCard}>
        <LinearGradient colors={AccentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.bigIcon}>
          <MaterialCommunityIcons name="account" size={36} color="#fff" />
        </LinearGradient>
        <Text style={styles.signedOutTitle}>Make it yours</Text>
        <Text style={styles.muted}>Create a free account to buy games and build your gaming profile.</Text>
        <View style={{ gap: 12, marginTop: Spacing.three, alignSelf: 'stretch' }}>
          {perks.map((p) => (
            <View key={p.text} style={styles.perk}>
              <MaterialCommunityIcons name={p.icon} size={20} color={Colors.accent2} />
              <Text style={styles.perkText}>{p.text}</Text>
            </View>
          ))}
        </View>
        <GradientButton
          label="Create account"
          icon="account-plus"
          style={{ alignSelf: 'stretch', marginTop: Spacing.four }}
          onPress={() => router.push({ pathname: '/auth', params: { mode: 'signup' } })}
        />
        <Pressable onPress={() => router.push({ pathname: '/auth', params: { mode: 'signin' } })} style={styles.secondary}>
          <Text style={styles.secondaryText}>I already have an account</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

function SignedIn({ user, width }: { user: User; width: number }) {
  const { signOut } = useAuth();
  const { library, wishlist } = user;
  const tileWidth = (width - Spacing.three * 4) / 3;
  const since = new Date(user.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  const socials = [
    { key: 'twitch', value: user.socials.twitch, icon: Platforms.twitch.icon, color: Platforms.twitch.color, url: `https://www.twitch.tv/${user.socials.twitch}` },
    { key: 'kick', value: user.socials.kick, icon: Platforms.kick.icon, color: Platforms.kick.color, url: `https://kick.com/${user.socials.kick}` },
    { key: 'youtube', value: user.socials.youtube, icon: Platforms.youtube.icon, color: Platforms.youtube.color, url: `https://www.youtube.com/@${user.socials.youtube}` },
    { key: 'steam', value: user.socials.steam, icon: 'steam' as const, color: '#66C0F4', url: `https://steamcommunity.com/id/${user.socials.steam}` },
  ].filter((s) => s.value);

  return (
    <View>
      {/* Header */}
      <View style={{ paddingHorizontal: Spacing.three }}>
        <LinearGradient colors={[user.avatarColor + '55', Colors.surface]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Avatar name={user.displayName} color={user.avatarColor} size={76} />
            <Pressable onPress={() => router.push('/profile-edit')} style={styles.editButton}>
              <MaterialCommunityIcons name="pencil" size={16} color={Colors.text} />
              <Text style={styles.editText}>Edit profile</Text>
            </Pressable>
          </View>
          <Text style={styles.name}>{user.displayName}</Text>
          <Text style={styles.handle}>
            @{user.username}
            {user.country ? ` · ${user.country}` : ''}
          </Text>
          {!!user.bio && <Text style={styles.bio}>{user.bio}</Text>}
          <Text style={styles.since}>Member since {since}</Text>

          {socials.length > 0 && (
            <View style={styles.socialRow}>
              {socials.map((s) => (
                <Pressable key={s.key} onPress={() => openLink(s.url)} style={[styles.social, { borderColor: s.color + '66' }]}>
                  <MaterialCommunityIcons name={s.icon} size={14} color={s.color} />
                  <Text style={styles.socialText}>{s.value}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </LinearGradient>

        <View style={styles.stats}>
          <Stat value={String(library.length)} label="Games" />
          <Stat value={String(wishlist.length)} label="Wishlist" />
          <Stat value={String(user.platforms.length)} label="Platforms" />
          <Stat value={String(user.favoriteGenres.length)} label="Genres" />
        </View>

        {(user.favoriteGenres.length > 0 || user.platforms.length > 0) && (
          <View style={styles.tagsCard}>
            {user.favoriteGenres.length > 0 && <TagGroup title="Favourite genres" tags={user.favoriteGenres} />}
            {user.platforms.length > 0 && <TagGroup title="Plays on" tags={user.platforms} />}
          </View>
        )}
        {user.favoriteGenres.length === 0 && user.platforms.length === 0 && !user.bio && (
          <Pressable onPress={() => router.push('/profile-edit')} style={styles.completeCard}>
            <MaterialCommunityIcons name="account-edit-outline" size={22} color={Colors.accent2} />
            <Text style={[styles.muted, { flex: 1 }]}>Complete your profile: add a bio, favourite genres, platforms and your channels.</Text>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Library */}
      <View style={styles.gap} />
      <SectionHeader title="My library" subtitle={library.length ? `${library.length} ${library.length === 1 ? 'game' : 'games'}` : undefined} />
      {library.length > 0 ? (
        <View style={styles.grid}>
          {library.map((item) => (
            <RefTile key={item.gameId} item={item} width={tileWidth} caption={item.store ? `${item.platform ?? ''} · ${item.store}`.replace(/^ · /, '') : undefined} />
          ))}
        </View>
      ) : (
        <EmptyLine text="After you buy a game, add it to your library from its “Where to buy” page." action="Search" onPress={() => router.navigate('/search')} />
      )}

      {/* Wishlist */}
      <View style={styles.gap} />
      <SectionHeader title="Wishlist" />
      {wishlist.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.three, gap: Spacing.three }}>
          {wishlist.map((item) => (
            <RefTile key={item.gameId} item={item} width={130} />
          ))}
        </ScrollView>
      ) : (
        <EmptyLine text="Tap the heart on any game to save it here." />
      )}

      <View style={{ paddingHorizontal: Spacing.three, marginTop: Spacing.five }}>
        <Pressable onPress={signOut} style={styles.signOut}>
          <MaterialCommunityIcons name="logout" size={18} color={Colors.live} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TagGroup({ title, tags }: { title: string; tags: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={styles.tagTitle}>{title}</Text>
      <View style={styles.tags}>
        {tags.map((t) => (
          <View key={t} style={styles.tag}>
            <Text style={styles.tagText}>{t}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function EmptyLine({ text, action, onPress }: { text: string; action?: string; onPress?: () => void }) {
  return (
    <View style={styles.emptyLine}>
      <Text style={[styles.muted, { flex: 1 }]}>{text}</Text>
      {action && (
        <Pressable onPress={onPress} hitSlop={8}>
          <Text style={styles.link}>{action}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  pageTitle: { color: Colors.text, fontSize: 34, fontWeight: '900', letterSpacing: -1, marginBottom: Spacing.three },
  muted: { color: Colors.textSecondary, fontSize: 14, lineHeight: 20 },
  link: { color: Colors.accent2, fontSize: 14, fontWeight: '800' },
  gap: { height: Spacing.five },
  signedOutCard: { alignItems: 'center', padding: Spacing.four, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  bigIcon: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  signedOutTitle: { color: Colors.text, fontSize: 24, fontWeight: '900', marginBottom: 6 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkText: { color: Colors.text, fontSize: 15, flex: 1 },
  secondary: { paddingVertical: Spacing.three },
  secondaryText: { color: Colors.textSecondary, fontSize: 14, fontWeight: '700' },
  headerCard: { padding: Spacing.four, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  name: { color: Colors.text, fontSize: 26, fontWeight: '900', marginTop: Spacing.three, letterSpacing: -0.5 },
  handle: { color: Colors.textSecondary, fontSize: 14, marginTop: 2 },
  bio: { color: Colors.text, fontSize: 15, lineHeight: 22, marginTop: Spacing.three },
  since: { color: Colors.textMuted, fontSize: 12, marginTop: Spacing.three },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: Spacing.three },
  social: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill, borderWidth: 1 },
  socialText: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  stats: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.three },
  stat: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  statValue: { color: Colors.text, fontSize: 18, fontWeight: '900' },
  statLabel: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  tagsCard: { gap: Spacing.three, marginTop: Spacing.three, padding: Spacing.three, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  tagTitle: { color: Colors.textMuted, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: Colors.accentSoft, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.pill },
  tagText: { color: '#C4B5FD', fontSize: 12, fontWeight: '700' },
  completeCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: Spacing.three, padding: Spacing.three, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.accent + '55', backgroundColor: Colors.accentSoft },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, paddingHorizontal: Spacing.three },
  emptyLine: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: Spacing.three, padding: 14, borderRadius: Radius.md, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,45,85,0.4)' },
  signOutText: { color: Colors.live, fontSize: 15, fontWeight: '800' },
});
