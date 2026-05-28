import { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemePreferenceProvider, useThemePreference } from '@/store/useThemePreference';
import { PRIMARY } from '@/constants/palette';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: IoniconsName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function ThemedTabs() {
  const { isDark } = useThemePreference();

  const screenOptions = useMemo(() => ({
    headerShown: false,
    tabBarStyle: {
      backgroundColor: isDark ? 'rgba(15,21,32,0.98)' : 'rgba(255,255,255,0.97)',
      borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
      borderTopWidth: 1,
      height: 60,
      paddingBottom: 8,
      paddingTop: 6,
    },
    tabBarActiveTintColor: PRIMARY,
    tabBarInactiveTintColor: isDark ? '#6b7280' : '#8a8885',
    tabBarLabelStyle: { fontSize: 10 },
  }), [isDark]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <TabIcon name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: 'Routines',
          tabBarIcon: ({ color, size }) => <TabIcon name="calendar-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ color, size }) => <TabIcon name="timer-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasko"
        options={{
          title: 'Tasko',
          tabBarIcon: ({ color, size }) => <TabIcon name="paw-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Instellingen',
          tabBarIcon: ({ color, size }) => <TabIcon name="settings-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="tasks"    options={{ href: null }} />
      <Tabs.Screen name="mood"     options={{ href: null }} />
      <Tabs.Screen name="wardrobe" options={{ href: null }} />
    </Tabs>
  );
}

export default function ChildLayout() {
  return (
    <ThemePreferenceProvider>
      <ThemedTabs />
    </ThemePreferenceProvider>
  );
}
