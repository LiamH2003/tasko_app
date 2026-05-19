import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/theme';
import { useFonts, Fredoka_500Medium } from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, sessionLoading } = useAppStore();

  useEffect(() => {
    if (sessionLoading) return;
    if (session) {
      router.replace('/(parent)');
    } else {
      router.replace('/(onboarding)');
    }
  }, [session, sessionLoading]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(child)" />
      <Stack.Screen name="(parent)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Fredoka_500Medium });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AppProvider>
      <RootNavigator />
      <StatusBar style="light" />
    </AppProvider>
  );
}
