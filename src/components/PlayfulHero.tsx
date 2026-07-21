import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';

type Props = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: ReactNode;
  children?: ReactNode;
};

export function PlayfulHero({ title, description, eyebrow, icon, badge, children }: Props) {
  return (
    <View style={styles.hero}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.orbit}
      />
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.star}
      />
      {icon ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.icon}>
          <Ionicons color={colors.heroText} name={icon} size={27} />
        </View>
      ) : null}
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      {badge ? <View style={styles.badge}>{badge}</View> : null}
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start' },
  description: { color: colors.heroTextMuted, fontSize: typography.body, lineHeight: 23 },
  eyebrow: { color: colors.heroTextSubtle, fontSize: typography.caption, fontWeight: '800', letterSpacing: 1.2 },
  hero: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.xl,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.heroIconSurface,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 52,
  },
  orbit: {
    borderColor: colors.heroDecoration,
    borderRadius: 90,
    borderWidth: 1,
    height: 180,
    position: 'absolute',
    right: -55,
    top: -55,
    width: 180,
  },
  star: {
    backgroundColor: colors.accent,
    borderRadius: 7,
    height: 14,
    position: 'absolute',
    right: 34,
    top: 32,
    width: 14,
  },
  title: { color: colors.heroText, fontSize: typography.title, fontWeight: '900', lineHeight: 33 },
});
