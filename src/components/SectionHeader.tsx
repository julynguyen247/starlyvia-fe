import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontFamilies, spacing, typography } from '../theme/tokens';

type Props = {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function SectionHeader({ title, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <Text accessibilityRole="header" style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityLabel={actionLabel} accessibilityRole="button" onPress={onAction} style={styles.actionButton}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: { color: colors.primary, fontFamily: fontFamilies.display, fontSize: typography.small, fontWeight: '800' },
  actionButton: { alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingHorizontal: spacing.sm },
  row: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
  title: { color: colors.text, flex: 1, fontFamily: fontFamilies.display, fontSize: typography.heading, fontWeight: '900', letterSpacing: -0.35, minWidth: 180 },
});
