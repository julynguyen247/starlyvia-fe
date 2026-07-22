import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
  View,
} from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography, type ThemeColors } from '../theme/tokens';
import { useThemedStyles } from '../theme/useThemedStyles';

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
    onBlur,
    onFocus,
    ...props
  },
  ref,
) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={[
        styles.inputShell,
        focused && styles.inputFocused,
        error && styles.inputError,
        !editable && styles.inputDisabled,
        multiline && styles.multilineShell,
      ]}>
        {icon ? <Ionicons color={error ? colors.danger : focused ? colors.primary : colors.textMuted} name={icon} size={20} /> : null}
        <TextInput
          accessibilityHint={error ?? accessibilityHint}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: !editable }}
          editable={editable}
          ref={ref}
          multiline={multiline}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, multiline && styles.multilineInput, style]}
          {...props}
        />
      </View>
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
    </View>
  );
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  error: { color: colors.dangerText, fontSize: typography.caption, marginTop: spacing.xs },
  input: {
    color: colors.text,
    flex: 1,
    fontSize: typography.body,
    minHeight: 50,
    paddingVertical: spacing.sm,
  },
  inputError: { borderColor: colors.danger },
  inputDisabled: { backgroundColor: colors.surfaceMuted },
  inputFocused: { borderColor: colors.primary },
  inputShell: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.controlBorder,
    borderRadius: radius.md,
    borderWidth: 1.5,
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
}
