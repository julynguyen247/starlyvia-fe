import { Ionicons } from '@expo/vector-icons';
import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DreamyBackdrop } from '../../components/DreamyBackdrop';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { PlayfulHero } from '../../components/PlayfulHero';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { shadows, spacing } from '../../theme/tokens';

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  requestError?: string | null;
}>;

export function AuthShell({ title, subtitle, requestError, children }: Props) {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <DreamyBackdrop />
      <ScrollView
        contentContainerClassName="flex-grow justify-center gap-8 px-6"
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom, spacing.xl),
          paddingTop: Math.max(insets.top + spacing.xl, spacing.xxxl),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap items-center justify-between gap-3">
          <View className="flex-row items-center gap-3">
            <View
              accessibilityElementsHidden
              className="h-11 w-11 items-center justify-center rounded-xl"
              importantForAccessibility="no-hide-descendants"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons color={colors.onPrimary} name="sparkles" size={23} />
            </View>
            <Text className="text-2xl font-black tracking-tight" style={{ color: colors.text }}>starlyvia</Text>
          </View>
          <LanguageSwitcher compact />
        </View>
        <PlayfulHero
          description={subtitle}
          eyebrow={t('auth.eyebrow')}
          scene="welcome"
          title={title}
        />
        <View
          className="gap-6 rounded-3xl border p-8"
          style={[{ backgroundColor: colors.surface, borderColor: colors.border }, shadows]}
        >
          {requestError ? (
            <View
              accessibilityLabel={t('auth.requestFailed', { message: requestError })}
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              className="flex-row items-start gap-2 rounded-2xl border p-4"
              style={{ backgroundColor: colors.dangerSoft, borderColor: colors.danger }}
            >
              <Ionicons
                accessibilityElementsHidden
                color={colors.dangerText}
                importantForAccessibility="no-hide-descendants"
                name="alert-circle-outline"
                size={20}
              />
              <Text className="flex-1 text-sm leading-5" style={{ color: colors.dangerText }}>{requestError}</Text>
            </View>
          ) : null}
          {children}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
