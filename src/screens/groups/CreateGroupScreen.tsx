import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { Screen } from '../../components/Screen';
import { ScreenIntro } from '../../components/ScreenIntro';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { radius, spacing, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { GroupType } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';

const groupTypes: {
  icon: keyof typeof Ionicons.glyphMap;
  value: GroupType;
}[] = [
  { icon: 'people-outline', value: 'FRIENDS' },
  { icon: 'home-outline', value: 'FAMILY' },
  { icon: 'heart-outline', value: 'COUPLE' },
  { icon: 'wine-outline', value: 'DOUBLE_DATE' },
  { icon: 'person-outline', value: 'SOLO' },
  { icon: 'sparkles-outline', value: 'CUSTOM' },
];

export function CreateGroupScreen({ navigation }: RootScreenProps<'CreateGroup'>) {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const styles = useThemedStyles(createStyles);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupType>('FRIENDS');
  const [nameError, setNameError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim()) {
      setNameError(t('createGroup.nameError'));
      return;
    }
    setNameError(undefined);
    setSubmitError(undefined);
    setSubmitting(true);
    try {
      const group = await groupService.create({
        description: description.trim() || undefined,
        name: name.trim(),
        type,
      });
      navigation.replace('GroupDetail', { groupId: group.id });
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen safeTop={false}>
      <ScreenIntro
        scene="crew"
        subtitle={t('createGroup.subtitle')}
        title={t('createGroup.title')}
      />
      <AppInput
        autoCapitalize="words"
        editable={!submitting}
        error={nameError}
        icon="people-outline"
        label={t('createGroup.name')}
        maxLength={80}
        onChangeText={(value) => {
          setName(value);
          setNameError(undefined);
          setSubmitError(undefined);
        }}
        placeholder={t('createGroup.namePlaceholder')}
        returnKeyType="next"
        value={name}
      />
      <AppInput
        editable={!submitting}
        icon="chatbubble-ellipses-outline"
        label={t('createGroup.description')}
        maxLength={240}
        multiline
        onChangeText={(value) => {
          setDescription(value);
          setSubmitError(undefined);
        }}
        placeholder={t('createGroup.descriptionPlaceholder')}
        value={description}
      />
      <View style={styles.field}>
        <Text style={styles.label}>{t('createGroup.type')}</Text>
        <View style={styles.choices}>
          {groupTypes.map((item) => (
            <Pressable
              accessibilityLabel={t('createGroup.typeLabel', { type: t(`group.${item.value}`) })}
              accessibilityRole="radio"
              accessibilityState={{ checked: type === item.value, disabled: submitting }}
              disabled={submitting}
              key={item.value}
              onPress={() => {
                setType(item.value);
                setSubmitError(undefined);
              }}
              style={({ pressed }) => [
                styles.choice,
                type === item.value && styles.choiceSelected,
                pressed && styles.choicePressed,
                submitting && styles.choiceDisabled,
              ]}
            >
              <View style={[styles.choiceIcon, type === item.value && styles.choiceIconSelected]}>
                <Ionicons
                  color={type === item.value ? colors.onPrimary : colors.primary}
                  name={item.icon}
                  size={21}
                />
              </View>
              <Text style={[styles.choiceLabel, type === item.value && styles.choiceLabelSelected]}>
                {t(`group.${item.value}`)}
              </Text>
              {type === item.value ? (
                <Ionicons color={colors.primary} name="checkmark-circle" size={20} />
              ) : null}
            </Pressable>
          ))}
        </View>
      </View>
      {submitError ? (
        <View accessibilityLiveRegion="assertive" style={styles.errorNotice}>
          <Ionicons color={colors.dangerText} name="alert-circle-outline" size={21} />
          <View style={styles.errorCopy}>
            <Text style={styles.errorTitle}>{t('createGroup.submitError')}</Text>
            <Text style={styles.errorMessage}>{submitError}</Text>
          </View>
        </View>
      ) : null}
      <AppButton label={t('createGroup.submit')} loading={submitting} onPress={() => void submit()} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  choice: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: 145,
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.sm,
    minHeight: 58,
    padding: spacing.sm,
  },
  choiceDisabled: { opacity: 0.58 },
  choiceIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  choiceIconSelected: { backgroundColor: colors.primary },
  choiceLabel: { color: colors.text, flex: 1, fontSize: typography.small, fontWeight: '800' },
  choiceLabelSelected: { color: colors.text },
  choicePressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  choiceSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  errorCopy: { flex: 1, gap: spacing.xs },
  errorMessage: { color: colors.dangerText, fontSize: typography.small, lineHeight: 20 },
  errorNotice: {
    alignItems: 'flex-start',
    backgroundColor: colors.dangerSoft,
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  errorTitle: { color: colors.dangerText, fontSize: typography.small, fontWeight: '800' },
  field: { gap: spacing.sm },
  label: { color: colors.text, fontSize: typography.small, fontWeight: '700' },
  });
}
