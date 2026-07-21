import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { Chip } from '../../components/Chip';
import { ResponsiveFieldRow } from '../../components/ResponsiveFieldRow';
import { Screen } from '../../components/Screen';
import { ScreenIntro } from '../../components/ScreenIntro';
import { getErrorMessage } from '../../services/apiClient';
import { planService } from '../../services/planService';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { PlanStatus } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';
import { isIsoDate, isTime } from '../../utils/validation';

type Errors = Partial<Record<'name' | 'description' | 'startDate' | 'endDate' | 'startTime' | 'endTime', string>>;

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function CreatePlanScreen({ navigation, route }: RootScreenProps<'CreatePlan'>) {
  const { groupId, groupName } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(today());
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [status, setStatus] = useState<PlanStatus>('DRAFT');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const nextErrors: Errors = {
      name: !name.trim() ? 'Name the itinerary.' : undefined,
      description: !description.trim() ? 'Add a short description.' : undefined,
      startDate: !isIsoDate(startDate) ? 'Use YYYY-MM-DD.' : undefined,
      endDate: !isIsoDate(endDate) || endDate < startDate ? 'Use a date on or after the start.' : undefined,
      startTime: !isTime(startTime) ? 'Use 24-hour HH:mm.' : undefined,
      endTime: !isTime(endTime) || (startDate === endDate && endTime <= startTime) ? 'Use a time after the start.' : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      const plan = await planService.create({
        groupId,
        planDescription: description.trim(),
        planEndDate: endDate,
        planEndTime: `${endTime}:00`,
        planName: name.trim(),
        planStartDate: startDate,
        planStartTime: `${startTime}:00`,
        status,
        stops: [],
      });
      navigation.replace('PlanDetail', { planId: plan.id });
    } catch (error) {
      Alert.alert('Could not create itinerary', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen safeTop={false}>
      <View style={styles.groupPill}><Text style={styles.groupPillText}>Planning with {groupName}</Text></View>
      <ScreenIntro
        icon="map-outline"
        subtitle="Start with the when and why. Add places after saving."
        title="Shape the next adventure."
      />
      <AppInput error={errors.name} label="Itinerary name" maxLength={100} onChangeText={setName} placeholder="A day in Da Nang" value={name} />
      <AppInput error={errors.description} label="Description" maxLength={500} multiline onChangeText={setDescription} placeholder="Beaches, food, and a little room to wander." value={description} />
      <ResponsiveFieldRow>
        <AppInput error={errors.startDate} keyboardType="numbers-and-punctuation" label="Start date" onChangeText={setStartDate} placeholder="YYYY-MM-DD" value={startDate} />
        <AppInput error={errors.endDate} keyboardType="numbers-and-punctuation" label="End date" onChangeText={setEndDate} placeholder="YYYY-MM-DD" value={endDate} />
      </ResponsiveFieldRow>
      <ResponsiveFieldRow>
        <AppInput error={errors.startTime} keyboardType="numbers-and-punctuation" label="Start time" onChangeText={setStartTime} placeholder="09:00" value={startTime} />
        <AppInput error={errors.endTime} keyboardType="numbers-and-punctuation" label="End time" onChangeText={setEndTime} placeholder="18:00" value={endTime} />
      </ResponsiveFieldRow>
      <View style={styles.statusField}>
        <Text style={styles.label}>Plan status</Text>
        <View style={styles.chips}>
          <Chip label="Draft" onPress={() => setStatus('DRAFT')} selected={status === 'DRAFT'} />
          <Chip label="Ready to go" onPress={() => setStatus('PLANNED')} selected={status === 'PLANNED'} />
        </View>
      </View>
      <AppButton label="Save and add places" loading={submitting} onPress={() => void submit()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  groupPill: { alignSelf: 'flex-start', backgroundColor: colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  groupPillText: { color: colors.primaryDark, fontSize: typography.caption, fontWeight: '800' },
  label: { color: colors.text, fontSize: typography.small, fontWeight: '700' },
  statusField: { gap: spacing.sm },
});
