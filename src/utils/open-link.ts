import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform } from 'react-native';

/**
 * Opens a link outside the app. Platform links (Twitch, YouTube, Kick, Steam) open in their
 * own app when it is installed, otherwise in the in-app browser.
 */
export async function openLink(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener');
    return;
  }
  try {
    await Linking.openURL(url);
  } catch {
    await WebBrowser.openBrowserAsync(url);
  }
}
