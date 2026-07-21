import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../components/AppButton';
import { Chip } from '../../components/Chip';
import { StateView } from '../../components/StateView';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';
import type { GroupInvitation } from '../../types/api';
import { relativeTime } from '../../utils/format';

export function InvitationsScreen() {
  const insets = useSafeAreaInsets();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    asRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      setInvitations(await groupService.incomingInvitations());
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function respond(invitation: GroupInvitation, accept: boolean) {
    setBusyId(invitation.id);
    try {
      if (accept) await groupService.acceptInvitation(invitation.id);
      else await groupService.rejectInvitation(invitation.id);
      setInvitations((current) => current.filter((item) => item.id !== invitation.id));
    } catch (responseError) {
      Alert.alert('Could not update invitation', getErrorMessage(responseError));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <StateView loading title="Opening invitations…" />;
  if (error && !invitations.length) {
    return (
      <StateView
        actionLabel="Try again"
        icon="cloud-offline-outline"
        message={error}
        onAction={() => void load()}
        title="Could not load invitations"
      />
    );
  }

  return (
    <FlatList
      contentContainerStyle={[
        styles.list,
        { paddingBottom: Math.max(insets.bottom, spacing.xl) },
      ]}
      data={invitations}
      keyExtractor={(invitation) => invitation.id}
      ListEmptyComponent={(
        <StateView
          icon="mail-open-outline"
          message="When someone invites you to a travel circle, it will show up here."
          title="No invitations waiting"
        />
      )}
      ListHeaderComponent={error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>
      ) : null}
      onRefresh={() => void load(true)}
      refreshing={refreshing}
      renderItem={({ item: invitation }) => (
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Chip label={invitation.status} tone={invitation.status === 'PENDING' ? 'warning' : 'neutral'} />
            <Text style={styles.time}>{relativeTime(invitation.createdAt)}</Text>
          </View>
          <Text style={styles.title}>{invitation.group.name}</Text>
          <Text style={styles.description}>{invitation.group.description || 'You have been invited to plan a trip with this circle.'}</Text>
          {invitation.status === 'PENDING' ? (
            <View style={styles.actions}>
              <AppButton compact disabled={busyId !== null} label="Decline" onPress={() => void respond(invitation, false)} style={styles.action} variant="ghost" />
              <AppButton compact label="Join group" loading={busyId === invitation.id} onPress={() => void respond(invitation, true)} style={styles.action} />
            </View>
          ) : null}
        </View>
      )}
      showsVerticalScrollIndicator={false}
      style={styles.page}
    />
  );
}

const styles = StyleSheet.create({
  action: { flex: 1 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.sm, padding: spacing.lg, ...shadows },
  description: { color: colors.textMuted, fontSize: typography.small, lineHeight: 21 },
  error: { color: colors.danger, fontSize: typography.small },
  list: { flexGrow: 1, gap: spacing.lg, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  page: { backgroundColor: colors.background, flex: 1 },
  time: { color: colors.textMuted, fontSize: typography.caption },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '900' },
  topRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
});
