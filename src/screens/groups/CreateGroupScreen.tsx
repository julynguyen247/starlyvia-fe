import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { Chip } from '../../components/Chip';
import { Screen } from '../../components/Screen';
import { ScreenIntro } from '../../components/ScreenIntro';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { colors, spacing, typography } from '../../theme/tokens';
import type { GroupType } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';

const groupTypes: { label: string; value: GroupType }[] = [
  { label: 'Friends', value: 'FRIENDS' },
  { label: 'Family', value: 'FAMILY' },
  { label: 'Couple', value: 'COUPLE' },
  { label: 'Double date', value: 'DOUBLE_DATE' },
  { label: 'Solo', value: 'SOLO' },
  { label: 'Custom', value: 'CUSTOM' },
];

export function CreateGroupScreen({ navigation }: RootScreenProps<'CreateGroup'>) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GroupType>('FRIENDS');
  const [nameError, setNameError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!name.trim()) {
      setNameError('Give your travel circle a name.');
      return;
    }
    setNameError(undefined);
    setSubmitting(true);
    try {
      const group = await groupService.create({
        description: description.trim() || undefined,
        name: name.trim(),
        type,
      });
      navigation.replace('GroupDetail', { groupId: group.id });
    } catch (error) {
      Alert.alert('Could not create group', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen safeTop={false}>
      <ScreenIntro
        icon="people-outline"
        subtitle="Create a shared home for your people and plans."
        title="Who are you traveling with?"
      />
      <AppInput
        autoCapitalize="words"
        error={nameError}
        label="Group name"
        maxLength={80}
        onChangeText={setName}
        placeholder="Summer escape"
        returnKeyType="next"
        value={name}
      />
      <AppInput
        label="Description"
        maxLength={240}
        multiline
        onChangeText={setDescription}
        placeholder="What are you planning together?"
        value={description}
      />
      <View style={styles.field}>
        <Text style={styles.label}>Group type</Text>
        <View style={styles.chips}>
          {groupTypes.map((item) => (
            <Chip key={item.value} label={item.label} onPress={() => setType(item.value)} selected={type === item.value} />
          ))}
        </View>
      </View>
      <AppButton label="Create travel circle" loading={submitting} onPress={() => void submit()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  field: { gap: spacing.sm },
  label: { color: colors.text, fontSize: typography.small, fontWeight: '700' },
});
