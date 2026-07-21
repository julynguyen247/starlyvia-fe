import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadows, spacing, typography } from '../theme/tokens';
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
  return (
    <Pressable
      accessibilityLabel={`${group.name}. ${group.description || `${group.type.replace('_', ' ').toLowerCase()} travel group`}. Open travel circle.`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.icon}>
        <Ionicons color={colors.primary} name={groupIcons[group.type]} size={24} />
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={2} style={styles.name}>{group.name}</Text>
        <Text numberOfLines={2} style={styles.description}>
          {group.description || `${group.type.replace('_', ' ').toLowerCase()} travel group`}
        </Text>
      </View>
      <Ionicons color={colors.textMuted} name="chevron-forward" size={20} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    ...shadows,
  },
  copy: { flex: 1, gap: spacing.xs },
  description: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  name: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
