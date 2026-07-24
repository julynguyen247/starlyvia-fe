import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
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
import { TravelScene } from '../../components/TravelScene';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { planService } from '../../services/planService';
import {
  radius,
  shadows,
  spacing,
  stickerShadows,
  typography,
  type ThemeColors,
} from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { Group, GroupMember, Plan } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';
import { formatDate } from '../../utils/format';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type InlineLoadNoticeProps = {
  message: string;
  onRetry: () => void;
};

function InlineLoadNotice({ message, onRetry }: InlineLoadNoticeProps) {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const styles = useThemedStyles(createStyles);
  return (
    <View accessibilityLiveRegion="polite" style={styles.loadNotice}>
      <Ionicons color={colors.warningText} name="cloud-offline-outline" size={22} />
      <View style={styles.loadNoticeCopy}>
        <Text style={styles.loadNoticeTitle}>{t('groupDetail.sectionError')}</Text>
        <Text style={styles.loadNoticeMessage}>{message}</Text>
      </View>
      <AppButton compact label={t('plan.retry')} onPress={onRetry} variant="ghost" />
    </View>
  );
}

export function GroupDetailScreen({ navigation, route }: RootScreenProps<'GroupDetail'>) {
  const { colors } = useAppTheme();
  const { locale, t } = useLanguage();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const { groupId } = route.params;
  const hasLoaded = useRef(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [inviteeId, setInviteeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [groupError, setGroupError] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string>();
  const [inviteSuccess, setInviteSuccess] = useState<string>();

  const load = useCallback(async (asRefresh = false) => {
    if (asRefresh) {
      setRefreshing(true);
    } else if (!hasLoaded.current) {
      setLoading(true);
    }
    setGroupError(null);
    setMembersError(null);
    setPlansError(null);

    const [groupResult, memberResult, planResult] = await Promise.allSettled([
      groupService.get(groupId),
      groupService.members(groupId),
      planService.listByGroup(groupId),
    ]);

    if (groupResult.status === 'fulfilled') {
      setGroup(groupResult.value);
    } else {
      setGroupError(getErrorMessage(groupResult.reason));
    }

    if (memberResult.status === 'fulfilled') {
      setMembers(memberResult.value);
    } else {
      setMembersError(getErrorMessage(memberResult.reason));
    }

    if (planResult.status === 'fulfilled') {
      setPlans(
        [...planResult.value].sort((left, right) =>
          left.planStartDate.localeCompare(right.planStartDate),
        ),
      );
    } else {
      setPlansError(getErrorMessage(planResult.reason));
    }

    hasLoaded.current = true;
    setLoading(false);
    setRefreshing(false);
  }, [groupId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function invite() {
    const value = inviteeId.trim();
    if (!uuidPattern.test(value)) {
      setInviteError(t('groupDetail.uuidError'));
      setInviteSuccess(undefined);
      return;
    }

    setInviteError(undefined);
    setInviteSuccess(undefined);
    setInviting(true);
    try {
      await groupService.invite(groupId, value);
      setInviteeId('');
      setInviteSuccess(t('groupDetail.inviteSuccess'));
    } catch (inviteFailure) {
      setInviteError(getErrorMessage(inviteFailure));
    } finally {
      setInviting(false);
    }
  }

  function confirmRemove(member: GroupMember) {
    if (inviting || removingMemberId) return;

    const memberName = member.userId === user?.userId
      ? (user?.username ?? t('groupDetail.yourAccount'))
      : t('groupDetail.traveler', { id: member.userId.slice(0, 8) });

    Alert.alert(t('groupDetail.removeTitle'), t('groupDetail.removeMessage', { name: memberName }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('plan.remove'),
        style: 'destructive',
        onPress: async () => {
          setRemovingMemberId(member.id);
          try {
            await groupService.removeMember(groupId, member.userId);
            setMembers((current) => current.filter((item) => item.id !== member.id));
          } catch (removeError) {
            Alert.alert(t('groupDetail.removeError'), getErrorMessage(removeError));
          } finally {
            setRemovingMemberId(null);
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <StateView
        kind="loading"
        loading
        presentation="screen"
        title={t('groupDetail.opening')}
      />
    );
  }
  if (!group) {
    return (
      <StateView
        actionLabel={t('common.tryAgain')}
        kind="error"
        message={groupError ?? undefined}
        onAction={() => void load()}
        presentation="screen"
        title={t('groupDetail.openError')}
      />
    );
  }

  const currentMember = members.find((member) => member.userId === user?.userId);
  const canManage = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN';
  const mutationBusy = inviting || removingMemberId !== null;

  return (
    <Screen onRefresh={() => void load(true)} refreshing={refreshing} safeTop={false}>
      <PlayfulHero
        badge={<Chip label={t(`group.${group.type}`)} />}
        description={group.description || t('groupDetail.defaultDescription')}
        eyebrow={t('groupDetail.eyebrow')}
        scene="crew"
        title={group.name}
      >
        <Text style={styles.created}>
          {t('groupDetail.togetherSince', { date: formatDate(group.createdAt.slice(0, 10), locale) })}
        </Text>
      </PlayfulHero>

      {groupError ? <InlineLoadNotice message={groupError} onRetry={() => void load()} /> : null}

      <View style={styles.sectionGap}>
        <SectionHeader title={t('groupDetail.itineraries')} />
        <AppButton
          icon="add"
          label={t('groupDetail.planTrip')}
          onPress={() => navigation.navigate('CreatePlan', { groupId, groupName: group.name })}
        />
        {plansError ? <InlineLoadNotice message={plansError} onRetry={() => void load()} /> : null}
        {plans.length ? plans.map((plan) => (
          <PlanCard
            key={plan.id}
            onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })}
            plan={plan}
          />
        )) : !plansError ? (
          <View style={styles.emptyItinerary}>
            <StateView
              kind="empty"
              message={t('groupDetail.emptyMessage')}
              scene="itinerary"
              title={t('groupDetail.emptyTitle')}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.sectionGap}>
        <SectionHeader title={membersError && !members.length ? t('groupDetail.travelers') : t('groupDetail.travelersCount', { count: members.length })} />
        {membersError ? <InlineLoadNotice message={membersError} onRetry={() => void load()} /> : null}
        {members.map((member) => {
          const memberName = member.userId === user?.userId
            ? (user.username || t('groupDetail.you'))
            : t('groupDetail.traveler', { id: member.userId.slice(0, 8) });
          const canRemove = canManage
            && member.role !== 'OWNER'
            && member.userId !== user?.userId;

          return (
            <View key={member.id} style={styles.member}>
              <View style={styles.memberIdentity}>
                <Avatar name={memberName} size={46} />
                <View style={styles.memberCopy}>
                  <Text style={styles.memberName}>{memberName}</Text>
                  <Text numberOfLines={1} style={styles.memberId}>{member.userId}</Text>
                </View>
              </View>
              <View style={styles.memberMeta}>
                <Chip label={t(`role.${member.role}`)} />
                {canRemove ? (
                  <Pressable
                    accessibilityLabel={t('groupDetail.removeLabel', { name: memberName })}
                    accessibilityRole="button"
                    accessibilityState={{ busy: removingMemberId === member.id, disabled: mutationBusy }}
                    disabled={mutationBusy}
                    onPress={() => confirmRemove(member)}
                    style={({ pressed }) => [
                      styles.removeMember,
                      pressed && styles.removePressed,
                      mutationBusy && styles.removeDisabled,
                    ]}
                  >
                    <Ionicons
                      color={colors.dangerText}
                      name={removingMemberId === member.id ? 'hourglass-outline' : 'person-remove-outline'}
                      size={21}
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
      </View>

      {canManage ? (
        <View style={styles.inviteCard}>
          <View style={styles.inviteHeader}>
            <TravelScene scene="invitation" size={96} style={styles.inviteScene} />
            <View style={styles.inviteHeaderCopy}>
              <Text style={styles.inviteEyebrow}>{t('groupDetail.passItOn')}</Text>
              <Text style={styles.inviteTitle}>{t('groupDetail.inviteTitle')}</Text>
              <Text style={styles.inviteCopy}>
                {t('groupDetail.inviteCopy')}
              </Text>
            </View>
          </View>
          <AppInput
            autoCapitalize="none"
            autoCorrect={false}
            editable={!mutationBusy}
            error={inviteError}
            icon="person-add-outline"
            label={t('groupDetail.userId')}
            onChangeText={(value) => {
              setInviteeId(value);
              setInviteError(undefined);
              setInviteSuccess(undefined);
            }}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={inviteeId}
          />
          {inviteSuccess ? (
            <View accessibilityLiveRegion="polite" style={styles.inviteSuccess}>
              <Ionicons color={colors.successText} name="checkmark-circle" size={20} />
              <Text style={styles.inviteSuccessText}>{inviteSuccess}</Text>
            </View>
          ) : null}
          <AppButton
            disabled={removingMemberId !== null}
            icon="paper-plane-outline"
            label={t('groupDetail.send')}
            loading={inviting}
            onPress={() => void invite()}
            variant="secondary"
          />
        </View>
      ) : null}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  created: {
    color: colors.heroTextSubtle,
    fontSize: typography.caption,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  emptyItinerary: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.primaryBorder,
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    borderWidth: 2,
    overflow: 'hidden',
  },
  inviteCard: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.primaryBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.md,
    padding: spacing.lg,
    ...stickerShadows,
  },
  inviteCopy: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  inviteEyebrow: {
    color: colors.primaryText,
    fontSize: typography.caption,
    fontWeight: '900',
    letterSpacing: 1,
  },
  inviteHeader: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  inviteHeaderCopy: { flex: 1, gap: spacing.xs, minWidth: 190 },
  inviteScene: { marginHorizontal: -spacing.sm, marginVertical: -spacing.md },
  inviteSuccess: {
    alignItems: 'center',
    backgroundColor: colors.successSoft,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  inviteSuccessText: { color: colors.successText, flex: 1, fontSize: typography.small },
  inviteTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '900' },
  loadNotice: {
    alignItems: 'center',
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
  },
  loadNoticeCopy: { flex: 1, gap: spacing.xs, minWidth: 170 },
  loadNoticeMessage: { color: colors.warningText, fontSize: typography.caption, lineHeight: 18 },
  loadNoticeTitle: { color: colors.warningText, fontSize: typography.small, fontWeight: '800' },
  member: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
    ...shadows,
  },
  memberCopy: { flex: 1, gap: spacing.xs, minWidth: 150 },
  memberId: { color: colors.textMuted, fontSize: typography.caption },
  memberIdentity: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  memberMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  memberName: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  removeDisabled: { opacity: 0.45 },
  removeMember: {
    alignItems: 'center',
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  removePressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  sectionGap: { gap: spacing.md },
  });
}
