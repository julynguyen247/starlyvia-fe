import type { PlaceDetails, PlaceSuggestion } from '../types/api';
import { queryString, request } from './apiClient';

export const placeService = {
  autocomplete(query: string, sessionToken: string) {
    return request<PlaceSuggestion[]>(
      `/api/v1/places/autocomplete${queryString({ query, limit: 8, sessionToken })}`,
    );
  },
  details(providerPlaceId: string) {
    return request<PlaceDetails>(
      `/api/v1/places/details${queryString({ provider: 'GOOGLE', providerPlaceId })}`,
    );
  },
};
