import { Ionicons } from '@expo/vector-icons';
import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PlayfulHero } from '../../components/PlayfulHero';
import { DreamyBackdrop } from '../../components/DreamyBackdrop';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  requestError?: string | null;
}>;

export function AuthShell({ title, subtitle, requestError, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}>
      <DreamyBackdrop />
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
            <Ionicons color={colors.onPrimary} name="sparkles" size={23} />
          </View>
          <Text style={styles.brandName}>starlyvia</Text>
        </View>
        <PlayfulHero
          description={subtitle}
          eyebrow="YOUR NEXT ADVENTURE"
          scene="welcome"
          title={title}
        />
        <View style={styles.card}>
          {requestError ? (
            <View
              accessibilityLabel={`Request failed. ${requestError}`}
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              style={styles.requestError}
            >
              <Ionicons
                accessibilityElementsHidden
                color={colors.dangerText}
                importantForAccessibility="no-hide-descendants"
                name="alert-circle-outline"
                size={20}
              />
              <Text style={styles.requestErrorText}>{requestError}</Text>
            </View>
          ) : null}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  brandName: { color: colors.text, fontSize: typography.heading, fontWeight: '900', letterSpacing: -0.4 },
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
  logo: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: radius.md, height: 44, justifyContent: 'center', width: 44 },
  page: { backgroundColor: colors.background, flex: 1 },
  requestError: {
    alignItems: 'flex-start',
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  requestErrorText: { color: colors.dangerText, flex: 1, fontSize: typography.small, lineHeight: 20 },
});
