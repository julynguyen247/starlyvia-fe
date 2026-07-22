import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography, type ThemeColors } from '../theme/tokens';
import { useThemedStyles } from '../theme/useThemedStyles';
import { AppButton } from './AppButton';
import { DreamyBackdrop } from './DreamyBackdrop';
import { TravelScene, type TravelSceneName } from './TravelScene';

type StateKind = 'loading' | 'empty' | 'error' | 'offline' | 'warning' | 'success';
type StatePresentation = 'inline' | 'screen';

type Props = {
  title: string;
  message?: string;
  loading?: boolean;
  kind?: StateKind;
  presentation?: StatePresentation;
  scene?: TravelSceneName;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateView({
  title,
  message,
  loading = false,
  kind = 'empty',
  presentation = 'inline',
  scene,
  icon = 'sparkles-outline',
  actionLabel,
  onAction,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const resolvedKind: StateKind = loading ? 'loading' : kind;
  const isLoading = resolvedKind === 'loading';

  return (
    <View
      accessibilityLabel={isLoading ? title : undefined}
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: isLoading }}
      style={[
        styles.container,
        presentation === 'screen' && styles.screen,
        presentation === 'screen' && {
          paddingBottom: Math.max(insets.bottom, spacing.xl),
          paddingTop: Math.max(insets.top, spacing.xl),
        },
      ]}
    >
      {presentation === 'screen' ? <DreamyBackdrop /> : null}
      {scene ? (
        <TravelScene animated={resolvedKind === 'success'} scene={scene} size={presentation === 'screen' ? 180 : 138} />
      ) : !isLoading ? (
        <View style={styles.icon}>
          <Ionicons color={colors.primary} name={icon} size={30} />
        </View>
      ) : null}
      {isLoading ? <ActivityIndicator color={colors.primary} size="large" /> : null}
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <AppButton compact label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 240,
    padding: spacing.xl,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 21,
    maxWidth: 320,
    textAlign: 'center',
  },
  screen: { backgroundColor: colors.background, flex: 1, minHeight: 0 },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '800', textAlign: 'center' },
  });
}
