import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
};

export function Chip({ label, selected = false, onPress, tone = 'neutral' }: Props) {
  const toneStyle = {
    neutral: styles.neutral,
    success: styles.success,
    warning: styles.warning,
    danger: styles.danger,
  }[tone];
  const toneLabelStyle = {
    neutral: styles.neutralLabel,
    success: styles.successLabel,
    warning: styles.warningLabel,
    danger: styles.dangerLabel,
  }[tone];
  const content = (
    <>
      {selected ? <Ionicons color={colors.heroText} name="checkmark" size={15} /> : null}
      <Text style={[styles.label, toneLabelStyle, selected && styles.selectedLabel]}>{label}</Text>
    </>
  );

  if (!onPress) {
    return <View style={[styles.base, toneStyle, selected && styles.selected]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles.interactive,
        toneStyle,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
  },
  danger: { backgroundColor: colors.dangerSoft },
  dangerLabel: { color: colors.dangerText },
  interactive: { minHeight: 44 },
  label: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '800' },
  neutral: { backgroundColor: colors.surfaceMuted },
  neutralLabel: { color: colors.textMuted },
  pressed: { opacity: 0.76, transform: [{ scale: 0.98 }] },
  selected: { backgroundColor: colors.primary },
  selectedLabel: { color: colors.heroText },
  success: { backgroundColor: colors.successSoft },
  successLabel: { color: colors.successText },
  warning: { backgroundColor: colors.warningSoft },
  warningLabel: { color: colors.warningText },
});
