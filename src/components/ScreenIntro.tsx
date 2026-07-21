import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme/tokens';
import { TravelScene, type TravelSceneName } from './TravelScene';

type Props = {
  title: string;
  subtitle: string;
  icon?: keyof typeof Ionicons.glyphMap;
  scene?: TravelSceneName;
};

export function ScreenIntro({ title, subtitle, icon, scene }: Props) {
  return (
    <View style={styles.container}>
      {scene ? (
        <TravelScene scene={scene} size={78} style={styles.scene} />
      ) : icon ? (
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.icon}>
          <Ionicons color={colors.primary} name={icon} size={22} />
        </View>
      ) : null}
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.md },
  copy: { flex: 1, gap: spacing.sm },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  scene: { marginHorizontal: -spacing.sm, marginVertical: -spacing.md },
  subtitle: { color: colors.textMuted, fontSize: typography.body, lineHeight: 24 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '900', letterSpacing: -0.6 },
});
