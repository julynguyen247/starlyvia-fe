import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { shadows, type ThemeColors } from '../theme/tokens';
import { useThemedStyles } from '../theme/useThemedStyles';
import { initials } from '../utils/format';

type Props = {
  name: string;
  uri?: string | null;
  size?: number;
};

export function Avatar({ name, uri, size = 44 }: Props) {
  const styles = useThemedStyles(createStyles);
  const [failedUri, setFailedUri] = useState<string | null>(null);

  if (uri && failedUri !== uri) {
    return (
      <Image
        accessibilityLabel={`${name}'s avatar`}
        onError={() => setFailedUri(uri)}
        source={{ uri }}
        style={[styles.avatar, { borderRadius: size / 2, height: size, width: size }]}
      />
    );
  }

  return (
    <View accessibilityLabel={`${name}'s avatar`} accessible style={[styles.avatar, styles.fallback, { borderRadius: size / 2, height: size, width: size }]}>
      <Text style={[styles.initials, { fontSize: size * 0.34 }]}>{initials(name)}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  avatar: { borderColor: colors.surface, borderWidth: 2, ...shadows },
  fallback: { alignItems: 'center', backgroundColor: colors.primarySoft, justifyContent: 'center' },
  initials: { color: colors.primary, fontWeight: '800' },
  });
}
