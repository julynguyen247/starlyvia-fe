import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Avatar } from '../../components/Avatar';
import { Screen } from '../../components/Screen';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../services/apiClient';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';

export function ProfileScreen() {
  const { user, signOut } = useAuth();

  function confirmSignOut() {
    Alert.alert('Sign out?', 'You can sign back in on this device anytime.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  return (
    <Screen>
      <View style={styles.intro}>
        <Avatar name={user?.username ?? 'Explorer'} size={86} uri={user?.avatarUrl} />
        <Text accessibilityRole="header" style={styles.name}>{user?.username}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Account role</Text>
          <Text style={styles.value}>{user?.role}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Text style={styles.label}>API environment</Text>
          <Text numberOfLines={1} style={styles.apiValue}>{API_BASE_URL}</Text>
        </View>
      </View>

      <View style={styles.note}>
        <Text style={styles.noteTitle}>A small privacy promise</Text>
        <Text style={styles.noteText}>Your sign-in token is stored in the device's secure credential store, never in plain app storage.</Text>
      </View>

      <AppButton label="Sign out" onPress={confirmSignOut} variant="danger" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  apiValue: { color: colors.text, flex: 1, fontSize: typography.small, fontWeight: '700', textAlign: 'right' },
  bio: { color: colors.textMuted, fontSize: typography.small, lineHeight: 21, maxWidth: 320, textAlign: 'center' },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, padding: spacing.lg, ...shadows },
  divider: { backgroundColor: colors.border, height: StyleSheet.hairlineWidth },
  email: { color: colors.textMuted, fontSize: typography.small },
  intro: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  label: { color: colors.textMuted, fontSize: typography.small },
  name: { color: colors.text, fontSize: typography.title, fontWeight: '900', marginTop: spacing.sm },
  note: { backgroundColor: colors.primarySoft, borderRadius: radius.lg, gap: spacing.sm, padding: spacing.lg },
  noteText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 21 },
  noteTitle: { color: colors.primaryDark, fontSize: typography.body, fontWeight: '800' },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, justifyContent: 'space-between' },
  value: { color: colors.primaryDark, fontSize: typography.small, fontWeight: '800' },
});
