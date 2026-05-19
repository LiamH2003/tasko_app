import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/theme';
import { useFonts, Fredoka_500Medium } from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, sessionLoading } = useAppStore();
  const segments = useSegments();

  useEffect(() => {
    if (sessionLoading) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inParent = segments[0] === '(parent)';
    const inChild = segments[0] === '(child)';

    if (session) {
      const onboardingComplete = session.user.user_metadata?.onboarding_complete === true;

      if (onboardingComplete && !inParent) {
        // Existing user logging back in → go straight to dashboard
        router.replace('/(parent)');
      }
      // New signup (onboarding_complete not set yet) → stay in onboarding flow
    } else {
      // No session → always send to onboarding
      if (inParent || inChild) {
        router.replace('/(onboarding)');
      }
    }
  }, [session, sessionLoading, segments[0]]);

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
