import { Children, type ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { spacing } from '../theme/tokens';

type Props = { children: ReactNode };

const STACK_BREAKPOINT = 390;

export function ResponsiveFieldRow({ children }: Props) {
  const { fontScale, width } = useWindowDimensions();
  const stacked = width < STACK_BREAKPOINT || fontScale >= 1.3;

  return (
    <View style={[styles.row, stacked && styles.stacked]}>
      {Children.map(children, (child) => (
        <View style={[styles.field, stacked && styles.stackedField]}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', gap: spacing.md },
  stacked: { flexDirection: 'column' },
  stackedField: { flex: 0, width: '100%' },
});
