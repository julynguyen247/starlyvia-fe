import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Chip } from '../../components/Chip';
import { PlayfulHero } from '../../components/PlayfulHero';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StateView } from '../../components/StateView';
import { useAppTheme } from '../../context/ThemeContext';
import { ApiError, getErrorMessage } from '../../services/apiClient';
import { planService } from '../../services/planService';
import { radius, shadows, spacing, typography, type ThemeColors } from '../../theme/tokens';
import { useThemedStyles } from '../../theme/useThemedStyles';
import type { Plan, PlanRoute, PlanStop, TravelMode } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';
import { formatDateRange, formatDistance, formatDuration, formatTime } from '../../utils/format';

const modeIcons: Record<TravelMode, keyof typeof Ionicons.glyphMap> = {
  DRIVE: 'car-outline',
  WALK: 'walk-outline',
  BICYCLE: 'bicycle-outline',
};

const modeLabels: Record<TravelMode, string> = {
  DRIVE: 'Drive',
  WALK: 'Walk',
  BICYCLE: 'Bicycle',
};

type RouteIssue = {
  icon: keyof typeof Ionicons.glyphMap;
  message: string;
  title: string;
};

function getRouteIssue(error: unknown): RouteIssue {
  if (error instanceof ApiError) {
    if (error.status === 422) {
      return {
        icon: 'trail-sign-outline',
        message: 'Check that every stop was matched from place search, or try another travel mode.',
        title: 'These stops cannot be routed yet',
      };
    }
    if (error.status === 429) {
      return {
        icon: 'hourglass-outline',
        message: 'The routing provider has reached its current limit. Wait a moment, then try again.',
        title: 'Route limit reached',
      };
    }
    if (error.status === 503) {
      return {
        icon: 'cloud-offline-outline',
        message: 'Your itinerary is safe. Routing is temporarily unavailable, so please try again later.',
        title: 'Routing is unavailable',
      };
    }
  }

  return {
    icon: 'alert-circle-outline',
    message: getErrorMessage(error),
    title: 'Could not calculate this route',
  };
}

export function PlanDetailScreen({ navigation, route }: RootScreenProps<'PlanDetail'>) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const { planId } = route.params;
  const loadRequestId = useRef(0);
  const routeRequestId = useRef(0);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [routeSummary, setRouteSummary] = useState<PlanRoute | null>(null);
  const [mode, setMode] = useState<TravelMode>('DRIVE');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routing, setRouting] = useState(false);
  const [deletingPlan, setDeletingPlan] = useState(false);
  const [deletingStopId, setDeletingStopId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routeIssue, setRouteIssue] = useState<RouteIssue | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    const requestId = ++loadRequestId.current;
    routeRequestId.current += 1;
    setRouting(false);
    asRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      const result = await planService.get(planId);
      if (requestId !== loadRequestId.current) return;
      setPlan(result);
      setRouteSummary(null);
      setRouteIssue(null);
    } catch (loadError) {
      if (requestId !== loadRequestId.current) return;
      setError(getErrorMessage(loadError));
    } finally {
      if (requestId === loadRequestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [planId]);

  useFocusEffect(useCallback(() => {
    void load();
    return () => {
      loadRequestId.current += 1;
      routeRequestId.current += 1;
    };
  }, [load]));

  function chooseMode(selectedMode: TravelMode) {
    if (routing || refreshing) return;
    setMode(selectedMode);
    setRouteSummary(null);
    setRouteIssue(null);
  }

  async function computeRoute() {
    if (routing || refreshing) return;
    const requestId = ++routeRequestId.current;
    setRouting(true);
    setRouteIssue(null);
    try {
      const result = await planService.route(planId, mode);
      if (requestId !== routeRequestId.current) return;
      setRouteSummary(result);
    } catch (computeError) {
      if (requestId !== routeRequestId.current) return;
      setRouteSummary(null);
      setRouteIssue(getRouteIssue(computeError));
    } finally {
      if (requestId === routeRequestId.current) setRouting(false);
    }
  }

  function confirmDeleteStop(stop: PlanStop) {
    if (routing || refreshing || deletingStopId || deletingPlan) return;
    Alert.alert('Remove this stop?', stop.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setDeletingStopId(stop.id);
          try {
            await planService.deleteStop(stop.id);
            loadRequestId.current += 1;
            routeRequestId.current += 1;
            setPlan((current) => current ? { ...current, stops: current.stops.filter((item) => item.id !== stop.id) } : current);
            setRouteSummary(null);
            setRouteIssue(null);
          } catch (deleteError) {
            Alert.alert('Could not remove stop', getErrorMessage(deleteError));
          } finally {
            setDeletingStopId(null);
          }
        },
      },
    ]);
  }

  function confirmDeletePlan() {
    if (routing || refreshing || deletingPlan || deletingStopId) return;
    Alert.alert('Delete this itinerary?', 'This also removes every stop and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingPlan(true);
          try {
            await planService.delete(planId);
            navigation.goBack();
          } catch (deleteError) {
            Alert.alert('Could not delete itinerary', getErrorMessage(deleteError));
            setDeletingPlan(false);
          }
        },
      },
    ]);
  }

  if (loading) return <StateView loading presentation="screen" scene="itinerary" title="Opening itinerary…" />;
  if (!plan) {
    return (
      <StateView
        actionLabel="Try again"
        kind="error"
        message={error ?? undefined}
        onAction={() => void load()}
        presentation="screen"
        scene="itinerary"
        title="Could not open itinerary"
      />
    );
  }

  const orderedStops = [...plan.stops].sort((left, right) => (left.orderIndex ?? 0) - (right.orderIndex ?? 0));
  const nextOrderIndex = orderedStops.reduce(
    (maximum, stop) => Math.max(maximum, stop.orderIndex ?? -1),
    -1,
  ) + 1;

  return (
    <Screen
      onRefresh={routing || deletingStopId !== null || deletingPlan ? undefined : () => void load(true)}
      refreshing={refreshing}
      safeTop={false}
    >
      <PlayfulHero
        badge={<Chip label={plan.status} tone={plan.status === 'COMPLETED' ? 'success' : plan.status === 'CANCELLED' ? 'danger' : 'warning'} />}
        description={plan.planDescription}
        scene="itinerary"
        title={plan.planName}
      >
        <View style={styles.heroDetails}>
          <View style={styles.heroMeta}>
            <Ionicons color={colors.heroTextSubtle} name="calendar-outline" size={18} />
            <Text style={styles.heroMetaText}>{formatDateRange(plan.planStartDate, plan.planEndDate)}</Text>
          </View>
          <View style={styles.heroMeta}>
            <Ionicons color={colors.heroTextSubtle} name="time-outline" size={18} />
            <Text style={styles.heroMetaText}>{formatTime(plan.planStartTime)} – {formatTime(plan.planEndTime)}</Text>
          </View>
        </View>
      </PlayfulHero>

      {error ? (
        <View accessibilityLiveRegion="polite" style={styles.refreshWarning}>
          <Ionicons color={colors.warning} name="refresh-circle-outline" size={22} />
          <View style={styles.warningCopy}>
            <Text style={styles.warningTitle}>Showing the last itinerary</Text>
            <Text style={styles.warningText}>{error}</Text>
          </View>
          <AppButton
            compact
            disabled={routing || refreshing || deletingStopId !== null || deletingPlan}
            label="Retry"
            onPress={() => void load(true)}
            variant="ghost"
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader title={`Adventure route · ${orderedStops.length}`} />
        {orderedStops.map((stop, index) => (
          <View key={stop.id} style={styles.stopRow}>
            <View style={styles.timelineColumn}>
              <View style={styles.stopNumber}>
                <Text style={styles.stopNumberText}>{index + 1}</Text>
              </View>
              {index < orderedStops.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.stopCard}>
              <View style={styles.stopTop}>
                <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.stopIcon}>
                  <Ionicons color={colors.primary} name="location" size={18} />
                </View>
                <View style={styles.stopCopy}>
                  <Text style={styles.stopTime}>{formatTime(stop.arrivalTime)} – {formatTime(stop.departureTime)}</Text>
                  <Text style={styles.stopName}>{stop.name}</Text>
                </View>
                <Pressable
                  accessibilityLabel={`Remove ${stop.name}`}
                  accessibilityRole="button"
                  accessibilityState={{ busy: deletingStopId === stop.id, disabled: routing || refreshing || deletingStopId !== null || deletingPlan }}
                  disabled={routing || refreshing || deletingStopId !== null || deletingPlan}
                  onPress={() => confirmDeleteStop(stop)}
                  style={({ pressed }) => [styles.stopAction, pressed && styles.pressed]}
                >
                  {deletingStopId === stop.id ? (
                    <ActivityIndicator color={colors.danger} size="small" />
                  ) : (
                    <Ionicons color={colors.danger} name="trash-outline" size={20} />
                  )}
                </Pressable>
              </View>
              {stop.address ? <Text style={styles.stopAddress}>{stop.address}</Text> : null}
              {stop.note ? <Text style={styles.stopNote}>{stop.note}</Text> : null}
              {stop.rating ? (
                <View style={styles.ratingRow}>
                  <Ionicons color={colors.warning} name="star" size={14} />
                  <Text style={styles.rating}>{stop.rating} {stop.ratingCount ? `(${stop.ratingCount})` : ''}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ))}
        {!orderedStops.length ? (
          <StateView
            kind="empty"
            message="Add at least two map-matched places to calculate a route."
            scene="itinerary"
            title="Build the day, one place at a time"
          />
        ) : null}
        <AppButton
          disabled={routing || refreshing || deletingPlan || deletingStopId !== null}
          icon="add"
          label="Add a place"
          onPress={() => navigation.navigate('AddStop', { planId, nextOrderIndex })}
          variant="secondary"
        />
      </View>

      {orderedStops.length >= 2 ? (
        <View style={styles.routeCard}>
          <View style={styles.routeHeading}>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.routeIcon}>
              <Ionicons color={colors.primary} name="navigate" size={22} />
            </View>
            <View style={styles.routeHeadingCopy}>
              <SectionHeader title="How should we go?" />
              <Text style={styles.routeIntro}>Pick a travel mode, then connect the stops.</Text>
            </View>
          </View>
          <View accessibilityLabel="Travel mode" style={styles.modes}>
            {(['DRIVE', 'WALK', 'BICYCLE'] as TravelMode[]).map((travelMode) => (
              <Pressable
                accessibilityLabel={`${modeLabels[travelMode]} route`}
                accessibilityRole="button"
                accessibilityState={{ disabled: routing || refreshing || deletingStopId !== null || deletingPlan, selected: mode === travelMode }}
                disabled={routing || refreshing || deletingStopId !== null || deletingPlan}
                key={travelMode}
                onPress={() => chooseMode(travelMode)}
                style={({ pressed }) => [
                  styles.mode,
                  mode === travelMode && styles.modeSelected,
                  (routing || refreshing || deletingStopId !== null || deletingPlan) && styles.modeDisabled,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons color={mode === travelMode ? colors.onPrimary : colors.textMuted} name={modeIcons[travelMode]} size={20} />
                <Text style={[styles.modeText, mode === travelMode && styles.modeTextSelected]}>{modeLabels[travelMode]}</Text>
                {mode === travelMode ? <Ionicons color={colors.onPrimary} name="checkmark-circle" size={17} /> : null}
              </Pressable>
            ))}
          </View>

          {!routeSummary && !routeIssue ? (
            <AppButton
              disabled={refreshing || deletingStopId !== null || deletingPlan}
              label="Calculate route"
              loading={routing}
              onPress={() => void computeRoute()}
            />
          ) : null}

          {routeIssue ? (
            <View accessibilityLiveRegion="polite" style={styles.routeError}>
              <View style={styles.routeErrorIcon}>
                <Ionicons color={colors.warning} name={routeIssue.icon} size={24} />
              </View>
              <View style={styles.routeErrorCopy}>
                <Text style={styles.routeErrorTitle}>{routeIssue.title}</Text>
                <Text style={styles.routeErrorText}>{routeIssue.message}</Text>
              </View>
              <AppButton
                compact
                disabled={refreshing || deletingStopId !== null || deletingPlan}
                label="Try again"
                loading={routing}
                onPress={() => void computeRoute()}
                variant="ghost"
              />
            </View>
          ) : null}

          {routeSummary ? (
            <View
              accessibilityLabel={`Route ready. ${formatDistance(routeSummary.distanceMeters)} total distance. ${formatDuration(routeSummary.durationSeconds)} travel time.`}
              accessibilityLiveRegion="polite"
              style={styles.routeSummary}
            >
              <View style={styles.routeReady}>
                <Ionicons color={colors.success} name="checkmark-circle" size={22} />
                <Text style={styles.routeReadyText}>{modeLabels[routeSummary.travelMode]} route ready</Text>
              </View>
              <View style={styles.routeMetrics}>
                <View style={styles.routeMetric}>
                  <Text style={styles.routeMetricValue}>{formatDistance(routeSummary.distanceMeters)}</Text>
                  <Text style={styles.routeMetricLabel}>total distance</Text>
                </View>
                <View style={styles.routeMetric}>
                  <Text style={styles.routeMetricValue}>{formatDuration(routeSummary.durationSeconds)}</Text>
                  <Text style={styles.routeMetricLabel}>travel time</Text>
                </View>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      <AppButton
        disabled={routing || refreshing || deletingStopId !== null}
        label="Delete itinerary"
        loading={deletingPlan}
        onPress={confirmDeletePlan}
        variant="danger"
      />
    </Screen>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  heroDetails: { gap: spacing.sm },
  heroMeta: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  heroMetaText: { color: colors.heroTextSubtle, flexShrink: 1, fontSize: typography.small, fontWeight: '700' },
  mode: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: spacing.xs, minHeight: 44, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  modeDisabled: { opacity: 0.6 },
  modeSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '900' },
  modeTextSelected: { color: colors.onPrimary },
  modes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pressed: { opacity: 0.76 },
  rating: { color: colors.warningText, fontSize: typography.caption, fontWeight: '800' },
  ratingRow: { alignItems: 'center', flexDirection: 'row', gap: spacing.xs },
  refreshWarning: { alignItems: 'center', backgroundColor: colors.warningSoft, borderRadius: radius.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.md },
  routeCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, padding: spacing.lg, ...shadows },
  routeError: { alignItems: 'center', backgroundColor: colors.warningSoft, borderRadius: radius.md, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, padding: spacing.md },
  routeErrorCopy: { flex: 1, gap: spacing.xs, minWidth: 180 },
  routeErrorIcon: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, height: 46, justifyContent: 'center', width: 46 },
  routeErrorText: { color: colors.warningText, fontSize: typography.small, lineHeight: 20 },
  routeErrorTitle: { color: colors.text, fontSize: typography.small, fontWeight: '900' },
  routeHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  routeHeadingCopy: { flex: 1, gap: spacing.xs },
  routeIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, height: 50, justifyContent: 'center', width: 50 },
  routeIntro: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  routeMetric: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, flex: 1, gap: spacing.xs, minWidth: 120, padding: spacing.md },
  routeMetricLabel: { color: colors.textMuted, fontSize: typography.caption },
  routeMetricValue: { color: colors.primary, fontSize: typography.heading, fontWeight: '900' },
  routeMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  routeReady: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  routeReadyText: { color: colors.successText, fontSize: typography.small, fontWeight: '900' },
  routeSummary: { backgroundColor: colors.successSoft, borderRadius: radius.md, gap: spacing.md, padding: spacing.md },
  section: { gap: spacing.md },
  stopAction: { alignItems: 'center', borderRadius: radius.pill, height: 44, justifyContent: 'center', width: 44 },
  stopAddress: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  stopCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, flex: 1, gap: spacing.sm, marginBottom: spacing.md, padding: spacing.lg },
  stopCopy: { flex: 1, gap: spacing.xs },
  stopIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.sm, height: 34, justifyContent: 'center', width: 34 },
  stopName: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
  stopNote: { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, color: colors.textMuted, fontSize: typography.small, lineHeight: 20, padding: spacing.sm },
  stopNumber: { alignItems: 'center', backgroundColor: colors.accent, borderColor: colors.surface, borderRadius: radius.pill, borderWidth: 1, height: 36, justifyContent: 'center', width: 36, ...shadows },
  stopNumberText: { color: colors.onAccent, fontSize: typography.small, fontWeight: '900' },
  stopRow: { alignItems: 'stretch', flexDirection: 'row', gap: spacing.md },
  stopTime: { color: colors.primary, fontSize: typography.caption, fontWeight: '900' },
  stopTop: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  timelineColumn: { alignItems: 'center', width: 36 },
  timelineLine: { borderLeftColor: colors.primaryBorder, borderLeftWidth: 2, borderStyle: 'dashed', flex: 1, marginVertical: spacing.xs },
  warningCopy: { flex: 1, gap: spacing.xs, minWidth: 160 },
  warningText: { color: colors.warningText, fontSize: typography.small, lineHeight: 20 },
  warningTitle: { color: colors.text, fontSize: typography.small, fontWeight: '900' },
  });
}
