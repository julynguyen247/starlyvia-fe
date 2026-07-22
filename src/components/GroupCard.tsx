import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';
import { fontFamilies, radius, spacing, stickerPalette, stickerShadows, typography, type ThemeColors } from '../theme/tokens';
import { useThemedStyles } from '../theme/useThemedStyles';
import type { Group } from '../types/api';

const groupIcons: Record<Group['type'], keyof typeof Ionicons.glyphMap> = {
  SOLO: 'person-outline',
  COUPLE: 'heart-outline',
  FRIENDS: 'people-outline',
  FAMILY: 'home-outline',
  DOUBLE_DATE: 'wine-outline',
  CUSTOM: 'sparkles-outline',
};

export function GroupCard({ group, onPress }: { group: Group; onPress: () => void }) {
  const { colors, resolvedScheme } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const groupTypeLabel = group.type.replace('_', ' ').toLowerCase();
  const usesStickerSurface = resolvedScheme === 'dark';

  return (
    <Pressable
      accessibilityLabel={`${group.name}. ${groupTypeLabel} travel circle.${group.description ? ` ${group.description}.` : ''} Open travel circle.`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        usesStickerSurface ? styles.cardDark : styles.cardLight,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.typeSticker}>
          <View style={styles.typeIcon}>
            <Ionicons color={colors.onSticker} name={groupIcons[group.type]} size={14} />
          </View>
          <Text style={styles.typeLabel}>{groupTypeLabel}</Text>
        </View>
        <View style={styles.arrowWell}>
          <Ionicons color={colors.onSticker} name="open-outline" size={19} />
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, usesStickerSurface && styles.copyMutedDark]}>TRAVEL CIRCLE</Text>
          <Text numberOfLines={2} style={[styles.name, usesStickerSurface && styles.copyDark]}>{group.name}</Text>
          <Text numberOfLines={2} style={[styles.description, usesStickerSurface && styles.copyMutedDark]}>
            {group.description || `${groupTypeLabel} travel group`}
          </Text>
        </View>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.iconStack}>
          <View style={styles.iconBackplate} />
          <View style={styles.iconSticker}>
            <Ionicons color={colors.onSticker} name={groupIcons[group.type]} size={37} />
          </View>
          <View style={styles.miniSticker}>
            <Ionicons color={colors.onSticker} name="airplane" size={14} />
          </View>
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
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  body: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    minHeight: 170,
    padding: spacing.lg,
    ...stickerShadows,
  },
  cardDark: { backgroundColor: stickerPalette.orange, borderColor: colors.stickerInkSoft },
  cardLight: { borderTopColor: stickerPalette.orange, borderTopWidth: 4 },
  copy: { flex: 1, gap: spacing.xs, minWidth: 0 },
  copyDark: { color: colors.onSticker },
  copyMutedDark: { color: colors.onStickerMuted },
  description: { color: colors.textMuted, fontSize: typography.small, fontWeight: '600', lineHeight: 20 },
  eyebrow: { color: colors.textMuted, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '900', letterSpacing: 1 },
  iconBackplate: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    bottom: -5,
    left: 5,
    position: 'absolute',
    right: -5,
    top: 5,
    transform: [{ rotate: '4deg' }],
  },
  iconStack: { height: 76, marginRight: 2, width: 76 },
  iconSticker: {
    alignItems: 'center',
    backgroundColor: colors.stickerGlass,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    height: 70,
    justifyContent: 'center',
    transform: [{ rotate: '-3deg' }],
    width: 70,
    ...stickerShadows,
  },
  miniSticker: {
    alignItems: 'center',
    backgroundColor: stickerPalette.yellow,
    borderColor: colors.stickerOutline,
    borderRadius: radius.pill,
    borderWidth: 1,
    bottom: -2,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: -6,
    transform: [{ rotate: '9deg' }],
    width: 28,
  },
  name: { color: colors.text, fontFamily: fontFamilies.display, fontSize: typography.heading, fontWeight: '900', letterSpacing: -0.4 },
  pressed: { opacity: 0.84, transform: [{ translateY: 2 }, { scale: 0.99 }] },
  topRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  typeLabel: { color: colors.onSticker, flexShrink: 1, fontFamily: fontFamilies.label, fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.8, textTransform: 'uppercase' },
  typeIcon: { alignItems: 'center', backgroundColor: stickerPalette.orange, borderRadius: radius.pill, height: 25, justifyContent: 'center', width: 25 },
  typeSticker: { alignItems: 'center', backgroundColor: colors.stickerGlass, borderRadius: radius.pill, flexDirection: 'row', gap: spacing.xs, maxWidth: '78%', paddingHorizontal: 6, paddingRight: spacing.md, paddingVertical: 5 },
  });
}
