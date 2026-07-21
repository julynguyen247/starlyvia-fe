import { Platform } from 'react-native';

export const colors = {
  background: '#F7F5F2',
  surface: '#FFFFFF',
  surfaceMuted: '#EEEAE5',
  text: '#17203B',
  textMuted: '#62687A',
  primary: '#4F46E5',
  primaryDark: '#312E81',
  primarySoft: '#E9E7FF',
  accent: '#F97360',
  accentSoft: '#FFEAE5',
  success: '#16856B',
  successSoft: '#DCF5EC',
  successText: '#11745E',
  warning: '#A96614',
  warningSoft: '#FFF2D8',
  warningText: '#945A0D',
  danger: '#C4424F',
  dangerSoft: '#FFE5E8',
  dangerText: '#AE3542',
  border: '#E1DDD7',
  primaryBorder: '#C9C5FF',
  heroText: '#FFFFFF',
  heroTextMuted: '#E0E7FF',
  heroTextSubtle: '#C7D2FE',
  heroDecoration: 'rgba(255, 255, 255, 0.12)',
  heroIconSurface: 'rgba(255, 255, 255, 0.15)',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(23, 32, 59, 0.48)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  hero: 34,
  title: 26,
  heading: 20,
  body: 16,
  small: 14,
  caption: 12,
} as const;

export const shadows = Platform.select({
  ios: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: { elevation: 2 },
  default: {},
});
