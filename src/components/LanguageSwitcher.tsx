import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { type AppLanguage, useLanguage } from '../context/LanguageContext';
import { useAppTheme } from '../context/ThemeContext';

const options: Array<{ label: 'EN' | 'VI'; value: AppLanguage }> = [
  { label: 'EN', value: 'en' },
  { label: 'VI', value: 'vi' },
];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { colors } = useAppTheme();
  const { language, setLanguage, t } = useLanguage();
  const currentLanguage = language === 'vi' ? t('language.vietnamese') : t('language.english');

  return (
    <View className={compact ? 'shrink-0' : 'gap-4'}>
      {!compact ? (
        <View className="flex-row items-center gap-3">
          <View
            accessibilityElementsHidden
            className="h-12 w-12 items-center justify-center rounded-2xl"
            importantForAccessibility="no-hide-descendants"
            style={{ backgroundColor: colors.primarySoft }}
          >
            <Ionicons color={colors.primary} name="language-outline" size={23} />
          </View>
          <View className="flex-1 gap-1">
            <Text accessibilityRole="header" className="text-base font-extrabold" style={{ color: colors.text }}>
              {t('language.title')}
            </Text>
            <Text className="text-sm leading-5" style={{ color: colors.textMuted }}>
              {t('language.subtitle')}
            </Text>
          </View>
        </View>
      ) : null}

      <View
        accessibilityLabel={t('language.title')}
        accessibilityRole="radiogroup"
        className="flex-row rounded-2xl border p-1"
        style={{ backgroundColor: colors.surfaceMuted, borderColor: colors.border }}
      >
        {options.map((option) => {
          const selected = language === option.value;
          const fullLabel = option.value === 'vi' ? t('language.vietnamese') : t('language.english');
          return (
            <Pressable
              accessibilityLabel={fullLabel}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              className={`${compact ? 'min-h-10 min-w-12 px-3' : 'min-h-11 flex-1 px-5'} items-center justify-center rounded-xl active:opacity-75`}
              key={option.value}
              onPress={() => setLanguage(option.value)}
              style={{ backgroundColor: selected ? colors.primary : 'transparent' }}
            >
              <Text
                className="text-sm font-black tracking-wide"
                style={{ color: selected ? colors.onPrimary : colors.textMuted }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!compact ? (
        <Text accessibilityLiveRegion="polite" className="text-center text-xs" style={{ color: colors.textMuted }}>
          {t('language.current', { language: currentLanguage })}
        </Text>
      ) : null}
    </View>
  );
}
