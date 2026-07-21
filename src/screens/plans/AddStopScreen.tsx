import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { AppInput } from '../../components/AppInput';
import { ResponsiveFieldRow } from '../../components/ResponsiveFieldRow';
import { Screen } from '../../components/Screen';
import { ScreenIntro } from '../../components/ScreenIntro';
import { getErrorMessage } from '../../services/apiClient';
import { placeService } from '../../services/placeService';
import { planService } from '../../services/planService';
import { colors, radius, shadows, spacing, typography } from '../../theme/tokens';
import type { PlaceDetails, PlaceSuggestion } from '../../types/api';
import type { RootScreenProps } from '../../types/navigation';
import { createSessionId } from '../../utils/id';
import { isTime } from '../../utils/validation';

export function AddStopScreen({ navigation, route }: RootScreenProps<'AddStop'>) {
  const { planId, nextOrderIndex } = route.params;
  const sessionToken = useMemo(createSessionId, []);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null);
  const [address, setAddress] = useState('');
  const [arrivalTime, setArrivalTime] = useState('10:00');
  const [departureTime, setDepartureTime] = useState('11:00');
  const [note, setNote] = useState('');
  const [searching, setSearching] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const detailsRequestGeneration = useRef<number>(0);
  const mountedRef = useRef<boolean>(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      detailsRequestGeneration.current += 1;
    };
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (selectedPlace || trimmed.length < 2) {
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
        if (active) setSuggestions(result);
      } catch (error) {
        if (active) setSearchError(getErrorMessage(error));
      } finally {
        if (active) setSearching(false);
      }
    }, 350);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, selectedPlace, sessionToken]);

  async function selectSuggestion(suggestion: PlaceSuggestion) {
    const generation = ++detailsRequestGeneration.current;
    setSelecting(true);
    setSearchError(null);
    try {
      const details = await placeService.details(suggestion.providerPlaceId);
      if (!mountedRef.current || generation !== detailsRequestGeneration.current) return;
      setSelectedPlace(details);
      setQuery(details.name);
      setAddress(details.address);
      setSuggestions([]);
    } catch (error) {
      if (!mountedRef.current || generation !== detailsRequestGeneration.current) return;
      setSearchError(getErrorMessage(error));
    } finally {
      if (mountedRef.current && generation === detailsRequestGeneration.current) {
        setSelecting(false);
      }
    }
  }

  async function submit() {
    if (!query.trim()) {
      Alert.alert('Add a place name', 'Search for a place or enter a name manually.');
      return;
    }
    if (!isTime(arrivalTime) || !isTime(departureTime) || departureTime <= arrivalTime) {
      Alert.alert('Check the schedule', 'Use 24-hour HH:mm times and leave after you arrive.');
      return;
    }

    setSubmitting(true);
    try {
      await planService.addStop(planId, {
        address: address.trim() || undefined,
        arrivalTime: `${arrivalTime}:00`,
        departureTime: `${departureTime}:00`,
        latitude: selectedPlace?.latitude ?? undefined,
        longitude: selectedPlace?.longitude ?? undefined,
        name: selectedPlace?.name ?? query.trim(),
        note: note.trim() || undefined,
        orderIndex: nextOrderIndex,
        phoneNumber: selectedPlace?.phoneNumber ?? undefined,
        photoUrl: selectedPlace?.photoUrl ?? undefined,
        provider: selectedPlace?.provider,
        providerPlaceId: selectedPlace?.providerPlaceId,
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
    if (selectedPlace && value !== selectedPlace.name) setSelectedPlace(null);
    setQuery(value);
  }

  return (
    <Screen safeTop={false}>
      <ScreenIntro
        icon="location-outline"
        subtitle="Search the live place catalog, or enter a simple stop manually."
        title="Add a place"
      />
      <AppInput autoCapitalize="words" icon="search-outline" label="Place" onChangeText={updateQuery} placeholder="Search cafes, landmarks, hotels…" value={query} />
      {searching || selecting ? <ActivityIndicator accessibilityLabel={selecting ? 'Opening place' : 'Searching places'} color={colors.primary} /> : null}
      {searchError ? <Text accessibilityLiveRegion="polite" style={styles.searchError}>{searchError} You can still add this stop manually.</Text> : null}
      {suggestions.length ? (
        <View style={styles.results}>
          {suggestions.map((suggestion) => (
            <Pressable
              accessibilityLabel={`${suggestion.name}. ${suggestion.address || suggestion.fullText}`}
              accessibilityRole="button"
              accessibilityState={{ busy: selecting }}
              disabled={selecting}
              key={suggestion.providerPlaceId}
              onPress={() => void selectSuggestion(suggestion)}
              style={({ pressed }) => [styles.result, pressed && styles.pressed]}
            >
              <View style={styles.resultIcon}><Ionicons color={colors.primary} name="location-outline" size={20} /></View>
              <View style={styles.resultCopy}>
                <Text numberOfLines={1} style={styles.resultName}>{suggestion.name}</Text>
                <Text numberOfLines={2} style={styles.resultAddress}>{suggestion.address || suggestion.fullText}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
      {selectedPlace ? (
        <View accessibilityLiveRegion="polite" style={styles.selected}>
          <Ionicons color={colors.success} name="checkmark-circle" size={22} />
          <View style={styles.selectedCopy}>
            <Text style={styles.selectedTitle}>Place matched</Text>
            <Text style={styles.selectedMeta}>{selectedPlace.rating ? `★ ${selectedPlace.rating} · ` : ''}{selectedPlace.address}</Text>
          </View>
        </View>
      ) : null}
      <AppInput label="Address" onChangeText={setAddress} placeholder="Optional for manual stops" value={address} />
      <ResponsiveFieldRow>
        <AppInput keyboardType="numbers-and-punctuation" label="Arrive" onChangeText={setArrivalTime} placeholder="10:00" value={arrivalTime} />
        <AppInput keyboardType="numbers-and-punctuation" label="Leave" onChangeText={setDepartureTime} placeholder="11:00" value={departureTime} />
      </ResponsiveFieldRow>
      <AppInput label="Note" maxLength={500} multiline onChangeText={setNote} placeholder="Tickets, reservation, what to order…" value={note} />
      <AppButton label="Add to itinerary" loading={submitting} onPress={() => void submit()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.7 },
  result: { alignItems: 'center', flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  resultAddress: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 17 },
  resultCopy: { flex: 1, gap: 2 },
  resultIcon: { alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radius.sm, height: 38, justifyContent: 'center', width: 38 },
  resultName: { color: colors.text, fontSize: typography.small, fontWeight: '800' },
  results: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md, borderWidth: 1, overflow: 'hidden', ...shadows },
  searchError: { color: colors.warningText, fontSize: typography.small, lineHeight: 20 },
  selected: { alignItems: 'center', backgroundColor: colors.successSoft, borderRadius: radius.md, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  selectedCopy: { flex: 1, gap: 2 },
  selectedMeta: { color: colors.textMuted, fontSize: typography.caption },
  selectedTitle: { color: colors.successText, fontSize: typography.small, fontWeight: '800' },
});
