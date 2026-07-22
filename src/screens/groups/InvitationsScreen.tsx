import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '../../components/AppButton';
import { Chip } from '../../components/Chip';
import { DreamyBackdrop } from '../../components/DreamyBackdrop';
import { ScreenIntro } from '../../components/ScreenIntro';
import { StateView } from '../../components/StateView';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { groupService } from '../../services/groupService';
import { radius, shadows, spacing, stickerShadows, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { GroupInvitation } from '../../types/api';
import { relativeTime } from '../../utils/format';

export function InvitationsScreen() {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyDecision, setBusyDecision] = useState<'accept' | 'decline' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busyRef = useRef(false);
  const requestGeneration = useRef(0);

  const load = useCallback(async (asRefresh = false) => {
    if (busyRef.current) return;
    const generation = ++requestGeneration.current;
    asRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const result = await groupService.incomingInvitations();
      if (generation !== requestGeneration.current) return;
      setInvitations(result);
    } catch (loadError) {
      if (generation !== requestGeneration.current) return;
      setError(getErrorMessage(loadError));
    } finally {
      if (generation === requestGeneration.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
    return () => {
      requestGeneration.current += 1;
    };
  }, [load]);

  async function respond(invitation: GroupInvitation, accept: boolean) {
    if (busyRef.current || refreshing) return;

    busyRef.current = true;
    requestGeneration.current += 1;
    setBusyId(invitation.id);
    setBusyDecision(accept ? 'accept' : 'decline');
    try {
      if (accept) await groupService.acceptInvitation(invitation.id);
      else await groupService.rejectInvitation(invitation.id);
      setInvitations((current) => current.filter((item) => item.id !== invitation.id));
      AccessibilityInfo.announceForAccessibility(
        accept
          ? `Joined ${invitation.group.name}`
          : `Invitation from ${invitation.group.name} declined`,
      );
    } catch (responseError) {
      Alert.alert('Could not update invitation', getErrorMessage(responseError));
    } finally {
      busyRef.current = false;
      setBusyId(null);
      setBusyDecision(null);
    }
  }

  if (loading) {
    return (
      <StateView
        kind="loading"
        loading
        presentation="screen"
        title="Opening invitations…"
      />
    );
  }
  if (error && !invitations.length) {
    return (
      <StateView
        actionLabel="Try again"
        kind="error"
        message={error}
        onAction={() => void load()}
        presentation="screen"
        title="Could not load invitations"
      />
    );
  }

  return (
    <View style={styles.page}>
      <DreamyBackdrop />
      <FlatList
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Math.max(insets.bottom, spacing.xl) },
        ]}
        data={invitations}
        keyExtractor={(invitation) => invitation.id}
        ListEmptyComponent={(
          <StateView
            kind="empty"
            message="When someone invites you to a travel circle, it will show up here."
            scene="invitation"
            title="No invitations waiting"
          />
        )}
        ListHeaderComponent={(
          <View style={styles.header}>
            <ScreenIntro
              scene="invitation"
              subtitle="Open a ticket to join a new crew, or politely pass for now."
              title="Trip invitations"
            />
            {error ? (
              <View accessibilityLiveRegion="polite" style={styles.errorNotice}>
                <Ionicons color={colors.warningText} name="cloud-offline-outline" size={21} />
                <View style={styles.errorCopy}>
                  <Text style={styles.errorTitle}>Invitations could not be refreshed</Text>
                  <Text style={styles.errorMessage}>{error}</Text>
                </View>
              </View>
            ) : null}
          </View>
        )}
        onRefresh={busyId ? undefined : () => void load(true)}
        refreshing={refreshing}
        renderItem={({ item: invitation }) => (
          <View style={styles.card}>
            <View style={styles.topRow}>
              <View style={styles.ticketLabel}>
                <View
                  accessibilityElementsHidden
                  importantForAccessibility="no-hide-descendants"
                  style={styles.ticketIcon}
                >
                  <Ionicons color={colors.primary} name="ticket-outline" size={22} />
                </View>
                <Chip
                  label={invitation.status}
                  tone={invitation.status === 'PENDING' ? 'warning' : 'neutral'}
                />
              </View>
              <Text style={styles.time}>{relativeTime(invitation.createdAt)}</Text>
            </View>
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.ticketDivider}
            />
            <Text style={styles.title}>{invitation.group.name}</Text>
            <Text style={styles.description}>{invitation.group.description || 'You have been invited to plan a trip with this circle.'}</Text>
            {invitation.status === 'PENDING' ? (
              <View style={styles.actions}>
                <AppButton
                  compact
                  disabled={busyId !== null || refreshing}
                  label="Decline"
                  loading={busyId === invitation.id && busyDecision === 'decline'}
                  onPress={() => void respond(invitation, false)}
                  style={styles.action}
                  variant="ghost"
                />
                <AppButton
                  compact
                  disabled={busyId !== null || refreshing}
                  icon="checkmark"
                  label="Join group"
                  loading={busyId === invitation.id && busyDecision === 'accept'}
                  onPress={() => void respond(invitation, true)}
                  style={styles.action}
                />
              </View>
            ) : null}
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  action: { flexBasis: 140, flexGrow: 1 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.sm },
  card: {
    backgroundColor: colors.surfaceWarm,
    borderColor: colors.primaryBorder,
    borderRadius: radius.lg,
    borderWidth: 2,
    gap: spacing.sm,
    padding: spacing.lg,
    ...stickerShadows,
  },
  description: { color: colors.textMuted, fontSize: typography.small, lineHeight: 21 },
  errorCopy: { flex: 1, gap: spacing.xs },
  errorMessage: { color: colors.warningText, fontSize: typography.small, lineHeight: 20 },
  errorNotice: {
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderColor: colors.warning,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  errorTitle: { color: colors.warningText, fontSize: typography.small, fontWeight: '800' },
  header: { gap: spacing.lg },
  list: { flexGrow: 1, gap: spacing.lg, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
  page: { backgroundColor: colors.background, flex: 1 },
  ticketDivider: { borderTopColor: colors.border, borderTopWidth: 1, marginVertical: spacing.xs },
  ticketIcon: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.sm,
    height: 42,
    justifyContent: 'center',
    transform: [{ rotate: '-5deg' }],
    width: 42,
    ...shadows,
  },
  ticketLabel: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  time: { color: colors.textMuted, fontSize: typography.caption },
  title: { color: colors.text, fontSize: typography.heading, fontWeight: '900' },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  });
}
