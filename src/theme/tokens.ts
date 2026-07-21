import { Platform } from 'react-native';

export const colors = {
  background: '#0C1511',
  surface: '#14231C',
  surfaceWarm: '#192A22',
  surfaceMuted: '#22362C',
  text: '#F8F4EC',
  textMuted: '#AAB8AF',
  primary: '#FF7442',
  primaryDark: '#142019',
  primarySoft: '#3A241B',
  accent: '#68DA91',
  accentSoft: '#173925',
  accentText: '#B2F0C4',
  onPrimary: '#142019',
  onAccent: '#123C24',
  onSticker: '#142019',
  onStickerMuted: '#2E4036',
  stickerInkFaint: 'rgba(20, 32, 25, 0.10)',
  stickerInkSoft: 'rgba(20, 32, 25, 0.18)',
  stickerGlass: 'rgba(255, 255, 255, 0.58)',
  illustrationSun: '#FFD15C',
  illustrationSky: '#BEEAF2',
  cloud: '#213A2F',
  cloudSky: '#183427',
  cloudLavender: '#2B2B37',
  cloudPeach: '#3D281F',
  cloudGlow: '#5A4825',
  stickerOutline: '#F8F4EC',
  success: '#68DA91',
  successSoft: '#173925',
  successText: '#B2F0C4',
  warning: '#FFC85A',
  warningSoft: '#3B2F18',
  warningText: '#FFE09A',
  danger: '#FF7B84',
  dangerSoft: '#402126',
  dangerText: '#FFB7BC',
  border: '#30473B',
  controlBorder: '#60766A',
  primaryBorder: '#81452F',
  heroText: '#FFFFFF',
  heroTextMuted: '#DDE7E0',
  heroTextSubtle: '#A8DBB6',
  heroDecoration: 'rgba(255, 255, 255, 0.12)',
  heroIconSurface: 'rgba(255, 255, 255, 0.15)',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(3, 9, 6, 0.72)',
} as const;

export const stickerPalette = {
  orange: '#FF8A5C',
  green: '#74DFA0',
  yellow: '#FFD568',
  blue: '#86D1EA',
  violet: '#B9A8F7',
  coral: '#FF9A8B',
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
  xl: 30,
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

export const fontFamilies = {
  display: Platform.select({
    ios: 'Avenir Next',
    android: 'sans-serif-rounded',
    default: undefined,
  }),
  label: Platform.select({
    ios: 'Avenir Next Condensed',
    android: 'sans-serif-condensed',
    default: undefined,
  }),
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

export const stickerShadows = Platform.select({
  ios: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 0,
  },
  android: { elevation: 4 },
  default: {},
});
