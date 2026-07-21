import type { PropsWithChildren, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '../theme/tokens';

type Props = PropsWithChildren<{
  scroll?: boolean;
  bottomInset?: boolean;
  safeTop?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}>;

export function Screen({
  children,
  scroll = true,
  bottomInset = true,
  safeTop = true,
  refreshing,
  onRefresh,
  footer,
  contentStyle,
}: Props) {
  const insets = useSafeAreaInsets();
  const bottomPadding = bottomInset ? Math.max(insets.bottom, spacing.xl) : spacing.xl;

  const content = scroll ? (
    <ScrollView
      alwaysBounceVertical={false}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: bottomPadding,
          paddingTop: safeTop ? Math.max(insets.top, spacing.lg) : spacing.lg,
        },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            colors={[colors.primary]}
            onRefresh={onRefresh}
            refreshing={refreshing ?? false}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {content}
      {footer}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.background, flex: 1 },
  content: { gap: spacing.lg, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
});
