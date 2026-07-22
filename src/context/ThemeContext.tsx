import * as SecureStore from 'expo-secure-store';
import * as SystemUI from 'expo-system-ui';
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Appearance, useColorScheme } from 'react-native';

import { createNavigationTheme } from '../theme/navigationTheme';
import {
  darkColors,
  lightColors,
  type ThemeColors,
  type ThemePreference,
} from '../theme/tokens';

export type { ThemePreference } from '../theme/tokens';
export type ResolvedThemeScheme = Exclude<ThemePreference, 'system'>;

export type AppTheme = {
  colors: ThemeColors;
  preference: ThemePreference;
  resolvedScheme: ResolvedThemeScheme;
  setPreference: (preference: ThemePreference) => void;
  navigationTheme: ReturnType<typeof createNavigationTheme>;
  statusBarStyle: 'light' | 'dark';
};

const THEME_PREFERENCE_KEY = 'starlyvia.theme-preference.v1';
const ThemeContext = createContext<AppTheme | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const userSelectedPreference = useRef(false);

  useEffect(() => {
    let active = true;

    void SecureStore.getItemAsync(THEME_PREFERENCE_KEY)
      .then((storedPreference) => {
        if (active && !userSelectedPreference.current && isThemePreference(storedPreference)) {
          setPreferenceState(storedPreference);
        }
      })
      .catch(() => {
        // The system preference remains a safe fallback when secure storage is unavailable.
      });

    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    userSelectedPreference.current = true;
    setPreferenceState(nextPreference);
    void SecureStore.setItemAsync(THEME_PREFERENCE_KEY, nextPreference).catch(() => {
      // Keep the in-memory selection usable even if the device cannot persist it.
    });
  }, []);

  useEffect(() => {
    Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
  }, [preference]);

  const resolvedScheme: ResolvedThemeScheme = preference === 'system'
    ? systemScheme === 'dark' ? 'dark' : 'light'
    : preference;
  const colors = resolvedScheme === 'dark' ? darkColors : lightColors;

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(colors.background).catch(() => {
      // React surfaces still carry the resolved background if native system UI is unavailable.
    });
  }, [colors.background]);

  const value = useMemo<AppTheme>(() => ({
    colors,
    preference,
    resolvedScheme,
    setPreference,
    navigationTheme: createNavigationTheme(colors, resolvedScheme === 'dark'),
    statusBarStyle: resolvedScheme === 'dark' ? 'light' : 'dark',
  }), [colors, preference, resolvedScheme, setPreference]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useAppTheme must be used within ThemeProvider');
  return theme;
}
