import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from '@shopify/restyle';
import { theme } from '@/constants/restyleTheme';
import { PRIMARY } from '@/constants/palette';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, size }: { name: IoniconsName; color: string; size: number }) {
  return <Ionicons name={name} size={size} color={color} />;
}

export default function ChildLayout() {
  return (
    <ThemeProvider theme={theme}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderTopColor: 'rgba(0,0,0,0.06)',
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: '#8a8885',
        tabBarLabelStyle: { fontSize: 10 },
      }}
    >
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
          tabBarIcon: ({ color, size }) => <TabIcon name="radio-button-on-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="tasko"
        options={{
          title: 'Tasko',
          tabBarIcon: ({ color, size }) => <TabIcon name="location-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Instellingen',
          tabBarIcon: ({ color, size }) => <TabIcon name="settings-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen name="tasks" options={{ href: null }} />
      <Tabs.Screen name="mood" options={{ href: null }} />
    </Tabs>
    </ThemeProvider>
  );
}
