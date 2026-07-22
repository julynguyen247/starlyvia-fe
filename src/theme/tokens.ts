import { Platform } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

export const darkColors = {
  background: '#121114',
  surface: '#1A191D',
  surfaceWarm: '#211F24',
  surfaceMuted: '#2A282E',
  text: '#FFFFFF',
  textMuted: '#A9A6AF',
  primary: '#984FE6',
  primaryText: '#B98AFF',
  primaryDark: '#251C2D',
  primarySoft: '#382447',
  accent: '#B7F34A',
  accentSoft: '#29351C',
  accentText: '#D9FF8C',
  tertiary: '#FF776D',
  tertiarySoft: '#432522',
  tertiaryText: '#FFB6AF',
  onPrimary: '#FFFFFF',
  onAccent: '#172006',
  onSticker: '#1C181F',
  onStickerMuted: '#3B353D',
  stickerInkFaint: 'rgba(28, 24, 31, 0.10)',
  stickerInkSoft: 'rgba(28, 24, 31, 0.18)',
  stickerGlass: 'rgba(255, 255, 255, 0.90)',
  illustrationSun: '#FFD166',
  illustrationSky: '#8AD8F5',
  stickerOutline: '#454047',
  success: '#B7F34A',
  successSoft: '#29351C',
  successText: '#D9FF8C',
  warning: '#FFBD5B',
  warningSoft: '#28283A',
  warningText: '#FFE0A3',
  danger: '#FF776D',
  dangerSoft: '#432522',
  dangerText: '#FFB6AF',
  border: '#37333A',
  controlBorder: '#6C6872',
  primaryBorder: '#8D46DE',
  navigationSurface: '#1B191F',
  navigationBorder: '#353139',
  navigationIcon: '#8B8791',
  heroText: '#FFFFFF',
  heroTextMuted: '#DDE7E0',
  heroTextSubtle: '#C9C2D0',
  heroDecoration: 'rgba(255, 255, 255, 0.12)',
  heroIconSurface: 'rgba(255, 255, 255, 0.15)',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(8, 7, 10, 0.80)',
} as const;

export type ThemeColors = { [Key in keyof typeof darkColors]: string };

export const lightColors: ThemeColors = {
  background: '#F8F7FB',
  surface: '#FFFFFF',
  surfaceWarm: '#F3F1F6',
  surfaceMuted: '#ECE9F0',
  text: '#2B2630',
  textMuted: '#6D6673',
  primary: '#8B3FD7',
  primaryText: '#8B3FD7',
  primaryDark: '#EEE8F5',
  primarySoft: '#F2E6FC',
  accent: '#A9E53D',
  accentSoft: '#EAFBC5',
  accentText: '#405D00',
  tertiary: '#C8463E',
  tertiarySoft: '#FFE4E1',
  tertiaryText: '#8B2F29',
  onPrimary: '#FFFFFF',
  onAccent: '#253300',
  onSticker: '#1C181F',
  onStickerMuted: '#3B353D',
  stickerInkFaint: 'rgba(28, 24, 31, 0.08)',
  stickerInkSoft: 'rgba(28, 24, 31, 0.16)',
  stickerGlass: 'rgba(255, 255, 255, 0.78)',
  illustrationSun: '#F4B942',
  illustrationSky: '#8AD8F5',
  stickerOutline: '#FFFFFF',
  success: '#5E7D00',
  successSoft: '#EAFBC5',
  successText: '#405D00',
  warning: '#A75D00',
  warningSoft: '#FFF8E7',
  warningText: '#6A3D00',
  danger: '#C8463E',
  dangerSoft: '#FFE4E1',
  dangerText: '#8B2F29',
  border: '#DED9E3',
  controlBorder: '#7C7483',
  primaryBorder: '#7730C0',
  navigationSurface: '#FFFFFF',
  navigationBorder: '#DED9E3',
  navigationIcon: '#837C89',
  heroText: '#332A3B',
  heroTextMuted: '#665D6E',
  heroTextSubtle: '#786F80',
  heroDecoration: 'rgba(139, 63, 215, 0.14)',
  heroIconSurface: '#F2E6FC',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(20, 16, 23, 0.52)',
};

export const stickerPalette = {
  orange: '#FF8A64',
  green: '#B7F34A',
  yellow: '#F8DB55',
  blue: '#7EC8FF',
  violet: '#B98AFF',
  coral: '#FF776D',
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
    shadowColor: '#17152E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: { elevation: 2 },
  default: {},
});

export const stickerShadows = Platform.select({
  ios: {
    shadowColor: '#17152E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 3,
  },
  android: { elevation: 4 },
  default: {},
});
