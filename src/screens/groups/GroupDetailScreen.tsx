import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { Avatar } from '../../components/Avatar';
import { Chip } from '../../components/Chip';
import { PlanCard } from '../../components/PlanCard';
import { PlayfulHero } from '../../components/PlayfulHero';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StateView } from '../../components/StateView';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { planService } from '../../services/planService';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';
import type { Group, GroupMember, Plan } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';
import { formatDate } from '../../utils/format';

export function GroupDetailScreen({ navigation, route }: RootScreenProps<'GroupDetail'>) {
  const { user } = useAuth();
  const { groupId } = route.params;
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [inviteeId, setInviteeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    asRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [groupResult, memberResult, planResult] = await Promise.all([
        groupService.get(groupId),
        groupService.members(groupId),
        planService.listByGroup(groupId),
      ]);
      setGroup(groupResult);
      setMembers(memberResult);
      setPlans(planResult.sort((left, right) => left.planStartDate.localeCompare(right.planStartDate)));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function invite() {
    const value = inviteeId.trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(value)) {
      Alert.alert('Check the user ID', 'Enter the full UUID of the person you want to invite.');
      return;
    }
    setInviting(true);
    try {
      await groupService.invite(groupId, value);
      setInviteeId('');
      Alert.alert('Invitation sent', 'They will see it in their invitations.');
    } catch (inviteError) {
      Alert.alert('Could not send invitation', getErrorMessage(inviteError));
    } finally {
      setInviting(false);
    }
  }

  function confirmRemove(member: GroupMember) {
    Alert.alert('Remove member?', `This removes user ${member.userId.slice(0, 8)}… from the group.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await groupService.removeMember(groupId, member.userId);
            setMembers((current) => current.filter((item) => item.id !== member.id));
          } catch (removeError) {
            Alert.alert('Could not remove member', getErrorMessage(removeError));
          }
        },
      },
    ]);
  }

  if (loading) return <StateView loading title="Opening travel circle…" />;
  if (!group) return <StateView actionLabel="Try again" message={error ?? undefined} onAction={() => void load()} title="Could not open group" />;

  const currentMember = members.find((member) => member.userId === user?.userId);
  const canManage = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN';

  return (
    <Screen onRefresh={() => void load(true)} refreshing={refreshing} safeTop={false}>
      <PlayfulHero
        badge={<Chip label={group.type.replace('_', ' ')} />}
        description={group.description || 'A shared space for the next adventure.'}
        icon="people"
        title={group.name}
      >
        <Text style={styles.created}>Together since {formatDate(group.createdAt.slice(0, 10))}</Text>
      </PlayfulHero>

      <View style={styles.sectionGap}>
        <SectionHeader title="Itineraries" />
        <AppButton icon="add" label="Plan a trip" onPress={() => navigation.navigate('CreatePlan', { groupId, groupName: group.name })} />
        {plans.length ? plans.map((plan) => (
          <PlanCard key={plan.id} onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })} plan={plan} />
        )) : (
          <View style={styles.emptyInline}>
            <Text style={styles.emptyTitle}>No itineraries yet</Text>
            <Text style={styles.emptyCopy}>Turn the group's ideas into the first plan.</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionGap}>
        <SectionHeader title={`Travelers · ${members.length}`} />
        {members.map((member) => (
          <View key={member.id} style={styles.member}>
            <Avatar name={member.userId} size={42} />
            <View style={styles.memberCopy}>
              <Text style={styles.memberName}>{member.userId === user?.userId ? user.username : `Traveler ${member.userId.slice(0, 8)}`}</Text>
              <Text style={styles.memberId}>{member.userId}</Text>
            </View>
            <Chip label={member.role} />
            {canManage && member.role !== 'OWNER' && member.userId !== user?.userId ? (
              <Pressable
                accessibilityLabel={`Remove ${member.userId === user?.userId ? (user?.username ?? 'your account') : `Traveler ${member.userId.slice(0, 8)}`} from travel circle`}
                accessibilityRole="button"
                onPress={() => confirmRemove(member)}
                style={styles.removeMember}
              >
                <Ionicons color={colors.danger} name="close-circle-outline" size={22} />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      {canManage ? (
        <View style={styles.inviteCard}>
          <Text style={styles.inviteTitle}>Invite another traveler</Text>
          <Text style={styles.inviteCopy}>The backend currently accepts a user UUID; user search is not available yet.</Text>
          <AppInput autoCapitalize="none" label="User ID" onChangeText={setInviteeId} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={inviteeId} />
          <AppButton label="Send invitation" loading={inviting} onPress={() => void invite()} variant="secondary" />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  created: { color: colors.heroTextSubtle, fontSize: typography.caption, fontWeight: '700', marginTop: spacing.sm },
  emptyCopy: { color: colors.textMuted, fontSize: typography.small },
  emptyInline: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderStyle: 'dashed', borderWidth: 1, gap: spacing.xs, padding: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  inviteCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.md, padding: spacing.lg, ...shadows },
  inviteCopy: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  inviteTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '800' },
  member: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  memberCopy: { flex: 1, gap: 2 },
  memberId: { color: colors.textMuted, fontSize: 10 },
  memberName: { color: colors.text, fontSize: typography.small, fontWeight: '800' },
  removeMember: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  sectionGap: { gap: spacing.md },
});
