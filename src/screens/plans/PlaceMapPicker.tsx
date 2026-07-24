import { Ionicons } from '@expo/vector-icons';
import {
  Camera,
  type CameraRef,
  Map,
  Marker,
  type MapProps,
} from '@maplibre/maplibre-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLanguage } from '../../context/LanguageContext';
import { useAppTheme } from '../../context/ThemeContext';
import {
  radius,
  spacing,
  stickerPalette,
  typography,
  type ThemeColors,
} from '../../theme/tokens';
import type { PlaceDetails, RouteCoordinate } from '../../types/api';

export type MapViewport = {
  latitude: number;
  longitude: number;
  zoom: number;
};

type Props = {
  nearbyPlaces: PlaceDetails[];
  onSelectCoordinate: (coordinate: RouteCoordinate) => void;
  onSelectPlace: (place: PlaceDetails) => void;
  onViewportChange: (viewport: MapViewport) => void;
  selectedCoordinate: RouteCoordinate | null;
};

const worldViewport: MapViewport = {
  latitude: 20,
  longitude: 0,
  zoom: 1.4,
};

const mapStyles = {
  dark: 'https://tiles.openfreemap.org/styles/dark',
  light: 'https://tiles.openfreemap.org/styles/positron',
} as const;

function isCoordinate(value: PlaceDetails): value is PlaceDetails & RouteCoordinate {
  return value.latitude !== null && value.longitude !== null;
}

export function PlaceMapPicker({
  nearbyPlaces,
  onSelectCoordinate,
  onSelectPlace,
  onViewportChange,
  selectedCoordinate,
}: Props) {
  const cameraRef = useRef<CameraRef>(null);
  const { colors, resolvedScheme } = useAppTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [mapFailed, setMapFailed] = useState(false);
  const placesWithCoordinates = nearbyPlaces.filter(isCoordinate);

  useEffect(() => {
    if (!selectedCoordinate) return;
    cameraRef.current?.easeTo({
      center: [selectedCoordinate.longitude, selectedCoordinate.latitude],
      duration: 420,
      zoom: 14,
    });
  }, [selectedCoordinate]);

  const selectMapPoint: NonNullable<MapProps['onPress']> = (event) => {
    const [longitude, latitude] = event.nativeEvent.lngLat;
    onSelectCoordinate({ latitude, longitude });
  };

  const emitViewport: NonNullable<MapProps['onRegionDidChange']> = (event) => {
    const [longitude, latitude] = event.nativeEvent.center;
    onViewportChange({ latitude, longitude, zoom: event.nativeEvent.zoom });
  };

  function showWorld() {
    cameraRef.current?.easeTo({
      center: [worldViewport.longitude, worldViewport.latitude],
      duration: 520,
      zoom: worldViewport.zoom,
    });
  }

  return (
    <View style={styles.shell}>
      <Map
        accessibilityLabel={t('map.label')}
        attribution
        attributionPosition={{ bottom: 8, left: 8 }}
        compass
        compassPosition={{ top: 64, right: 12 }}
        key={resolvedScheme}
        mapStyle={mapStyles[resolvedScheme]}
        onDidFailLoadingMap={() => setMapFailed(true)}
        onDidFinishLoadingMap={() => setMapFailed(false)}
        onPress={selectMapPoint}
        onRegionDidChange={emitViewport}
        scaleBar={false}
        style={StyleSheet.absoluteFill}
      >
        <Camera
          initialViewState={{
            center: selectedCoordinate
              ? [selectedCoordinate.longitude, selectedCoordinate.latitude]
              : [worldViewport.longitude, worldViewport.latitude],
            zoom: selectedCoordinate ? 14 : worldViewport.zoom,
          }}
          maxZoom={19}
          minZoom={1}
          ref={cameraRef}
        />

        {placesWithCoordinates.map((place) => (
          <Marker
            accessibilityLabel={`${place.name ?? t('map.nearbyPlace')}. ${place.address ?? t('map.openPlace')}`}
            accessibilityRole="button"
            anchor="bottom"
            id={place.providerPlaceId ?? `${place.latitude},${place.longitude}`}
            key={place.providerPlaceId ?? `${place.latitude},${place.longitude}`}
            lngLat={[place.longitude, place.latitude]}
            onPress={(event) => {
              event.stopPropagation();
              onSelectPlace(place);
            }}
          >
            <View style={styles.nearbyMarker}>
              <Ionicons color={colors.onSticker} name="sparkles" size={14} />
            </View>
          </Marker>
        ))}

        {selectedCoordinate ? (
          <Marker
            accessibilityLabel={t('map.selectedPin')}
            anchor="bottom"
            id="selected-stop"
            lngLat={[selectedCoordinate.longitude, selectedCoordinate.latitude]}
          >
            <View style={styles.selectedMarkerWrap}>
              <View style={styles.selectedMarkerLabel}>
                <Text numberOfLines={1} style={styles.selectedMarkerText}>{t('map.yourStop')}</Text>
              </View>
              <View style={styles.selectedMarker}>
                <Ionicons color={colors.onSticker} name="location" size={24} />
              </View>
            </View>
          </Marker>
        ) : null}
      </Map>

      <View pointerEvents="none" style={styles.mapBadge}>
        <View style={styles.mapBadgeIcon}>
          <Ionicons color={colors.onSticker} name="finger-print-outline" size={16} />
        </View>
        <View>
          <Text style={styles.mapBadgeTitle}>{t('map.tapToPin')}</Text>
          <Text style={styles.mapBadgeText}>{t('map.dragToRoam')}</Text>
        </View>
      </View>

      {mapFailed ? (
        <View accessibilityLiveRegion="polite" style={styles.failureCard}>
          <Ionicons color={stickerPalette.coral} name="cloud-offline-outline" size={24} />
          <View style={styles.failureCopy}>
            <Text style={styles.failureTitle}>{t('map.failureTitle')}</Text>
            <Text style={styles.failureText}>{t('map.failureText')}</Text>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityLabel={t('map.showWorld')}
        accessibilityRole="button"
        onPress={showWorld}
        style={({ pressed }) => [styles.worldButton, pressed && styles.pressed]}
      >
        <Ionicons color={colors.text} name="earth-outline" size={20} />
      </Pressable>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    failureCard: {
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.danger,
      borderRadius: radius.md,
      borderWidth: 1,
      bottom: spacing.md,
      flexDirection: 'row',
      gap: spacing.sm,
      left: spacing.md,
      padding: spacing.md,
      position: 'absolute',
      right: 72,
    },
    failureCopy: { flex: 1, gap: 2 },
    failureText: { color: colors.textMuted, fontSize: typography.caption, lineHeight: 17 },
    failureTitle: { color: colors.text, fontSize: typography.small, fontWeight: '900' },
    mapBadge: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.primaryDark,
      borderColor: stickerPalette.violet,
      borderRadius: radius.pill,
      borderWidth: 1,
      flexDirection: 'row',
      gap: spacing.sm,
      left: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 7,
      position: 'absolute',
      top: spacing.md,
    },
    mapBadgeIcon: {
      alignItems: 'center',
      backgroundColor: stickerPalette.green,
      borderRadius: radius.pill,
      height: 28,
      justifyContent: 'center',
      width: 28,
    },
    mapBadgeText: { color: colors.heroTextMuted, fontSize: 10, fontWeight: '700' },
    mapBadgeTitle: { color: colors.heroText, fontSize: typography.caption, fontWeight: '900', letterSpacing: 0.7 },
    nearbyMarker: {
      alignItems: 'center',
      backgroundColor: stickerPalette.green,
      borderColor: colors.primaryDark,
      borderRadius: radius.pill,
      borderWidth: 2,
      height: 34,
      justifyContent: 'center',
      width: 34,
    },
    pressed: { opacity: 0.72, transform: [{ scale: 0.95 }] },
    selectedMarker: {
      alignItems: 'center',
      backgroundColor: stickerPalette.coral,
      borderColor: colors.white,
      borderRadius: radius.pill,
      borderWidth: 2,
      height: 48,
      justifyContent: 'center',
      width: 48,
    },
    selectedMarkerLabel: {
      backgroundColor: colors.primaryDark,
      borderColor: stickerPalette.violet,
      borderRadius: radius.pill,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    selectedMarkerText: { color: colors.heroText, fontSize: 9, fontWeight: '900', letterSpacing: 0.8 },
    selectedMarkerWrap: { alignItems: 'center', gap: 3 },
    shell: {
      backgroundColor: colors.primaryDark,
      borderColor: stickerPalette.violet,
      borderRadius: radius.xl,
      borderWidth: 1,
      height: 420,
      overflow: 'hidden',
      position: 'relative',
    },
    worldButton: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: stickerPalette.violet,
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
