import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router/js-tabs';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, TabBarHeight } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarStyle: {
          position: 'absolute',
          height: TabBarHeight + insets.bottom,
          paddingTop: 6,
          borderTopColor: Colors.border,
          backgroundColor: 'rgba(7,7,12,0.82)',
        },
        tabBarBackground: () => <BlurView tint="dark" intensity={40} style={StyleSheet.absoluteFill} />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Store',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'storefront' : 'storefront-outline'} size={24} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="magnify" size={26} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="live"
        options={{
          title: 'Live',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="broadcast" size={24} color={color as string} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'account-circle' : 'account-circle-outline'} size={24} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
