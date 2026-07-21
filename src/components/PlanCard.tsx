import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../theme/tokens';
import type { Plan } from '../types/api';
import { formatDateRange } from '../utils/format';
import { Chip } from './Chip';

const statusTone: Record<Plan['status'], 'neutral' | 'success' | 'warning' | 'danger'> = {
  DRAFT: 'neutral',
  PLANNED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

export function PlanCard({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${plan.planName}. ${plan.status}. ${formatDateRange(plan.planStartDate, plan.planEndDate)}. ${plan.stops.length} ${plan.stops.length === 1 ? 'stop' : 'stops'}. Open itinerary.`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.topRow}>
        <Chip label={plan.status} tone={statusTone[plan.status]} />
        <Text style={styles.date}>{formatDateRange(plan.planStartDate, plan.planEndDate)}</Text>
      </View>
      <Text numberOfLines={2} style={styles.name}>{plan.planName}</Text>
      <Text numberOfLines={2} style={styles.description}>{plan.planDescription}</Text>
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons color={colors.primary} name="location-outline" size={17} />
          <Text style={styles.metaText}>{plan.stops.length} {plan.stops.length === 1 ? 'stop' : 'stops'}</Text>
        </View>
        <Ionicons color={colors.textMuted} name="arrow-forward" size={20} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg,
    ...shadows,
  },
  date: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  description: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  footer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  metaText: { color: colors.primaryDark, fontSize: typography.small, fontWeight: '700' },
  name: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
  pressed: { opacity: 0.72 },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
