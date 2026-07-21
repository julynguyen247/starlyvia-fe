import { DarkTheme, type Theme } from '@react-navigation/native';

import { colors } from './tokens';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.surfaceWarm,
    notification: colors.accent,
    primary: colors.primary,
    text: colors.text,
  },
};
