import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { Region } from 'react-native-maps';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { ResponsiveFieldRow } from '../../components/ResponsiveFieldRow';
import { Screen } from '../../components/Screen';
import { ScreenIntro } from '../../components/ScreenIntro';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { placeService } from '../../services/placeService';
import { planService } from '../../services/planService';
import { radius, spacing, typography, type ThemeColors } from '../../theme/tokens';
import type { PlaceDetails, PlaceSuggestion, RouteCoordinate } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';
import { createSessionId } from '../../utils/id';
import { isTime } from '../../utils/validation';
import { PlaceMapPicker } from './PlaceMapPicker';

type Errors = Partial<Record<'query' | 'arrivalTime' | 'departureTime', string>>;
type PickerMode = 'search' | 'map';
type UsablePlaceSuggestion = PlaceSuggestion & { name: string; providerPlaceId: string };
type SelectedPlace = PlaceDetails & { name: string };

const initialMapRegion: Region = {
  latitude: 20,
  latitudeDelta: 105,
  longitude: 0,
  longitudeDelta: 105,
};

function normalizeSuggestion(suggestion: PlaceSuggestion): UsablePlaceSuggestion | null {
  const name = suggestion.name?.trim();
  const providerPlaceId = suggestion.providerPlaceId?.trim();
  return name && providerPlaceId ? { ...suggestion, name, providerPlaceId } : null;
}

function normalizePlace(place: PlaceDetails): SelectedPlace | null {
  const name = place.name?.trim();
  return name ? {
    ...place,
    address: place.address?.trim() || null,
    name,
    providerPlaceId: place.providerPlaceId?.trim() || null,
  } : null;
}

export function AddStopScreen({ navigation, route }: RootScreenProps<'AddStop'>) {
  const { planId, nextOrderIndex } = route.params;
  const { colors } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const sessionToken = useMemo(createSessionId, []);
  const [pickerMode, setPickerMode] = useState<PickerMode>('map');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UsablePlaceSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState<RouteCoordinate | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>(initialMapRegion);
  const [nearbyPlaces, setNearbyPlaces] = useState<SelectedPlace[]>([]);
  const [address, setAddress] = useState('');
  const [arrivalTime, setArrivalTime] = useState('10:00');
  const [departureTime, setDepartureTime] = useState('11:00');
  const [note, setNote] = useState('');
  const [searching, setSearching] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [nearbyError, setNearbyError] = useState<string | null>(null);
  const [completedQuery, setCompletedQuery] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const detailsRequestGeneration = useRef(0);
  const nearbyRequestGeneration = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      detailsRequestGeneration.current += 1;
      nearbyRequestGeneration.current += 1;
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (pickerMode !== 'search' || selectedPlace || trimmed.length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const result = await placeService.autocomplete(trimmed, sessionToken);
        if (active) {
          setSuggestions(result.flatMap((suggestion) => {
            const usableSuggestion = normalizeSuggestion(suggestion);
            return usableSuggestion ? [usableSuggestion] : [];
          }));
          setCompletedQuery(trimmed);
        }
      } catch (error) {
        if (active) {
          setCompletedQuery(null);
          setSearchError(getErrorMessage(error));
        }
      } finally {
        if (active) setSearching(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [pickerMode, query, selectedPlace, sessionToken]);

  function applyCatalogPlace(place: PlaceDetails, errorTarget: PickerMode = 'map') {
    const normalizedPlace = normalizePlace(place);
    if (!normalizedPlace) {
      const message = 'This place is missing a name. Choose another result or drop your own pin.';
      if (errorTarget === 'search') setSearchError(message);
      else setNearbyError(message);
      return;
    }

    setSelectedPlace(normalizedPlace);
    setQuery(normalizedPlace.name);
    setAddress(normalizedPlace.address ?? '');
    setSuggestions([]);
    setCompletedQuery(null);
    setSearchError(null);
    setNearbyError(null);
    setErrors((current) => ({ ...current, query: undefined }));
    if (normalizedPlace.latitude !== null && normalizedPlace.longitude !== null) {
      setSelectedCoordinate({ latitude: normalizedPlace.latitude, longitude: normalizedPlace.longitude });
    } else {
      setSelectedCoordinate(null);
    }
  }

  async function selectSuggestion(suggestion: UsablePlaceSuggestion) {
    const generation = ++detailsRequestGeneration.current;
    setSelecting(true);
    setSearchError(null);
    try {
      const details = await placeService.details(suggestion.providerPlaceId);
      if (!mountedRef.current || generation !== detailsRequestGeneration.current) return;
      applyCatalogPlace(details, 'search');
    } catch (error) {
      if (!mountedRef.current || generation !== detailsRequestGeneration.current) return;
      setSearchError(getErrorMessage(error));
    } finally {
      if (mountedRef.current && generation === detailsRequestGeneration.current) {
        setSelecting(false);
      }
    }
  }

  function selectMapCoordinate(coordinate: RouteCoordinate) {
    detailsRequestGeneration.current += 1;
    setSelecting(false);
    if (selectedPlace) setAddress('');
    setSelectedPlace(null);
    setSelectedCoordinate(coordinate);
    setSuggestions([]);
    setCompletedQuery(null);
    setSearchError(null);
    setErrors((current) => ({ ...current, query: undefined }));
    if (!query.trim()) setQuery('Pinned stop');
  }

  async function exploreArea() {
    if (exploring) return;
    const generation = ++nearbyRequestGeneration.current;
    setExploring(true);
    setNearbyError(null);
    try {
      const places = await placeService.nearby(mapRegion.latitude, mapRegion.longitude);
      if (!mountedRef.current || generation !== nearbyRequestGeneration.current) return;
      const mappablePlaces = places.flatMap((place) => {
        const normalizedPlace = normalizePlace(place);
        return normalizedPlace && normalizedPlace.latitude !== null && normalizedPlace.longitude !== null
          ? [normalizedPlace]
          : [];
      });
      setNearbyPlaces(mappablePlaces);
      if (mappablePlaces.length === 0) setNearbyError('No catalog places were found in this area. You can still drop your own pin.');
    } catch (error) {
      if (!mountedRef.current || generation !== nearbyRequestGeneration.current) return;
      setNearbyError(`${getErrorMessage(error)} You can still drop your own pin.`);
    } finally {
      if (mountedRef.current && generation === nearbyRequestGeneration.current) setExploring(false);
    }
  }

  async function submit() {
    const nextErrors: Errors = {
      query: !query.trim() ? 'Give this stop a name.' : undefined,
      arrivalTime: !isTime(arrivalTime) ? 'Use 24-hour HH:mm.' : undefined,
      departureTime: !isTime(departureTime)
        ? 'Use 24-hour HH:mm.'
        : isTime(arrivalTime) && departureTime <= arrivalTime
          ? 'Leave after you arrive.'
          : undefined,
    };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await planService.addStop(planId, {
        address: address.trim() || undefined,
        arrivalTime: `${arrivalTime}:00`,
        departureTime: `${departureTime}:00`,
        latitude: selectedCoordinate?.latitude,
        longitude: selectedCoordinate?.longitude,
        name: selectedPlace?.name ?? query.trim(),
        note: note.trim() || undefined,
        orderIndex: nextOrderIndex,
        phoneNumber: selectedPlace?.phoneNumber ?? undefined,
        photoUrl: selectedPlace?.photoUrl ?? undefined,
        provider: selectedPlace?.provider,
        providerPlaceId: selectedPlace?.providerPlaceId ?? undefined,
        rating: selectedPlace?.rating ?? undefined,
        ratingCount: selectedPlace?.ratingCount ?? undefined,
        websiteUrl: selectedPlace?.websiteUrl ?? undefined,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not add stop', getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function updateQuery(value: string) {
    detailsRequestGeneration.current += 1;
    setSelecting(false);
    setCompletedQuery(null);
    setErrors((current) => ({ ...current, query: undefined }));
    if (selectedPlace && value !== selectedPlace.name) {
      setSelectedPlace(null);
      setSelectedCoordinate(null);
    }
    setQuery(value);
  }

  function choosePickerMode(mode: PickerMode) {
    if (mode === pickerMode) return;
    detailsRequestGeneration.current += 1;
    nearbyRequestGeneration.current += 1;
    setSelecting(false);
    setExploring(false);
    setPickerMode(mode);
  }

  function updateMapRegion(region: Region) {
    nearbyRequestGeneration.current += 1;
    setExploring(false);
    setNearbyPlaces([]);
    setNearbyError(null);
    setMapRegion(region);
  }

  const showNoResults = completedQuery === query.trim()
    && query.trim().length >= 2
    && !searching
    && !selecting
    && !selectedPlace
    && !searchError
    && suggestions.length === 0;

  return (
    <Screen safeTop={false}>
      <ScreenIntro
        scene="place"
        subtitle="Drop a pin, explore the neighborhood, or search by name."
        title="Choose the next stop"
      />

      <View accessibilityLabel="Place selection method" accessibilityRole="tablist" style={styles.modeSwitch}>
        {([
          { icon: 'map-outline' as const, label: 'Map', value: 'map' as const },
          { icon: 'search-outline' as const, label: 'Search', value: 'search' as const },
        ]).map((item) => {
          const active = pickerMode === item.value;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              key={item.value}
              onPress={() => choosePickerMode(item.value)}
              style={({ pressed }) => [styles.mode, active && styles.modeActive, pressed && styles.pressed]}
            >
              <Ionicons color={active ? colors.onPrimary : colors.textMuted} name={item.icon} size={19} />
              <Text style={[styles.modeText, active && styles.modeTextActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {pickerMode === 'map' ? (
        <View style={styles.mapSection}>
          <PlaceMapPicker
            nearbyPlaces={nearbyPlaces}
            onRegionChange={updateMapRegion}
            onSelectCoordinate={selectMapCoordinate}
            onSelectPlace={applyCatalogPlace}
            selectedCoordinate={selectedCoordinate}
          />
          <View style={styles.mapActions}>
            <View style={styles.mapCopy}>
              <Text style={styles.mapTitle}>{selectedCoordinate ? 'Pin ready' : 'Find your neighborhood'}</Text>
              <Text style={styles.mapSubtitle}>
                {selectedCoordinate
                  ? `${selectedCoordinate.latitude.toFixed(5)}, ${selectedCoordinate.longitude.toFixed(5)}`
                  : 'Move the map, then tap a spot or explore nearby places.'}
              </Text>
            </View>
            <AppButton compact icon="sparkles-outline" label="Explore here" loading={exploring} onPress={() => void exploreArea()} variant="secondary" />
          </View>
          {nearbyError ? <Text accessibilityLiveRegion="polite" style={styles.nearbyError}>{nearbyError}</Text> : null}
          {nearbyPlaces.length ? (
            <View accessibilityLabel="Nearby places" style={styles.nearbyList}>
              <Text style={styles.nearbyTitle}>Nearby picks</Text>
              {nearbyPlaces.slice(0, 5).map((place) => (
                <PlaceResult
                  address={place.address ?? 'Address unavailable'}
                  colors={colors}
                  key={place.providerPlaceId ?? `${place.latitude},${place.longitude}`}
                  name={place.name}
                  onPress={() => applyCatalogPlace(place)}
                  selected={selectedPlace?.providerPlaceId === place.providerPlaceId}
                  styles={styles}
                />
              ))}
            </View>
          ) : null}
          <AppInput editable={!submitting} autoCapitalize="words" error={errors.query} icon="flag-outline" label="Stop name" onChangeText={updateQuery} placeholder="Name your pinned stop" value={query} />
        </View>
      ) : (
        <>
          <AppInput editable={!submitting} autoCapitalize="words" error={errors.query} icon="search-outline" label="Place" onChangeText={updateQuery} placeholder="Search cafes, landmarks, hotels…" value={query} />
          {searching || selecting ? (
            <View accessibilityLabel={selecting ? 'Opening place' : 'Searching places'} accessibilityLiveRegion="polite" accessibilityState={{ busy: true }} style={styles.searching}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.searchingText}>{selecting ? 'Opening that place…' : 'Looking around the map…'}</Text>
            </View>
          ) : null}
          {searchError ? (
            <View accessibilityLiveRegion="polite" style={styles.searchErrorCard}>
              <Ionicons color={colors.warning} name="cloud-offline-outline" size={22} />
              <Text style={styles.searchError}>{searchError} You can still switch to the map or add this stop manually.</Text>
            </View>
          ) : null}
          {suggestions.length ? (
            <View accessibilityLabel="Place suggestions" style={styles.results}>
              <Text style={styles.resultsTitle}>Best matches</Text>
              {suggestions.map((suggestion) => (
                <PlaceResult
                  address={suggestion.address || suggestion.fullText || 'Address unavailable'}
                  colors={colors}
                  disabled={selecting}
                  key={suggestion.providerPlaceId}
                  name={suggestion.name}
                  onPress={() => void selectSuggestion(suggestion)}
                  styles={styles}
                />
              ))}
            </View>
          ) : null}
          {showNoResults ? (
            <View accessibilityLiveRegion="polite" style={styles.noResults}>
              <Ionicons color={colors.primary} name="trail-sign-outline" size={24} />
              <View style={styles.noResultsCopy}>
                <Text style={styles.noResultsTitle}>No exact match nearby</Text>
                <Text style={styles.noResultsText}>Keep your name and fill in the details, or switch to the map.</Text>
              </View>
            </View>
          ) : null}
        </>
      )}

      {selectedPlace ? (
        <View accessibilityLabel={`${selectedPlace.name} matched from the place catalog`} accessibilityLiveRegion="polite" style={styles.selected}>
          <View style={styles.selectedStamp}><Ionicons color={colors.success} name="checkmark" size={22} /></View>
          <View style={styles.selectedCopy}>
            <Text style={styles.selectedTitle}>Place matched</Text>
            <Text style={styles.selectedMeta}>{selectedPlace.address || 'Address unavailable'}</Text>
          </View>
          {selectedPlace.rating ? <Text style={styles.rating}>★ {selectedPlace.rating}</Text> : null}
        </View>
      ) : null}

      <View style={styles.detailsCard}>
        <View style={styles.detailsHeading}>
          <View style={styles.detailsIcon}><Ionicons color={colors.primary} name="create-outline" size={20} /></View>
          <View style={styles.detailsHeadingCopy}>
            <Text accessibilityRole="header" style={styles.detailsTitle}>Make it yours</Text>
            <Text style={styles.detailsSubtitle}>Add the practical bits for everyone on the trip.</Text>
          </View>
        </View>
        <AppInput editable={!submitting} label="Address" onChangeText={setAddress} placeholder="Optional for a custom pin" value={address} />
        <ResponsiveFieldRow>
          <AppInput editable={!submitting} error={errors.arrivalTime} keyboardType="numbers-and-punctuation" label="Arrive" onChangeText={(value) => { setArrivalTime(value); setErrors((current) => ({ ...current, arrivalTime: undefined })); }} placeholder="10:00" value={arrivalTime} />
          <AppInput editable={!submitting} error={errors.departureTime} keyboardType="numbers-and-punctuation" label="Leave" onChangeText={(value) => { setDepartureTime(value); setErrors((current) => ({ ...current, departureTime: undefined })); }} placeholder="11:00" value={departureTime} />
        </ResponsiveFieldRow>
        <AppInput editable={!submitting} label="Note" maxLength={500} multiline onChangeText={setNote} placeholder="Tickets, reservation, what to order…" value={note} />
      </View>
      <AppButton icon="add-circle-outline" label="Add to itinerary" loading={submitting} onPress={() => void submit()} />
    </Screen>
  );
}

type ResultProps = {
  address: string;
  colors: ThemeColors;
  disabled?: boolean;
  name: string;
  onPress: () => void;
  selected?: boolean;
  styles: ReturnType<typeof createStyles>;
};

function PlaceResult({ address, colors, disabled, name, onPress, selected, styles }: ResultProps) {
  return (
    <Pressable
      accessibilityLabel={`${name}. ${address}`}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.result, selected && styles.resultSelected, pressed && styles.pressed]}
    >
      <View style={styles.resultIcon}><Ionicons color={colors.primary} name="location" size={19} /></View>
      <View style={styles.resultCopy}>
        <Text numberOfLines={1} style={styles.resultName}>{name}</Text>
        <Text numberOfLines={2} style={styles.resultAddress}>{address}</Text>
      </View>
      <Ionicons color={selected ? colors.success : colors.textMuted} name={selected ? 'checkmark-circle' : 'arrow-forward'} size={19} />
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    detailsCard: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, gap: spacing.lg, padding: spacing.lg },
    detailsHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
    detailsHeadingCopy: { flex: 1, gap: spacing.xs },
    detailsIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md, height: 46, justifyContent: 'center', width: 46 },
    detailsSubtitle: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
    detailsTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '900' },
    mapActions: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' },
    mapCopy: { flex: 1, gap: spacing.xs, minWidth: 180 },
    mapSection: { gap: spacing.md },
    mapSubtitle: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 18 },
    mapTitle: { color: colors.text, fontSize: typography.body, fontWeight: '900' },
    mode: { alignItems: 'center', borderRadius: radius.pill, flex: 1, flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', minHeight: 46, paddingHorizontal: spacing.md },
    modeActive: { backgroundColor: colors.primary },
    modeSwitch: { backgroundColor: colors.surfaceMuted, borderColor: colors.border, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: spacing.xs, padding: spacing.xs },
    modeText: { color: colors.textMuted, fontSize: typography.small, fontWeight: '800' },
    modeTextActive: { color: colors.onPrimary },
    nearbyError: { backgroundColor: colors.warningSoft, borderRadius: radius.md, color: colors.warningText, fontSize: typography.small, lineHeight: 20, padding: spacing.md },
    nearbyList: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
    nearbyTitle: { color: colors.text, fontSize: typography.small, fontWeight: '900', padding: spacing.md },
    noResults: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.md, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
    noResultsCopy: { flex: 1, gap: spacing.xs },
    noResultsText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
    noResultsTitle: { color: colors.text, fontSize: typography.small, fontWeight: '900' },
    pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
    rating: { color: colors.warningText, fontSize: typography.small, fontWeight: '900' },
    result: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.md, minHeight: 70, padding: spacing.md },
    resultAddress: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 17 },
    resultCopy: { flex: 1, gap: 3 },
    resultIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.sm, height: 42, justifyContent: 'center', width: 42 },
    resultName: { color: colors.text, fontSize: typography.small, fontWeight: '800' },
    resultSelected: { backgroundColor: colors.successSoft },
    results: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
    resultsTitle: { color: colors.text, fontSize: typography.small, fontWeight: '900', padding: spacing.md },
    searchError: { color: colors.warningText, flex: 1, fontSize: typography.small, lineHeight: 20 },
    searchErrorCard: { alignItems: 'center', backgroundColor: colors.warningSoft, borderRadius: radius.md, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
    searching: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', minHeight: 44 },
    searchingText: { color: colors.text, fontSize: typography.small, fontWeight: '700' },
    selected: { alignItems: 'center', backgroundColor: colors.successSoft, borderColor: colors.success, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
    selectedCopy: { flex: 1, gap: spacing.xs },
    selectedMeta: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 18 },
    selectedStamp: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, height: 44, justifyContent: 'center', width: 44 },
    selectedTitle: { color: colors.successText, fontSize: typography.small, fontWeight: '900' },
  });
}
