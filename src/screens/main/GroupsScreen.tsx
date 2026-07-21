import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../components/AppButton';
import { GroupCard } from '../../components/GroupCard';
import { StateView } from '../../components/StateView';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { colors, spacing, typography } from '../../theme/tokens';
import type { Group } from '../../types/api';
import type { TabScreenProps } from '../../types/navigation';

export function GroupsScreen({ navigation }: TabScreenProps<'Groups'>) {
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<Group[]>([]);
  const [invitationCount, setInvitationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    asRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [groupList, invitations] = await Promise.all([
        groupService.list(),
        groupService.incomingInvitations(),
      ]);
      setGroups(groupList);
      setInvitationCount(invitations.filter((item) => item.status === 'PENDING').length);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  if (loading) return <StateView loading title="Gathering your travel circles…" />;
  if (error && !groups.length) {
    return (
      <StateView
        actionLabel="Try again"
        icon="cloud-offline-outline"
        message={error}
        onAction={() => void load()}
        title="Could not load travel circles"
      />
    );
  }

  return (
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
        <StateView
          actionLabel="Create a group"
          icon="people-outline"
          message="Groups keep shared itineraries, members, and updates together."
          onAction={() => navigation.navigate('CreateGroup')}
          title="Build your first circle"
        />
      )}
      ListHeaderComponent={(
        <View style={styles.header}>
          <View style={styles.headingRow}>
            <View style={styles.headingCopy}>
              <Text accessibilityRole="header" style={styles.title}>Travel circles</Text>
              <Text style={styles.subtitle}>The people you plan the good stuff with.</Text>
            </View>
            <AppButton compact icon="add" label="New" onPress={() => navigation.navigate('CreateGroup')} />
          </View>

          {invitationCount > 0 ? (
            <AppButton
              icon="mail-unread-outline"
              label={`${invitationCount} pending ${invitationCount === 1 ? 'invitation' : 'invitations'}`}
              onPress={() => navigation.navigate('Invitations')}
              variant="secondary"
            />
          ) : null}

          {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}
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
      style={styles.page}
    />
  );
}

const styles = StyleSheet.create({
  error: { color: colors.danger, fontSize: typography.small },
  header: { gap: spacing.lg },
  headingCopy: { flex: 1, gap: spacing.xs },
  headingRow: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  list: { backgroundColor: colors.background, flexGrow: 1, gap: spacing.lg, paddingHorizontal: spacing.lg },
  page: { backgroundColor: colors.background, flex: 1 },
  subtitle: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  title: { color: colors.text, fontSize: typography.title, fontWeight: '900', letterSpacing: -0.6 },
});
