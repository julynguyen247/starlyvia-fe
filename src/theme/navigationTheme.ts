import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';

import type { ThemeColors } from './tokens';

export function createNavigationTheme(colors: ThemeColors, dark: boolean): Theme {
  const baseTheme = dark ? DarkTheme : DefaultTheme;

  return {
    ...baseTheme,
    dark,
    colors: {
      ...baseTheme.colors,
      background: colors.background,
      border: colors.border,
      card: colors.surfaceWarm,
      notification: colors.accent,
      primary: colors.primary,
      text: colors.text,
    },
  };
}
