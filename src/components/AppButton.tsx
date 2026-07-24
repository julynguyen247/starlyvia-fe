import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Pressable,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import { shadows } from '../theme/tokens';

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
  const { colors } = useAppTheme();
  const variantStyles: Record<ButtonVariant, { background: string; border: string; text: string }> = {
    primary: { background: colors.primary, border: colors.primary, text: colors.onPrimary },
    secondary: { background: colors.accentSoft, border: colors.accent, text: colors.accentText },
    ghost: { background: 'transparent', border: colors.controlBorder, text: colors.text },
    danger: { background: colors.dangerSoft, border: colors.dangerSoft, text: colors.dangerText },
  };
  const palette = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityLabel={loading ? `${label}, in progress` : label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      className={`${compact ? 'min-h-11 px-4' : 'min-h-[52px] px-6'} flex-row items-center justify-center gap-2 rounded-2xl border active:translate-y-px active:scale-[0.975] active:opacity-90 ${isDisabled ? 'opacity-50' : ''}`}
      style={({ pressed }) => [
        { backgroundColor: palette.background, borderColor: palette.border },
        variant === 'primary' && !isDisabled ? shadows : undefined,
        pressed ? { opacity: 0.92 } : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text} />
      ) : (
        <>
          {icon ? <Ionicons color={palette.text} name={icon} size={18} /> : null}
          <Text className="text-base font-bold" style={{ color: palette.text }}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
