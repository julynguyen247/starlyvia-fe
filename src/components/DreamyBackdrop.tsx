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
      <View style={[styles.dot, styles.dotPrimary, { backgroundColor: colors.primary }]} />
      <View style={[styles.dot, styles.dotAccent, { backgroundColor: colors.accent }]} />
      <View style={[styles.dot, styles.dotWarm, { backgroundColor: colors.tertiary }]} />
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
  dot: { borderRadius: 99, opacity: 0.34, position: 'absolute' },
  dotAccent: { height: 7, right: 34, top: 34, width: 7 },
  dotPrimary: { height: 11, right: 54, top: 54, width: 11 },
  dotWarm: { height: 5, right: 24, top: 70, width: 5 },
});
