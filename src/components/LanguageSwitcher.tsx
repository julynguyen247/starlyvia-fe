import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { type AppLanguage, useLanguage } from '../context/LanguageContext';
import { useAppTheme } from '../context/ThemeContext';
import { radius, spacing, typography, type ThemeColors } from '../theme/tokens';
import { useThemedStyles } from '../theme/useThemedStyles';

const options: Array<{ label: 'EN' | 'VI'; value: AppLanguage }> = [
  { label: 'EN', value: 'en' },
  { label: 'VI', value: 'vi' },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { colors } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const styles = useThemedStyles(createStyles);
  const currentLanguage = language === 'vi' ? t('language.vietnamese') : t('language.english');

  return (
    <View style={compact ? styles.compactRoot : styles.root}>
      {!compact ? (
        <View style={styles.heading}>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.icon}
          >
            <Ionicons color={colors.primary} name="language-outline" size={23} />
          </View>
          <View style={styles.copy}>
            <Text accessibilityRole="header" style={styles.title}>
              {t('language.title')}
            </Text>
            <Text style={styles.subtitle}>
              {t('language.subtitle')}
            </Text>
          </View>
        </View>
      ) : null}

      <View
        accessibilityLabel={t('language.title')}
        accessibilityRole="radiogroup"
        style={styles.options}
      >
        {options.map((option) => {
          const selected = language === option.value;
          const fullLabel = option.value === 'vi' ? t('language.vietnamese') : t('language.english');
          return (
            <Pressable
              accessibilityLabel={fullLabel}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={option.value}
              onPress={() => setLanguage(option.value)}
              style={({ pressed }) => [
                styles.option,
                compact ? styles.compactOption : styles.regularOption,
                selected && styles.selectedOption,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.optionLabel, selected && styles.selectedLabel]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!compact ? (
        <Text accessibilityLiveRegion="polite" style={styles.footnote}>
          {t('language.current', { language: currentLanguage })}
        </Text>
      ) : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    compactOption: { minHeight: 40, minWidth: 48, paddingHorizontal: spacing.md },
    compactRoot: { flexShrink: 0 },
    copy: { flex: 1, gap: spacing.xs },
    footnote: { color: colors.textMuted, fontSize: typography.caption, textAlign: 'center' },
    heading: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
    icon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md, height: 48, justifyContent: 'center', width: 48 },
    option: { alignItems: 'center', borderRadius: radius.sm, justifyContent: 'center' },
    optionLabel: { color: colors.textMuted, fontSize: typography.small, fontWeight: '900', letterSpacing: 0.4 },
    options: { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', padding: spacing.xs },
    pressed: { opacity: 0.75 },
    regularOption: { flex: 1, minHeight: 44, paddingHorizontal: 20 },
    root: { gap: spacing.lg },
    selectedLabel: { color: colors.onPrimary },
    selectedOption: { backgroundColor: colors.primary },
    subtitle: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
    title: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  });
}
