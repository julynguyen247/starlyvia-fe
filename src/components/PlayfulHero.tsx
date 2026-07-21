import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors, radius, spacing, stickerShadows, typography } from '../theme/tokens';
import { TravelScene, type TravelSceneName } from './TravelScene';

type Props = {
  title: string;
  description?: string;
  eyebrow?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  scene?: TravelSceneName;
  badge?: ReactNode;
  children?: ReactNode;
};

export function PlayfulHero({ title, description, eyebrow, icon, scene, badge, children }: Props) {
  const reducedMotion = useReducedMotion();
  const reveal = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducedMotion !== false) {
      reveal.setValue(1);
      return;
    }

    reveal.setValue(0);
    const animation = Animated.spring(reveal, {
      damping: 12,
      mass: 0.7,
      stiffness: 150,
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [reducedMotion, reveal]);

  return (
    <View style={styles.hero}>
      <Animated.View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[
          styles.decorations,
          {
            opacity: reveal,
            transform: [
              { translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) },
              { scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.84, 1] }) },
            ],
          },
        ]}
      >
        <Ionicons color={colors.primary} name="sparkles" size={25} style={styles.sparkles} />
        <Ionicons color={colors.accent} name="airplane" size={34} style={styles.plane} />
        <Ionicons color={colors.heroDecoration} name="location-outline" size={50} style={styles.pin} />
      </Animated.View>
      <View style={styles.topRow}>
        <View style={styles.copy}>
          {icon ? (
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.icon}>
              <Ionicons color={colors.onPrimary} name={icon} size={27} />
            </View>
          ) : null}
          {eyebrow ? <View style={styles.eyebrowPill}><Text style={styles.eyebrow}>{eyebrow}</Text></View> : null}
          {badge ? <View style={styles.badge}>{badge}</View> : null}
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
        {scene ? <TravelScene animated scene={scene} size={148} style={styles.scene} /> : null}
      </View>
      {children ? <View style={styles.actions}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'flex-start', marginTop: spacing.sm },
  badge: { alignSelf: 'flex-start' },
  copy: { flex: 1, gap: spacing.sm, minWidth: 176 },
  decorations: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  description: { color: colors.heroTextMuted, fontSize: typography.body, lineHeight: 23 },
  eyebrow: { color: colors.onAccent, fontSize: typography.caption, fontWeight: '900', letterSpacing: 1.1 },
  eyebrowPill: { alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 },
  hero: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.heroDecoration,
    borderRadius: radius.xl,
    borderWidth: 2,
    gap: spacing.sm,
    overflow: 'hidden',
    padding: spacing.xl,
    ...stickerShadows,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    height: 52,
    justifyContent: 'center',
    marginBottom: spacing.sm,
    width: 52,
  },
  pin: { bottom: -12, left: -7, opacity: 0.3, position: 'absolute', transform: [{ rotate: '14deg' }] },
  plane: { opacity: 0.68, position: 'absolute', right: 18, top: 20, transform: [{ rotate: '13deg' }] },
  scene: { marginHorizontal: -spacing.md, marginVertical: -spacing.lg },
  sparkles: { position: 'absolute', right: 88, top: 36 },
  title: { color: colors.heroText, fontSize: typography.title, fontWeight: '900', lineHeight: 33 },
  topRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
});
