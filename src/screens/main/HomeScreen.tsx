import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../../components/Avatar';
import { GroupCard } from '../../components/GroupCard';
import { PlayfulHero } from '../../components/PlayfulHero';
import { PlanCard } from '../../components/PlanCard';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StateView } from '../../components/StateView';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { notificationService } from '../../services/notificationService';
import { planService } from '../../services/planService';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import type { Group, Plan } from '../../types/api';
import type { TabScreenProps } from '../../types/navigation';

export function HomeScreen({ navigation }: TabScreenProps<'Home'>) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    asRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const [groupList, unread] = await Promise.all([
        groupService.list(),
        notificationService.unreadCount(),
      ]);
      setGroups(groupList);
      setUnreadCount(unread.count);

      const planResults = await Promise.allSettled(
        groupList.map((group) => planService.listByGroup(group.id)),
      );
      const allPlans = planResults.flatMap((result) =>
        result.status === 'fulfilled' ? result.value : [],
      );
      setPlans(
        allPlans
          .filter((plan) => plan.status !== 'CANCELLED')
          .sort((left, right) => left.planStartDate.localeCompare(right.planStartDate))
          .slice(0, 3),
      );
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return <StateView loading title="Finding your next adventure…" />;
  }

  if (error && !groups.length) {
    return <StateView actionLabel="Try again" message={error} onAction={() => void load()} title="Could not load home" />;
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

      <PlayfulHero eyebrow="YOUR TRAVEL UNIVERSE" title="Where will your crew go next?">
        <Pressable
          accessibilityLabel="Start a travel circle"
          accessibilityRole="button"
          onPress={() => navigation.navigate('CreateGroup')}
          style={styles.heroAction}
        >
          <Ionicons color={colors.primaryDark} name="add" size={20} />
          <Text style={styles.heroActionText}>Start a travel circle</Text>
        </Pressable>
      </PlayfulHero>

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
          icon="people-outline"
          message="Bring friends or family together before building an itinerary."
          onAction={() => navigation.navigate('CreateGroup')}
          title="No travel circles yet"
        />
      )}

      {plans.length ? (
        <>
          <SectionHeader title="Coming up" />
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              onPress={() => navigation.navigate('PlanDetail', { planId: plan.id })}
              plan={plan}
            />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '700' },
  greeting: { flex: 1, gap: 2 },
  header: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  heroAction: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  heroActionText: { color: colors.primaryDark, fontSize: typography.small, fontWeight: '800' },
  name: { color: colors.text, fontSize: typography.heading, fontWeight: '900' },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
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
});
