import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Avatar } from '../../components/Avatar';
import { GroupCard } from '../../components/GroupCard';
import { PlayfulHero } from '../../components/PlayfulHero';
import { PlanCard } from '../../components/PlanCard';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StateView } from '../../components/StateView';
import { TravelGlobe3D } from '../../components/TravelGlobe3D';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { notificationService } from '../../services/notificationService';
import { planService } from '../../services/planService';
import { radius, spacing, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { Group, Plan } from '../../types/api';
import type { TabScreenProps } from '../../types/navigation';

export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const styles = useThemedStyles(createStyles);
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [groups, setGroups] = useState<Group[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const hasLoadedGroups = useRef(false);
  const loadRequestId = useRef(0);

  const load = useCallback(async (asRefresh = false) => {
    const requestId = ++loadRequestId.current;
    if (asRefresh) {
      setRefreshing(true);
    } else if (!hasLoadedGroups.current) {
      setLoading(true);
    }
    setError(null);
    setWarning(null);
    try {
      const [groupsResult, unreadResult] = await Promise.allSettled([
        groupService.list(),
        notificationService.unreadCount(),
      ]);
      if (requestId !== loadRequestId.current) return;

      const notices: string[] = [];
      if (unreadResult.status === 'fulfilled') {
        setUnreadCount(unreadResult.value.count);
      } else {
        notices.push(t('home.notificationsWarning'));
      }

      if (groupsResult.status === 'rejected') {
        setError(groupsResult.reason instanceof TypeError ? t('auth.connectionError') : getErrorMessage(groupsResult.reason));
        if (hasLoadedGroups.current) {
          notices.unshift(t('home.groupsWarning'));
        }
        setWarning(notices.join(' '));
        return;
      }

      const groupList = groupsResult.value;
      hasLoadedGroups.current = true;
      setGroups(groupList);

      if (!groupList.length) {
        setPlans([]);
        setWarning(notices.length ? notices.join(' ') : null);
        return;
      }

      const planResults = await Promise.allSettled(
        groupList.map((group) => planService.listByGroup(group.id)),
      );
      if (requestId !== loadRequestId.current) return;
      const freshPlans = planResults.flatMap((result) =>
        result.status === 'fulfilled' ? result.value : [],
      );
      const failedGroupIds = new Set<string>();
      planResults.forEach((result, index) => {
        const group = groupList[index];
        if (result.status === 'rejected' && group) failedGroupIds.add(group.id);
      });

      setPlans((currentPlans) => {
        const retainedPlans = currentPlans.filter(
          (plan) => plan.groupId && failedGroupIds.has(plan.groupId),
        );
        const uniquePlans = new Map(
          [...freshPlans, ...retainedPlans].map((plan) => [plan.id, plan]),
        );

        return [...uniquePlans.values()]
          .filter((plan) => plan.status !== 'CANCELLED')
          .sort((left, right) => left.planStartDate.localeCompare(right.planStartDate))
          .slice(0, 3);
      });

      if (failedGroupIds.size) {
        notices.push(
          failedGroupIds.size === groupList.length
            ? t('home.plansWarning')
            : t('home.somePlansWarning'),
        );
      }
      setWarning(notices.length ? notices.join(' ') : null);
    } catch (loadError) {
      if (requestId === loadRequestId.current) {
        setError(loadError instanceof TypeError ? t('auth.connectionError') : getErrorMessage(loadError));
      }
    } finally {
      if (requestId === loadRequestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <StateView
        kind="loading"
        loading
        presentation="screen"
        scene="itinerary"
        title={t('home.loading')}
      />
    );
  }

  if (error && !groups.length) {
    return (
      <StateView
        actionLabel={t('common.tryAgain')}
        icon="cloud-offline-outline"
        kind="error"
        message={error}
        onAction={() => void load()}
        presentation="screen"
        title={t('home.offlineTitle')}
      />
    );
  }

  const greeting = new Date().getHours() < 12
    ? t('home.goodMorning')
    : new Date().getHours() < 18 ? t('home.goodAfternoon') : t('home.goodEvening');
  const explorerName = user?.username ?? t('common.explorer');

  return (
    <Screen onRefresh={() => void load(true)} refreshing={refreshing}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>{greeting}</Text>
          <Text accessibilityRole="header" numberOfLines={2} style={styles.name}>{explorerName}</Text>
        </View>
        <Pressable
          accessibilityLabel={unreadCount > 0 ? t('home.openNotificationsUnread', { count: unreadCount }) : t('home.openNotifications')}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationButton}
        >
          <Ionicons color={colors.text} name="notifications-outline" size={23} />
          {unreadCount > 0 ? <View style={styles.notificationDot} /> : null}
        </Pressable>
        <Avatar name={explorerName} size={46} uri={user?.avatarUrl} />
      </View>

      {warning ? (
        <View accessibilityLiveRegion="polite" style={styles.warning}>
          <Ionicons color={colors.warningText} name="warning-outline" size={22} />
          <View style={styles.warningCopy}>
            <Text style={styles.warningTitle}>{t('home.warningTitle')}</Text>
            <Text style={styles.warningText}>{warning}</Text>
          </View>
          <AppButton
            compact
            label={t('common.refresh')}
            onPress={() => void load(true)}
            style={styles.warningAction}
            variant="ghost"
          />
        </View>
      ) : null}

      <PlayfulHero
        description={t('home.heroDescription')}
        title={t('home.heroTitle')}
        visual={<TravelGlobe3D active={isFocused} />}
      >
        <AppButton
          compact
          icon="add"
          label={t('home.startCircle')}
          onPress={() => navigation.navigate('CreateGroup')}
          style={styles.heroAction}
        />
      </PlayfulHero>

      <View accessibilityLabel={t('home.quickActions')} style={styles.quickActions}>
        <Pressable
          accessibilityLabel={t('home.createCircleLabel')}
          accessibilityRole="button"
          onPress={() => navigation.navigate('CreateGroup')}
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
        >
          <View style={[styles.quickIcon, styles.quickIconOrange]}>
            <Ionicons color={colors.onPrimary} name="add" size={23} />
          </View>
          <Text numberOfLines={2} style={styles.quickLabel}>{t('home.newCircle')}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={t('home.openInvitations')}
          accessibilityRole="button"
          onPress={() => navigation.navigate('Invitations')}
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
        >
          <View style={[styles.quickIcon, styles.quickIconGreen]}>
            <Ionicons color={colors.accentText} name="ticket" size={22} />
          </View>
          <Text numberOfLines={2} style={styles.quickLabel}>{t('nav.invitations')}</Text>
        </Pressable>
        <Pressable
          accessibilityLabel={t('home.browseCircles')}
          accessibilityRole="button"
          onPress={() => navigation.navigate('Groups')}
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
        >
          <View style={[styles.quickIcon, styles.quickIconDark]}>
            <Ionicons color={colors.heroText} name="compass" size={22} />
          </View>
          <Text numberOfLines={2} style={styles.quickLabel}>{t('home.browseTrips')}</Text>
        </Pressable>
      </View>

      <SectionHeader
        actionLabel={t('home.seeAll')}
        onAction={() => navigation.navigate('Groups')}
        title={t('home.yourCircles')}
      />
      {groups.length ? (
        groups.slice(0, 2).map((group) => (
          <GroupCard
            group={group}
            key={group.id}
            onPress={() => navigation.navigate('GroupDetail', { groupId: group.id })}
          />
        ))
      ) : (
        <StateView
          actionLabel={t('home.createFirstGroup')}
          message={t('home.noCirclesMessage')}
          onAction={() => navigation.navigate('CreateGroup')}
          scene="crew"
          title={t('home.noCirclesTitle')}
        />
      )}

      {groups.length ? (
        <>
          <SectionHeader title={t('home.comingUp')} />
          {plans.length ? (
            plans.map((plan) => (
              <PlanCard
                key={plan.id}
                onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })}
                plan={plan}
              />
            ))
          ) : (
            <StateView
              actionLabel={t('home.chooseCircle')}
              message={t('home.noPlansMessage')}
              onAction={() => navigation.navigate('Groups')}
              scene="itinerary"
              title={t('home.noPlansTitle')}
            />
          )}
        </>
      ) : null}
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  eyebrow: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  greeting: { flex: 1, gap: 2 },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  heroAction: {
    alignSelf: 'flex-start',
  },
  name: { color: colors.text, fontSize: typography.heading, fontWeight: '900' },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  notificationDot: {
    backgroundColor: colors.accent,
    borderColor: colors.surface,
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: 'absolute',
    right: 8,
    top: 8,
    width: 10,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flex: 1,
    gap: spacing.sm,
    minHeight: 112,
    minWidth: 92,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  quickActionPressed: { opacity: 0.86, transform: [{ translateY: 2 }, { scale: 0.97 }] },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickIcon: { alignItems: 'center', borderRadius: radius.pill, height: 52, justifyContent: 'center', width: 52 },
  quickIconDark: { backgroundColor: colors.primaryDark },
  quickIconGreen: { backgroundColor: colors.accentSoft, borderColor: colors.accent, borderWidth: 2 },
  quickIconOrange: { backgroundColor: colors.primary },
  quickLabel: { color: colors.text, fontSize: typography.caption, fontWeight: '900', textAlign: 'center' },
  warning: {
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    padding: spacing.lg,
  },
  warningAction: { alignSelf: 'center' },
  warningCopy: { flex: 1, gap: spacing.xs, minWidth: 180 },
  warningText: { color: colors.warningText, fontSize: typography.small, lineHeight: 20 },
  warningTitle: { color: colors.warningText, fontSize: typography.small, fontWeight: '800' },
  });
}
