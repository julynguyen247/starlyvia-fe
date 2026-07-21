import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamilies, radius, spacing, stickerPalette, stickerShadows, typography } from '../theme/tokens';
import type { Group } from '../types/api';

const groupIcons: Record<Group['type'], keyof typeof Ionicons.glyphMap> = {
  SOLO: 'person-outline',
  COUPLE: 'heart-outline',
  FRIENDS: 'people-outline',
  FAMILY: 'home-outline',
  DOUBLE_DATE: 'wine-outline',
  CUSTOM: 'sparkles-outline',
};

const groupColors: Record<Group['type'], string> = {
  SOLO: stickerPalette.green,
  COUPLE: stickerPalette.coral,
  FRIENDS: stickerPalette.blue,
  FAMILY: stickerPalette.yellow,
  DOUBLE_DATE: stickerPalette.violet,
  CUSTOM: stickerPalette.orange,
};

export function GroupCard({ group, onPress }: { group: Group; onPress: () => void }) {
  const groupTypeLabel = group.type.replace('_', ' ').toLowerCase();

  return (
    <Pressable
      accessibilityLabel={`${group.name}. ${group.description || `${group.type.replace('_', ' ').toLowerCase()} travel group`}. Open travel circle.`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, { backgroundColor: groupColors[group.type] }, pressed && styles.pressed]}
    >
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.canvas}>
        <Ionicons color={colors.stickerInkFaint} name={groupIcons[group.type]} size={126} style={styles.canvasIcon} />
        <Ionicons color={colors.stickerInkSoft} name="airplane" size={31} style={styles.canvasPlane} />
        <Ionicons color={colors.stickerInkSoft} name="location" size={24} style={styles.canvasPin} />
      </View>
      <View style={styles.topRow}>
        <View style={styles.typeSticker}>
          <Ionicons color={colors.onSticker} name={groupIcons[group.type]} size={17} />
          <Text style={styles.typeLabel}>{groupTypeLabel}</Text>
        </View>
        <View style={styles.arrowWell}>
          <Ionicons color={colors.onSticker} name="open-outline" size={19} />
        </View>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{group.name}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {group.description || `${groupTypeLabel} travel group`}
        </Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.footerLabel}>
          <Ionicons color={colors.onSticker} name="map-outline" size={16} />
          <Text style={styles.footerText}>Shared travel canvas</Text>
        </View>
        <Ionicons color={colors.onSticker} name="sparkles" size={20} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arrowWell: {
    alignItems: 'center',
    backgroundColor: colors.stickerGlass,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  canvas: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  canvasIcon: { bottom: 3, position: 'absolute', right: 12 },
  canvasPin: { bottom: 23, left: 20, position: 'absolute', transform: [{ rotate: '-12deg' }] },
  canvasPlane: { opacity: 0.84, position: 'absolute', right: 106, top: 48, transform: [{ rotate: '16deg' }] },
  card: {
    borderColor: colors.onSticker,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.md,
    minHeight: 178,
    padding: spacing.lg,
    ...stickerShadows,
  },
  copy: { gap: spacing.xs, maxWidth: '78%' },
  description: { color: colors.onSticker, fontSize: typography.small, fontWeight: '500', lineHeight: 20 },
  footer: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between', marginTop: 'auto' },
  footerLabel: {
    alignItems: 'center',
    backgroundColor: colors.stickerGlass,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  footerText: { color: colors.onSticker, flexShrink: 1, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '800', letterSpacing: 0.35 },
  name: { color: colors.onSticker, fontFamily: fontFamilies.display, fontSize: typography.heading, fontWeight: '900', letterSpacing: -0.4 },
  pressed: { opacity: 0.84, transform: [{ translateY: 2 }, { scale: 0.99 }] },
  topRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  typeLabel: { color: colors.onSticker, flexShrink: 1, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  typeSticker: { alignItems: 'center', backgroundColor: colors.stickerGlass, borderRadius: radius.pill, flexDirection: 'row', gap: spacing.xs, maxWidth: '78%', paddingHorizontal: spacing.sm, paddingVertical: 7 },
});
