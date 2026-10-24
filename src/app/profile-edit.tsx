import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar, Chip, GradientButton, IconButton, TextField } from '@/components/ui';
import { Colors, Platforms as StreamPlatforms, Spacing } from '@/constants/theme';
import { ALL_GENRES } from '@/data/games';
import { AVATAR_COLORS, useAuth, type User } from '@/store/auth';

const GENRES = ALL_GENRES.filter((g) => g !== 'All' && g !== 'On sale');
const PLATFORMS = ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Steam Deck', 'Mobile'];

const toggle = (list: string[], item: string) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

export default function ProfileEditScreen() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center', gap: 16 }]}>
        <Text style={styles.muted}>Sign in to edit your profile.</Text>
        <GradientButton label="Sign in" onPress={() => router.replace('/auth')} />
      </View>
    );
  }

  // Mounted only once the user is loaded, so the form starts with their saved values.
  return <EditForm key={user.id} user={user} />;
}

function EditForm({ user }: { user: User }) {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [country, setCountry] = useState(user.country);
  const [avatarColor, setAvatarColor] = useState(user.avatarColor);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(user.favoriteGenres);
  const [platforms, setPlatforms] = useState<string[]>(user.platforms);
  const [socials, setSocials] = useState(user.socials);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  const save = async () => {
    if (displayName.trim().length < 2) {
      setError('Please enter your name.');
      return;
    }
    setSaving(true);
    const clean = (s: string) => s.trim().replace(/^@/, '');
    await updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim(),
      country: country.trim(),
      avatarColor,
      favoriteGenres,
      platforms,
      socials: { twitch: clean(socials.twitch), kick: clean(socials.kick), youtube: clean(socials.youtube), steam: clean(socials.steam) },
    });
    setSaving(false);
    close();
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.two, paddingBottom: insets.bottom + Spacing.five }]} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <View style={styles.topBar}>
            <Text style={styles.title}>Edit profile</Text>
            <IconButton icon="close" onPress={close} />
          </View>

          <View style={styles.avatarRow}>
            <Avatar name={displayName || user.displayName} color={avatarColor} size={72} />
            <View style={styles.swatches}>
              {AVATAR_COLORS.map((c) => (
                <Pressable key={c} onPress={() => setAvatarColor(c)} style={[styles.swatch, { backgroundColor: c }, c === avatarColor && styles.swatchActive]}>
                  {c === avatarColor && <MaterialCommunityIcons name="check" size={14} color="#fff" />}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.form}>
            <TextField label="Name" icon="account-outline" value={displayName} onChangeText={setDisplayName} maxLength={40} />
            <TextField label="Bio" value={bio} onChangeText={setBio} placeholder="What do you like to play?" multiline maxLength={160} />
            <TextField label="Country" icon="map-marker-outline" value={country} onChangeText={setCountry} placeholder="e.g. Türkiye" maxLength={40} />

            <Section title="Favourite genres">
              <View style={styles.chips}>
                {GENRES.map((g) => (
                  <Chip key={g} label={g} active={favoriteGenres.includes(g)} onPress={() => setFavoriteGenres((l) => toggle(l, g))} />
                ))}
              </View>
            </Section>

            <Section title="Where do you play?">
              <View style={styles.chips}>
                {PLATFORMS.map((p) => (
                  <Chip key={p} label={p} active={platforms.includes(p)} onPress={() => setPlatforms((l) => toggle(l, p))} />
                ))}
              </View>
            </Section>

            <Section title="Your channels">
              <View style={{ gap: Spacing.three }}>
                <TextField label="Twitch username" icon={StreamPlatforms.twitch.icon} value={socials.twitch} onChangeText={(t) => setSocials((s) => ({ ...s, twitch: t }))} autoCapitalize="none" />
                <TextField label="Kick username" icon={StreamPlatforms.kick.icon} value={socials.kick} onChangeText={(t) => setSocials((s) => ({ ...s, kick: t }))} autoCapitalize="none" />
                <TextField label="YouTube handle" icon={StreamPlatforms.youtube.icon} value={socials.youtube} onChangeText={(t) => setSocials((s) => ({ ...s, youtube: t }))} autoCapitalize="none" />
                <TextField label="Steam custom URL name" icon="steam" value={socials.steam} onChangeText={(t) => setSocials((s) => ({ ...s, steam: t }))} autoCapitalize="none" />
              </View>
            </Section>

            {error && <Text style={styles.error}>{error}</Text>}
            <GradientButton label={saving ? 'Saving…' : 'Save profile'} icon="content-save-outline" disabled={saving} onPress={save} />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 10, marginTop: Spacing.two }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { alignItems: 'center', paddingHorizontal: Spacing.three },
  column: { width: '100%', maxWidth: 560 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: Colors.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.6 },
  muted: { color: Colors.textSecondary, fontSize: 14 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginTop: Spacing.four },
  swatches: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  swatchActive: { borderWidth: 3, borderColor: '#fff' },
  form: { gap: Spacing.three, marginTop: Spacing.four },
  sectionTitle: { color: Colors.text, fontSize: 16, fontWeight: '800' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  error: { color: '#FF8FA3', fontSize: 14 },
});
