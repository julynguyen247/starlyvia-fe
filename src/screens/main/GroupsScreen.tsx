import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../components/AppButton';
import { DreamyBackdrop } from '../../components/DreamyBackdrop';
import { GroupCard } from '../../components/GroupCard';
import { ScreenIntro } from '../../components/ScreenIntro';
import { StateView } from '../../components/StateView';
import { TravelScene } from '../../components/TravelScene';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';
import type { Group } from '../../types/api';
import type { TabScreenProps } from '../../types/navigation';

export function GroupsScreen({ navigation }: TabScreenProps<'Groups'>) {
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitationCount, setInvitationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [groupsError, setGroupsError] = useState<string | null>(null);
  const [invitationsError, setInvitationsError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    asRefresh ? setRefreshing(true) : setLoading(true);
    setGroupsError(null);
    setInvitationsError(null);

    const [groupResult, invitationResult] = await Promise.allSettled([
      groupService.list(),
      groupService.incomingInvitations(),
    ]);

    if (groupResult.status === 'fulfilled') {
      setGroups(groupResult.value);
    } else {
      setGroupsError(getErrorMessage(groupResult.reason));
    }

    if (invitationResult.status === 'fulfilled') {
      setInvitationCount(
        invitationResult.value.filter((item) => item.status === 'PENDING').length,
      );
    } else {
      setInvitationsError(getErrorMessage(invitationResult.reason));
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (loading) {
    return (
      <StateView
        kind="loading"
        loading
        presentation="screen"
        title="Gathering your travel circles…"
      />
    );
  }
  if (groupsError && invitationsError && !groups.length) {
    return (
      <StateView
        actionLabel="Try again"
        kind="error"
        message={groupsError}
        onAction={() => void load()}
        presentation="screen"
        title="Could not load travel circles"
      />
    );
  }

  return (
    <View style={styles.page}>
      <DreamyBackdrop />
      <FlatList
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: Math.max(insets.bottom, spacing.xl),
            paddingTop: Math.max(insets.top, spacing.lg),
          },
        ]}
        data={groups}
        keyExtractor={(group) => group.id}
        ListEmptyComponent={(
          groupsError ? (
            <StateView
              actionLabel="Try again"
              kind="error"
              message={groupsError}
              onAction={() => void load()}
              title="Travel circles are out of reach"
            />
          ) : (
            <StateView
              actionLabel="Create a group"
              kind="empty"
              message="Groups keep shared itineraries, members, and updates together."
              onAction={() => navigation.navigate('CreateGroup')}
              scene="crew"
              title="Build your first circle"
            />
          )
        )}
        ListHeaderComponent={(
          <View style={styles.header}>
            <ScreenIntro
              scene="crew"
              subtitle="The people you plan the good stuff with."
              title="Travel circles"
            />
            <View style={styles.newGroupAction}>
              <AppButton compact icon="add" label="New" onPress={() => navigation.navigate('CreateGroup')} />
            </View>

            {invitationCount > 0 ? (
              <View style={styles.ticket}>
                <TravelScene scene="invitation" size={82} style={styles.ticketScene} />
                <View style={styles.ticketCopy}>
                  <Text style={styles.ticketEyebrow}>A TRIP IS CALLING</Text>
                  <Text style={styles.ticketTitle}>
                    {invitationCount} pending {invitationCount === 1 ? 'invitation' : 'invitations'}
                  </Text>
                  <Text style={styles.ticketMessage}>See who wants you in their travel circle.</Text>
                </View>
                <AppButton
                  compact
                  icon="mail-unread-outline"
                  label="Open"
                  onPress={() => navigation.navigate('Invitations')}
                  variant="secondary"
                />
              </View>
            ) : null}

            {invitationsError || (groupsError && groups.length > 0) ? (
              <View accessibilityLiveRegion="polite" style={styles.warning}>
                <Text style={styles.warningTitle}>Some updates could not be refreshed</Text>
                <Text style={styles.warningMessage}>{invitationsError ?? groupsError}</Text>
              </View>
            ) : null}
          </View>
        )}
        onRefresh={() => void load(true)}
        refreshing={refreshing}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onPress={() => navigation.navigate('GroupDetail', { groupId: item.id })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.lg },
  list: { flexGrow: 1, gap: spacing.lg, paddingHorizontal: spacing.lg },
  newGroupAction: { alignItems: 'flex-start' },
  page: { backgroundColor: colors.background, flex: 1 },
  ticket: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.primaryBorder,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.md,
    ...shadows,
  },
  ticketCopy: { flex: 1, gap: spacing.xs, minWidth: 150 },
  ticketEyebrow: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ticketMessage: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 18 },
  ticketScene: { marginHorizontal: -spacing.sm, marginVertical: -spacing.md },
  ticketTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  warning: {
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  warningMessage: { color: colors.warningText, fontSize: typography.small, lineHeight: 20 },
  warningTitle: { color: colors.warningText, fontSize: typography.small, fontWeight: '800' },
});
