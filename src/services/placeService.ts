import type { PlaceDetails, PlaceProvider, PlaceSuggestion } from '../types/api';
import { queryString, request } from './apiClient';

export const placeService = {
  autocomplete(query: string, sessionToken: string) {
    return request<PlaceSuggestion[]>(
      `/api/v1/places/autocomplete${queryString({ query, limit: 8, sessionToken })}`,
    );
  },
  details(provider: PlaceProvider, providerPlaceId: string) {
    return request<PlaceDetails>(
      `/api/v1/places/details${queryString({ provider, providerPlaceId })}`,
    );
  },
  nearby(latitude: number, longitude: number) {
    return request<PlaceDetails[]>(
      `/api/v1/places/nearby${queryString({
        lat: latitude,
        limit: 8,
        lng: longitude,
        radiusMeters: 5000,
      })}`,
    );
  },
};
