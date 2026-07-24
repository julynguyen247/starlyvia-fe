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
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { notificationService } from '../../services/notificationService';
import { planService } from '../../services/planService';
import { radius, spacing, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { Group, Plan } from '../../types/api';
import type { TabScreenProps } from '../../types/navigation';

function safeErrorMessage(error: unknown): string {
  return error instanceof TypeError
    ? "We couldn't reach Starlyvia. Check your connection and try again."
    : getErrorMessage(error);
}

export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { colors } = useAppTheme();
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
        notices.push("Notifications couldn't refresh, so the unread count may be out of date.");
      }

      if (groupsResult.status === 'rejected') {
        setError(safeErrorMessage(groupsResult.reason));
        if (hasLoadedGroups.current) {
          notices.unshift("Travel circles couldn't refresh. Your saved results are still shown.");
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
            ? "Itineraries couldn't refresh. Saved results may be out of date."
            : "Some itineraries couldn't refresh. Available and saved results are still shown.",
        );
      }
      setWarning(notices.length ? notices.join(' ') : null);
    } catch (loadError) {
      if (requestId === loadRequestId.current) setError(safeErrorMessage(loadError));
    } finally {
      if (requestId === loadRequestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

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
        title="Finding your next adventure…"
      />
    );
  }

  if (error && !groups.length) {
    return (
      <StateView
        actionLabel="Try again"
        icon="cloud-offline-outline"
        kind="error"
        message={error}
        onAction={() => void load()}
        presentation="screen"
        title="Your travel world is taking a break"
      />
    );
  }

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Screen onRefresh={() => void load(true)} refreshing={refreshing}>
      <View style={styles.header}>
        <View style={styles.greeting}>
          <Text style={styles.eyebrow}>{greeting}</Text>
          <Text accessibilityRole="header" numberOfLines={2} style={styles.name}>{user?.username ?? 'Explorer'}</Text>
        </View>
        <Pressable
          accessibilityLabel={unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : 'Open notifications'}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationButton}
        >
          <Ionicons color={colors.text} name="notifications-outline" size={23} />
          {unreadCount > 0 ? <View style={styles.notificationDot} /> : null}
        </Pressable>
        <Avatar name={user?.username ?? 'Explorer'} size={46} uri={user?.avatarUrl} />
      </View>

      {warning ? (
        <View accessibilityLiveRegion="polite" style={styles.warning}>
          <Ionicons color={colors.warningText} name="warning-outline" size={22} />
          <View style={styles.warningCopy}>
            <Text style={styles.warningTitle}>A few updates are delayed</Text>
            <Text style={styles.warningText}>{warning}</Text>
          </View>
          <AppButton
            compact
            label="Refresh"
            onPress={() => void load(true)}
            style={styles.warningAction}
            variant="ghost"
          />
        </View>
      ) : null}

      <PlayfulHero
        description="Gather your favorite people, then turn ideas into an itinerary."
        title="Where will your crew go next?"
        visual={<TravelGlobe3D active={isFocused} />}
      >
        <AppButton
          compact
          icon="add"
          label="Start a travel circle"
          onPress={() => navigation.navigate('CreateGroup')}
          style={styles.heroAction}
        />
      </PlayfulHero>

      <View accessibilityLabel="Quick actions" style={styles.quickActions}>
        <Pressable
          accessibilityLabel="Create a new travel circle"
          accessibilityRole="button"
          onPress={() => navigation.navigate('CreateGroup')}
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
        >
          <View style={[styles.quickIcon, styles.quickIconOrange]}>
            <Ionicons color={colors.onPrimary} name="add" size={23} />
          </View>
          <Text numberOfLines={2} style={styles.quickLabel}>New circle</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Open travel invitations"
          accessibilityRole="button"
          onPress={() => navigation.navigate('Invitations')}
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
        >
          <View style={[styles.quickIcon, styles.quickIconGreen]}>
            <Ionicons color={colors.accentText} name="ticket" size={22} />
          </View>
          <Text numberOfLines={2} style={styles.quickLabel}>Invitations</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Browse travel circles"
          accessibilityRole="button"
          onPress={() => navigation.navigate('Groups')}
          style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
        >
          <View style={[styles.quickIcon, styles.quickIconDark]}>
            <Ionicons color={colors.heroText} name="compass" size={22} />
          </View>
          <Text numberOfLines={2} style={styles.quickLabel}>Browse trips</Text>
        </Pressable>
      </View>

      <SectionHeader
        actionLabel="See all"
        onAction={() => navigation.navigate('Groups')}
        title="Your circles"
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
          actionLabel="Create your first group"
          message="Bring friends or family together before building an itinerary."
          onAction={() => navigation.navigate('CreateGroup')}
          scene="crew"
          title="No travel circles yet"
        />
      )}

      {groups.length ? (
        <>
          <SectionHeader title="Coming up" />
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
              actionLabel="Choose a travel circle"
              message="Your upcoming itineraries will gather here once the first plan takes shape."
              onAction={() => navigation.navigate('Groups')}
              scene="itinerary"
              title="No adventures on the calendar"
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
