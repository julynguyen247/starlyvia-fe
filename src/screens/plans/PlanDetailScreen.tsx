import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Chip } from '../../components/Chip';
import { PlayfulHero } from '../../components/PlayfulHero';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StateView } from '../../components/StateView';
import { getErrorMessage } from '../../services/apiClient';
import { planService } from '../../services/planService';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';
import type { Plan, PlanRoute, PlanStop, TravelMode } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';
import { formatDateRange, formatDistance, formatDuration, formatTime } from '../../utils/format';

const modeIcons: Record<TravelMode, keyof typeof Ionicons.glyphMap> = {
  DRIVE: 'car-outline',
  WALK: 'walk-outline',
  BICYCLE: 'bicycle-outline',
};

export function PlanDetailScreen({ navigation, route }: RootScreenProps<'PlanDetail'>) {
  const { planId } = route.params;
  const [plan, setPlan] = useState<Plan | null>(null);
  const [routeSummary, setRouteSummary] = useState<PlanRoute | null>(null);
  const [mode, setMode] = useState<TravelMode>('DRIVE');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routing, setRouting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  const load = useCallback(async (asRefresh = false) => {
    asRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    try {
      setPlan(await planService.get(planId));
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [planId]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  async function computeRoute(selectedMode: TravelMode) {
    setMode(selectedMode);
    setRouting(true);
    setRouteError(null);
    try {
      setRouteSummary(await planService.route(planId, selectedMode));
    } catch (computeError) {
      setRouteSummary(null);
      setRouteError(getErrorMessage(computeError));
    } finally {
      setRouting(false);
    }
  }

  function confirmDeleteStop(stop: PlanStop) {
    Alert.alert('Remove this stop?', stop.name, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await planService.deleteStop(stop.id);
            setPlan((current) => current ? { ...current, stops: current.stops.filter((item) => item.id !== stop.id) } : current);
            setRouteSummary(null);
          } catch (deleteError) {
            Alert.alert('Could not remove stop', getErrorMessage(deleteError));
          }
        },
      },
    ]);
  }

  function confirmDeletePlan() {
    Alert.alert('Delete this itinerary?', 'This also removes every stop and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await planService.delete(planId);
            navigation.goBack();
          } catch (deleteError) {
            Alert.alert('Could not delete itinerary', getErrorMessage(deleteError));
          }
        },
      },
    ]);
  }

  if (loading) return <StateView loading title="Opening itinerary…" />;
  if (!plan) return <StateView actionLabel="Try again" message={error ?? undefined} onAction={() => void load()} title="Could not open itinerary" />;

  const orderedStops = [...plan.stops].sort((left, right) => (left.orderIndex ?? 0) - (right.orderIndex ?? 0));
  const nextOrderIndex = orderedStops.reduce(
    (maximum, stop) => Math.max(maximum, stop.orderIndex ?? -1),
    -1,
  ) + 1;

  return (
    <Screen onRefresh={() => void load(true)} refreshing={refreshing} safeTop={false}>
      <PlayfulHero
        badge={<Chip label={plan.status} tone={plan.status === 'COMPLETED' ? 'success' : plan.status === 'CANCELLED' ? 'danger' : 'warning'} />}
        description={plan.planDescription}
        title={plan.planName}
      >
        <View style={styles.heroMeta}>
          <Ionicons color={colors.heroTextSubtle} name="calendar-outline" size={18} />
          <Text style={styles.heroMetaText}>{formatDateRange(plan.planStartDate, plan.planEndDate)}</Text>
        </View>
        <View style={styles.heroMeta}>
          <Ionicons color={colors.heroTextSubtle} name="time-outline" size={18} />
          <Text style={styles.heroMetaText}>{formatTime(plan.planStartTime)} – {formatTime(plan.planEndTime)}</Text>
        </View>
      </PlayfulHero>

      <View style={styles.section}>
        <SectionHeader title={`Itinerary · ${orderedStops.length}`} />
        {orderedStops.map((stop, index) => (
          <View key={stop.id} style={styles.stopRow}>
            <View style={styles.timelineColumn}>
              <View style={styles.stopNumber}><Text style={styles.stopNumberText}>{index + 1}</Text></View>
              {index < orderedStops.length - 1 ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.stopCard}>
              <View style={styles.stopTop}>
                <View style={styles.stopCopy}>
                  <Text style={styles.stopTime}>{formatTime(stop.arrivalTime)} – {formatTime(stop.departureTime)}</Text>
                  <Text style={styles.stopName}>{stop.name}</Text>
                </View>
                <Pressable
                  accessibilityLabel={`Remove ${stop.name}`}
                  accessibilityRole="button"
                  onPress={() => confirmDeleteStop(stop)}
                  style={styles.stopAction}
                >
                  <Ionicons color={colors.textMuted} name="ellipsis-horizontal" size={22} />
                </Pressable>
              </View>
              {stop.address ? <Text style={styles.stopAddress}>{stop.address}</Text> : null}
              {stop.note ? <Text style={styles.stopNote}>{stop.note}</Text> : null}
              {stop.rating ? <Text style={styles.rating}>★ {stop.rating} {stop.ratingCount ? `(${stop.ratingCount})` : ''}</Text> : null}
            </View>
          </View>
        ))}
        {!orderedStops.length ? (
          <View style={styles.emptyStop}>
            <Ionicons color={colors.primary} name="location-outline" size={30} />
            <Text style={styles.emptyTitle}>Build the day, one place at a time</Text>
            <Text style={styles.emptyCopy}>Add at least two places to calculate a route.</Text>
          </View>
        ) : null}
        <AppButton
          icon="add"
          label="Add a place"
          onPress={() => navigation.navigate('AddStop', { planId, nextOrderIndex })}
          variant="secondary"
        />
      </View>

      {orderedStops.length >= 2 ? (
        <View style={styles.routeCard}>
          <SectionHeader title="Route" />
          <View style={styles.modes}>
            {(['DRIVE', 'WALK', 'BICYCLE'] as TravelMode[]).map((travelMode) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ busy: routing && mode === travelMode, disabled: routing, selected: mode === travelMode }}
                disabled={routing}
                key={travelMode}
                onPress={() => void computeRoute(travelMode)}
                style={[styles.mode, mode === travelMode && styles.modeSelected, routing && styles.modeDisabled]}
              >
                <Ionicons color={mode === travelMode ? colors.white : colors.textMuted} name={modeIcons[travelMode]} size={19} />
                <Text style={[styles.modeText, mode === travelMode && styles.modeTextSelected]}>{travelMode.toLowerCase()}</Text>
              </Pressable>
            ))}
          </View>
          {!routeSummary && !routeError ? <AppButton label="Calculate route" loading={routing} onPress={() => void computeRoute(mode)} /> : null}
          {routeError ? (
            <View style={styles.routeError}>
              <Text style={styles.routeErrorText}>{routeError}</Text>
              <AppButton compact label="Try again" loading={routing} onPress={() => void computeRoute(mode)} variant="ghost" />
            </View>
          ) : null}
          {routeSummary ? (
            <View style={styles.routeSummary}>
              <View style={styles.routeMetric}>
                <Text style={styles.routeMetricValue}>{formatDistance(routeSummary.distanceMeters)}</Text>
                <Text style={styles.routeMetricLabel}>total distance</Text>
              </View>
              <View style={styles.routeDivider} />
              <View style={styles.routeMetric}>
                <Text style={styles.routeMetricValue}>{formatDuration(routeSummary.durationSeconds)}</Text>
                <Text style={styles.routeMetricLabel}>travel time</Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : null}

      <AppButton label="Delete itinerary" onPress={confirmDeletePlan} variant="danger" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  emptyCopy: { color: colors.textMuted, fontSize: typography.small, textAlign: 'center' },
  emptyStop: { alignItems: 'center', backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderStyle: 'dashed', borderWidth: 1, gap: spacing.sm, padding: spacing.xl },
  emptyTitle: { color: colors.text, fontSize: typography.body, fontWeight: '800', textAlign: 'center' },
  heroMeta: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  heroMetaText: { color: colors.heroTextSubtle, fontSize: typography.small, fontWeight: '700' },
  mode: { alignItems: 'center', backgroundColor: colors.surfaceMuted, borderRadius: radius.pill, flexDirection: 'row', gap: spacing.xs, minHeight: 44, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  modeDisabled: { opacity: 0.6 },
  modeSelected: { backgroundColor: colors.primary },
  modeText: { color: colors.textMuted, fontSize: typography.caption, fontWeight: '800', textTransform: 'capitalize' },
  modeTextSelected: { color: colors.white },
  modes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  rating: { color: colors.warningText, fontSize: typography.caption, fontWeight: '800' },
  routeCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, padding: spacing.lg, ...shadows },
  routeDivider: { backgroundColor: colors.border, height: 48, width: StyleSheet.hairlineWidth },
  routeError: { backgroundColor: colors.warningSoft, borderRadius: radius.md, gap: spacing.md, padding: spacing.md },
  routeErrorText: { color: colors.warningText, fontSize: typography.small, lineHeight: 20 },
  routeMetric: { alignItems: 'center', flex: 1, gap: spacing.xs },
  routeMetricLabel: { color: colors.textMuted, fontSize: typography.caption },
  routeMetricValue: { color: colors.primaryDark, fontSize: typography.heading, fontWeight: '900' },
  routeSummary: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md, flexDirection: 'row', padding: spacing.lg },
  section: { gap: spacing.md },
  stopAddress: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
  stopAction: { alignItems: 'center', height: 44, justifyContent: 'center', width: 44 },
  stopCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, flex: 1, gap: spacing.sm, marginBottom: spacing.md, padding: spacing.lg },
  stopCopy: { flex: 1, gap: spacing.xs },
  stopName: { color: colors.text, fontSize: typography.body, fontWeight: '800' },
  stopNote: { backgroundColor: colors.surfaceMuted, borderRadius: radius.sm, color: colors.textMuted, fontSize: typography.small, lineHeight: 20, padding: spacing.sm },
  stopNumber: { alignItems: 'center', backgroundColor: colors.primary, borderRadius: 16, height: 32, justifyContent: 'center', width: 32 },
  stopNumberText: { color: colors.white, fontSize: typography.small, fontWeight: '900' },
  stopRow: { alignItems: 'stretch', flexDirection: 'row', gap: spacing.md },
  stopTime: { color: colors.primary, fontSize: typography.caption, fontWeight: '800' },
  stopTop: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  timelineColumn: { alignItems: 'center', width: 32 },
  timelineLine: { backgroundColor: colors.border, flex: 1, marginVertical: spacing.xs, width: 2 },
});
