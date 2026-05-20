import { Stack } from 'expo-router';
import { ThemeProvider } from '@shopify/restyle';
import { theme } from '@/constants/restyleTheme';

export default function OnboardingLayout() {
  return (
    <ThemeProvider theme={theme}>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
