import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';

type Props = PropsWithChildren<{ title: string; subtitle: string }>;

export function AuthShell({ title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: Math.max(insets.bottom, spacing.xl),
            paddingTop: Math.max(insets.top + spacing.xl, spacing.xxxl),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.logo}>
            <Text style={styles.logoStar}>✦</Text>
          </View>
          <Text style={styles.brandName}>starlyvia</Text>
        </View>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.card}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  brandName: { color: colors.primaryDark, fontSize: typography.heading, fontWeight: '900', letterSpacing: -0.4 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.xl,
    ...shadows,
  },
  content: { flexGrow: 1, gap: spacing.xxl, justifyContent: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xxxl },
  intro: { gap: spacing.sm },
  logo: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, height: 44, justifyContent: 'center', width: 44 },
  logoStar: { color: colors.white, fontSize: 25 },
  page: { backgroundColor: colors.background, flex: 1 },
  subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 24 },
  title: { color: colors.text, fontSize: typography.hero, fontWeight: '900', letterSpacing: -1.2 },
});
