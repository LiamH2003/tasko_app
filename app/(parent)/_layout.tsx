import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemePreferenceProvider, useThemePreference } from '@/store/useThemePreference';
import { ChildrenProvider, useParentChildren } from '@/store/useParentChildren';
import { PRIMARY } from '@/constants/palette';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: IconName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function EerlijkheidIcon({ color, size }: { color: string; size: number }) {
  const { flagCount } = useParentChildren();
  return (
    <View>
      <Ionicons name="shield-outline" size={size} color={color} />
      {flagCount > 0 && <View style={styles.alertDot} />}
    </View>
  );
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
        options={{ title: 'Overzicht', tabBarIcon: ({ color, size }) => <TabIcon name="home-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="routines"
        options={{ title: 'Routines', tabBarIcon: ({ color, size }) => <TabIcon name="calendar-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="gevoel"
        options={{ title: 'Gevoel', tabBarIcon: ({ color, size }) => <TabIcon name="happy-outline" color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="eerlijkheid"
        options={{ title: 'Eerlijkheid', tabBarIcon: ({ color, size }) => <EerlijkheidIcon color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Instellingen', tabBarIcon: ({ color, size }) => <TabIcon name="settings-outline" color={color} size={size} /> }}
      />
    </Tabs>
  );
}

export default function ParentLayout() {
  return (
    <ThemePreferenceProvider>
      <ChildrenProvider>
        <ThemedTabs />
      </ChildrenProvider>
    </ThemePreferenceProvider>
  );
}

const styles = StyleSheet.create({
  alertDot: {
    position: 'absolute', top: -1, right: -3,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#fc6b6b',
  },
});
