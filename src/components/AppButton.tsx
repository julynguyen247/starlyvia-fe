import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, spacing, stickerShadows, typography } from '../theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

const variantStyles: Record<ButtonVariant, { background: string; border: string; text: string }> = {
  primary: { background: colors.primary, border: colors.primaryDark, text: colors.onPrimary },
  secondary: { background: colors.accentSoft, border: colors.accent, text: colors.accentText },
  ghost: { background: 'transparent', border: colors.controlBorder, text: colors.text },
  danger: { background: colors.dangerSoft, border: colors.dangerSoft, text: colors.dangerText },
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  compact = false,
  style,
}: Props) {
  const palette = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={loading ? `${label}, in progress` : label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compact && styles.compact,
        { backgroundColor: palette.background, borderColor: palette.border },
        variant === 'primary' && styles.raised,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <>
          {icon ? <Ionicons color={palette.text} name={icon} size={18} /> : null}
          <Text style={[styles.label, { color: palette.text }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 2,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  compact: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  disabled: { elevation: 0, opacity: 0.52, shadowOpacity: 0 },
  label: { fontSize: typography.body, fontWeight: '700' },
  pressed: { opacity: 0.9, transform: [{ translateY: 2 }, { scale: 0.98 }] },
  raised: { ...stickerShadows },
});
