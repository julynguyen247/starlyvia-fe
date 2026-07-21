import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme/tokens';
import { AppButton } from './AppButton';

type Props = {
  title: string;
  message?: string;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
};

export function StateView({
  title,
  message,
  loading = false,
  icon = 'sparkles-outline',
  actionLabel,
  onAction,
}: Props) {
  return (
    <View
      accessibilityLabel={loading ? title : undefined}
      accessibilityLiveRegion="polite"
      accessibilityState={{ busy: loading }}
      style={styles.container}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <View style={styles.icon}>
          <Ionicons color={colors.primary} name={icon} size={30} />
        </View>
      )}
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <AppButton compact label={actionLabel} onPress={onAction} variant="secondary" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    minHeight: 280,
    padding: spacing.xl,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 30,
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
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '800', textAlign: 'center' },
});
