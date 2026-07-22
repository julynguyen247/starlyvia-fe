import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, type MapPressEvent, type Region } from 'react-native-maps';

import { useAppTheme } from '../../context/ThemeContext';
import { radius, spacing, typography, type ThemeColors } from '../../theme/tokens';
import type { PlaceDetails, RouteCoordinate } from '../../types/api';

type Props = {
  nearbyPlaces: PlaceDetails[];
  onRegionChange: (region: Region) => void;
  onSelectCoordinate: (coordinate: RouteCoordinate) => void;
  onSelectPlace: (place: PlaceDetails) => void;
  selectedCoordinate: RouteCoordinate | null;
};

const worldRegion: Region = {
  latitude: 20,
  latitudeDelta: 105,
  longitude: 0,
  longitudeDelta: 105,
};

function isCoordinate(value: PlaceDetails): value is PlaceDetails & RouteCoordinate {
  return value.latitude !== null && value.longitude !== null;
}

export function PlaceMapPicker({
  nearbyPlaces,
  onRegionChange,
  onSelectCoordinate,
  onSelectPlace,
  selectedCoordinate,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const { colors, resolvedScheme } = useAppTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const placesWithCoordinates = nearbyPlaces.filter(isCoordinate);

  useEffect(() => {
    if (!selectedCoordinate) return;
    mapRef.current?.animateToRegion({
      ...selectedCoordinate,
      latitudeDelta: 0.035,
      longitudeDelta: 0.035,
    }, 280);
  }, [selectedCoordinate]);

  function selectMapPoint(event: MapPressEvent) {
    if (event.nativeEvent.action === 'marker-press') return;
    onSelectCoordinate(event.nativeEvent.coordinate);
  }

  return (
    <View style={styles.shell}>
      <MapView
        accessibilityLabel="Interactive place map. Double tap and drag to move, or tap once to drop a pin."
        initialRegion={selectedCoordinate ? {
          ...selectedCoordinate,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        } : worldRegion}
        loadingBackgroundColor={colors.surfaceMuted}
        loadingEnabled
        loadingIndicatorColor={colors.primary}
        mapPadding={{ bottom: 16, left: 8, right: 8, top: 48 }}
        onPress={selectMapPoint}
        onRegionChangeComplete={onRegionChange}
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        toolbarEnabled={false}
        userInterfaceStyle={resolvedScheme}
      >
        {placesWithCoordinates.map((place) => (
          <Marker
            coordinate={{ latitude: place.latitude, longitude: place.longitude }}
            key={place.providerPlaceId ?? `${place.latitude},${place.longitude}`}
            onPress={(event) => {
              event.stopPropagation();
              onSelectPlace(place);
            }}
            pinColor={colors.accent}
            title={place.name ?? 'Nearby place'}
            description={place.address ?? undefined}
          />
        ))}
        {selectedCoordinate ? (
          <Marker coordinate={selectedCoordinate} pinColor={colors.primary} title="Your selected stop" />
        ) : null}
      </MapView>

      <View pointerEvents="none" style={styles.hint}>
        <Ionicons color={colors.onPrimary} name="finger-print-outline" size={17} />
        <Text style={styles.hintText}>Tap the map to pin a stop</Text>
      </View>

      <Pressable
        accessibilityLabel="Zoom out to see the world"
        accessibilityRole="button"
        onPress={() => mapRef.current?.animateToRegion(worldRegion, 300)}
        style={({ pressed }) => [styles.worldButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text} name="earth-outline" size={20} />
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    hint: {
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: colors.primary,
      borderColor: colors.primaryDark,
      borderRadius: radius.pill,
      borderWidth: 2,
      flexDirection: 'row',
      gap: spacing.xs,
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    hintText: { color: colors.onPrimary, fontSize: typography.caption, fontWeight: '900' },
    pressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
    shell: {
      backgroundColor: colors.surfaceMuted,
      borderColor: colors.border,
      borderRadius: radius.lg,
      borderWidth: 2,
      height: 360,
      overflow: 'hidden',
      position: 'relative',
    },
    worldButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.pill,
      borderWidth: 1,
      bottom: spacing.md,
      height: 46,
      justifyContent: 'center',
      position: 'absolute',
      right: spacing.md,
      width: 46,
    },
  });
}
