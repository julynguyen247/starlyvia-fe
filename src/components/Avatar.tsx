import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/tokens';
import { initials } from '../utils/format';

type Props = {
  name: string;
  uri?: string | null;
  size?: number;
};

export function Avatar({ name, uri, size = 44 }: Props) {
  if (uri) {
    return <Image accessibilityLabel={`${name}'s avatar`} source={{ uri }} style={{ borderRadius: size / 2, height: size, width: size }} />;
  }

  return (
    <View accessibilityLabel={`${name}'s avatar`} accessible style={[styles.fallback, { borderRadius: size / 2, height: size, width: size }]}>
      <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: 'center', backgroundColor: colors.primarySoft, justifyContent: 'center' },
  initials: { color: colors.primaryDark, fontWeight: '800' },
});
