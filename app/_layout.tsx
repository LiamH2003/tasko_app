import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/store/useAppStore';
import { Colors } from '@/constants/theme';
import { useFonts, Fredoka_500Medium } from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Fredoka_500Medium });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AppProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(child)" />
        <Stack.Screen name="(parent)" />
      </Stack>
      <StatusBar style="light" />
    </AppProvider>
  );
}
