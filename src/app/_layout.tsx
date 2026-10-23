import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Colors } from '@/constants/theme';
import { CartProvider } from '@/store/cart';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.background,
    card: Colors.background,
    primary: Colors.accent,
    text: Colors.text,
    border: Colors.border,
  },
};

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={theme}>
      <CartProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="game/[id]" />
          <Stack.Screen name="watch/[id]" options={{ presentation: 'modal' }} />
        </Stack>
      </CartProvider>
    </ThemeProvider>
  );
}
