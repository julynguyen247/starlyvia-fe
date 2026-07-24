import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { ResponsiveFieldRow } from '../../components/ResponsiveFieldRow';
import { Screen } from '../../components/Screen';
import { TravelScene } from '../../components/TravelScene';
import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import { getErrorMessage } from '../../services/apiClient';
import { placeService } from '../../services/placeService';
import { planService } from '../../services/planService';
import { radius, shadows, spacing, stickerPalette, typography, type ThemeColors } from '../../theme/tokens';
import type { PlaceDetails, PlaceSuggestion, RouteCoordinate } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';
import { createSessionId } from '../../utils/id';
import { isTime } from '../../utils/validation';
import { PlaceMapPicker, type MapViewport } from './PlaceMapPicker';

type Errors = Partial<Record<'query' | 'arrivalTime' | 'departureTime', string>>;
type PickerMode = 'search' | 'map';
type UsablePlaceSuggestion = PlaceSuggestion & { name: string; providerPlaceId: string };
type SelectedPlace = PlaceDetails & { name: string };

const initialMapViewport: MapViewport = {
  latitude: 20,
  longitude: 0,
  zoom: 1.4,
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

function openProviderUrl(url: string, errorTitle: string, errorMessage: string) {
  void Linking.openURL(url).catch(() => {
    Alert.alert(errorTitle, errorMessage);
  });
}

export function AddStopScreen({ navigation, route }: RootScreenProps<'AddStop'>) {
  const { planId, nextOrderIndex } = route.params;
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const sessionToken = useMemo(createSessionId, []);
  const [pickerMode, setPickerMode] = useState<PickerMode>('map');
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UsablePlaceSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [selectedCoordinate, setSelectedCoordinate] = useState<RouteCoordinate | null>(null);
  const [mapViewport, setMapViewport] = useState<MapViewport>(initialMapViewport);
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
      const message = t('addStop.missingName');
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
      if (errorTarget === 'search') setPickerMode('map');
    } else {
      setSelectedCoordinate(null);
    }
  }

  async function selectSuggestion(suggestion: UsablePlaceSuggestion) {
    const generation = ++detailsRequestGeneration.current;
    setSelecting(true);
    setSearchError(null);
    try {
      const details = await placeService.details(suggestion.provider, suggestion.providerPlaceId);
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
    if (!query.trim()) setQuery(t('addStop.pinnedStop'));
  }

  async function exploreArea() {
    if (exploring) return;
    const generation = ++nearbyRequestGeneration.current;
    setExploring(true);
    setNearbyError(null);
    try {
      const places = await placeService.nearby(mapViewport.latitude, mapViewport.longitude);
      if (!mountedRef.current || generation !== nearbyRequestGeneration.current) return;
      const mappablePlaces = places.flatMap((place) => {
        const normalizedPlace = normalizePlace(place);
        return normalizedPlace && normalizedPlace.latitude !== null && normalizedPlace.longitude !== null
          ? [normalizedPlace]
          : [];
      });
      setNearbyPlaces(mappablePlaces);
      if (mappablePlaces.length === 0) setNearbyError(t('addStop.noNearby'));
    } catch (error) {
      if (!mountedRef.current || generation !== nearbyRequestGeneration.current) return;
      setNearbyError(`${getErrorMessage(error)} ${t('addStop.pinFallback')}`);
    } finally {
      if (mountedRef.current && generation === nearbyRequestGeneration.current) setExploring(false);
    }
  }

  async function submit() {
    const nextErrors: Errors = {
      query: !query.trim() ? t('addStop.nameError') : undefined,
      arrivalTime: !isTime(arrivalTime) ? t('addStop.timeError') : undefined,
      departureTime: !isTime(departureTime)
        ? t('addStop.timeError')
        : isTime(arrivalTime) && departureTime <= arrivalTime
          ? t('addStop.departureError')
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
      Alert.alert(t('addStop.submitError'), getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function updateQuery(value: string) {
    detailsRequestGeneration.current += 1;
    setSelecting(false);
    setCompletedQuery(null);
    setSearchError(null);
    setSuggestions([]);
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

  function updateMapViewport(viewport: MapViewport) {
    nearbyRequestGeneration.current += 1;
    setExploring(false);
    setNearbyPlaces([]);
    setNearbyError(null);
    setMapViewport(viewport);
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
      <View style={styles.hero}>
        <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.heroGlow} />
        <View style={styles.heroCopy}>
          <View style={styles.heroEyebrow}>
            <Ionicons color={colors.onSticker} name="navigate" size={14} />
            <Text style={styles.heroEyebrowText}>{t('addStop.eyebrow')}</Text>
          </View>
          <Text accessibilityRole="header" style={styles.heroTitle}>{t('addStop.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('addStop.subtitle')}</Text>
        </View>
        <TravelScene scene="place" size={118} style={styles.heroScene} />
      </View>

      <View accessibilityLabel={t('addStop.selectionMethod')} accessibilityRole="tablist" style={styles.modeSwitch}>
        {([
          { icon: 'map-outline' as const, value: 'map' as const },
          { icon: 'search-outline' as const, value: 'search' as const },
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
              <Ionicons color={active ? colors.onSticker : colors.heroTextMuted} name={item.icon} size={19} />
              <Text style={[styles.modeText, active && styles.modeTextActive]}>{t(item.value === 'map' ? 'addStop.map' : 'addStop.search')}</Text>
            </Pressable>
          );
        })}
      </View>
      <View accessibilityLabel={t('addStop.providers')} style={styles.attribution}>
        <Text style={styles.attributionText}>{t('addStop.maps')} </Text>
        <Pressable
          accessibilityLabel={t('addStop.openOsm')}
          accessibilityRole="link"
          onPress={() => openProviderUrl('https://www.openstreetmap.org/copyright', t('addStop.linkErrorTitle'), t('addStop.linkErrorMessage'))}
        >
          <Text style={styles.attributionLink}>© OpenStreetMap contributors</Text>
        </Pressable>
        <Text style={styles.attributionText}> · </Text>
        <Pressable
          accessibilityLabel={t('addStop.openGeoapify')}
          accessibilityRole="link"
          onPress={() => openProviderUrl('https://www.geoapify.com/', t('addStop.linkErrorTitle'), t('addStop.linkErrorMessage'))}
        >
          <Text style={styles.attributionLink}>{t('addStop.poweredBy')}</Text>
        </Pressable>
      </View>

      {pickerMode === 'map' ? (
        <View style={styles.mapSection}>
          <PlaceMapPicker
            nearbyPlaces={nearbyPlaces}
            onSelectCoordinate={selectMapCoordinate}
            onSelectPlace={applyCatalogPlace}
            onViewportChange={updateMapViewport}
            selectedCoordinate={selectedCoordinate}
          />
          {selectedPlace ? <SelectedPlaceCard colors={colors} place={selectedPlace} styles={styles} /> : null}
          <View style={styles.mapActions}>
            <View style={styles.mapCopy}>
              <Text style={styles.mapEyebrow}>{selectedCoordinate ? t('addStop.pinReady') : t('addStop.exploreMode')}</Text>
              <Text style={styles.mapTitle}>{selectedCoordinate ? t('addStop.spotGood') : t('addStop.findNeighborhood')}</Text>
              <Text style={styles.mapSubtitle}>
                {selectedCoordinate
                  ? `${selectedCoordinate.latitude.toFixed(5)}, ${selectedCoordinate.longitude.toFixed(5)}`
                  : t('addStop.mapHint')}
              </Text>
            </View>
            <AppButton compact icon="sparkles-outline" label={t('addStop.exploreHere')} loading={exploring} onPress={() => void exploreArea()} variant="secondary" />
          </View>
          {nearbyError ? <Text accessibilityLiveRegion="polite" style={styles.nearbyError}>{nearbyError}</Text> : null}
          {nearbyPlaces.length ? (
            <View accessibilityLabel={t('addStop.nearbyPlaces')} style={styles.nearbyList}>
              <Text style={styles.nearbyTitle}>{t('addStop.nearbyPicks')}</Text>
              {nearbyPlaces.slice(0, 5).map((place) => (
                <PlaceResult
                  address={place.address ?? t('addStop.addressUnavailable')}
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
          <AppInput editable={!submitting} autoCapitalize="words" error={errors.query} icon="flag-outline" label={t('addStop.stopName')} onChangeText={updateQuery} placeholder={t('addStop.stopNamePlaceholder')} value={query} />
        </View>
      ) : (
        <>
          <AppInput editable={!submitting} autoCapitalize="words" error={errors.query} icon="search-outline" label={t('addStop.place')} onChangeText={updateQuery} placeholder={t('addStop.placePlaceholder')} value={query} />
          {selectedPlace && !selectedCoordinate ? (
            <SelectedPlaceCard colors={colors} place={selectedPlace} styles={styles} />
          ) : null}
          {searching || selecting ? (
            <View accessibilityLabel={selecting ? t('addStop.openingPlace') : t('addStop.searchingPlaces')} accessibilityLiveRegion="polite" accessibilityState={{ busy: true }} style={styles.searching}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.searchingText}>{selecting ? t('addStop.openingPlaceMessage') : t('addStop.searchingMessage')}</Text>
            </View>
          ) : null}
          {searchError ? (
            <View accessibilityLiveRegion="polite" style={styles.searchErrorCard}>
              <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.searchErrorIcon}>
                <Ionicons color={colors.warningText} name="cloud-offline-outline" size={21} />
              </View>
              <Text style={styles.searchError}>{searchError} {t('addStop.manualFallback')}</Text>
            </View>
          ) : null}
          {suggestions.length ? (
            <View accessibilityLabel={t('addStop.suggestions')} style={styles.results}>
              <Text style={styles.resultsTitle}>{t('addStop.bestMatches')}</Text>
              {suggestions.map((suggestion) => (
                <PlaceResult
                  address={suggestion.address || suggestion.fullText || t('addStop.addressUnavailable')}
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
                <Text style={styles.noResultsTitle}>{t('addStop.noMatchTitle')}</Text>
                <Text style={styles.noResultsText}>{t('addStop.noMatchMessage')}</Text>
              </View>
            </View>
          ) : null}
        </>
      )}

      <View style={styles.detailsCard}>
        <View style={styles.detailsHeading}>
          <View style={styles.detailsIcon}><Ionicons color={colors.primary} name="create-outline" size={20} /></View>
          <View style={styles.detailsHeadingCopy}>
            <Text accessibilityRole="header" style={styles.detailsTitle}>{t('addStop.detailsTitle')}</Text>
            <Text style={styles.detailsSubtitle}>{t('addStop.detailsSubtitle')}</Text>
          </View>
        </View>
        <AppInput editable={!submitting} label={t('addStop.address')} onChangeText={setAddress} placeholder={t('addStop.addressPlaceholder')} value={address} />
        <ResponsiveFieldRow>
          <AppInput editable={!submitting} error={errors.arrivalTime} keyboardType="numbers-and-punctuation" label={t('addStop.arrive')} onChangeText={(value) => { setArrivalTime(value); setErrors((current) => ({ ...current, arrivalTime: undefined })); }} placeholder="10:00" value={arrivalTime} />
          <AppInput editable={!submitting} error={errors.departureTime} keyboardType="numbers-and-punctuation" label={t('addStop.leave')} onChangeText={(value) => { setDepartureTime(value); setErrors((current) => ({ ...current, departureTime: undefined })); }} placeholder="11:00" value={departureTime} />
        </ResponsiveFieldRow>
        <AppInput editable={!submitting} label={t('addStop.note')} maxLength={500} multiline onChangeText={setNote} placeholder={t('addStop.notePlaceholder')} value={note} />
      </View>
      <AppButton icon="add-circle-outline" label={t('addStop.action')} loading={submitting} onPress={() => void submit()} />
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
      <View style={styles.resultIcon}><Ionicons color={colors.onSticker} name="location" size={19} /></View>
      <View style={styles.resultCopy}>
        <Text numberOfLines={1} style={styles.resultName}>{name}</Text>
        <Text numberOfLines={2} style={styles.resultAddress}>{address}</Text>
      </View>
      <Ionicons color={selected ? colors.success : colors.textMuted} name={selected ? 'checkmark-circle' : 'arrow-forward'} size={19} />
    </Pressable>
  );
}

type SelectedPlaceCardProps = {
  colors: ThemeColors;
  place: SelectedPlace;
  styles: ReturnType<typeof createStyles>;
};

function SelectedPlaceCard({ colors, place, styles }: SelectedPlaceCardProps) {
  const { t } = useLanguage();
  return (
    <View accessibilityLabel={t('addStop.catalogMatch', { name: place.name })} accessibilityLiveRegion="polite" style={styles.selected}>
      <View style={styles.selectedStamp}><Ionicons color={colors.onSticker} name="checkmark" size={20} /></View>
      <View style={styles.selectedCopy}>
        <Text style={styles.selectedEyebrow}>{t('addStop.locked')}</Text>
        <Text numberOfLines={1} style={styles.selectedTitle}>{place.name}</Text>
        <Text numberOfLines={2} style={styles.selectedMeta}>{place.address || t('addStop.addressUnavailable')}</Text>
      </View>
      {place.rating ? <Text style={styles.rating}>★ {place.rating}</Text> : null}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    attribution: {
      alignItems: 'center',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: -spacing.sm,
    },
    attributionLink: { color: colors.primaryText, fontSize: 10, fontWeight: '800', lineHeight: 18, textDecorationLine: 'underline' },
    attributionText: { color: colors.textMuted, fontSize: 10, lineHeight: 18 },
    detailsCard: {
      backgroundColor: colors.surface,
      borderColor: stickerPalette.violet,
      borderRadius: radius.lg,
      borderTopWidth: 3,
      gap: spacing.md,
      padding: spacing.lg,
      ...shadows,
    },
    detailsHeading: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
    detailsHeadingCopy: { flex: 1, gap: spacing.xs },
    detailsIcon: { alignItems: 'center', backgroundColor: stickerPalette.violet, borderRadius: radius.md, height: 44, justifyContent: 'center', width: 44 },
    detailsSubtitle: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
    detailsTitle: { color: colors.text, fontSize: typography.heading, fontWeight: '900' },
    hero: {
      alignItems: 'center',
      backgroundColor: colors.primaryDark,
      borderColor: stickerPalette.violet,
      borderRadius: radius.xl,
      borderWidth: 1,
      flexDirection: 'row',
      gap: spacing.sm,
      minHeight: 176,
      overflow: 'hidden',
      padding: spacing.lg,
      ...shadows,
    },
    heroCopy: { flex: 1, gap: spacing.sm, minWidth: 174, zIndex: 1 },
    heroEyebrow: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: stickerPalette.green,
      borderRadius: radius.pill,
      flexDirection: 'row',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 6,
    },
    heroEyebrowText: { color: colors.onSticker, fontSize: 10, fontWeight: '900', letterSpacing: 0.9 },
    heroGlow: {
      backgroundColor: stickerPalette.violet,
      borderRadius: radius.pill,
      height: 190,
      opacity: 0.16,
      position: 'absolute',
      right: -48,
      top: -70,
      width: 190,
    },
    heroScene: { marginBottom: -spacing.md, marginRight: -spacing.md, marginTop: -spacing.md },
    heroSubtitle: { color: colors.heroTextMuted, fontSize: typography.small, lineHeight: 20 },
    heroTitle: { color: colors.heroText, fontSize: typography.title, fontWeight: '900', letterSpacing: -0.7, lineHeight: 31 },
    mapActions: {
      alignItems: 'center',
      backgroundColor: colors.primaryDark,
      borderColor: stickerPalette.violet,
      borderRadius: radius.lg,
      borderWidth: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    mapCopy: { flex: 1, gap: spacing.xs, minWidth: 180 },
    mapSection: { gap: spacing.md },
    mapEyebrow: { color: stickerPalette.green, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    mapSubtitle: { color: colors.heroTextMuted, fontSize: typography.caption, lineHeight: 18 },
    mapTitle: { color: colors.heroText, fontSize: typography.body, fontWeight: '900' },
    mode: { alignItems: 'center', borderRadius: radius.pill, flex: 1, flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', minHeight: 46, paddingHorizontal: spacing.md },
    modeActive: { backgroundColor: stickerPalette.violet },
    modeSwitch: { backgroundColor: colors.primaryDark, borderColor: stickerPalette.violet, borderRadius: radius.pill, borderWidth: 1, flexDirection: 'row', gap: spacing.xs, padding: spacing.xs },
    modeText: { color: colors.heroTextMuted, fontSize: typography.small, fontWeight: '800' },
    modeTextActive: { color: colors.onSticker },
    nearbyError: { backgroundColor: colors.warningSoft, borderColor: colors.warning, borderRadius: radius.md, borderWidth: 1, color: colors.warningText, fontSize: typography.small, lineHeight: 21, padding: spacing.md },
    nearbyList: { backgroundColor: colors.surface, borderColor: stickerPalette.green, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
    nearbyTitle: { color: colors.text, fontSize: typography.small, fontWeight: '900', letterSpacing: 0.3, padding: spacing.md },
    noResults: { alignItems: 'center', backgroundColor: colors.surface, borderColor: stickerPalette.violet, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
    noResultsCopy: { flex: 1, gap: spacing.xs },
    noResultsText: { color: colors.textMuted, fontSize: typography.small, lineHeight: 20 },
    noResultsTitle: { color: colors.text, fontSize: typography.small, fontWeight: '900' },
    pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
    rating: { backgroundColor: stickerPalette.coral, borderRadius: radius.pill, color: colors.onSticker, fontSize: typography.caption, fontWeight: '900', overflow: 'hidden', paddingHorizontal: spacing.sm, paddingVertical: 6 },
    result: { alignItems: 'center', borderTopColor: colors.border, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: spacing.md, minHeight: 66, padding: spacing.md },
    resultAddress: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 17 },
    resultCopy: { flex: 1, gap: 3 },
    resultIcon: { alignItems: 'center', backgroundColor: stickerPalette.green, borderRadius: radius.sm, height: 40, justifyContent: 'center', width: 40 },
    resultName: { color: colors.text, fontSize: typography.small, fontWeight: '800' },
    resultSelected: { backgroundColor: colors.surfaceWarm, borderLeftColor: stickerPalette.coral, borderLeftWidth: 4 },
    results: { backgroundColor: colors.surface, borderColor: stickerPalette.violet, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
    resultsTitle: { color: colors.text, fontSize: typography.small, fontWeight: '900', padding: spacing.md },
    searchError: { color: colors.warningText, flex: 1, fontSize: typography.small, fontWeight: '600', lineHeight: 21 },
    searchErrorCard: { alignItems: 'flex-start', backgroundColor: colors.warningSoft, borderColor: colors.warning, borderRadius: radius.md, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
    searchErrorIcon: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.pill, height: 38, justifyContent: 'center', width: 38 },
    searching: { alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', minHeight: 48 },
    searchingText: { color: colors.text, fontSize: typography.small, fontWeight: '700' },
    selected: { alignItems: 'center', backgroundColor: colors.primaryDark, borderColor: stickerPalette.coral, borderRadius: radius.lg, borderWidth: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md, ...shadows },
    selectedCopy: { flex: 1, gap: spacing.xs },
    selectedEyebrow: { color: stickerPalette.green, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    selectedMeta: { color: colors.heroTextMuted, fontSize: typography.caption, lineHeight: 18 },
    selectedStamp: { alignItems: 'center', backgroundColor: stickerPalette.coral, borderRadius: radius.pill, height: 42, justifyContent: 'center', width: 42 },
    selectedTitle: { color: colors.heroText, fontSize: typography.body, fontWeight: '900' },
  });
}
