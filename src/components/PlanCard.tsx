import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import { fontFamilies, radius, spacing, stickerPalette, stickerShadows, typography, type ThemeColors } from '../theme/tokens';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { Plan } from '../types/api';
import { formatDateRange, formatTime } from '../utils/format';

const statusColors: Record<Plan['status'], string> = {
  DRAFT: stickerPalette.blue,
  PLANNED: stickerPalette.green,
  COMPLETED: stickerPalette.green,
  CANCELLED: stickerPalette.coral,
};

export function PlanCard({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  const { colors, resolvedScheme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const statusColor = statusColors[plan.status];
  const usesStickerSurface = resolvedScheme === 'dark';
  const contentColor = usesStickerSurface ? colors.onSticker : colors.text;
  return (
    <Pressable
      accessibilityLabel={`${plan.planName}. ${plan.status}. ${formatDateRange(plan.planStartDate, plan.planEndDate)}. Starts at ${formatTime(plan.planStartTime)}. ${plan.stops.length} ${plan.stops.length === 1 ? 'stop' : 'stops'}. Open itinerary.`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        usesStickerSurface
          ? { backgroundColor: statusColor, borderColor: colors.stickerInkSoft }
          : { backgroundColor: colors.surface, borderTopColor: statusColor, borderTopWidth: 4 },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={styles.statusText}>{plan.status}</Text>
        </View>
        <Text style={[styles.date, usesStickerSurface && styles.copyMutedDark]}>{formatDateRange(plan.planStartDate, plan.planEndDate)}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, usesStickerSurface && styles.copyMutedDark]}>NEXT ADVENTURE</Text>
          <Text numberOfLines={2} style={[styles.name, usesStickerSurface && styles.copyDark]}>{plan.planName}</Text>
          <Text numberOfLines={3} style={[styles.description, usesStickerSurface && styles.copyMutedDark]}>{plan.planDescription}</Text>
        </View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.iconStack}>
          <View style={styles.iconBackplate} />
          <View style={styles.iconSticker}>
            <Ionicons color={colors.heroText} name="airplane" size={38} style={styles.planeIcon} />
          </View>
          <View style={styles.pinSticker}>
            <Ionicons color={colors.onSticker} name="location" size={15} />
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.meta}>
          <Ionicons color={contentColor} name="location-outline" size={17} />
          <Text style={[styles.metaText, usesStickerSurface && styles.copyDark]}>{plan.stops.length} {plan.stops.length === 1 ? 'stop' : 'stops'}</Text>
        </View>
        <View style={styles.meta}>
          <Ionicons color={contentColor} name="time-outline" size={17} />
          <Text style={[styles.metaText, usesStickerSurface && styles.copyDark]}>{formatTime(plan.planStartTime)}</Text>
        </View>
        <View style={styles.arrowWell}>
          <Ionicons color={colors.onSticker} name="arrow-forward" size={18} />
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  arrowWell: {
    alignItems: 'center',
    backgroundColor: colors.stickerGlass,
    borderRadius: radius.pill,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  body: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    minHeight: 226,
    padding: spacing.lg,
    ...stickerShadows,
  },
  copy: { flex: 1, gap: spacing.xs, minWidth: 158 },
  copyDark: { color: colors.onSticker },
  copyMutedDark: { color: colors.onStickerMuted },
  date: { color: colors.textMuted, flexShrink: 1, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '800', textAlign: 'right' },
  description: { color: colors.textMuted, fontSize: typography.small, fontWeight: '600', lineHeight: 20 },
  eyebrow: { color: colors.textMuted, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '900', letterSpacing: 1 },
  footer: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between', marginTop: spacing.xs },
  iconBackplate: {
    backgroundColor: stickerPalette.orange,
    borderRadius: radius.lg,
    bottom: -5,
    left: 5,
    position: 'absolute',
    right: -5,
    top: 5,
    transform: [{ rotate: '5deg' }],
  },
  iconStack: { height: 86, marginRight: 2, width: 86 },
  iconSticker: {
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderColor: colors.stickerOutline,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 80,
    justifyContent: 'center',
    transform: [{ rotate: '-3deg' }],
    width: 80,
    ...stickerShadows,
  },
  meta: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  metaText: { color: colors.text, fontFamily: fontFamilies.label, fontSize: typography.small, fontWeight: '900' },
  name: { color: colors.text, fontFamily: fontFamilies.display, fontSize: typography.title, fontWeight: '900', letterSpacing: -0.6, lineHeight: 31 },
  pinSticker: {
    alignItems: 'center',
    backgroundColor: colors.stickerGlass,
    borderColor: colors.stickerOutline,
    borderRadius: radius.pill,
    borderWidth: 1,
    bottom: -1,
    height: 29,
    justifyContent: 'center',
    position: 'absolute',
    right: -5,
    transform: [{ rotate: '8deg' }],
    width: 29,
  },
  planeIcon: { transform: [{ rotate: '-16deg' }] },
  pressed: { opacity: 0.84, transform: [{ translateY: 2 }, { scale: 0.99 }] },
  statusBadge: { alignItems: 'center', backgroundColor: colors.stickerGlass, borderRadius: radius.pill, flexDirection: 'row', gap: spacing.xs, paddingHorizontal: spacing.sm, paddingVertical: 7 },
  statusDot: { borderColor: colors.stickerOutline, borderRadius: radius.pill, borderWidth: 1, height: 10, width: 10 },
  statusText: { color: colors.onSticker, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.7 },
  topRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  });
}
