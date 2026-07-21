import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = TextInputProps & {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: StyleProp<ViewStyle>;
};

export const AppInput = forwardRef<TextInput, Props>(function AppInput(
  {
    label,
    error,
    icon,
    multiline,
    style,
    containerStyle,
    accessibilityHint,
    accessibilityLabel,
    editable = true,
    ...props
  },
  ref,
) {
  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputError, multiline && styles.multilineShell]}>
        {icon ? <Ionicons color={colors.textMuted} name={icon} size={20} /> : null}
        <TextInput
          accessibilityHint={error ?? accessibilityHint}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: !editable }}
          editable={editable}
          ref={ref}
          multiline={multiline}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, multiline && styles.multilineInput, style]}
          {...props}
        />
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  error: { color: colors.dangerText, fontSize: typography.caption, marginTop: spacing.xs },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: typography.body,
    minHeight: 50,
    paddingVertical: spacing.sm,
  },
  inputError: { borderColor: colors.danger },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  multilineInput: { minHeight: 92, textAlignVertical: 'top' },
  multilineShell: { alignItems: 'flex-start' },
  wrapper: { width: '100%' },
});
