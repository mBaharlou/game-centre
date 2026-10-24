import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientButton, IconButton, TextField } from '@/components/ui';
import { AccentGradient, Colors, Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/store/auth';

const REASONS: Record<string, string> = {
  checkout: 'Sign in to buy games and keep them in your library.',
  wishlist: 'Sign in to save games to your wishlist.',
};

export default function AuthScreen() {
  const { reason, mode: initialMode } = useLocalSearchParams<{ reason?: string; mode?: 'signin' | 'signup' }>();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode ?? 'signin');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const signingUp = mode === 'signup';
  const close = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  const submit = async () => {
    setBusy(true);
    setError(null);
    const result = signingUp ? await signUp({ displayName, username, email, password }) : await signIn(identifier, password);
    setBusy(false);
    if (result) setError(result);
    else close();
  };

  const switchMode = () => {
    setMode(signingUp ? 'signin' : 'signup');
    setError(null);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.two, paddingBottom: insets.bottom + Spacing.five }]} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          <View style={{ alignItems: 'flex-end' }}>
            <IconButton icon="close" onPress={close} />
          </View>

          <LinearGradient colors={AccentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
            <MaterialCommunityIcons name="gamepad-variant" size={30} color="#fff" />
          </LinearGradient>
          <Text style={styles.title}>{signingUp ? 'Create your account' : 'Welcome back'}</Text>
          <Text style={styles.subtitle}>{(reason && REASONS[reason]) || (signingUp ? 'Your own profile, library and wishlist.' : 'Sign in to your Game Centre profile.')}</Text>

          <View style={styles.form}>
            {signingUp ? (
              <>
                <TextField label="Name" icon="account-outline" value={displayName} onChangeText={setDisplayName} placeholder="Your name" autoComplete="name" />
                <TextField
                  label="Username"
                  icon="at"
                  value={username}
                  onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="gamer_tag"
                  autoCapitalize="none"
                  autoComplete="username-new"
                />
                <TextField
                  label="Email"
                  icon="email-outline"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </>
            ) : (
              <TextField
                label="Email or username"
                icon="account-outline"
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="you@example.com"
                autoCapitalize="none"
                autoComplete="username"
              />
            )}
            <TextField
              label="Password"
              icon="lock-outline"
              value={password}
              onChangeText={setPassword}
              placeholder={signingUp ? 'At least 8 characters' : 'Your password'}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete={signingUp ? 'new-password' : 'current-password'}
              onSubmitEditing={submit}
              right={
                <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={8}>
                  <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                </Pressable>
              }
            />

            {error && (
              <View style={styles.error}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color={Colors.live} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <GradientButton label={busy ? 'Please wait…' : signingUp ? 'Create account' : 'Sign in'} disabled={busy} onPress={submit} style={{ marginTop: Spacing.two }} />
          </View>

          <Pressable onPress={switchMode} style={styles.switch}>
            <Text style={styles.switchText}>
              {signingUp ? 'Already have an account? ' : 'New to Game Centre? '}
              <Text style={styles.switchLink}>{signingUp ? 'Sign in' : 'Create an account'}</Text>
            </Text>
          </Pressable>

          <Text style={styles.footnote}>Accounts are saved on this device for now. Cloud sync comes with the next update.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  content: { alignItems: 'center', paddingHorizontal: Spacing.three },
  column: { width: '100%', maxWidth: 440 },
  logo: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.three },
  title: { color: Colors.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.8, marginTop: Spacing.four },
  subtitle: { color: Colors.textSecondary, fontSize: 15, marginTop: 6, lineHeight: 22 },
  form: { gap: Spacing.three, marginTop: Spacing.four },
  error: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: Radius.sm, backgroundColor: 'rgba(255,45,85,0.1)' },
  errorText: { color: '#FF8FA3', fontSize: 14, flex: 1 },
  switch: { alignItems: 'center', paddingVertical: Spacing.four },
  switchText: { color: Colors.textSecondary, fontSize: 14 },
  switchLink: { color: Colors.accent2, fontWeight: '800' },
  footnote: { color: Colors.textMuted, fontSize: 12, textAlign: 'center' },
});
