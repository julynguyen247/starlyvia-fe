import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { Screen } from '../../components/Screen';
import { ScreenIntro } from '../../components/ScreenIntro';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { radius, spacing, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { GroupType } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';

const groupTypes: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: GroupType;
}[] = [
  { icon: 'people-outline', label: 'Friends', value: 'FRIENDS' },
  { icon: 'home-outline', label: 'Family', value: 'FAMILY' },
  { icon: 'heart-outline', label: 'Couple', value: 'COUPLE' },
  { icon: 'wine-outline', label: 'Double date', value: 'DOUBLE_DATE' },
  { icon: 'person-outline', label: 'Solo', value: 'SOLO' },
  { icon: 'sparkles-outline', label: 'Custom', value: 'CUSTOM' },
];

export function CreateGroupScreen({ navigation }: RootScreenProps<'CreateGroup'>) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupType>('FRIENDS');
  const [nameError, setNameError] = useState<string>();
  const [submitError, setSubmitError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim()) {
      setNameError('Give your travel circle a name.');
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
        subtitle="Create a shared home for your people and plans."
        title="Who are you traveling with?"
      />
      <AppInput
        autoCapitalize="words"
        editable={!submitting}
        error={nameError}
        icon="people-outline"
        label="Group name"
        maxLength={80}
        onChangeText={(value) => {
          setName(value);
          setNameError(undefined);
          setSubmitError(undefined);
        }}
        placeholder="Summer escape"
        returnKeyType="next"
        value={name}
      />
      <AppInput
        editable={!submitting}
        icon="chatbubble-ellipses-outline"
        label="Description"
        maxLength={240}
        multiline
        onChangeText={(value) => {
          setDescription(value);
          setSubmitError(undefined);
        }}
        placeholder="What are you planning together?"
        value={description}
      />
      <View style={styles.field}>
        <Text style={styles.label}>Group type</Text>
        <View style={styles.choices}>
          {groupTypes.map((item) => (
            <Pressable
              accessibilityLabel={`${item.label} group type`}
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
                {item.label}
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
            <Text style={styles.errorTitle}>Could not create travel circle</Text>
            <Text style={styles.errorMessage}>{submitError}</Text>
          </View>
        </View>
      ) : null}
      <AppButton label="Create travel circle" loading={submitting} onPress={() => void submit()} />
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
