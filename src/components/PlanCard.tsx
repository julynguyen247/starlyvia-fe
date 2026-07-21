import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamilies, radius, spacing, stickerPalette, stickerShadows, typography } from '../theme/tokens';
import type { Plan } from '../types/api';
import { formatDateRange } from '../utils/format';
import { Chip } from './Chip';
import { TravelScene } from './TravelScene';

const statusTone: Record<Plan['status'], 'neutral' | 'success' | 'warning' | 'danger'> = {
  DRAFT: 'neutral',
  PLANNED: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
};

const statusColors: Record<Plan['status'], string> = {
  DRAFT: stickerPalette.blue,
  PLANNED: stickerPalette.yellow,
  COMPLETED: stickerPalette.green,
  CANCELLED: stickerPalette.coral,
};

export function PlanCard({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  return (
    <Pressable
      accessibilityLabel={`${plan.planName}. ${plan.status}. ${formatDateRange(plan.planStartDate, plan.planEndDate)}. ${plan.stops.length} ${plan.stops.length === 1 ? 'stop' : 'stops'}. Open itinerary.`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: statusColors[plan.status] }, pressed && styles.pressed]}
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.ticketNotch, styles.ticketNotchLeft]} />
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[styles.ticketNotch, styles.ticketNotchRight]} />
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.routeStrip}>
        <View style={styles.routeIcon}>
          <Ionicons color={colors.onPrimary} name="airplane" size={15} />
        </View>
        <Text style={styles.routeLabel}>TRIP BOARD</Text>
        <View style={styles.routeLine} />
        <Ionicons color={colors.primary} name="location" size={19} />
      </View>
      <View style={styles.topRow}>
        <Chip label={plan.status} tone={statusTone[plan.status]} />
        <Text style={styles.date}>{formatDateRange(plan.planStartDate, plan.planEndDate)}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.copy}>
          <Text numberOfLines={2} style={styles.name}>{plan.planName}</Text>
          <Text numberOfLines={3} style={styles.description}>{plan.planDescription}</Text>
        </View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.artSticker}>
          <TravelScene scene="itinerary" size={98} />
          <Ionicons color={colors.onSticker} name="sparkles" size={19} style={styles.artSparkle} />
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons color={colors.onSticker} name="location-outline" size={17} />
          <Text style={styles.metaText}>{plan.stops.length} {plan.stops.length === 1 ? 'stop' : 'stops'}</Text>
        </View>
        <View style={styles.boardSticker}>
          <Ionicons color={colors.onSticker} name="map-outline" size={15} />
          <Text style={styles.boardStickerText}>TRAVEL CANVAS</Text>
        </View>
        <View style={styles.arrowWell}>
          <Ionicons color={colors.onSticker} name="arrow-forward" size={18} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arrowWell: {
    alignItems: 'center',
    backgroundColor: colors.stickerGlass,
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  artSparkle: { position: 'absolute', right: 2, top: 1 },
  artSticker: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.stickerGlass,
    borderColor: colors.onSticker,
    borderRadius: radius.lg,
    borderWidth: 2,
    height: 104,
    justifyContent: 'center',
    transform: [{ rotate: '3deg' }],
    width: 104,
  },
  body: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.onSticker,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.md,
    minHeight: 274,
    padding: spacing.lg,
    ...stickerShadows,
  },
  copy: { flex: 1, gap: spacing.sm, minWidth: 170 },
  date: { color: colors.onStickerMuted, flexShrink: 1, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '800', textAlign: 'right' },
  boardSticker: { alignItems: 'center', backgroundColor: colors.stickerGlass, borderRadius: radius.pill, flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 7 },
  boardStickerText: { color: colors.onSticker, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.5 },
  description: { color: colors.onStickerMuted, fontSize: typography.small, lineHeight: 20 },
  footer: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  metaText: { color: colors.onSticker, fontFamily: fontFamilies.label, fontSize: typography.small, fontWeight: '800' },
  name: { color: colors.onSticker, fontFamily: fontFamilies.display, fontSize: typography.title, fontWeight: '900', letterSpacing: -0.6, lineHeight: 31 },
  pressed: { opacity: 0.84, transform: [{ translateY: 2 }, { scale: 0.99 }] },
  routeIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  routeLine: {
    borderColor: colors.accent,
    borderStyle: 'dashed',
    borderTopWidth: 2,
    flex: 1,
  },
  routeLabel: { color: colors.heroText, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.8 },
  routeStrip: {
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: radius.md,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
    padding: spacing.sm,
  },
  ticketNotch: { backgroundColor: colors.background, borderRadius: radius.pill, height: 22, position: 'absolute', top: '54%', width: 22 },
  ticketNotchLeft: { left: -11 },
  ticketNotchRight: { right: -11 },
  topRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
});
