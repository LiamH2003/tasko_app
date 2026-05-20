import { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useAppStore } from '@/store/useAppStore';
import { Colors } from '@/constants/theme';
import { useFonts, Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, sessionLoading, childId, childLoading, clearChildId } = useAppStore();
  const segments = useSegments();

  useEffect(() => {
    if (sessionLoading || childLoading) return;

    const inOnboarding = segments[0] === '(onboarding)';
    const inParent = segments[0] === '(parent)';
    const inChild = segments[0] === '(child)';

    // Parent session always wins over a stale childId — a device can't be both
    if (session && childId) {
      clearChildId();
    }

    // Child device: only route to child if there is no parent session
    if (childId && !session) {
      if (!inChild) router.replace('/(child)');
      return;
    }

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
  }, [session, sessionLoading, childId, childLoading, segments[0]]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(child)" />
      <Stack.Screen name="(parent)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Fredoka_400Regular,
    Fredoka_500Medium,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

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
