import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { ThemeProvider } from '@shopify/restyle';
import * as SecureStore from 'expo-secure-store';
import { lightTheme, darkTheme } from '@/constants/restyleTheme';

const THEME_KEY = 'appTheme';

// Read at module load time so the value is ready before the first render settles,
// minimising the light→dark flash on cold start.
const _initialTheme = SecureStore.getItemAsync(THEME_KEY);

interface ThemePreferenceContextValue {
  isDark: boolean;
  toggleTheme: () => Promise<void>;
}

const ThemePreferenceContext = createContext<ThemePreferenceContextValue>({
  isDark: false,
  toggleTheme: async () => {},
});

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    _initialTheme.then(v => {
      if (v === 'dark') setIsDark(true);
    });
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    await SecureStore.setItemAsync(THEME_KEY, next ? 'dark' : 'light');
  }, [isDark]);

  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return (
    <ThemePreferenceContext.Provider value={value}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        {children}
      </ThemeProvider>
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  return useContext(ThemePreferenceContext);
}
