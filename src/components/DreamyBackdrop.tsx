import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '../context/ThemeContext';

export function DreamyBackdrop() {
  const { colors } = useAppTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={styles.backdrop}
    >
      <Ionicons color={colors.cloudSky} name="cloud" size={224} style={styles.cloudTop} />
      <Ionicons color={colors.cloudLavender} name="cloud-outline" size={178} style={styles.cloudMiddle} />
      <Ionicons color={colors.cloudPeach} name="cloud" size={252} style={styles.cloudBottom} />
      <Ionicons color={colors.cloudGlow} name="sparkles" size={22} style={styles.sparkleTop} />
      <Ionicons color={colors.accent} name="sparkles-outline" size={18} style={styles.sparkleMiddle} />
      <Ionicons color={colors.primary} name="airplane-outline" size={20} style={styles.plane} />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    bottom: 0,
    left: 0,
    overflow: 'hidden',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cloudBottom: { bottom: -72, left: -84, opacity: 0.5, position: 'absolute' },
  cloudMiddle: { opacity: 0.35, position: 'absolute', right: -52, top: '43%' },
  cloudTop: { opacity: 0.56, position: 'absolute', right: -64, top: 54 },
  plane: { left: 28, opacity: 0.16, position: 'absolute', top: '28%', transform: [{ rotate: '-18deg' }] },
  sparkleMiddle: { left: 34, opacity: 0.48, position: 'absolute', top: '40%' },
  sparkleTop: { opacity: 0.72, position: 'absolute', right: 38, top: 40 },
});
