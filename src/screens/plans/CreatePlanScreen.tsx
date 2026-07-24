import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { Chip } from '../../components/Chip';
import { ResponsiveFieldRow } from '../../components/ResponsiveFieldRow';
import { Screen } from '../../components/Screen';
import { ScreenIntro } from '../../components/ScreenIntro';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { planService } from '../../services/planService';
import { radius, spacing, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
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
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const styles = useThemedStyles(createStyles);
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
      name: !name.trim() ? t('createPlan.nameError') : undefined,
      description: !description.trim() ? t('createPlan.descriptionError') : undefined,
      startDate: !isIsoDate(startDate) ? t('createPlan.dateError') : undefined,
      endDate: !isIsoDate(endDate) || endDate < startDate ? t('createPlan.endDateError') : undefined,
      startTime: !isTime(startTime) ? t('createPlan.timeError') : undefined,
      endTime: !isTime(endTime) || (startDate === endDate && endTime <= startTime) ? t('createPlan.endTimeError') : undefined,
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
      Alert.alert(t('createPlan.submitError'), getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen safeTop={false}>
      <View accessibilityLabel={t('createPlan.planningWith', { name: groupName })} accessible style={styles.groupTicket}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.ticketIcon}
        >
          <Ionicons color={colors.accent} name="ticket-outline" size={20} />
        </View>
        <View style={styles.ticketCopy}>
          <Text style={styles.ticketEyebrow}>{t('card.travelCircle')}</Text>
          <Text style={styles.ticketName}>{groupName}</Text>
        </View>
      </View>
      <ScreenIntro
        scene="itinerary"
        subtitle={t('createPlan.subtitle')}
        title={t('createPlan.title')}
      />
      <View style={styles.formCard}>
        <View style={styles.sectionHeading}>
          <Ionicons color={colors.primary} name="sparkles-outline" size={19} />
          <Text accessibilityRole="header" style={styles.sectionTitle}>{t('createPlan.basics')}</Text>
        </View>
        <AppInput editable={!submitting} error={errors.name} label={t('createPlan.name')} maxLength={100} onChangeText={setName} placeholder={t('createPlan.namePlaceholder')} value={name} />
        <AppInput editable={!submitting} error={errors.description} label={t('createPlan.description')} maxLength={500} multiline onChangeText={setDescription} placeholder={t('createPlan.descriptionPlaceholder')} value={description} />
      </View>

      <View style={styles.formCard}>
        <View style={styles.sectionHeading}>
          <Ionicons color={colors.primary} name="calendar-outline" size={19} />
          <Text accessibilityRole="header" style={styles.sectionTitle}>{t('createPlan.dates')}</Text>
        </View>
        <ResponsiveFieldRow>
          <AppInput editable={!submitting} error={errors.startDate} keyboardType="numbers-and-punctuation" label={t('createPlan.startDate')} onChangeText={setStartDate} placeholder="YYYY-MM-DD" value={startDate} />
          <AppInput editable={!submitting} error={errors.endDate} keyboardType="numbers-and-punctuation" label={t('createPlan.endDate')} onChangeText={setEndDate} placeholder="YYYY-MM-DD" value={endDate} />
        </ResponsiveFieldRow>
        <ResponsiveFieldRow>
          <AppInput editable={!submitting} error={errors.startTime} keyboardType="numbers-and-punctuation" label={t('createPlan.startTime')} onChangeText={setStartTime} placeholder="09:00" value={startTime} />
          <AppInput editable={!submitting} error={errors.endTime} keyboardType="numbers-and-punctuation" label={t('createPlan.endTime')} onChangeText={setEndTime} placeholder="18:00" value={endTime} />
        </ResponsiveFieldRow>
      </View>

      <View style={styles.formCard}>
        <View style={styles.sectionHeading}>
          <Ionicons color={colors.primary} name="flag-outline" size={19} />
          <Text accessibilityRole="header" style={styles.sectionTitle}>{t('createPlan.ready')}</Text>
        </View>
        <Text style={styles.sectionCopy}>{t('createPlan.readyCopy')}</Text>
        <View style={styles.statusField}>
          <Text style={styles.label}>{t('createPlan.status')}</Text>
          <View style={styles.chips}>
            <Chip label={t('createPlan.draft')} onPress={() => setStatus('DRAFT')} selected={status === 'DRAFT'} />
            <Chip label={t('createPlan.planned')} onPress={() => setStatus('PLANNED')} selected={status === 'PLANNED'} />
          </View>
        </View>
      </View>
      <AppButton label={t('createPlan.save')} loading={submitting} onPress={() => void submit()} />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  formCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, padding: spacing.lg },
  groupTicket: { alignItems: 'center', alignSelf: 'stretch', backgroundColor: colors.accentSoft, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  label: { color: colors.text, fontSize: typography.small, fontWeight: '700' },
  sectionCopy: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  sectionHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '900' },
  statusField: { gap: spacing.sm },
  ticketCopy: { flex: 1, gap: 2 },
  ticketEyebrow: { color: colors.accentText, fontSize: typography.caption, fontWeight: '900', letterSpacing: 1 },
  ticketIcon: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, height: 44, justifyContent: 'center', width: 44 },
  ticketName: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  });
}
