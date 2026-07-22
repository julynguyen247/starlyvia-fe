import { useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import type { ThemeColors } from './tokens';

type NamedStyles<T> = { [Key in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (colors: ThemeColors) => T,
): T {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [colors, factory]);
}
