import { DefaultTheme, type Theme } from '@react-navigation/native';

import { colors } from './tokens';

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.surface,
    notification: colors.accent,
    primary: colors.primary,
    text: colors.text,
  },
};
